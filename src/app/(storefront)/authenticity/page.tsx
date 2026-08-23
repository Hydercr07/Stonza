import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";
import { buildManagedPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getManagedPage("authenticity");
  return buildManagedPageMetadata(page, "/authenticity", "Authenticity | STONZA");
}

export default async function AuthenticityPage() {
  const page = await getManagedPage("authenticity");
  if (page?.slug && page.slug !== "authenticity" && page.slugHistory?.includes("authenticity")) {
    permanentRedirect(`/${page.slug}`);
  }
  return (
    <section className="container-shell page-section">
      <div className="page-panel">
        <h1 className="page-title text-[#171717]">{page?.heroHeading ?? "Authenticity"}</h1>
        <RichText
          html={page?.content ?? "<p>Content coming soon.</p>"}
          className="prose-copy mt-8 max-w-3xl [&_h3]:text-display [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:text-[#171717] [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-[#a2845d] [&_a]:underline"
        />
      </div>
    </section>
  );
}
