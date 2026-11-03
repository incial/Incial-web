import type { MetadataRoute } from "next";
import { loadBlogsData, loadCaseStudiesData } from "@/lib/dataLoader";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://incial.com";

const STATIC_ROUTES = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/services", priority: 0.8 },
  { path: "/products", priority: 0.7 },
  { path: "/case-studies", priority: 0.8 },
  { path: "/blogs", priority: 0.7 },
  { path: "/learn-together", priority: 0.6 },
  { path: "/careers", priority: 0.6 },
];

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority,
    }),
  );

  const blogs = loadBlogsData();
  const blogEntries: MetadataRoute.Sitemap = [
    ...blogs.popularPosts,
    ...blogs.newestPosts,
  ]
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${SITE_URL}/blogs/${post.slug}`,
      lastModified: parseDate(post.date) ?? now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const caseEntries: MetadataRoute.Sitemap = loadCaseStudiesData()
    .cases.filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE_URL}/case-studies/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticEntries, ...blogEntries, ...caseEntries];
}
