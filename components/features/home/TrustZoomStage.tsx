"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import ClientWorldMap from "@/components/features/home/ClientWorldMap";
import { LOGO_BOX_WIDTH } from "@/components/features/home/LogoScreen";
import { isValidLocation } from "@/lib/clientLocations";
import { fetchCachedJson } from "@/lib/publicCache";
import { useClientsData } from "@/lib/useClientsData";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

interface Stat {
  id: string;
  value: string;
  label: string;
}

interface TrustApiData {
  title: string;
  stats: Stat[];
}

interface TrustZoomStageProps {
  /** 0 -> 1 while the next section rises over this one: the content drifts up and dims. */
  exit?: MotionValue<number>;
  /**
   * 0..1 timeline of the whole transition: the logo fades in, the camera dives through it,
   * the section appears from the middle, then it holds (scroll-driven on desktop, timed on phones).
   */
  progress: MotionValue<number>;
  /** Paint an opaque black backdrop (desktop, where the stage covers the page behind it). */
  withBackdrop?: boolean;
  /** Tailwind size classes for the solid logo; defaults to the desktop hero logo size. */
  logoClassName?: string;
}

const DEFAULT_STATS: Stat[] = [
  { id: "1", value: "100+", label: "Projects Completed" },
  { id: "2", value: "60+", label: "Happy Clients" },
];

const ACCENT = "#56A6FF";
const WHITE = "#ffffff";

// timeline (fractions of `progress`)
const DISSOLVE_END = 0.08; // the grainy logo turns into the solid white one
const DIVE_START = 0.09;
const DIVE_END = 0.45;
const REVEAL_START = 0.3;
const REVEAL_END = 0.58;
const MAP_PLAY_AT = 0.55;
const DOOR_VIEW_START = 0.1;

const DIVE_ZOOM = 90; // the logo grows this much while the camera passes through it
const DOOR_SLIDE = 10; // extra distance each half slides apart, in SVG units
const EXPAND = 4000; // how far the logo's outer edges grow, in SVG units
const GRAIN_SLOPE = 30; // sharpness of the grain mask edge
const CURVE = 0.5523; // bezier handle length of a quarter ellipse

/** Zoom centre: the gap between the logo's two halves (SVG units). */
const GAP_X = 297.5;
const GAP_Y = 330;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

/* ── The logo as two doors: the gap between its halves is the doorway ── */

/** The left arch with its outer edges moved out by `grow`; at 0 it is the logo's own shape. */
function leftArchPath(grow: number): string {
  const rx = 136 + grow;
  const ry = 135 + grow;
  const outerX = 150 - grow;
  const topY = 282 - grow;
  return [
    `M${outerX} 417`,
    `C${outerX} ${417 - CURVE * ry} ${286 - CURVE * rx} ${topY} 286 ${topY}`,
    `V${509 + grow}H${outerX}V417Z`,
  ].join("");
}

/** The right arch with its outer edges moved out by `grow`. */
function rightArchPath(grow: number): string {
  const rx = 167 + grow;
  const ry = 166 + grow;
  const outerX = 476 + grow;
  const topY = 316 - ry;
  return [
    `M309 ${topY}`,
    `C${309 + CURVE * rx} ${topY} ${outerX} ${316 - CURVE * ry} ${outerX} 316`,
    `V${509 + grow}H309V${topY}Z`,
  ].join("");
}

function zoomAround(scale: number): string {
  return `translate(${GAP_X} ${GAP_Y}) scale(${scale}) translate(${-GAP_X} ${-GAP_Y})`;
}

/**
 * The white logo stays solid while the camera pushes into the gap between its halves: the halves
 * part like doors and rush past the screen edges, opening onto the section behind them.
 * Written straight to the SVG on each frame (no React renders while scrolling).
 */
