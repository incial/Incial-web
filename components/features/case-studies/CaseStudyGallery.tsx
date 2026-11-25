"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { CaseStudy } from "@/lib/dataLoader";
import { projectPictureRect, startCaseZoom } from "./ZoomOverlay";

interface CaseStudyGalleryProps {
  studies: ReadonlyArray<CaseStudy>;
  /** id of the section, so a "Scroll down" hint above can jump to it */
  id: string;
}

interface ZoomState {
  src: string;
  href: string;
  preload: string[];
  from: { top: number; left: number; width: number; height: number };
}

const INK = "#151716";
/** Where the thin line across the top sits, below the site's own header. */
const RULE_TOP = "4.5rem";
/** The blue of the site's own accent, used for the plus signs where the lines cross. */
const CROSS = "#56A6FF";

/** The site's rounded dark button, as on the Products page; it sits inside the card's link, so it is drawn on a span. */
const EXPLORE_BUTTON =
  "inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#151716] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-[1.04] group-active:scale-[0.98]";

/** A blue plus sign where a panel's vertical line meets the line across the top. */
function Cross({ style }: { style: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-0 z-10 translate-x-1/2 -translate-y-1/2 select-none text-lg leading-none"
      style={{ color: CROSS, ...style }}
    >
      +
    </span>
  );
}

/** A little picture set into a line of text, as tall as the lettering; either a rounded tile or a circle. */
function Chip({ children, rotate = 0, round = false }: { children: ReactNode; rotate?: number; round?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative mx-[0.16em] inline-block overflow-hidden align-middle bg-[#151716] shadow-[0_0.25em_0.55em_-0.25em_rgba(0,0,0,0.4)] ring-[0.05em] ring-white ${
        round ? "h-[0.62em] w-[0.62em] rounded-full shadow-[0_0_0_0.1em_rgba(34,180,90,0.22),0_0.2em_0.5em_-0.2em_rgba(0,0,0,0.5)]" : "h-[0.78em] w-[1.05em] rounded-[0.14em]"
      }`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

/**
 * The picture in the headline is a button: each click slides the next project's cover in, going round
 * all of them. Its text label says which project is showing.
 */
function CoverChip({ studies }: { studies: ReadonlyArray<CaseStudy> }) {
  const covers = studies.filter((study) => study.coverImage || study.heroImage);
  const [index, setIndex] = useState(0);
  if (covers.length === 0) return null;
  const current = covers[index % covers.length];
  const src = current.coverImage || current.heroImage || "";

  return (
    <motion.button
      type="button"
      onClick={() => setIndex((value) => (value + 1) % covers.length)}
      aria-label={`Showing ${current.title}. Click for the next project.`}
      whileHover={{ scale: 1.08, rotate: -2 }}
      whileTap={{ scale: 0.94, rotate: -8 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
      style={{ rotate: -5 }}
      className="relative mx-[0.16em] inline-block h-[0.78em] w-[1.05em] cursor-pointer overflow-hidden rounded-[0.14em] bg-[#151716] align-middle shadow-[0_0.25em_0.55em_-0.25em_rgba(0,0,0,0.4)] ring-[0.05em] ring-white focus-visible:outline-none focus-visible:ring-[#56A6FF]"
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={src}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          <Image src={src} alt="" fill sizes="96px" className="object-cover" />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** The closing statement: a large headline with a cycling picture and the logo set into it, and a sub-line. */
function ClosingStatement({ studies }: { studies: ReadonlyArray<CaseStudy> }) {
  return (
    <>
      <h3 className="max-w-[16ch] text-balance text-[clamp(2rem,1rem+3.2vw,4.4rem)] font-normal leading-[1.08] tracking-[-0.045em]">
        Ideas
        <CoverChip studies={studies} />
        turned into work that lasts.
        <Chip rotate={4} round>
          <Image src="/logo/Logoo-white.svg" alt="" fill sizes="64px" className="object-contain p-[0.11em]" />
        </Chip>
      </h3>
      <p className="mt-[clamp(1rem,2vw,1.8rem)] max-w-[28rem] text-[clamp(0.9rem,0.8rem+0.4vw,1.1rem)] leading-relaxed text-black/55">
        Every project here began as a question and ended as something real: designed with care, built to perform, and made to be remembered.
      </p>
    </>
  );
}

/** One panel of the grid: a fixed-width cell, closed on its right by a thin vertical line. */
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative h-full w-[86vw] shrink-0 border-r border-black/15 md:w-[50vw] ${className}`}>
      {children}
      <Cross style={{ top: RULE_TOP }} />
    </div>
  );
}

