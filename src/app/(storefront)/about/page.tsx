import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";

export default async function AboutPage() {
  const page = await getManagedPage("about");
  if (page?.slug && page.slug !== "about" && page.slugHistory?.includes("about")) {
    permanentRedirect(`/${page.slug}`);
  }
  return (
    <section className="container-shell page-section">
      <div className="page-panel">
        <h1 className="page-title text-[#171717]">{page?.heroHeading ?? "About STONZA"}</h1>
        <RichText html={page?.content ?? "<p>Content coming soon.</p>"} className="prose-copy mt-8 max-w-3xl" />
      </div>
    </section>
  );
}
