import { loadBlogBySlug, loadBlogsData } from "@/lib/dataLoader";
import BlogPostClient from "@/components/features/blogs/BlogPostClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = loadBlogBySlug(slug);
  if (!post) return { title: "Blog", robots: { index: false } };
  const description = `Read "${post.title}" by ${post.author} — ${post.mins} min read.`;
  const url = `/blogs/${post.slug}`;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      authors: [post.author],
      images: post.image ? [{ url: post.image, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = loadBlogBySlug(slug);

  if (!post) notFound();

  // Build related posts: same category, exclude current
  const data = loadBlogsData();
  const pool =
    post.category === "popular" ? data.popularPosts : data.newestPosts;
  const relatedPosts = pool.filter((p) => p.slug !== slug).slice(0, 3);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}
