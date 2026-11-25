// Usage: node scripts/pull-production-data.mjs [--apply] [--url https://incial.com] [--only about,clients]
//
// Brings the local CMS data (data/*.json) in line with the live site, so the development admin
// panel shows what the production admin panel shows (team photos, clients, posts and so on).
// Production admins edit data/*.json on the live server, so the two copies drift apart.
//
// It reads each section from the live site's public GET /api/admin/<section> (the stored file,
// unchanged) and compares it with the local file. Without --apply it only reports the
// differences. With --apply it first copies the local files to data/.backups/<timestamp>/ and then
// writes the production versions (atomically: temp file + rename).
//
// The production address comes from --url, then PRODUCTION_URL in the environment, then
// https://incial.com. Nothing is ever sent to production: this only reads.
import fs from "fs";
import path from "path";

const SECTIONS = ["about", "clients", "trust", "blogs", "services", "casestudies", "products", "sections"];
const TIMEOUT_MS = 20000;

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const base = (valueOf("--url") || process.env.PRODUCTION_URL || "https://incial.com").replace(/\/+$/, "");
const only = valueOf("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
const sections = only?.length ? SECTIONS.filter((s) => only.includes(s)) : SECTIONS;

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  console.error("Run this from the project folder (data/ was not found).");
  process.exit(1);
}

async function fetchSection(section) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // ?fresh=1 skips any cache in front of the site, so this is the file as it is now
    const res = await fetch(`${base}/api/admin/${section}?fresh=1`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("the reply is not JSON");
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Paths (a.b[2].c) whose values differ, for a short summary. */
function differences(a, b, at = "", out = []) {
  if (out.length >= 12) return out;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || a === null || b === null || typeof a !== "object") {
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push(at || "(whole file)");
    return out;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    differences(a[key], b[key], Array.isArray(a) ? `${at}[${key}]` : at ? `${at}.${key}` : key, out);
  }
  return out;
}

function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, file);
}

console.log(`${APPLY ? "Pulling" : "Comparing (dry run)"} from ${base}\n`);

const changed = [];
const failed = [];
for (const section of sections) {
  const file = path.join(dataDir, `${section}.json`);
  let remote;
  try {
    remote = await fetchSection(section);
  } catch (error) {
    console.log(`  ${section.padEnd(12)} could not read production: ${error.cause?.code || error.message}`);
    failed.push(section);
    continue;
  }
  const local = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  const diff = differences(local, remote);
  if (diff.length === 0) {
    console.log(`  ${section.padEnd(12)} same`);
    continue;
  }
  console.log(`  ${section.padEnd(12)} differs: ${diff.slice(0, 6).join(", ")}${diff.length > 6 ? ", ..." : ""}`);
  changed.push({ section, file, remote });
}

if (failed.length === sections.length) {
  console.error(`\nProduction could not be reached at ${base}; nothing was compared or changed.`);
  process.exit(1);
}
if (failed.length > 0) console.log(`\nNot compared (production unreachable): ${failed.join(", ")}`);

if (changed.length === 0) {
  console.log(failed.length ? "\nThe sections that could be read match production." : "\nLocal data already matches production.");
  process.exit(0);
}

if (!APPLY) {
  console.log(`\n${changed.length} section(s) differ. Run again with --apply to copy production's versions here.`);
  process.exit(0);
}

const backupDir = path.join(dataDir, ".backups", new Date().toISOString().replace(/[:.]/g, "-"));
fs.mkdirSync(backupDir, { recursive: true });
for (const { section, file, remote } of changed) {
  if (fs.existsSync(file)) fs.copyFileSync(file, path.join(backupDir, `${section}.json`));
  writeAtomic(file, remote);
  console.log(`  updated data/${section}.json`);
}
console.log(`\nDone. The previous local files are in ${path.relative(process.cwd(), backupDir)}.`);
