"use client";

import { useMemo, useState } from "react";
import { saveHomepageBannersAction } from "@/actions/admin";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { Button } from "@/components/shared/ui/button";
import type { HomepageBanner, HomepageSection } from "@/types/domain";

function createBanner(nextOrder: number, fallbackSectionKey: string): HomepageBanner {
  return {
    id: `homepage-banner-${crypto.randomUUID()}`,
    title: `Promotional banner ${nextOrder}`,
    imageUrl: "",
    linkUrl: "",
    afterSectionKey: fallbackSectionKey,
    enabled: true,
    order: nextOrder,
    altText: `STONZA promotional banner ${nextOrder}`,
    status: "published",
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
}

export function HomepageBannerManagerForm({
  banners,
  sections,
}: {
  banners: HomepageBanner[];
  sections: HomepageSection[];
}) {
  const sectionOptions = useMemo(
    () =>
      [...sections]
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          key: section.key,
          label: section.heading,
        })),
    [sections],
  );
  const fallbackSectionKey = sectionOptions[0]?.key ?? "featured-categories";
  const [items, setItems] = useState(
    [...banners]
      .sort((a, b) => a.order - b.order)
      .map((banner, index) => ({
        ...banner,
        order: index + 1,
      })),
  );

  const serializedBanners = JSON.stringify(
    items.map((banner, index) => ({
      ...banner,
      order: index + 1,
      afterSectionKey: banner.afterSectionKey || fallbackSectionKey,
      altText: banner.altText || banner.title || `STONZA promotional banner ${index + 1}`,
    })),
  );

  return (
    <form action={saveHomepageBannersAction} className="space-y-6">
      <input type="hidden" name="banners" value={serializedBanners} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Homepage manager</p>
          <h2 className="text-display mt-3 text-4xl">Promotional banners</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
            Upload reusable 1600 x 150 promotional strips, decide which homepage section each one follows, and manage ordering without editing code.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setItems((current) => [...current, createBanner(current.length + 1, fallbackSectionKey)])
            }
          >
            Add banner
          </Button>
          <Button>Save banners</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {items.length ? (
          items.map((banner, index) => (
            <div key={banner.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Banner {index + 1}</p>
                  <p className="text-xs text-white/45">{banner.title || "Untitled promotional banner"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      setItems((current) => {
                        const next = [...current];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next.map((entry, order) => ({ ...entry, order: order + 1 }));
                      })
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-30"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() =>
                      setItems((current) => {
                        const next = [...current];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return next.map((entry, order) => ({ ...entry, order: order + 1 }));
                      })
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-30"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === banner.id ? { ...entry, enabled: !entry.enabled } : entry,
                        ),
                      )
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
                  >
                    {banner.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) =>
                        current
                          .filter((entry) => entry.id !== banner.id)
                          .map((entry, order) => ({ ...entry, order: order + 1 })),
                      )
                    }
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <MediaUrlField
                  name={`banner-image-${banner.id}`}
                  label="Banner image"
                  description="Wide promotional strip. 1600 x 150 px is the recommended desktop reference size."
                  defaultValue={banner.imageUrl}
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                  imageOnly
                  onValueChange={(nextValue) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === banner.id ? { ...entry, imageUrl: nextValue } : entry,
                      ),
                    )
                  }
                />

                <div className="grid gap-3">
                  <input
                    value={banner.title}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === banner.id ? { ...entry, title: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    placeholder="Internal banner name"
                  />
                  <input
                    value={banner.altText}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === banner.id ? { ...entry, altText: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    placeholder="Accessible alt text"
                  />
                  <input
                    value={banner.linkUrl ?? ""}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === banner.id ? { ...entry, linkUrl: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    placeholder="/collections or https://..."
                  />
                  <label className="grid gap-2 text-sm text-white/65">
                    <span>Show this banner after</span>
                    <select
                      value={banner.afterSectionKey}
                      onChange={(event) =>
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === banner.id
                              ? { ...entry, afterSectionKey: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    >
                      {sectionOptions.map((section) => (
                        <option key={section.key} value={section.key}>
                          {section.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-[#111213] px-6 py-12 text-center text-sm text-white/55">
            No promotional banners yet. Add your first homepage banner to start placing strips between sections.
          </div>
        )}
      </div>
    </form>
  );
}
