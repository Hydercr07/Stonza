import { listAdminJournalPosts } from "@/lib/data/store";

export default async function AdminJournalPage() {
  const posts = await listAdminJournalPosts();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Editorial</p>
        <h1 className="text-display mt-3 text-5xl">Journal</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
          Review all journal content currently available in the shared content repository, including drafts that are not visible on the public storefront.
        </p>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-medium text-white">{post.title}</p>
                <p className="mt-1 text-sm text-white/52">/{post.slug}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/52">
                {post.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/62">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
