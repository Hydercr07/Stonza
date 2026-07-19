begin;

alter table if exists categories
  add column if not exists short_description text default '',
  add column if not exists hero_image text,
  add column if not exists mobile_image text,
  add column if not exists video text,
  add column if not exists alt_text text default '',
  add column if not exists parent_category_id uuid references categories(id) on delete set null,
  add column if not exists status text default 'draft' check (status in ('draft','published','archived','trash')),
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists open_graph_image text,
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists deleted_at timestamptz;

create index if not exists categories_status_idx on categories(status);
create index if not exists categories_parent_category_id_idx on categories(parent_category_id);

alter table if exists products
  add column if not exists category_slugs jsonb default '[]'::jsonb,
  add column if not exists media jsonb default '[]'::jsonb;

create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  hero_id uuid references hero_settings(id) on delete cascade,
  desktop_image text,
  mobile_image text,
  eyebrow text not null default '',
  heading text not null default '',
  description text not null default '',
  primary_cta_label text not null default '',
  primary_cta_url text not null default '',
  secondary_cta_label text not null default '',
  secondary_cta_url text not null default '',
  text_alignment text not null default 'left' check (text_alignment in ('left','center')),
  text_position text not null default 'center' check (text_position in ('start','center','end')),
  overlay_opacity numeric(3,2) not null default 0.45,
  focal_point text not null default 'center',
  active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_slides_hero_id_idx on hero_slides(hero_id);
create index if not exists hero_slides_sort_order_idx on hero_slides(sort_order);

alter table if exists hero_settings
  add column if not exists active_mode text default 'interactive-3d' check (active_mode in ('carousel','video','interactive-3d','hybrid')),
  add column if not exists carousel jsonb default '{}'::jsonb,
  add column if not exists video jsonb default '{}'::jsonb,
  add column if not exists interactive3d jsonb default '{}'::jsonb,
  add column if not exists hybrid jsonb default '{}'::jsonb,
  add column if not exists updated_by uuid;

alter table if exists homepage_sections
  add column if not exists eyebrow text default '',
  add column if not exists category_slugs jsonb default '[]'::jsonb,
  add column if not exists testimonial text,
  add column if not exists media text,
  add column if not exists status text default 'published' check (status in ('draft','published')),
  add column if not exists updated_by uuid;

create table if not exists content_labels (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table if exists navigation_items
  add column if not exists visible boolean not null default true,
  add column if not exists parent_item_id uuid references navigation_items(id) on delete cascade,
  add column if not exists sort_order integer not null default 1;

create index if not exists navigation_items_parent_item_id_idx on navigation_items(parent_item_id);
create index if not exists navigation_items_sort_order_idx on navigation_items(sort_order);

alter table if exists footer_sections
  add column if not exists sort_order integer not null default 1,
  add column if not exists status text default 'published' check (status in ('draft','published','archived')),
  add column if not exists updated_by uuid;

alter table if exists site_settings
  add column if not exists brand jsonb default '{}'::jsonb,
  add column if not exists header jsonb default '{}'::jsonb,
  add column if not exists footer jsonb default '{}'::jsonb,
  add column if not exists social jsonb default '{}'::jsonb,
  add column if not exists seo jsonb default '{}'::jsonb,
  add column if not exists labels jsonb default '{}'::jsonb;

alter table if exists media_assets
  add column if not exists deleted_at timestamptz;

create index if not exists media_assets_deleted_at_idx on media_assets(deleted_at);

alter table if exists activity_logs
  add column if not exists detail text;

create or replace view public_categories as
select *
from categories
where deleted_at is null
  and active = true
  and status = 'published';

drop policy if exists "public_read_published_categories" on categories;
create policy "public_read_published_categories"
on categories for select
using (deleted_at is null and active = true and status = 'published');

drop policy if exists "public_read_active_media_assets" on media_assets;
create policy "public_read_active_media_assets"
on media_assets for select
using (deleted_at is null);

commit;
