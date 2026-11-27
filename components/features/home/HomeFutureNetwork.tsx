"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LiquidSeamWave from "./LiquidSeamWave";

interface ServicePhoto {
  src: string;
  position: string;
}

const SERVICE_PHOTOS: readonly ServicePhoto[] = [
  { src: "/images/services/service-agency.jpg", position: "object-[50%_38%]" },
  { src: "/images/services/service-ux.jpg", position: "object-center" },
  { src: "/images/services/service-monitor.jpg", position: "object-[50%_42%]" },
  { src: "/images/services/service-film.jpg", position: "object-[62%_42%]" },
  { src: "/images/services/service-web.jpg", position: "object-center" },
  { src: "/images/services/service-mobile.jpg", position: "object-center" },
  { src: "/images/services/service-analytics.jpg", position: "object-center" },
  { src: "/images/services/service-strategy.jpg", position: "object-[50%_35%]" },
];

const SLIDE_EASE = [0.76, 0, 0.24, 1] as const;
const LETTER_BOUNCE = { type: "spring", stiffness: 780, damping: 18, mass: 0.3 } as const;
const ICON_SPRING = { type: "spring", stiffness: 480, damping: 18, mass: 0.45 } as const;
const STEP_INTERVAL_MS = 16;
const STEPS_PER_TICK = 2;
const MIN_SWITCH_MS = 1200;
const MAX_SWITCH_MS = 1900;

/** Sequential reading-order offsets across all four lines (letters + photo boxes + logo badge). */
const STEP = {
  line1TextStart: 0, // "Branding," (9 chars: 0..8)
  box1Trigger: 9, // 2 beats (9..10)
  box2Trigger: 11, // 2 beats (11..12)
  line2TextStart: 13, // "Technology &" (12 chars: 13..24)
  line3TextStart: 25, // "Experiences" (11 chars: 25..35)
  box3Trigger: 36, // 2 beats (36..37)
  box4Trigger: 38, // 2 beats (38..39)
  line4TextStart: 40, // "That Scale." (11 chars: 40..50)
  logoTrigger: 51, // 2 beats (51..52)
  total: 53,
} as const;

/**
 * Renders a text phrase letter by letter; each arriving character pops in with an underdamped
 * spring bounce as the sequential reveal reaches its index.
 */
function LetterRun({
  text,
  startIndex,
  lit,
  reduced,
}: {
  text: string;
  startIndex: number;
  lit: number;
  reduced: boolean;
}) {
  return (
    <>
      {Array.from(text).map((char, offset) => {
        if (char === " ") {
          return (
            <span key={offset} className="inline-block whitespace-pre">
              {" "}
            </span>
          );
        }
        const visible = reduced || startIndex + offset < lit;
        return (
          <motion.span
            key={offset}
            initial={false}
            animate={
              reduced
                ? { opacity: 1, y: 0, scale: 1 }
                : {
                    opacity: visible ? 1 : 0,
                    y: visible ? 0 : 18,
                    scale: visible ? 1 : 0.72,
                  }
            }
            transition={reduced ? { duration: 0 } : LETTER_BOUNCE}
            className="inline-block origin-bottom"
          >
            {char}
          </motion.span>
        );
      })}
    </>
  );
}

interface EditorialPhotoFrameProps {
  initialIndex: number;
  minWidthClass: string;
  lit: boolean;
  reduced: boolean;
  tilt?: number;
}

/**
 * Borderless rounded photography container aligned to the imaginary bounding rectangle.
 * Springs into view when reached and randomly slides in a new photo every 1.2–1.9s.
 */
