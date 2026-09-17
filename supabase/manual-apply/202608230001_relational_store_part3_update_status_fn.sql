-- ---------------------------------------------------------------------------
-- update_order_status: locks the order (and, on cancellation, every product
-- it referenced) before restocking + changing status, in one transaction.
-- ---------------------------------------------------------------------------

create or replace function public.update_order_status(
  p_order_number text,
  p_status text
) returns jsonb
language plpgsql
as $$
declare
  v_order_id text;
  v_previous_status text;
  v_now timestamptz := now();
  v_item record;
  v_result jsonb;
begin
  select id, status into v_order_id, v_previous_status from public.orders where order_number = p_order_number for update;

  if v_order_id is null then
    raise exception 'Order not found';
  end if;

  if p_status = 'cancelled' and v_previous_status <> 'cancelled' then
    for v_item in select product_id, quantity from public.order_items where order_id = v_order_id
    loop
      update public.products
         set data = jsonb_set(
                       jsonb_set(
                         data,
                         '{inventoryQuantity}',
                         to_jsonb(coalesce((data->>'inventoryQuantity')::int, 0) + v_item.quantity)
                       ),
                       '{status}',
                       case
                         when (data->>'status') in ('out_of_stock', 'sold')
                              and coalesce((data->>'inventoryQuantity')::int, 0) + v_item.quantity > 0
                         then to_jsonb('published'::text)
                         else data->'status'
                       end
                     ),
             updated_at = v_now
       where id = v_item.product_id;
    end loop;
  end if;

  update public.orders set status = p_status, updated_at = v_now where id = v_order_id;

  select to_jsonb(o) into v_result from public.orders_with_items o where o.id = v_order_id;

  return jsonb_build_object(
    'id', v_result->>'id', 'orderNumber', v_result->>'order_number', 'submissionToken', v_result->>'submission_token',
    'status', v_result->>'status', 'paymentStatus', v_result->>'payment_status', 'paymentMethod', v_result->>'payment_method',
    'currency', v_result->>'currency', 'subtotal', (v_result->>'subtotal')::numeric, 'shipping', (v_result->>'shipping')::numeric,
    'discount', (v_result->>'discount')::numeric, 'total', (v_result->>'total')::numeric,
    'items', v_result->'items', 'customer', v_result->'customer',
    'createdAt', v_result->>'created_at', 'updatedAt', v_result->>'updated_at'
  );
end;
$$;

