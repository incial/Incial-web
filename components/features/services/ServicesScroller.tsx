"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { ServiceCategory } from "@/lib/serviceCatalog";
import DustCanvas from "./DustCanvas";
import IsoStage from "./IsoStage";
import { useStageLayout } from "./useStageLayout";
import { clamp01, smoothstep } from "./isoGeometry";

interface ServicesScrollerProps {
  categories: ReadonlyArray<ServiceCategory>;
  label?: string;
  /** Scroll inside this element instead of the window (used by the homepage deck). */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Selector of an on-screen logo that dissolves into the dust at the start. */
  logoSource?: string;
  /** Open at the end of the section (coming back from the next one) instead of replaying it. */
  startAtEnd?: boolean;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SCROLL_PER_STEP_VH = 45;
const INTRO_SHARE = 0.1;
const OUTRO_SHARE = 0.1;
const ITEM_HEIGHT_REM = 3.6;
const HEADING_HEIGHT_REM = 11;
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
      <p className="mb-3 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/50">
        <span>{String(row.categoryIndex + 1).padStart(2, "0")}</span>
        <span className="h-px w-10 bg-white/25" />
      </p>
      <h2 className="font-[Poppins,sans-serif] text-[clamp(1.8rem,1rem+2.2vw,3.4rem)] font-bold leading-[1.05] text-white">
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
      className="absolute left-0 right-0 flex items-center gap-4 border-b border-white/10"
    >
      <motion.span
        style={{ scaleX: markerScale }}
        className="h-px w-8 origin-left bg-blue-400"
      />
      <span className="font-[Poppins,sans-serif] text-[clamp(1.05rem,0.85rem+0.7vw,1.6rem)] font-medium text-white">
        {row.label}
      </span>
    </motion.div>
  );
}

export default function ServicesScroller({
  categories,
  label = "Services / 2026",
  scrollContainerRef,
  logoSource,
  startAtEnd = false,
}: ServicesScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stacked, spec } = useStageLayout();

  const { rows, itemCenters } = useMemo(() => buildFlow(categories), [categories]);
  const total = itemCenters.length;
  const lastIndex = Math.max(total - 1, 1);
  const flatToCategory = useMemo(
    () => categories.flatMap((c, i) => c.services.map(() => i)),
    [categories],
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  // Park the spring at the end when arriving from the next section, so the section does not
  // play its whole animation to get there (the scroll position itself is set by the owner).
  useIsomorphicLayoutEffect(() => {
    if (startAtEnd) smooth.jump(1);
  }, [startAtEnd, smooth]);

  // timeline: intro (centred dust logo moves into place, becomes isometric) | sections |
  // outro (stack folds back, logo returns to the centre)
  const intro = useTransform(smooth, (p) => clamp01(p / INTRO_SHARE));
  const outro = useTransform(smooth, (p) => clamp01((p - (1 - OUTRO_SHARE)) / OUTRO_SHARE));
  const collapse = useTransform(outro, (o) => smoothstep(o / 0.55));
  const morph = useTransform([intro, outro], ([i, o]: number[]) =>
    smoothstep(i) * (1 - smoothstep((o - 0.45) / 0.55)),
  );
  const active = useTransform(
    smooth,
    (p) => clamp01((p - INTRO_SHARE) / (1 - INTRO_SHARE - OUTRO_SHARE)) * lastIndex,
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
  const counter = useTransform(
    position,
    (v) =>
      `${String(Math.round(v) + 1).padStart(2, "0")} / ${String(categories.length).padStart(2, "0")}`,
  );

  const scrollSteps = (total - 1) / (1 - INTRO_SHARE - OUTRO_SHARE);

  const stageClass = stacked
    ? "absolute left-1/2 top-[11dvh] w-[min(100vw,50dvh)] -translate-x-1/2"
    : "absolute left-[clamp(0rem,2vw,3rem)] top-1/2 w-[min(88vw,136vh)] -translate-y-1/2";
  const textClass = stacked
    ? "absolute inset-x-[6vw] bottom-[3dvh] top-[60dvh]"
    : "absolute inset-y-0 left-[clamp(20rem,57vw,52rem)] right-[clamp(1rem,4vw,5rem)] max-w-[40rem]";
  const counterClass = stacked
    ? "absolute right-[6vw] top-[57dvh]"
    : "absolute bottom-[8%] left-[clamp(1rem,3vw,3rem)]";

  return (
    <section
      ref={containerRef}
      aria-label="Our services"
      style={{ height: `${scrollSteps * SCROLL_PER_STEP_VH + 100}vh` }}
      className="relative bg-black text-white"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden supports-[height:100dvh]:h-dvh">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_50%,rgba(255,255,255,0.05),transparent_60%)]"
        />

        {!stacked && (
          <span className="absolute left-[clamp(1rem,3vw,3rem)] top-[14%] z-10 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/70">
            {label}
          </span>
        )}

        {/* the dust: covers the whole screen so the logo can dissolve without clipping */}
        <DustCanvas
          spec={spec}
          anchorRef={stageInnerRef}
          morph={morph}
          revealed={revealed}
          active={active}
          plateCount={total}
          logoSource={logoSource}
          instant={startAtEnd}
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

        <motion.span
          className={`${counterClass} font-mono text-[0.65rem] tracking-[0.2em] text-white/60`}
        >
          {counter}
        </motion.span>

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
