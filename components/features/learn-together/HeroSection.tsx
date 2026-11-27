"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ShaderBackground from "@/components/ui/ShaderBackground";
import { LT_COLORS } from "./content";
import IntroPanel from "./IntroPanel";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

const GREEN = "#8fd463";
const INK = "#1d2b17";
const BUBBLE_MS = 1800;

// ── Character roster ──────────────────────────────────────────────────────────
// Uniform visual sizing: each character has a `scale` tuning factor so the
// wide beanbag (Designer) and tall standing cats/lamb read as the same size.
const CHARACTERS = [
  {
    key: "designer",
    src: "/images/learn-together/mascot-designer.png",
    alt: "Designer mascot",
    says: "Make it beautiful! ✨",
    badgeBg: "#e9d8ff",
    tilt: -4,
    scale: 1.08,
  },
  {
    key: "coder",
    src: "/images/learn-together/mascot-coder.png",
    alt: "Coder mascot",
    says: "Ship it! 🚀",
    badgeBg: "#cce7ff",
    tilt: -1.5,
    scale: 0.96,
  },
  {
    key: "marketer",
    src: "/images/learn-together/mascot-marketer.png",
    alt: "Marketer mascot",
    says: "Tell everyone! 📣",
    badgeBg: "#ffd8d2",
    tilt: 1.5,
    scale: 0.98,
  },
  {
    key: "maker",
    src: "/images/learn-together/mascot-maker.png",
    alt: "Maker mascot",
    says: "Big idea! 💡",
    badgeBg: "#fff0b8",
    tilt: 4,
    scale: 1.02,
  },
] as const;

type CharKey = (typeof CHARACTERS)[number]["key"];

const INITIAL_SLOTS: CharKey[] = ["designer", "coder", "marketer", "maker"];

// the crew stands as one group at the centre: two at the back (higher, smaller), two in front
const SLOT_LAYOUT = [
  { left: 4, bottom: 16, width: 34, height: 74, z: 1 },
  { left: 23, bottom: 0, width: 32, height: 78, z: 3 },
  { left: 45, bottom: 2, width: 32, height: 78, z: 2 },
  { left: 62, bottom: 18, width: 34, height: 72, z: 1 },
] as const;

// on phones the crew stands in two overlapping rows (two behind, two in front), so each is bigger
const SLOT_LAYOUT_PHONE = [
  { left: -2, bottom: 40, width: 52, height: 52, z: 1 },
  { left: 2, bottom: 0, width: 54, height: 58, z: 3 },
  { left: 46, bottom: 2, width: 54, height: 58, z: 2 },
  { left: 47, bottom: 42, width: 52, height: 52, z: 1 },
] as const;

// ── Background decorations (Geniestudio-inspired clouds, sparkles, stars) ─────

/** Multi-lobed crisp white cloud silhouette. */
type Hooks = { [key: `data-${string}`]: boolean | string | undefined };

function Cloud({ className, opacity = 0.65, ...hooks }: { className?: string; opacity?: number } & Hooks) {
  return (
    <svg viewBox="0 0 260 120" aria-hidden className={className} style={{ opacity }} {...hooks}>
      <path
        d="M35 110 H225 C244 110 256 96 256 80 C256 64 244 51 227 50 C223 26 202 8 176 8 C156 8 139 19 130 35 C121 25 108 18 93 18 C67 18 46 37 44 62 C25 63 10 76 10 92 C10 103 21 110 35 110 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** Four-point diamond sparkle (✦). */
function Sparkle({
  size = 24,
  color = "#ffffff",
  opacity = 0.75,
  className = "",
  ...hooks
}: {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
} & Hooks) {
  const h = size / 2;
  const q = size / 5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className={className} style={{ opacity }} {...hooks}>
      <path
        d={`M${h} 0 C${h} ${q} ${h + q} ${h} ${size} ${h} C${h + q} ${h} ${h} ${h + q} ${h} ${size} C${h} ${h + q} ${h - q} ${h} 0 ${h} C${h - q} ${h} ${h} ${h - q} ${h} 0Z`}
        fill={color}
      />
    </svg>
  );
}

/** Soft 5-point rounded star. */
function Star({
  size = 20,
  color = "#ffffff",
  opacity = 0.6,
  className = "",
  ...hooks
}: {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
} & Hooks) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} style={{ opacity }} {...hooks}>
      <path
        d="M12 2.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The Incial mark (the dot, the quarter and the tall shape), as in /logo/Logoo-white.svg. */