function LogoDoors({
  dive,
  melt,
  sizeClass,
}: {
  dive: MotionValue<number>;
  /** 0 -> 1 while the grainy logo dissolves into the solid white one. */
  melt: MotionValue<number>;
  /** Draw the logo exactly as large as the hero logo (and so as the dust it collapses to). */
  sizeClass: string;
}) {
  const mainRef = useRef<SVGGElement>(null);
  const leftRef = useRef<SVGGElement>(null);
  const rightRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGRectElement>(null);
  const leftArchRef = useRef<SVGPathElement>(null);
  const rightArchRef = useRef<SVGPathElement>(null);
  const wordmarkRef = useRef<SVGImageElement>(null);
  const dissolveRef = useRef<SVGGElement>(null);
  const cutoffRef = useRef<SVGFEFuncAElement>(null);

  const apply = useCallback(() => {
    const d = dive.get();
    const opening = smoothstep(d / 0.7) * DOOR_SLIDE;
    // the logo's own outer edges grow outward (inner edges stay put, so the gap stays open)
    const grow = smoothstep((d - 0.03) / 0.22) * EXPAND;

    const m = melt.get();
    mainRef.current?.setAttribute("opacity", m > 0 ? "1" : "0");
    // while melting, the white logo is revealed through a grain mask that fills in (the logo
    // turns from grains into solid white); afterwards the filter is dropped
    if (m < 1) {
      dissolveRef.current?.setAttribute("filter", "url(#trust-dissolve)");
      cutoffRef.current?.setAttribute("intercept", String(-GRAIN_SLOPE * (0.9 - 0.75 * m)));
    } else {
      dissolveRef.current?.removeAttribute("filter");
    }
    mainRef.current?.setAttribute("transform", zoomAround(Math.exp(d * Math.log(DIVE_ZOOM))));
    leftRef.current?.setAttribute("transform", `translate(${-opening} 0)`);
    rightRef.current?.setAttribute("transform", `translate(${opening} 0)`);

    const dot = dotRef.current;
    if (dot) {
      dot.setAttribute("x", String(164 - grow));
      dot.setAttribute("y", String(150 - grow));
      dot.setAttribute("width", String(122 + 2 * grow));
      dot.setAttribute("height", String(122 + 2 * grow));
      dot.setAttribute("rx", String(61 + grow));
    }
    leftArchRef.current?.setAttribute("d", leftArchPath(grow));
    rightArchRef.current?.setAttribute("d", rightArchPath(grow));

    wordmarkRef.current?.setAttribute("opacity", String(1 - smoothstep(d / 0.05)));
  }, [dive, melt]);

  useEffect(apply, [apply]);
  useMotionValueEvent(dive, "change", apply);
  useMotionValueEvent(melt, "change", apply);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 626 590"
        className={`aspect-[626/590] overflow-visible ${
          sizeClass
        }`}
      >
        <defs>
          {/* keeps the growing dot on its own side of the gap */}
          <clipPath id="trust-left-half">
            <rect x="-100000" y="-100000" width="100286" height="200000" />
          </clipPath>
          {/* grain mask: noise above a rising threshold shows the logo, so it fills in grain by grain */}
          <filter
            id="trust-dissolve"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="626"
            height="590"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="1" seed="7" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
              result="grain"
            />
            <feComponentTransfer in="grain" result="mask">
              <feFuncA ref={cutoffRef} type="linear" slope={GRAIN_SLOPE} intercept={-GRAIN_SLOPE * 0.9} />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="mask" operator="in" />
          </filter>
        </defs>
        <g ref={mainRef} fill={WHITE} opacity={0}>
          <g ref={dissolveRef}>
            <g ref={leftRef}>
              <rect ref={dotRef} x="164" y="150" width="122" height="122" rx="61" clipPath="url(#trust-left-half)" />
              <path ref={leftArchRef} d="M150 417C150 342.442 211.442 282 286 282V509H150V417Z" />
            </g>
            <g ref={rightRef}>
              <path ref={rightArchRef} d="M309 150C400.679 150 476 224.321 476 316V509H309V150Z" />
            </g>
            <image ref={wordmarkRef} href="/logo/Logoo-white.svg" width="626" height="590" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ── Text effects ── */

/** Counts the number inside `value` up from 0 as `reveal` rises ("100+" -> "37" -> "100+"). */
function CountUp({ value, reveal }: { value: string; reveal: MotionValue<number> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parts = useMemo(() => /^(\D*)([\d,]+)(.*)$/.exec(value), [value]);

  const render = (amount: number) => {
    if (!ref.current || !parts) return;
    const target = Number(parts[2].replace(/,/g, ""));
    const shown = Math.round(target * clamp01(amount));
    ref.current.textContent = `${parts[1]}${shown.toLocaleString("en-US")}${parts[3]}`;
  };

  useEffect(() => render(reveal.get()));
  useMotionValueEvent(reveal, "change", render);

  return <span ref={ref}>{value}</span>;
}

/** A word that slides up and turns from the accent colour to white as `reveal` passes it. */
function WipeWord({
  word,
  index,
  count,
  reveal,
  isBrand,
}: {
  word: string;
  index: number;
  count: number;
  reveal: MotionValue<number>;
  isBrand: boolean;
}) {
  const start = (index / count) * 0.55;
  const t = useTransform(reveal, [start, start + 0.45], [0, 1], { clamp: true });
  const color = useTransform(t, [0, 0.45, 1], [ACCENT, ACCENT, isBrand ? ACCENT : WHITE]);
  const y = useTransform(t, [0, 1], ["0.6em", "0em"]);

  return (
    <motion.span style={{ opacity: t, y, color }} className="inline-block">
      {word}
    </motion.span>
  );
}

function WipeTitle({ title, reveal }: { title: string; reveal: MotionValue<number> }) {
  const words = title.split(/\s+/).filter(Boolean);
  return (
    <h2 className="text-[clamp(2.1rem,1.2rem+3vw,3.4rem)] font-light italic leading-tight tracking-tight">
      {words.map((word, index) => {
        const isBrand = word.startsWith("Incial");
        return (
          <span key={`${word}-${index}`} className={`mr-[0.28em] inline-block last:mr-0 ${isBrand ? "font-bold not-italic" : ""}`}>
            <WipeWord
              word={word}
              index={index}
              count={words.length}
              reveal={reveal}
              isBrand={isBrand}
            />
          </span>
        );
      })}
    </h2>
  );
}

function StatItem({
  stat,
  index,
  reveal,
}: {
  stat: Stat;
  index: number;
  reveal: MotionValue<number>;
}) {
  const from = 0.25 + index * 0.18;
  const opacity = useTransform(reveal, [from, from + 0.4], [0, 1], { clamp: true });
  const y = useTransform(reveal, [from, from + 0.4], [24, 0], { clamp: true });

  return (
    <motion.div style={{ opacity, y }} className="flex min-w-[7rem] flex-col items-center md:min-w-[11rem]">
      <div className="text-[clamp(3rem,1.6rem+3.6vw,4.4rem)] font-bold italic leading-none tracking-tighter text-[#56A6FF]">
        <CountUp value={stat.value} reveal={reveal} />
      </div>
      <div className="mt-2 text-base font-normal tracking-wide text-white md:text-lg">{stat.label}</div>
    </motion.div>
  );
}

/**
 * "Why Trust Incial?": the logo is entered like a tunnel and the section opens from its centre,
 * with the headline sweeping in word by word, the numbers counting up, and a map of clients.
 */
export default function TrustZoomStage({
  progress,
  exit,
  withBackdrop = false,
  logoClassName,
}: TrustZoomStageProps) {
  const idleExit = useMotionValue(0);
  const exitProgress = exit ?? idleExit;
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [title, setTitle] = useState("Why Trust Incial?");
  const [isMapPlaying, setIsMapPlaying] = useState(false);
  const sectionsConfig = useSectionsConfig();
  const clients = useClientsData();

  useEffect(() => {
    fetchCachedJson<TrustApiData>("/api/admin/trust")
      .then((payload) => {
        if (payload?.stats?.length) setStats(payload.stats);
        if (payload?.title) setTitle(payload.title);
      })
      .catch(() => {});
  }, []);

  const locations = useMemo(
    () => (clients?.clients ?? []).map((client) => client.location).filter(isValidLocation),
    [clients],
  );

  // a hard cut from the services stack to the white logo: no fade, no crossfade
  const melt = useTransform(progress, (p) => clamp01(p / DISSOLVE_END));
  // the black backdrop fades in as the white logo fills in, so the dust logo fades out beneath it
  // while the solid logo grows over it: one cross-feed between the two
  const backdrop = melt;
  const dive = useTransform(progress, (p) => clamp01((p - DIVE_START) / (DIVE_END - DIVE_START)));
  const reveal = useTransform(progress, (p) =>
    smoothstep((p - REVEAL_START) / (REVEAL_END - REVEAL_START)),
  );
  // the section sits behind the doors from the start and is seen through the widening gap
  const doorView = useTransform(progress, (p) => smoothstep((p - DOOR_VIEW_START) / 0.1));
  const contentScale = useTransform([progress, exitProgress], ([p, e]: number[]) => {
    return (0.88 + 0.12 * smoothstep((p - DOOR_VIEW_START) / 0.4)) * (1 - 0.06 * e);
  });
  // parallax exit: this layer travels at about a third of the scroll speed, so the next section
  // appears to slide over it, and it dims as it is covered
  const contentY = useTransform(exitProgress, (e) => `${-e * 34}dvh`);
  const contentOpacity = useTransform([doorView, exitProgress], ([v, e]: number[]) => v * (1 - 0.55 * e));

  useMotionValueEvent(progress, "change", (p) => {
    const next = p >= MAP_PLAY_AT;
    setIsMapPlaying((previous) => (previous === next ? previous : next));
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {withBackdrop && <motion.div style={{ opacity: backdrop }} className="absolute inset-0 bg-black" />}

      <motion.div
        style={{ opacity: contentOpacity, scale: contentScale, y: contentY }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-[min(4dvh,2rem)] px-4 pt-[clamp(4.5rem,9dvh,7rem)] text-center md:px-12"
      >
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#56A6FF]/10 via-transparent to-transparent opacity-50 blur-3xl" />

        {sectionsConfig["trust-title"] !== false && <WipeTitle title={title} reveal={reveal} />}

        {sectionsConfig["trust-stats"] !== false && (
          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6 md:gap-x-24">
            {stats.map((stat, index) => (
              <StatItem key={stat.id || index} stat={stat} index={index} reveal={reveal} />
            ))}
          </div>
        )}

        <div
          className="-mx-4 w-[calc(100%+2rem)] md:mx-0 md:w-[min(100%,calc(58dvh*2),90rem)]"
          style={{
            maskImage: "radial-gradient(ellipse at center, #000 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 60%, transparent 100%)",
          }}
        >
          <ClientWorldMap locations={locations} play={isMapPlaying} />
        </div>
      </motion.div>

      <LogoDoors
        dive={dive}
        melt={melt}
        sizeClass={logoClassName ?? (withBackdrop ? `${LOGO_BOX_WIDTH} h-auto` : "h-[min(56dvh,92vw)]")}
      />
    </div>
  );
}
