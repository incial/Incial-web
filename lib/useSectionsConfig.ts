"use client";

import { useEffect, useState } from "react";
import { fetchCachedJson } from "@/lib/publicCache";

interface SectionsPayload {
  sections?: Array<{ id: string; enabled: boolean }>;
}

/** Admin visibility toggles by section id; empty until loaded (treat missing ids as visible). */
export function useSectionsConfig(): Record<string, boolean> {
  const [config, setConfig] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    fetchCachedJson<SectionsPayload>("/api/admin/sections").then((payload) => {
      if (cancelled || !payload) return;
      setConfig(Object.fromEntries((payload.sections ?? []).map((s) => [s.id, s.enabled])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
