import Link from "next/link";
import type { Metadata } from "next";
import { listJournalPosts } from "@/lib/data/store";

export const metadata: Metadata = {
  title: "Journal",
  description: "Field notes on gemstones, provenance, and craftsmanship from STONZA.",
  alternates: { canonical: "/journal" },
};

export default async function JournalPage() {
  const posts = await listJournalPosts();

  return (
    <section className="container-shell page-section">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Journal</p>
        <h1 className="page-title text-[#171717]">Field notes from stone, light and provenance.</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/journal/${post.slug}`} className="stone-panel rounded-[1.75rem] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-black/42">{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            <h2 className="section-title mt-3 text-[#171717]">{post.title}</h2>
            <p className="mt-4 text-sm leading-7 text-black/62">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
