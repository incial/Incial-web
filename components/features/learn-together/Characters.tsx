"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * The LearnTogether crew: high-quality illustrated mascots (PNG) for each track.
 * image 18 → Coder  (blue cat, round shades, waving)
 * image 15 → Marketer (lamb, headphones, running)
 * image 14 → Maker   (green cat, skateboard)
 * image 17 → Designer (dark-hoodie figure on beanbag with laptop)
 *
 * The Peeker (the Incial mark peeking over a ledge) remains an SVG because it
 * uses only the head, not the full illustrated body.
 *
 * CSS classes lt-sway, lt-wave, lt-bob etc. are still applied via className so
 * the existing globals.css animations continue to work.
 */

export type CharacterName = "designer" | "coder" | "marketer" | "maker";

interface CharacterProps {
  className?: string;
}

/** Paths under /public — served as static assets, immutable per deploy. */
const MASCOT_SRC: Record<CharacterName, string> = {
  designer: "/images/learn-together/mascot-designer.png",
  coder: "/images/learn-together/mascot-coder.png",
  marketer: "/images/learn-together/mascot-marketer.png",
  maker: "/images/learn-together/mascot-maker.png",
};

/** Alt text for each character (aria-hidden on the wrapper; kept for a11y if wrapper is visible). */
const MASCOT_ALT: Record<CharacterName, string> = {
  designer: "Incial Designer mascot — a hooded figure coding on a beanbag with floating UI windows",
  coder: "Incial Coder mascot — a blue cat with round shades, waving",
  marketer: "Incial Marketer mascot — a running lamb in a varsity jacket with headphones",
  maker: "Incial Maker mascot — a green cat pulling a trick on a skateboard",
};

/** One illustrated PNG character, wrapped so it behaves like the old SVG mascots. */
function Mascot({ name, className = "" }: CharacterProps & { name: CharacterName }) {
  return (
    <span
      className={`lt-sway block ${className}`}
      style={{ transformOrigin: "50% 96%", display: "block" }}
      aria-hidden
    >
      <Image
        src={MASCOT_SRC[name]}
        alt={MASCOT_ALT[name]}
        width={600}
        height={600}
        className="h-auto w-full object-contain"
        draggable={false}
        priority={name === "coder" || name === "designer"}
      />
    </span>
  );
}

export function Designer({ className = "" }: CharacterProps) {
  return <Mascot name="designer" className={className} />;
}
export function Coder({ className = "" }: CharacterProps) {
  return <Mascot name="coder" className={className} />;
}
export function Marketer({ className = "" }: CharacterProps) {
  return <Mascot name="marketer" className={className} />;
}
export function Maker({ className = "" }: CharacterProps) {
  return <Mascot name="maker" className={className} />;
}

export function Character({ name, className = "" }: CharacterProps & { name: CharacterName }) {
  return <Mascot name={name} className={className} />;
}

const CAST_ORDER: CharacterName[] = ["designer", "coder", "marketer", "maker"];

/**
 * A mascot you can click: it hops and turns into the next member of the crew. `start` picks who
 * appears first (fixed, so the server and the browser draw the same character).
 */
