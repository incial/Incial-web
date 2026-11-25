/**
 * Bounded in-memory cache for `/media/[...key]` S3 responses.
 *
 * Keeps S3 GET traffic and conditional 304 round-trips minimal while obeying the
 * host's 512 MB heap cap:
 * - Metadata (`etag`, `contentType`, `contentLength`) is cached up to 500 keys so
 *   conditional `If-None-Match` requests return 304 without contacting S3.
 * - Image payloads are cached ONLY for `image/*` objects <= 512 KB, capped at
 *   24 MB total with strict LRU eviction. Larger files and videos always stream.
 */

export const MAX_CACHED_IMAGE_BYTES = 512 * 1024; // 512 KB per object
const MAX_CACHE_TOTAL_BYTES = 24 * 1024 * 1024; // 24 MB total heap budget
const MAX_META_ENTRIES = 500;

export interface CachedMediaMeta {
  etag?: string;
  contentType: string;
  contentLength: number;
}

export interface CachedMediaObject extends CachedMediaMeta {
  body: Buffer;
}

const metaCache = new Map<string, CachedMediaMeta>();
const objectCache = new Map<string, CachedMediaObject>();
const inflightFetches = new Map<string, Promise<CachedMediaObject | null>>();
let totalCachedBytes = 0;

function touchMeta(key: string, value: CachedMediaMeta): void {
  if (metaCache.has(key)) {
    metaCache.delete(key);
  } else if (metaCache.size >= MAX_META_ENTRIES) {
    const oldest = metaCache.keys().next().value;
    if (oldest !== undefined) metaCache.delete(oldest);
  }
  metaCache.set(key, value);
}

function touchObject(key: string, value: CachedMediaObject): void {
  const existing = objectCache.get(key);
  if (existing) {
    totalCachedBytes -= existing.body.byteLength;
    objectCache.delete(key);
  }

  if (value.body.byteLength > MAX_CACHED_IMAGE_BYTES) return;

  while (totalCachedBytes + value.body.byteLength > MAX_CACHE_TOTAL_BYTES && objectCache.size > 0) {
    const oldestKey = objectCache.keys().next().value;
    if (oldestKey === undefined) break;
    const oldest = objectCache.get(oldestKey);
    if (oldest) totalCachedBytes -= oldest.body.byteLength;
    objectCache.delete(oldestKey);
  }

  objectCache.set(key, value);
  totalCachedBytes += value.body.byteLength;
}

export function getCachedMediaMeta(key: string): CachedMediaMeta | null {
  const entry = metaCache.get(key);
  if (!entry) return null;
  metaCache.delete(key);
  metaCache.set(key, entry);
  return entry;
}

export function setCachedMediaMeta(key: string, meta: CachedMediaMeta): void {
  touchMeta(key, meta);
}

export function getCachedMediaObject(key: string): CachedMediaObject | null {
  const entry = objectCache.get(key);
  if (!entry) return null;
  objectCache.delete(key);
  objectCache.set(key, entry);
  return entry;
}

export function setCachedMediaObject(key: string, obj: CachedMediaObject): void {
  touchMeta(key, {
    etag: obj.etag,
    contentType: obj.contentType,
    contentLength: obj.contentLength,
  });
  touchObject(key, obj);
}

export function getInflightMediaFetch(key: string): Promise<CachedMediaObject | null> | undefined {
  return inflightFetches.get(key);
}

export function setInflightMediaFetch(key: string, promise: Promise<CachedMediaObject | null>): void {
  inflightFetches.set(key, promise);
}

export function clearInflightMediaFetch(key: string): void {
  inflightFetches.delete(key);
}

export function invalidateMediaResponseCache(key: string): void {
  metaCache.delete(key);
  const existing = objectCache.get(key);
  if (existing) {
    totalCachedBytes -= existing.body.byteLength;
    objectCache.delete(key);
  }
}
