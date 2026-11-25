import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { validateAdminAuth } from "@/lib/adminAuth";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

// Allow-list of raster image types; extension is derived from the MIME type,
// never from the user-supplied filename.
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const FOLDER_PATTERN = /^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/i;

// Reused across requests so the connection pool is shared.
let s3Client: S3Client | null = null;

function getS3Config() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;

  // Public base URL: a CloudFront domain if set, otherwise the bucket's own address.
  const publicUrl = (
    process.env.S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`
  ).replace(/\/+$/, "");

  return { region, bucket, accessKeyId, secretAccessKey, publicUrl };
}

export async function POST(req: NextRequest) {
  if (!(await validateAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPEG, WebP, GIF, AVIF, MP4 or WebM." },
        { status: 415 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: isVideo ? "Video too large. Maximum size is 50 MB." : "File too large. Maximum size is 10 MB." },
        { status: 413 }
      );
    }

    // Optional subfolder (e.g. "images/about", "clients") — strictly sanitized
    // so callers cannot escape the incial-web/ prefix via "..".
    const rawFolder = String(formData.get("folder") ?? "")
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (rawFolder && !FOLDER_PATTERN.test(rawFolder)) {
      return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
    }

    const config = getS3Config();
    if (!config) {
      return NextResponse.json(
        { error: "Image storage (Amazon S3) is not configured on the server." },
        { status: 500 }
      );
    }

    s3Client ??= new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const filename = `${isVideo ? "vid" : "img"}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    const key = ["incial-web", rawFolder || "uploads", filename].join("/");

    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        // File names are unique, so browsers and a CDN can cache them for good.
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return NextResponse.json({ url: `${config.publicUrl}/${key}` }, { status: 200 });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload the image." },
      { status: 500 }
    );
  }
}
