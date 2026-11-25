"use client";

import { useCallback, useEffect, useState } from "react";
import { invalidateCmsCache } from "@/lib/publicCache";

export interface MediaUsage {
  section: string;
  label: string;
}

export interface MediaFile {
  key: string;
  url: string;
  folder: string;
  name: string;
  size: number | null;
  lastModified: string | null;
  contentType: string | null;
  usedIn: MediaUsage[];
}

/** Friendly names for the bucket's folders, in the order they are offered. */
export const FOLDERS: Array<{ id: string; label: string }> = [
  { id: "images/about", label: "About" },
  { id: "clients", label: "Client logos" },
  { id: "images/products", label: "Products" },
  { id: "videos/products", label: "Product videos" },
  { id: "images/case-studies", label: "Case studies" },
  { id: "images/blogs", label: "Blog posts" },
  { id: "images", label: "Other images" },
  { id: "uploads", label: "Uploads" },
];

export function folderLabel(id: string): string {
  return FOLDERS.find((folder) => folder.id === id)?.label ?? id;
}

export function isVideo(file: MediaFile): boolean {
  return (file.contentType ?? "").startsWith("video/") || /\.(mp4|webm)$/i.test(file.name);
}

export function formatSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error || fallback;
}

type MediaResponse = { source: "bucket" | "index"; files: MediaFile[] };

const LIBRARY_CACHE_TTL_MS = 60 * 1000;
let cachedLibrary: { data: MediaResponse; fetchedAt: number } | null = null;
let inflightLibrary: Promise<MediaResponse> | null = null;

function clearLibraryCache() {
  cachedLibrary = null;
  inflightLibrary = null;
}

async function fetchLibrary(force: boolean): Promise<MediaResponse> {
  if (!force && cachedLibrary && Date.now() - cachedLibrary.fetchedAt < LIBRARY_CACHE_TTL_MS) {
    return cachedLibrary.data;
  }
  if (!force && inflightLibrary) {
    return inflightLibrary;
  }

  const req = fetch("/api/admin/media", { headers: authHeaders(), cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) throw new Error(await readError(res, "Could not load the media library."));
      const data = (await res.json()) as MediaResponse;
      cachedLibrary = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      inflightLibrary = null;
    });

  inflightLibrary = req;
  return req;
}

/** Loads the media library and wraps its actions: upload, replace and delete. */
export function useMediaLibrary() {
  const [files, setFiles] = useState<MediaFile[] | null>(() => cachedLibrary?.data.files ?? null);
  const [source, setSource] = useState<"bucket" | "index">(() => cachedLibrary?.data.source ?? "bucket");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    try {
      const data = await fetchLibrary(force);
      setFiles(data.files);
      setSource(data.source);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the media library.");
      setFiles((current) => current ?? []);
    }
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(false);
  }, [load]);

  const upload = useCallback(
    async (file: File, folder: string): Promise<string> => {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: form });
      if (!res.ok) throw new Error(await readError(res, `Could not upload ${file.name}.`));
      const { url } = (await res.json()) as { url: string };
      clearLibraryCache();
      return url;
    },
    [],
  );

  const replace = useCallback(async (key: string, file: File): Promise<{ url: string; pagesUpdated: number }> => {
    const form = new FormData();
    form.append("key", key);
    form.append("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", headers: authHeaders(), body: form });
    if (!res.ok) throw new Error(await readError(res, "Could not replace the file."));
    const result = (await res.json()) as { url: string; pagesUpdated: number };
    clearLibraryCache();
    if (result.pagesUpdated > 0) invalidateCmsCache();
    return result;
  }, []);

  const remove = useCallback(async (key: string) => {
    const res = await fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error(await readError(res, "Could not delete the file."));
    clearLibraryCache();
  }, []);

  return { files, source, error, refresh, upload, replace, remove };
}
