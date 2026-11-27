"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { DoubleDownArrow } from "@/components/ui/ScrollHint";

interface ServiceBeat {
  id: string;
  label: string;
  title: string;
  description: string;
  items: readonly string[];
  subGroup?: {
    label: string;
    value: string;
  };
  imageSrc: string;
  imageAlt: string;
  objectPositionClass?: string;
}

const SERVICE_BEATS: readonly ServiceBeat[] = [
  {
    id: "technology",
    label: "TECHNOLOGY",
    title: "We build.",
    description: "Websites, apps and software that work as hard as you do.",
    items: [
      "Websites",
      "Mobile apps",
      "Custom software",
      "AI tools & automation",
    ],
    subGroup: {
      label: "OUR PRODUCTS",
      value: "WorkHub · SoftWork",
    },
    imageSrc: "/images/services/service-monitor.jpg",
    imageAlt: "Software engineering workstation",
    objectPositionClass: "object-[50%_42%]",
  },
  {
    id: "branding",
    label: "BRANDING & DESIGN",
    title: "We brand.",
    description: "A brand people notice, remember and trust.",
    items: [
      "Brand identity",
      "Logo design",
      "UI / UX design",
      "Packaging & print",
    ],
    imageSrc: "/images/services/service-ux.jpg",
    imageAlt: "Brand and UI/UX wireframing workspace",
    objectPositionClass: "object-center",
  },
  {
    id: "marketing",
    label: "MARKETING",
    title: "We market.",
    description: "The right people, finding you, again and again.",
    items: [
      "Digital marketing",
      "Social media",
      "SEO",
      "Performance ads",
      "Personal branding",
    ],
    imageSrc: "/images/services/service-analytics.jpg",
    imageAlt: "Digital marketing and performance analytics",
    objectPositionClass: "object-center",
  },
  {
    id: "media",
    label: "MEDIA PRODUCTION",
    title: "We create.",
    description: "Content that stops the scroll and tells your story.",
    items: ["Ad films & videos", "Reels", "VFX / CGI", "Photography"],
    imageSrc: "/images/services/service-film.jpg",
    imageAlt: "Media and film production set",
    objectPositionClass: "object-[62%_42%]",
  },
];

const BEAT_COUNT = SERVICE_BEATS.length;

const BEAT_STEP_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Linear beat mapping inside the pinned scroll runway so each programmatic step transition
 * glides cleanly through `[0, 1, 2, 3]` with `BEAT_STEP_EASE` without double-warping.
 */
function mapProgressToBeat(progress: number): number {
  return Math.min(1, Math.max(0, progress)) * (BEAT_COUNT - 1);
}

interface BeatFrameState {
  beatIndex: number;
  /** 0..1 visibility ratio of characters in this beat (types in 0->1, holds at 1, erases 1->0 before next beat). */
  reveal: number;
  /** True while holding settled near a beat center. */
  settled: boolean;
}

function getBeatFrameState(pos: number): BeatFrameState {
  const clampedPos = Math.min(BEAT_COUNT - 1, Math.max(0, pos));
  const beatIndex = Math.round(clampedPos);
  const dist = Math.abs(clampedPos - beatIndex);

  if (dist <= 0.08) return { beatIndex, reveal: 1, settled: true };
  if (dist >= 0.48) return { beatIndex, reveal: 0, settled: false };
  return { beatIndex, reveal: 1 - (dist - 0.08) / 0.4, settled: false };
}

function sliceChars(text: string, ratio: number): string {
  if (ratio >= 1) return text;
  if (ratio <= 0) return "";
  return text.slice(0, Math.max(0, Math.round(text.length * ratio)));
}

/**
 * Individual portrait card traveling along a true circular orbit centered right of the stage:
 * `(x, y) = (R_x * (1 - cos θ), R_y * sin θ)`, shrinking non-priority satellite cards above and
 * below cleanly along the tight rim of the circle.
 */
