"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { MotionValue } from "framer-motion";
import {
  LOGO_SCALE,
  PLATE_SIDE,
  PLATE_THICKNESS,
  SLAB_SIDE,
  SLAB_THICKNESS,
  STACK_CY,
  type StageSpec,
  clamp01,
  insideLogo,
  planeToScreen,
  smoothstep,
  stackLayout,
} from "./isoGeometry";

interface DustCanvasProps {
  spec: StageSpec;
  /**
   * Element whose box defines the dust coordinate space (the stage). The canvas itself is
   * free to cover the whole screen, so nothing is clipped while the logo dissolves.
   */
  anchorRef: RefObject<HTMLElement | null>;
  /** 0 = flat dust logo, 1 = dust gathered into the isometric stack. */
  morph: MotionValue<number>;
  /** Number of plates currently open in the stack (continuous). */
  revealed: MotionValue<number>;
  /** Continuous sub-service position; the matching plate is lit. */
  active: MotionValue<number>;
  plateCount: number;
  /**
   * CSS selector of the on-screen logo to dissolve. The dust is sampled from that exact
   * image, drawn over it, and then thins out into particles in place.
   */
  logoSource?: string;
  logoSrc?: string;
  /** Skip the dissolve intro (used when arriving back at the end of the section). */
  instant?: boolean;
  /**
   * Phones: the logo lives in the slide above. 0 = that slide is showing, 1 = this section is
   * pinned. The logo dissolves into dust and glides into the stage as this value rises.
   */
  entry?: MotionValue<number>;
  className?: string;
}

const COUNT_SPLIT = 9000;
const COUNT_STACKED = 6000;
const SUPERELLIPSE_POWER = 8;
const CURSOR_RADIUS = 120;
const CURSOR_FORCE = 7;
const SPRING = 0.045;
const DAMPING = 0.86;
const PUFF_SPEED = 5;
const PLATE_SLIDE = 70;
const SAMPLE_WIDTH = 420;
const ALPHA_CUTOFF = 110;
const DISSOLVE_DELAY_S = 0.15;
const DISSOLVE_S = 0.7;
const SAMPLE_RETRY_MS = 400;
const LANDING_SHIFT_SHARE = 0.18;
const WHITE = "#ffffff";
const SOFT = "#c9ccd6";
const BLUE = "#7db1ff";

const enum Part {
  LidLogo,
  LidOutline,
  LidSide,
  BaseOutline,
  BaseSide,
  Plate,
}

interface ParticleSet {
  part: Uint8Array;
  plate: Int16Array;
  u: Float32Array;
  v: Float32Array;
  dy: Float32Array;
  flat: Float32Array; // raw mark coordinates (±40), used when there is no logo to dissolve
  rest: Float32Array; // ambient position while a plate is closed
  alpha: Float32Array; // alpha in the stack
  delay: Float32Array;
  seed: Float32Array;
}

/**
 * The on-screen logo, sampled once. Positions are fractions of the logo's box, and the box is
 * read live every frame, so page transitions, resizes and rotation can never leave the dust
 * pinned to a stale position.
 */
