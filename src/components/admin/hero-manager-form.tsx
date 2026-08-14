"use client";

import { useMemo, useState } from "react";
import { saveHeroAction } from "@/actions/admin";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { Button } from "@/components/shared/ui/button";
import type { HeroSettings } from "@/types/domain";

function createSlide(nextOrder: number) {
  return {
    id: `slide-${crypto.randomUUID()}`,
    desktopImage: "",
    mobileImage: "",
    eyebrow: "",
    heading: "",
    description: "",
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
    textAlignment: "left" as const,
    textPosition: "center" as const,
    overlayOpacity: 0,
    focalPoint: "center",
    active: true,
    sortOrder: nextOrder,
  };
}

export function HeroManagerForm({ hero }: { hero: HeroSettings }) {
  const [slides, setSlides] = useState(hero.carousel.slides.sort((a, b) => a.sortOrder - b.sortOrder));
  const activeSlideCount = useMemo(() => slides.filter((slide) => slide.active).length, [slides]);

  return (
    <form action={saveHeroAction} className="space-y-6">
      <input type="hidden" name="id" value={hero.id} />
      <input type="hidden" name="activeMode" value="carousel" />
      <input
        type="hidden"
        name="carousel"
        value={JSON.stringify({
          ...hero.carousel,
          autoplay: true,
          autoplayInterval: 3000,
          loop: true,
          pauseOnHover: false,
          showArrows: false,
          showDots: true,
          transitionStyle: "fade",
          slides,
        })}
      />
      <input type="hidden" name="video" value={JSON.stringify(hero.video)} />
      <input type="hidden" name="interactive3d" value={JSON.stringify(hero.interactive3d)} />
      <input type="hidden" name="hybrid" value={JSON.stringify(hero.hybrid)} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Homepage manager</p>
          <h1 className="text-display mt-3 text-5xl">Hero banners</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
            The homepage hero is a banner-only carousel. Slides loop continuously and change every 3 seconds on the storefront.
          </p>
        </div>
        <Button>Save banners</Button>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl text-white">Carousel slides</h2>
            <p className="mt-2 text-sm leading-7 text-white/58">
              Upload desktop and mobile banner images, reorder them, and disable any slide you do not want shown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/50">
              Active slides: {activeSlideCount}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSlides((current) => [...current, createSlide(current.length + 1)])}
            >
              Add banner
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {slides.map((slide, index) => (
            <div key={slide.id} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Banner {index + 1}</p>
                  <p className="text-xs text-white/45">{slide.heading || "Untitled banner"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      setSlides((current) => {
                        const next = [...current];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next.map((entry, order) => ({ ...entry, sortOrder: order + 1 }));
                      })
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-30"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() =>
                      setSlides((current) => {
                        const next = [...current];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return next.map((entry, order) => ({ ...entry, sortOrder: order + 1 }));
                      })
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-30"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((current) =>
                        current.map((entry) => (entry.id === slide.id ? { ...entry, active: !entry.active } : entry)),
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
                        current
                          .filter((entry) => entry.id !== slide.id)
                          .map((entry, order) => ({ ...entry, sortOrder: order + 1 })),
                      )
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <MediaUrlField
                  name={`desktop-${slide.id}`}
                  label="Desktop banner"
                  description="Used on tablet, laptop and desktop widths."
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
                  name={`mobile-${slide.id}`}
                  label="Mobile banner"
                  description="Used on small-screen devices."
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

              <div className="mt-5">
                <input
                  value={slide.heading}
                  onChange={(event) =>
                    setSlides((current) =>
                      current.map((entry) => (entry.id === slide.id ? { ...entry, heading: event.target.value } : entry)),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  placeholder="Optional internal label"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
