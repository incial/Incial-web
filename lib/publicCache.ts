"use client";

/**
 * Client-side caching helpers for public CMS endpoints and static map datasets.
 *
 * - CMS JSON (/api/admin/sections, clients, about, products) is cached in memory and
 *   sessionStorage with a short TTL, keyed by the `incial_cms_v` cookie so admin saves
 *   invalidate the browser's cached copy immediately.
 * - Static datasets (/data/land-dots.json, external GeoJSON) are persisted across full
 *   page loads in the browser Cache API with an in-memory fallback.
 */

export const CMS_VERSION_COOKIE = "incial_cms_v";
const CMS_STORAGE_PREFIX = "incial_cms_cache:";
const DEFAULT_CMS_TTL_MS = 10 * 60 * 1000; // 10 minutes
const STATIC_CACHE_NAME = "incial-static-v1";
const STATIC_TS_PREFIX = "incial_static_ts:";
const DEFAULT_STATIC_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredCmsEntry<T> {
  v: string;
  exp: number;
  data: T;
}

const memoryCms = new Map<string, StoredCmsEntry<unknown>>();
const inflightCms = new Map<string, Promise<unknown>>();
const memoryStatic = new Map<string, unknown>();
const inflightStatic = new Map<string, Promise<unknown>>();

export function getCmsVersion(): string {
  if (typeof document === "undefined") return "0";
  const prefix = `${CMS_VERSION_COOKIE}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length)) || "0";
    }
  }
  return "0";
}

/** Clears cached CMS responses in this browser tab and bumps the version cookie. */
export function invalidateCmsCache(): void {
  memoryCms.clear();
  inflightCms.clear();
  if (typeof document !== "undefined") {
    document.cookie = `${CMS_VERSION_COOKIE}=${Date.now()}; Path=/; Max-Age=86400; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(CMS_STORAGE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // sessionStorage may be unavailable in restricted contexts
    }
  }
}

function readStoredCms<T>(url: string, version: string): T | null {
  const mem = memoryCms.get(url) as StoredCmsEntry<T> | undefined;
  if (mem && mem.v === version && mem.exp > Date.now()) {
    return mem.data;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${CMS_STORAGE_PREFIX}${url}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCmsEntry<T>;
    if (parsed.v !== version || parsed.exp <= Date.now()) {
      sessionStorage.removeItem(`${CMS_STORAGE_PREFIX}${url}`);
      return null;
    }
    memoryCms.set(url, parsed);
    return parsed.data;
  } catch {
    return null;
  }
}

function writeStoredCms<T>(url: string, version: string, ttlMs: number, data: T): void {
  const entry: StoredCmsEntry<T> = {
    v: version,
    exp: Date.now() + ttlMs,
    data,
  };
  memoryCms.set(url, entry);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`${CMS_STORAGE_PREFIX}${url}`, JSON.stringify(entry));
    } catch {
      // ignore storage quota errors
    }
  }
}

/**
 * Fetches a public JSON endpoint once per session/TTL and deduplicates concurrent callers.
 * When an admin saves changes, the `incial_cms_v` cookie bumps and busts both sessionStorage
 * and the browser HTTP cache via `?v=`.
 */
export function fetchCachedJson<T>(
  url: string,
  ttlMs = DEFAULT_CMS_TTL_MS,
): Promise<T | null> {
  const version = getCmsVersion();
  const cached = readStoredCms<T>(url, version);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  const inflightKey = `${url}::${version}`;
  const existing = inflightCms.get(inflightKey) as Promise<T | null> | undefined;
  if (existing) return existing;

  const requestUrl =
    version !== "0"
      ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`
      : url;

  const promise = fetch(requestUrl)
    .then(async (res) => {
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) return null;
      const data = (await res.json()) as T;
      if (getCmsVersion() === version) {
        writeStoredCms(url, version, ttlMs, data);
      }
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflightCms.delete(inflightKey);
    });

  inflightCms.set(inflightKey, promise);
  return promise;
}

function isStaticFresh(url: string, ttlMs: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(`${STATIC_TS_PREFIX}${url}`);
    if (!raw) return false;
    const savedAt = Number(raw);
    return Number.isFinite(savedAt) && Date.now() - savedAt < ttlMs;
  } catch {
    return false;
  }
}

function markStaticFresh(url: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STATIC_TS_PREFIX}${url}`, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

/**
 * Fetches large static JSON datasets (such as world map dots / GeoJSON) and persists them
 * in the browser Cache API across full page loads, with an in-memory deduplicating layer.
 */
export function fetchCachedStaticJson<T>(
  url: string,
  ttlMs = DEFAULT_STATIC_TTL_MS,
): Promise<T> {
  if (memoryStatic.has(url)) {
    return Promise.resolve(memoryStatic.get(url) as T);
  }

  const existing = inflightStatic.get(url) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = (async (): Promise<T> => {
    const canUseCacheApi = typeof window !== "undefined" && "caches" in window;
    if (canUseCacheApi && isStaticFresh(url, ttlMs)) {
      try {
        const cache = await window.caches.open(STATIC_CACHE_NAME);
        const hit = await cache.match(url);
        if (hit && hit.ok) {
          const data = (await hit.json()) as T;
          memoryStatic.set(url, data);
          return data;
        }
      } catch {
        // fall through to network
      }
    }

    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) {
      throw new Error(`Failed to load static dataset: ${url}`);
    }

    if (canUseCacheApi) {
      try {
        const cache = await window.caches.open(STATIC_CACHE_NAME);
        await cache.put(url, res.clone());
        markStaticFresh(url);
      } catch {
        // ignore cache write errors
      }
    }

    const data = (await res.json()) as T;
    memoryStatic.set(url, data);
    return data;
  })().finally(() => {
    inflightStatic.delete(url);
  });

  inflightStatic.set(url, promise);
  return promise;
}
