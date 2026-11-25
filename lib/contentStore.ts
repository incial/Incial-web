import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Where the admin-edited site content lives: one JSON document per section in the Neon
 * database (table "ContentDocument"), so production and development read the same content and
 * a deploy can never overwrite live edits with the copies in git.
 *
 * - The table is created on first use if it is missing (additive only, never touches other tables).
 * - Production: a section that is not in the database yet is copied in from data/<key>.json on
 *   the server the first time it is read, so the live edits already on disk move across by
 *   themselves.
 * - Development: a missing section is read from the local file but never copied in, so a stale
 *   local copy can not reach a shared database before production's does.
 * - Without DATABASE_URL, or if the database fails, the JSON files in data/ are used as before.
 */

export const CONTENT_KEYS = [
  "about",
  "clients",
  "trust",
  "blogs",
  "services",
  "casestudies",
  "products",
  "sections",
] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];
/** The record of uploaded files (see lib/mediaStore.ts), stored alongside the content. */
export const MEDIA_MANIFEST_KEY = "media-manifest";
type StoreKey = ContentKey | typeof MEDIA_MANIFEST_KEY;

const DATA_DIR = path.join(process.cwd(), "data");
/**
 * Only the running production server copies its files in. A build also runs with
 * NODE_ENV=production, but from a fresh checkout whose files are the (possibly stale) copies in
 * git, so builds never copy anything.
 */
const SEEDS_FROM_FILES =
  process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

export interface ContentRecord<T> {
  data: T;
  updatedAt: Date | null;
}

/**
 * After the database fails, content comes straight from the files for this long, instead of every
 * request waiting for another connection to fail.
 */
const RETRY_AFTER_FAILURE_MS = 60_000;

// Kept on globalThis: each route can get its own copy of this module, and they should all share
// one "database is down" state and one table check.
const shared = globalThis as typeof globalThis & {
  __contentStore?: { downUntil: number; tableReady: Promise<void> | null };
};
const state = (shared.__contentStore ??= { downUntil: 0, tableReady: null });

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL) && Date.now() >= state.downUntil;
}

function markDatabaseDown() {
  state.downUntil = Date.now() + RETRY_AFTER_FAILURE_MS;
}

// ── table ─────────────────────────────────────────────────────────────────

/** Creates the content table if it does not exist (once per server process). */
function ensureTable(): Promise<void> {
  if (!state.tableReady) {
    state.tableReady = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "ContentDocument" (
          "key" TEXT PRIMARY KEY,
          "data" JSONB NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      )
      .then(() => undefined)
      .catch((error: unknown) => {
        state.tableReady = null; // try again on the next request
        throw error;
      });
  }
  return state.tableReady;
}

// ── files (fallback and first import) ─────────────────────────────────────

function filePath(key: StoreKey): string {
  return path.join(DATA_DIR, `${key}.json`);
}

function readFile<T>(key: StoreKey): ContentRecord<T> | null {
  try {
    const file = filePath(key);
    const raw = fs.readFileSync(file, "utf8");
    return { data: JSON.parse(raw) as T, updatedAt: fs.statSync(file).mtime };
  } catch {
    return null;
  }
}

function writeFile(key: StoreKey, data: unknown) {
  const file = filePath(key);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

// ── public API ────────────────────────────────────────────────────────────

/** One section's content, or null when it exists nowhere. */
export async function readContent<T>(key: StoreKey): Promise<ContentRecord<T> | null> {
  if (!hasDatabase()) return readFile<T>(key);

  try {
    await ensureTable();
    const row = await prisma.contentDocument.findUnique({ where: { key } });
    if (row) return { data: row.data as T, updatedAt: row.updatedAt };

    const fromFile = readFile<T>(key);
    if (fromFile && SEEDS_FROM_FILES) {
      // first read on production: move the server's current file into the database
      await prisma.contentDocument.upsert({
        where: { key },
        create: { key, data: fromFile.data as Prisma.InputJsonValue },
        update: {},
      });
    }
    return fromFile;
  } catch (error) {
    markDatabaseDown();
    console.error(
      `Content store: could not read "${key}" from the database, using data/${key}.json for the next minute`,
      error,
    );
    return readFile<T>(key);
  }
}

/** The content of a section, throwing when it is missing (for pages that need it). */
export async function requireContent<T>(key: StoreKey): Promise<T> {
  const record = await readContent<T>(key);
  if (!record) throw new Error(`Site content "${key}" is missing`);
  return record.data;
}

/**
 * Saves a section. With a database configured it always goes there, and a failure is reported
 * (never written to a file instead, where the edit would be hidden by the database copy and lost).
 * Without a database it goes to the JSON file.
 */
export async function writeContent(key: StoreKey, data: unknown): Promise<Date> {
  if (!process.env.DATABASE_URL) {
    writeFile(key, data);
    return new Date();
  }
  await ensureTable();
  const row = await prisma.contentDocument.upsert({
    where: { key },
    create: { key, data: data as Prisma.InputJsonValue },
    update: { data: data as Prisma.InputJsonValue },
  });
  return row.updatedAt;
}

/** Every content section that exists, for scanning and replacing image references. */
export async function readAllContent(): Promise<Array<{ key: ContentKey; data: unknown }>> {
  const records = await Promise.all(
    CONTENT_KEYS.map(async (key) => ({ key, record: await readContent<unknown>(key) })),
  );
  return records.flatMap(({ key, record }) => (record ? [{ key, data: record.data }] : []));
}
