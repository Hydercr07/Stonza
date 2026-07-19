insert into public.roles (key, label)
values
  ('owner', 'Owner'),
  ('administrator', 'Administrator'),
  ('product_manager', 'Product Manager'),
  ('content_editor', 'Content Editor'),
  ('order_manager', 'Order Manager'),
  ('inventory_manager', 'Inventory Manager')
on conflict (key) do nothing;

insert into public.permissions (key, label)
values
  ('dashboard:view', 'View dashboard'),
  ('products:write', 'Manage products'),
  ('products:publish', 'Publish products'),
  ('categories:write', 'Manage categories'),
  ('collections:write', 'Manage collections'),
  ('homepage:write', 'Manage homepage'),
  ('hero:write', 'Manage hero'),
  ('settings:write', 'Manage settings'),
  ('media:write', 'Manage media')
on conflict (key) do nothing;

insert into public.categories (name, slug, description, featured_image, active, featured, sort_order)
values
  ('Statement Stones', 'statement-stones', 'Collector-driven centrepieces with strong silhouette and singular geological identity.', '/placeholders/category-statement.svg', true, true, 1),
  ('Desk Objects', 'desk-objects', 'Refined mineral objects for study, atmosphere and daily ritual.', '/placeholders/category-desk.svg', true, true, 2),
  ('Architectural Pieces', 'architectural-pieces', 'Larger stones with sculptural presence and spatial drama.', '/placeholders/category-architectural.svg', true, false, 3)
on conflict (slug) do nothing;

insert into public.collections (name, slug, description, featured_image, hero_media, active, featured, sort_order)
values
  ('Midnight Vein', 'midnight-vein', 'Obsidian, onyx and darker inclusions arranged with cinematic contrast.', '/placeholders/collection-midnight.svg', '/placeholders/collection-midnight.svg', true, true, 1),
  ('Earthlight', 'earthlight', 'Warm calcites, desert veining and pale mineral glow.', '/placeholders/collection-earthlight.svg', '/placeholders/collection-earthlight.svg', true, true, 2),
  ('Atlas Rare', 'atlas-rare', 'Rare stones with compelling origin stories and sharply limited availability.', '/placeholders/collection-atlas.svg', '/placeholders/collection-atlas.svg', true, true, 3)
on conflict (slug) do nothing;

insert into public.hero_settings (
  mode, desktop_banner_image, mobile_banner_image, video_poster, eyebrow, heading, subheading, description,
  primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, overlay_opacity, status
)
values (
  'interactive-3d',
  '/placeholders/hero-strata.svg',
  '/placeholders/hero-strata-mobile.svg',
  '/placeholders/hero-poster.svg',
  'Original stones. Editorial rarity.',
  'Mineral luxury shaped by time, pressure and provenance.',
  'STONZA curates singular stones with geological authenticity and cinematic presentation.',
  'Discover obsidian drama, quiet platinum tones and collector-grade pieces chosen for character, origin and enduring presence.',
  'Explore the stones',
  '/shop',
  'Read the provenance',
  '/authenticity',
  0.46,
  'published'
)
on conflict do nothing;

insert into public.homepage_sections (key, heading, body, layout, background, enabled, sort_order, cta_label, cta_url)
values
  ('featured-collections', 'Curated Collections', 'Three distinct mineral worlds, each edited for presence, origin and visual gravity.', 'editorial-grid', 'charcoal', true, 1, 'View collections', '/collections'),
  ('signature-stones', 'Signature Stones', 'Collector-led stones with dramatic inclusions, quiet polish and documented origin.', 'split', 'obsidian', true, 2, 'Shop signature stones', '/shop'),
  ('born-beneath-earth', 'Born Beneath the Earth', 'STONZA pieces are presented with geological context, human handling discipline and quiet editorial restraint.', 'story', 'ivory', true, 3, 'About the house', '/about'),
  ('authenticity', 'Authenticity & Certification', 'Clear treatment disclosure, certificate references and trusted sourcing channels sit behind every published stone.', 'feature', 'graphite', true, 4, 'See authenticity policy', '/authenticity')
on conflict (key) do nothing;

insert into public.pages (title, slug, hero_heading, hero_media, content, status)
values
  ('About', 'about', 'A house for original stones.', '/placeholders/hero-strata.svg', '<p>STONZA presents natural stones through an editorial lens, pairing geological storytelling with strict curation and transparent provenance.</p>', 'published'),
  ('Authenticity', 'authenticity', 'Transparency without theatre.', '/placeholders/certificate.svg', '<p>Each STONZA stone includes clear treatment disclosure, sourcing notes and, where applicable, certificate references and downloadable documentation.</p>', 'published'),
  ('Contact', 'contact', 'Speak with the STONZA concierge.', '/placeholders/contact.svg', '<p>Use the contact form or WhatsApp concierge for sourcing requests, certificates, shipping questions and private appointments.</p>', 'published')
on conflict (slug) do nothing;

-- Owner bootstrap note:
-- 1. Create the auth user matching OWNER_EMAIL in Supabase Auth.
-- 2. Insert a matching row into public.profiles.
-- 3. Attach the owner role via public.user_roles.
