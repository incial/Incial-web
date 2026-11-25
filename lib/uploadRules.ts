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
