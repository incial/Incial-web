"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import casestudiesData from "@/data/casestudies.json";
import { normalizeImageUrl } from "@/lib/imageUtils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface CaseItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  result?: string;
  heroImage?: string;
  coverImage?: string;
  year?: string;
  featured?: boolean;
}

const ALL_CASES: readonly CaseItem[] = (casestudiesData.cases as CaseItem[]).filter(
  (item) => Boolean(item.slug && item.title),
);

const FEATURED_CASES = ALL_CASES.filter((item) => item.featured).slice(0, 4);
const SHOWCASE_CASES = FEATURED_CASES.length >= 4 ? FEATURED_CASES : ALL_CASES.slice(0, 4);

const LINE_REVEAL: Variants = {
  hidden: { y: "105%", opacity: 0 },
  shown: (delay: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.8, delay, ease: EASE },
  }),
};

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const STATS = [
  { value: "4", label: "Core disciplines under one roof — tech, brand, marketing & media" },
  { value: "30+", label: "Brands & digital products launched across India & beyond" },
  { value: "100%", label: "In-house execution with zero agency handoff gaps" },
  { value: "2019", label: "Founded to build brands, software & media that compound" },
] as const;

function NewFormLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 text-sm font-medium tracking-wide text-white transition-colors hover:text-[#6ea2ff]"
    >
      <span className="relative pb-1">
        {label}
        <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-100 bg-white/35 transition-transform duration-300 group-hover:scale-x-0" />
        <span className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-[#1463ff] transition-transform duration-300 group-hover:scale-x-100" />
      </span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
      >
        →
      </span>
    </Link>
  );
}

/**
 * Selected work showcase for `/services`, modeled after New Form Capital's editorial
 * dark-surface architecture: line-masked reveals, dual-row marquee, numbered case cards,
 * and a bracketed thesis + hairline metrics strip.
 */
export default function ServiceWorkShowcase() {
  const reduced = useReducedMotion();
  const marqueeRowA = [...ALL_CASES.slice(0, 5), ...ALL_CASES.slice(0, 5)];
  const marqueeRowB = [...ALL_CASES.slice(2, 7), ...ALL_CASES.slice(2, 7)];

  return (
    <section
      aria-label="Selected Work"
      className="relative overflow-hidden border-t border-white/10 bg-[#07090e] text-white"
    >
      {/* ── Header: Line-masked editorial reveal + New Form action link ── */}
      <div className="mx-auto max-w-7xl px-6 pb-14 pt-24 md:px-12 lg:px-20 lg:pt-32">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/50">
              <span className="inline-block h-2 w-2 bg-[#1463ff] animate-pulse" />
              Selected Work
            </div>

            <h2
              className="mt-5 font-normal leading-[1.04] tracking-[-0.04em] text-white"
              style={{ fontSize: "clamp(2.2rem, 1.15rem + 3.5vw, 4.25rem)" }}
            >
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  custom={0.05}
                  initial={reduced ? false : "hidden"}
                  whileInView="shown"
                  viewport={{ once: true, margin: "-10%" }}
                  variants={LINE_REVEAL}
                >
                  The work behind
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-white/70"
                  custom={0.18}
                  initial={reduced ? false : "hidden"}
                  whileInView="shown"
                  viewport={{ once: true, margin: "-10%" }}
                  variants={LINE_REVEAL}
                >
                  the services we ship.
                </motion.span>
              </span>
            </h2>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="max-w-sm text-sm leading-relaxed text-white/55 lg:text-right">
              From Shopify e-commerce transformations to 4.6M-view launch campaigns and custom software.
            </p>
            <NewFormLink href="/case-studies" label="View full portfolio" />
          </div>
        </div>
      </div>

      {/* ── Dual-row opposite-direction marquee (New Form ConsistentMarquee style) ── */}
      <div className="relative space-y-4 border-y border-white/10 bg-black/40 py-8">
        <div className="overflow-hidden">
          <div className="flex w-max gap-5 [animation:client-marquee_38s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation:none]">
            {marqueeRowA.map((item, idx) => (
              <Link
                key={`row-a-${item.id}-${idx}`}
                href={`/case-studies/${item.slug}`}
                className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 transition-colors hover:border-[#1463ff]/60 hover:bg-white/[0.06]"
              >
                <span className="text-xl font-light italic tracking-tight text-white/85 group-hover:text-white">
                  {item.title.split(":")[0]}
                </span>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/55">
                  {item.category}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex w-max gap-5 [animation:client-marquee_44s_linear_infinite_reverse] hover:[animation-play-state:paused] motion-reduce:[animation:none]">
            {marqueeRowB.map((item, idx) => (
              <Link
                key={`row-b-${item.id}-${idx}`}
                href={`/case-studies/${item.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3.5 transition-colors hover:border-[#1463ff]/60 hover:bg-white/[0.06]"
              >
                <span className="font-mono text-xs text-[#6ea2ff]">
                  0{(idx % 5) + 1}
                </span>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">
                  {item.summary}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Numbered Work Grid (01..04) ── */}
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:px-20">
        <div className="grid gap-6 md:grid-cols-2">
          {SHOWCASE_CASES.map((item, index) => {
            const imgSrc = normalizeImageUrl(item.heroImage || item.coverImage || "");
            return (
              <motion.article
                key={item.id}
                initial={reduced ? false : "hidden"}
                whileInView="shown"
                viewport={{ once: true, margin: "-12%" }}
                variants={FADE_UP}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-[#1463ff]/50 hover:bg-white/[0.04] sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="font-mono text-xs tracking-[0.2em] text-[#6ea2ff]">
                      0{index + 1}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      {item.category} {item.year ? `· ${item.year}` : ""}
                    </span>
                  </div>

                  {imgSrc && (
                    <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                      <Image
                        src={imgSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    </div>
                  )}

                  <h3 className="mt-6 text-xl font-normal tracking-[-0.02em] text-white sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/60">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <span className="text-xs text-white/45 line-clamp-1">
                    {item.result || "Delivered end-to-end by Incial"}
                  </span>
                  <NewFormLink href={`/case-studies/${item.slug}`} label="Case study" />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── Bracketed Thesis + Hairline Stats Strip (New Form sc-06-Thesis style) ── */}
        <motion.div
          initial={reduced ? false : "hidden"}
          whileInView="shown"
          viewport={{ once: true, margin: "-10%" }}
          variants={FADE_UP}
          className="mt-24 border-t border-white/12 pt-16"
        >
          <div className="flex items-start justify-between gap-6">
            <span aria-hidden className="hidden font-mono text-4xl font-light text-[#1463ff] sm:block">
              [
            </span>
            <p
              className="max-w-4xl text-center font-normal leading-[1.15] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.65rem, 1rem + 2.2vw, 3rem)" }}
            >
              Building at the intersection of technology, brand identity, growth marketing, and cinema-grade media.
            </p>
            <span aria-hidden className="hidden font-mono text-4xl font-light text-[#1463ff] sm:block">
              ]
            </span>
          </div>

          <div className="mt-14 grid grid-cols-2 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {STATS.map((stat) => (
              <div key={stat.value} className="px-4 py-8 sm:px-6">
                <div className="text-3xl font-light tracking-[-0.03em] text-white sm:text-4xl">
                  {stat.value}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