const LOGO_SHAPES = (
  <>
    <rect x="164" y="150" width="122" height="122" rx="61" />
    <path d="M150 417C150 342.442 211.442 282 286 282V509H150V417Z" />
    <path d="M309 150C400.679 150 476 224.321 476 316V509H309V150Z" />
  </>
);

/** One wave the width of two logo widths, so sliding it by one logo width loops seamlessly. */
const WAVE = "M0 14 Q81.5 -2 163 14 T326 14 T489 14 T652 14 V420 H0 Z";

/**
 * The preloader on the cream screen: the Incial mark as a faint green outline that fills from the
 * bottom with flowing green waves before the green opens up.
 */
function LoadLogo() {
  return (
    <svg viewBox="140 140 346 379" className="w-[min(34vw,8.5rem)]" aria-hidden>
      <defs>
        <clipPath id="lt-load-logo">{LOGO_SHAPES}</clipPath>
      </defs>
      {/* the empty mark */}
      <g fill={GREEN} fillOpacity={0.14} stroke={GREEN} strokeOpacity={0.55} strokeWidth={5}>
        {LOGO_SHAPES}
      </g>
      {/* the green rising inside it */}
      <g clipPath="url(#lt-load-logo)">
        <g data-load-fill transform="translate(0 380)">
          <g data-load-wave="back">
            <path d={WAVE} transform="translate(150 140)" fill="#6dbc45" />
          </g>
          <g data-load-wave="front">
            <path d={WAVE} transform="translate(150 150)" fill={GREEN} />
          </g>
        </g>
      </g>
    </svg>
  );
}

// ── Geniestudio-style inline circular character badges ────────────────────────

function InlineBadgeCluster({
  items,
  onCycle,
}: {
  items: ReadonlyArray<(typeof CHARACTERS)[number]>;
  onCycle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label="Cycle inline character badges"
      className="group/cluster mx-[0.14em] inline-flex cursor-pointer items-center align-middle transition-transform duration-300 hover:scale-105 focus-visible:outline-offset-4"
      style={{ verticalAlign: "middle" }}
    >
      {items.map((char, i) => (
        <span
          key={`${char.key}-${i}`}
          className="relative inline-flex h-[clamp(2rem,4.4vw,4.6rem)] w-[clamp(2rem,4.4vw,4.6rem)] items-center justify-center overflow-hidden rounded-full border-[3px] border-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover/cluster:-translate-y-1"
          style={{
            background: char.badgeBg,
            marginLeft: i === 0 ? 0 : "-0.32em",
            zIndex: items.length - i,
          }}
        >
          <Image
            src={char.src}
            alt=""
            width={110}
            height={110}
            className="h-[88%] w-[88%] object-contain object-bottom"
            draggable={false}
          />
        </span>
      ))}
    </button>
  );
}

// ── Staggered interactive word (letters bounce subtly on hover) ───────────────

