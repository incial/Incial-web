"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import MenuFrame from "@/components/layout/MenuFrame";
import Footer from "@/components/layout/Footer";
import ShaderHero from "@/components/ui/ShaderHero";
import StretchHeading from "@/components/features/products/StretchHeading";
import type { AboutData, TeamMember } from "@/lib/dataLoader";
import { fetchCachedJson } from "@/lib/publicCache";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

const FALLBACK_HERO = "/images/about/Team-Photo.webp";
const FALLBACK_BRAND = "/images/about/imgBrand.webp";
const FALLBACK_IMPACT = "/images/about/imgImpact.webp";

const DEFAULT_STORY_TITLE = "Our Story";
const DEFAULT_STORY_TEXT =
  "Incial began with a simple vision: to empower brands, businesses, and ideas with innovative digital solutions that create lasting impact. Founded in 2024 in Kanjirappally, Kerala, we started as a small team of passionate creators and strategists determined to make a difference.";

const DEFAULT_PURPOSE_TITLE = "Our Purpose";
const DEFAULT_PURPOSE_TEXT =
  "Our purpose is clear: to build brands that resonate, businesses that grow, and beyond that, to innovate continuously. We align strategy with creativity, technology with human connection, and ideas with measurable results.";

const DEFAULT_TEAM_TITLE = "Meet Our Team";
const DEFAULT_TEAM_SUBTITLE =
  "Behind every project is a team of talented professionals — creatives, marketers, designers, and technologists — united by passion and expertise. Together, we bring ideas to life and transform challenges into opportunities.";

const DEFAULT_AWARDS_TITLE = "Awards & Recognitions";
const DEFAULT_AWARDS_SUBTITLE =
  "Over the years, Incial has been proud to receive industry awards and recognitions that celebrate our commitment to excellence, innovation, and client success. These honors inspire us to continuously raise the bar.";

const DEFAULT_BRAND_TITLE = "Our Brand";
const DEFAULT_IMPACT_TITLE = "Our Impact";
const DEFAULT_BRAND_TEXT =
  "At Incial, our brand echoes our values: authentic, innovative, and trusted. We believe in transparency, empathy, and delivering beyond expectations. Every interaction is a chance to build lasting relationships.";
const DEFAULT_IMPACT_TEXT =
  "Every project is a story of growth, transformation, and measurable success. We take pride in helping clients achieve goals, enhance visibility, and create memorable digital experiences.";

