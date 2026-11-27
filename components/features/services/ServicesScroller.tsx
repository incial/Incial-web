"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { ServiceCategory } from "@/lib/serviceCatalog";
import { useAdaptiveProgress } from "@/lib/useAdaptiveProgress";
import DustCanvas from "./DustCanvas";
import IsoStage from "./IsoStage";
import { useStageLayout } from "./useStageLayout";
import { clamp01, smoothstep } from "./isoGeometry";

interface ServicesScrollerProps {
  categories: ReadonlyArray<ServiceCategory>;
  /** Scroll inside this element instead of the window (used by the homepage deck). */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Selector of an on-screen logo that dissolves into the dust at the start. */
  logoSource?: string;
  /** Open at the end of the section (coming back from the next one) instead of replaying it. */
  startAtEnd?: boolean;
  /** Open part-way through (0..1) with the intro skipped, e.g. from the navbar link. */
  startProgress?: number;
  /**
   * Phones: this section is laid over the landing slide, so the real logo dissolves into dust
   * in place as soon as the user starts scrolling, and the landing buttons fade away.
   */
  bridge?: boolean;
  /** Show the finished stack from the first pixel, with no logo intro. The outro still plays. */
  skipIntro?: boolean;
  /**
   * Extra scroll (in viewport heights) after the outro during which the finished logo stays
   * pinned and still, so the next section can take over while this one is still in place.
   */
  holdVh?: number;
  /** Phones: keep the landing logo untouched for this share of the hand-off while its buttons fade (see DustCanvas). */
  landingHold?: number;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SCROLL_PER_STEP_VH = 40;
const INTRO_SHARE = 0.1;
/** Scroll progress where the intro has just finished: the stack is open on its first plate. */
export const STACK_START_PROGRESS = INTRO_SHARE;
const OUTRO_SHARE = 0.1;
/** Share of each item's scroll during which it rests fully in focus (half before, half after the move). */
const ITEM_REST_SHARE = 0.3;
const ITEM_HEIGHT_REM = 3.2;
const HEADING_HEIGHT_REM = 9.5;
const FADE_NEAR_REM = 4;
const FADE_FAR_REM = 9;

interface FlowRow {
  key: string;
  kind: "heading" | "item";
  label: string;
  categoryIndex: number;
  top: number;
  height: number;
  center: number;
}

function buildFlow(categories: ReadonlyArray<ServiceCategory>) {
  const rows: FlowRow[] = [];
  const itemCenters: number[] = [];
  let cursor = 0;

  categories.forEach((category, categoryIndex) => {
    rows.push({
      key: `${category.id}-heading`,
      kind: "heading",
      label: category.headline,
      categoryIndex,
      top: cursor,
      height: HEADING_HEIGHT_REM,
      center: cursor + HEADING_HEIGHT_REM / 2,
    });
    cursor += HEADING_HEIGHT_REM;

    category.services.forEach((name) => {
      const center = cursor + ITEM_HEIGHT_REM / 2;
      rows.push({
        key: `${category.id}-${name}`,
        kind: "item",
        label: name,
        categoryIndex,
        top: cursor,
        height: ITEM_HEIGHT_REM,
        center,
      });
      itemCenters.push(center);
      cursor += ITEM_HEIGHT_REM;
    });
  });

  return { rows, itemCenters };
}

/**
 * Turns a continuous item position into one that pauses on each item: the integer part is kept,
 * and the move to the next item happens in the middle of the step, eased, so every item (and its
 * plate) is seen fully in focus before the next one comes in.
 */
function restOnItems(position: number): number {
  const base = Math.floor(position);
  const fraction = position - base;
  const half = ITEM_REST_SHARE / 2;
  return base + smoothstep((fraction - half) / (1 - ITEM_REST_SHARE));
}

/** 1 at the focus line, easing down to a faint trace far away. */
function fadeOf(distanceRem: number): number {
  if (distanceRem <= FADE_NEAR_REM) return 1 - (distanceRem / FADE_NEAR_REM) * 0.65;
  if (distanceRem <= FADE_FAR_REM) {
    return 0.35 - ((distanceRem - FADE_NEAR_REM) / (FADE_FAR_REM - FADE_NEAR_REM)) * 0.23;
  }
  return 0.12;
}

function HeadingRow({
  row,
  focus,
  position,
}: {
  row: FlowRow;
  focus: MotionValue<number>;
  position: MotionValue<number>;
}) {
  const opacity = useTransform([focus, position], ([f, p]: number[]) => {
    const presence = 1 - Math.min(1, Math.abs(p - row.categoryIndex));
    return Math.max(fadeOf(Math.abs(row.center - f)), presence * 0.9);
  });

  return (
    <motion.div
      style={{
        opacity,
        top: `${row.top}rem`,
        height: `${row.height}rem`,
      }}
      className="absolute left-0 right-0 flex flex-col justify-end pb-[1.1rem]"
    >
      <p className="mb-3 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-stage-ink/50">
        <span>{String(row.categoryIndex + 1).padStart(2, "0")}</span>
        <span className="h-px w-10 bg-stage-ink/25" />
      </p>
      <h2 className="font-[Poppins,sans-serif] text-[clamp(1.5rem,0.9rem+1.8vw,2.7rem)] font-bold leading-[1.05] text-stage-ink">
        {row.label}
      </h2>
    </motion.div>
  );
}

function ItemRow({ row, focus }: { row: FlowRow; focus: MotionValue<number> }) {
  const distance = useTransform(focus, (f) => Math.abs(row.center - f));
  const opacity = useTransform(distance, fadeOf);
  const x = useTransform(distance, (d) => Math.min(d, FADE_NEAR_REM) * 4);
  const markerScale = useTransform(distance, (d) => Math.max(0, 1 - d / 2.2));

  return (
    <motion.div
      style={{
        opacity,
        x,
        top: `${row.top}rem`,
        height: `${row.height}rem`,
      }}
      className="absolute left-0 right-0 flex items-center gap-4 border-b border-stage-ink/10"
    >
      <motion.span
        style={{ scaleX: markerScale }}
        className="h-px w-8 origin-left bg-blue-400"
      />
      <span className="font-[Poppins,sans-serif] text-[clamp(0.95rem,0.78rem+0.55vw,1.3rem)] font-medium text-stage-ink">
        {row.label}
      </span>
    </motion.div>
  );
}

export default function ServicesScroller({
  categories,
  scrollContainerRef,
  logoSource,
  startAtEnd = false,
  startProgress = 0,
  bridge = false,
  skipIntro = false,
  holdVh = 0,
  landingHold = 0,
}: ServicesScrollerProps) {
  const initialProgress = startAtEnd ? 1 : startProgress;
  const containerRef = useRef<HTMLDivElement>(null);
  const { stacked, spec } = useStageLayout();

  const { rows, itemCenters } = useMemo(() => buildFlow(categories), [categories]);
  const total = itemCenters.length;
  const lastIndex = Math.max(total - 1, 1);
  const scrollSteps = (total - 1) / (1 - INTRO_SHARE - OUTRO_SHARE);
  const flatToCategory = useMemo(
    () => categories.flatMap((c, i) => c.services.map(() => i)),
    [categories],
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });
  // follows the scroll smoothly with a speed limit: a fast flick still plays every plate and
  // item, and a jump (link, programmatic scroll) lands at once
  const smooth = useAdaptiveProgress(scrollYProgress, scrollSteps * SCROLL_PER_STEP_VH + holdVh);