export function SwapMascot({ start, className = "", label = "Switch character" }: CharacterProps & { start: CharacterName; label?: string }) {
  const [name, setName] = useState<CharacterName>(start);
  const hopRef = useRef<HTMLSpanElement>(null);

  const swap = () => {
    setName((current) => CAST_ORDER[(CAST_ORDER.indexOf(current) + 1) % CAST_ORDER.length]);
    const hop = hopRef.current;
    if (!hop || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.timeline({ overwrite: "auto" })
      .to(hop, { y: -26, scale: 1.08, rotation: -5, duration: 0.18, ease: "power2.out" })
      .to(hop, { y: 0, scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1.2, 0.5)" });
  };

  return (
    <button
      type="button"
      onClick={swap}
      aria-label={label}
      className={`pointer-events-auto block cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 focus-visible:outline-offset-4 ${className}`}
    >
      <span ref={hopRef} className="block origin-bottom">
        <span key={name} className="lt-bubble block">
          <Mascot name={name} />
        </span>
      </span>
    </button>
  );
}

// ─── Peeker ──────────────────────────────────────────────────────────────────
// The peeking head (Incial mark + eyes) remains a hand-drawn SVG because it only
// shows the head — there is no matching full-body PNG for this composition.

const INK = "#151716";
const WHITE = "#ffffff";
const SHADE = "rgba(21,23,22,0.16)";
const STROKE = 7;

const DOT = { cx: 225, cy: 211, r: 61 };
const LEFT_ARCH = "M150 417 C150 342.4 211.4 282 286 282 V509 H150 Z";
const RIGHT_ARCH = "M309 150 C400.7 150 476 224.3 476 316 V509 H309 Z";
const HEAD_TRANSFORM = "translate(8 -78) scale(0.65)";

function Glove({ x, y, r = 20, rotate = 0 }: { x: number; y: number; r?: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.92} fill={WHITE} stroke={INK} strokeWidth={STROKE} />
      <ellipse cx={x - r * 0.85} cy={y - r * 0.15} rx={r * 0.38} ry={r * 0.26} fill={WHITE} stroke={INK} strokeWidth={STROKE - 1} />
      <path d={`M${x - r * 0.3} ${y - r * 0.55} V${y - r * 0.05} M${x + r * 0.2} ${y - r * 0.55} V${y - r * 0.05}`} stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

function PeekerHead() {
  const eyeL = { x: 228, y: 418 };
  const eyeR = { x: 380, y: 404 };
  return (
    <g transform={HEAD_TRANSFORM}>
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={WHITE} stroke={INK} strokeWidth={STROKE / 0.65} />
      <path d={LEFT_ARCH} fill={WHITE} stroke={INK} strokeWidth={STROKE / 0.65} strokeLinejoin="round" />
      <path d={RIGHT_ARCH} fill={WHITE} stroke={INK} strokeWidth={STROKE / 0.65} strokeLinejoin="round" />
      <path d="M150 440 C150 480 160 509 200 509 H150 Z" fill={SHADE} />
      <path d="M476 316 V509 H420 C460 470 476 400 476 316Z" fill={SHADE} />
      <g className="lt-blink" style={{ transformOrigin: `${(eyeL.x + eyeR.x) / 2}px ${eyeR.y}px` }}>
        {[eyeL, eyeR].map((eye) => (
          <g key={eye.x}>
            <ellipse cx={eye.x} cy={eye.y} rx="30" ry="40" fill={INK} />
            <g className="lt-pupils">
              <ellipse cx={eye.x + 8} cy={eye.y - 14} rx="10" ry="13" fill={WHITE} />
              <circle cx={eye.x - 10} cy={eye.y + 16} r="5" fill={WHITE} />
            </g>
          </g>
        ))}
      </g>
      <ellipse cx="190" cy="478" rx="22" ry="12" fill="#ff8fa3" opacity="0.75" />
      <ellipse cx="430" cy="466" rx="22" ry="12" fill="#ff8fa3" opacity="0.75" />
      <path d="M282 474 Q296 492 300 476 Q306 494 322 470" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function StickerFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-15%" y="-10%" width="130%" height="125%" colorInterpolationFilters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="10" result="grown" />
      <feFlood floodColor="#ffffff" result="white" />
      <feComposite in="white" in2="grown" operator="in" result="border" />
      <feMerge>
        <feMergeNode in="border" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/** The mascot's head (the Incial mark with eyes) peeking up over an edge, gloves on the ledge. */
export function Peeker({ className = "" }: CharacterProps) {
  const filterId = `lt-sticker-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="30 30 380 290" className={className} aria-hidden>
      <defs>
        <StickerFilter id={filterId} />
      </defs>
      <g filter={`url(#${filterId})`}>
        <g transform="translate(-4 40)">
          <PeekerHead />
        </g>
        <Glove x={92} y={300} r={28} />
        <Glove x={338} y={300} r={28} />
      </g>
    </svg>
  );
}
