import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";

export default async function FaqPage() {
  const page = await getManagedPage("faq");
  if (page?.slug && page.slug !== "faq" && page.slugHistory?.includes("faq")) {
    permanentRedirect(`/${page.slug}`);
  }

  return (
    <section className="container-shell page-section">
      <div className="page-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Support</p>
        <h1 className="page-title mt-3 text-[#171717]">{page?.heroHeading ?? "FAQ"}</h1>
        <RichText
          html={page?.content ?? "<p>FAQ content will appear here once it has been published from the admin portal.</p>"}
          className="mt-8 max-w-4xl text-black/68"
        />
      </div>
    </section>
  );
}
