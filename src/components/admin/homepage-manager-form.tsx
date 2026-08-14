"use client";

import { useMemo, useState } from "react";
import { saveHomepageSectionsAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import type { Category, Collection, HomepageSection, Product } from "@/types/domain";

function toggleValue(values: string[], nextValue: string) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export function HomepageManagerForm({
  sections,
  categories,
  collections,
  products,
}: {
  sections: HomepageSection[];
  categories: Category[];
  collections: Collection[];
  products: Product[];
}) {
  const [items, setItems] = useState(sections);
  const activeCategories = useMemo(
    () => categories.filter((entry) => !entry.deletedAt && entry.status !== "trash"),
    [categories],
  );

  return (
    <form action={saveHomepageSectionsAction} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-5xl">Homepage sections</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Control section text, visibility, and featured merchandising assignments without editing source code.
          </p>
        </div>
        <Button>Save homepage</Button>
      </div>

      <div className="grid gap-4">
        {items.map((section, index) => (
          <div key={section.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6">
            <input type="hidden" name={`${section.id}:order`} value={section.order} />
            <input type="hidden" name={`${section.id}:categorySlugs`} value={JSON.stringify(section.categorySlugs ?? [])} />
            <input type="hidden" name={`${section.id}:collectionSlugs`} value={JSON.stringify(section.collectionSlugs ?? [])} />
            <input type="hidden" name={`${section.id}:productSlugs`} value={JSON.stringify(section.productSlugs ?? [])} />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/45">{section.key}</p>
                <h2 className="text-2xl">{section.heading}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`${section.id}:enabled`}
                    checked={section.enabled}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, enabled: event.target.checked } : entry,
                        ),
                      )
                    }
                  />
                  Enabled
                </label>
              </div>
            </div>

            <div className="grid gap-3">
              <input
                name={`${section.id}:eyebrow`}
                value={section.eyebrow ?? ""}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, eyebrow: event.target.value } : entry,
                    ),
                  )
                }
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <input
                name={`${section.id}:heading`}
                value={section.heading}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, heading: event.target.value } : entry,
                    ),
                  )
                }
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <textarea
                name={`${section.id}:body`}
                value={section.body}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, body: event.target.value } : entry,
                    ),
                  )
                }
                rows={4}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <input
                name={`${section.id}:ctaLabel`}
                value={section.ctaLabel ?? ""}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, ctaLabel: event.target.value } : entry,
                    ),
                  )
                }
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <input
                name={`${section.id}:ctaUrl`}
                value={section.ctaUrl ?? ""}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, ctaUrl: event.target.value } : entry,
                    ),
                  )
                }
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />

              {section.key === "featured-categories" ? (
                <div className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                  <p className="mb-3 text-sm text-white/60">Featured categories</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {activeCategories.map((category) => (
                      <label key={category.id} className="flex items-center gap-3 text-sm text-white/78">
                        <input
                          type="checkbox"
                          checked={(section.categorySlugs ?? []).includes(category.slug)}
                          onChange={() =>
                            setItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      categorySlugs: toggleValue(entry.categorySlugs ?? [], category.slug),
                                    }
                                  : entry,
                              ),
                            )
                          }
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {section.key === "featured-collections" ? (
                <div className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                  <p className="mb-3 text-sm text-white/60">Featured collections</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {collections.map((collection) => (
                      <label key={collection.id} className="flex items-center gap-3 text-sm text-white/78">
                        <input
                          type="checkbox"
                          checked={(section.collectionSlugs ?? []).includes(collection.slug)}
                          onChange={() =>
                            setItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      collectionSlugs: toggleValue(entry.collectionSlugs ?? [], collection.slug),
                                    }
                                  : entry,
                              ),
                            )
                          }
                        />
                        <span>{collection.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {section.key === "signature-stones" ? (
                <div className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                  <p className="mb-3 text-sm text-white/60">Featured products</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {products.filter((product) => product.status !== "trash").map((product) => (
                      <label key={product.id} className="flex items-center gap-3 text-sm text-white/78">
                        <input
                          type="checkbox"
                          checked={(section.productSlugs ?? []).includes(product.slug)}
                          onChange={() =>
                            setItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      productSlugs: toggleValue(entry.productSlugs ?? [], product.slug),
                                    }
                                  : entry,
                              ),
                            )
                          }
                        />
                        <span>{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
