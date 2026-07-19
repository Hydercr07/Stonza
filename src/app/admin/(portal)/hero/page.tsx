import { saveHeroAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { getHeroSettings } from "@/lib/data/store";

export default async function HeroPage() {
  const hero = await getHeroSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-display text-5xl">Hero manager</h1>
      <form action={saveHeroAction} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <input type="hidden" name="id" value={hero.id} />
          <label className="grid gap-2 text-sm">
            Mode
            <select name="mode" defaultValue={hero.mode} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="interactive-3d">Interactive 3D</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <input name="desktopBannerImage" defaultValue={hero.desktopBannerImage} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="mobileBannerImage" defaultValue={hero.mobileBannerImage} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="desktopBackgroundVideo" defaultValue={hero.desktopBackgroundVideo} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="mobileBackgroundVideo" defaultValue={hero.mobileBackgroundVideo} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="videoPoster" defaultValue={hero.videoPoster} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="model3d" defaultValue={hero.model3d} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        </div>
        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <input name="eyebrow" defaultValue={hero.eyebrow} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="heading" defaultValue={hero.heading} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="subheading" defaultValue={hero.subheading} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <textarea name="description" defaultValue={hero.description} rows={5} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="primaryCtaLabel" defaultValue={hero.primaryCtaLabel} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="primaryCtaUrl" defaultValue={hero.primaryCtaUrl} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="secondaryCtaLabel" defaultValue={hero.secondaryCtaLabel} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="secondaryCtaUrl" defaultValue={hero.secondaryCtaUrl} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input type="hidden" name="textAlignment" value={hero.textAlignment} />
          <input type="hidden" name="textPosition" value={hero.textPosition} />
          <input type="hidden" name="overlayOpacity" value={hero.overlayOpacity} />
          <input type="hidden" name="focalPoint" value={hero.focalPoint} />
          <input type="hidden" name="heroHeight" value={hero.heroHeight} />
          <input type="hidden" name="status" value={hero.status} />
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="autoplay" defaultChecked={hero.autoplay} /> Autoplay</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="loop" defaultChecked={hero.loop} /> Loop</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="muted" defaultChecked={hero.muted} /> Muted</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="showControls" defaultChecked={hero.showControls} /> Controls</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="showScrollIndicator" defaultChecked={hero.showScrollIndicator} /> Scroll indicator</label>
          <Button>Save hero</Button>
        </div>
      </form>
    </div>
  );
}
