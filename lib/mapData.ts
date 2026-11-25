"use client";

import type { GeoPermissibleObjects } from "d3-geo";
import { fetchCachedStaticJson } from "./publicCache";

export type MapDot = [number, number];

export interface LandOutlineGeoJson {
  features: GeoPermissibleObjects[];
}

const LAND_DOTS_URL = "/data/land-dots.json";
const WORLD_OUTLINE_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json";

/** Precomputed land dots shipped with the site, cached across page loads. */
export function loadLandDots(): Promise<MapDot[]> {
  return fetchCachedStaticJson<MapDot[]>(LAND_DOTS_URL).catch(() => []);
}

/** Optional continent outlines for the rotating globe, cached across page loads. */
export function loadWorldOutline(): Promise<LandOutlineGeoJson | null> {
  return fetchCachedStaticJson<LandOutlineGeoJson>(WORLD_OUTLINE_URL).catch(() => null);
}