function CurvedReelCard({
  beat,
  index,
  activePos,
}: {
  beat: ServiceBeat;
  index: number;
  activePos: MotionValue<number>;
}) {
  const y = useTransform(activePos, (pos) => {
    const theta = Math.max(-1.45, Math.min(1.45, (index - pos) * 0.72));
    return `${Math.sin(theta) * 70}dvh`;
  });
  const x = useTransform(activePos, (pos) => {
    const theta = Math.max(-1.45, Math.min(1.45, (index - pos) * 0.72));
    return `${(1 - Math.cos(theta)) * 185}%`;
  });
  const scale = useTransform(activePos, (pos) => {
    const d = Math.abs(index - pos);
    return Math.max(0.35, 1 - Math.min(1.5, d) * 0.42);
  });
  const opacity = useTransform(activePos, (pos) => {
    const d = Math.abs(index - pos);
    return Math.max(0, 1 - Math.max(0, d - 0.85) * 1.15);
  });

  return (
    <motion.div
      style={{ x, y, scale, opacity }}
      className="pointer-events-none absolute inset-0 will-change-transform"
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <Image
          src={beat.imageSrc}
          alt={beat.imageAlt}
          fill
          sizes="(max-width: 768px) 78vw, 28vw"
          className={`object-cover grayscale contrast-[1.08] brightness-[0.86] ${beat.objectPositionClass ?? "object-center"}`}
        />
      </div>
    </motion.div>
  );
}

/**
 * Dark service showcase modeled after the frame-by-frame scroll reel:
 * - Portrait monochrome photography cards travel along a curved C-arc on the left side.
 * - A pinned right-side typography block types in, holds with white underscore markers,
 *   and erases into each of the four service pillars (Technology, Branding & Design, Marketing,
 *   Media Production) using only the four pillars' content.
 */
