-- Fix: create_order() treated 'reserved' (and 'out_of_stock'/'sold') as
-- purchasable statuses, mirroring the storefront *visibility* list instead
-- of an actual purchasability check. In practice this let a second
-- customer buy a one-of-a-kind stone an admin had deliberately marked
-- "Reserved" to hold for someone else's in-progress order. The inventory
-- quantity check a few lines below already protects sold/out_of_stock items
-- whose stock has genuinely hit zero, so this only needed to add an
-- explicit status check requiring 'published' -- everything else (reserved,
-- sold, out_of_stock, archived, trash, draft, scheduled) is rejected.
create or replace function public.create_order(
  p_order_id text,
  p_submission_token text,
  p_payment_method text,
  p_customer jsonb,
  p_cart_lines jsonb
) returns jsonb
language plpgsql
as $$
declare
  v_existing jsonb;
  v_day_key text;
  v_seq integer;
  v_order_number text;
  v_now timestamptz := now();
  v_line jsonb;
  v_product_id text;
  v_product_data jsonb;
  v_requested_qty integer;
  v_qty_by_product jsonb;
  v_subtotal numeric(12,2) := 0;
  v_unit_price numeric(12,2);
  v_items jsonb := '[]'::jsonb;
  v_next_status text;
  v_payment_status text;
