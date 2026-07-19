# STONZA

STONZA is a luxury natural-stones commerce platform built with Next.js App Router, TypeScript, Tailwind CSS, Supabase-ready data/auth architecture, React Three Fiber, and a protected `/admin` portal.

## What Is Implemented
- Branded luxury storefront with the official STONZA logo in `public/brand/stonza-logo.png`
- Separate storefront and admin route groups with separate layouts and navigation
- Cinematic homepage preview with a procedural 3D gemstone hero
- Data-backed collections, products, journal, and managed content routes
- Protected admin login and portal shell with working local demo auth
- Functional admin mutations for categories, collections, products, hero settings, homepage sections, site settings, and media uploads
- Local repository persistence through `src/data/dev-store.json` for development-safe operation without external credentials
- Supabase-ready helper scaffolding, SQL migrations, seed assets, and environment templates
- Unit tests and Playwright end-to-end tests for the critical admin/storefront flow

## Local Setup
1. Use Node.js `24.x` or newer.
2. Copy `.env.example` to `.env.local`.
3. Set `OWNER_EMAIL` for the local admin portal.
4. Install dependencies:

```bash
npm install
```

5. Start the app:

```bash
npm run dev
```

The app runs locally on `http://localhost:3000` unless that port is already occupied.

## Local Admin Login
- Email: value of `OWNER_EMAIL`, or `owner@stonza.local` if unset
- Password: `stonza-admin-demo`

This local demo auth exists only to keep the app functional before Supabase credentials are configured. Replace it with Supabase Auth before production use.

## Commands
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## Project Structure
```text
src/
  app/
    (storefront)/
    admin/
    api/
  actions/
  components/
    admin/
    shared/
    storefront/
    three/
  data/
  lib/
    auth/
    data/
    seo/
    supabase/
    validation/
  types/
supabase/
  migrations/
  seed.sql
tests/
  unit/
  e2e/
public/
  brand/
  placeholders/
  uploads/
```

## Supabase Setup
1. Create a new Supabase project.
2. Add the environment values from `.env.example` to `.env.local` and Vercel project settings.
3. Apply migrations from `supabase/migrations`.
4. Run `supabase/seed.sql`.
5. Create storage buckets:
   - `images`
   - `videos`
   - `documents`
   - `models`
   - `brand`
6. Configure authentication redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://stonza-store.vercel.app/auth/callback`
   - later: `https://stonza.pk/auth/callback`
7. Bootstrap the owner account by inviting or creating the `OWNER_EMAIL` user, then assign the `owner` role in the `user_roles` table.

## Database Migration Workflow
- Add forward-only SQL files under `supabase/migrations`.
- Keep the TypeScript validation and repository types aligned with schema changes.
- Re-run seed data when editorial placeholders need refresh.
- Revalidate affected routes after published content changes.

## Deployment To Vercel
1. Push the repository to GitHub.
2. Create a Vercel project and import the repo.
3. Set all environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL=https://stonza-store.vercel.app`.
5. Set `NEXT_PUBLIC_ADMIN_URL=https://stonza-store.vercel.app/admin`.
6. Deploy.
7. Verify:
   - public homepage
   - `/admin/login`
   - a product page
   - media upload

## Connecting `stonza.pk` Later
1. Add the custom domain in Vercel.
2. Update DNS to the Vercel-provided records.
3. Update environment variables:
   - `NEXT_PUBLIC_SITE_URL=https://stonza.pk`
   - `NEXT_PUBLIC_ADMIN_URL=https://stonza.pk/admin`
4. Add the new auth callback URL to Supabase.
5. Redeploy. No code rewrite is required.

## Development Performance Checklist
- Keep the homepage usable on mobile before adding more motion.
- Use `next/image` for image assets and set `sizes` on `fill` images.
- Lazy-load 3D and video experiences.
- Avoid loading admin-only code into storefront routes.
- Prefer pagination and indexed lookups for larger product and journal datasets.

## Media Guidelines
- Upload binaries to storage or `public/uploads` in local mode. Do not store binaries in PostgreSQL.
- Keep brand originals untouched. Derive light treatments in presentation only.
- Prefer AVIF/WebP where possible for large imagery.
- Provide meaningful alt text for every product and editorial media item.

## Known Current Limitations
- Local development currently uses a file-backed repository and demo admin auth until Supabase credentials are configured.
- Commerce checkout, enquiries, full page CMS, journal authoring, and role-management UIs are scaffolded but not yet fully expanded to the Supabase-backed production layer.
- The admin media page can upload locally now; the Supabase Storage swap-in is documented and scaffolded but still credential-dependent.
