-- STONZA initial schema
create extension if not exists "pgcrypto";

create type public.admin_role as enum (
  'owner',
  'administrator',
  'product_manager',
  'content_editor',
  'order_manager',
  'inventory_manager'
);

create type public.product_status as enum (
  'draft',
  'published',
  'scheduled',
  'reserved',
  'out_of_stock',
  'sold',
  'archived',
  'trash'
);

create type public.page_status as enum ('draft', 'published');
create type public.order_status as enum ('new', 'pending_confirmation', 'confirmed', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.media_type as enum ('image', 'video', 'document', 'model', 'brand');
create type public.hero_mode as enum ('image', 'video', 'interactive-3d', 'hybrid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key public.admin_role unique not null,
  label text not null
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  unique (role_id, permission_id)
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  featured_image text,
  hero_media text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  featured_image text,
  hero_media text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sku text unique not null,
  short_description text,
  description text,
  price numeric(12,2) not null default 0,
  sale_price numeric(12,2),
  currency text not null default 'USD',
  cost_price numeric(12,2),
  inventory_quantity integer not null default 0,
  low_stock_threshold integer not null default 1,
  one_of_one boolean not null default false,
  allow_enquiry boolean not null default true,
  allow_cart_purchase boolean not null default true,
  stone_type text,
  category_id uuid references public.categories(id),
  collection_id uuid references public.collections(id),
  weight text,
  carat numeric(12,2),
  dimensions text,
  shape text,
  cut text,
  color text,
  clarity text,
  origin text,
  natural_or_treated text,
  treatment_details text,
  featured_image text,
  product_video text,
  video_360 text,
  model_3d text,
  spline_url text,
  alt_text text,
  featured boolean not null default false,
  new_arrival boolean not null default false,
  bestseller boolean not null default false,
  seo_title text,
  seo_description text,
  canonical_override text,
  open_graph_image text,
  private_notes text,
  status public.product_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_models (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  model_url text not null,
  spline_url text,
  created_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  unique (product_id, category_id)
);

create table public.product_collections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  unique (product_id, collection_id)
);

create table public.product_tags (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  unique (product_id, tag_id)
);

create table public.inventory_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_change integer not null,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  authority text,
  certificate_number text,
  certificate_image text,
  certificate_pdf text,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  public_url text not null,
  original_filename text not null,
  mime_type text not null,
  file_size bigint not null default 0,
  width integer,
  height integer,
  alt_text text,
  caption text,
  media_type public.media_type not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.hero_settings (
  id uuid primary key default gen_random_uuid(),
  mode public.hero_mode not null default 'interactive-3d',
  desktop_banner_image text,
  mobile_banner_image text,
  desktop_background_video text,
  mobile_background_video text,
  video_poster text,
  model_3d text,
  spline_url text,
  eyebrow text,
  heading text,
  subheading text,
  description text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  overlay_opacity numeric(4,2) default 0.40,
  status public.page_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  heading text,
  body text,
  layout text,
  background text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  cta_label text,
  cta_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  hero_heading text,
  hero_media text,
  content text,
  status public.page_status not null default 'draft',
  seo_title text,
  seo_description text,
  open_graph_image text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  hero_heading text,
  hero_media text,
  content text,
  status public.page_status not null default 'draft',
  seo_title text,
  seo_description text,
  open_graph_image text,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  created_at timestamptz not null default now()
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.navigation_menus(id) on delete cascade,
  label text not null,
  href text not null,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  sort_order integer not null default 0,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.footer_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text,
  site_description text,
  logo_url text,
  light_logo_url text,
  favicon_url text,
  whatsapp_number text,
  email text,
  address text,
  business_hours text,
  currency text,
  checkout_mode text,
  shipping_text text,
  returns_text text,
  maintenance_mode boolean not null default false,
  announcement_enabled boolean not null default false,
  announcement_text text,
  announcement_link text,
  default_social_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  line_1 text,
  line_2 text,
  city text,
  region text,
  postal_code text,
  country text,
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  order_reference text unique not null,
  status public.order_status not null default 'new',
  notes text,
  payment_method text,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null default 1,
  price numeric(12,2) not null default 0
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  message text,
  created_at timestamptz not null default now()
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_id uuid references public.profiles(id),
  entity text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_products_status on public.products(status);
create index idx_products_slug on public.products(slug);
create index idx_categories_slug on public.categories(slug);
create index idx_collections_slug on public.collections(slug);
create index idx_pages_slug on public.pages(slug);
create index idx_journal_slug on public.journal_posts(slug);
create index idx_media_assets_type on public.media_assets(media_type);
create index idx_orders_status on public.orders(status);
create index idx_enquiries_created_at on public.enquiries(created_at desc);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.pages enable row level security;
alter table public.journal_posts enable row level security;
alter table public.hero_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.activity_logs enable row level security;

create policy "Public can read published products"
on public.products for select
using (status in ('published', 'reserved', 'out_of_stock', 'sold') and deleted_at is null);

create policy "Public can read active categories"
on public.categories for select
using (active = true and deleted_at is null);

create policy "Public can read active collections"
on public.collections for select
using (active = true and deleted_at is null);

create policy "Public can read published pages"
on public.pages for select
using (status = 'published' and deleted_at is null);

create policy "Public can read published journal posts"
on public.journal_posts for select
using (status = 'published' and deleted_at is null);

create policy "Public can read published hero"
on public.hero_settings for select
using (status = 'published');

create policy "Public can read enabled homepage sections"
on public.homepage_sections for select
using (enabled = true);

create policy "Public can read site settings"
on public.site_settings for select
using (true);

create policy "Admins manage profiles"
on public.profiles for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage content"
on public.products for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage categories"
on public.categories for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage collections"
on public.collections for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage pages"
on public.pages for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage journal"
on public.journal_posts for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage hero"
on public.hero_settings for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage homepage"
on public.homepage_sections for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage settings"
on public.site_settings for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins manage media"
on public.media_assets for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Admins read activity"
on public.activity_logs for select
using (auth.role() = 'service_role');
