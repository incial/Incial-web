import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { S3_ROOT, getS3Config, publicUrlFor } from "@/lib/s3";
import { putFile } from "@/lib/mediaStore";
import { checkFile, cleanFolder } from "@/lib/uploadRules";
import { validateAdminAuth } from "@/lib/adminAuth";

/** Stores one uploaded file in S3 under incial-web/<folder>/ with a unique name and returns its address. */
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

    const check = checkFile(file);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const folder = cleanFolder(formData.get("folder"));
    if (folder === null) return NextResponse.json({ error: "Invalid folder." }, { status: 400 });

    const config = getS3Config();
    if (!config) {
      return NextResponse.json({ error: "Image storage (Amazon S3) is not configured on the server." }, { status: 500 });
    }

    const filename = `${check.isVideo ? "vid" : "img"}-${Date.now()}-${randomBytes(4).toString("hex")}.${check.ext}`;
    const key = [S3_ROOT, folder || "uploads", filename].join("/");
    await putFile(config, key, Buffer.from(await file.arrayBuffer()), file.type);

    return NextResponse.json({ url: publicUrlFor(config, key), key }, { status: 200 });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload the file." }, { status: 500 });
  }
}
