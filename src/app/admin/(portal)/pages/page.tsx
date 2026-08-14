import { saveManagedPageAction } from "@/actions/admin";
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Content</p>
        <h1 className="text-display mt-3 text-5xl">Managed pages</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
          Maintain public brand and policy pages directly from the admin portal. Each route stays stable while titles,
          hero copy, SEO, media, and rich content remain editable.
        </p>
      </div>

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
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Hero image URL
                  <input
                    name="heroMedia"
                    defaultValue={page?.heroMedia ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
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

              <Button className="mt-6">Save page</Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
