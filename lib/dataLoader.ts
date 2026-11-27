import { requireContent } from "./contentStore";
import { normalizeImageUrl, pickImage } from "./imageUtils";

export { normalizeImageUrl };

// Content comes from the shared content store (the database, falling back to data/*.json).

export async function loadBlogsData(): Promise<BlogsData> {
  const data = await requireContent<BlogsData>("blogs");
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

export async function loadBlogBySlug(slug: string): Promise<BlogPost | null> {
  const data = await loadBlogsData();
  const all = [...data.popularPosts, ...data.newestPosts];
  return all.find((p) => p.slug === slug) ?? null;
}

export async function loadAboutData(): Promise<AboutData> {
  const data = await requireContent<AboutData>("about");
  return {
    ...data,
    heroBanner: normalizeImageUrl(data.heroBanner),
    brandImage: normalizeImageUrl(data.brandImage),
    impactImage: normalizeImageUrl(data.impactImage),
    teamMembers: (data.teamMembers || []).map((m) => ({
      ...m,
      img: normalizeImageUrl(m.img),
    })),
    awards: (data.awards || []).map((a) => ({
      ...a,
      icon: normalizeImageUrl(a.icon),
    })),
  };
}

export async function loadCaseStudiesData(): Promise<CaseStudiesData> {
  const data = await requireContent<CaseStudiesData>("casestudies");
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

/** Where a client is based; drives the connection lines on the world map. */
export interface ClientLocation {
  label: string;
  lat: number;
  lng: number;
}

export interface Client {
  id: string;
  name: string;
  src: string;
  location?: ClientLocation;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
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
  eyebrow?: string;
  title: string;
  subtitle?: string;
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
  category?: string;
  tags?: string[];
  /** What the banner shows: the image (default) or the video. */
  mediaType?: "image" | "video";
  /** Video for the banner; `image` is then its poster. */
  video?: string;
  featured?: boolean;
  available?: boolean;
}

export interface ProductsData {
  products: Product[];
}

// ── LearnTogether (edited at /admin/learntogether, read by the /learn-together page) ──

/** A photo in the Polaroid gallery. */
export interface LearnTogetherPhoto {
  id: string;
  img: string;
  caption: string;
}

/** A past workshop, meetup or session. */
export interface LearnTogetherEvent {
  id: string;
  title: string;
  /** As it should read on the page, for example "March 2026". */
  date: string;
  location: string;
  summary: string;
  img: string;
}

export interface LearnTogetherTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  img: string;
}

export interface LearnTogetherCommunity {
  title: string;
  text: string;
  buttonLabel: string;
  /** A page on this site ("/...") or an https:// link, for example a WhatsApp or Discord invite. */
  url: string;
}

/** How the testimonials are shown: a group chat, two sliding rows, or one big quote at a time. */
export type LearnTogetherTestimonialLayout = "chat" | "marquee" | "spotlight";

export interface LearnTogetherData {
  stats: Stat[];
  gallery: LearnTogetherPhoto[];
  events: LearnTogetherEvent[];
  testimonials: LearnTogetherTestimonial[];
  community: LearnTogetherCommunity;
  testimonialLayout: LearnTogetherTestimonialLayout;
}
