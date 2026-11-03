import type { Metadata } from "next";
import { loadCaseStudiesData } from "@/lib/dataLoader";
import CaseStudiesClient from "./CaseStudiesClient";

// Always read the latest admin-saved data so images match the backend.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Predefined banner used until one is uploaded in the admin panel.
const DEFAULT_BANNER = "/images/case1.webp";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Explore Incial's case studies — real brands, real challenges and the digital solutions that made an impact.",
  alternates: { canonical: "/case-studies" },
  openGraph: { title: "Case Studies", url: "/case-studies" },
};

export default function CaseStudiesPage() {
  const data = loadCaseStudiesData();
  const caseStudies = data.cases.filter((c) => c.slug);

  return (
    <CaseStudiesClient
      caseStudies={caseStudies}
      heroBanner={data.heroBanner || DEFAULT_BANNER}
    />
  );
}
