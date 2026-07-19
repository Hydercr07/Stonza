import { notFound } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getJournalPostBySlug } from "@/lib/data/store";

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Journal</p>
      <h1 className="text-display mt-4 max-w-4xl text-5xl text-white md:text-7xl">{post.heroHeading}</h1>
      <RichText html={post.content} className="prose prose-invert mt-8 max-w-3xl text-white/70" />
    </article>
  );
}
