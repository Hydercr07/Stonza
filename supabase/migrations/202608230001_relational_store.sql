-- STONZA: replace the whole-site JSON-blob store with real per-entity tables.
--
-- Why: the app previously kept its entire catalogue, content, and order
-- history as ONE JSON file uploaded whole to Supabase Storage on every save.
-- That has no transactions and no row locking, so two concurrent writes
-- (e.g. two customers checking out at the same moment, or a customer
-- checking out while an admin edits a product) can silently overwrite each
-- other -- losing an order, or overselling inventory that was already sold.
--
-- This migration is intentionally a hybrid, not a fully normalized schema:
-- most content (categories, products, pages, ...) gets a real row per item
-- with a `data jsonb` payload holding the full record, plus generated
-- columns for whatever needs a uniqueness constraint or an index (slug,
-- sku, status). That keeps every field the application already reads/writes
-- working unchanged, while gaining real per-row constraints and -- critically
-- -- confining each write to the one row/table it actually touches instead
-- of the entire site.
--
-- Orders are the one place true relational modelling matters (real
-- money, real stock), so `orders`/`order_items` are fully columnar and all
-- writes go through `public.create_order` / `public.update_order_status`,
-- which lock the referenced product rows and run as a single transaction --
-- closing the overselling/lost-order race completely.
--
-- The tables this replaces (public.products, public.orders, ...) were
-- defined in 202607180001_initial.sql but never actually used by the
-- application (it always wrote to the JSON blob instead) -- only a handful
-- of stray seed rows exist in them. profiles/roles/permissions/
-- role_permissions/user_roles are left untouched for a future move to
-- Supabase Auth.

drop view if exists public.orders_with_items;

drop table if exists public.wishlist_items cascade;
drop table if exists public.wishlists cascade;
drop table if exists public.enquiries cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.order_number_counters cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.carts cascade;
drop table if exists public.addresses cascade;
drop table if exists public.customers cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.footer_sections cascade;
drop table if exists public.navigation_items cascade;
drop table if exists public.navigation_menus cascade;
drop table if exists public.journal_posts cascade;
drop table if exists public.pages cascade;
drop table if exists public.homepage_sections cascade;
drop table if exists public.hero_settings cascade;
drop table if exists public.media_assets cascade;
drop table if exists public.certificates cascade;
drop table if exists public.inventory_events cascade;
drop table if exists public.product_tags cascade;
drop table if exists public.product_collections cascade;
drop table if exists public.product_categories cascade;
drop table if exists public.product_models cascade;
drop table if exists public.product_media cascade;
drop table if exists public.products cascade;
drop table if exists public.tags cascade;
drop table if exists public.collections cascade;
drop table if exists public.categories cascade;
drop table if exists public.homepage_banners cascade;
drop table if exists public.content_labels cascade;

drop type if exists public.order_status cascade;
drop type if exists public.page_status cascade;
drop type if exists public.product_status cascade;
drop type if exists public.hero_mode cascade;
drop type if exists public.media_type cascade;

-- ---------------------------------------------------------------------------
-- Catalogue & content: one row per item, jsonb payload + generated indexes.
-- ---------------------------------------------------------------------------