function StaggeredWord({ word, className = "" }: { word: string; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden pb-[0.18em] -mb-[0.12em] ${className}`}>
      <span data-hero-word className="inline-flex">
        {word.split("").map((letter, idx) => (
          <span
            key={`${word}-${idx}`}
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[0.09em]"
            style={{
              transform: idx % 2 === 1 ? "translateY(0.03em)" : "translateY(-0.02em)",
            }}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swapTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [slots, setSlots] = useState<CharKey[]>([...INITIAL_SLOTS]);
  const [bubble, setBubble] = useState<{ slot: number; key: number } | null>(null);
  const [burstSlot, setBurstSlot] = useState<{ slot: number; key: number } | null>(null);

  useEffect(() => {
    const timers = swapTimers.current;
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      timers.forEach(clearTimeout);
    };
  }, []);

  /** Click a character → jump + sparkle burst + speech bubble + swap to next character. */
  const poke = useCallback((slotIdx: number, el: HTMLElement) => {
    const now = Date.now();
    setBubble({ slot: slotIdx, key: now });
    setBurstSlot({ slot: slotIdx, key: now });

    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      const jumper = el.querySelector<HTMLElement>("[data-jump]");
      if (jumper) {
        gsap.timeline({ overwrite: "auto" })
          .to(jumper, { y: -38, scale: 1.08, rotation: slotIdx % 2 === 0 ? -6 : 6, duration: 0.2, ease: "power2.out" })
          .to(jumper, { y: 0, scale: 1, rotation: 0, duration: 0.45, ease: "elastic.out(1.2, 0.5)" });
      }
    }

    const t = setTimeout(() => {
      setSlots((prev) => {
        const next = [...prev];
        const currentIdx = CHARACTERS.findIndex((c) => c.key === next[slotIdx]);
        next[slotIdx] = CHARACTERS[(currentIdx + 1) % CHARACTERS.length].key;
        return next;
      });
    }, 220);
    swapTimers.current.push(t);
  }, []);

  /** Clicking an inline headline badge cluster rotates the entire crew one step. */
  const cycleAll = useCallback(() => {
    setSlots((prev) => [prev[1], prev[2], prev[3], prev[0]]);
  }, []);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    const intro = gsap.timeline({ defaults: { ease: EASE_OUT } });

    // the preloader: waves roll sideways (each at its own pace) while the green rises to fill the mark
    const waves = [
      gsap.fromTo("[data-load-wave='back']", { x: -326 }, { x: 0, duration: 1.6, ease: "none", repeat: -1 }),
      gsap.fromTo("[data-load-wave='front']", { x: 0 }, { x: -326, duration: 1.1, ease: "none", repeat: -1 }),
    ];
    intro.set("[data-load]", { clipPath: "inset(0% 0% 0% 0%)" });
    intro.fromTo("[data-load-fill]", { y: 380 }, { y: -30, duration: 1.25, ease: "power1.inOut" }, 0.1);

    const open = 1.45;
    intro
      .to("[data-load] svg", { scale: 1.12, opacity: 0, duration: 0.45, ease: "power2.in" }, open - 0.1)
      .to("[data-load]", { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "power4.inOut" }, open)
      .set("[data-crowd-layer]", { visibility: "visible" }, open + 0.3)
      .call(() => waves.forEach((wave) => wave.kill()), [], open + 0.9)
      .from("[data-hero-word]", { yPercent: 115, duration: 1.05, stagger: 0.06 }, open + 0.35)
      .from("[data-cloud]", { y: 36, opacity: 0, duration: 1.2, stagger: 0.1, ease: "power2.out" }, open + 0.2)
      .from("[data-sparkle]", { scale: 0, opacity: 0, duration: 0.7, stagger: 0.06, ease: "back.out(2)" }, open + 0.45)
      .from("[data-pop]", { yPercent: 55, scale: 0.72, duration: 1.1, ease: "back.out(1.6)", stagger: 0.09 }, open + 0.48);

    // ── live, always-on motion ──
    // clouds drift sideways, each at its own pace
    gsap.utils.toArray<Element>("[data-cloud]").forEach((cloud, i) => {
      gsap.to(cloud, { x: i % 2 ? -40 : 40, y: i % 3 ? 6 : -6, duration: 7 + i * 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
    });
    // sparkles twinkle
    gsap.utils.toArray<Element>("[data-sparkle]").forEach((spark) => {
      gsap.to(spark, {
        scale: gsap.utils.random(0.4, 0.7),
        opacity: 0.25,
        rotate: gsap.utils.random(-45, 45),
        duration: gsap.utils.random(1.2, 2.4),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2 + gsap.utils.random(0, 2),
        transformOrigin: "50% 50%",
      });
    });
    // each character bobs on its own rhythm
    gsap.utils.toArray<Element>("[data-idle]").forEach((character, i) => {
      gsap.to(character, { y: -10 - (i % 2) * 6, rotate: i % 2 ? 1.5 : -1.5, duration: 1.6 + i * 0.35, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.6 + i * 0.2 });
    });
    // the headline badges float
    gsap.utils.toArray<Element>("[data-badge]").forEach((badge, i) => {
      gsap.to(badge, { y: i % 2 ? 6 : -6, rotate: i % 2 ? 4 : -4, duration: 2.2 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
    });
    // the glow in the background breathes and wanders
    gsap.to("[data-glow]", { xPercent: 12, yPercent: -8, scale: 1.15, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });

    // layers shift with the pointer (desktop); removed again in the cleanup below
    let removePointer: (() => void) | undefined;
    if (isDesktop) {
      const layers = [
        { el: root.querySelector("[data-crowd-parallax]"), depth: 18 },
        { el: root.querySelector("[data-cloud-layer]"), depth: -28 },
        { el: root.querySelector("[data-headline-parallax]"), depth: 8 },
      ].filter((layer): layer is { el: Element; depth: number } => Boolean(layer.el));
      const movers = layers.map(({ el, depth }) => ({
        depth,
        x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3" }),
      }));
      const onMove = (event: PointerEvent) => {
        const dx = event.clientX / window.innerWidth - 0.5;
        const dy = event.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(dx * m.depth * 2);
          m.y(dy * m.depth);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      removePointer = () => window.removeEventListener("pointermove", onMove);
    }

    // Scroll choreography
    const scroll = { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 };
    gsap.to("[data-headline]", { yPercent: -22, opacity: 0, ease: "none", scrollTrigger: scroll });
    gsap.to("[data-crowd]", {
      yPercent: -12,
      scale: 0.88,
      opacity: 0,
      ease: "none",
      scrollTrigger: { ...scroll, end: isDesktop ? "top -55%" : "top -45%" },
    });

    return () => removePointer?.();
  });

  const charAt = (slot: number) => CHARACTERS.find((c) => c.key === slots[slot])!;

  return (
    <section ref={ref} className="relative">
      {/* ── Layer 1: green stage (sticky background) ─────────────────────── */}
      <div
        className="sticky top-0 z-0 h-[100svh] overflow-hidden"
        style={{
          background: `radial-gradient(60% 55% at 50% 42%, #a2e476 0%, ${GREEN} 65%, #7ec950 100%)`,
        }}
      >
        {/* the flowing green shader with grain (the CSS gradient shows until it draws) */}
        <ShaderBackground variant="green" className="absolute inset-0 h-full w-full" />

        {/* Cream pre-load overlay: covers from the first paint (hidden when motion is reduced) */}
        <div
          data-load
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center motion-reduce:hidden"
          style={{ background: LT_COLORS.paper, clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <LoadLogo />
        </div>

        {/* a soft light that slowly wanders across the green */}
        <div
          data-glow
          aria-hidden
          className="pointer-events-none absolute left-[20%] top-[10%] h-[70%] w-[60%] rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(214,255,170,0.75), rgba(214,255,170,0))" }}
        />

        {/* ── Atmospheric: layered clouds (Geniestudio style) ─────────────── */}
        <div data-cloud-layer aria-hidden className="pointer-events-none absolute -inset-x-[4%] inset-y-0">
        {/* Bottom-left large cloud bank */}
        <Cloud
          data-cloud
          data-cloud-drift
          className="pointer-events-none absolute -bottom-[4%] -left-[8%] w-[clamp(18rem,36vw,40rem)]"
          opacity={0.78}
        />
        {/* Bottom-right large cloud bank */}
        <Cloud
          data-cloud
          data-cloud-drift
          className="pointer-events-none absolute -bottom-[5%] -right-[8%] w-[clamp(18rem,38vw,42rem)]"
          opacity={0.78}
        />
        {/* Top-left floating cloud */}
        <Cloud
          data-cloud
          data-cloud-drift
          className="pointer-events-none absolute left-[4%] top-[10%] w-[clamp(10rem,18vw,20rem)]"
          opacity={0.48}
        />
        {/* Top-right floating cloud */}
        <Cloud
          data-cloud
          data-cloud-drift
          className="pointer-events-none absolute right-[5%] top-[8%] w-[clamp(11rem,20vw,22rem)]"
          opacity={0.55}
        />
        {/* Mid-horizon soft cloud */}
        <Cloud
          data-cloud
          className="pointer-events-none absolute left-[38%] top-[4%] w-[clamp(7rem,12vw,13rem)]"
          opacity={0.28}
        />
        </div>

        {/* ── Atmospheric: sparkles, stars & floating dots ───────────────── */}
        <Sparkle data-sparkle size={30} color="#ffffff" opacity={0.85} className="pointer-events-none absolute left-[11%] top-[24%]" />
        <Sparkle data-sparkle size={20} color={INK} opacity={0.28} className="pointer-events-none absolute left-[19%] top-[48%]" />
        <Sparkle data-sparkle size={26} color="#ffffff" opacity={0.8} className="pointer-events-none absolute right-[12%] top-[25%]" />
        <Sparkle data-sparkle size={18} color={INK} opacity={0.25} className="pointer-events-none absolute right-[18%] top-[50%]" />
        <Sparkle data-sparkle size={22} color="#fff6c4" opacity={0.9} className="pointer-events-none absolute left-[28%] top-[14%]" />
        <Star data-sparkle size={22} color="#ffffff" opacity={0.7} className="pointer-events-none absolute right-[26%] top-[16%]" />
        <Star data-sparkle size={16} color={INK} opacity={0.22} className="pointer-events-none absolute left-[8%] bottom-[32%]" />
        <Star data-sparkle size={18} color="#ffffff" opacity={0.65} className="pointer-events-none absolute right-[9%] bottom-[34%]" />

        {/* Subtle floating pastel dots */}
        <span data-sparkle aria-hidden className="pointer-events-none absolute left-[15%] top-[36%] h-3 w-3 rounded-full bg-white/70" />
        <span data-sparkle aria-hidden className="pointer-events-none absolute right-[14%] top-[38%] h-3.5 w-3.5 rounded-full bg-[#ffd24d]/80" />
        <span data-sparkle aria-hidden className="pointer-events-none absolute left-[24%] bottom-[38%] h-2.5 w-2.5 rounded-full bg-[#c9a7ff]/80" />
        <span data-sparkle aria-hidden className="pointer-events-none absolute right-[23%] bottom-[40%] h-2.5 w-2.5 rounded-full bg-white/70" />

        {/* ── Centered Headline with inline character badges ─────────────── */}
        <div
          data-headline
          className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-4 pt-[22svh] text-center md:px-5 md:pt-[clamp(8rem,24svh,15rem)]"
        >
          <h1
            data-headline-parallax
            className="text-[clamp(2.4rem,11.5vw,3.2rem)] font-semibold md:text-[clamp(2rem,0.6rem+6vw,6.8rem)] leading-[0.98] tracking-[-0.055em] text-[#1d2b17]"
            aria-label="Where skills are built together."
          >
            {/* Desktop and tablet, two lines: Where [badges] skills are / built [badges] together. */}
            <span className="hidden flex-wrap items-center justify-center gap-x-[0.18em] md:flex">
              <StaggeredWord word="Where" />
              <span data-badge className="inline-block"><InlineBadgeCluster items={[charAt(1), charAt(3)]} onCycle={cycleAll} /></span>
              <StaggeredWord word="skills" />
              <StaggeredWord word="are" />
            </span>
            <span className="mt-1 hidden flex-wrap items-center justify-center gap-x-[0.18em] md:flex">
              <StaggeredWord word="built" />
              <span data-badge className="inline-block"><InlineBadgeCluster items={[charAt(0), charAt(2)]} onCycle={cycleAll} /></span>
              <StaggeredWord word="together." />
            </span>

            {/* Phones, three bigger lines: Where [badges] skills / are built / [badges] together. */}
            <span className="flex items-center justify-center gap-x-[0.18em] md:hidden">
              <StaggeredWord word="Where" />
              <span data-badge className="inline-block"><InlineBadgeCluster items={[charAt(1), charAt(3)]} onCycle={cycleAll} /></span>
              <StaggeredWord word="skills" />
            </span>
            <span className="flex items-center justify-center gap-x-[0.18em] md:hidden">
              <StaggeredWord word="are" />
              <StaggeredWord word="built" />
            </span>
            <span className="flex items-center justify-center gap-x-[0.18em] md:hidden">
              <span data-badge className="inline-block"><InlineBadgeCluster items={[charAt(0), charAt(2)]} onCycle={cycleAll} /></span>
              <StaggeredWord word="together." />
            </span>
          </h1>

        </div>
      </div>

      {/* ── Layer 2: centered, uniform, larger character crew ────────────── */}
      {/* hidden until the preloader lifts (shown at once when motion is reduced) */}
      <div data-crowd-layer className="pointer-events-none invisible sticky top-0 z-30 -mt-[100svh] h-[100svh] motion-reduce:visible">
        <div
          data-crowd
          className="absolute bottom-0 left-1/2 flex h-[min(66svh,34rem)] w-full -translate-x-1/2 items-end justify-center md:h-[clamp(17rem,57svh,41rem)] md:w-[min(100vw,68rem)]"
        >
          <div data-rise data-crowd-parallax className="relative h-full w-full">
            {slots.map((charKey, slotIdx) => {
              const char = CHARACTERS.find((c) => c.key === charKey)!;
              const isBursting = burstSlot?.slot === slotIdx;

              return (
                <button
                  key={`slot-${slotIdx}`}
                  data-idle
                  type="button"
                  aria-label={`${char.alt}: ${char.says} (Click to switch character)`}
                  onClick={(e) => poke(slotIdx, e.currentTarget)}
                  className="group pointer-events-auto absolute bottom-[var(--slot-bottom-phone)] left-[var(--slot-left-phone)] z-[var(--slot-z-phone)] flex h-[var(--slot-height-phone)] w-[var(--slot-width-phone)] cursor-pointer items-end justify-center focus-visible:outline-offset-8 md:bottom-[var(--slot-bottom)] md:left-[var(--slot-left)] md:z-[var(--slot-z)] md:h-[var(--slot-height)] md:w-[var(--slot-width)]"
                  style={
                    {
                      "--slot-left": `${SLOT_LAYOUT[slotIdx].left}%`,
                      "--slot-bottom": `${SLOT_LAYOUT[slotIdx].bottom}%`,
                      "--slot-width": `${SLOT_LAYOUT[slotIdx].width}%`,
                      "--slot-height": `${SLOT_LAYOUT[slotIdx].height}%`,
                      "--slot-z": 10 + SLOT_LAYOUT[slotIdx].z,
                      "--slot-left-phone": `${SLOT_LAYOUT_PHONE[slotIdx].left}%`,
                      "--slot-bottom-phone": `${SLOT_LAYOUT_PHONE[slotIdx].bottom}%`,
                      "--slot-width-phone": `${SLOT_LAYOUT_PHONE[slotIdx].width}%`,
                      "--slot-height-phone": `${SLOT_LAYOUT_PHONE[slotIdx].height}%`,
                      "--slot-z-phone": 10 + SLOT_LAYOUT_PHONE[slotIdx].z,
                    } as React.CSSProperties
                  }
                >
                  <span
                    data-pop
                    className="relative block h-full w-full origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-2 group-hover:scale-[1.04]"
                    style={{ transform: `rotate(${char.tilt}deg)` }}
                  >
                    <span
                      key={charKey}
                      data-jump
                      className="lt-bubble relative block h-full w-full origin-bottom"
                      style={{ transform: `scale(${char.scale})` }}
                    >
                      <Image
                        src={char.src}
                        alt={char.alt}
                        fill
                        sizes="(max-width:768px) 40vw, 360px"
                        className="object-contain object-bottom drop-shadow-[0_24px_28px_rgba(0,0,0,0.22)]"
                        draggable={false}
                        priority={slotIdx < 2}
                      />
                    </span>
                  </span>

                  {/* Sparkle burst when clicked */}
                  {isBursting && (
                    <span
                      key={burstSlot.key}
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-[10%] flex justify-between px-4"
                    >
                      <Sparkle size={20} color="#ffffff" opacity={0.95} className="lt-bubble" />
                      <Sparkle size={16} color="#ffd24d" opacity={0.95} className="lt-bubble" />
                    </span>
                  )}

                  {/* Speech bubble */}
                  {bubble?.slot === slotIdx && (
                    <span
                      key={bubble.key}
                      role="status"
                      className="lt-bubble absolute bottom-[96%] left-1/2 z-40 w-max max-w-[13rem] -translate-x-1/2 rounded-2xl bg-white px-4 py-2 text-[clamp(0.78rem,0.7rem+0.35vw,1rem)] font-semibold text-[#151716] shadow-[0_14px_28px_-10px_rgba(0,0,0,0.45)]"
                    >
                      {char.says}
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-white"
                      />
                    </span>
                  )}

                  {/* Ground shadow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-1 left-1/2 h-3 w-[68%] -translate-x-1/2 rounded-full bg-[#1d2b17]/20 blur-[5px] transition-all duration-300 group-hover:w-[58%] group-hover:opacity-60"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Layer 3: cream intro panel scrolls over green ─────────────────── */}
      <div
        className="relative z-20 rounded-t-[2.5rem] px-5 pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(4rem,9vw,7rem)] sm:px-8 md:rounded-t-[3.5rem] lg:px-12"
        style={{ background: LT_COLORS.paper }}
      >
        <IntroPanel />
      </div>
    </section>
  );
}
