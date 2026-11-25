"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ScrollHint from "@/components/ui/ScrollHint";
import { ProductCard, ProductCaption, firstParagraph } from "./ProductParts";
import ShaderBackground from "@/components/ui/ShaderBackground";
import StretchHeading from "./StretchHeading";
import type { Product } from "@/lib/dataLoader";

interface ProductsFlowProps {
  products: ReadonlyArray<Product>;
}

const INK = "#151716";
const ACCENT = "#22b45a";
/** The light grey of the path the black line follows. */
const PATH_GREY = "#d6dad8";
/** Where the thread meets the rail, in px above the first dot. */
const JOIN_ABOVE_DOT = 44;
/** How far the rail runs on past the last dot, in px. */
const RAIL_TAIL = 56;
/** The reading line: a point this far down the screen that the drawn line follows. */
const READING_LINE = 0.55;

function ramp(v: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (v - from) / (to - from)));
}

interface Geometry {
  width: number;
  height: number;
  start: { x: number; y: number };
  /** the long curve, from under the words to where it meets the rail */
  thread: string;
  /** the resting rail, from the join to a little past the last dot */
  rail: string | null;
  /** the part of the rail the dark line runs along: join to last dot */
  dark: string | null;
  joinY: number;
  /** y of each dot, and of each row's centre and height, in section coordinates */
  dots: number[];
}

/** The measured geometry, plus a counter that changes whenever it is re-measured so derived values refresh. */
interface GeoSource {
  ref: RefObject<Geometry | null>;
  version: MotionValue<number>;
}

/** One product: its caption beside a dot on the rail, and its picture on the right, level with it. */
function ProductRow({
  product,
  index,
  reading,
  geo,
  reduced,
  setDot,
}: {
  product: Product;
  index: number;
  reading: MotionValue<number>;
  geo: GeoSource;
  reduced: boolean;
  setDot: (el: HTMLSpanElement | null) => void;
}) {
  // the dot fills, and the words settle from green to ink, as the line reaches them
  const reach = useTransform([reading, geo.version], ([r]: number[]) => {
    if (reduced) return 1;
    const y = geo.ref.current?.dots[index];
    return y === undefined ? 0 : ramp(r, y - 60, y);
  });
  const dotScale = useTransform(reach, (v) => 1 + 0.5 * v);
  const color = useTransform(reach, (v): string => (v < 1 ? ACCENT : INK));
return (
    <div className="grid grid-cols-1 gap-y-3 py-5 md:grid-cols-[minmax(0,36fr)_minmax(0,49fr)] md:items-center md:gap-x-0 md:gap-y-6 md:py-[clamp(2.5rem,8dvh,6rem)]">
      <div className="relative pl-5 md:pl-12">
        <motion.span
          ref={setDot}
          style={{ scale: dotScale }}
          className="absolute left-0 top-[0.8rem] block h-3.5 w-3.5 md:h-3 md:w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[#151716] bg-[#f7f9f8] md:top-1/2"
        >
          <motion.span style={{ opacity: reach }} className="absolute inset-[1.5px] rounded-full bg-[#151716]" />
        </motion.span>
        <ProductCaption product={product} color={color} />
      </div>

      <ProductCard product={product} index={index} />
    </div>
  );
}

/** The black opening, its lower edge curved. Scrolling carries it away, and its words fade as it goes. */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, (p) => 1 - ramp(p, 0.15, 0.7));
  // the lower corners are square at the top of the page and only round off as it scrolls
  const curve = useTransform(scrollYProgress, (p) => `${14 * ramp(p, 0, 0.25)}dvh`);

  return (
    <motion.section
      ref={ref}
      style={{ ["--hero-curve" as string]: curve }}
      className="relative z-10 flex h-dvh overflow-hidden [border-bottom-left-radius:50%_var(--hero-curve)] [border-bottom-right-radius:50%_var(--hero-curve)] min-h-[28rem] flex-col items-center justify-center bg-black px-6 pb-[14dvh] text-center text-white"
    >
      {/* the same near-black shader surface as the homepage hero */}
      <ShaderBackground className="absolute inset-0 z-0 h-full w-full" />

      <motion.div style={{ opacity }} className="relative z-10 flex flex-col items-center">
        <div className="mb-8 flex justify-center">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} variant="pill" size="lg" />
        </div>
        <h1 className="mb-4 text-5xl italic md:text-8xl">
          <StretchHeading emphasis="Products" baseWeight={700} emphasisGrow={1.15} />
        </h1>
        <p className="text-[14px] italic text-gray-400">Built to work. Built to scale. Built for real businesses.</p>
      </motion.div>

      <motion.div style={{ opacity }} className="absolute inset-x-0 bottom-[clamp(1.5rem,5dvh,3rem)] z-10 flex justify-center">
        <ScrollHint delay={0.8} targetId="product-flow" />
      </motion.div>
    </motion.section>
  );
}

