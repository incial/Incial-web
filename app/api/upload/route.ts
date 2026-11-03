import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import ImageKit from "imagekit";
import { validateAdminAuth } from "@/lib/adminAuth";

interface UploadResult {
  url: string;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

// Allow-list of raster image types; extension is derived from the MIME type,
// never from the user-supplied filename.
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const FOLDER_PATTERN = /^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/i;

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
        { error: "Unsupported file type. Use PNG, JPEG, WebP, GIF or AVIF." },
        { status: 415 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 413 }
      );
    }

    // Optional subfolder (e.g. "images/about", "clients") — strictly sanitized
    // so callers cannot escape /incial-web via "..".
    const rawFolder = String(formData.get("folder") ?? "")
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (rawFolder && !FOLDER_PATTERN.test(rawFolder)) {
      return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
    }
    const targetFolder = rawFolder
      ? `/incial-web/${rawFolder}`
      : "/incial-web/uploads";

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      return NextResponse.json(
        { error: "ImageKit is not configured on the server." },
        { status: 500 }
      );
    }

    const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `img-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

    const uploadResponse = await new Promise<UploadResult>((resolve, reject) => {
      imagekit.upload(
        { file: buffer, fileName: filename, folder: targetFolder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadResult);
        }
      );
    });

    return NextResponse.json({ url: uploadResponse.url }, { status: 200 });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload to ImageKit." },
      { status: 500 }
    );
  }
}
