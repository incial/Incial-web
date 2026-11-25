/**
 * Admin API helpers — used by admin pages to load/save section data.
 * Auth is handled by NextAuth session cookies (server-side) and Bearer token fallback.
 */

import { invalidateCmsCache } from "@/lib/publicCache";

export interface AdminValidationError {
  path: string;
  message: string;
}

export class AdminApiError extends Error {
  status: number;
  details?: AdminValidationError[];

  constructor(message: string, status: number, details?: AdminValidationError[]) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.details = details;
  }
}

export async function fetchJsonIfAvailable<T>(url: string, init?: RequestInit): Promise<T | null> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token") || ""
      : "";

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers: { ...headers, ...init?.headers } });

  if (!res.ok) {
    return null;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiGetSection<T>(section: string): Promise<T> {
  const data = await fetchJsonIfAvailable<T>(`/api/admin/${section}?fresh=1`, {
    cache: "no-store",
  });
  if (data === null) {
    throw new Error(`Failed to load ${section}`);
  }

  return data;
}

export async function apiSaveSection<T>(section: string, data: T): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token") || ""
      : "";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api/admin/${section}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: AdminValidationError[];
    };
    throw new AdminApiError(
      err.error || `Failed to save ${section}`,
      res.status,
      Array.isArray(err.details) ? err.details : undefined,
    );
  }

  // Clear client-side CMS cache and notify the admin live preview to reload.
  invalidateCmsCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("admin:saved", { detail: { section } }));
  }
}
