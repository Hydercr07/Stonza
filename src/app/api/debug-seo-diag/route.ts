import { NextResponse } from "next/server";
import { getManagedPage, getProductBySlug } from "@/lib/data/store";
import { buildManagedPageMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getProductDisplayPrice } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

// TEMPORARY diagnostic route -- not linked anywhere, will be removed
// immediately after use. Exists only to surface the real stack trace for
// the production 500s on /about and /stones/[slug].
export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const page = await getManagedPage("about");
    results.getManagedPage = {
      ok: true,
      hasPage: Boolean(page),
      slug: page?.slug,
      slugHistory: page?.slugHistory,
      wouldRedirect: Boolean(page?.slug && page.slug !== "about" && page.slugHistory?.includes("about")),
      contentLength: page?.content?.length ?? 0,
    };
    try {
      results.buildManagedPageMetadata = { ok: true, value: buildManagedPageMetadata(page, "/about", "About STONZA") };
    } catch (e) {
      results.buildManagedPageMetadata = { ok: false, message: (e as Error).message, stack: (e as Error).stack };
    }
    try {
      const clean = sanitizeHtml(page?.content ?? "<p>Content coming soon.</p>");
      results.sanitizeHtml = { ok: true, cleanLength: clean.length };
    } catch (e) {
      results.sanitizeHtml = { ok: false, message: (e as Error).message, stack: (e as Error).stack };
    }
  } catch (e) {
    results.getManagedPage = { ok: false, message: (e as Error).message, stack: (e as Error).stack };
  }

  try {
    const product = await getProductBySlug("emerald-zamarud-stone");
    results.getProductBySlug = { ok: true, hasProduct: Boolean(product) };
    if (product) {
      try {
        const price = getProductDisplayPrice(product);
        results.productJsonLd = { ok: true, value: productJsonLd(product, price) };
      } catch (e) {
        results.productJsonLd = { ok: false, message: (e as Error).message, stack: (e as Error).stack };
      }
      try {
        results.breadcrumbJsonLd = { ok: true, value: breadcrumbJsonLd([{ name: "Shop", path: "/shop" }]) };
      } catch (e) {
        results.breadcrumbJsonLd = { ok: false, message: (e as Error).message, stack: (e as Error).stack };
      }
    }
  } catch (e) {
    results.getProductBySlug = { ok: false, message: (e as Error).message, stack: (e as Error).stack };
  }

  return NextResponse.json(results);
}
