import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { S3_ROOT, getS3Config, publicUrlFor } from "@/lib/s3";
import { deleteFile, listMedia, putFile, replaceInContent, scanUsage } from "@/lib/mediaStore";
import { checkFile } from "@/lib/uploadRules";
import { validateAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const SAFE_KEY = /^[A-Za-z0-9._\-/]+$/;

function isSafeKey(key: string | null): key is string {
  return !!key && key.startsWith(`${S3_ROOT}/`) && !key.includes("..") && SAFE_KEY.test(key);
}

function notConfigured() {
  return NextResponse.json({ error: "Image storage (Amazon S3) is not configured on the server." }, { status: 500 });
}

/** Lists the library: every file, its size, and where on the site it is used. */
export async function GET(req: NextRequest) {
  if (!(await validateAdminAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = getS3Config();
  if (!config) return notConfigured();
  try {
    return NextResponse.json(await listMedia(config));
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json({ error: "Could not read the media library." }, { status: 500 });
  }
}

/**
 * Replaces a file: the new file is stored under a new name in the same folder, every page that used the
 * old one is pointed at it, and the old file is deleted. (A new name, because browsers keep files for a
 * year; overwriting in place would leave visitors seeing the old picture.)
 */
export async function POST(req: NextRequest) {
  if (!(await validateAdminAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = getS3Config();
  if (!config) return notConfigured();
  try {
    const form = await req.formData();
    const oldKey = String(form.get("key") ?? "");
    const file = form.get("file");
    if (!isSafeKey(oldKey)) return NextResponse.json({ error: "Invalid file." }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const check = checkFile(file);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const folder = oldKey.split("/").slice(0, -1).join("/");
    const newKey = `${folder}/${check.isVideo ? "vid" : "img"}-${Date.now()}-${randomBytes(4).toString("hex")}.${check.ext}`;
    await putFile(config, newKey, Buffer.from(await file.arrayBuffer()), file.type);
    const newUrl = publicUrlFor(config, newKey);
    const changed = replaceInContent(oldKey, newUrl, config);
    await deleteFile(config, oldKey);
    if (changed > 0) revalidatePath("/", "layout");
    const res = NextResponse.json({ url: newUrl, key: newKey, pagesUpdated: changed });
    if (changed > 0) {
      res.cookies.set("incial_cms_v", String(Date.now()), {
        path: "/",
        maxAge: 86400,
        sameSite: "lax",
      });
    }
    return res;
  } catch (error) {
    console.error("Media replace error:", error);
    return NextResponse.json({ error: "Could not replace the file." }, { status: 500 });
  }
}

/** Deletes a file, unless a page still uses it. */
export async function DELETE(req: NextRequest) {
  if (!(await validateAdminAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = getS3Config();
  if (!config) return notConfigured();
  const key = req.nextUrl.searchParams.get("key");
  if (!isSafeKey(key)) return NextResponse.json({ error: "Invalid file." }, { status: 400 });
  const usedIn = scanUsage(config).get(key) ?? [];
  if (usedIn.length > 0) {
    return NextResponse.json({ error: "This file is still used on the website.", usedIn }, { status: 409 });
  }
  try {
    await deleteFile(config, key);
    return NextResponse.json({ deleted: key });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json({ error: "Could not delete the file." }, { status: 500 });
  }
}
