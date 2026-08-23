import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getJournalPostBySlug } from "@/lib/data/store";
import { articleJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const image = post.openGraphImage || post.heroMedia || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { title, description, images: image ? [image] : undefined, type: "article" },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-shell page-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }}
      />
      <p className="text-xs uppercase tracking-[0.3em] text-[#a2845d]">Journal</p>
      <h1 className="page-title mt-4 max-w-4xl text-[#171717]">{post.heroHeading}</h1>
      <RichText
        html={post.content}
        className="prose-copy mt-8 max-w-3xl [&_h2]:text-display [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-[#171717] [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_a]:text-[#a2845d] [&_a]:underline"
      />
    </article>
  );
}
