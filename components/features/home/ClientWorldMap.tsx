"use client";

import { useEffect, useMemo, useRef } from "react";
import { geoNaturalEarth1 } from "d3-geo";
import type { ClientLocation } from "@/lib/dataLoader";
import { HQ_LOCATION, isValidLocation } from "@/lib/clientLocations";

interface ClientWorldMapProps {
  /** Client locations; each gets an animated thread from Incial's base. */
  locations: ReadonlyArray<ClientLocation>;
  /** Hold the threads back until the map is actually revealed (default: start when on screen). */
  play?: boolean;
  className?: string;
}

type Point = [number, number];

interface Thread {
  label: string;
  end: Point;
  path: Point[];
}

const ASPECT = 2;
const MAX_DPR = 2;
const MIN_LATITUDE = -58; // crop Antarctica so the continents fill the frame
const ARC_STEPS = 72;
const DRAW_MS = 1700;
const FIRST_DELAY_MS = 500;
const STAGGER_MS = 220;
const MAX_STAGGER_MS = 2200;
const PULSE_PERIOD_MS = 3400;
const ACCENT = "86, 166, 255";
const LABEL_MIN_WIDTH = 640;

let dotsRequest: Promise<Point[]> | null = null;

/** Land is drawn from a precomputed dot grid shipped with the site (no third-party fetch). */
function loadLandDots(): Promise<Point[]> {
  if (!dotsRequest) {
    dotsRequest = fetch("/data/land-dots.json")
      .then((res) => {
        if (!res.ok) throw new Error("land dots unavailable");
        return res.json() as Promise<Point[]>;
      })
      .catch(() => {
        dotsRequest = null;
        return [];
      });
  }
  return dotsRequest;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** A curved path between two screen points, lifted upwards like a flight arc. */
function buildArc(from: Point, to: Point, height: number): Point[] {
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const control: Point = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 - Math.min(distance * 0.3, height * 0.4),
  ];
  const points: Point[] = [];
  for (let i = 0; i <= ARC_STEPS; i++) {
    const t = i / ARC_STEPS;
    const inv = 1 - t;
    points.push([
      inv * inv * from[0] + 2 * inv * t * control[0] + t * t * to[0],
      inv * inv * from[1] + 2 * inv * t * control[1] + t * t * to[1],
    ]);
  }
  return points;
}

/**
 * Dotted world map with threads running from Incial's base to every client location.
 * Draws only while on screen and in view; reduced-motion visitors get the finished map.
 */
