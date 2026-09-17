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

-- Intentionally avoid inserting placeholder catalogue, collection, hero, homepage, homepage banner, or CMS records here.
-- Populate live merchandising and content through the admin portal or a dedicated content migration.

-- Owner bootstrap note:
-- 1. Create the auth user matching OWNER_EMAIL in Supabase Auth.
-- 2. Insert a matching row into public.profiles.
-- 3. Attach the owner role via public.user_roles.
