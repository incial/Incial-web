"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const WAVE_SEGMENTS = 24;
const WAVE_WIDTH = 1440;
const WAVE_CENTER_Y = 60;
const MAX_WAVE_AMP = 50;

/** Builds a smooth quadratic-spline SVG curve string across [0, 1440] for a given spring amplitude & phase. */
function buildLiquidCurvePoints(amp: number, phase: number, yOffset = 0): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= WAVE_SEGMENTS; i++) {
    const u = i / WAVE_SEGMENTS;
    const x = u * WAVE_WIDTH;
    const envelope = Math.sin(u * Math.PI);
    const bell = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
    const ripple = Math.sin(u * Math.PI * 3 + phase) * 0.24;
    const y = WAVE_CENTER_Y + yOffset - amp * envelope * (bell * 0.88 + ripple);
    pts.push([x, y]);
  }
  return pts;
}

function pointsToSpline(pts: ReadonlyArray<[number, number]>): string {
  let d = `L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i][0] + pts[i + 1][0]) * 0.5).toFixed(1);
    const my = ((pts[i][1] + pts[i + 1][1]) * 0.5).toFixed(1);
    d += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return d;
}

interface LiquidSeamWaveProps {
  /** Fill color of the section above this seam. */
  topColor: string;
  /** Fill color of the section below this seam. */
  bottomColor: string;
  className?: string;
}

/**
 * Scroll-driven liquid meniscus seam straddling a flat boundary between two sections:
 * - Slow scroll creates a gentle ripple; fast scroll creates a sweeping wave.
 * - Scroll down arches the lower color upward into the upper section; scroll up dips downward.
 * - When scrolling stops, an underdamped spring settles the wave cleanly back to a flat line.
 */
export default function LiquidSeamWave({
  topColor,
  bottomColor,
  className = "",
}: LiquidSeamWaveProps) {
  const reduced = Boolean(useReducedMotion());
  const wrapRef = useRef<HTMLDivElement>(null);
  const topPathRef = useRef<SVGPathElement>(null);
  const bottomPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const topEl = topPathRef.current;
    const bottomEl = bottomPathRef.current;
    if (!wrap || !topEl || !bottomEl) return;

    let visible = true;
    let lastScrollY = window.scrollY;
    let targetAmp = 0;
    let amp = 0;
    let vel = 0;
    let phase = 0;
    let rafId = 0;
    let lastTime = performance.now();
    let decayTimer = 0;

    const writePaths = (currentAmp: number, currentPhase: number) => {
      const topPts = buildLiquidCurvePoints(currentAmp, currentPhase, 1);
      const revTopPts = [...topPts].reverse();
      const topD = `M 0 0 L ${WAVE_WIDTH} 0 ${pointsToSpline(revTopPts)} Z`;

      const bottomPts = buildLiquidCurvePoints(currentAmp, currentPhase, 0);
      const bottomD = `M 0 ${WAVE_CENTER_Y} ${pointsToSpline(bottomPts).replace(/^L\s*/, "")} L ${WAVE_WIDTH} 120 L 0 120 Z`;

      topEl.setAttribute("d", topD);
      bottomEl.setAttribute("d", bottomD);
    };

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Decay targetAmp smoothly toward 0 once wheel/scroll impulse finishes.
      targetAmp *= Math.exp(-9.5 * dt);

      // Underdamped liquid spring for fluid slosh and flat settle.
      const stiffness = 135;
      const damping = 12;
      const accel = stiffness * (targetAmp - amp) - damping * vel;
      vel += accel * dt;
      amp += vel * dt;

      if (Math.abs(amp) > 0.25 || Math.abs(vel) > 0.25) {
        phase += dt * 4.2 * Math.sign(vel || amp || 1);
        writePaths(amp, phase);
        if (visible) rafId = requestAnimationFrame(tick);
      } else {
        amp = 0;
        vel = 0;
        targetAmp = 0;
        writePaths(0, phase);
      }
    };

    const startLoop = () => {
      if (!rafId && visible) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      if (Math.abs(delta) < 0.5) return;

      // Positive delta (scrolling down) -> positive amp (wave arches UP); negative -> dips DOWN.
      const impulse = Math.max(-MAX_WAVE_AMP, Math.min(MAX_WAVE_AMP, delta * 1.15));
      targetAmp = Math.max(-MAX_WAVE_AMP, Math.min(MAX_WAVE_AMP, targetAmp * 0.45 + impulse));
      window.clearTimeout(decayTimer);
      decayTimer = window.setTimeout(() => {
        targetAmp = 0;
      }, 60);
      startLoop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(wrap);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(decayTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none relative z-30 -my-[clamp(3.5rem,7dvh,6rem)] w-full overflow-hidden leading-none ${className}`}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block h-[clamp(7rem,14dvh,12rem)] w-full"
      >
        <path
          ref={topPathRef}
          d="M 0 0 L 1440 0 L 1440 61 L 0 61 Z"
          fill={topColor}
        />
        <path
          ref={bottomPathRef}
          d="M 0 60 L 1440 60 L 1440 120 L 0 120 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
}
