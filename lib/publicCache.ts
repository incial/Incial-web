"use client";

/**
 * Client-side caching helpers for public CMS endpoints and static map datasets.
 *
 * - CMS JSON (/api/admin/sections, clients, about, products) is cached in memory and
 *   sessionStorage with a short TTL, keyed by the `incial_cms_v` cookie so admin saves
 *   invalidate the browser's cached copy immediately.
 * - Static datasets (/data/land-dots.json, external GeoJSON) are persisted across full
 *   page loads in the browser Cache API with an in-memory fallback.
 * - Same-origin images (/media/*, /logo/*, /images/*, /clients/*) are cached in the
 *   browser Cache API and deduplicated in memory so duplicate cards and page reloads
 *   never re-fetch unchanged assets.
 */

export const CMS_VERSION_COOKIE = "incial_cms_v";
const CMS_STORAGE_PREFIX = "incial_cms_cache:";
const DEFAULT_CMS_TTL_MS = 10 * 60 * 1000; // 10 minutes
const STATIC_CACHE_NAME = "incial-static-v1";
const STATIC_TS_PREFIX = "incial_static_ts:";
const DEFAULT_STATIC_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MEDIA_CACHE_NAME = "incial-media-v1";
const IMMUTABLE_MEDIA_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MUTABLE_MEDIA_TTL_MS = 60 * 60 * 1000; // 1 hour
const MEDIA_CACHED_AT_HEADER = "X-Incial-Cached-At";
const MEDIA_VERSION_HEADER = "X-Incial-Cms-V";

interface StoredCmsEntry<T> {
  v: string;
  exp: number;
  data: T;
}

const memoryCms = new Map<string, StoredCmsEntry<unknown>>();
const inflightCms = new Map<string, Promise<unknown>>();
const memoryStatic = new Map<string, unknown>();
const inflightStatic = new Map<string, Promise<unknown>>();
const memoryImageUrls = new Map<string, string>();
const inflightImages = new Map<string, Promise<string>>();
const preloadedImages = new Set<string>();

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
  for (const url of Array.from(memoryImageUrls.keys())) {
    if (!isImmutableLocalMedia(url)) {
      memoryImageUrls.delete(url);
    }
  }
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

export function isCacheableLocalMedia(src?: string | null): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/api/");
}

function isImmutableLocalMedia(src: string): boolean {
  return src.startsWith("/media/") || src.startsWith("/logo/");
}

export function canUseBrowserImageCache(): boolean {
  return typeof window !== "undefined" && "caches" in window && typeof URL?.createObjectURL === "function";
}

/** Synchronous lookup for an already-resolved image URL (or direct passthrough if uncacheable). */
export function getCachedImageUrlSync(src: string): string | null {
  if (!src) return src;
  if (!isCacheableLocalMedia(src) || !canUseBrowserImageCache()) return src;
  return memoryImageUrls.get(src) ?? null;
}

/**
 * Resolves a same-origin image URL through an in-memory object-URL map and the browser Cache API,
 * deduplicating concurrent requests so repeated renders or reloads do not re-fetch unchanged images.
 */
export function fetchCachedImageUrl(src: string): Promise<string> {
  if (!src || typeof window === "undefined" || !isCacheableLocalMedia(src) || !canUseBrowserImageCache()) {
    return Promise.resolve(src);
  }

  const mem = memoryImageUrls.get(src);
  if (mem) return Promise.resolve(mem);

  const existing = inflightImages.get(src);
  if (existing) return existing;

  const immutable = isImmutableLocalMedia(src);
  const version = getCmsVersion();
  const ttlMs = immutable ? IMMUTABLE_MEDIA_TTL_MS : MUTABLE_MEDIA_TTL_MS;

  const promise = (async (): Promise<string> => {
    try {
      const cache = await window.caches.open(MEDIA_CACHE_NAME);
      const hit = await cache.match(src);
      if (hit && hit.ok) {
        const cachedAt = Number(hit.headers.get(MEDIA_CACHED_AT_HEADER));
        const cachedVersion = hit.headers.get(MEDIA_VERSION_HEADER) ?? "0";
        const versionOk = immutable || cachedVersion === version;
        const fresh = Number.isFinite(cachedAt) && Date.now() - cachedAt < ttlMs;
        if (versionOk && fresh) {
          const blob = await hit.blob();
          if (blob.size > 0) {
            const objectUrl = URL.createObjectURL(blob);
            memoryImageUrls.set(src, objectUrl);
            return objectUrl;
          }
        }
      }

      const res = await fetch(src, { cache: immutable ? "force-cache" : "default" });
      if (!res.ok) return src;

      const blob = await res.blob();
      if (blob.size === 0) return src;

      const contentType = res.headers.get("content-type") || blob.type || "application/octet-stream";
      await cache
        .put(
          src,
          new Response(blob, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              [MEDIA_CACHED_AT_HEADER]: String(Date.now()),
              [MEDIA_VERSION_HEADER]: version,
            },
          }),
        )
        .catch(() => {
          // ignore cache write errors (e.g. quota exceeded)
        });

      const objectUrl = URL.createObjectURL(blob);
      memoryImageUrls.set(src, objectUrl);
      return objectUrl;
    } catch {
      return src;
    }
  })().finally(() => {
    inflightImages.delete(src);
  });

  inflightImages.set(src, promise);
  return promise;
}

/** Preloads an image once per session, routing same-origin images through the Cache API. */
export function preloadCachedImage(src?: string | null): void {
  if (!src || typeof window === "undefined") return;
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);

  if (isCacheableLocalMedia(src) && canUseBrowserImageCache()) {
    void fetchCachedImageUrl(src);
    return;
  }

  const image = new window.Image();
  image.src = src;
}
