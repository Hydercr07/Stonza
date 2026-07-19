import Link from "next/link";
import {
  duplicateCategoryAction,
  saveCategoryAction,
  transitionCategoryStatusAction,
} from "@/actions/admin";
import { AdminMediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/shared/ui/button";
import type { Category } from "@/types/domain";

function singleMedia(categoryImage?: string, altText?: string) {
  if (!categoryImage) return [];
  return [
    {
      id: `category-media-${categoryImage}`,
      url: categoryImage,
      altText: altText || "STONZA category image",
      fileName: categoryImage.split("/").pop() || "image",
      size: 0,
      featured: true,
      sortOrder: 1,
    },
  ];
}

export function CategoryForm({
  category,
  categories,
}: {
  category?: Category | null;
  categories: Category[];
}) {
  const parentOptions = categories.filter((entry) => entry.id !== category?.id && !entry.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Category manager</p>
          <h1 className="text-display mt-3 text-5xl">{category ? category.name : "New category"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Control category imagery, publishing, hierarchy and storefront visibility from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/categories">Back to categories</Link>
          </Button>
          {category ? (
            <>
              <form action={duplicateCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <Button variant="outline">Duplicate</Button>
              </form>
              {category.status === "published" ? (
                <form action={transitionCategoryStatusAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="status" value="archived" />
                  <Button variant="outline">Archive</Button>
                </form>
              ) : category.status === "archived" ? (
                <form action={transitionCategoryStatusAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="status" value="published" />
                  <Button variant="outline">Restore</Button>
                </form>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <form action={saveCategoryAction} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <input type="hidden" name="id" defaultValue={category?.id} />
        <div className="space-y-6">
          <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <label className="grid gap-2 text-sm">
              Name
              <input name="name" defaultValue={category?.name} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm">
              Slug
              <input name="slug" defaultValue={category?.slug} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm">
              Short description
              <textarea
                name="shortDescription"
                defaultValue={category?.shortDescription}
                rows={3}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Full description
              <textarea
                name="description"
                defaultValue={category?.description}
                rows={6}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Alt text
              <input name="altText" defaultValue={category?.altText} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm">
              Parent category
              <select
                name="parentCategorySlug"
                defaultValue={category?.parentCategorySlug ?? ""}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <option value="">No parent</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="space-y-6 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <AdminMediaUploader
              name="featuredMedia"
              label="Featured image"
              description="Primary category image used on cards and section previews."
              initialItems={singleMedia(category?.featuredImage, category?.altText)}
            />
            <AdminMediaUploader
              name="heroMedia"
              label="Hero image"
              description="Desktop banner or hero image for editorial category moments."
              initialItems={singleMedia(category?.heroImage, category?.altText)}
            />
            <AdminMediaUploader
              name="mobileMedia"
              label="Mobile image"
              description="Optional mobile-specific crop for small screens."
              initialItems={singleMedia(category?.mobileImage, category?.altText)}
            />
          </div>
        </div>
        <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <label className="grid gap-2 text-sm">
            Optional video
            <input name="video" defaultValue={category?.video} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Sort order
            <input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? categories.length + 1} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Status
            <select name="status" defaultValue={category?.status ?? "draft"} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="trash">Trash</option>
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={category?.active ?? true} /> Active</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="featured" defaultChecked={category?.featured} /> Featured</label>
          <label className="grid gap-2 text-sm">
            SEO title
            <input name="seoTitle" defaultValue={category?.seoTitle} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            SEO description
            <textarea name="seoDescription" defaultValue={category?.seoDescription} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Open Graph image
            <input name="openGraphImage" defaultValue={category?.openGraphImage ?? category?.featuredImage} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <Button className="w-full">Save category</Button>
        </div>
      </form>
    </div>
  );
}