/**
 * Slides what is inside a panel up from below, settling in the vertical centre, as the sideways
 * scrolling brings the panel onto the screen. It is fully settled once the panel's left edge has
 * crossed 55% of the screen width; before that it is lower down and faded.
 */
function Reveal({ x, children }: { x?: MotionValue<number>; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const panelLeft = useRef(0);
  // without sideways scrolling there is no entrance: a still value stands in and everything shows at once
  const still = useMotionValue(0);

  // where the panel sits in the row (its own left edge), measured from the panel around this wrapper
  useLayoutEffect(() => {
    const measure = () => {
      panelLeft.current = ref.current?.parentElement?.offsetLeft ?? 0;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const progress = useTransform(x ?? still, (shift) => {
    if (!x) return 1;
    const screenLeft = panelLeft.current + shift;
    // during server rendering there is no window; everything simply shows in place
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    return Math.min(1, Math.max(0, (width - screenLeft) / (width * 0.45)));
  });
  const y = useTransform(progress, (value) => `${(1 - value) * 38}dvh`);

  return (
    <motion.div ref={ref} style={{ y, opacity: progress }} className="flex w-full flex-col items-center">
      {children}
    </motion.div>
  );
}

/** One project in its panel: picture, name, a line of text and a link. Clicking the picture zooms into the project. */
function ProjectPanel({ study, x, onOpen }: { study: CaseStudy; x?: MotionValue<number>; onOpen: (zoom: ZoomState) => void }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const src = study.coverImage || study.heroImage || "";
  const href = `/case-studies/${study.slug}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // let the browser handle new-tab clicks and the like
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const box = imageRef.current?.getBoundingClientRect();
    if (!box) return;
    onOpen({ src, href, preload: [study.heroImage || study.coverImage || "", ...(study.images ?? []).slice(0, 1)], from: { top: box.top, left: box.left, width: box.width, height: box.height } });
  }

  return (
    <Panel className="flex flex-col justify-center px-[5vw] md:px-[4vw]">
      <Reveal x={x}>
      <a href={href} onClick={handleClick} className="group block w-full focus-visible:outline-none">
        <div ref={imageRef} className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-black/10">
          {src ? (
            <Image src={src} alt={study.title} fill sizes="(max-width: 768px) 76vw, 42vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/30">{study.title}</div>
          )}
        </div>
        <p className="mt-5 text-[clamp(1.4rem,1rem+1.2vw,2.2rem)] font-normal leading-tight tracking-[-0.03em]">{study.title}</p>
        <div className="mt-2 flex items-end justify-between gap-6">
          {study.heroQuote ? <p className="line-clamp-2 max-w-[22rem] text-[clamp(0.85rem,0.75rem+0.4vw,1.1rem)] leading-snug text-black/55">{study.heroQuote}</p> : <span />}
          <span className={EXPLORE_BUTTON}>
            Explore project <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </a>
      </Reveal>
    </Panel>
  );
}

/** One project in the phone list: picture, name, a line of text and a link, rising into view as it is scrolled to. */
function StackItem({ study, onOpen, last }: { study: CaseStudy; onOpen: (zoom: ZoomState) => void; last: boolean }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const src = study.coverImage || study.heroImage || "";
  const href = `/case-studies/${study.slug}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const box = imageRef.current?.getBoundingClientRect();
    if (!box) return;
    onOpen({ src, href, preload: [study.heroImage || study.coverImage || "", ...(study.images ?? []).slice(0, 1)], from: { top: box.top, left: box.left, width: box.width, height: box.height } });
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href={href} onClick={handleClick} className="group block focus-visible:outline-none">
        <div ref={imageRef} className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-black/10">
          {src ? <Image src={src} alt={study.title} fill sizes="92vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-black/30">{study.title}</div>}
        </div>
        <h3 className="mt-5 text-[1.45rem] font-normal leading-tight tracking-[-0.03em]">{study.title}</h3>
        {study.heroQuote && <p className="mt-2 line-clamp-3 text-[1rem] leading-snug text-black/55">{study.heroQuote}</p>}
        <span className={`${EXPLORE_BUTTON} mt-6`}>
          Explore project <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </a>
      {!last && <div aria-hidden className="mt-10 h-px w-full bg-black/15" />}
    </motion.article>
  );
}

/**
 * The case studies as a boxed grid under the hero: a thin line across the top with a crosshair, and
 * a thin vertical line between every panel. While the section is on screen it stays put and the
 * scrolling moves the row of panels sideways. Clicking a picture zooms it to fill the screen and then
 * opens that project.
 */
export default function CaseStudyGallery({ studies, id }: CaseStudyGalleryProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  // phones get a plain vertical list; larger screens get the pinned sideways row
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (progress) => -progress * distance);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setDistance(Math.max(0, rail.scrollWidth - window.innerWidth));
  }, []);

  useLayoutEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, studies.length]);

  // warm every project page as soon as the gallery is up, so opening one does not wait for the network
  useEffect(() => {
    studies.forEach((study) => router.prefetch(`/case-studies/${study.slug}`));
  }, [studies, router]);

  function open(next: ZoomState) {
    router.prefetch(next.href);
    if (reduced) {
      router.push(next.href);
      return;
    }
    startCaseZoom({ src: next.src, href: next.href, preload: next.preload, from: next.from, to: projectPictureRect() });
  }

  const reveal = !reduced;
  const panels = (
    <>
      {/* a thin line along the top of the whole row, over every panel */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 h-px bg-black/15" style={{ top: RULE_TOP }} />

      <Panel className="flex flex-col items-center justify-center px-8 text-center">
        <Reveal x={reveal ? x : undefined}>
          <h2 className="text-[clamp(2.2rem,1.2rem+3.4vw,5rem)] font-normal leading-[1.02] tracking-[-0.05em] text-black/80">
            Selected work
            <br />
            &amp; explorations
          </h2>
        </Reveal>
      </Panel>

      {studies.map((study) => (
        <ProjectPanel key={study.id || study.slug} study={study} x={reveal ? x : undefined} onOpen={open} />
      ))}

      <Panel className="flex flex-col items-center justify-center px-[6vw] text-center">
        <Reveal x={reveal ? x : undefined}>
          <ClosingStatement studies={studies} />
        </Reveal>
      </Panel>
    </>
  );

  const background = "bg-[#f7f9f8]";

  if (phone) {
    return (
      <section id={id} className={`${background} px-5 pb-16 pt-14 text-[#151716]`} style={{ color: INK }}>
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center text-[2.1rem] font-normal leading-[1.05] tracking-[-0.04em] text-black/80"
        >
          Selected work
          <br />
          &amp; explorations
        </motion.h2>
        <div className="flex flex-col gap-10">
          {studies.map((study, index) => (
            <StackItem key={study.id || study.slug} study={study} onOpen={open} last={index === studies.length - 1} />
          ))}
        </div>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col items-center border-t border-black/15 px-2 pb-6 pt-16 text-center"
        >
          <ClosingStatement studies={studies} />
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {reduced ? (
        // no pinned sideways movement: an ordinary row you scroll yourself
        <section id={id} className={`${background} text-[#151716]`} style={{ color: INK }}>
          <div className="relative flex h-[44rem] overflow-x-auto">{panels}</div>
        </section>
      ) : (
        <section id={id} ref={sectionRef} className={`relative ${background} text-[#151716]`} style={{ height: `calc(100dvh + ${distance}px)`, color: INK }}>
          <div className="sticky top-0 h-dvh overflow-hidden">
            <motion.div ref={railRef} style={{ x }} className="relative flex h-full w-max will-change-transform">
              {panels}
            </motion.div>
          </div>
        </section>
      )}

    </>
  );
}
