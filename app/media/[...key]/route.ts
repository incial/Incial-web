import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3_ROOT, getS3Client, getS3Config } from "@/lib/s3";
import {
  MAX_CACHED_IMAGE_BYTES,
  clearInflightMediaFetch,
  getCachedMediaMeta,
  getCachedMediaObject,
  getInflightMediaFetch,
  setCachedMediaMeta,
  setCachedMediaObject,
  setInflightMediaFetch,
  type CachedMediaObject,
} from "@/lib/mediaResponseCache";

// Only the site's own folder can be read, and only file-like paths: no "..", no other folders.
const SAFE_KEY = /^[A-Za-z0-9._\-/]+$/;
const BYTE_RANGE = /^bytes=(\d+)-(\d*)$/;
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

function normalizeEtag(value: string): string {
  return value.trim().replace(/^W\//i, "");
}

function etagMatches(ifNoneMatch: string | undefined, etag: string | undefined): boolean {
  if (!ifNoneMatch || !etag) return false;
  const target = normalizeEtag(etag);
  return ifNoneMatch
    .split(",")
    .some((candidate) => candidate.trim() === "*" || normalizeEtag(candidate) === target);
}

function buildCachedResponse(
  cached: CachedMediaObject,
  range: string | undefined,
  ifNoneMatch: string | undefined,
): NextResponse {
  if (!range && etagMatches(ifNoneMatch, cached.etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        "Cache-Control": IMMUTABLE_CACHE_CONTROL,
        ...(cached.etag ? { ETag: cached.etag } : {}),
      },
    });
  }

  if (range) {
    const match = BYTE_RANGE.exec(range);
    const total = cached.body.byteLength;
    const start = match ? Number(match[1]) : 0;
    const rawEnd = match?.[2] ? Number(match[2]) : total - 1;
    const end = Math.min(rawEnd, total - 1);

    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= total || start > end) {
      return new NextResponse("Range Not Satisfiable", { status: 416 });
    }

    const slice = cached.body.subarray(start, end + 1);
    return new NextResponse(new Uint8Array(slice), {
      status: 206,
      headers: {
        "Content-Type": cached.contentType,
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(slice.byteLength),
        "Cache-Control": IMMUTABLE_CACHE_CONTROL,
        ...(cached.etag ? { ETag: cached.etag } : {}),
      },
    });
  }

  return new NextResponse(new Uint8Array(cached.body), {
    status: 200,
    headers: {
      "Content-Type": cached.contentType,
      "Accept-Ranges": "bytes",
      "Content-Length": String(cached.body.byteLength),
      "Cache-Control": IMMUTABLE_CACHE_CONTROL,
      ...(cached.etag ? { ETag: cached.etag } : {}),
    },
  });
}

/**
 * Serves a stored file from the private S3 bucket. The site uses /media/<key> for every image and
 * video it keeps in S3, so the bucket never has to be opened to the public. Uses a bounded
 * server-side LRU cache for small images and ETags to prevent repeated S3 GET calls, while
 * streaming larger assets and supporting HTTP byte-range requests (206 Partial Content).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!key.startsWith(`${S3_ROOT}/`) || key.includes("..") || !SAFE_KEY.test(key)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const config = getS3Config();
  if (!config) return new NextResponse("Storage is not configured", { status: 503 });

  const ifNoneMatch = req.headers.get("if-none-match") || undefined;
  const rawRange = req.headers.get("range")?.trim();
  const range = rawRange && BYTE_RANGE.test(rawRange) ? rawRange : undefined;

  if (!range && ifNoneMatch) {
    const cachedMeta = getCachedMediaMeta(key);
    if (cachedMeta && etagMatches(ifNoneMatch, cachedMeta.etag)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": IMMUTABLE_CACHE_CONTROL,
          ...(cachedMeta.etag ? { ETag: cachedMeta.etag } : {}),
        },
      });
    }
  }

  const cachedObject = getCachedMediaObject(key);
  if (cachedObject) {
    return buildCachedResponse(cachedObject, range, ifNoneMatch);
  }

  // Coalesce concurrent non-range requests for the same uncached image so a cold load hits S3 once.
  if (!range && !ifNoneMatch) {
    const existing = getInflightMediaFetch(key);
    if (existing) {
      const coalesced = await existing.catch(() => null);
      if (coalesced) {
        return buildCachedResponse(coalesced, undefined, undefined);
      }
    }
  }

  let resolveInflight: ((value: CachedMediaObject | null) => void) | null = null;
  const trackInflight = !range && !ifNoneMatch && !getInflightMediaFetch(key);
  if (trackInflight) {
    setInflightMediaFetch(
      key,
      new Promise<CachedMediaObject | null>((resolve) => {
        resolveInflight = resolve;
      }),
    );
  }

  const settleInflight = (value: CachedMediaObject | null) => {
    if (resolveInflight) {
      resolveInflight(value);
      resolveInflight = null;
    }
    if (trackInflight) {
      clearInflightMediaFetch(key);
    }
  };

  try {
    const object = await getS3Client(config).send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
        IfNoneMatch: range ? undefined : ifNoneMatch,
        Range: range,
      }),
    );
    if (!object.Body) {
      settleInflight(null);
      return new NextResponse("Not found", { status: 404 });
    }

    const contentType = object.ContentType || "application/octet-stream";
    if (!range && object.ContentLength !== undefined) {
      setCachedMediaMeta(key, {
        etag: object.ETag,
        contentType,
        contentLength: object.ContentLength,
      });
    }

    const canCachePayload =
      !range &&
      contentType.startsWith("image/") &&
      object.ContentLength !== undefined &&
      object.ContentLength <= MAX_CACHED_IMAGE_BYTES;

    if (canCachePayload) {
      const bytes = await object.Body.transformToByteArray();
      const buffer = Buffer.from(bytes);
      const cached: CachedMediaObject = {
        etag: object.ETag,
        contentType,
        contentLength: buffer.byteLength,
        body: buffer,
      };
      setCachedMediaObject(key, cached);
      settleInflight(cached);
      return buildCachedResponse(cached, undefined, ifNoneMatch);
    }

    settleInflight(null);
    const body = object.Body.transformToWebStream();
    const isPartial = Boolean(range && object.ContentRange);
    return new NextResponse(body, {
      status: isPartial ? 206 : 200,
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        ...(object.ContentRange ? { "Content-Range": object.ContentRange } : {}),
        ...(object.ContentLength !== undefined ? { "Content-Length": String(object.ContentLength) } : {}),
        "Cache-Control": IMMUTABLE_CACHE_CONTROL,
        ...(object.ETag ? { ETag: object.ETag } : {}),
      },
    });
  } catch (error: unknown) {
    settleInflight(null);
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err.$metadata?.httpStatusCode === 304 || err.name === "NotModified") {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": IMMUTABLE_CACHE_CONTROL,
          ...(ifNoneMatch ? { ETag: ifNoneMatch } : {}),
        },
      });
    }
    if (err.$metadata?.httpStatusCode === 416 || err.name === "InvalidRange") {
      return new NextResponse("Range Not Satisfiable", { status: 416 });
    }
    const name = error instanceof Error ? error.name : "";
    // the app user may not list the bucket, so S3 reports a missing file as AccessDenied
    if (name === "NoSuchKey" || name === "NotFound" || name === "AccessDenied") return new NextResponse("Not found", { status: 404 });
    console.error("Media error:", error);
    return new NextResponse("Could not load the file", { status: 502 });
  }
}