export default function HomeEditorialThesis() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [frame, setFrame] = useState<BeatFrameState>({
    beatIndex: 0,
    reveal: 1,
    settled: true,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.3,
  });

  const activePos = useTransform(smoothProgress, mapProgressToBeat);

  useMotionValueEvent(activePos, "change", (pos) => {
    const next = getBeatFrameState(pos);
    setFrame((prev) =>
      prev.beatIndex === next.beatIndex &&
      prev.settled === next.settled &&
      Math.abs(prev.reveal - next.reveal) < 0.006
        ? prev
        : next,
    );
  });

  // Scroll-pin beat locking: each normal scroll gesture steps smoothly along the circular
  // arc directly to the next/previous service beat without requiring excessive scrolling.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || reduced) return;

    let animControls: ReturnType<typeof animate<number>> | null = null;
    let animating = false;
    let lockedBeat = 0;
    let lastStepAt = 0;
    let edgeCooldownUntil = 0;
    let lastWheelAt = 0;
    let prevWheelDelta = 0;
    let isTouching = false;
    let idleTimer = 0;

    const getMetrics = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const maxScroll = Math.max(1, node.offsetHeight - vh);
      const sectionTopDoc = window.scrollY + rect.top;
      const scrolled = Math.max(0, Math.min(maxScroll, -rect.top));
      const isPinned = rect.top <= 4 && rect.bottom >= vh - 4 && node.offsetHeight > vh + 20;
      return { rect, vh, maxScroll, sectionTopDoc, scrolled, isPinned };
    };

    const scrollToBeat = (beatIndex: number, duration = 1.05) => {
      const clampedBeat = Math.min(BEAT_COUNT - 1, Math.max(0, beatIndex));
      const { maxScroll, sectionTopDoc } = getMetrics();
      const targetY = sectionTopDoc + (clampedBeat / (BEAT_COUNT - 1)) * maxScroll;

      window.clearTimeout(idleTimer);
      animControls?.stop();
      animating = true;
      lockedBeat = clampedBeat;
      lastStepAt = performance.now();

      animControls = animate(window.scrollY, targetY, {
        duration,
        ease: BEAT_STEP_EASE,
        onUpdate: (latest) => {
          window.scrollTo(0, latest);
        },
        onComplete: () => {
          animating = false;
          animControls = null;
          edgeCooldownUntil = performance.now() + 260;
        },
      });
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const scaleFactor =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const deltaY = e.deltaY * scaleFactor;
      const absDelta = Math.abs(deltaY);
      if (absDelta < 2) return;

      const now = performance.now();
      const dt = now - lastWheelAt;
      const isDecayingTail =
        dt < 75 &&
        absDelta <= prevWheelDelta * 1.15 &&
        absDelta < 38 &&
        now - lastStepAt < 1150;

      lastWheelAt = now;
      prevWheelDelta = absDelta;

      const { rect, vh, maxScroll, scrolled, isPinned } = getMetrics();

      // Catch fast downward entry right onto Beat 0 ("We build.") or upward entry onto Beat 3 ("We create.")
      if (!isPinned) {
        if (deltaY > 0 && rect.top > 4 && rect.top <= absDelta + 24) {
          e.preventDefault();
          if (!animating && !isDecayingTail) scrollToBeat(0, 0.42);
        } else if (deltaY < 0 && rect.bottom < vh - 4 && rect.bottom >= vh - absDelta - 24) {
          e.preventDefault();
          if (!animating && !isDecayingTail) scrollToBeat(BEAT_COUNT - 1, 0.42);
        }
        return;
      }

      const progress = scrolled / maxScroll;
      const currentBeat = animating
        ? lockedBeat
        : Math.round(progress * (BEAT_COUNT - 1));

      if (deltaY > 0) {
        if (currentBeat < BEAT_COUNT - 1) {
          e.preventDefault();
          if (!animating && !isDecayingTail) {
            scrollToBeat(currentBeat + 1);
          }
          return;
        }
        // Absorb trailing inertia when just reaching the last beat before releasing downward.
        if (animating || now < edgeCooldownUntil || isDecayingTail) {
          e.preventDefault();
        }
        return;
      }

      if (deltaY < 0) {
        if (currentBeat > 0) {
          e.preventDefault();
          if (!animating && !isDecayingTail) {
            scrollToBeat(currentBeat - 1);
          }
          return;
        }
        // Absorb trailing inertia when just reaching the first beat before releasing upward.
        if (animating || now < edgeCooldownUntil || isDecayingTail) {
          e.preventDefault();
        }
      }
    };

    const scheduleIdleSnap = (delayMs = 220) => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (animating || isTouching) return;
        const { maxScroll, scrolled, isPinned } = getMetrics();
        if (!isPinned) return;
        const exactBeat = (scrolled / maxScroll) * (BEAT_COUNT - 1);
        const nearest = Math.round(exactBeat);
        if (Math.abs(exactBeat - nearest) > 0.04) {
          scrollToBeat(nearest, 0.36);
        }
      }, delayMs);
    };

    const onScroll = () => {
      if (!animating && !isTouching) scheduleIdleSnap(220);
    };
    const onTouchStart = () => {
      isTouching = true;
      if (animating) {
        animControls?.stop();
        animating = false;
      }
      window.clearTimeout(idleTimer);
    };
    const onTouchEnd = () => {
      isTouching = false;
      // Wait longer after finger lift so native inertial momentum scroll settles naturally.
      scheduleIdleSnap(340);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      animControls?.stop();
      window.clearTimeout(idleTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section
        aria-labelledby="editorial-thesis-heading"
        data-tone="dark"
        className="relative z-20 bg-black px-6 py-24 text-white sm:px-10 md:px-14"
      >
        <h2 id="editorial-thesis-heading" className="sr-only">
          Our Services
        </h2>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-y-20">
          {SERVICE_BEATS.map((beat) => (
            <div
              key={beat.id}
              className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-14"
            >
              <div className="relative aspect-[4/5] w-full max-w-[22rem] shrink-0 overflow-hidden rounded-xl bg-neutral-950">
                <Image
                  src={beat.imageSrc}
                  alt={beat.imageAlt}
                  fill
                  sizes="(max-width: 768px) 90vw, 320px"
                  className={`object-cover grayscale contrast-[1.08] ${beat.objectPositionClass ?? "object-center"}`}
                />
              </div>
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70 sm:text-sm">
                  {beat.label}
                </p>
                <h3 className="mt-2 font-sans text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                  {beat.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
                  {beat.description}
                </p>
                <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-white/25 pt-5 text-base font-medium text-white sm:grid-cols-2 sm:text-lg">
                  {beat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {beat.subGroup && (
                  <p className="mt-5 text-sm text-white/75 sm:text-base">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                      {beat.subGroup.label}:{" "}
                    </span>
                    <span className="font-medium text-white">{beat.subGroup.value}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const activeBeat = SERVICE_BEATS[frame.beatIndex];
  const r = frame.reveal;
  // Allocate sequential slices inside the beat so title -> description -> items type & erase cleanly.
  const labelText = sliceChars(activeBeat.label, Math.min(1, r / 0.25));
  const titleText = sliceChars(activeBeat.title, Math.min(1, Math.max(0, (r - 0.05) / 0.35)));
  const descText = sliceChars(activeBeat.description, Math.min(1, Math.max(0, (r - 0.22) / 0.48)));
  const itemsRatio = Math.min(1, Math.max(0, (r - 0.45) / 0.5));
  const visibleItemsCount = Math.round(itemsRatio * activeBeat.items.length);
  const showSubGroup = r >= 0.88;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="editorial-thesis-heading"
      data-tone="dark"
      className="relative z-20 bg-black text-white"
      style={{ height: `${BEAT_COUNT * 65}dvh` }}
    >
      <h2 id="editorial-thesis-heading" className="sr-only">
        Our Services
      </h2>

      {/* Pinned viewport frame */}
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden px-5 sm:px-10 md:px-14">
        <div className="relative mx-auto flex w-full max-w-[1380px] flex-col items-start justify-center gap-5 sm:gap-7 md:flex-row md:items-center md:gap-28 lg:gap-40 xl:gap-48">
          {/* Left-side circular orbit photo stage (strict 4:5 ratio) */}
          <div className="relative aspect-[4/5] w-[min(64vw,26dvh)] shrink-0 max-md:overflow-hidden max-md:rounded-xl md:ml-14 md:w-[clamp(16.5rem,min(26vw,43dvh),25rem)] md:overflow-visible lg:ml-20">
            {/* Animated vertical Scroll cue positioned cleanly left of the circular reel */}
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, 7, 0], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -left-16 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-5 will-change-transform md:flex lg:-left-20"
            >
              <span className="inline-block -rotate-90 whitespace-nowrap text-sm font-medium tracking-[0.1em] text-white lg:text-base">
                Scroll
              </span>
              <DoubleDownArrow className="h-7 w-7 text-white lg:h-8 lg:w-8" />
            </motion.div>

            {SERVICE_BEATS.map((beat, index) => (
              <CurvedReelCard
                key={beat.id}
                beat={beat}
                index={index}
                activePos={activePos}
              />
            ))}
          </div>

          {/* Right-side typography panel with typewriter reveal & white underscore markers */}
          <div className="relative z-10 min-h-[14.5rem] w-full min-w-0 flex-1 max-w-[40rem] md:min-h-[24rem]">
            <p className="min-h-[1.25rem] text-xs font-semibold uppercase tracking-[0.22em] text-white/70 sm:text-sm">
              {labelText}
            </p>

            <h3
              className="mt-1.5 min-h-[1.08em] font-sans font-semibold leading-[1.02] tracking-[-0.045em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.75)] md:mt-2"
              style={{ fontSize: "clamp(2rem, 1.2rem + 3.4vw, 4.5rem)" }}
            >
              <span>{titleText}</span>
              {(frame.settled || (r > 0 && r < 1)) && titleText.length > 0 && (
                <span
                  aria-hidden="true"
                  className="ml-1.5 inline-block h-[0.11em] w-[0.55em] bg-white align-baseline"
                />
              )}
            </h3>

            <p
              className="mt-2 min-h-[2.7em] max-w-[26ch] font-sans font-normal leading-[1.32] tracking-[-0.02em] text-white/90 [text-shadow:0_2px_18px_rgba(0,0,0,0.7)] md:mt-3"
              style={{ fontSize: "clamp(0.98rem, 0.88rem + 0.65vw, 1.5rem)" }}
            >
              <span>{descText}</span>
              {frame.settled && descText.length > 0 && (
                <span
                  aria-hidden="true"
                  className="ml-1.5 inline-block h-[0.12em] w-[0.65em] bg-white align-baseline"
                />
              )}
            </p>

            <ul className="mt-4 grid min-h-[4.2rem] grid-cols-2 gap-x-5 gap-y-2 border-t border-white/25 pt-3.5 md:mt-6 md:min-h-[6.5rem] md:gap-x-10 md:gap-y-3 md:pt-5">
              {activeBeat.items.slice(0, visibleItemsCount).map((item, idx) => (
                <li
                  key={`${activeBeat.id}-${item}`}
                  className="flex items-center text-sm font-medium tracking-[-0.015em] text-white sm:text-base md:text-lg lg:text-[1.22rem]"
                >
                  <span>{item}</span>
                  {frame.settled && idx === visibleItemsCount - 1 && (
                    <span
                      aria-hidden="true"
                      className="ml-2 inline-block h-[0.14em] w-[0.7em] bg-white"
                    />
                  )}
                </li>
              ))}
            </ul>

            {activeBeat.subGroup && (
              <div
                className="mt-3.5 transition-opacity duration-200 md:mt-6"
                style={{ opacity: showSubGroup ? 1 : 0 }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                  {activeBeat.subGroup.label}
                </p>
                <p className="mt-1.5 text-base font-medium text-white sm:text-lg">
                  {activeBeat.subGroup.value}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
