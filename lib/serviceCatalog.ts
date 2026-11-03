export interface ServiceCategory {
  id: string;
  headline: string;
  tagline: string;
  description: string;
  services: ReadonlyArray<string>;
}

export const SERVICE_CATEGORIES: ReadonlyArray<ServiceCategory> = [
  {
    id: "branding-marketing",
    headline: "Branding & Marketing",
    tagline: "that makes you unforgettable",
    description:
      "From identity to growth: we shape how your brand looks, sounds and performs in the market.",
    services: [
      "Digital Media Management",
      "SEO",
      "Digital Ads",
      "Digital Marketing",
    ],
  },
  {
    id: "technology",
    headline: "Technology",
    tagline: "that scales with your ambition",
    description:
      "Design and engineering that turn ideas into polished digital products and visuals.",
    services: ["Website Design (UI/UX)", "VFX & CGI", "Product"],
  },
  {
    id: "experience-design",
    headline: "Experience Design",
    tagline: "that keeps audiences coming back",
    description:
      "Creative, community and reputation work that makes every touchpoint feel considered.",
    services: ["Creative Design", "Social Media Management", "Public Relations"],
  },
];
