import { deleteJournalPostAction, saveJournalPostAction } from "@/actions/admin";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { Button } from "@/components/shared/ui/button";
import { listAdminJournalPosts } from "@/lib/data/store";

function formatDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default async function AdminJournalPage() {
  const posts = await listAdminJournalPosts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Editorial</p>
          <h1 className="text-display mt-3 text-5xl">Journal</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
            Create new editorial stories, update published entries, and remove outdated drafts from the public journal.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/52">
          Add, edit, delete
        </span>
      </div>

      <form action={saveJournalPostAction} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Create</p>
            <h2 className="text-2xl text-white">New journal post</h2>
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
              placeholder="Inside the stone atelier"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Slug
            <input
              name="slug"
              placeholder="inside-the-stone-atelier"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Excerpt
            <textarea
              name="excerpt"
              rows={3}
              placeholder="Short editorial summary for the journal card."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Hero heading
            <input
              name="heroHeading"
              placeholder="Craft, provenance and quiet rarity."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <div className="lg:col-span-2">
            <MediaUrlField
              name="heroMedia"
              label="Hero image"
              description="Optional cover image for the journal entry."
              accept=".jpg,.jpeg,.png,.webp,.avif"
              imageOnly
            />
          </div>
          <label className="grid gap-2 text-sm">
            Publish date
            <input
              type="datetime-local"
              name="publishedAt"
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
            Content
            <textarea
              name="content"
              rows={12}
              placeholder="<p>Write the journal story here.</p>"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            SEO title
            <input
              name="seoTitle"
              placeholder="STONZA Journal"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Open Graph image
            <input
              name="openGraphImage"
              placeholder="/uploads/journal/cover.jpg"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm lg:col-span-2">
            Meta description
            <textarea
              name="seoDescription"
              rows={4}
              placeholder="Search description for the journal entry."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
        </div>
        <Button className="mt-6">Create post</Button>
      </form>

      <div className="grid gap-4">
        {posts.length ? (
          posts.map((post) => (
            <form key={post.id} action={saveJournalPostAction} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
              <input type="hidden" name="id" value={post.id} />
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-medium text-white">{post.title}</p>
                  <p className="mt-1 text-sm text-white/52">/journal/{post.slug}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/52">
                  {post.status}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Title
                  <input
                    name="title"
                    defaultValue={post.title}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Slug
                  <input
                    name="slug"
                    defaultValue={post.slug}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Excerpt
                  <textarea
                    name="excerpt"
                    defaultValue={post.excerpt}
                    rows={3}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Hero heading
                  <input
                    name="heroHeading"
                    defaultValue={post.heroHeading}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <div className="lg:col-span-2">
                  <MediaUrlField
                    name="heroMedia"
                    label="Hero image"
                    description="Optional cover image for the journal entry."
                    defaultValue={post.heroMedia ?? ""}
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                    imageOnly
                  />
                </div>
                <label className="grid gap-2 text-sm">
                  Publish date
                  <input
                    type="datetime-local"
                    name="publishedAt"
                    defaultValue={formatDateTimeLocal(post.publishedAt)}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Status
                  <select
                    name="status"
                    defaultValue={post.status}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Content
                  <textarea
                    name="content"
                    defaultValue={post.content}
                    rows={12}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  SEO title
                  <input
                    name="seoTitle"
                    defaultValue={post.seoTitle ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Open Graph image
                  <input
                    name="openGraphImage"
                    defaultValue={post.openGraphImage ?? ""}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm lg:col-span-2">
                  Meta description
                  <textarea
                    name="seoDescription"
                    defaultValue={post.seoDescription ?? ""}
                    rows={4}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button>Save post</Button>
                <button
                  type="submit"
                  formAction={deleteJournalPostAction}
                  name="id"
                  value={post.id}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm text-white"
                >
                  Delete post
                </button>
              </div>
            </form>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-6 text-white/68">
            No journal posts have been created yet.
          </div>
        )}
      </div>
    </div>
  );
}
