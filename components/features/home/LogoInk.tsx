"use client";

import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  radius: number;
  born: number;
}

const LIFE_MS = 1900;
const MAX_DROPS = 180;
/** Distance (in logo-box fractions) between ink drops along the cursor path. */
const SPACING = 0.012;
const BASE_RADIUS = 0.017;
const SPREAD = 1.15;
const INK_RGB = "37, 99, 235";
const LOGO_MASK = "url(/logo/Logoo-white.svg)";

/**
 * Ink that follows the cursor across the logo: drops spread, merge into a gooey stroke and
 * fade, and are clipped to the logo's own shape. Sits over the logo box; pointer-transparent.
 */
export default function LogoInk() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let drops: Drop[] = [];
    let frame = 0;
    let last: { x: number; y: number } | null = null;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.offsetWidth;
      height = wrap.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      drops = drops.filter((drop) => now - drop.born < LIFE_MS);
      ctx.clearRect(0, 0, width, height);

      for (const drop of drops) {
        const t = (now - drop.born) / LIFE_MS;
        const eased = 1 - (1 - t) ** 3;
        const radius = drop.radius * (1 + SPREAD * eased);
        const alpha = (1 - t) ** 1.6;
        ctx.fillStyle = `rgba(${INK_RGB}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = drops.length > 0 ? requestAnimationFrame(draw) : 0;
    };

    const addDrop = (x: number, y: number, now: number) => {
      drops.push({
        x,
        y,
        radius: width * BASE_RADIUS * (0.7 + Math.random() * 0.8),
        born: now,
      });
      if (drops.length > MAX_DROPS) drops.shift();
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0) return;
      const x = ((event.clientX - rect.left) / rect.width) * width;
      const y = ((event.clientY - rect.top) / rect.height) * height;
      const inside = x >= 0 && y >= 0 && x <= width && y <= height;
      if (!inside) {
        last = null;
        return;
      }

      const now = performance.now();
      if (last) {
        const distance = Math.hypot(x - last.x, y - last.y);
        const steps = Math.max(1, Math.ceil(distance / (width * SPACING)));
        for (let i = 1; i <= steps; i++) {
          const k = i / steps;
          addDrop(last.x + (x - last.x) * k, last.y + (y - last.y) * k, now);
        }
      } else {
        addDrop(x, y, now);
      }
      last = { x, y };
      if (!frame) frame = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  return (
    <>
      <svg width="0" height="0" aria-hidden className="pointer-events-none absolute">
        <filter id="logo-ink-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
          />
        </filter>
      </svg>
      <div
        ref={wrapRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage: LOGO_MASK,
          maskImage: LOGO_MASK,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ filter: "url(#logo-ink-goo)" }}
        />
      </div>
    </>
  );
}
