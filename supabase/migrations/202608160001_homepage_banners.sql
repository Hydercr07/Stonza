create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  image_url text not null,
  link_url text,
  after_section_key text not null,
  enabled boolean not null default true,
  sort_order integer not null default 1,
  alt_text text not null default '',
  status text not null default 'published' check (status in ('draft', 'published')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create index if not exists homepage_banners_sort_order_idx on public.homepage_banners(sort_order);
create index if not exists homepage_banners_after_section_key_idx on public.homepage_banners(after_section_key);
create index if not exists homepage_banners_deleted_at_idx on public.homepage_banners(deleted_at);

alter table public.homepage_banners enable row level security;

drop policy if exists "Public can read enabled homepage banners" on public.homepage_banners;
create policy "Public can read enabled homepage banners"
on public.homepage_banners for select
using (enabled = true and status = 'published' and deleted_at is null);

drop policy if exists "Admins manage homepage banners" on public.homepage_banners;
create policy "Admins manage homepage banners"
on public.homepage_banners for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
