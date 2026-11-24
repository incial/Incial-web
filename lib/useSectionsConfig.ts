"use client";

import { useEffect, useState } from "react";
import { fetchJsonIfAvailable } from "@/lib/adminApi";

interface SectionsPayload {
  sections?: Array<{ id: string; enabled: boolean }>;
}

// One request shared by every home section that honours the admin visibility toggles.
let pending: Promise<Record<string, boolean>> | null = null;

function loadSectionsConfig(): Promise<Record<string, boolean>> {
  if (!pending) {
    pending = fetchJsonIfAvailable<SectionsPayload>("/api/admin/sections")
      .then((payload) =>
        Object.fromEntries((payload?.sections ?? []).map((s) => [s.id, s.enabled])),
      )
      .catch(() => ({}));
  }
  return pending;
}

/** Admin visibility toggles by section id; empty until loaded (treat missing ids as visible). */
export function useSectionsConfig(): Record<string, boolean> {
  const [config, setConfig] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    loadSectionsConfig().then((loaded) => {
      if (!cancelled) setConfig(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
