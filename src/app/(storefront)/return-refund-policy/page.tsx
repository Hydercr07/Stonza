import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";
import { buildManagedPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getManagedPage("return-refund-policy");
  return buildManagedPageMetadata(page, "/return-refund-policy", "Return & Refund Policy | STONZA");
}

export default async function ReturnRefundPolicyPage() {
  const page = await getManagedPage("return-refund-policy");
  if (page?.slug && page.slug !== "return-refund-policy" && page.slugHistory?.includes("return-refund-policy")) {
    permanentRedirect(`/${page.slug}`);
  }

  return (
    <section className="container-shell page-section">
      <div className="page-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Policy</p>
        <h1 className="page-title mt-3 text-[#171717]">
          {page?.heroHeading ?? "Return / Refund Policy"}
        </h1>
        <RichText
          html={page?.content ?? "<p>Return and refund guidance will appear here once published from the admin portal.</p>"}
          className="mt-8 max-w-4xl text-black/68 [&_h3]:text-display [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:text-[#171717] [&_p]:mb-4 [&_a]:text-[#a2845d] [&_a]:underline"
        />
      </div>
    </section>
  );
}