export default function ClientWorldMap({ locations, play = true, className = "" }: ClientWorldMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // One thread per distinct place, however many clients are there.
  const places = useMemo(() => {
    const seen = new Set<string>();
    return locations.filter((location) => {
      if (!isValidLocation(location)) return false;
      const key = `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [locations]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const projection = geoNaturalEarth1();

    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots: Point[] = [];
    let base: HTMLCanvasElement | null = null;
    let threads: Thread[] = [];
    let hq: Point = [0, 0];
    let startedAt: number | null = null;
    let frame = 0;
    let isVisible = false;
    let isDisposed = false;

    const project = (location: ClientLocation): Point => {
      const projected = projection([location.lng, location.lat]);
      return projected ? [projected[0], projected[1]] : [0, 0];
    };

    const buildBase = () => {
      const layer = document.createElement("canvas");
      layer.width = Math.round(width * dpr);
      layer.height = Math.round(height * dpr);
      const layerCtx = layer.getContext("2d");
      if (!layerCtx) return;
      layerCtx.scale(dpr, dpr);
      layerCtx.fillStyle = "rgba(150, 200, 255, 0.5)";
      const radius = Math.max(0.8, width / 950);
      layerCtx.beginPath();
      for (const [lng, lat] of dots) {
        if (lat < MIN_LATITUDE) continue;
        const projected = projection([lng, lat]);
        if (!projected) continue;
        layerCtx.moveTo(projected[0] + radius, projected[1]);
        layerCtx.arc(projected[0], projected[1], radius, 0, Math.PI * 2);
      }
      layerCtx.fill();
      base = layer;
    };

    const buildThreads = () => {
      hq = project(HQ_LOCATION);
      threads = places
        .map((place) => ({ label: place.label, end: project(place) }))
        .filter(({ end }) => Math.hypot(end[0] - hq[0], end[1] - hq[1]) > 6)
        .map(({ label, end }) => ({ label, end, path: buildArc(hq, end, height) }));
    };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(width / ASPECT));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fit the visible band of the globe (without Antarctica) to the canvas
      projection.fitExtent(
        [
          [width * 0.02, height * 0.02],
          [width * 0.98, height * 0.98],
        ],
        {
          type: "Polygon",
          coordinates: [
            [
              [-180, MIN_LATITUDE],
              [180, MIN_LATITUDE],
              [180, 85],
              [-180, 85],
              [-180, MIN_LATITUDE],
            ],
          ],
        },
      );
      buildBase();
      buildThreads();
    };

    const drawPin = (point: Point, now: number, offset: number, size: number, strong: boolean) => {
      const phase = ((now / 1700 + offset) % 1 + 1) % 1;
      ctx.beginPath();
      ctx.arc(point[0], point[1], size + phase * size * (strong ? 4.5 : 3.2), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ACCENT}, ${((1 - phase) * (strong ? 0.7 : 0.45)).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(point[0], point[1], size, 0, Math.PI * 2);
      ctx.fillStyle = strong ? "#ffffff" : `rgb(${ACCENT})`;
      ctx.fill();
    };

    const draw = (now: number): boolean => {
      ctx.clearRect(0, 0, width, height);
      if (base) ctx.drawImage(base, 0, 0, width, height);

      // Before the map scrolls into view nothing is drawn yet; reduced motion shows it finished.
      const elapsed = reducedMotion
        ? Number.POSITIVE_INFINITY
        : startedAt === null
          ? 0
          : now - startedAt;
      const pin = Math.max(2.2, width / 360);
      const showLabels = width >= LABEL_MIN_WIDTH;

      threads.forEach((thread, index) => {
        const delay = FIRST_DELAY_MS + Math.min(index * STAGGER_MS, MAX_STAGGER_MS);
        const progress = easeOutCubic(clamp01((elapsed - delay) / DRAW_MS));
        if (progress <= 0) return;

        const last = Math.max(1, Math.floor(progress * ARC_STEPS));
        ctx.beginPath();
        ctx.moveTo(thread.path[0][0], thread.path[0][1]);
        for (let i = 1; i <= last; i++) ctx.lineTo(thread.path[i][0], thread.path[i][1]);
        ctx.strokeStyle = `rgba(${ACCENT}, 0.7)`;
        ctx.lineWidth = Math.max(1.4, width / 650);
        ctx.lineCap = "round";
        ctx.stroke();

        const head = thread.path[last];
        if (progress < 1) {
          ctx.beginPath();
          ctx.arc(head[0], head[1], pin * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.shadowColor = `rgba(${ACCENT}, 0.9)`;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
          return;
        }

        drawPin(thread.end, now, index * 0.17, pin, false);

        // a packet of light keeps travelling the thread once it has landed
        const travelled = ((elapsed - delay - DRAW_MS) / PULSE_PERIOD_MS + index * 0.21) % 1;
        const pulse = thread.path[Math.min(ARC_STEPS, Math.floor(travelled * ARC_STEPS))];
        ctx.beginPath();
        ctx.arc(pulse[0], pulse[1], pin * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowColor = `rgba(${ACCENT}, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (showLabels) {
          ctx.font = `500 ${Math.max(10, width / 95)}px Poppins, sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
          ctx.textAlign = thread.end[0] > width * 0.82 ? "right" : "left";
          const gap = thread.end[0] > width * 0.82 ? -pin * 2.4 : pin * 2.4;
          ctx.fillText(thread.label.split(",")[0], thread.end[0] + gap, thread.end[1] + pin * 0.4);
        }
      });

      drawPin(hq, now, 0, pin * 1.35, true);
      if (showLabels) {
        ctx.font = `600 ${Math.max(11, width / 85)}px Poppins, sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.fillText("Incial", hq[0] + pin * 3, hq[1] + pin * 0.5);
      }

      // Reduced-motion renders are static, so no further frames are scheduled.
      return !reducedMotion;
    };

    const tick = (now: number) => {
      frame = 0;
      if (isDisposed || !isVisible || !play || document.hidden) return;
      if (draw(now)) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || isDisposed) return;
      frame = requestAnimationFrame(tick);
    };

    layout();
    draw(performance.now());

    loadLandDots().then((loaded) => {
      if (isDisposed) return;
      dots = loaded;
      layout();
      draw(performance.now());
      if (isVisible && play) start();
    });

    const intersection = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && play) {
        if (startedAt === null) startedAt = performance.now();
        start();
      }
    });
    intersection.observe(wrap);

    const resize = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    resize.observe(wrap);

    const handleVisibility = () => {
      if (!document.hidden && isVisible && play) start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [places, play]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{ aspectRatio: `${ASPECT} / 1` }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="World map showing where Incial's clients are, connected to our base in Kerala"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