const PILL_BADGE =
  "inline-flex items-center rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/60";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-[#151716] px-6 py-3 text-[13px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9f8]";

const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-black/15 bg-white px-6 py-3 text-[13px] font-medium text-[#151716] transition-all duration-300 hover:border-black/35 hover:bg-black/[0.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9f8]";

interface AboutSectionProps {
  initialData?: AboutData;
  onBack?: () => void;
  onComplete?: () => void;
}

function Crosshair({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none select-none text-lg leading-none text-[#56A6FF] ${className}`}
    >
      +
    </span>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-4 text-2xl font-normal tracking-[-0.02em] text-[#151716] md:text-3xl">
      <span className="h-px w-10 bg-black/30" aria-hidden />
      {children}
    </h2>
  );
}

function AwardMedalSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-8 w-8 text-[#56A6FF]"
      aria-hidden
    >
      <circle
        cx="12"
        cy="9"
        r="6"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="9" r="2.4" fill="#FFFFFF" />
      <path
        d="M8.5 14.2L7 21L12 18.5L17 21L15.5 14.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  if (immediate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function TeamMemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const hasSrc = Boolean(member.img && member.img.trim() !== "");
  const showFallback = !hasSrc || imgError;
  const initials = getInitials(member.name || "");

  return (
    <Reveal
      delay={(index % 3) * 0.06}
      immediate={index >= 6}
      className="group relative flex flex-col border-b border-r border-black/15 transition-colors hover:bg-black/[0.02]"
    >
      <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />

      <div className="flex items-center justify-center p-8 sm:p-10">
        <div className="relative h-[188px] w-[166px] overflow-hidden rounded-[84px] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:-translate-y-1 sm:h-[248px] sm:w-[220px] sm:rounded-[112px]">
          {showFallback ? (
            <div className="absolute inset-0 flex items-end justify-center bg-[#181a19] pb-4 sm:pb-6">
              <div
                aria-hidden
                className="absolute bottom-0 left-0 h-[90%] w-full rounded-full bg-[#2a2c2b] transition-colors duration-300 group-hover:bg-[#323534]"
              />
              <span
                className="relative z-10 select-none font-bold leading-none text-white/60 transition-colors duration-300 group-hover:text-white/80"
                style={{ fontSize: "clamp(28px, 6vw, 44px)" }}
              >
                {initials}
              </span>
            </div>
          ) : (
            <>
              <div
                aria-hidden
                className="absolute bottom-0 left-0 h-[90%] w-full rounded-full bg-[#d5d5d5]"
              />
              <Image
                src={member.img}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 166px, 220px"
                style={{ objectPosition: member.objectPos || "center top" }}
                className="object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
              />
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 text-center sm:px-8 sm:pb-8">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#151716] sm:text-[21px]">
          {member.name}
        </h3>
        <p className="mt-0.5 text-sm italic text-black/55 sm:text-[15px]">
          {member.role}
        </p>
      </div>
    </Reveal>
  );
}

interface ImageCell {
  id: string;
  src: string;
  alt: string;
  label: string;
  caption: string;
  /** A paragraph under the title (Our Brand and Our Impact have one). */
  text?: string;
  /** CSS object-position for the crop; defaults to the centre. */
  position?: string;
}

/**
 * One boxed cell: an inset, rounded image (black and white until hovered) and below it the
 * index, the title and the label, like the case-study panels.
 */
function ImageCellBox({
  cell,
  index,
  priority,
  aspectClass,
  sizes,
  onImageError,
}: {
  cell: ImageCell;
  index: number;
  priority: boolean;
  /** Tailwind aspect-ratio classes for the image. */
  aspectClass: string;
  sizes: string;
  onImageError: (rawUrl?: string) => void;
}) {
  return (
    <figure className="group flex h-full flex-col p-[clamp(1rem,2.2vw,2rem)]">
      <div className={`relative w-full overflow-hidden rounded-lg bg-[#eaeceb] ${aspectClass}`}>
        <Image
          src={cell.src}
          alt={cell.alt}
          fill
          priority={priority}
          sizes={sizes}
          style={{ objectPosition: cell.position ?? "center" }}
          className="object-cover grayscale transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
          onError={() => onImageError(cell.src)}
        />
      </div>

      <figcaption className="mt-[clamp(0.9rem,1.6vw,1.4rem)] flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-black/45">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span aria-hidden className="h-px w-8 bg-black/25" />
          </p>
          <p className="mt-2 text-[clamp(1.35rem,1rem+1.1vw,2.1rem)] font-normal leading-tight tracking-[-0.03em] text-[#151716]">
            {cell.caption}
          </p>
        </div>
        <span className={`${PILL_BADGE} shrink-0`}>{cell.label}</span>
      </figcaption>
      {cell.text && (
        <p className="mt-3 max-w-[38rem] text-[clamp(0.95rem,0.88rem+0.3vw,1.08rem)] leading-relaxed text-black/60">
          {cell.text}
        </p>
      )}
    </figure>
  );
}

/**
 * The opening image: the team, wide, in a boxed cell of the site's hairline pattern. Our Story
 * follows right below it.
 */
function TeamFeature({
  heroSrc,
  onImageError,
}: {
  heroSrc: string;
  onImageError: (rawUrl?: string) => void;
}) {
  const team: ImageCell = {
    id: "team",
    src: heroSrc,
    alt: "The Incial team",
    label: "Founded 2024 · Kerala",
    caption: "We Are Incial",
    // the wide crop keeps the faces: they sit in the upper part of the photo
    position: "center 30%",
  };

  return (
    <Reveal className="mx-auto max-w-[1431px] px-5 sm:px-8 lg:px-12">
      <div className="relative border-x border-t border-black/15">
        <ImageCellBox
          cell={team}
          index={0}
          priority
          aspectClass="aspect-[4/3] md:aspect-[21/9]"
          sizes="(max-width: 1431px) 92vw, 1340px"
          onImageError={onImageError}
        />
        <BlockCorners />
      </div>
    </Reveal>
  );
}

/** The four corner crosses of a boxed block. */
function BlockCorners() {
  return (
    <>
      <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
      <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />
      <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
      <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />
    </>
  );
}

/**
 * Our Brand and Our Impact, side by side in two boxed cells with a cross where the divider
 * meets the lines (shown after the awards).
 */
function BrandImpactGrid({
  brandSrc,
  impactSrc,
  brandTitle,
  brandText,
  impactTitle,
  impactText,
  onImageError,
}: {
  brandSrc: string;
  impactSrc: string;
  brandTitle: string;
  brandText: string;
  impactTitle: string;
  impactText: string;
  onImageError: (rawUrl?: string) => void;
}) {
  const cells: ImageCell[] = [
    { id: "brand", src: brandSrc, alt: brandTitle, label: "Identity", caption: brandTitle, text: brandText },
    { id: "impact", src: impactSrc, alt: impactTitle, label: "Outcomes", caption: impactTitle, text: impactText },
  ];

  return (
    <Reveal className="relative grid grid-cols-1 border-y border-black/15 md:grid-cols-2">
      {cells.map((cell, i) => (
        <div
          key={cell.id}
          className={`relative ${i === 0 ? "border-b border-black/15 md:border-b-0 md:border-r" : ""}`}
        >
          <ImageCellBox
            cell={cell}
            index={i + 1}
            priority={false}
            aspectClass="aspect-[16/10]"
            sizes="(max-width: 768px) 92vw, 45vw"
            onImageError={onImageError}
          />
        </div>
      ))}
      <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
      <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />
      <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
      <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />
      {/* where the middle divider meets the top and bottom lines */}
      <Crosshair className="absolute -top-2.5 left-1/2 hidden -translate-x-1/2 md:inline" />
      <Crosshair className="absolute -bottom-2.5 left-1/2 hidden -translate-x-1/2 md:inline" />
    </Reveal>
  );
}

export default function AboutSection({
  initialData,
  onBack,
  onComplete,
}: AboutSectionProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<AboutData | null>(initialData ?? null);
  const [showAllTeam, setShowAllTeam] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsConfig = useSectionsConfig();
  const isDisabled = sectionsConfig["about"] === false;

  const markFailed = (url?: string) => {
    if (!url) return;
    setFailedUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  };

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    fetchCachedJson<AboutData>("/api/admin/about").then((fetched) => {
      if (cancelled || !fetched) return;
      setData(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || (!onBack && !onComplete)) return;

    const handleScroll = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
      if (e.deltaY < 0 && isAtTop && onBack) {
        e.preventDefault();
        onBack();
      }
      if (e.deltaY > 0 && isAtBottom && onComplete) {
        e.preventDefault();
        onComplete();
      }
    };

    container.addEventListener("wheel", handleScroll, { passive: false });
    return () => container.removeEventListener("wheel", handleScroll);
  }, [onBack, onComplete]);

  if (isDisabled) {
    return (
      <div className="relative min-h-screen bg-[#f7f9f8] text-[#151716]">
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen(!menuOpen)}
          blend
        />
        <MenuFrame open={menuOpen} />
        <div className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="text-center">
            <h1 className="mb-3 text-3xl font-normal tracking-[-0.03em] md:text-4xl">
              Section Disabled
            </h1>
            <p className="text-sm text-black/55">
              This page is currently unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const teamMembers = data?.teamMembers || [];
  const visibleTeamMembers = showAllTeam
    ? teamMembers
    : teamMembers.slice(0, 6);
  const awards = data?.awards || [];

  const heroSrc =
    data?.heroBanner && !failedUrls[data.heroBanner]
      ? data.heroBanner
      : FALLBACK_HERO;
  const brandSrc =
    data?.brandImage && !failedUrls[data.brandImage]
      ? data.brandImage
      : FALLBACK_BRAND;
  const impactSrc =
    data?.impactImage && !failedUrls[data.impactImage]
      ? data.impactImage
      : FALLBACK_IMPACT;

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white">
      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        blend
      />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-screen origin-top overflow-x-clip bg-[#f7f9f8] text-[#151716]"
        style={{ zIndex: 30 }}
      >
        {/* ── Hero — no background image ──────────────────────────────────── */}
        <ShaderHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
          title={
            <StretchHeading
              lead="About"
              emphasis="Incial"
              baseWeight={700}
              emphasisGrow={1.15}
            />
          }
          titleClassName="text-5xl italic md:text-8xl"
          tagline="We build brands, businesses, and beyond — aligning strategy, creativity, and technology."
          scrollTargetId="about-content"
          compact
        />

        {/* ── Three-image bordered cell grid ──────────────────────────────── */}
        <section
          id="about-content"
          className="border-b border-black/15 bg-[#f7f9f8] pt-[clamp(3rem,6vw,5rem)]"
        >
          <TeamFeature heroSrc={heroSrc} onImageError={markFailed} />
        </section>

        {/* ── Our Story & Our Purpose — two-column border split ───────────── */}
        <section className="border-b border-black/15 bg-[#f7f9f8]">
          <div className="relative mx-auto grid max-w-[1431px] grid-cols-1 gap-0 px-5 py-16 sm:px-8 md:grid-cols-12 md:py-24 lg:px-12">
            {/* vertical divider on md+ */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-1/2 hidden w-px bg-black/15 md:block"
            />

            {/* Story column */}
            <Reveal
              delay={0}
              className="flex flex-col justify-center md:col-span-6 md:pr-14"
            >
              <span className={`${PILL_BADGE} self-start`}>
                {data?.storyTitle || DEFAULT_STORY_TITLE}
              </span>
              <p className="mt-5 text-[clamp(1rem,0.9rem+0.5vw,1.2rem)] leading-relaxed text-black/70">
                {data?.storyText || DEFAULT_STORY_TEXT}
              </p>
            </Reveal>

            {/* Purpose column */}
            <Reveal
              delay={0.1}
              className="flex flex-col justify-center border-t border-black/15 pt-10 md:col-span-6 md:border-l md:border-t-0 md:pl-14 md:pt-0"
            >
              <span className={`${PILL_BADGE} self-start`}>
                {data?.purposeTitle || DEFAULT_PURPOSE_TITLE}
              </span>
              <p className="mt-5 text-[clamp(1rem,0.9rem+0.5vw,1.2rem)] leading-relaxed text-black/70">
                {data?.purposeText || DEFAULT_PURPOSE_TEXT}
              </p>
            </Reveal>
          </div>
        </section>

        <main className="mx-auto max-w-[1431px] px-5 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-24 lg:px-12">
          {/* ── Meet Our Team ──────────────────────────────────────────────── */}
          <section>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <SectionHeading>
                  {data?.teamTitle || DEFAULT_TEAM_TITLE}
                </SectionHeading>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60">
                  {data?.teamSubtitle || DEFAULT_TEAM_SUBTITLE}
                </p>
              </div>
              {teamMembers.length > 0 && (
                <span className={`${PILL_BADGE} self-start md:self-auto`}>
                  {teamMembers.length} Team Member
                  {teamMembers.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {teamMembers.length > 0 && (
              <div className="relative mt-8 grid grid-cols-1 border-l border-t border-black/15 sm:grid-cols-2 lg:grid-cols-3">
                <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
                {visibleTeamMembers.map((member, index) => (
                  <TeamMemberCard
                    key={member.id || `${member.name}-${index}`}
                    member={member}
                    index={index}
                  />
                ))}
              </div>
            )}

            {teamMembers.length > 6 && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllTeam((prev) => !prev)}
                  className={SECONDARY_BUTTON}
                >
                  {showAllTeam ? "View Less" : "View All"}
                </button>
              </div>
            )}
          </section>

          {/* ── Awards & Recognitions ──────────────────────────────────────── */}
          {awards.length > 0 && (
            <section className="mt-20 md:mt-28">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <SectionHeading>
                    {data?.awardsTitle || DEFAULT_AWARDS_TITLE}
                  </SectionHeading>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60">
                    {data?.awardsSubtitle || DEFAULT_AWARDS_SUBTITLE}
                  </p>
                </div>
                <span className={`${PILL_BADGE} self-start md:self-auto`}>
                  {awards.length} Recognition{awards.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="relative mt-8 border-t border-black/15">
                <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
                <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />

                {awards.map((award, index) => {
                  const isCustomIcon =
                    Boolean(award.icon) &&
                    !award.icon.includes("imgAwardsIcon.svg") &&
                    !failedUrls[award.icon];

                  return (
                    <Reveal
                      key={award.id || `${award.name}-${index}`}
                      delay={index * 0.05}
                      className="relative grid grid-cols-1 items-center gap-6 border-b border-black/15 py-8 transition-colors hover:bg-black/[0.02] md:grid-cols-12 md:py-10"
                    >
                      <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
                      <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />

                      <div className="md:col-span-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#151716] shadow-[0_12px_28px_-14px_rgba(0,0,0,0.6)]">
                          {isCustomIcon ? (
                            <div className="relative h-9 w-9">
                              <Image
                                src={award.icon}
                                alt={award.name}
                                fill
                                sizes="36px"
                                className="object-contain"
                                onError={() => markFailed(award.icon)}
                              />
                            </div>
                          ) : (
                            <AwardMedalSvg />
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-8">
                        <h3 className="text-2xl font-normal tracking-[-0.025em] text-[#151716]">
                          {award.name}
                        </h3>
                        <p className="mt-1.5 text-base text-black/60">
                          {award.description}
                        </p>
                      </div>

                      <div className="md:col-span-2 md:text-right">
                        <span className={PILL_BADGE}>{award.year}</span>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Our Brand & Our Impact — after the awards ─────────────────── */}
          <section className="mt-20 md:mt-28">
            <BrandImpactGrid
              brandSrc={brandSrc}
              impactSrc={impactSrc}
              brandTitle={data?.brandTitle || DEFAULT_BRAND_TITLE}
              brandText={data?.brandText || DEFAULT_BRAND_TEXT}
              impactTitle={data?.impactTitle || DEFAULT_IMPACT_TITLE}
              impactText={data?.impactText || DEFAULT_IMPACT_TEXT}
              onImageError={markFailed}
            />
          </section>

          {/* ── Closing Statement ──────────────────────────────────────────── */}
          <section className="mx-auto mt-24 max-w-4xl pb-4 text-center md:mt-36">
            <Reveal>
              <h2 className="text-balance text-[clamp(2.2rem,1.2rem+4vw,4.75rem)] font-normal leading-[1.06] tracking-[-0.045em] text-[#151716]">
                Strategy, craft, and technology{" "}
                <span
                  aria-hidden
                  className="relative mx-[0.14em] inline-block h-[0.68em] w-[0.68em] rounded-full bg-[#151716] align-middle shadow-[0_0_0_0.1em_rgba(86,166,255,0.24),0_0.2em_0.5em_-0.2em_rgba(0,0,0,0.45)] ring-[0.05em] ring-white"
                >
                  <Image
                    src="/logo/Logoo-white.svg"
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-[0.13em]"
                  />
                </span>{" "}
                built for brands that endure.
              </h2>

              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-black/55">
                Explore the work we&apos;ve shipped or get to know what it feels
                like to build with us.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/case-studies" className={PRIMARY_BUTTON}>
                  Explore our work
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/careers" className={SECONDARY_BUTTON}>
                  Careers at Incial
                </Link>
              </div>
            </Reveal>
          </section>
        </main>

        <div className="rounded-t-[2rem] bg-black pb-4 pt-8 text-white">
          <div className="mx-auto max-w-[1431px] px-5 sm:px-8 lg:px-12">
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