function EditorialPhotoFrame({
  initialIndex,
  minWidthClass,
  lit,
  reduced,
  tilt = -2,
}: EditorialPhotoFrameProps) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const [photoIndex, setPhotoIndex] = useState(() => initialIndex % SERVICE_PHOTOS.length);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !isVisible || !lit) return;
    let timerId = 0;

    const scheduleNext = () => {
      const delay = MIN_SWITCH_MS + Math.random() * (MAX_SWITCH_MS - MIN_SWITCH_MS);
      timerId = window.setTimeout(() => {
        setPhotoIndex((current) => {
          let next = Math.floor(Math.random() * SERVICE_PHOTOS.length);
          if (next === current) {
            next = (current + 1 + Math.floor(Math.random() * (SERVICE_PHOTOS.length - 1))) % SERVICE_PHOTOS.length;
          }
          return next;
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => window.clearTimeout(timerId);
  }, [isVisible, lit, reduced]);

  const current = SERVICE_PHOTOS[photoIndex];
  const shown = reduced || lit;

  return (
    <motion.span
      ref={frameRef}
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: shown ? 1 : 0,
        scale: shown ? 1 : 0.78,
        rotate: shown ? 0 : tilt,
      }}
      transition={reduced ? { duration: 0 } : ICON_SPRING}
      className={`block flex-1 will-change-transform ${minWidthClass}`}
    >
      <span className="relative block h-[0.82em] w-full overflow-hidden rounded-[0.07em] bg-[#151716] shadow-[0_14px_32px_-18px_rgba(0,0,0,0.35)]">
        <AnimatePresence initial={false}>
          <motion.span
            key={current.src}
            initial={reduced ? false : { y: "100%" }}
            animate={{ y: "0%" }}
            exit={reduced ? undefined : { y: "-100%" }}
            transition={{ duration: 0.48, ease: SLIDE_EASE }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={current.src}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 768px) 180px, 420px"
              className={`object-cover ${current.position} grayscale contrast-[1.1]`}
            />
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  );
}

/**
 * Floating circular Incial mark with a borderless charcoal core and a soft pulsing blue highlight.
 */
