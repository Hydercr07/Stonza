"use client";

import { useMemo, useState } from "react";
import { saveHeroAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { MediaUrlField } from "@/components/admin/media-url-field";
import type { HeroMode, HeroSettings, HeroSlide } from "@/types/domain";

function createSlide(nextOrder: number): HeroSlide {
  return {
    id: `slide-${crypto.randomUUID()}`,
    desktopImage: "",
    mobileImage: "",
    eyebrow: "New slide",
    heading: "A new editorial hero moment",
    description: "Describe the slide and the tone you want it to set.",
    primaryCtaLabel: "Explore",
    primaryCtaUrl: "/shop",
    secondaryCtaLabel: "Learn more",
    secondaryCtaUrl: "/about",
    textAlignment: "left",
    textPosition: "center",
    overlayOpacity: 0.45,
    focalPoint: "center",
    active: true,
    sortOrder: nextOrder,
  };
}

export function HeroManagerForm({ hero }: { hero: HeroSettings }) {
  const [activeMode, setActiveMode] = useState<HeroMode>(hero.activeMode);
  const [slides, setSlides] = useState<HeroSlide[]>(hero.carousel.slides.sort((a, b) => a.sortOrder - b.sortOrder));
  const [video, setVideo] = useState(hero.video);
  const [interactive3d, setInteractive3d] = useState(hero.interactive3d);
  const [hybrid, setHybrid] = useState(hero.hybrid);

  const activeSlideCount = useMemo(() => slides.filter((slide) => slide.active).length, [slides]);

  return (
    <form action={saveHeroAction} className="space-y-6">
      <input type="hidden" name="id" value={hero.id} />
      <input type="hidden" name="activeMode" value={activeMode} />
      <input type="hidden" name="carousel" value={JSON.stringify({ ...hero.carousel, slides })} />
      <input type="hidden" name="video" value={JSON.stringify(video)} />
      <input type="hidden" name="interactive3d" value={JSON.stringify(interactive3d)} />
      <input type="hidden" name="hybrid" value={JSON.stringify(hybrid)} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Homepage manager</p>
          <h1 className="text-display mt-3 text-5xl">Hero manager</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
            Choose one live hero mode at a time. Other configurations stay saved, so you can switch between a carousel, background video, interactive gemstone scene or image-led hybrid moment without losing previous work.
          </p>
        </div>
        <Button>Save hero</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { value: "carousel", label: "Banner Carousel" },
          { value: "video", label: "Background Video" },
          { value: "interactive-3d", label: "Interactive 3D Hero" },
          { value: "hybrid", label: "Image + 3D Object" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setActiveMode(option.value as HeroMode)}
            className={`rounded-[1.5rem] border px-5 py-4 text-left transition ${
              activeMode === option.value
                ? "border-[#d5c7a9] bg-[#1e1a15] text-white"
                : "border-white/10 bg-[#111213] text-white/66 hover:border-white/20"
            }`}
          >
            <p className="text-sm font-medium">{option.label}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/45">
              {activeMode === option.value ? "Selected" : "Inactive"}
            </p>
          </button>
        ))}
      </div>

      <div className="space-y-6 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl text-white">Carousel slides</h2>
            <p className="mt-2 text-sm leading-7 text-white/58">
              Create multiple banner slides and publish carousel mode only when at least one active slide exists.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSlides((current) => [...current, createSlide(current.length + 1)])}
          >
            Add slide
          </Button>
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/42">
          Active slides: {activeSlideCount} | Carousel status: {activeSlideCount ? "Ready" : "Incomplete"}
        </p>
        <div className="grid gap-4">
          {slides.map((slide, index) => (
            <div key={slide.id} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Slide {index + 1}</p>
                  <p className="text-xs text-white/45">{slide.heading}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((current) =>
                        current.map((entry) =>
                          entry.id === slide.id ? { ...entry, active: !entry.active } : entry,
                        ),
                      )
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
                  >
                    {slide.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((current) =>
                        current.filter((entry) => entry.id !== slide.id).map((entry, order) => ({
                          ...entry,
                          sortOrder: order + 1,
                        })),
                      )
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <MediaUrlField
                  name={`${slide.id}-desktop`}
                  label="Desktop image"
                  description="Upload or paste the desktop banner image path."
                  defaultValue={slide.desktopImage}
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                  imageOnly
                  onValueChange={(nextValue) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, desktopImage: nextValue } : entry,
                      ),
                    )
                  }
                />
                <MediaUrlField
                  name={`${slide.id}-mobile`}
                  label="Mobile image"
                  description="Upload or paste the mobile crop path."
                  defaultValue={slide.mobileImage}
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                  imageOnly
                  onValueChange={(nextValue) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, mobileImage: nextValue } : entry,
                      ),
                    )
                  }
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={slide.eyebrow}
                  onChange={(event) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, eyebrow: event.target.value } : entry,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  placeholder="Eyebrow"
                />
                <input
                  value={slide.heading}
                  onChange={(event) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, heading: event.target.value } : entry,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  placeholder="Main heading"
                />
                <textarea
                  value={slide.description}
                  onChange={(event) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, description: event.target.value } : entry,
                      ),
                    )
                  }
                  rows={3}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm md:col-span-2"
                  placeholder="Description"
                />
                <input
                  value={slide.primaryCtaLabel}
                  onChange={(event) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, primaryCtaLabel: event.target.value } : entry,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  placeholder="Primary CTA label"
                />
                <input
                  value={slide.primaryCtaUrl}
                  onChange={(event) =>
                    setSlides((current) =>
                      current.map((entry) =>
                        entry.id === slide.id ? { ...entry, primaryCtaUrl: event.target.value } : entry,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  placeholder="Primary CTA URL"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <h2 className="text-2xl text-white">Video mode</h2>
          <MediaUrlField
            name="videoDesktop"
            label="Desktop video"
            description="Upload or paste the desktop video path."
            defaultValue={video.desktopVideo}
            accept=".mp4,.webm"
            onValueChange={(nextValue) => setVideo((current) => ({ ...current, desktopVideo: nextValue }))}
          />
          <MediaUrlField
            name="videoMobile"
            label="Mobile video"
            description="Upload or paste the mobile-specific video path."
            defaultValue={video.mobileVideo}
            accept=".mp4,.webm"
            onValueChange={(nextValue) => setVideo((current) => ({ ...current, mobileVideo: nextValue }))}
          />
          <MediaUrlField
            name="videoPoster"
            label="Poster image"
            description="Poster used while the video loads or if autoplay is skipped."
            defaultValue={video.posterImage}
            accept=".jpg,.jpeg,.png,.webp,.avif"
            imageOnly
            onValueChange={(nextValue) => setVideo((current) => ({ ...current, posterImage: nextValue }))}
          />
          <label className="grid gap-2 text-sm">
            Video heading
            <input
              value={video.heading}
              onChange={(event) => setVideo((current) => ({ ...current, heading: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Video description
            <textarea
              value={video.description}
              onChange={(event) => setVideo((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={video.autoplay}
                onChange={(event) => setVideo((current) => ({ ...current, autoplay: event.target.checked }))}
              />
              Autoplay
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={video.loop}
                onChange={(event) => setVideo((current) => ({ ...current, loop: event.target.checked }))}
              />
              Loop
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={video.muted}
                onChange={(event) => setVideo((current) => ({ ...current, muted: event.target.checked }))}
              />
              Muted
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={video.showControls}
                onChange={(event) => setVideo((current) => ({ ...current, showControls: event.target.checked }))}
              />
              Controls
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <h2 className="text-2xl text-white">3D and hybrid content</h2>
          <MediaUrlField
            name="hybridDesktopImage"
            label="Hybrid desktop image"
            description="Background image used behind the foreground gemstone or model."
            defaultValue={hybrid.desktopImage}
            accept=".jpg,.jpeg,.png,.webp,.avif"
            imageOnly
            onValueChange={(nextValue) => setHybrid((current) => ({ ...current, desktopImage: nextValue }))}
          />
          <MediaUrlField
            name="hybridMobileImage"
            label="Hybrid mobile image"
            description="Optional small-screen crop for the hybrid hero."
            defaultValue={hybrid.mobileImage}
            accept=".jpg,.jpeg,.png,.webp,.avif"
            imageOnly
            onValueChange={(nextValue) => setHybrid((current) => ({ ...current, mobileImage: nextValue }))}
          />
          <label className="grid gap-2 text-sm">
            3D heading
            <input
              value={interactive3d.heading}
              onChange={(event) => setInteractive3d((current) => ({ ...current, heading: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Hybrid heading
            <input
              value={hybrid.heading}
              onChange={(event) => setHybrid((current) => ({ ...current, heading: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            3D description
            <textarea
              value={interactive3d.description}
              onChange={(event) => setInteractive3d((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Hybrid description
            <textarea
              value={hybrid.description}
              onChange={(event) => setHybrid((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
        </div>
      </div>
    </form>
  );
}
