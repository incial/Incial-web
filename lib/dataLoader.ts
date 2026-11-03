import fs from "fs";
import path from "path";
import { normalizeImageUrl, pickImage } from "./imageUtils";

export { normalizeImageUrl };

function readData<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function loadBlogsData(): BlogsData {
  const data = readData<BlogsData>("blogs.json");
  const normalizePost = (p: BlogPost): BlogPost => ({
    ...p,
    image: normalizeImageUrl(p.image),
    coverImage: normalizeImageUrl(p.coverImage),
    heroImage: normalizeImageUrl(p.heroImage),
    images: (p.images || []).map(normalizeImageUrl),
  });
  return {
    heroBanner: normalizeImageUrl(data.heroBanner),
    popularPosts: (data.popularPosts || []).map(normalizePost),
    newestPosts: (data.newestPosts || []).map(normalizePost),
  };
}

export function loadBlogBySlug(slug: string): BlogPost | null {
  const data = loadBlogsData();
  const all = [...data.popularPosts, ...data.newestPosts];
  return all.find((p) => p.slug === slug) ?? null;
}

export function loadCaseStudiesData(): CaseStudiesData {
  const data = readData<CaseStudiesData>("casestudies.json");
  return {
    heroBanner: normalizeImageUrl(data.heroBanner),
    cases: (data.cases || []).map((c) => ({
      ...c,
      // Thumbnail and hero fall back to each other so a leftover placeholder
      // in one field never hides the real image set in the other.
      coverImage: pickImage(c.coverImage, c.heroImage),
      heroImage: pickImage(c.heroImage, c.coverImage),
      images: (c.images || []).map(normalizeImageUrl).filter(Boolean),
    })),
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  img: string;
  objectPos: string;
}

export interface Award {
  id: string;
  name: string;
  description: string;
  year: string;
  icon: string;
}

export interface AboutData {
  storyTitle: string;
  storyText: string;
  purposeTitle: string;
  purposeText: string;
  teamTitle: string;
  teamSubtitle: string;
  teamMembers: TeamMember[];
  awardsTitle: string;
  awardsSubtitle: string;
  awards: Award[];
  brandTitle: string;
  brandText: string;
  impactTitle: string;
  impactText: string;
  heroBanner: string;
  brandImage: string;
  impactImage: string;
}

export interface Client {
  id: string;
  name: string;
  src: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
}

export interface ClientsData {
  headerText: string;
  clients: Client[];
  testimonials: Testimonial[];
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface TrustData {
  title: string;
  stats: Stat[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  author: string;
  mins: number;
  date: string;
  image: string;
  coverImage?: string;
  heroImage?: string;
  images?: string[];
  category: string;
  content?: string;
}

export interface BlogsData {
  heroBanner?: string;
  popularPosts: BlogPost[];
  newestPosts: BlogPost[];
}

export interface ServiceSlide {
  headline: string;
  subheadline: string;
  description: string;
  services: string[];
}

export interface ServicesData {
  introTitle: string;
  introSubtitle: string;
  branding: ServiceSlide;
  technology: ServiceSlide;
  experience: ServiceSlide;
}

export interface CaseStudy {
  id?: string;
  slug: string;
  title: string;
  category: string;
  heroQuote: string;
  heroImage: string;
  coverImage?: string;
  /** Extra gallery pictures shown on the case study page. */
  images?: string[];
  introduction: string;
  sections: {
    title: string;
    content: string;
  }[];
  location?: string;
  featured?: boolean;
  tags?: string[];
  summary?: string;
  challenge?: string;
  solution?: string;
  result?: string;
  year?: string;
  client?: string;
}

export interface CaseStudiesData {
  heroBanner?: string;
  cases: CaseStudy[];
}

export interface SectionConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export interface SectionsConfig {
  sections: SectionConfig[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  description: string | string[];
  tryUrl: string;
  featured?: boolean;
  available?: boolean;
}

export interface ProductsData {
  products: Product[];
}
