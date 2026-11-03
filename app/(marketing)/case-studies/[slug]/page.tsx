import { notFound } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import { loadCaseStudiesData } from "@/lib/dataLoader";
import ClientWrapper from "./ClientWrapper";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const data = loadCaseStudiesData();
  return data.cases
    .filter((c) => c.slug)
    .map((c) => ({
      slug: c.slug,
    }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = loadCaseStudiesData();
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
  const data = loadCaseStudiesData();
  const caseStudy = data.cases.find((c) => c.slug === slug);

  if (!caseStudy) notFound();

  return (
    <ClientWrapper>
      <main className="pt-32 pb-20">

        {/* Breadcrumb — desktop only */}
        <div className="hidden md:block mb-10 px-6 md:px-16 lg:px-24 xl:px-32 max-w-[1400px] mx-auto">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Work", href: "/case-studies" },
              { label: caseStudy.title },
            ]}
            variant="pill"
            size="base"
            animate={false}
          />
        </div>

        {/* Hero Section */}
        <section className="mb-10 md:mb-16 relative px-4 md:px-16 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            <div
              className="relative w-full overflow-hidden"
              style={{
                maxWidth: "1256px",
                height: "clamp(280px, 55vw, 320px)",
                borderRadius: "25px",
                margin: "0 auto",
              }}
            >
              {(caseStudy.heroImage || caseStudy.coverImage) ? (
                <Image
                  src={caseStudy.heroImage || caseStudy.coverImage || ""}
                  alt={caseStudy.title}
                  fill
                  sizes="(max-width: 1400px) 100vw, 1256px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-[#222]" />
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />

              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 lg:p-12">
                <h1
                  className="text-white max-w-3xl"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: 700,
                    fontSize: "clamp(18px, 4vw, 32px)",
                    lineHeight: "120%",
                    letterSpacing: "0%",
                  }}
                >
                  {caseStudy.title}
                </h1>

                <p
                  className="text-white italic"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: 400,
                    fontSize: "clamp(12px, 2.5vw, 18px)",
                    lineHeight: "140%",
                    letterSpacing: "0%",
                  }}
                >
                  &quot;{caseStudy.heroQuote}&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div
          className="px-5 md:px-8"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "50px",
          }}
        >
          {caseStudy.introduction && (
            <section className="max-w-[900px] mx-auto">
              <p
                className="text-gray-300"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "180%",
                  letterSpacing: "0%",
                }}
              >
                {caseStudy.introduction}
              </p>
            </section>
          )}

          <div className="max-w-[900px] mx-auto w-full space-y-12">
            {(caseStudy.sections || []).map(
              (
                section: { title?: string; content?: string },
                index: number,
              ) => (
                <section key={index}>
                  {section.title && (
                    <h2
                      className="text-white mb-3"
                      style={{
                        fontFamily: "Poppins",
                        fontWeight: 700,
                        fontSize: "18px",
                        lineHeight: "140%",
                      }}
                    >
                      {section.title}
                    </h2>
                  )}
                  {section.content && (
                    <p
                      className="text-gray-300"
                      style={{
                        fontFamily: "Poppins",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "180%",
                        letterSpacing: "0%",
                      }}
                    >
                      {section.content}
                    </p>
                  )}
                </section>
              ),
            )}
          </div>

          {(caseStudy.images || []).length > 0 && (
            <section
              aria-label={`${caseStudy.title} gallery`}
              className="max-w-[1100px] mx-auto w-full"
            >
              <h2
                className="text-white mb-5"
                style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "18px" }}
              >
                Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {(caseStudy.images || []).map((src, index) => (
                  <figure
                    key={`${src}-${index}`}
                    // A lone trailing image spans the full row instead of leaving a gap.
                    className={`relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[16/10] ${
                      index === (caseStudy.images || []).length - 1 &&
                      (caseStudy.images || []).length % 2 === 1
                        ? "sm:col-span-2 sm:aspect-[21/9]"
                        : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${caseStudy.title} — image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 550px"
                      className="object-cover"
                    />
                  </figure>
                ))}
              </div>
            </section>
          )}

          <section className="max-w-[900px] mx-auto">
            <p
              className="text-gray-300 italic"
              style={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "180%",
                letterSpacing: "0%",
              }}
            >
              At Incial, we don&apos;t just design logos or build websites; we craft
              digital platforms that define brands and make a real impact.
              Whether you&apos;re a startup or a global ecosystem, we&apos;re here to
              bring your vision into the digital world with creativity and
              impact.
            </p>
          </section>
        </div>
      </main>

      <div className="px-6 md:px-16 lg:px-24 xl:px-32 max-w-[1400px] mx-auto mt-20">
        <Footer />
      </div>
    </ClientWrapper>
  );
}