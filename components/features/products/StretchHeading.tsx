"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { flexFont } from "./flexFont";

interface StretchHeadingProps {
  /** The words before the emphasised one (may be empty). */
  lead?: string;
  /** The word that grows the most while the text is hovered. */
  emphasis: string;
  /** Weight of the letters at rest (variable-font range 100 to 900). */
  baseWeight?: number;
  /** How much the emphasised word grows while hovered (1 = not at all). */
  emphasisGrow?: number;
  /** false keeps the letters still: no weight or width change on hover. */
  stretch?: boolean;
}

/** Poppins steps through these weights (it has no width axis, so width is set directly). */
const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
/** Letters far from the cursor thin out and squeeze to this fraction of their width. */
const FAR_WEIGHT = 100;
const FAR_SCALE = 0.42;
/** The letter under the cursor swells to the heaviest weight and this much wider. */
const NEAR_WEIGHT = 900;
const NEAR_SCALE = 1.5;
/** The swell spreads over this share of the text's width (a bell curve around the cursor). */
const SPREAD = 0.2;
/** How quickly letters catch up with their target (share of the gap closed per frame). */
const EASE = 0.16;
/** Scale of the other words while the text is hovered. */
const LEAD_GROW = 1.04;

interface Letter {
  weight: number;
  scale: number;
}

/** Natural width of each character at each weight, measured in the page's own font and size. */
type Metrics = Map<string, number[]>;

function measureMetrics(root: HTMLElement, characters: string[]): Metrics {
  const metrics: Metrics = new Map();
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return metrics;
  const style = getComputedStyle(root);
  const family = style.fontFamily;
  const size = style.fontSize;
  for (const character of new Set(characters)) {
    metrics.set(
      character,
      WEIGHTS.map((weight) => {
        context.font = `${weight} ${size} ${family}`;
        return context.measureText(character).width;
      }),
    );
  }
  return metrics;
}

/** Width of a character at a weight between two of the steps. */
function naturalWidth(widths: number[], weight: number): number {
  const position = Math.min(WEIGHTS.length - 1, Math.max(0, (weight - 100) / 100));
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return widths[low] + (widths[high] - widths[low]) * (position - low);
}

/**
 * A line of text that bends to the cursor. While the cursor is over it the letters under it swell
 * to the heaviest, widest forms of the font and the ones further away thin out and condense, so a
 * bulge travels along the word with the pointer; the freed space opens up between the letters.
 * The words also grow a little (the emphasised one most). Everything eases back when the cursor
 * leaves.
 */
export default function StretchHeading({ lead = "", emphasis, baseWeight = 400, emphasisGrow = 1.32, stretch = true }: StretchHeadingProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const state = useRef<Letter[]>([]);
  const pointer = useRef<number | null>(null);
  const restWidth = useRef(0);
  const metrics = useRef<Metrics>(new Map());
  const frame = useRef(0);
  const [hovering, setHovering] = useState(false);
  // each word keeps its resting width while its letters reshape, so nothing shifts under the pointer
  const [locked, setLocked] = useState<number[] | null>(null);

  const words = [
    ...lead.split(" ").filter(Boolean).map((text) => ({ text, grow: LEAD_GROW })),
    { text: emphasis, grow: emphasisGrow },
  ];
  let letterCount = 0;
  const layout = words.map((word) => {
    const start = letterCount;
    letterCount += word.text.length;
    return { ...word, start };
  });

  useEffect(() => {
    const frameId = frame;
    return () => cancelAnimationFrame(frameId.current);
  }, []);

  function tick() {
    frame.current = 0;
    let moving = false;
    const cursorX = pointer.current;
    const spread = Math.max(80, restWidth.current * SPREAD);

    letterRefs.current.forEach((element, index) => {
      if (!element) return;
      const current = (state.current[index] ??= { weight: baseWeight, scale: 1 });

      let weightTarget = baseWeight;
      let scaleTarget = 1;
      if (cursorX !== null) {
        const box = element.getBoundingClientRect();
        const distance = cursorX - (box.left + box.width / 2);
        const closeness = Math.exp(-((distance / spread) ** 2));
        weightTarget = FAR_WEIGHT + (NEAR_WEIGHT - FAR_WEIGHT) * closeness;
        scaleTarget = FAR_SCALE + (NEAR_SCALE - FAR_SCALE) * closeness;
      }

      const weightGap = weightTarget - current.weight;
      const scaleGap = scaleTarget - current.scale;
      if (Math.abs(weightGap) > 1 || Math.abs(scaleGap) > 0.01) moving = true;
      current.weight += weightGap * EASE;
      current.scale += scaleGap * EASE;

      // the weight steps through Poppins' own weights; the width is set by squeezing or stretching
      // the letter and giving it exactly that much room, so the gaps open up as letters thin out
      element.style.fontWeight = String(Math.round(current.weight / 100) * 100);
      const widths = metrics.current.get(element.textContent ?? "");
      element.style.transform = `scaleX(${current.scale.toFixed(3)})`;
      if (widths) element.style.width = `${(naturalWidth(widths, current.weight) * current.scale).toFixed(1)}px`;
    });

    // keep running while the cursor is over the text, and until the letters have settled
    if (moving || cursorX !== null) {
      frame.current = requestAnimationFrame(tick);
    } else {
      // settled: hand the letters back to their ordinary layout
      letterRefs.current.forEach((element) => {
        if (!element) return;
        element.style.width = "";
        element.style.transform = "";
        element.style.fontWeight = String(baseWeight);
      });
      state.current = [];
      setLocked(null);
    }
  }

  function start() {
    if (!frame.current) frame.current = requestAnimationFrame(tick);
  }

  const interactive = stretch && !reduced;

  return (
    <span
      ref={rootRef}
      aria-label={[lead, emphasis].filter(Boolean).join(" ")}
      className={`${flexFont.className} inline-flex cursor-default flex-wrap items-baseline justify-center gap-x-[0.28em]`}
      onPointerEnter={
        interactive
          ? (event) => {
              if (!locked) {
                restWidth.current = rootRef.current?.offsetWidth ?? 0;
                if (rootRef.current) metrics.current = measureMetrics(rootRef.current, layout.flatMap((word) => word.text.split("")));
                setLocked(layout.map((_, index) => wordRefs.current[index]?.offsetWidth ?? 0));
              }
              pointer.current = event.clientX;
              setHovering(true);
              start();
            }
          : undefined
      }
      onPointerMove={
        interactive
          ? (event) => {
              pointer.current = event.clientX;
              start();
            }
          : undefined
      }
      onPointerLeave={
        interactive
          ? () => {
              pointer.current = null;
              setHovering(false);
              start();
            }
          : undefined
      }
    >
      {layout.map((word, wordIndex) => (
        <span
          key={`${word.text}-${wordIndex}`}
          ref={(element) => {
            wordRefs.current[wordIndex] = element;
          }}
          aria-hidden
          className="inline-flex items-baseline justify-between whitespace-pre transition-transform duration-300 ease-out"
          style={{
            width: locked ? locked[wordIndex] : undefined,
            transform: hovering ? `scale(${word.grow})` : "scale(1)",
            transformOrigin: "50% 80%",
          }}
        >
          {word.text.split("").map((character, index) => (
            <span
              key={index}
              ref={(element) => {
                letterRefs.current[word.start + index] = element;
              }}
              className="inline-block origin-left"
              style={{ fontWeight: baseWeight }}
            >
              {character}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
