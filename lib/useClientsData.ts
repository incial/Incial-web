"use client";

import { useEffect, useState } from "react";
import type { ClientsData } from "@/lib/dataLoader";
import { fetchCachedJson } from "@/lib/publicCache";

/** Clients, logos and testimonials for the home page; `null` while loading or unavailable. */
export function useClientsData(): ClientsData | null {
  const [data, setData] = useState<ClientsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCachedJson<ClientsData>("/api/admin/clients").then((payload) => {
      if (!cancelled && payload) setData(payload);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
