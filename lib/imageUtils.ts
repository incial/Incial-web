/**
 * Client-safe image URL normalization utilities.
 * Does NOT import Node.js 'fs' or 'path' modules so it can be safely used
 * in both Client Components and Server Components.
 */

/** True for the stock "case1" picture that was used before real images were uploaded. */
export function isPlaceholderImage(url?: string | null): boolean {
  return !!url && /(^|\/)case1\.(webp|jpe?g|png)(\?.*)?$/i.test(url.trim());
}

/**
 * Picks the first usable image from the candidates, in order. A placeholder
 * only wins when there is no real image at all, so an admin who sets just the
 * hero image is never overridden by a leftover placeholder cover (and vice versa).
 */
export function pickImage(...candidates: Array<string | null | undefined>): string {
  const urls = candidates
    .map((c) => normalizeImageUrl(c))
    .filter((c) => c.length > 0);
  return urls.find((u) => !isPlaceholderImage(u)) ?? urls[0] ?? "";
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed === "https://ik.imagekit.io/0bs3my2iz/incial-web/images/case1.webp") {
    return "/images/case1.webp";
  }
  if (trimmed === "https://ik.imagekit.io/0bs3my2iz/incial-web/images/case1.jpg") {
    return "/images/case1.jpg";
  }
  return trimmed;
}
