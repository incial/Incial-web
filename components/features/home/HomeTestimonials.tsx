"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import type { Testimonial } from "@/lib/dataLoader";
import { useClientsData } from "@/lib/useClientsData";
import { useSectionsConfig } from "@/lib/useSectionsConfig";
import LiquidSeamWave from "./LiquidSeamWave";

const EASE = [0.22, 1, 0.36, 1] as const;

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const DEFAULT_TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "homescapes",
    quote:
      "Incial took us from an offline-only home décor seller to a full-fledged direct-to-consumer brand. Their Shopify architecture and curated visual identity completely transformed how customers discover and shop with us.",
    author: "Homescapes",
    role: "E-commerce & Brand Identity",
  },
  {
    id: "funfee",
    quote:
      "From curiosity teasers to high-energy launch reels, Incial turned our new venue into the most talked-about family destination in town—bringing 18,000 organic followers and over 4.6 million views in just three weeks.",
    author: "Funfee",
    role: "Social Media & Brand Launch",
  },
  {
    id: "livelong-wealth",
    quote:
      "Their educational strategy and relatable content broke down complex financial concepts for our audience, building a loyal investor community and growing our Assets Under Management from 33 lakhs to 42 Cr.",
    author: "Livelong Wealth",
    role: "Financial Services Marketing",
  },
];

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#151716] transition-colors hover:text-[#1463ff]"
    >
      <span className="relative pb-0.5">
        {label}
        <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-100 bg-black/25 transition-transform duration-300 group-hover:scale-x-0" />
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

function HomeTestimonialsContent({
  items,
  topColor,
}: {
  items: readonly Testimonial[];
  topColor: string;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Matches HomeHero: as the bottom scrolls up, it rounds into a wide convex curve over the black section below.
  const { scrollYProgress } = useScroll({
    target: surfaceRef,
    offset: ["end end", "end start"],
  });
  const curve = useTransform(scrollYProgress, (progress) => {
    const amount = Math.min(1, Math.max(0, progress / 0.35));
    return `min(${14 * amount}dvh, ${16 * amount}vw)`;
  });

  return (
    <section
      id="testimonials"
      data-tone="light"
      aria-labelledby="testimonials-heading"
      className="relative z-30 w-full"
    >
      <LiquidSeamWave topColor={topColor} bottomColor="#f6f8fb" />

      <motion.div
        ref={surfaceRef}
        style={{ ["--section-curve" as string]: curve }}
        className="relative bg-[#f6f8fb] px-6 pb-[clamp(6.5rem,13dvh,9.5rem)] pt-20 text-[#151716] [border-bottom-left-radius:50%_var(--section-curve)] [border-bottom-right-radius:50%_var(--section-curve)] md:px-12 lg:pt-28"
      >
        <div className="mx-auto max-w-[1340px]">
          <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-10 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#1463ff]">
                Client Testimonials
              </span>
              <h2
                id="testimonials-heading"
                className="mt-3 font-normal leading-[1.06] tracking-[-0.04em] text-[#151716]"
                style={{ fontSize: "clamp(2rem, 1.3rem + 2.4vw, 3.8rem)" }}
              >
                Trusted by teams building what&apos;s next.
              </h2>
            </div>
            <div>
              <ActionLink href="/case-studies" label="View all case studies" />
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {items.map((item, index) => (
              <motion.figure
                key={item.id || index}
                initial={reduced ? false : "hidden"}
                whileInView="shown"
                viewport={{ once: true, margin: "-10%" }}
                variants={FADE_UP}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1463ff]/40 hover:shadow-xl sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <span className="font-mono text-xs font-bold text-[#1463ff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="text-2xl font-semibold leading-none text-[#1463ff]/70">
                      &ldquo;
                    </span>
                  </div>

                  <blockquote className="mt-6 text-[0.98rem] leading-relaxed text-[#151716]/80 sm:text-[1.05rem]">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <figcaption className="mt-8 border-t border-black/10 pt-4">
                  <span className="block text-base font-semibold tracking-tight text-[#151716]">
                    {item.author}
                  </span>
                  {item.role && (
                    <span className="mt-0.5 block font-mono text-xs uppercase tracking-wider text-black/50">
                      {item.role}
                    </span>
                  )}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/**
 * Client Testimonials Showcase Section:
 * Placed right below HomeClients and above the dark Global Presence map section.
 * Reads live quotes from `/api/admin/clients` (`clients.testimonials`) with default fallbacks.
 */
export default function HomeTestimonials() {
  const clientsData = useClientsData();
  const sectionsConfig = useSectionsConfig();

  if (sectionsConfig["client-testimonials"] === false) return null;

  const cmsTestimonials = (clientsData?.testimonials ?? []).filter(
    (item) => item.quote.trim() && item.author.trim(),
  );
  const items = cmsTestimonials.length > 0 ? cmsTestimonials : DEFAULT_TESTIMONIALS;
  const topColor = sectionsConfig["client-logos"] === false ? "#000000" : "#ffffff";

  return <HomeTestimonialsContent items={items} topColor={topColor} />;
}
