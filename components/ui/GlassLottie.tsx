"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/** The glass animations in public/lottie/ (made by scripts/generate-lottie.mjs). */
export type GlassLottieName = "tiles-wave" | "tiles-matrix" | "tiles-cluster" | "glass-ribbon" | "glass-twist" | "glass-ring";

interface GlassLottieProps {
  name: GlassLottieName;
  /** Positions and sizes the animation (it is drawn inside this box). */
  className?: string;
  /** How the animation fits its box: "meet" shows all of it, "slice" fills the box and crops. */
  fit?: "meet" | "slice";
  /** Tilt toward the pointer and spin faster while the pointer moves quickly. */
  interactive?: boolean;
  /** Rotates the artwork inside its box (degrees), e.g. to stand a ribbon up along a side. */
  rotate?: number;
  /** Mirrors the artwork left to right (for the copy on the opposite side). */
  flip?: boolean;
  /** Shows the artwork still (its first frame: no float, no glint) instead of playing the loop. */
  still?: boolean;
  /** Turns the artwork as the page scrolls: degrees per screen height scrolled past it. */
  scrollSpin?: number;
  /** Drifts a little toward the pointer, flat (no 3D tilt). */
  drift?: boolean;
}

/** How far the artwork tilts toward the pointer (degrees) and drifts with it (px). */
const TILT = 16;
const DRIFT = 22;
/** How quickly the tilt and speed catch up (share of the gap closed per frame). */
const EASE = 0.08;
/** Pointer speed (px per frame) that doubles the playback speed; and the fastest it can go. */
const SPEED_PER_PX = 1 / 25;
const MAX_SPEED = 3;

/**
 * A decorative glass Lottie animation. The player is loaded only when the box comes near the screen
 * and plays only while it is on screen. With `interactive`, the glass leans toward the pointer and
 * spins faster while the pointer moves quickly; with `drift` it only drifts a little toward the
 * pointer, flat. With `still` it shows the artwork without playing, and with `scrollSpin` it turns
 * flat (in its own plane) as the page scrolls past it. With reduced motion it shows a still frame.
 */
export default function GlassLottie({
  name,
  className = "",
  fit = "meet",
  interactive = false,
  rotate = 0,
  flip = false,
  still = false,
  scrollSpin = 0,
  drift = false,
}: GlassLottieProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const tilt = tiltRef.current;
    const art = artRef.current;
    if (!box || !tilt || !art) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animation: AnimationItem | null = null;
    let cancelled = false;
    let visible = false;

    // pointer-following state (eased every frame while the box is on screen)
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0, speed: 1 };
    let lastPointer: { x: number; y: number } | null = null;
    let boost = 0;
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      // -1..1 from the box's centre, measured against the screen so the whole page steers it
      target.x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)));
      target.y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)));
      if (lastPointer) boost = Math.max(boost, Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y) * SPEED_PER_PX);
      lastPointer = { x: event.clientX, y: event.clientY };
    };

    let spin = 0;
    const write = () => {
      if (interactive) {
        tilt.style.transform = `perspective(1100px) translate3d(${(current.x * DRIFT).toFixed(1)}px, ${(current.y * DRIFT).toFixed(1)}px, 0) rotateY(${(current.x * TILT).toFixed(2)}deg) rotateX(${(-current.y * TILT * 0.7).toFixed(2)}deg) rotate(${spin.toFixed(2)}deg)`;
      } else {
        tilt.style.transform = `translate(${(current.x * DRIFT).toFixed(1)}px, ${(current.y * DRIFT).toFixed(1)}px) rotate(${spin.toFixed(2)}deg)`;
      }
    };

    const tick = () => {
      frame = 0;
      if (!visible) return;
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      boost *= 0.92;
      const speed = Math.min(MAX_SPEED, 1 + boost);
      current.speed += (speed - current.speed) * EASE;
      write();
      if (interactive) animation?.setSpeed(current.speed);
      frame = requestAnimationFrame(tick);
    };
    const follow = (interactive || drift) && !reduced;
    if (follow) window.addEventListener("pointermove", onPointerMove, { passive: true });

    // scroll-driven turn: the box's distance from the middle of the screen sets the angle, so it
    // turns forward while scrolling down and back while scrolling up (once per frame at most)
    let spinFrame = 0;
    const applySpin = () => {
      spinFrame = 0;
      const rect = box.getBoundingClientRect();
      const fromMiddle = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight;
      spin = fromMiddle * scrollSpin;
      write();
    };
    const onScroll = () => {
      if (!spinFrame) spinFrame = requestAnimationFrame(applySpin);
    };
    const spins = scrollSpin !== 0 && !reduced;
    if (spins) {
      window.addEventListener("scroll", onScroll, { passive: true });
      applySpin();
    }

    const start = async () => {
      try {
        const { default: lottie } = await import("lottie-web/build/player/lottie_light");
        if (cancelled) return;
        animation = lottie.loadAnimation({
          container: art,
          renderer: "svg",
          loop: !reduced,
          autoplay: false,
          path: `/lottie/${name}.json`,
          rendererSettings: { preserveAspectRatio: `xMidYMid ${fit}`, progressiveLoad: true },
        });
        animation.addEventListener("DOMLoaded", () => {
          if (still) animation?.goToAndStop(0, true);
          else if (reduced) animation?.goToAndStop(Math.round((animation?.totalFrames ?? 0) * 0.25), true);
          else if (visible) animation?.play();
        });
      } catch (error) {
        console.error(`Glass animation "${name}" could not be loaded`, error);
      }
    };

    // load once the box is near the screen; play (and follow the pointer) only while it is on screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !animation && !cancelled) void start();
        // following the pointer works whether or not the artwork itself plays
        if (visible && follow && !frame) frame = requestAnimationFrame(tick);
        if (reduced || still) return;
        if (visible) animation?.play();
        else animation?.pause();
      },
      { rootMargin: "200px" },
    );
    observer.observe(box);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(spinFrame);
      animation?.destroy();
    };
  }, [name, fit, interactive, still, scrollSpin, drift]);

  return (
    <div ref={boxRef} aria-hidden className={`pointer-events-none ${className}`}>
      <div ref={tiltRef} className="h-full w-full will-change-transform">
        <div
          ref={artRef}
          className="h-full w-full"
          style={rotate || flip ? { transform: `${flip ? "scaleX(-1) " : ""}rotate(${rotate}deg)` } : undefined}
        />
      </div>
    </div>
  );
}
