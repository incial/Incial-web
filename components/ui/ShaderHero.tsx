"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import ScrollHint from "@/components/ui/ScrollHint";
import ShaderBackground from "@/components/ui/ShaderBackground";

interface ShaderHeroProps {
  breadcrumbs: BreadcrumbItem[];
  title: ReactNode;
  /** Classes for the heading, e.g. its size. */
  titleClassName?: string;
  tagline?: ReactNode;
  /** A picture drawn behind the words, over the shader. */
  image?: string;
  /** How strongly the picture shows (0 to 1); 0.1 is a soft wash. */
  imageOpacity?: number;
  /** id of the element the "Scroll down" hint scrolls to. */
  scrollTargetId: string;
  /**
   * Start as a shorter band with the curved bottom already in place, so the first section of the
   * page shows below it (no "Scroll down" hint). The default is a full-screen opening.
   */
  compact?: boolean;
}

function ramp(value: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

/**
 * A black opening (full-screen, or a shorter band with `compact`), the same as the Products page: the near-black shader surface with an
 * optional picture over it, breadcrumbs, a heading, and the "Scroll down" hint. Its lower corners are
 * square at the top of the page and round off as it scrolls away, and its words fade as it goes.
 */
export default function ShaderHero({
  breadcrumbs,
  title,
  titleClassName = "text-5xl font-bold md:text-7xl",
  tagline,
  image,
  imageOpacity = 0.1,
  scrollTargetId,
  compact = false,
}: ShaderHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // While the hero scrolls away, its words move down at half the scroll speed, so they stay in the
  // middle of the black that is still on screen (instead of leaving with the top of the page), and
  // fade only once that space gets small.
  const opacity = useTransform(scrollYProgress, (progress) => 1 - ramp(progress, 0.45, 0.75));
  const contentY = useTransform(scrollYProgress, (progress) => `${progress * 50}dvh`);
  // the hint belongs to the first screen: it fades as soon as scrolling starts, so it never sits
  // inside the curved bottom edge while the hero scrolls away
  const hintOpacity = useTransform(scrollYProgress, (progress) => 1 - ramp(progress, 0, 0.08));
  // the compact band is curved from the start; the full-screen one rounds off as it scrolls away
  const curve = useTransform(scrollYProgress, (progress) =>
    // capped by the width too, so narrow phones get a gentle curve rather than a bowl
    compact ? "min(14dvh, 16vw)" : `${14 * ramp(progress, 0, 0.25)}dvh`,
  );

  return (
    <motion.section
      ref={ref}
      style={{ ["--hero-curve" as string]: curve }}
      className={`relative z-10 flex ${compact ? "h-[56dvh] min-h-[34rem] pt-24" : "h-dvh min-h-[28rem]"} flex-col items-center justify-center overflow-hidden bg-black px-6 pb-[14dvh] text-center text-white [border-bottom-left-radius:50%_var(--hero-curve)] [border-bottom-right-radius:50%_var(--hero-curve)]`}
    >
      <ShaderBackground className="absolute inset-0 z-0 h-full w-full" />

      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ opacity: imageOpacity }}
          className="pointer-events-none z-[1] object-cover"
        />
      )}

      <motion.div style={{ opacity, y: contentY }} className="relative z-10 flex max-w-3xl flex-col items-center">
        <div className="mb-8 flex justify-center">
          <Breadcrumbs items={breadcrumbs} variant="pill" size="lg" />
        </div>
        <h1 className={`mb-4 ${titleClassName}`}>{title}</h1>
        {tagline && <p className="text-[14px] italic text-gray-400">{tagline}</p>}
      </motion.div>

      {!compact && (
        <motion.div style={{ opacity: hintOpacity }} className="absolute inset-x-0 bottom-[clamp(1.5rem,5dvh,3rem)] z-10 flex justify-center">
          <ScrollHint delay={0.8} targetId={scrollTargetId} />
        </motion.div>
      )}
    </motion.section>
  );
}
