import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "pdf", "Brochure.pdf");

  try {
    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (!stat?.isFile()) {
      return NextResponse.json(
        { error: "Brochure is not available at the moment. Please contact us directly." },
        { status: 404 }
      );
    }

    // Stream from disk — the brochure is large and must not be buffered in memory.
    const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Incial-Brochure.pdf"',
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=86400", // Cache for 24h — PDF rarely changes
      },
    });
  } catch (error) {
    console.error("Download brochure error:", error);
    return NextResponse.json(
      { error: "Failed to serve brochure. Please try again later." },
      { status: 500 }
    );
  }
}