  // Park at the end when arriving from the next section, so the section does not play its
  // whole animation to get there (the scroll position itself is set by the owner).
  useIsomorphicLayoutEffect(() => {
    if (initialProgress > 0) smooth.jump(initialProgress);
  }, [initialProgress, smooth]);

  // timeline: intro (centred dust logo moves into place, becomes isometric) | sections |
  // outro (stack folds back, logo returns to the centre)
  // with skipIntro the timeline starts where the intro ends: the stack is already built
  // with holdVh the timeline reaches its end early and then rests there for the hold
  const holdFactor = 1 + holdVh / (scrollSteps * SCROLL_PER_STEP_VH);
  const timeline = useTransform(smooth, (raw) => {
    const p = Math.min(1, raw * holdFactor);
    return skipIntro ? INTRO_SHARE + p * (1 - INTRO_SHARE) : p;
  });
  const intro = useTransform(timeline, (p) => clamp01(p / INTRO_SHARE));
  const outro = useTransform(timeline, (p) => clamp01((p - (1 - OUTRO_SHARE)) / OUTRO_SHARE));
  const collapse = useTransform(outro, (o) => smoothstep(o / 0.55));
  const morph = useTransform([intro, outro], ([i, o]: number[]) =>
    smoothstep(i) * (1 - smoothstep((o - 0.45) / 0.55)),
  );
  const active = useTransform(timeline, (p) =>
    restOnItems(clamp01((p - INTRO_SHARE) / (1 - INTRO_SHARE - OUTRO_SHARE)) * lastIndex),
  );
  const revealed = useTransform([active, morph, collapse], ([a, m, c]: number[]) =>
    (a + 1) * smoothstep((m - 0.85) / 0.15) * (1 - c),
  );

