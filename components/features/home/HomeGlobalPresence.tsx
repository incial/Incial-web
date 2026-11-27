"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ClientWorldMap from "@/components/features/home/ClientWorldMap";
import { isValidLocation } from "@/lib/clientLocations";
import type { Stat, TrustData } from "@/lib/dataLoader";
import { fetchCachedJson } from "@/lib/publicCache";
import { StageToneProvider } from "@/lib/stageTone";
import { useClientsData } from "@/lib/useClientsData";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

const EASE = [0.22, 1, 0.36, 1] as const;
const COUNT_DURATION_MS = 1400;

const DEFAULT_TITLE = "From Kerala, for the world.";
const DEFAULT_SUBTITLE = "Wherever our clients are, that's where we work.";
const DEFAULT_STATS: Stat[] = [
  { id: "1", value: "5+", label: "Countries" },
  { id: "2", value: "50+", label: "Cities" },
  { id: "3", value: "12+", label: "Live projects right now" },
];

const LEGACY_TITLE = "Why Trust Incial?";

function isLegacyTrustPayload(payload: TrustData): boolean {
  return payload.title?.trim() === LEGACY_TITLE;
}

/** Counts the numeric portion of `value` up from 0 once `active` becomes true. */
function CountUp({
  value,
  active,
  reduced,
}: {
  value: string;
  active: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const parts = useMemo(() => /^(\D*)([\d,]+)(.*)$/.exec(value.trim()), [value]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !parts) return;

    const [, prefix, rawNum, suffix] = parts;
    const target = Number(rawNum.replace(/,/g, ""));
    const padLength = rawNum.startsWith("0") && rawNum.length > 1 ? rawNum.length : 0;

    const format = (num: number) => {
      const formatted = padLength > 0 ? String(num).padStart(padLength, "0") : num.toLocaleString("en-US");
      return `${prefix}${formatted}${suffix}`;
    };

    if (reduced) {
      node.textContent = value;
      return;
    }

    if (!active) {
      node.textContent = format(0);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      node.textContent = format(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        node.textContent = value;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, parts, reduced, value]);

  return <span ref={ref}>{value}</span>;
}

function HomeGlobalPresenceContent({
  hasTestimonialsAbove,
  showTitle,
  showStats,
}: {
  hasTestimonialsAbove: boolean;
  showTitle: boolean;
  showStats: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const isMapInView = useInView(mapWrapRef, { once: true, amount: 0.2 });

  // Matches HomeHero: as the bottom scrolls up, it rounds into a wide convex curve opening onto Contact's white frame.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["end end", "end start"],
  });
  const curve = useTransform(scrollYProgress, (progress) => {
    const amount = Math.min(1, Math.max(0, progress / 0.35));
    return `min(${14 * amount}dvh, ${16 * amount}vw)`;
  });

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);

  const clients = useClientsData();

  useEffect(() => {
    let cancelled = false;
    fetchCachedJson<TrustData>("/api/admin/trust")
      .then((payload) => {
        if (cancelled || !payload) return;
        // Preserve the new Global Presence copy if the CMS still holds the legacy "Why Trust Incial?" payload.
        if (isLegacyTrustPayload(payload)) return;

        if (payload.title?.trim()) setTitle(payload.title.trim());
        if (payload.subtitle?.trim()) setSubtitle(payload.subtitle.trim());
        if (payload.stats?.length) setStats(payload.stats);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const locations = useMemo(
    () => (clients?.clients ?? []).map((client) => client.location).filter(isValidLocation),
    [clients],
  );

  const singleLineTitle = title.replace(/\s*\n+\s*/g, " ").trim();
  const commaAt = singleLineTitle.indexOf(",");
  const titleLead = commaAt !== -1 ? singleLineTitle.slice(0, commaAt + 1) : singleLineTitle;
  const titleTail = commaAt !== -1 ? singleLineTitle.slice(commaAt + 1).trim() : "";

  return (
    <motion.section
      ref={sectionRef}
      id="presence"
      data-tone="dark"
      aria-labelledby="global-presence-heading"
      style={{ ["--section-curve" as string]: curve }}
      className={`relative z-20 overflow-hidden bg-black px-4 pb-[clamp(8rem,15dvh,12rem)] text-white [border-bottom-left-radius:50%_var(--section-curve)] [border-bottom-right-radius:50%_var(--section-curve)] md:px-12 ${
        hasTestimonialsAbove
          ? "-mt-[min(14dvh,16vw)] pt-[calc(min(14dvh,16vw)+clamp(11.5rem,21dvh,17rem))]"
          : "pt-[clamp(8.5rem,16dvh,13rem)]"
      }`}
    >
        {/* Subtle atmospheric blue glow behind the dark world-map stage */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#56A6FF]/10 via-transparent to-transparent opacity-50 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-[90rem] flex-col items-center justify-center gap-[clamp(2rem,4.5dvh,3.5rem)] text-center">
          {showTitle && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={reduced || isSectionInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.75, ease: EASE }}
              className="flex flex-col items-center"
            >
              <h2
                id="global-presence-heading"
                className="font-sans font-light leading-[1.08] tracking-[-0.04em] text-white sm:whitespace-nowrap"
                style={{ fontSize: "clamp(2rem, 1rem + 3.4vw, 4.35rem)" }}
              >
                <span>{titleLead}</span>
                {titleTail && <span className="italic text-[#56A6FF]"> {titleTail}</span>}
              </h2>

              <p className="mt-[clamp(0.9rem,2vw,1.4rem)] max-w-[36rem] text-[clamp(0.95rem,0.85rem+0.4vw,1.15rem)] leading-relaxed text-white/55">
                {subtitle.includes(",") ? (
                  <>
                    <span className="text-white/85">{subtitle.slice(0, subtitle.indexOf(",") + 1)}</span>
                    {subtitle.slice(subtitle.indexOf(",") + 1)}
                  </>
                ) : (
                  subtitle
                )}
              </p>
            </motion.div>
          )}

          {showStats && stats.length > 0 && (
            <dl className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6 md:gap-x-24">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id || index}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={reduced || isSectionInView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.65, delay: 0.1 + index * 0.1, ease: EASE }}
                  className="flex min-w-[7rem] flex-col items-center md:min-w-[11rem]"
                >
                  <dd className="text-[clamp(2.6rem,1.5rem+3.2vw,4.2rem)] font-semibold italic leading-none tracking-tight text-[#56A6FF] tabular-nums">
                    <CountUp value={stat.value} active={isSectionInView} reduced={reduced} />
                  </dd>
                  <dt className="mt-2 text-base font-medium tracking-wide text-white/80 md:text-lg">
                    {stat.label}
                  </dt>
                </motion.div>
              ))}
            </dl>
          )}

          <motion.div
            ref={mapWrapRef}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={reduced || isMapInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.85, ease: EASE }}
            className="-mx-4 w-[calc(100%+2rem)] md:mx-0 md:w-[min(100%,calc(52dvh*2),84rem)]"
            style={{
              maskImage: "radial-gradient(ellipse at center, #000 66%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, #000 66%, transparent 100%)",
            }}
          >
            <StageToneProvider tone="dark">
              <ClientWorldMap locations={locations} play={isMapInView} showLabels={false} />
            </StageToneProvider>
          </motion.div>
        </div>
      </motion.section>
  );
}

/**
 * Global Presence (dark stage, below Testimonials):
 * Centered single-line heading and subtitle on top, semi-bold #56A6FF count-up stats in the
 * middle, and a full-width centered dotted world map on black below.
 */
export default function HomeGlobalPresence() {
  const sectionsConfig = useSectionsConfig();

  if (sectionsConfig["trust"] === false) return null;

  return (
    <HomeGlobalPresenceContent
      hasTestimonialsAbove={sectionsConfig["client-testimonials"] !== false}
      showTitle={sectionsConfig["trust-title"] !== false}
      showStats={sectionsConfig["trust-stats"] !== false}
    />
  );
}
