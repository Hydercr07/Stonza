import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";
import { buildManagedPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getManagedPage("shipping-and-returns");
  return buildManagedPageMetadata(page, "/shipping-and-returns", "Shipping & Returns | STONZA");
}

export default async function ShippingReturnsPage() {
  const page = await getManagedPage("shipping-and-returns");
  if (page?.slug && page.slug !== "shipping-and-returns" && page.slugHistory?.includes("shipping-and-returns")) {
    permanentRedirect(`/${page.slug}`);
  }

  return (
    <section className="container-shell page-section">
      <div className="page-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Policy</p>
        <h1 className="page-title mt-3 text-[#171717]">
          {page?.heroHeading ?? "Shipping Policy"}
        </h1>
        <RichText
          html={page?.content ?? "<p>Shipping guidance will appear here once published from the admin portal.</p>"}
          className="mt-8 max-w-4xl text-black/68"
        />
      </div>
    </section>
  );
}
