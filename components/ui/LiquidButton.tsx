"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface LiquidButtonProps {
  children: ReactNode;
  /** Internal paths use the router; anything else (a PDF, another site) opens in a new tab. */
  href?: string;
  onClick?: () => void;
  /**
   * `outline`: transparent, and a white liquid fills it on hover (the text turns black).
   * `solid`: white, and a black liquid fills it on hover (the text turns white).
   */
  variant?: "outline" | "solid";
  className?: string;
}

const VARIANTS = {
  outline: {
    base: "border-white/40 bg-transparent text-white hover:text-black focus-visible:text-black",
    liquid: "bg-white",
    wave: "fill-white",
  },
  solid: {
    base: "border-white bg-white text-black hover:text-white focus-visible:text-white",
    liquid: "bg-black",
    wave: "fill-black",
  },
} as const;

/** One period is 600 units wide and the strip holds two, so sliding it by half loops seamlessly. */
const WAVE_PATH = "M0 24 V12 C100 0 200 0 300 12 S500 24 600 12 S800 0 900 12 S1100 24 1200 12 V24 Z";

function isInternal(href: string): boolean {
  return href.startsWith("/") && !/\.[a-z0-9]{2,5}($|[?#])/i.test(href);
}

/**
 * A pill button that fills with a wavy liquid, rising from the bottom edge, while it is hovered
 * or focused. The fill is a transformed layer, so the animation stays on the compositor.
 */
export default function LiquidButton({
  children,
  href,
  onClick,
  variant = "outline",
  className = "",
}: LiquidButtonProps) {
  const style = VARIANTS[variant];
  const classes = `liquid-button group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border text-center font-medium whitespace-nowrap transition-colors duration-500 focus:outline-none active:scale-[0.98] ${style.base} ${className}`;

  const content = (
    <>
      <span aria-hidden className="liquid-button-fill pointer-events-none absolute inset-0">
        <span className={`absolute inset-0 ${style.liquid}`} />
        <svg
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          className="absolute bottom-full left-0 h-3 w-[200%] liquid-button-wave"
        >
          <path d={WAVE_PATH} className={style.wave} />
        </svg>
      </span>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </>
  );

  if (href && isInternal(href)) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