begin
  if p_submission_token is not null then
    select to_jsonb(o) into v_existing from public.orders_with_items o where o.submission_token = p_submission_token;
    if v_existing is not null then
      return jsonb_build_object(
        'id', v_existing->>'id', 'orderNumber', v_existing->>'order_number', 'submissionToken', v_existing->>'submission_token',
        'status', v_existing->>'status', 'paymentStatus', v_existing->>'payment_status', 'paymentMethod', v_existing->>'payment_method',
        'currency', v_existing->>'currency', 'subtotal', (v_existing->>'subtotal')::numeric, 'shipping', (v_existing->>'shipping')::numeric,
        'discount', (v_existing->>'discount')::numeric, 'total', (v_existing->>'total')::numeric,
        'items', v_existing->'items', 'customer', v_existing->'customer',
        'createdAt', v_existing->>'created_at', 'updatedAt', v_existing->>'updated_at'
      );
    end if;
  end if;

  select jsonb_object_agg(product_id, qty) into v_qty_by_product
    from (
      select (line->>'productId') as product_id, sum((line->>'quantity')::int) as qty
        from jsonb_array_elements(p_cart_lines) as line
       group by 1
    ) grouped;

  for v_line in select * from jsonb_array_elements(p_cart_lines)
  loop
    v_product_id := v_line->>'productId';

    select data into v_product_data from public.products where id = v_product_id for update;

    if v_product_data is null then
      raise exception 'A product in your cart is no longer available.';
    end if;

    if (v_product_data->>'visibility') = 'hidden'
       or (v_product_data->>'status') <> 'published'
       or coalesce((v_product_data->>'allowCartPurchase')::boolean, true) = false then
      raise exception '% is not currently available for checkout.', (v_product_data->>'name');
    end if;

    v_requested_qty := (v_qty_by_product->>v_product_id)::int;

    if coalesce((v_product_data->>'oneOfOne')::boolean, false) and v_requested_qty > 1 then
      raise exception '% is a one-of-one piece and can only be ordered once.', (v_product_data->>'name');
    end if;

    if coalesce((v_product_data->>'inventoryQuantity')::int, 0) < v_requested_qty then
      raise exception 'Only % unit(s) of % remain in stock.', coalesce((v_product_data->>'inventoryQuantity')::int, 0), (v_product_data->>'name');
    end if;

    if jsonb_array_length(coalesce(v_product_data->'sizes', '[]'::jsonb)) > 0 and coalesce(v_line->>'selectedSize', '') = '' then
      raise exception 'Please select a size for %.', (v_product_data->>'name');
    end if;

    if coalesce(v_line->>'selectedSize', '') <> ''
       and jsonb_array_length(coalesce(v_product_data->'sizes', '[]'::jsonb)) > 0
       and not (v_product_data->'sizes' @> to_jsonb(v_line->>'selectedSize')) then
      raise exception 'The selected size for % is unavailable.', (v_product_data->>'name');
    end if;

    if jsonb_array_length(coalesce(v_product_data->'variants', '[]'::jsonb)) > 0 and coalesce(v_line->>'selectedVariant', '') = '' then
      raise exception 'Please select a % for %.', lower(coalesce(v_product_data->>'variantLabel', 'variant')), (v_product_data->>'name');
    end if;

    if coalesce(v_line->>'selectedVariant', '') <> ''
       and jsonb_array_length(coalesce(v_product_data->'variants', '[]'::jsonb)) > 0
       and not exists (
         select 1 from jsonb_array_elements(v_product_data->'variants') vv
          where coalesce((vv->>'active')::boolean, true) and (vv->>'value') = (v_line->>'selectedVariant')
       ) then
      raise exception 'The selected % for % is unavailable.', lower(coalesce(v_product_data->>'variantLabel', 'variant')), (v_product_data->>'name');
    end if;

    v_unit_price := case
      when (v_product_data->>'salePrice') is not null
        and (v_product_data->>'salePrice')::numeric > 0
        and (v_product_data->>'salePrice')::numeric < (v_product_data->>'price')::numeric
      then (v_product_data->>'salePrice')::numeric
      else coalesce((v_product_data->>'price')::numeric, 0)
    end;

    v_subtotal := v_subtotal + v_unit_price * (v_line->>'quantity')::int;

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', 'item-' || gen_random_uuid(),
      'productId', v_product_id,
      'productName', v_product_data->>'name',
      'productSlug', v_product_data->>'slug',
      'sku', v_product_data->>'sku',
      'image', v_product_data->>'featuredImage',
      'quantity', (v_line->>'quantity')::int,
      'unitPrice', v_unit_price,
      'selectedSize', nullif(v_line->>'selectedSize', ''),
      'selectedVariant', nullif(v_line->>'selectedVariant', '')
    ));

    v_next_status := case
      when coalesce((v_product_data->>'inventoryQuantity')::int, 0) - (v_line->>'quantity')::int <= 0 then 'out_of_stock'
      else (v_product_data->>'status')
    end;

    update public.products
       set data = jsonb_set(
                     jsonb_set(
                       data,
                       '{inventoryQuantity}',
                       to_jsonb(greatest(0, coalesce((data->>'inventoryQuantity')::int, 0) - (v_line->>'quantity')::int))
                     ),
                     '{status}',
                     to_jsonb(v_next_status)
                   ),
           updated_at = v_now
     where id = v_product_id;
  end loop;

  v_day_key := to_char(v_now at time zone 'utc', 'YYYYMMDD');
  insert into public.order_number_counters (day_key, count)
       values (v_day_key, 1)
  on conflict (day_key) do update set count = public.order_number_counters.count + 1
  returning count into v_seq;
  v_order_number := 'STZ-' || v_day_key || '-' || lpad(v_seq::text, 3, '0');

  v_payment_status := case when position('cash' in lower(p_payment_method)) > 0 then 'cod' else 'pending' end;

  insert into public.orders (
    id, order_number, submission_token, status, payment_status, payment_method,
    currency, subtotal, shipping, discount, total, customer, created_at, updated_at
  ) values (
    p_order_id, v_order_number, p_submission_token, 'pending', v_payment_status,
    p_payment_method, 'PKR', v_subtotal, 0, 0, v_subtotal, p_customer, v_now, v_now
  );

  insert into public.order_items (id, order_id, product_id, product_name, product_slug, sku, image, quantity, unit_price, selected_size, selected_variant)
  select item->>'id', p_order_id, item->>'productId', item->>'productName', item->>'productSlug',
         item->>'sku', item->>'image', (item->>'quantity')::int, (item->>'unitPrice')::numeric,
         item->>'selectedSize', item->>'selectedVariant'
    from jsonb_array_elements(v_items) as item;

  insert into public.activity_logs (id, data, created_at)
  values (
    'log-' || gen_random_uuid(),
    jsonb_build_object(
      'id', 'log-' || gen_random_uuid(), 'action', 'order_created', 'actor', p_customer->>'email',
      'entity', 'order', 'entityId', p_order_id, 'detail', v_order_number, 'timestamp', to_char(v_now, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    ),
    v_now
  );

  return jsonb_build_object(
    'id', p_order_id, 'orderNumber', v_order_number, 'submissionToken', p_submission_token,
    'status', 'pending', 'paymentStatus', v_payment_status, 'paymentMethod', p_payment_method,
    'currency', 'PKR', 'subtotal', v_subtotal, 'shipping', 0, 'discount', 0, 'total', v_subtotal,
    'items', v_items, 'customer', p_customer,
    'createdAt', to_char(v_now, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'updatedAt', to_char(v_now, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
end;
$$;
