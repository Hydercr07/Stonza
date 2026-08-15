import { deleteManagedPageAction, saveManagedPageAction } from "@/actions/admin";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { Button } from "@/components/shared/ui/button";
import { listManagedPages } from "@/lib/data/store";

const requiredPages = [
  { slug: "about", title: "About Us", route: "/about" },
  { slug: "contact", title: "Contact Us", route: "/contact" },
  { slug: "faq", title: "FAQ", route: "/faq" },
  { slug: "privacy-policy", title: "Privacy Policy", route: "/privacy-policy" },
  { slug: "terms-and-conditions", title: "Terms & Conditions", route: "/terms-and-conditions" },
  { slug: "shipping-and-returns", title: "Shipping Policy", route: "/shipping-and-returns" },
  { slug: "return-refund-policy", title: "Return / Refund Policy", route: "/return-refund-policy" },
  { slug: "authenticity", title: "Authenticity", route: "/authenticity" },
];

export default async function AdminPagesPage() {
  const existingPages = await listManagedPages();
  const pageMap = new Map(existingPages.map((page) => [page.slug, page]));
  const customPages = existingPages.filter((page) => !requiredPages.some((requiredPage) => requiredPage.slug === page.slug));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Content</p>
          <h1 className="text-display mt-3 text-5xl">Managed pages</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
          Maintain public brand and policy pages directly from the admin portal. Each route stays stable while titles,
          hero copy, SEO, media, and rich content remain editable.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/52">
          Add, edit, delete
        </span>
      </div>

      <form action={saveManagedPageAction} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Create</p>
            <h2 className="text-2xl text-white">New custom page</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/52">
            Draft
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Title
            <input
              name="title"
              placeholder="Bespoke Services"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Slug
            <input
              name="slug"
              placeholder="bespoke-services"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Hero heading
            <input
              name="heroHeading"
              placeholder="Tailored sourcing and private stone curation."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <div className="lg:col-span-2">
            <MediaUrlField
              name="heroMedia"
              label="Hero image"
              description="Optional banner or editorial image for the page hero."
              accept=".jpg,.jpeg,.png,.webp,.avif"
              imageOnly
            />
          </div>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Content
            <textarea
              name="content"
              rows={10}
              placeholder="<p>Write the page body here.</p>"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            SEO title
            <input
              name="seoTitle"
              placeholder="STONZA Bespoke Services"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Status
            <select
              name="status"
              defaultValue="draft"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Meta description
            <textarea
              name="seoDescription"
              rows={4}
              placeholder="Search description for the page."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Open Graph image
            <input
              name="openGraphImage"
              placeholder="/uploads/pages/bespoke-og.jpg"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
        </div>
        <Button className="mt-6">Create page</Button>
      </form>

      <div className="grid gap-5">
        {requiredPages.map((requiredPage) => {
          const page = pageMap.get(requiredPage.slug);

          return (
            <form
              key={requiredPage.slug}
              action={saveManagedPageAction}
              className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6"
            >
              <input type="hidden" name="id" value={page?.id ?? ""} />
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/45">{requiredPage.route}</p>
                  <h2 className="text-2xl text-white">{page?.title ?? requiredPage.title}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/52">
                  {page?.status ?? "draft"}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Title
                  <input
                    name="title"
                    defaultValue={page?.title ?? requiredPage.title}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Slug
                  <input
                    name="slug"
                    defaultValue={page?.slug ?? requiredPage.slug}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Hero heading
                  <input
                    name="heroHeading"
                    defaultValue={page?.heroHeading ?? requiredPage.title}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <div className="grid gap-2 text-sm lg:col-span-2">
                  <MediaUrlField
                    name="heroMedia"
                    label="Hero image"
                    description="Optional banner or editorial image for this page."
                    defaultValue={page?.heroMedia ?? ""}
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                    imageOnly
                  />
                </div>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Content
                  <textarea
                    name="content"
                    defaultValue={page?.content ?? "<p>Add page content here.</p>"}
                    rows={10}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  SEO title
                  <input
                    name="seoTitle"
                    defaultValue={page?.seoTitle ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Status
                  <select
                    name="status"
                    defaultValue={page?.status ?? "draft"}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Meta description
                  <textarea
                    name="seoDescription"
                    defaultValue={page?.seoDescription ?? ""}
                    rows={4}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Open Graph image
                  <input
                    name="openGraphImage"
                    defaultValue={page?.openGraphImage ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button>Save page</Button>
                {page ? (
                  <button
                    type="submit"
                    formAction={deleteManagedPageAction}
                    name="id"
                    value={page.id}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm text-white"
                  >
                    Delete page
                  </button>
                ) : null}
              </div>
            </form>
          );
        })}
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Additional routes</p>
          <h2 className="text-display mt-3 text-4xl">Custom pages</h2>
        </div>
        {customPages.length ? (
          customPages.map((page) => (
            <form
              key={page.id}
              action={saveManagedPageAction}
              className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6"
            >
              <input type="hidden" name="id" value={page.id} />
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/45">/{page.slug}</p>
                  <h3 className="text-2xl text-white">{page.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/52">
                  {page.status}
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Title
                  <input
                    name="title"
                    defaultValue={page.title}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Slug
                  <input
                    name="slug"
                    defaultValue={page.slug}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Hero heading
                  <input
                    name="heroHeading"
                    defaultValue={page.heroHeading}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <div className="lg:col-span-2">
                  <MediaUrlField
                    name="heroMedia"
                    label="Hero image"
                    description="Optional banner or editorial image for this page."
                    defaultValue={page.heroMedia ?? ""}
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                    imageOnly
                  />
                </div>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Content
                  <textarea
                    name="content"
                    defaultValue={page.content}
                    rows={10}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  SEO title
                  <input
                    name="seoTitle"
                    defaultValue={page.seoTitle ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Status
                  <select
                    name="status"
                    defaultValue={page.status}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Meta description
                  <textarea
                    name="seoDescription"
                    defaultValue={page.seoDescription ?? ""}
                    rows={4}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Open Graph image
                  <input
                    name="openGraphImage"
                    defaultValue={page.openGraphImage ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button>Save page</Button>
                <button
                  type="submit"
                  formAction={deleteManagedPageAction}
                  name="id"
                  value={page.id}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm text-white"
                >
                  Delete page
                </button>
              </div>
            </form>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6 text-sm text-white/60">
            No custom pages have been created yet.
          </div>
        )}
      </div>
    </div>
  );
}
