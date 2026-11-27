"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { useDevice } from "@/hooks";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeHover(onStoreChange: () => void) {
  const media = window.matchMedia(HOVER_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getHoverSnapshot() {
  return window.matchMedia(HOVER_QUERY).matches;
}

function getHoverServerSnapshot() {
  return false;
}

/** Columns across the screen, and rows down to fill the full hero viewport. */
const DESKTOP_GRID = { cols: 36, rows: 22 } as const;
const PHONE_GRID = { cols: 12, rows: 28 } as const;

/** Radius of the circle of tiles shown around the pointer, in tiles. */
const GLOW_RADIUS = 4.2;
/** How fast a tile lights as the patch reaches it, and how slowly it fades after. */
const GLOW_IN = "0.15s";
const GLOW_OUT = "1.3s";

/**
 * The blue ramp, from the pale edge of a cluster (0) to its deep core (1): pale sky, soft blue,
 * bright blue, royal blue, deep cobalt.
 */
const RAMP: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [0, [222, 236, 255]],
  [0.3, [140, 190, 255]],
  [0.55, [30, 120, 255]],
  [0.78, [0, 88, 238]],
  [1, [0, 48, 188]],
];

/** A small repeatable noise in [0, 1), so every visit lays the tiles out the same way. */
function noise(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function rampColor(depth: number): string {
  const value = Math.min(1, Math.max(0, depth));
  const upper = RAMP.findIndex(([stop]) => stop >= value);
  const [stopB, colorB] = RAMP[Math.max(upper, 1)];
  const [stopA, colorA] = RAMP[Math.max(upper, 1) - 1];
  const mix = (value - stopA) / (stopB - stopA || 1);
  return colorA.map((channel, index) => Math.round(channel + (colorB[index] - channel) * mix)).join(", ");
}

interface Tile {
  key: number;
  /** False for the cells past a column's stepped edge: they show only under the pointer. */
  filled: boolean;
  style: CSSProperties;
}

/**
 * Lays out a full-viewport frosted glass tile mosaic: richer cobalt/royal blue toward the outer
 * edges and corners, softening to pale ice blue near the center so the logo stays crisp, with
 * subtle per-tile variation and a frosted white glare on one corner of every tile.
 */
function buildTiles(cols: number, rows: number): Tile[] {
  const halfX = (cols - 1) / 2 || 1;
  const halfY = (rows - 1) / 2 || 1;

  return Array.from({ length: cols * rows }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    // radial distance from center [0..~1.4]: deeper cobalt toward corners/edges, lighter in center
    const nx = (col - halfX) / halfX;
    const ny = (row - halfY) / halfY;
    const radial = Math.hypot(nx * 0.9, ny * 0.85);
    const depth = 0.12 + Math.min(0.72, radial * 0.56) + (noise(index + 1) - 0.5) * 0.24;
    const color = rampColor(Math.min(depth, 0.85));
    const lighter = rampColor(Math.min(depth, 0.85) - 0.28);
    const corner = Math.floor(noise(index + 29) * 4);
    const glareX = corner % 2 === 0 ? "18%" : "82%";
    const glareY = corner < 2 ? "16%" : "84%";
    return {
      key: index,
      filled: true,
      style: {
        ["--tile-c" as string]: color,
        ["--tile-c2" as string]: lighter,
        ["--tile-glare" as string]: `${glareX} ${glareY}`,
        ["--tile-glare-a" as string]: (0.35 + noise(index + 41) * 0.4).toFixed(2),
        ["--tile-dur" as string]: `${5 + noise(index + 7) * 5}s`,
        ["--tile-delay" as string]: `${-noise(index + 13) * 9}s`,
      },
    };
  });
}

/**
 * Shows a soft circle of tiles around the pointer: full at the centre, fading toward the
 * circle's edge. Tiles the circle leaves fade away slowly, so moving across leaves a trail. Each
 * tile's glow is a CSS variable, so the browser animates it; this only updates the few tiles
 * that change, once per frame.
 */
function usePointerGlow(gridRef: React.RefObject<HTMLDivElement | null>, cols: number, rows: number, enabled: boolean) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!enabled || !grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = Array.from(grid.children) as HTMLElement[];
    const glow = new Float32Array(cols * rows);
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      const rect = grid.getBoundingClientRect();
      const size = rect.width / cols;
      const inside = pointer !== null && pointer.y >= rect.top && pointer.y <= rect.bottom && pointer.x >= rect.left && pointer.x <= rect.right;
      const col = inside && pointer ? (pointer.x - rect.left) / size - 0.5 : -99;
      const row = inside && pointer ? (pointer.y - rect.top) / size - 0.5 : -99;
      for (let index = 0; index < cells.length; index++) {
        const distance = Math.hypot((index % cols) - col, Math.floor(index / cols) - row);
        const target = distance < GLOW_RADIUS ? Math.pow(1 - distance / GLOW_RADIUS, 1.4) : 0;
        const current = glow[index];
        if (Math.abs(target - current) < 0.02) continue;
        glow[index] = target;
        cells[index].style.setProperty("--glow-t", target > current ? GLOW_IN : GLOW_OUT);
        cells[index].style.setProperty("--glow", target.toFixed(3));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [gridRef, cols, rows, enabled]);
}

/**
 * Frosted glass tiles across the top of the hero, joined from one corner to the other: a deep
 * cobalt core near each top corner fading out to pale sky blue, a stepped lower edge, and a white
 * glare on each tile. The tiles are hidden until the pointer comes near: a soft circle of them
 * appears around it and fades away slowly behind it, so moving across leaves a trail.
 */
export default function GlassTiles({ className = "" }: { className?: string }) {
  const { isMobile } = useDevice();
  const supportsHover = useSyncExternalStore(subscribeHover, getHoverSnapshot, getHoverServerSnapshot);
  const { cols, rows } = isMobile ? PHONE_GRID : DESKTOP_GRID;
  const tiles = useMemo(() => (supportsHover ? buildTiles(cols, rows) : []), [cols, rows, supportsHover]);
  const gridRef = useRef<HTMLDivElement>(null);
  usePointerGlow(gridRef, cols, rows, supportsHover);
  if (!supportsHover) return null;
  return (
    <div
      ref={gridRef}
      aria-hidden
      className={`pointer-events-none grid content-start gap-[3px] opacity-75 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {tiles.map((tile) => (
        <span key={tile.key} className={`glass-tile aspect-square ${tile.filled ? "" : "glass-tile-empty"}`} style={tile.style} />
      ))}
    </div>
  );
}
