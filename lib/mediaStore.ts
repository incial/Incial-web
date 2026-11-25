import fs from "fs";
import path from "path";
import { DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_ROOT, getS3Client, publicUrlFor, type S3Config } from "@/lib/s3";

const DATA_DIR = path.join(process.cwd(), "data");
/** A record of every file uploaded through the admin, so the library works even when listing the bucket is not allowed. */
const MANIFEST = path.join(DATA_DIR, "media-manifest.json");
/** Folders that are not for the website (data backups) and never appear in the library. */
const HIDDEN = [`${S3_ROOT}/backups/`, `${S3_ROOT}/_check/`];

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  blogs: "Blog posts",
  casestudies: "Case studies",
  clients: "Clients",
  products: "Products",
  services: "Services",
  trust: "Training stats",
};

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

interface ManifestEntry {
  key: string;
  size?: number;
  contentType?: string;
  lastModified?: string;
}

/**
 * In-memory S3 HeadObject metadata cache so repeated GET /api/admin/media calls
 * do not re-issue dozens of HeadObject requests for immutable keys.
 */
const metaCache = new Map<string, ManifestEntry>();

// ── manifest ──────────────────────────────────────────────────────────────

function readManifest(): ManifestEntry[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeManifest(entries: ManifestEntry[]) {
  const tmp = `${MANIFEST}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(entries, null, 2), "utf8");
  fs.renameSync(tmp, MANIFEST);
}

export function recordFile(entry: ManifestEntry) {
  const entries = readManifest().filter((existing) => existing.key !== entry.key);
  writeManifest([...entries, entry]);
}

function forgetFile(key: string) {
  writeManifest(readManifest().filter((entry) => entry.key !== key));
}

// ── where files are used ──────────────────────────────────────────────────

/** The stored key a site address points at, or null when it is not one of our S3 files. */
export function keyFromUrl(value: string, config: S3Config): string | null {
  const bases = ["/media/", `${config.publicBase}/`, `https://${config.bucket}.s3.${config.region}.amazonaws.com/`];
  for (const base of bases) {
    if (value.startsWith(base)) {
      const key = decodeURIComponent(value.slice(base.length).split("?")[0]);
      return key.startsWith(`${S3_ROOT}/`) ? key : null;
    }
  }
  return null;
}

function dataFiles(): string[] {
  return fs.readdirSync(DATA_DIR).filter((file) => file.endsWith(".json") && file !== path.basename(MANIFEST));
}

/** Every stored file the site content refers to, with a readable "where" for each use. */
export function scanUsage(config: S3Config): Map<string, MediaUsage[]> {
  const usage = new Map<string, MediaUsage[]>();
  for (const file of dataFiles()) {
    const section = file.replace(/\.json$/, "");
    const sectionLabel = SECTION_LABELS[section] ?? section;
    let data: unknown;
    try {
      data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    } catch {
      continue;
    }
    const walk = (value: unknown, owner: string) => {
      if (typeof value === "string") {
        const key = keyFromUrl(value, config);
        if (key) {
          const list = usage.get(key) ?? [];
          const label = owner ? `${sectionLabel} · ${owner}` : sectionLabel;
          if (!list.some((use) => use.label === label)) list.push({ section, label });
          usage.set(key, list);
        }
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => walk(item, owner));
        return;
      }
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const name = [record.name, record.title, record.label].find((candidate) => typeof candidate === "string" && candidate.trim());
        Object.values(record).forEach((item) => walk(item, (name as string | undefined) ?? owner));
      }
    };
    walk(data, "");
  }
  return usage;
}

