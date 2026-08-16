import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";

export default async function PrivacyPolicyPage() {
  const page = await getManagedPage("privacy-policy");
  if (page?.slug && page.slug !== "privacy-policy" && page.slugHistory?.includes("privacy-policy")) {
    permanentRedirect(`/${page.slug}`);
  }

  return (
    <section className="container-shell page-section">
      <div className="page-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Policy</p>
        <h1 className="page-title mt-3 text-[#171717]">{page?.heroHeading ?? "Privacy Policy"}</h1>
        <RichText
          html={page?.content ?? "<p>Privacy details will appear here once published from the admin portal.</p>"}
          className="mt-8 max-w-4xl text-black/68"
        />
      </div>
    </section>
  );
}