create table public.categories (
  id text primary key,
  slug text generated always as (data->>'slug') stored,
  status text generated always as (data->>'status') stored,
  parent_category_slug text generated always as (data->>'parentCategorySlug') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index categories_slug_key on public.categories (slug) where slug is not null;
create index categories_status_idx on public.categories (status);
create index categories_parent_idx on public.categories (parent_category_slug);

create table public.collections (
  id text primary key,
  slug text generated always as (data->>'slug') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index collections_slug_key on public.collections (slug) where slug is not null;

create table public.products (
  id text primary key,
  slug text generated always as (data->>'slug') stored,
  sku text generated always as (data->>'sku') stored,
  status text generated always as (data->>'status') stored,
  category_slug text generated always as (data->>'categorySlug') stored,
  collection_slug text generated always as (data->>'collectionSlug') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index products_slug_key on public.products (slug) where slug is not null;
create unique index products_sku_key on public.products (sku) where sku is not null;
create index products_status_idx on public.products (status);
create index products_category_idx on public.products (category_slug);
create index products_collection_idx on public.products (collection_slug);

create table public.pages (
  id text primary key,
  slug text generated always as (data->>'slug') stored,
  status text generated always as (data->>'status') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index pages_slug_key on public.pages (slug) where slug is not null;

create table public.journal_posts (
  id text primary key,
  slug text generated always as (data->>'slug') stored,
  status text generated always as (data->>'status') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index journal_posts_slug_key on public.journal_posts (slug) where slug is not null;

create table public.media_assets (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.homepage_banners (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.homepage_sections (
  id text primary key,
  key text generated always as (data->>'key') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index homepage_sections_key_key on public.homepage_sections (key) where key is not null;

create table public.content_labels (
  id text primary key,
  key text generated always as (data->>'key') stored,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index content_labels_key_key on public.content_labels (key) where key is not null;

create table public.activity_logs (
  id text primary key,
  data jsonb not null,
  -- Real column (not derived from data->>'timestamp'), set once at insert
  -- time -- used for ordering instead, since a generated column can't use a
  -- text::timestamptz cast (Postgres rejects it: that cast depends on the
  -- session's TimeZone setting, so it isn't IMMUTABLE).
  created_at timestamptz not null default now()
);
create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

-- Singleton config rows: one nested config object each, no per-item concerns.
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.hero_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders: fully relational -- this is the flow that actually needs
-- transactions and row locking, so it gets real columns and a dedicated
-- atomic function rather than the generic jsonb-row pattern above.
-- ---------------------------------------------------------------------------

create table public.orders (
  id text primary key,
  order_number text not null unique,
  submission_token text unique,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  payment_method text not null,
  currency text not null default 'PKR',
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_at_idx on public.orders (created_at desc);

create table public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_slug text not null,
  sku text,
  image text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  selected_size text,
  selected_variant text
);
create index order_items_order_id_idx on public.order_items (order_id);

-- Per-UTC-day sequence for human order numbers (STZ-YYYYMMDD-001, ...),
-- allocated atomically via upsert so two simultaneous checkouts can never
-- be handed the same order number.
create table public.order_number_counters (
  day_key text primary key,
  count integer not null default 0
);

create view public.orders_with_items as
select
  o.id,
  o.order_number,
  o.submission_token,
  o.status,
  o.payment_status,
  o.payment_method,
  o.currency,
  o.subtotal,
  o.shipping,
  o.discount,
  o.total,
  o.customer,
  o.created_at,
  o.updated_at,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', oi.id,
      'productId', oi.product_id,
      'productName', oi.product_name,
      'productSlug', oi.product_slug,
      'sku', oi.sku,
      'image', oi.image,
      'quantity', oi.quantity,
      'unitPrice', oi.unit_price,
      'selectedSize', oi.selected_size,
      'selectedVariant', oi.selected_variant
    ) order by oi.id)
    from public.order_items oi
    where oi.order_id = o.id
  ), '[]'::jsonb) as items
from public.orders o;

-- ---------------------------------------------------------------------------
-- create_order: validates a cart, locks every referenced product row,
-- decrements stock, and inserts the order + items -- all in one transaction.
-- Mirrors the validation that used to live in src/lib/data/store.ts so
-- customer-facing error messages are unchanged.
-- ---------------------------------------------------------------------------

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
       or (v_product_data->>'status') not in ('published', 'reserved', 'out_of_stock', 'sold')
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

-- ---------------------------------------------------------------------------
-- RLS: the application talks to every one of these tables through the
-- service-role key from trusted server-only code (src/lib/data/store.ts),
-- which bypasses RLS entirely, so these policies are defense-in-depth for
-- the day an anon-key client query is added, not load-bearing today.
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.pages enable row level security;
alter table public.journal_posts enable row level security;
alter table public.media_assets enable row level security;
alter table public.homepage_banners enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.content_labels enable row level security;
alter table public.activity_logs enable row level security;
alter table public.site_settings enable row level security;
alter table public.hero_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_number_counters enable row level security;

create policy "Public can read published categories" on public.categories for select
  using (status = 'published');
create policy "Public can read collections" on public.collections for select using (true);
create policy "Public can read published products" on public.products for select
  using (status in ('published', 'reserved', 'out_of_stock', 'sold'));
create policy "Public can read published pages" on public.pages for select using (status = 'published');
create policy "Public can read published journal posts" on public.journal_posts for select using (status = 'published');
create policy "Public can read media" on public.media_assets for select using (true);
create policy "Public can read homepage banners" on public.homepage_banners for select using (true);
create policy "Public can read homepage sections" on public.homepage_sections for select using (true);
create policy "Public can read content labels" on public.content_labels for select using (true);
create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Public can read hero settings" on public.hero_settings for select using (true);

create policy "Service role manages categories" on public.categories for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages collections" on public.collections for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages products" on public.products for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages pages" on public.pages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages journal posts" on public.journal_posts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages media" on public.media_assets for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages homepage banners" on public.homepage_banners for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages homepage sections" on public.homepage_sections for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages content labels" on public.content_labels for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages activity logs" on public.activity_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages site settings" on public.site_settings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages hero settings" on public.hero_settings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages orders" on public.orders for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages order items" on public.order_items for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages order counters" on public.order_number_counters for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant execute on function public.create_order(text, text, text, jsonb, jsonb) to service_role;
grant execute on function public.update_order_status(text, text) to service_role;
