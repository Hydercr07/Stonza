import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";

export default async function AboutPage() {
  const page = await getManagedPage("about");
  return (
    <section className="container-shell py-16">
      <h1 className="text-display text-5xl text-white">{page?.heroHeading ?? "About STONZA"}</h1>
      <RichText html={page?.content ?? "<p>Content coming soon.</p>"} className="prose prose-invert mt-8 max-w-3xl text-white/70" />
    </section>
  );
}