/** Points every use of one file at another, across all site content. Returns how many files changed. */
export function replaceInContent(oldKey: string, newUrl: string, config: S3Config): number {
  let changed = 0;
  for (const file of dataFiles()) {
    const full = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    let touched = false;
    const swap = (value: unknown): unknown => {
      if (typeof value === "string") {
        if (keyFromUrl(value, config) === oldKey) {
          touched = true;
          return newUrl;
        }
        return value;
      }
      if (Array.isArray(value)) return value.map(swap);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, swap(v)]));
      return value;
    };
    const next = swap(data);
    if (touched) {
      const tmp = `${full}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(next, null, 2), "utf8");
      fs.renameSync(tmp, full);
      changed++;
    }
  }
  return changed;
}

// ── listing ───────────────────────────────────────────────────────────────

function isListDenied(error: unknown): boolean {
  return error instanceof Error && (error.name === "AccessDenied" || error.name === "Forbidden");
}

async function listFromBucket(config: S3Config): Promise<ManifestEntry[]> {
  const client = getS3Client(config);
  const entries: ManifestEntry[] = [];
  let token: string | undefined;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: config.bucket, Prefix: `${S3_ROOT}/`, ContinuationToken: token }));
    for (const object of page.Contents ?? []) {
      if (!object.Key || object.Key.endsWith("/")) continue;
      entries.push({ key: object.Key, size: object.Size, lastModified: object.LastModified?.toISOString() });
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return entries;
}

/** Fills in sizes and types for files known only by name (reads each file's details, a few at a time). */
async function describe(config: S3Config, entries: ManifestEntry[]): Promise<ManifestEntry[]> {
  const client = getS3Client(config);
  const out: ManifestEntry[] = [];
  for (let i = 0; i < entries.length; i += 8) {
    const batch = await Promise.all(
      entries.slice(i, i + 8).map(async (entry) => {
        if (entry.size !== undefined && entry.contentType) {
          metaCache.set(entry.key, entry);
          return entry;
        }
        const cached = metaCache.get(entry.key);
        if (cached && cached.size !== undefined && cached.contentType) {
          return cached;
        }
        try {
          const head = await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: entry.key }));
          const described: ManifestEntry = {
            key: entry.key,
            size: head.ContentLength,
            contentType: head.ContentType,
            lastModified: head.LastModified?.toISOString() ?? entry.lastModified,
          };
          metaCache.set(entry.key, described);
          return described;
        } catch {
          return null; // gone from the bucket
        }
      }),
    );
    out.push(...batch.filter((entry): entry is NonNullable<typeof entry> => entry !== null));
  }
  return out;
}

/**
 * Every file in the library. Reads the bucket itself when the app is allowed to list it; otherwise uses
 * the files the site content refers to plus everything uploaded through the admin.
 */
export async function listMedia(config: S3Config): Promise<{ source: "bucket" | "index"; files: MediaFile[] }> {
  const usage = scanUsage(config);
  let source: "bucket" | "index" = "bucket";
  let entries: ManifestEntry[];
  try {
    entries = await listFromBucket(config);
  } catch (error) {
    if (!isListDenied(error)) throw error;
    source = "index";
    const known = new Map<string, ManifestEntry>();
    for (const entry of readManifest()) known.set(entry.key, entry);
    for (const key of usage.keys()) if (!known.has(key)) known.set(key, { key });
    entries = [...known.values()];
  }

  const visible = entries.filter((entry) => !HIDDEN.some((prefix) => entry.key.startsWith(prefix)));
  const described = await describe(config, visible);
  const files = described.map((entry) => {
    const parts = entry.key.split("/");
    return {
      key: entry.key,
      url: publicUrlFor(config, entry.key),
      folder: parts.slice(1, -1).join("/") || "uploads",
      name: parts[parts.length - 1],
      size: entry.size ?? null,
      lastModified: entry.lastModified ?? null,
      contentType: entry.contentType ?? null,
      usedIn: usage.get(entry.key) ?? [],
    };
  });
  files.sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? "") || a.key.localeCompare(b.key));
  return { source, files };
}

// ── changes ───────────────────────────────────────────────────────────────

export async function putFile(config: S3Config, key: string, body: Buffer, contentType: string) {
  await getS3Client(config).send(
    new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }),
  );
  const entry: ManifestEntry = { key, size: body.length, contentType, lastModified: new Date().toISOString() };
  metaCache.set(key, entry);
  recordFile(entry);
}

export async function deleteFile(config: S3Config, key: string) {
  await getS3Client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
  metaCache.delete(key);
  forgetFile(key);
}
