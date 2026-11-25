"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import MenuFrame from "@/components/layout/MenuFrame";
import Footer from "@/components/layout/Footer";
import ShaderHero from "@/components/ui/ShaderHero";
import StretchHeading from "@/components/features/products/StretchHeading";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  slug: string;
}

interface TestimonialItem {
  quote: string;
  author: string;
  initials: string;
  role: string;
  company: string;
}

const PERKS: ReadonlyArray<string> = [
  "Flexible hours & remote-friendly workflows",
  "LearnTogether sessions & growth mentorship",
  "Health and wellness support",
  "Team outings, events & milestone celebrations",
  "Modern tools, AI & design stack access",
  "High-trust, collaborative studio culture",
];

const TESTIMONIALS: ReadonlyArray<TestimonialItem> = [
  {
    quote:
      "Our culture values respect, curiosity, and continuous learning. Every voice helps shape our journey.",
    author: "Abidh Habeeb",
    initials: "AH",
    role: "CEO",
    company: "Incial",
  },
  {
    quote:
      "Great work builds genuine trust. At Incial, we craft stories and products that resonate and last.",
    author: "Alan Joseph",
    initials: "AJ",
    role: "CMO",
    company: "Incial",
  },
];

const WAVE_STRAND_COUNT = 6;
const WAVE_STRAND_STEP = 50;

function getWavePath(index: number): string {
  const dy = index * WAVE_STRAND_STEP;
  return `M 6 ${126 + dy} C 210 ${14 + dy}, 430 ${48 + dy}, 634 ${90 + dy} C 838 ${132 + dy}, 1055 ${166 + dy}, 1262 ${54.5 + dy}`;
}

const PILL_BADGE =
  "inline-flex items-center rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/60";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-[#151716] px-6 py-3 text-[13px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9f8]";

const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-black/15 bg-white px-5 py-3 text-[13px] font-medium text-[#151716] transition-all duration-300 hover:border-black/35 hover:bg-black/[0.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9f8]";

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

function LinkedInMark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#0A66C2] text-white"
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05C12.6 8.9 14.3 8 16.3 8c4.1 0 4.9 2.7 4.9 6.2V24h-4v-8.8c0-2.1-.04-4.8-2.9-4.8-2.9 0-3.4 2.3-3.4 4.6V24H8V8z" />
      </svg>
    </span>
  );
}

function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("careers@incial.in");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={SECONDARY_BUTTON}
      aria-label="Copy careers@incial.in email address"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-1.5 text-[#151716]"
          >
            <svg
              className="h-3.5 w-3.5 text-[#3b82f6]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-1.5"
          >
            <svg
              className="h-3.5 w-3.5 text-black/45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy email
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function WaveStrand({
  index,
  progress,
  reduceMotion,
  isHighlighted,
  isDimmed,
  onHoverIndex,
}: {
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
  isHighlighted: boolean;
  isDimmed: boolean;
  onHoverIndex: (index: number | null) => void;
}) {
  const d = getWavePath(index);
  const start = index * 0.045;
  const end = 0.75 + index * 0.045;
  const scrubbedLength = useTransform(progress, [start, end], [0, 1]);

  return (
    <motion.g
      onMouseEnter={() => onHoverIndex(index)}
      onMouseLeave={() => onHoverIndex(null)}
      animate={{ opacity: isDimmed ? 0.32 : 1 }}
      transition={{ duration: 0.25 }}
      className="cursor-pointer"
    >
      <path
        d={d}
        stroke="transparent"
        strokeWidth={28}
        strokeLinecap="round"
      />

      {/* Faint hairline guide so forward draw and reverse erase read clearly at any scroll position */}
      <path
        d={d}
        stroke="rgba(148, 163, 184, 0.16)"
        strokeWidth={3}
        strokeLinecap="round"
      />

      <motion.path
        d={d}
        stroke="url(#careerWaveGradient)"
        strokeLinecap="round"
        style={reduceMotion ? undefined : { pathLength: scrubbedLength }}
        animate={{ strokeWidth: isHighlighted ? 8.5 : 6.5 }}
        transition={{ strokeWidth: { duration: 0.25 } }}
      />
    </motion.g>
  );
}

/**
 * Scroll-scrubbed vector trim-path animation recreating the 6-strand flowing wave
 * motif (`Career.png`): draws forward as the user scrolls down and reverses cleanly
 * when scrolling back up.
 */
function CareerWaveVector({
  highlightedIndex,
  onHoverIndex,
}: {
  highlightedIndex: number | null;
  onHoverIndex: (index: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 92%", "end 38%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.25,
  });

  return (
    <div ref={containerRef} className="relative py-6 md:py-10">
      <svg
        viewBox="0 0 1268 434"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Six flowing blue vector wave strands representing growth at Incial"
      >
        <defs>
          <linearGradient
            id="careerWaveGradient"
            x1="0"
            y1="217"
            x2="1268"
            y2="217"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0" />
            <stop offset="16%" stopColor="#94A3B8" stopOpacity="0.45" />
            <stop offset="48%" stopColor="#60A5FA" stopOpacity="0.85" />
            <stop offset="82%" stopColor="#2563EB" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#007BFF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {Array.from({ length: WAVE_STRAND_COUNT }, (_, i) => (
          <WaveStrand
            key={i}
            index={i}
            progress={smoothProgress}
            reduceMotion={reduceMotion}
            isHighlighted={highlightedIndex === i}
            isDimmed={highlightedIndex !== null && highlightedIndex !== i}
            onHoverIndex={onHoverIndex}
          />
        ))}
      </svg>
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
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

