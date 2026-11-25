// Usage: node scripts/migrate-to-s3.mjs [--apply] [--refresh]   (run from the project folder; reads .env)
// Copies every ImageKit file the site's data uses into S3 (same folder layout, under incial-web/),
// then points the data at /media/<key>. Run with --apply to do it; without it, it only reports.
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const APPLY = process.argv.includes("--apply");
// --refresh re-copies files already moved to /media from their ImageKit originals, replacing the copies
const REFRESH = process.argv.includes("--refresh");
const IMAGEKIT = "https://ik.imagekit.io/0bs3my2iz/";
const ROOT = process.cwd();
const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_0-9]+=/.test(l)).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }));
const s3 = new S3Client({ region: env.AWS_REGION, credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY } });
const Bucket = env.S3_BUCKET;

const dataDir = path.join(ROOT, "data");
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

/** ImageKit address -> S3 key in the same folder layout. */
function keyFor(url) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean); // [account, incial-web, images, ...]
  const at = parts.indexOf("incial-web");
  const rest = at >= 0 ? parts.slice(at) : ["incial-web", "imported", ...parts.slice(1)];
  return rest.map(decodeURIComponent).join("/");
}

const found = new Map(); // url -> key
function collect(v) {
  if (typeof v === "string") {
    if (/^https:\/\/ik\.imagekit\.io\//.test(v)) found.set(v, keyFor(v));
    else if (REFRESH && v.startsWith("/media/incial-web/")) found.set(v, v.slice("/media/".length));
    return;
  }
  if (Array.isArray(v)) v.forEach(collect); else if (v && typeof v === "object") Object.values(v).forEach(collect);
}
const data = Object.fromEntries(files.map((f) => [f, JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"))]));
Object.values(data).forEach(collect);

const byFolder = {};
for (const key of found.values()) { const d = key.split("/").slice(0, -1).join("/"); byFolder[d] = (byFolder[d] || 0) + 1; }
console.log(`${found.size} files. Folders in the bucket:`); for (const [d, n] of Object.entries(byFolder).sort()) console.log("  " + d.padEnd(40), n);
const keys = [...found.values()]; if (new Set(keys).size !== keys.length) console.log("WARNING: two addresses map to the same key");
if (!APPLY) { console.log("\nDry run only. Re-run with --apply to copy and update the data."); process.exit(0); }

// 1) keep a copy of the data as it was, in the bucket
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
for (const f of files) {
  await s3.send(new PutObjectCommand({ Bucket, Key: `incial-web/backups/data/${stamp}/${f}`, Body: fs.readFileSync(path.join(dataDir, f)), ContentType: "application/json" }));
}
console.log("\nBacked up the data to S3: incial-web/backups/data/" + stamp + "/");

// 2) copy each file
const done = new Map(), failed = [];
let i = 0;
for (const [url, key] of found) {
  i++;
  try {
    let exists = false;
    if (!REFRESH) {
      try { await s3.send(new HeadObjectCommand({ Bucket, Key: key })); exists = true; } catch {}
    }
    if (!exists) {
      // the exact original file: without orig-true ImageKit sends a compressed copy, sometimes in another format
      const source = url.startsWith("/media/") ? IMAGEKIT + key : url.split("?")[0];
      const res = await fetch(source + "?tr=orig-true");
      if (!res.ok) throw new Error("download " + res.status);
      const body = Buffer.from(await res.arrayBuffer());
      const type = (res.headers.get("content-type") || "application/octet-stream").split(";")[0];
      await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: type, CacheControl: "public, max-age=31536000, immutable" }));
      console.log(`[${i}/${found.size}] copied  ${key}  (${(body.length / 1024).toFixed(0)} KB, ${type})`);
    } else console.log(`[${i}/${found.size}] already there  ${key}`);
    done.set(url, "/media/" + key);
  } catch (e) {
    failed.push([url, e.message]); console.log(`[${i}/${found.size}] FAILED  ${url}  ${e.message}`);
  }
}

// 3) point the data at the copies (only the ones that were copied)
const swap = (v) => (typeof v === "string" ? done.get(v) ?? v : Array.isArray(v) ? v.map(swap) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)])) : v);
let changedFiles = 0;
for (const f of files) {
  const before = JSON.stringify(data[f]);
  const next = swap(data[f]);
  if (JSON.stringify(next) !== before) {
    const tmp = path.join(dataDir, f + ".tmp");
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2), "utf8");
    fs.renameSync(tmp, path.join(dataDir, f));
    changedFiles++;
  }
}
console.log(`\nCopied ${done.size}, failed ${failed.length}. Updated ${changedFiles} data files.`);
if (failed.length) console.log("Left pointing at ImageKit:", failed.map(([u]) => u).join("\n  "));
