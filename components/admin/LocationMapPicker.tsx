"use client";

import { useMemo, useRef, type MouseEvent } from "react";
import { geoNaturalEarth1 } from "d3-geo";
import ClientWorldMap from "@/components/features/home/ClientWorldMap";
import { HQ_LOCATION } from "@/lib/clientLocations";
import type { ClientLocation } from "@/lib/dataLoader";

interface LocationMapPickerProps {
  /** Every client that already has a place; each shows as a thread on the map. */
  locations: ReadonlyArray<ClientLocation>;
  /** The place being chosen, drawn as a marker. */
  selected?: ClientLocation;
  /** Called with the coordinates of the spot that was clicked. */
  onPick: (location: ClientLocation) => void;
}

// these must match the map's own layout (see ClientWorldMap), or a click would land on the wrong place
const ASPECT = 2;
const MIN_LATITUDE = -58;

const BAND = {
  type: "Polygon" as const,
  coordinates: [[[-180, MIN_LATITUDE], [180, MIN_LATITUDE], [180, 85], [-180, 85], [-180, MIN_LATITUDE]]],
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * The home page's own world map, with a click-to-place layer on top: click anywhere on the map and the
 * coordinates of that spot are handed back. It is the same map component the website uses, so what is
 * placed here is exactly where the thread lands on the site.
 */
export default function LocationMapPicker({ locations, selected, onPick }: LocationMapPickerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  /** The same projection the map draws with, fitted to a map of the given size. */
  const projectionFor = useMemo(
    () => (width: number, height: number) => {
      const projection = geoNaturalEarth1();
      projection.fitExtent([[width * 0.02, height * 0.02], [width * 0.98, height * 0.98]], BAND);
      return projection;
    },
    [],
  );

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const width = box.width;
    const height = width / ASPECT;
    const projection = projectionFor(width, height);
    const point = projection.invert?.([event.clientX - box.left, event.clientY - box.top]);
    if (!point) return;
    const [lng, lat] = point;
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || lat < MIN_LATITUDE || lat > 85) return;
    onPick({ label: selected?.label || "Custom place", lat: round(lat), lng: round(lng) });
  }

  // the marker's place as a share of the map, which holds at any size because the map only scales
  const marker = (() => {
    if (!selected) return null;
    const projected = projectionFor(1000, 1000 / ASPECT)([selected.lng, selected.lat]);
    return projected ? { x: (projected[0] / 1000) * 100, y: (projected[1] / (1000 / ASPECT)) * 100 } : null;
  })();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      <div ref={wrapRef} className="relative cursor-crosshair" onClick={handleClick} role="application" aria-label="World map: click to place the selected client">
        <ClientWorldMap locations={locations.length > 0 ? locations : [HQ_LOCATION]} />
        {marker && (
          <span
            aria-hidden
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-[0_0_0_6px_rgba(124,92,255,0.35)]"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          />
        )}
      </div>
    </div>
  );
}
