import { saveHomepageSectionsAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { getHomepageSections } from "@/lib/data/store";

export default async function HomepagePage() {
  const sections = await getHomepageSections(true);

  return (
    <form action={saveHomepageSectionsAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-5xl">Homepage sections</h1>
        <Button>Save homepage</Button>
      </div>
      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6">
            <input type="hidden" name={`${section.id}:order`} value={section.order} />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/45">{section.key}</p>
                <h2 className="text-2xl">{section.heading}</h2>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`${section.id}:enabled`} defaultChecked={section.enabled} /> Enabled</label>
            </div>
            <div className="grid gap-3">
              <input name={`${section.id}:eyebrow`} defaultValue={section.eyebrow} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <input name={`${section.id}:heading`} defaultValue={section.heading} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <textarea name={`${section.id}:body`} defaultValue={section.body} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <input name={`${section.id}:ctaLabel`} defaultValue={section.ctaLabel} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <input name={`${section.id}:ctaUrl`} defaultValue={section.ctaUrl} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <input name={`${section.id}:categorySlugs`} defaultValue={JSON.stringify(section.categorySlugs ?? [])} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <input name={`${section.id}:collectionSlugs`} defaultValue={JSON.stringify(section.collectionSlugs ?? [])} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
              <input name={`${section.id}:productSlugs`} defaultValue={JSON.stringify(section.productSlugs ?? [])} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
