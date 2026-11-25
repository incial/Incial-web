import { notFound } from "next/navigation";
import { loadCaseStudiesData } from "@/lib/dataLoader";
import ClientWrapper from "./ClientWrapper";
import CaseStudyDetail from "@/components/features/case-studies/CaseStudyDetail";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const data = await loadCaseStudiesData();
  return data.cases
    .filter((c) => c.slug)
    .map((c) => ({
      slug: c.slug,
    }));
}

// Built ahead of time so opening a project is instant; saving in the admin panel refreshes these pages.

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadCaseStudiesData();
  const caseStudy = data.cases.find((c) => c.slug === slug);
  if (!caseStudy) return { title: "Case Study Not Found", robots: { index: false } };
  const image = caseStudy.heroImage || caseStudy.coverImage;
  const url = `/case-studies/${caseStudy.slug}`;
  return {
    title: caseStudy.title,
    description: caseStudy.heroQuote,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: caseStudy.title,
      description: caseStudy.heroQuote,
      images: image ? [{ url: image, alt: caseStudy.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.title,
      description: caseStudy.heroQuote,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadCaseStudiesData();
  const caseStudy = data.cases.find((c) => c.slug === slug);

  if (!caseStudy) notFound();

  // the neighbours, so the page can offer Previous and Next (wrapping around at the ends)
  const projects = data.cases.filter((c) => c.slug);
  const at = projects.findIndex((c) => c.slug === caseStudy.slug);
  const previous = projects.length > 1 ? projects[(at - 1 + projects.length) % projects.length] : undefined;
  const next = projects.length > 1 ? projects[(at + 1) % projects.length] : undefined;

  return (
    <ClientWrapper>
      <CaseStudyDetail
        study={caseStudy}
        previous={previous && { slug: previous.slug, title: previous.title }}
        next={next && { slug: next.slug, title: next.title }}
      />
    </ClientWrapper>
  );
}
