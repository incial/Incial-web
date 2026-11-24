"use client";

import { useEffect, useState } from "react";
import type { ClientsData } from "@/lib/dataLoader";
import { fetchJsonIfAvailable } from "@/lib/adminApi";

// One request shared by every home section that needs the clients list.
let pending: Promise<ClientsData | null> | null = null;

function loadClients(): Promise<ClientsData | null> {
  if (!pending) {
    pending = fetchJsonIfAvailable<ClientsData>("/api/admin/clients").catch(
      () => null,
    );
  }
  return pending;
}

/** Clients, logos and testimonials for the home page; `null` while loading or unavailable. */
export function useClientsData(): ClientsData | null {
  const [data, setData] = useState<ClientsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadClients().then((payload) => {
      if (!cancelled && payload) setData(payload);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
