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
