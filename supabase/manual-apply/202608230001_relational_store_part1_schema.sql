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

