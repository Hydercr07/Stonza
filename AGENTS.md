# STONZA Project Guide

## Project Purpose
STONZA is a premium full-stack commerce and content platform for original natural stones. The repository contains a Next.js App Router storefront, an `/admin` operations portal, a shared domain model, and deployment/migration assets for Supabase and Vercel.

## Architecture Rules
- Keep public storefront routes inside `src/app/(storefront)` and admin routes inside `src/app/admin`.
- Preserve separate public and admin layouts, navigation systems, and metadata behavior.
- Share types, validation, permissions, and repository logic through `src/lib`, `src/types`, and `src/actions`.
- Keep `/admin` excluded from sitemap, structured data, public navigation, and search indexing.
- Default to React Server Components. Use client components only for interaction, forms, motion, or WebGL.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or other secrets in client-side bundles.

## Commands
- Development: `npm run dev`
- Lint: `npm run lint`
- TypeScript: `npm run typecheck`
- Unit tests: `npm run test`
- End-to-end tests: `npm run test:e2e`
- Production build: `npm run build`

## Database Migration Workflow
- Add forward-only SQL migrations under `supabase/migrations`.
- Update shared TypeScript types and validation when schema changes.
- Keep `supabase/seed.sql` aligned with the latest schema and editorial placeholder content.
- Revalidate affected public paths after admin mutations that change published content.

## Security Requirements
- Enforce server-side authorization on all admin reads and mutations.
- Validate all mutation input with Zod.
- Sanitize rich-text output before rendering.
- Validate file type and file size on both client and server.
- Use soft deletion by default for content and commerce records.
- Record destructive actions in the activity log.

## UI And Brand Standards
- Preserve the official STONZA logo proportions and typography.
- Maintain a luxury editorial visual language: obsidian, ivory, graphite, restrained platinum accents, strong serif headings, disciplined spacing.
- Keep motion subtle and optional. Respect reduced-motion preferences and low-power fallbacks.
- Protect mobile performance and interaction quality throughout implementation.

## Definition Of Done
- The public website runs locally and builds successfully.
- The logo is displayed correctly in storefront and admin surfaces.
- Mobile layouts remain functional.
- Admin access is protected and public users cannot reach protected mutations.
- Product, homepage, media, and settings flows are connected to a real repository layer.
- Lint, TypeScript, unit tests, and production build pass before completion.

## Working Agreement
- Preserve working functionality at every phase.
- Test all admin mutations after implementing or changing them.
- Avoid hardcoded public content directly inside components.
- Keep the application shippable even when external credentials are not yet available by using documented development-safe fallbacks.
