/** What may be uploaded: the file's type decides its extension, never the name the user gave it. */
export const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const CLIENT_LOGO_MIN_WIDTH = 1000;
export const CLIENT_LOGO_MIN_HEIGHT = 500;

/** A folder under incial-web/, e.g. "images/about" or "clients"; no "..", no leading slash. */
export const FOLDER_PATTERN = /^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/i;

export type FileCheck = { ok: true; ext: string; isVideo: boolean } | { ok: false; status: number; error: string };

export function checkFile(file: File): FileCheck {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { ok: false, status: 415, error: "Unsupported file type. Use PNG, JPEG, WebP, GIF, AVIF, SVG, MP4 or WebM." };
  const isVideo = file.type.startsWith("video/");
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    return { ok: false, status: 413, error: isVideo ? "Video too large. Maximum size is 50 MB." : "File too large. Maximum size is 10 MB." };
  }
  return { ok: true, ext, isVideo };
}

/** The folder from a form field, cleaned; "" for none, null when it is not allowed. */
export function cleanFolder(raw: unknown): string | null {
  const folder = String(raw ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!folder) return "";
  return FOLDER_PATTERN.test(folder) ? folder : null;
}

/** Reads pixel dimensions from PNG, JPEG, GIF, or WebP headers without external dependencies. */
export function readImageDimensions(bytes: Uint8Array, mimeType: string): { width: number; height: number } | null {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (mimeType === "image/png" && bytes.length >= 24 && dv.getUint32(0) === 0x89504e47) {
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }

  if (mimeType === "image/gif" && bytes.length >= 10 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
  }

  if (mimeType === "image/jpeg" && bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 4 <= bytes.length) {
      if (bytes[i] !== 0xff) break;
      const marker = bytes[i + 1];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        if (i + 9 > bytes.length) break;
        return { width: dv.getUint16(i + 7), height: dv.getUint16(i + 5) };
      }
      const segmentLength = dv.getUint16(i + 2);
      if (segmentLength < 2) break;
      i += 2 + segmentLength;
    }
    return null;
  }

  if (mimeType === "image/webp" && bytes.length >= 30 && dv.getUint32(0) === 0x52494646 && dv.getUint32(8) === 0x57454250) {
    const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
    if (chunk === "VP8 " && bytes.length >= 30) {
      return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
    }
    if (chunk === "VP8L" && bytes.length >= 25) {
      const bits = dv.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X" && bytes.length >= 30) {
      const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { width, height };
    }
  }

  return null;
}

export type DimensionCheck = { ok: true } | { ok: false; status: number; error: string };

/** Enforces minimum pixel dimensions for client logo uploads. */
export function checkClientLogoDimensions(bytes: Uint8Array, mimeType: string): DimensionCheck {
  if (mimeType === "image/svg+xml") return { ok: true };
  const dims = readImageDimensions(bytes, mimeType);
  if (!dims) {
    return {
      ok: false,
      status: 400,
      error: "Could not verify image dimensions. Please upload a valid PNG, JPEG, WebP, or SVG client logo.",
    };
  }
  if (dims.width < CLIENT_LOGO_MIN_WIDTH || dims.height < CLIENT_LOGO_MIN_HEIGHT) {
    return {
      ok: false,
      status: 400,
      error: `Client logo is too small (${dims.width}×${dims.height}). Minimum required size is ${CLIENT_LOGO_MIN_WIDTH}×${CLIENT_LOGO_MIN_HEIGHT}px.`,
    };
  }
  return { ok: true };
}