function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <Reveal delay={index * 0.05}>
      <Link
        href={`/careers/${job.slug}`}
        className="group relative flex flex-col justify-between gap-6 border-b border-black/15 py-8 transition-colors hover:bg-black/[0.02] md:flex-row md:items-center md:py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A6FF]"
      >
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className={PILL_BADGE}>{job.department}</span>
            <span className="text-xs font-medium tracking-[0.04em] text-black/45">
              {job.location} · {job.type}
            </span>
          </div>
          <h3 className="text-2xl font-normal tracking-[-0.025em] text-[#151716] transition-transform duration-300 group-hover:translate-x-1 md:text-3xl">
            {job.title}
          </h3>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#151716] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-[1.04] group-active:scale-[0.98]">
          View role
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Link>
    </Reveal>
  );
}

export default function CareersPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeWaveIndex, setActiveWaveIndex] = useState<number | null>(null);
  const jobs: Job[] = [];
  const sectionsConfig = useSectionsConfig();
  const isDisabled = sectionsConfig["careers"] === false;

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

  return (
    <div className="relative min-h-screen bg-white">
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
        <ShaderHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
          title={
            <StretchHeading
              lead="Careers at"
              emphasis="Incial"
              baseWeight={700}
              emphasisGrow={1.15}
            />
          }
          titleClassName="text-5xl italic md:text-8xl"
          tagline={
            <>
              Building a team that loves Mondays{" "}
              <span className="text-[#56A6FF]">(most of the time)</span>.
            </>
          }
          scrollTargetId="careers-content"
        />

        <main
          id="careers-content"
          className="mx-auto max-w-[1431px] px-5 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-24 lg:px-12"
        >
          {/* ── Opening Statement & Story Grid ────────────────────────────── */}
          <section className="relative border-y border-black/15">
            <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
            <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />
            <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
            <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <Reveal className="relative border-b border-black/15 py-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:py-12 lg:pr-12">
                <Crosshair className="absolute -right-2 -top-2.5 hidden lg:inline" />
                <Crosshair className="absolute -bottom-2.5 -right-2 hidden lg:inline" />
                <span className={PILL_BADGE}>Founded 2024 · Kerala</span>
                <h2 className="mt-5 text-[clamp(1.65rem,1.25rem+1.5vw,2.5rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#151716]">
                  We&apos;re not just building brands — we&apos;re building a
                  team that loves Mondays.{" "}
                  <span className="italic text-[#3b82f6]">
                    (most of the time)
                  </span>
                </h2>
              </Reveal>

              <Reveal
                delay={0.08}
                className="flex items-center py-10 lg:col-span-7 lg:py-12 lg:pl-12"
              >
                <p className="max-w-2xl text-base leading-relaxed text-black/65 md:text-[17px]">
                  Founded in 2024 in Kanjirappally, Kerala, Incial started with
                  a small crew of creators and strategists. Today we partner
                  with ambitious businesses to ship digital products and brands
                  built to last.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ── Current Openings ──────────────────────────────────────────── */}
          <section className="mt-20 md:mt-24">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionHeading>Current Openings</SectionHeading>
              <span className={PILL_BADGE}>
                {jobs.length === 0
                  ? "Open Applications"
                  : `${jobs.length} Open Role${jobs.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <div className="relative mt-8 border-t border-black/15">
              <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
              <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />

              {jobs.length === 0 ? (
                <Reveal className="relative grid grid-cols-1 gap-8 border-b border-black/15 py-10 md:py-12 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-6">
                    <p className="text-xl font-normal leading-snug tracking-[-0.02em] text-[#151716] md:text-2xl">
                      No open roles listed right now — always open to great
                      talent.
                    </p>
                    <p className="mt-3 max-w-lg text-base leading-relaxed text-black/60">
                      Share your portfolio or resume and we&apos;ll reach out as
                      soon as the right role opens.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:col-span-6 lg:justify-end">
                    <a
                      href="mailto:careers@incial.in"
                      className={PRIMARY_BUTTON}
                    >
                      careers@incial.in
                      <span aria-hidden>→</span>
                    </a>
                    <CopyEmailButton />
                    <a
                      href="https://linkedin.com/company/incial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={SECONDARY_BUTTON}
                    >
                      <LinkedInMark />
                      LinkedIn
                    </a>
                  </div>
                </Reveal>
              ) : (
                <>
                  <div>
                    {jobs.map((job, idx) => (
                      <JobCard key={job.id} job={job} index={idx} />
                    ))}
                  </div>
                  <div className="flex flex-col items-start justify-between gap-4 border-b border-black/15 py-7 sm:flex-row sm:items-center">
                    <p className="text-sm italic text-black/55">
                      Don&apos;t see a fit? Send your portfolio anyway.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <a
                        href="mailto:careers@incial.in"
                        className={PRIMARY_BUTTON}
                      >
                        careers@incial.in
                      </a>
                      <CopyEmailButton />
                      <a
                        href="https://linkedin.com/company/incial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={SECONDARY_BUTTON}
                      >
                        <LinkedInMark />
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Life at Incial & Interactive Perks ────────────────────────── */}
          <section className="mt-20 md:mt-24">
            <SectionHeading>Life at Incial</SectionHeading>

            <div className="relative mt-8 grid grid-cols-1 border-y border-black/15 lg:grid-cols-12">
              <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
              <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />
              <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
              <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />

              <Reveal className="relative flex flex-col justify-center border-b border-black/15 py-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:py-12 lg:pr-12">
                <Crosshair className="absolute -right-2 -top-2.5 hidden lg:inline" />
                <Crosshair className="absolute -bottom-2.5 -right-2 hidden lg:inline" />

                <div>
                  <span className={PILL_BADGE}>Culture & Perks</span>
                  <h3 className="mt-5 text-[clamp(1.6rem,1.2rem+1.5vw,2.45rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#151716]">
                    Built around collaboration, curiosity, and real growth.
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-black/60">
                    Space for fresh ideas, honest craft, and continuous
                    learning.
                  </p>
                </div>
              </Reveal>

              <div className="divide-y divide-black/15 lg:col-span-7">
                {PERKS.map((perk, index) => {
                  const isActive = activeWaveIndex === index;
                  return (
                    <Reveal
                      key={perk}
                      delay={index * 0.04}
                      className="group relative"
                    >
                      <div
                        onMouseEnter={() => setActiveWaveIndex(index)}
                        onMouseLeave={() => setActiveWaveIndex(null)}
                        className={`relative flex items-center justify-between gap-4 py-5 transition-colors lg:pl-12 lg:pr-4 ${
                          isActive
                            ? "bg-black/[0.025]"
                            : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-y-0 left-0 w-[2px] origin-center bg-[#56A6FF] transition-transform duration-300 ${
                            isActive
                              ? "scale-y-100"
                              : "scale-y-0 group-hover:scale-y-100"
                          }`}
                        />
                        <div
                          className={`flex items-baseline gap-6 transition-transform duration-300 ${
                            isActive
                              ? "translate-x-1.5"
                              : "group-hover:translate-x-1.5"
                          }`}
                        >
                          <span
                            className={`shrink-0 text-xs font-medium tracking-[0.14em] transition-colors duration-200 ${
                              isActive
                                ? "text-[#3b82f6]"
                                : "text-black/40 group-hover:text-[#3b82f6]"
                            }`}
                          >
                            0{index + 1}
                          </span>
                          <p className="text-base font-normal leading-snug text-[#151716] md:text-lg">
                            {perk}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Vector Wave Path Interlude (Between Life at Incial & From the Team) ─ */}
          <section className="relative mt-14 border-b border-black/15 pb-6 md:mt-20 md:pb-8">
            <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
            <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />

            <CareerWaveVector
              highlightedIndex={activeWaveIndex}
              onHoverIndex={setActiveWaveIndex}
            />
          </section>

          {/* ── Leadership Voices ─────────────────────────────────────────── */}
          <section className="mt-20 md:mt-24">
            <SectionHeading>From the Team</SectionHeading>

            <div className="relative mt-8 grid grid-cols-1 divide-y divide-black/15 border-y border-black/15 md:grid-cols-2 md:divide-x md:divide-y-0">
              <Crosshair className="absolute -left-2 -top-2.5 hidden sm:inline" />
              <Crosshair className="absolute -right-2 -top-2.5 hidden sm:inline" />
              <Crosshair className="absolute -bottom-2.5 -left-2 hidden sm:inline" />
              <Crosshair className="absolute -bottom-2.5 -right-2 hidden sm:inline" />
              <Crosshair className="absolute -top-2.5 left-1/2 hidden -translate-x-1/2 md:inline" />
              <Crosshair className="absolute -bottom-2.5 left-1/2 hidden -translate-x-1/2 md:inline" />

              {TESTIMONIALS.map((item, idx) => (
                <Reveal
                  key={item.author}
                  delay={idx * 0.08}
                  className={`group flex flex-col justify-between gap-8 py-10 transition-colors hover:bg-black/[0.015] md:py-12 ${
                    idx === 0 ? "md:pr-12" : "md:pl-12"
                  }`}
                >
                  <blockquote className="text-lg font-normal leading-relaxed tracking-[-0.015em] text-[#151716]/85 md:text-xl">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3.5">
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#151716] text-xs font-semibold tracking-wider text-white transition-transform duration-300 group-hover:scale-105"
                    >
                      {item.initials}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#151716]">
                        {item.author}
                      </p>
                      <p className="text-xs font-medium tracking-[0.04em] text-black/50">
                        {item.role} · {item.company}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ── Looking Ahead (Editorial Closing Statement) ───────────────── */}
          <section className="mx-auto mt-24 max-w-4xl pb-4 text-center md:mt-32">
            <Reveal>
              <h2 className="text-balance text-[clamp(2.2rem,1.2rem+4vw,4.75rem)] font-normal leading-[1.06] tracking-[-0.045em] text-[#151716]">
                Looking ahead{" "}
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
                build what&apos;s next with us.
              </h2>

              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-black/55">
                Want to join future opportunities at Incial? Reach out anytime.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <a href="mailto:careers@incial.in" className={PRIMARY_BUTTON}>
                  careers@incial.in
                  <span aria-hidden>→</span>
                </a>
                <CopyEmailButton />
                <a
                  href="https://linkedin.com/company/incial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SECONDARY_BUTTON}
                >
                  <LinkedInMark />
                  Connect on LinkedIn
                </a>
              </div>
            </Reveal>
          </section>
        </main>

        {/* Rounded dark footer container matching Products, Blogs, and Case Studies */}
        <div className="rounded-t-[2rem] bg-black pb-4 pt-8 text-white">
          <div className="mx-auto max-w-[1431px] px-5 sm:px-8 lg:px-12">
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
