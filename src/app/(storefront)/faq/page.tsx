import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";

export default async function FaqPage() {
  const page = await getManagedPage("faq");
  if (page?.slug && page.slug !== "faq" && page.slugHistory?.includes("faq")) {
    permanentRedirect(`/${page.slug}`);
  }

  return (
    <section className="container-shell py-16">
      <div className="rounded-[2rem] border border-[#eadfcf] bg-white/88 p-8 shadow-[0_22px_52px_rgba(26,20,12,0.08)]">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Support</p>
        <h1 className="text-display mt-3 text-5xl text-[#171717]">{page?.heroHeading ?? "FAQ"}</h1>
        <RichText
          html={page?.content ?? "<p>FAQ content will appear here once it has been published from the admin portal.</p>"}
          className="mt-8 max-w-4xl text-black/68"
        />
      </div>
    </section>
  );
}