function StaticProducts({ products }: ProductsFlowProps) {
  return (
    <section className="bg-black px-6 pb-16 pt-32 text-center text-white">
      <div className="mb-8 flex justify-center">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} variant="pill" size="lg" />
      </div>
      <h1 className="text-4xl font-bold italic">Products</h1>
      <p className="mt-3 text-sm italic text-gray-400">Built to work. Built to scale. Built for real businesses.</p>
      <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-12 text-left">
        {products.map((product) => (
          <div key={product.id}>
            <h2 className="mb-2 text-2xl font-semibold">{product.name}</h2>
            <p className="text-white/70">{firstParagraph(product)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FlowBody({ products, reduced }: ProductsFlowProps & { reduced: boolean }) {
  const count = products.length;
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const version = useMotionValue(0);
  const geoRef = useRef<Geometry | null>(null);
  const geo = useMemo<GeoSource>(() => ({ ref: geoRef, version }), [version]);

  // a line across the screen at READING_LINE, in the section's own coordinates: everything drawn follows it
  const { scrollY } = useScroll();
  const reading = useTransform(scrollY, () => {
    const section = sectionRef.current;
    return section ? window.innerHeight * READING_LINE - section.getBoundingClientRect().top : 0;
  });

  const threadDraw = useTransform([reading, version], ([r]: number[]) => {
    const g = geo.ref.current;
    if (reduced) return 1;
    return g ? ramp(r, g.start.y, g.joinY) : 0;
  });
  const darkDraw = useTransform([reading, version], ([r]: number[]) => {
    const g = geo.ref.current;
    if (reduced) return 1;
    if (!g || g.dots.length === 0) return 0;
    return ramp(r, g.joinY, g.dots[g.dots.length - 1]);
  });
  const headingOpacity = useTransform(reading, (r) => (reduced ? 1 : ramp(r, 20, 240)));

  const measure = useCallback(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    const box = section.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    const start = { x: headingBox.left + headingBox.width / 2 - box.left, y: headingBox.bottom - box.top + 12 };

    const dotCentres = dotRefs.current.slice(0, count).flatMap((el) => {
      if (!el) return [];
      const dot = el.getBoundingClientRect();
      return [{ x: dot.left + dot.width / 2 - box.left, y: dot.top + dot.height / 2 - box.top }];
    });
    if (dotCentres.length === 0) {
      geoRef.current = { width: box.width, height: box.height, start, thread: "", rail: null, dark: null, joinY: start.y, dots: [] };
      version.set(version.get() + 1);
      return;
    }

    // the curve flows into the rail just above the first dot; the rail runs on down past the last
    const join = { x: dotCentres[0].x, y: dotCentres[0].y - JOIN_ABOVE_DOT };
    const last = dotCentres[dotCentres.length - 1];
    const reach = (join.y - start.y) * 0.62;
    geoRef.current = {
      width: box.width,
      height: box.height,
      start,
      thread: `M${start.x} ${start.y} C${start.x} ${start.y + reach}, ${join.x} ${join.y - reach}, ${join.x} ${join.y}`,
      rail: `M${join.x} ${join.y} L${join.x} ${last.y + RAIL_TAIL}`,
      dark: `M${join.x} ${join.y} L${join.x} ${last.y}`,
      joinY: join.y,
      dots: dotCentres.map((dot) => dot.y),
    };
    version.set(version.get() + 1);
  }, [count, version]);

  useLayoutEffect(() => {
    measure();
    const section = sectionRef.current;
    if (!section) return;
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    window.addEventListener("resize", measure);
    // images and fonts settle after the first paint and move the dots
    const settle = window.setTimeout(measure, 600);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(settle);
    };
  }, [measure]);

  return (
    <section id="product-flow" ref={sectionRef} className="relative" style={{ color: INK }}>
      <GeometryLines geo={geo} threadDraw={threadDraw} darkDraw={darkDraw} headingOpacity={headingOpacity} />

      {/* "Let's explore our products." */}
      <div ref={headingRef} className="relative flex justify-center px-6 pt-[clamp(4.5rem,10dvh,6rem)] md:pt-[clamp(5rem,13dvh,9rem)]">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[clamp(2.4rem,11vw,3.4rem)] font-normal tracking-[-0.04em] md:text-[clamp(1.6rem,1rem+2.4vw,3.2rem)]"
        >
          Let&rsquo;s explore our products.
          <span className="relative ml-3 inline-block h-[1.05em] w-[1.05em] rounded-full bg-[#151716] align-middle shadow-[0_0_0_0.22em_rgba(34,180,90,0.16)] ring-2 ring-white">
            <Image src="/logo/Logoo-white.svg" alt="" fill sizes="48px" className="object-contain p-[0.2em]" />
          </span>
        </motion.p>
      </div>

      {/* the rows: rail and captions on the left, pictures on the right */}
      <div className="relative ml-4 mt-[clamp(6rem,17dvh,9rem)] w-[calc(100%-2.25rem)] md:mx-auto md:mt-[clamp(14rem,45dvh,28rem)] md:w-[min(86vw,80rem)]">
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            index={index}
            reading={reading}
            geo={geo}
            reduced={reduced}
            setDot={(el) => {
              dotRefs.current[index] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * The route: a light grey path (the curve, then the rail) that is always there, and the black line
 * that follows it as the page is scrolled.
 */
function GeometryLines({
  geo,
  threadDraw,
  darkDraw,
  headingOpacity,
}: {
  geo: GeoSource;
  threadDraw: MotionValue<number>;
  darkDraw: MotionValue<number>;
  headingOpacity: MotionValue<number>;
}) {
  const width = useTransform(geo.version, () => geo.ref.current?.width ?? 0);
  const height = useTransform(geo.version, () => geo.ref.current?.height ?? 0);
  const thread = useTransform(geo.version, () => geo.ref.current?.thread ?? "");
  const rail = useTransform(geo.version, () => geo.ref.current?.rail ?? "");
  const dark = useTransform(geo.version, () => geo.ref.current?.dark ?? "");
  const startX = useTransform(geo.version, () => geo.ref.current?.start.x ?? 0);
  const startY = useTransform(geo.version, () => geo.ref.current?.start.y ?? 0);

  return (
    <motion.svg
      aria-hidden
      style={{ width, height }}
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
    >
      {/* the light grey path, whole from the start */}
      <motion.path d={thread} fill="none" stroke={PATH_GREY} strokeWidth={2.5} strokeLinecap="round" />
      <motion.path d={rail} fill="none" stroke={PATH_GREY} strokeWidth={2.5} strokeLinecap="round" />
      <motion.circle cx={startX} cy={startY} r={4} fill={PATH_GREY} />
      {/* the black line that follows it */}
      <motion.circle cx={startX} cy={startY} r={4} fill={INK} style={{ opacity: headingOpacity }} />
      <motion.path d={thread} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" style={{ pathLength: threadDraw }} />
      <motion.path d={dark} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" style={{ pathLength: darkDraw }} />
    </motion.svg>
  );
}

/**
 * The products page opening, laid out like a long page: a black "Products" section with a curved
 * lower edge, then "Let's explore our products." with a long curve that flows into a thin rail.
 * Each product sits at a dot on the rail, its caption beside it and its picture on the right.
 * The page scrolls normally; as it does the line is drawn on down the rail, each dot fills as the
 * line reaches it and its picture is revealed in place. Nothing slides or drifts.
 */
export default function ProductsFlow({ products }: ProductsFlowProps) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return <StaticProducts products={products} />;

  return (
    <>
      <Hero />
      <FlowBody products={products} reduced={reduced} />
    </>
  );
}
