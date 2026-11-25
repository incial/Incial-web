import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3_ROOT, getS3Client, getS3Config } from "@/lib/s3";

// Only the site's own folder can be read, and only file-like paths: no "..", no other folders.
const SAFE_KEY = /^[A-Za-z0-9._\-/]+$/;
const BYTE_RANGE = /^bytes=\d+-\d*$/;

/**
 * Serves a stored file from the private S3 bucket. The site uses /media/<key> for every image and
 * video it keeps in S3, so the bucket never has to be opened to the public. Supports conditional
 * requests (ETag) and HTTP byte-range requests (206 Partial Content) for smooth video streaming.
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

  try {
    const object = await getS3Client(config).send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
        IfNoneMatch: range ? undefined : ifNoneMatch,
        Range: range,
      }),
    );
    if (!object.Body) return new NextResponse("Not found", { status: 404 });
    const body = object.Body.transformToWebStream();
    const isPartial = Boolean(range && object.ContentRange);
    return new NextResponse(body, {
      status: isPartial ? 206 : 200,
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Accept-Ranges": "bytes",
        ...(object.ContentRange ? { "Content-Range": object.ContentRange } : {}),
        ...(object.ContentLength !== undefined ? { "Content-Length": String(object.ContentLength) } : {}),
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(object.ETag ? { ETag: object.ETag } : {}),
      },
    });
  } catch (error: unknown) {
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err.$metadata?.httpStatusCode === 304 || err.name === "NotModified") {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
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
