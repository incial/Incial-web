import { loadBlogsData } from "@/lib/dataLoader";
import BlogsClient from "@/components/features/blogs/BlogsClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blogs",
  description: "Read the latest and most popular articles from the Incial team.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsPage() {
  const blogsData = loadBlogsData();
  // Banner comes only from the admin panel; no implicit fallback to a post image.
  const heroBanner = blogsData.heroBanner || undefined;

  return (
    <BlogsClient
      heroBanner={heroBanner}
      popularPosts={blogsData.popularPosts}
      newestPosts={blogsData.newestPosts}
    />
  );
}