interface LogoSample {
  element: HTMLElement;
  lastBox: DOMRect;
  points: Float32Array; // x, y per particle, as fractions of the logo box
  image: HTMLImageElement;
  /** Where the image sits inside the box, as fractions. */
  fx: number;
  fy: number;
  fw: number;
  fh: number;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const signedPow = (v: number, p: number) => Math.sign(v) * Math.abs(v) ** p;

function outlinePoint(rand: () => number, side: number, frontOnly = false): [number, number] {
  const half = side / 2;
  let u = 0;
  let v = 0;
  do {
    const theta = rand() * Math.PI * 2;
    u = half * signedPow(Math.cos(theta), 2 / SUPERELLIPSE_POWER);
    v = half * signedPow(Math.sin(theta), 2 / SUPERELLIPSE_POWER);
  } while (frontOnly && u + v < 0);
  return [u, v];
}

function logoPoint(rand: () => number): [number, number] {
  let x = 0;
  let y = 0;
  do {
    x = (rand() * 2 - 1) * 40;
    y = (rand() * 2 - 1) * 40;
  } while (!insideLogo(x, y));
  return [x, y];
}

function buildParticles(count: number, plateCount: number, stackX: number): ParticleSet {
  const rand = mulberry32(11);
  const set: ParticleSet = {
    part: new Uint8Array(count),
    plate: new Int16Array(count),
    u: new Float32Array(count),
    v: new Float32Array(count),
    dy: new Float32Array(count),
    flat: new Float32Array(count * 2),
    rest: new Float32Array(count * 2),
    alpha: new Float32Array(count),
    delay: new Float32Array(count),
    seed: new Float32Array(count),
  };

  for (let i = 0; i < count; i++) {
    const [fx, fy] = logoPoint(rand);
    set.flat[i * 2] = fx;
    set.flat[i * 2 + 1] = fy;

    const angle = rand() * Math.PI * 2;
    const radius = 150 + rand() * 120;
    set.rest[i * 2] = stackX + Math.cos(angle) * radius;
    set.rest[i * 2 + 1] = STACK_CY + Math.sin(angle) * radius * 0.55;

    const pick = i / count;
    set.plate[i] = -1;

    if (pick < 0.16) {
      const [x, y] = logoPoint(rand);
      set.part[i] = Part.LidLogo;
      set.u[i] = x * LOGO_SCALE;
      set.v[i] = y * LOGO_SCALE;
      set.alpha[i] = 0.95;
    } else if (pick < 0.24) {
      const [u, v] = outlinePoint(rand, SLAB_SIDE);
      set.part[i] = Part.LidOutline;
      set.u[i] = u;
      set.v[i] = v;
      set.alpha[i] = 0.9;
    } else if (pick < 0.29) {
      const [u, v] = outlinePoint(rand, SLAB_SIDE, true);
      set.part[i] = Part.LidSide;
      set.u[i] = u;
      set.v[i] = v;
      set.dy[i] = rand() * SLAB_THICKNESS;
      set.alpha[i] = 0.55;
    } else if (pick < 0.36) {
      const [u, v] = outlinePoint(rand, SLAB_SIDE);
      set.part[i] = Part.BaseOutline;
      set.u[i] = u;
      set.v[i] = v;
      set.alpha[i] = 0.75;
    } else if (pick < 0.41) {
      const [u, v] = outlinePoint(rand, SLAB_SIDE, true);
      set.part[i] = Part.BaseSide;
      set.u[i] = u;
      set.v[i] = v;
      set.dy[i] = rand() * SLAB_THICKNESS;
      set.alpha[i] = 0.5;
    } else {
      const kind = rand();
      set.part[i] = Part.Plate;
      set.plate[i] = i % Math.max(plateCount, 1);
      if (kind < 0.4) {
        const [u, v] = outlinePoint(rand, PLATE_SIDE);
        set.u[i] = u;
        set.v[i] = v;
        set.alpha[i] = 0.9;
      } else if (kind < 0.65) {
        const half = PLATE_SIDE * 0.46;
        set.u[i] = (rand() * 2 - 1) * half;
        set.v[i] = (rand() * 2 - 1) * half;
        set.alpha[i] = 0.4;
      } else {
        const [u, v] = outlinePoint(rand, PLATE_SIDE, true);
        set.u[i] = u;
        set.v[i] = v;
        set.dy[i] = rand() * PLATE_THICKNESS;
        set.alpha[i] = 0.6;
      }
    }

    set.delay[i] = rand();
    set.seed[i] = rand() * Math.PI * 2;
  }
  return set;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** Reads the real logo image and scatters particles over its pixels. */
async function sampleLogo(
  selector: string,
  src: string,
  particleCount: number,
): Promise<LogoSample | null> {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return null;
  const layoutW = element.offsetWidth;
  const layoutH = element.offsetHeight;
  if (layoutW === 0 || layoutH === 0) return null;

  const image = await loadImage(src);
  const fit = Math.min(layoutW / image.naturalWidth, layoutH / image.naturalHeight);
  const w = image.naturalWidth * fit;
  const h = image.naturalHeight * fit;
  const fx = (layoutW - w) / 2 / layoutW;
  const fy = (layoutH - h) / 2 / layoutH;
  const fw = w / layoutW;
  const fh = h / layoutH;

  const sw = SAMPLE_WIDTH;
  const sh = Math.max(1, Math.round((SAMPLE_WIDTH * h) / w));
  const offscreen = document.createElement("canvas");
  offscreen.width = sw;
  offscreen.height = sh;
  const octx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!octx) return null;
  octx.drawImage(image, 0, 0, sw, sh);
  const pixels = octx.getImageData(0, 0, sw, sh).data;

  const filled: number[] = [];
  for (let py = 0; py < sh; py++) {
    for (let px = 0; px < sw; px++) {
      if (pixels[(py * sw + px) * 4 + 3] > ALPHA_CUTOFF) filled.push(px, py);
    }
  }
  if (filled.length === 0) return null;

  const rand = mulberry32(23);
  const pixelCount = filled.length / 2;
  const points = new Float32Array(particleCount * 2);
  for (let i = 0; i < particleCount; i++) {
    const pick = Math.floor(rand() * pixelCount) * 2;
    points[i * 2] = fx + ((filled[pick] + rand()) / sw) * fw;
    points[i * 2 + 1] = fy + ((filled[pick + 1] + rand()) / sh) * fh;
  }
  return {
    element,
    lastBox: element.getBoundingClientRect(),
    points,
    image,
    fx,
    fy,
    fw,
    fh,
  };
}

export default function DustCanvas({
  spec,
  anchorRef,
  morph,
  revealed,
  active,
  plateCount,
  logoSource,
  logoSrc = "/logo/Logoo-white.svg",
  instant = false,
  entry,
  className,
}: DustCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const count = spec.viewW < 700 ? COUNT_STACKED : COUNT_SPLIT;
    const p = buildParticles(count, plateCount, spec.stackX);
    const offX = new Float32Array(count);
    const offY = new Float32Array(count);
    const velX = new Float32Array(count);
    const velY = new Float32Array(count);
    const open = new Float32Array(plateCount);
    const lit = new Float32Array(plateCount);
    const plateY = new Float32Array(plateCount);
    const cursor = { x: -9999, y: -9999 }; // client px
    const flatScale = Math.min(5, (spec.viewH * 0.9) / 80, (spec.viewW * 0.7) / 80);
    let frame = 0;
    let disposed = false;
    let sample: LogoSample | null = null;
    let waitingForLogo = Boolean(logoSource);
    let startedAt = 0;
    const bridged = Boolean(entry && logoSource);
    let usedFallback = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const puff = () => {
      const rand = mulberry32(5);
      for (let i = 0; i < count; i++) {
        const angle = rand() * Math.PI * 2;
        const speed = (0.3 + rand() * 0.7) * PUFF_SPEED;
        velX[i] = Math.cos(angle) * speed;
        velY[i] = Math.sin(angle) * speed;
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    if (logoSource) {
      // The logo may not exist yet (phones show the intro words first), so keep looking.
      const handleResult = (result: LogoSample | null) => {
        if (disposed || usedFallback) return;
        if (!result && bridged) {
          retryTimer = setTimeout(attempt, SAMPLE_RETRY_MS);
          return;
        }
        sample = result;
        waitingForLogo = false;
        if (!instant && !bridged) puff();
      };
      const attempt = () => {
        sampleLogo(logoSource, logoSrc, count)
          .then(handleResult)
          .catch(() => handleResult(null));
      };
      attempt();
    } else if (!instant) {
      puff();
    }

    const handlePointer = (event: PointerEvent) => {
      cursor.x = event.clientX;
      cursor.y = event.clientY;
    };
    const handleLeave = () => {
      cursor.x = -9999;
      cursor.y = -9999;
    };
    const handleRelease = (event: PointerEvent) => {
      if (event.pointerType === "touch") handleLeave();
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerup", handleRelease, { passive: true });
    window.addEventListener("pointercancel", handleRelease, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      const anchor = anchorRef.current;
      const entryValue = entry ? entry.get() : 1;
      if (waitingForLogo) {
        // no logo to dissolve by the time the user reaches us: carry on without one
        if (bridged && entryValue > 0.001) {
          usedFallback = true;
          waitingForLogo = false;
        } else {
          return;
        }
      }
      if (!anchor) return;
      if (startedAt === 0) startedAt = time;

      const bridgeActive = bridged && Boolean(sample);
      const elapsed = (time - startedAt) / 1000;
      let fade: number;
      if (bridgeActive) fade = smoothstep((entryValue - 0.02) / 0.28);
      else fade = sample && !instant ? smoothstep((elapsed - DISSOLVE_DELAY_S) / DISSOLVE_S) : 1;

      const m = morph.get();

      // the landing buttons slide down and away while the logo turns to dust
      if (bridgeActive && sample) {
        sample.element
          .closest<HTMLElement>("[data-mobile-scroll]")
          ?.style.setProperty("--landing-shift", String(smoothstep(entryValue / LANDING_SHIFT_SHARE)));
      }

      // still on the landing slide: the real logo is showing, nothing to draw
      if (bridgeActive && sample && entryValue <= 0.001 && m <= 0.001) {
        sample.element.style.visibility = "";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      if (bridgeActive && sample) sample.element.style.visibility = "hidden";
      const r = revealed.get();
      const a = active.get();
      const layout = stackLayout(r);

      const rect = canvas.getBoundingClientRect();
      const box = anchor.getBoundingClientRect();
      if (rect.width === 0 || box.width === 0) return;
      // the section has scrolled away above the screen
      if (bridged && box.bottom < 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const anchorCenterX = box.left + box.width / 2;
      const anchorCenterY = box.top + box.height / 2;
      const toStage = bridgeActive ? smoothstep(entryValue) : 0;
      const pxPerCss = canvas.width / rect.width;
      const cssPerUnit = box.width / spec.viewW;
      const unitScale = cssPerUnit * pxPerCss; // canvas px per stage unit
      const originX = (box.left - rect.left) * pxPerCss;
      const originY = (box.top - rect.top) * pxPerCss;
      const cursorX = (cursor.x - box.left) / cssPerUnit;
      const cursorY = (cursor.y - box.top) / cssPerUnit;
      const cursorRadius = CURSOR_RADIUS;

      for (let k = 0; k < plateCount; k++) {
        open[k] = smoothstep(r - k);
        lit[k] = clamp01(1 - Math.abs(a - k)) * open[k];
        plateY[k] = layout.plateY(k);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // where the real logo is right now (kept from the last good read if it is hidden)
      let logoBox: DOMRect | null = null;
      if (sample) {
        const live = sample.element.isConnected ? sample.element.getBoundingClientRect() : null;
        // while bridging, the dust stays where the logo was when scrolling began
        if (live && live.width > 0 && (!bridgeActive || entryValue <= 0.001)) sample.lastBox = live;
        logoBox = sample.lastBox;
      }

      // the real logo, redrawn in place, thins out as the dust takes over
      if (sample && logoBox && fade < 1) {
        ctx.globalAlpha = 1 - fade;
        ctx.drawImage(
          sample.image,
          (logoBox.left + sample.fx * logoBox.width - rect.left) * pxPerCss,
          (logoBox.top + sample.fy * logoBox.height - rect.top) * pxPerCss,
          sample.fw * logoBox.width * pxPerCss,
          sample.fh * logoBox.height * pxPerCss,
        );
      }

      let currentColor = "";
      for (let i = 0; i < count; i++) {
        const seed = p.seed[i];
        const part = p.part[i] as Part;
        let alphaStack = p.alpha[i];
        let color = WHITE;
        let isoX = 0;
        let isoY = 0;

        if (part === Part.Plate) {
          const kk = p.plate[i];
          const o = open[kk];
          const [px, py] = planeToScreen(
            p.u[i],
            p.v[i],
            spec.stackX + (1 - o) * PLATE_SLIDE,
            plateY[kk],
          );
          const restX = p.rest[i * 2] + Math.sin(time * 0.0007 + seed) * 6;
          const restY = p.rest[i * 2 + 1] + Math.cos(time * 0.0009 + seed) * 6;
          isoX = restX + (px - restX) * o;
          isoY = restY + (py + p.dy[i] - restY) * o;
          alphaStack *= 0.25 + 0.75 * o;
          color = lit[kk] > 0.35 ? BLUE : SOFT;
        } else if (part === Part.BaseOutline || part === Part.BaseSide) {
          [isoX, isoY] = planeToScreen(p.u[i], p.v[i], spec.stackX, layout.baseY);
          isoY += p.dy[i];
        } else {
          [isoX, isoY] = planeToScreen(p.u[i], p.v[i], spec.stackX, layout.lidY);
          isoY += p.dy[i];
        }

        const u = clamp01(m * 1.7 - p.delay[i] * 0.7);
        const e = u * u * (3 - 2 * u);
        let fx: number;
        let fy: number;
        if (sample && logoBox) {
          const ptx = sample.points[i * 2];
          const pty = sample.points[i * 2 + 1];
          let sx = logoBox.left + ptx * logoBox.width;
          let sy = logoBox.top + pty * logoBox.height;
          if (toStage > 0) {
            // glide from the landing logo to the same logo shape centred in the stage
            sx += (anchorCenterX + (ptx - 0.5) * logoBox.width - sx) * toStage;
            sy += (anchorCenterY + (pty - 0.5) * logoBox.height - sy) * toStage;
          }
          fx = (sx - box.left) / cssPerUnit;
          fy = (sy - box.top) / cssPerUnit;
        } else {
          fx = spec.centerX + p.flat[i * 2] * flatScale;
          fy = spec.centerY + p.flat[i * 2 + 1] * flatScale;
        }
        const wobble = 0.5 + 2.4 * Math.sin(Math.PI * e);
        const baseX = fx + (isoX - fx) * e + Math.sin(time * 0.0011 + seed) * wobble;
        const baseY = fy + (isoY - fy) * e + Math.cos(time * 0.0013 + seed * 1.7) * wobble;

        const dx = baseX + offX[i] - cursorX;
        const dy = baseY + offY[i] - cursorY;
        const dist = Math.hypot(dx, dy);
        if (dist < cursorRadius && dist > 0.001) {
          const push = (1 - dist / cursorRadius) ** 2 * CURSOR_FORCE;
          velX[i] += (dx / dist) * push;
          velY[i] += (dy / dist) * push;
        }
        velX[i] = (velX[i] - offX[i] * SPRING) * DAMPING;
        velY[i] = (velY[i] - offY[i] * SPRING) * DAMPING;
        offX[i] += velX[i];
        offY[i] += velY[i];

        const alpha = (0.95 + (alphaStack - 0.95) * e) * fade;
        if (alpha < 0.01) continue;
        const tint = e > 0.5 ? color : WHITE;
        if (tint !== currentColor) {
          ctx.fillStyle = tint;
          currentColor = tint;
        }
        ctx.globalAlpha = alpha;
        const size = (1.1 + alpha * 0.9 + 0.5 * (1 - e)) * unitScale;
        ctx.fillRect(
          originX + (baseX + offX[i]) * unitScale,
          originY + (baseY + offY[i]) * unitScale,
          size,
          size,
        );
      }
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      if (sample) {
        sample.element.style.visibility = "";
        sample.element.closest<HTMLElement>("[data-mobile-scroll]")?.style.removeProperty("--landing-shift");
      }
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerup", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [spec, anchorRef, morph, revealed, active, plateCount, logoSource, logoSrc, instant, entry]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