  // The stage starts centred on screen and settles into its layout position as `morph` rises.
  const stageRef = useRef<HTMLDivElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState({ x: 0, y: 0 });
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const parent = stage?.parentElement;
      if (!stage || !parent) return;
      const box = stage.getBoundingClientRect();
      const area = parent.getBoundingClientRect();
      const x = area.left + area.width / 2 - (box.left + box.width / 2);
      const y = area.top + area.height / 2 - (box.top + box.height / 2);
      setShift((prev) =>
        Math.abs(prev.x - x) < 0.5 && Math.abs(prev.y - y) < 0.5 ? prev : { x, y },
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [stacked]);
  const stageX = useTransform(morph, (m) => shift.x * (1 - m));
  const stageY = useTransform(morph, (m) => shift.y * (1 - m));

  const flatIndexes = useMemo(() => itemCenters.map((_, i) => i), [itemCenters]);
  const focus = useTransform(
    active,
    total > 1 ? flatIndexes : [0, 1],
    total > 1 ? itemCenters : [0, 0],
  );
  const position = useTransform(
    active,
    total > 1 ? flatIndexes : [0, 1],
    total > 1 ? flatToCategory : [0, 0],
  );
  const listY = useTransform(focus, (f) => `${-f}rem`);
  const listOpacity = useTransform([morph, collapse], ([m, c]: number[]) =>
    clamp01((m - 0.6) / 0.4) * (1 - 0.85 * c),
  );

  const stageClass = stacked
    ? "absolute left-1/2 top-[11dvh] w-[min(88vw,44dvh)] -translate-x-1/2"
    : "absolute left-[clamp(0rem,2vw,3rem)] top-1/2 w-[min(74vw,114vh)] -translate-y-1/2";
  const textClass = stacked
    ? "absolute inset-x-[6vw] bottom-[3dvh] top-[60dvh]"
    : "absolute inset-y-0 left-[clamp(20rem,57vw,52rem)] right-[clamp(1rem,4vw,5rem)] max-w-[40rem]";

  return (
    <section
      ref={containerRef}
      aria-label="Our services"
      style={{ height: `${scrollSteps * SCROLL_PER_STEP_VH + 100 + holdVh}vh` }}
      // in bridge mode this section is laid over the hero, so it must not swallow the hero's clicks
      className={`relative text-stage-ink ${bridge ? "pointer-events-none bg-transparent" : "bg-stage"}`}
    >
      <div
        className={`sticky top-0 h-screen w-full overflow-hidden supports-[height:100dvh]:h-dvh ${bridge ? "pointer-events-none" : ""}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_50%,rgba(255,255,255,0.05),transparent_60%)]"
        />

        {/* the dust: covers the whole screen so the logo can dissolve without clipping */}
        <DustCanvas
          spec={spec}
          anchorRef={stageInnerRef}
          morph={morph}
          revealed={revealed}
          active={active}
          plateCount={total}
          logoSource={logoSource}
          instant={initialProgress > 0 || skipIntro}
          entry={bridge ? intro : undefined}
          holdShare={landingHold}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* dust logo (centred) -> moves into place -> isometric stack, driven directly by scroll */}
        <div
          ref={stageRef}
          className={stageClass}
          style={{ aspectRatio: `${spec.viewW} / ${spec.viewH}` }}
        >
          <motion.div
            ref={stageInnerRef}
            style={{ x: stageX, y: stageY }}
            className="h-full w-full"
          >
            <IsoStage
              spec={spec}
              categories={categories}
              active={active}
              morph={morph}
              revealed={revealed}
            />
          </motion.div>
        </div>

        {/* one continuous flow: headings and sub-services glide past the focus line */}
        <div
          className={`${textClass} [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]`}
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ opacity: listOpacity }}
            className="absolute inset-x-0 top-1/2"
          >
            <motion.div style={{ y: listY }} className="relative">
              {rows.map((row) =>
                row.kind === "heading" ? (
                  <HeadingRow key={row.key} row={row} focus={focus} position={position} />
                ) : (
                  <ItemRow key={row.key} row={row} focus={focus} />
                ),
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
