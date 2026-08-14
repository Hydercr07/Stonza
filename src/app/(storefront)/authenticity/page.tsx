import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";

export default async function AuthenticityPage() {
  const page = await getManagedPage("authenticity");
  if (page?.slug && page.slug !== "authenticity" && page.slugHistory?.includes("authenticity")) {
    permanentRedirect(`/${page.slug}`);
  }
  return (
    <section className="container-shell py-16">
      <h1 className="text-display text-5xl text-white">{page?.heroHeading ?? "Authenticity"}</h1>
      <RichText html={page?.content ?? "<p>Content coming soon.</p>"} className="prose prose-invert mt-8 max-w-3xl text-white/70" />
    </section>
  );
}
