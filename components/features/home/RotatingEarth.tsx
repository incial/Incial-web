"use client";

import { useEffect, useRef, useState } from "react";
import { useStageColors } from "@/lib/stageTone";
import { geoGraticule, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { timer } from "d3-timer";
import { loadLandDots, loadWorldOutline } from "@/lib/mapData";

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function RotatingEarth({
  width = 800,
  height = 600,
  className = "",
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const colors = useStageColors();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    let containerSize = 0;
    let radius = 0;

    // Create projection and path generator for Canvas
    const projection = geoOrthographic()
      .scale(1)
      .translate([0, 0])
      .clipAngle(90);

    const path = geoPath().projection(projection).context(ctx);
    const graticuleLines = geoGraticule()();

    interface DotData {
      lng: number;
      lat: number;
      visible: boolean;
    }

    const allDots: DotData[] = [];
    let landFeatures: { features: GeoPermissibleObjects[] } | undefined;

    function render() {
      if (!containerSize || !radius) return;

      // Clear canvas
      ctx.clearRect(0, 0, containerSize, containerSize);

      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;

      // Draw ocean (globe background)
      ctx.beginPath();
      ctx.arc(
        containerSize / 2,
        containerSize / 2,
        currentScale,
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = colors.globeOcean;
      ctx.fill();
      ctx.strokeStyle = colors.globeEdge; // slightly glowing edge
      ctx.lineWidth = 2 * scaleFactor;
      ctx.stroke();

      if (landFeatures) {
        // Draw graticule
        ctx.beginPath();
        path(graticuleLines);
        ctx.strokeStyle = colors.globeGrid;
        ctx.lineWidth = 1 * scaleFactor;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw land outlines
        ctx.beginPath();
        landFeatures?.features.forEach((feature) => {
          path(feature);
        });
        ctx.strokeStyle = colors.globeLand;
        ctx.lineWidth = 1 * scaleFactor;
        ctx.stroke();
      }

      // Draw halftone dots: one path and one fill for all of them (thousands of separate
      // fills per frame were what made the globe stutter)
      const dotRadius = 1.2 * scaleFactor;
      ctx.fillStyle = colors.globeDots;
      ctx.beginPath();
      for (const dot of allDots) {
        const projected = projection([dot.lng, dot.lat]);
        if (!projected) continue; // far side of the globe
        const [x, y] = projected;
        if (x < 0 || x > containerSize || y < 0 || y > containerSize) continue;
        ctx.moveTo(x + dotRadius, y);
        ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
      }
      ctx.fill();
    }

    const fitCanvasToContainer = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const { width: wrapperWidth, height: wrapperHeight } =
        wrapper.getBoundingClientRect();
      const nextSize = Math.max(
        1,
        Math.floor(Math.min(wrapperWidth, wrapperHeight)),
      );

      containerSize = nextSize;
      radius = nextSize / 2.1;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = nextSize * dpr;
      canvas.height = nextSize * dpr;
      canvas.style.width = `${nextSize}px`;
      canvas.style.height = `${nextSize}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      projection.scale(radius).translate([nextSize / 2, nextSize / 2]);
      render();
    };
    let isDisposed = false;
    const loadWorldData = async () => {
      // The halftone dots ship with the site and are all the globe needs. The land outline comes
      // from a third-party site and is only a nicety: if it cannot be fetched the globe is still
      // drawn (it used to be replaced by an error message).
      const dotsData = await loadLandDots();
      if (isDisposed) return;
      if (dotsData.length === 0) {
        setError("Failed to load land map data");
        return;
      }
      dotsData.forEach(([lng, lat]) => {
        allDots.push({ lng, lat, visible: true });
      });
      render();

      const outline = await loadWorldOutline();
      if (isDisposed || !outline) return;
      landFeatures = outline;
      render();
    };

    // Set up rotation and interaction
    const rotation: [number, number] = [0, 0];
    let autoRotate = true;
    const rotationSpeed = 0.5;

    // Skip drawing while the globe is off-screen or the tab is hidden.
    let isOnScreen = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
    });
    visibilityObserver.observe(canvas);

    // The spin is per elapsed time, not per frame, so it stays the same speed (and stays smooth)
    // on 60Hz and faster screens, and does not jump after a slow frame.
    let lastRenderAt = 0;
    const rotate = (elapsed: number) => {
      if (!autoRotate || !isOnScreen || reducedMotion || document.hidden) return;
      const sinceLast = elapsed - lastRenderAt;
      lastRenderAt = elapsed;
      rotation[0] += rotationSpeed * Math.min(sinceLast, 50) / (1000 / 60);
      projection.rotate(rotation);
      render();
    };

    // Auto-rotation timer
    const rotationTimer = timer(rotate);

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation: [number, number] = [rotation[0], rotation[1]];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = startRotation[1] - dy * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));

        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        setTimeout(() => {
          autoRotate = true;
        }, 10);
      };

      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleMouseUp, { passive: true });
    };

    const handleWheel = (event: WheelEvent) => {
      // Allow scroll events to bubble up for the scroll section logic
      // event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newRadius = Math.max(
        radius * 0.5,
        Math.min(radius * 3, projection.scale() * scaleFactor),
      );
      projection.scale(newRadius);
      render();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel);

    fitCanvasToContainer();

    const resizeObserver = new ResizeObserver(() => {
      fitCanvasToContainer();
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    } else {
      window.addEventListener("resize", fitCanvasToContainer);
    }

    // Load the world data
    loadWorldData();

    // Cleanup
    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("resize", fitCanvasToContainer);
      rotationTimer.stop();
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [width, height, colors]);

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">
            Error loading Earth visualization
          </p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* the glow is a static shadow behind the canvas: a CSS filter on the canvas itself would be
          re-rendered on every frame of the rotation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[2.4%] rounded-full"
        style={{
          boxShadow:
            "0 0 40px rgba(100, 150, 255, 0.4), 0 0 80px rgba(100, 150, 255, 0.2)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative block h-full w-full bg-transparent rounded-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}