function LogoChip({ lit, reduced }: { lit: boolean; reduced: boolean }) {
  const shown = reduced || lit;

  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: shown ? 1 : 0,
        scale: shown ? 1 : 0.55,
      }}
      transition={reduced ? { duration: 0 } : ICON_SPRING}
      className="relative ml-[0.14em] inline-block align-middle will-change-transform"
    >
      <motion.span
        animate={reduced || !shown ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative block"
      >
        <motion.span
          aria-hidden="true"
          animate={
            reduced || !shown
              ? undefined
              : { scale: [1, 1.24, 1], opacity: [0.45, 0.18, 0.45] }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -inset-[0.12em] rounded-full bg-[#1463ff]/30"
        />
        <span className="relative block h-[0.62em] w-[0.62em] rounded-full bg-[#151716] shadow-[0_0.2em_0.5em_-0.2em_rgba(20,99,255,0.45)]">
          <Image
            src="/logo/Logoo-white.svg"
            alt=""
            fill
            sizes="64px"
            className="object-contain p-[0.13em]"
          />
        </span>
      </motion.span>
    </motion.span>
  );
}

/**
 * Services editorial centerpiece placed between HomeStatement and HomeEditorialThesis:
 * - Clean white section meeting HomeStatement and HomeEditorialThesis with flat liquid-wave seams.
 * - Fast sequential letter-by-letter bounce reveal + random 1.2–1.9s photo cycling.
 */
export default function HomeFutureNetwork() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [active, setActive] = useState(false);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || reduced || active) return;

    const activateIfVisible = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > window.innerHeight * 0.05) {
        setActive(true);
        return true;
      }
      return false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || activateIfVisible()) {
          setActive(true);
        }
      },
      { threshold: [0, 0.05, 0.12] },
    );
    observer.observe(node);

    const onScroll = () => {
      if (activateIfVisible()) {
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [active, reduced]);

  useEffect(() => {
    if (reduced || !active) return;
    let timerId = 0;
    timerId = window.setInterval(() => {
      setLit((current) => {
        if (current >= STEP.total) {
          window.clearInterval(timerId);
          return current;
        }
        const next = Math.min(STEP.total, current + STEPS_PER_TICK);
        if (next >= STEP.total) {
          window.clearInterval(timerId);
        }
        return next;
      });
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(timerId);
  }, [active, reduced]);

  return (
    <>
      <LiquidSeamWave topColor="#000000" bottomColor="#ffffff" />
      <section
        ref={sectionRef}
        id="services"
        data-tone="light"
        aria-labelledby="services-editorial-heading"
        className="relative z-20 flex min-h-[100dvh] items-center justify-center bg-white px-5 py-[clamp(7rem,13dvh,12rem)] text-[#151716] sm:px-8 md:px-12"
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center">
          <h2 id="services-editorial-heading" className="sr-only">
            Branding, Technology &amp; Experiences That Scale.
          </h2>

          {/* Invisible rectangular bounding box aligning all 4 rows flush left and right */}
          <div
            aria-hidden="true"
            className="inline-flex w-fit max-w-full flex-col items-stretch gap-y-[0.16em] font-sans font-medium leading-[1.02] tracking-[-0.04em] text-[#151716]"
            style={{ fontSize: "clamp(1.65rem, 0.6rem + 5.5vw, 7.1rem)" }}
          >
            {/* Line 1: Branding, [photo] */}
            <div className="flex w-full items-center justify-between gap-x-[0.22em] whitespace-nowrap">
              <span className="shrink-0">
                <LetterRun
                  text="Branding,"
                  startIndex={STEP.line1TextStart}
                  lit={lit}
                  reduced={reduced}
                />
              </span>
              <EditorialPhotoFrame
                initialIndex={0}
                minWidthClass="min-w-[2.4em]"
                lit={lit > STEP.box1Trigger}
                reduced={reduced}
                tilt={-1.5}
              />
            </div>

            {/* Line 2: [photo] Technology & */}
            <div className="flex w-full items-center justify-between gap-x-[0.22em] whitespace-nowrap">
              <EditorialPhotoFrame
                initialIndex={1}
                minWidthClass="min-w-[1.15em]"
                lit={lit > STEP.box2Trigger}
                reduced={reduced}
                tilt={2}
              />
              <span className="shrink-0">
                <LetterRun
                  text="Technology &"
                  startIndex={STEP.line2TextStart}
                  lit={lit}
                  reduced={reduced}
                />
              </span>
            </div>

            {/* Line 3: Experiences [photo] */}
            <div className="flex w-full items-center justify-between gap-x-[0.22em] whitespace-nowrap">
              <span className="shrink-0">
                <LetterRun
                  text="Experiences"
                  startIndex={STEP.line3TextStart}
                  lit={lit}
                  reduced={reduced}
                />
              </span>
              <EditorialPhotoFrame
                initialIndex={2}
                minWidthClass="min-w-[1.9em]"
                lit={lit > STEP.box3Trigger}
                reduced={reduced}
                tilt={-2}
              />
            </div>

            {/* Line 4: [photo] That Scale.[logo-chip] */}
            <div className="flex w-full items-center justify-between gap-x-[0.22em] whitespace-nowrap">
              <EditorialPhotoFrame
                initialIndex={3}
                minWidthClass="min-w-[1.5em]"
                lit={lit > STEP.box4Trigger}
                reduced={reduced}
                tilt={1.5}
              />
              <span className="inline-flex shrink-0 items-baseline">
                <span>
                  <LetterRun
                    text="That Scale."
                    startIndex={STEP.line4TextStart}
                    lit={lit}
                    reduced={reduced}
                  />
                </span>
                <LogoChip lit={lit > STEP.logoTrigger} reduced={reduced} />
              </span>
            </div>
          </div>
        </div>
      </section>
      <LiquidSeamWave topColor="#ffffff" bottomColor="#000000" />
    </>
  );
}
