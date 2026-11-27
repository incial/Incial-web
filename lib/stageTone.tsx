"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Whether the home page's stage (hero, services stack, trust, clients, contact) is drawn dark or
 * light. The class-based colours come from the --stage-* CSS variables (see globals.css); this tone
 * is for what CSS cannot reach: canvases and animated colour values.
 */
export type StageTone = "dark" | "light";

export interface StageColors {
  /** page background */
  bg: string;
  /** text and line colour */
  ink: string;
  /** ink as "r, g, b" for rgba() strings */
  inkRgb: string;
  /** isometric stack: slab sides and tops */
  slab: string;
  slabTop: string;
  lidTop: string;
  /** plates at rest (top and sides) and the icon colour at rest */
  plateIdle: string;
  plateEdgeIdle: string;
  iconIdle: string;
  /** dust particles: main, muted and accent */
  dust: readonly [string, string, string];
  /** globe: ocean, edge, graticule, land outline and halftone dots */
  globeOcean: string;
  globeEdge: string;
  globeGrid: string;
  globeLand: string;
  globeDots: string;
  /** world map: land dots */
  mapLand: string;
}

const DARK: StageColors = {
  bg: "#000000",
  ink: "#ffffff",
  inkRgb: "255, 255, 255",
  slab: "#0b0b0d",
  slabTop: "#070708",
  lidTop: "#050506",
  plateIdle: "rgba(16,16,20,0.4)",
  plateEdgeIdle: "rgba(10,10,12,0.55)",
  iconIdle: "#e6e8ee",
  dust: ["#ffffff", "#c9ccd6", "#7db1ff"],
  globeOcean: "#000000",
  globeEdge: "rgba(100, 150, 255, 0.4)",
  globeGrid: "rgba(100, 150, 255, 0.2)",
  globeLand: "rgba(100, 150, 255, 0.6)",
  globeDots: "rgba(150, 200, 255, 0.8)",
  mapLand: "rgba(150, 200, 255, 0.5)",
};

const LIGHT: StageColors = {
  bg: "#ffffff",
  ink: "#151716",
  inkRgb: "21, 23, 22",
  slab: "#e3e7ee",
  slabTop: "#f1f3f7",
  lidTop: "#f6f7fa",
  plateIdle: "rgba(228,233,242,0.75)",
  plateEdgeIdle: "rgba(204,212,226,0.8)",
  iconIdle: "#3b4351",
  dust: ["#151716", "#5d6472", "#2e6fe6"],
  globeOcean: "#ffffff",
  globeEdge: "rgba(30, 90, 210, 0.45)",
  globeGrid: "rgba(30, 90, 210, 0.18)",
  globeLand: "rgba(30, 90, 210, 0.55)",
  globeDots: "rgba(30, 95, 220, 0.75)",
  mapLand: "rgba(30, 90, 200, 0.4)",
};

export const STAGE_COLORS: Record<StageTone, StageColors> = { dark: DARK, light: LIGHT };

const StageToneContext = createContext<StageTone>("dark");

/** Sets the stage tone for everything inside, and the matching CSS variables. */
export function StageToneProvider({ tone, className = "", children }: { tone: StageTone; className?: string; children: ReactNode }) {
  return (
    <StageToneContext.Provider value={tone}>
      <div className={`${tone === "light" ? "stage-light" : ""} ${className}`}>{children}</div>
    </StageToneContext.Provider>
  );
}

export function useStageTone(): StageTone {
  return useContext(StageToneContext);
}

export function useStageColors(): StageColors {
  return STAGE_COLORS[useStageTone()];
}
