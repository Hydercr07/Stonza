"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteProductAction,
  saveProductFormAction,
  transitionProductStatusAction,
} from "@/actions/admin";
import type {
  Category,
  Collection,
  Product,
  ProductSizeChart,
  ProductVariantOption,
} from "@/types/domain";
import { canTransitionProductStatus } from "@/lib/permissions";
import { Button } from "@/components/shared/ui/button";
import { AdminMediaUploader } from "@/components/admin/media-uploader";
import { UploadAwareSubmitButton } from "@/components/admin/upload-aware-submit-button";
import { UploadStatusProvider } from "@/components/admin/upload-status-context";
import { AdminBadge } from "@/components/admin/ui";

type ProductSpecification = NonNullable<Product["specifications"]>[number];

export function ProductForm({
  product,
  categories,
  collections,
}: {
  product?: Product | null;
  categories: Category[];
  collections: Collection[];
}) {
  const activeCategories = categories.filter((category) => !category.deletedAt && category.active && category.status === "published");
  const allParentCategories = activeCategories.filter((category) => !category.parentCategorySlug);
  const preferredParentCategories = allParentCategories.filter((category) => ["men", "women"].includes(category.slug));
  const parentCategories = preferredParentCategories.length ? preferredParentCategories : allParentCategories;
  const childCategories = activeCategories.filter((category) => category.parentCategorySlug);
  const hasCategories = activeCategories.length > 0;
  const hasCollections = collections.length > 0;
  const canSubmit = hasCategories;
  const [state, formAction] = useActionState(saveProductFormAction, { error: null });
  const [activeTab, setActiveTab] = useState<
    "general" | "media" | "pricing" | "inventory" | "description" | "seo" | "advanced"
  >("general");
  const [dirty, setDirty] = useState(false);
  const initialParentCategorySlug =
    parentCategories.find((category) => category.slug === product?.categorySlug)?.slug ??
    (product?.subcategorySlug
      ? childCategories.find((category) => category.slug === product.subcategorySlug)?.parentCategorySlug ?? ""
      : "");
  const [selectedParentCategorySlug, setSelectedParentCategorySlug] = useState(initialParentCategorySlug);
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState(product?.subcategorySlug ?? "");
  const [sizeChart, setSizeChart] = useState<ProductSizeChart>(
    product?.sizeChart ?? {
      title: "",
      notes: "",
      rows: (product?.sizes ?? []).map((size, index) => ({
        id: `size-row-${index + 1}`,
        sizeLabel: size,
        measurement: "",
        notes: "",
      })),
    },
  );
  const [variants, setVariants] = useState<ProductVariantOption[]>(product?.variants ?? []);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(product?.specifications ?? []);

  const childCategoryOptions = childCategories
    .filter((category) => category.parentCategorySlug === selectedParentCategorySlug)
    .map((category) => ({
      ...category,
      parentName: categories.find((entry) => entry.slug === category.parentCategorySlug)?.name ?? "Parent",
    }));

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const tabs = [
    { id: "general", label: "General" },
    { id: "media", label: "Media" },
    { id: "pricing", label: "Pricing" },
    { id: "inventory", label: "Inventory" },
    { id: "description", label: "Description" },
    { id: "seo", label: "SEO" },
    { id: "advanced", label: "Advanced" },
  ] as const;
  const panelClassName = (tabId: typeof tabs[number]["id"]) => (activeTab === tabId ? undefined : "hidden");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Product editor</p>
          <h1 className="text-display mt-3 text-5xl">{product ? product.name : "New product"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Manage catalogue data, storefront visibility, imagery, sizing, variants, pricing and SEO from one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminBadge tone="neutral">{product?.status ?? "draft"}</AdminBadge>
            {dirty ? <AdminBadge tone="warning">You have unsaved changes</AdminBadge> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          {product ? (
            <>
              {(() => {
                // This quick-toggle always targeted "draft" or "published"
                // regardless of the product's actual current status, so
                // clicking "Publish" on a "sold" or "trash" product (neither
                // of which can transition straight to "published") used to
                // throw an uncaught "Invalid product status transition"
                // error with no useActionState wrapper on this form. Only
                // render the toggle when the transition it would perform is
                // actually valid; a status the quick-toggle can't reach
                // (sold, trash) still has the full status dropdown in the
                // save form below.
                const target = product.status === "published" ? "draft" : "published";
                if (!canTransitionProductStatus(product.status, target)) return null;
                return (
                  <form action={transitionProductStatusAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="status" value={target} />
                    <Button variant="outline">{product.status === "published" ? "Unpublish" : "Publish"}</Button>
                  </form>
                );
              })()}
              <form action={transitionProductStatusAction}>
                <input type="hidden" name="id" value={product.id} />
                <input
                  type="hidden"
                  name="status"
                  value={product.status === "archived" ? "published" : "archived"}
                />
                <Button variant="outline">{product.status === "archived" ? "Restore" : "Archive"}</Button>
              </form>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <Button variant="outline">Delete product</Button>
              </form>
            </>
          ) : null}
        </div>
      </div>
      {!canSubmit ? (
        <div className="rounded-[1.25rem] border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {!hasCategories ? "Create at least one active category in the admin portal before publishing a product." : null}
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-[1.25rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-[#e7dfd1] bg-[#fffdfa] p-3 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              activeTab === tab.id
                ? "border border-[#dcc8a5] bg-[#f7f0e4] text-[#171717]"
                : "text-[#6f6558] hover:bg-[#f6f1e8] hover:text-[#171717]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <UploadStatusProvider>
      <form
        action={formAction}
        onChangeCapture={() => setDirty(true)}
        onReset={() => setDirty(false)}
        className="space-y-6"
      >
        <input type="hidden" name="id" defaultValue={product?.id} />
        <input
          type="hidden"
          name="sizeChartData"
          value={
            sizeChart.title.trim() ||
            sizeChart.notes?.trim() ||
            sizeChart.rows.some((row) => row.sizeLabel || row.measurement || row.notes)
              ? JSON.stringify(sizeChart)
              : ""
          }
        />
        <input
          type="hidden"
          name="variantsData"
          value={variants.length ? JSON.stringify(variants) : ""}
        />
        <input
          type="hidden"
          name="specificationsData"
          value={specifications.length ? JSON.stringify(specifications) : ""}
        />
        <div className={panelClassName("general")}>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <label className="grid gap-2 text-sm">
              Title
              <input
                name="name"
                defaultValue={product?.name}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Auto slug
              <input
                name="slug"
                defaultValue={product?.slug}
                placeholder="Leave blank to generate from the title"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              SKU
              <input
                name="sku"
                defaultValue={product?.sku}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Short description
              <textarea
                name="shortDescription"
                defaultValue={product?.shortDescription}
                rows={4}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Full description
              <textarea
                name="description"
                defaultValue={product?.description}
                rows={8}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            </div>
            <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Visibility
                  <select
                    name="visibility"
                    defaultValue={product?.visibility ?? "visible"}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="visible">Visible on storefront</option>
                    <option value="hidden">Hidden from storefront</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Status
                  <select
                    name="status"
                    defaultValue={product?.status ?? "draft"}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="reserved">Reserved</option>
                    <option value="out_of_stock">Out of stock</option>
                    <option value="sold">Sold</option>
                    <option value="archived">Archived</option>
                    <option value="trash">Trash</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3">
                <p className="text-sm font-medium text-white">Category hierarchy</p>
                <label className="grid gap-2 text-sm">
                  Main category
                  <select
                    name="mainCategorySlug"
                    value={selectedParentCategorySlug}
                    onChange={(event) => {
                      setSelectedParentCategorySlug(event.target.value);
                      setSelectedSubcategorySlug("");
                    }}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="">Select main category</option>
                    {parentCategories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                Subcategory
                <select
                  name="subcategorySlug"
                  value={selectedSubcategorySlug}
                  onChange={(event) => setSelectedSubcategorySlug(event.target.value)}
                  disabled={!selectedParentCategorySlug}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <option value="">No subcategory</option>
                  {childCategoryOptions.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.parentName} / {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                Collection
                {hasCollections ? (
                  <select
                    name="collectionSlug"
                    defaultValue={product?.collectionSlug ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="">No collection</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.slug}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input type="hidden" name="collectionSlug" value="" />
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/55">
                      No collections yet. This product can be saved without a collection.
                    </div>
                  </>
                )}
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="newArrival" defaultChecked={product?.newArrival} /> New arrival
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={panelClassName("media")}>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <AdminMediaUploader
              name="media"
              label="Product gallery"
              description="Upload multiple product images, reorder them, and choose the featured image for cards and the PDP."
              initialItems={product?.media}
            />
          </div>
        </div>

        <div className={panelClassName("pricing")}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Price
              <input
                name="price"
                type="number"
                defaultValue={product?.price ?? 0}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Sale price
              <input
                name="salePrice"
                type="number"
                defaultValue={product?.salePrice ?? ""}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            </div>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <p className="text-sm leading-7 text-white/58">
                Use compare pricing by keeping a higher regular price and a lower sale price. Leave sale price empty to
                remove the markdown.
              </p>
            </div>
          </div>
        </div>

        <div className={panelClassName("inventory")}>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Inventory
                  <input
                    name="inventoryQuantity"
                    type="number"
                    defaultValue={product?.inventoryQuantity ?? 1}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Sizes
                  <input
                    name="sizes"
                    defaultValue={product?.sizes?.join(", ") ?? ""}
                    placeholder="e.g. 6, 7, 8"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                Variant label
                <input
                  name="variantLabel"
                  defaultValue={product?.variantLabel ?? ""}
                  placeholder="e.g. Finish, Stone tone, Metal"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>
            </div>
            <div className="grid gap-6">
              <div className="grid gap-2 text-sm">
            <span>Size chart</span>
            <div className="space-y-4 rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
              <input
                value={sizeChart.title}
                onChange={(event) => setSizeChart((current) => ({ ...current, title: event.target.value }))}
                placeholder="Chart title"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <textarea
                value={sizeChart.notes ?? ""}
                onChange={(event) => setSizeChart((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                placeholder="Sizing notes, fit guidance, or measurement instructions."
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <div className="space-y-3">
                {sizeChart.rows.map((row) => (
                  <div key={row.id} className="grid gap-3 rounded-[1.1rem] border border-white/8 bg-black/15 p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={row.sizeLabel}
                        onChange={(event) =>
                          setSizeChart((current) => ({
                            ...current,
                            rows: current.rows.map((entry) =>
                              entry.id === row.id ? { ...entry, sizeLabel: event.target.value } : entry,
                            ),
                          }))
                        }
                        placeholder="Size label"
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      />
                      <input
                        value={row.measurement}
                        onChange={(event) =>
                          setSizeChart((current) => ({
                            ...current,
                            rows: current.rows.map((entry) =>
                              entry.id === row.id ? { ...entry, measurement: event.target.value } : entry,
                            ),
                          }))
                        }
                        placeholder="Measurement"
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        value={row.notes ?? ""}
                        onChange={(event) =>
                          setSizeChart((current) => ({
                            ...current,
                            rows: current.rows.map((entry) =>
                              entry.id === row.id ? { ...entry, notes: event.target.value } : entry,
                            ),
                          }))
                        }
                        placeholder="Optional notes"
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setSizeChart((current) => ({
                            ...current,
                            rows: current.rows.filter((entry) => entry.id !== row.id),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSizeChart((current) => ({
                    ...current,
                    rows: [
                      ...current.rows,
                      {
                        id: `size-row-${crypto.randomUUID()}`,
                        sizeLabel: "",
                        measurement: "",
                        notes: "",
                      },
                    ],
                  }))
                }
              >
                Add size row
              </Button>
            </div>
              </div>
              <div className="space-y-4 rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
            <div>
              <p className="text-sm font-medium text-white">Variant options</p>
              <p className="mt-2 text-xs leading-6 text-white/45">
                Add selectable options that should travel through cart, checkout, confirmation, and admin orders.
              </p>
            </div>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id} className="grid gap-3 rounded-[1.1rem] border border-white/8 bg-black/15 p-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={variant.value}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, value: event.target.value } : entry,
                        ),
                      )
                    }
                    placeholder="Option value"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={variant.active}
                      onChange={(event) =>
                        setVariants((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, active: event.target.checked } : entry,
                          ),
                        )
                      }
                    />
                    Active option
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVariants((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setVariants((current) => [
                  ...current,
                  {
                    id: `variant-${crypto.randomUUID()}`,
                    value: "",
                    active: true,
                  },
                ])
              }
            >
              Add variant
            </Button>
          </div>
            </div>
          </div>
        </div>

        <div className={panelClassName("description")}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <div>
                <p className="text-sm font-medium text-white">Specifications</p>
                <p className="mt-2 text-xs leading-6 text-white/45">
                  Add product details like material, setting, finish, dimensions, or provenance notes.
                </p>
              </div>
              <div className="space-y-3">
                {specifications.map((specification, index) => (
                  <div key={`${specification.label}-${index}`} className="grid gap-3 rounded-[1.1rem] border border-white/8 bg-black/15 p-3 md:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={specification.label}
                      onChange={(event) =>
                        setSpecifications((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, label: event.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Label"
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    />
                    <input
                      value={specification.value}
                      onChange={(event) =>
                        setSpecifications((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, value: event.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Value"
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSpecifications((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSpecifications((current) => [...current, { label: "", value: "" }])}
              >
                Add specification
              </Button>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6 text-sm leading-7 text-white/58">
              Use this area for richer product storytelling, care notes, provenance detail, or merchandising notes that
              should appear on the product page.
            </div>
          </div>
        </div>

        <div className={panelClassName("seo")}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <label className="grid gap-2 text-sm">
                SEO title
                <input
                  name="seoTitle"
                  defaultValue={product?.seoTitle ?? ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Meta description
                <textarea
                  name="seoDescription"
                  defaultValue={product?.seoDescription ?? ""}
                  rows={4}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Open Graph image
                <input
                  name="openGraphImage"
                  defaultValue={product?.openGraphImage ?? product?.featuredImage ?? ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6 text-sm leading-7 text-white/58">
              Keep titles concise, describe the stone naturally, and use a polished featured image for sharing.
            </div>
          </div>
        </div>

        <div className={panelClassName("advanced")}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <label className="grid gap-2 text-sm">
                Stone type
                <input
                  name="stoneType"
                  defaultValue={product?.stoneType ?? ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Origin
                <input
                  name="origin"
                  defaultValue={product?.origin ?? ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="allowCartPurchase" defaultChecked={product?.allowCartPurchase ?? true} />
                Allow cart purchase
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="allowEnquiry" defaultChecked={product?.allowEnquiry ?? true} /> Allow enquiry
              </label>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6 text-sm leading-7 text-white/58">
              Advanced controls stay tucked away here so everyday catalog editing stays calm and focused.
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-[#111213] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
          <p className="text-sm text-white/65">
            {dirty ? "You have unsaved changes." : "All changes saved or unchanged."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="reset" variant="outline">
              Discard
            </Button>
            <UploadAwareSubmitButton disabled={!canSubmit}>
              Save product
            </UploadAwareSubmitButton>
          </div>
        </div>
      </form>
      </UploadStatusProvider>
    </div>
  );
}
