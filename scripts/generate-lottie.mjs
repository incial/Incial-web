#!/usr/bin/env node
/**
 * Builds the glass Lottie animations in public/lottie/ from the original artwork in
 * public/lottie/images/ (so the gradients and glass texture are exactly the artwork's):
 *
 *   tiles-wave.json     the valley of glass tiles; every tile is its own layer and bobs in a wave
 *   tiles-cluster.json  the scattered tile cluster; it floats and a light glint sweeps across it
 *   glass-ribbon.json   the wave of glass discs; floats, sways, glint
 *   glass-twist.json    the twisted ribbon of glass discs; floats, sways, glint
 *   glass-ring.json     the ring of glass discs; floats, turns gently, glint
 *
 * Every animation loops seamlessly. The tile positions for tiles-wave come from
 * scripts/lottie-tiles-wave-grid.json. Run:  node scripts/generate-lottie.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "lottie");
const IMAGES = join(OUT, "images");
const FPS = 60;
const TAU = Math.PI * 2;
/** Room around the artwork so its movement is never clipped by the canvas edge. */
const PAD = 48;

/** Width and height of a WebP (lossy, lossless or extended), read from its header. */
function webpSize(file) {
  const b = readFileSync(file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8L") {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  throw new Error(`${file} is not a WebP image`);
}

// ── Lottie builders ──────────────────────────────────────────────────────────
const round = (n) => (Math.abs(n) >= 20 ? Math.round(n) : Math.round(n * 100) / 100);
const fixed = (k) => ({ a: 0, k });

/** An animated property sampled from f(phase), phase 0..1 over one loop (the last key repeats the first). */
function looped(steps, op, f) {
  const values = Array.from({ length: steps }, (_, i) => {
    const v = f(i / steps);
    return Array.isArray(v) ? v.map(round) : [round(v)];
  });
  if (values.every((v) => JSON.stringify(v) === JSON.stringify(values[0]))) return fixed(values[0].length === 1 ? values[0][0] : values[0]);
  const keys = values.map((s, i) => ({ t: round((i / steps) * op), s, i: { x: s.map(() => 0.5), y: s.map(() => 0.5) }, o: { x: s.map(() => 0.5), y: s.map(() => 0.5) } }));
  keys.push({ t: op, s: values[0] });
  return { a: 1, k: keys };
}

/** A layer transform; any of position/rotation/scale/opacity may be functions of the loop phase. */
function transform({ anchor, position, rotation = 0, scale = 100, opacity = 100 }, steps, op) {
  const prop = (v, wrap) => (typeof v === "function" ? looped(steps, op, (t) => wrap(v(t))) : fixed(wrap(v)));
  return {
    a: fixed([...anchor, 0]),
    p: prop(position, (p) => [p[0], p[1], 0]),
    r: prop(rotation, (r) => r),
    s: prop(scale, (s) => [s, s, 100]),
    o: prop(opacity, (o) => o),
  };
}

function imageLayer(ind, nm, refId, ks, op, extra = {}) {
  return { ddd: 0, ind, ty: 2, nm, refId, sr: 1, ks, ao: 0, ip: 0, op, st: 0, bm: 0, ...extra };
}

/** A rectangular mask (layer coordinates), so a layer shows just that part of its image. */
function rectMask([x0, y0, x1, y1]) {
  const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  return {
    inv: false,
    mode: "a",
    nm: "Mask",
    pt: fixed({ i: corners.map(() => [0, 0]), o: corners.map(() => [0, 0]), v: corners, c: true }),
    o: fixed(100),
    x: fixed(0),
  };
}

/**
 * The light glint: a soft white band, tilted, that sweeps across once per loop (and rests off to the
 * side the rest of the time). It is shown only through the artwork above it (alpha matte), and it
 * moves with the artwork (parented to the motion layer, in the artwork's own coordinates).
 */
function glintLayer(ind, w, h, steps, op, { sweep = 0.45, strength = 0.5 } = {}) {
  const band = Math.max(w, h) * 0.28;
  const tall = Math.hypot(w, h) * 1.2;
  const shape = {
    ty: "gr",
    nm: "glint",
    np: 2,
    cix: 2,
    bm: 0,
    it: [
      { ty: "rc", nm: "band", d: 1, s: fixed([band, tall]), p: fixed([0, 0]), r: fixed(0) },
      {
        ty: "gf",
        nm: "light",
        o: fixed(100),
        r: 1,
        bm: 0,
        t: 1,
        s: fixed([-band / 2, 0]),
        e: fixed([band / 2, 0]),
        g: { p: 3, k: fixed([0, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0.5, strength, 1, 0]) },
      },
      { ty: "tr", nm: "Transform", p: fixed([0, 0]), a: fixed([0, 0]), s: fixed([100, 100]), r: fixed(24), o: fixed(100), sk: fixed(0), sa: fixed(0) },
    ],
  };
  // eased sweep from beyond the left edge to beyond the right during the first part of the loop
  const ease = (x) => x * x * (3 - 2 * x);
  const position = (t) => {
    const k = t < sweep ? ease(t / sweep) : 1;
    return [-band + k * (w + 2 * band), h / 2];
  };
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: "glint",
    sr: 1,
    ks: transform({ anchor: [0, 0], position }, steps, op),
    ao: 0,
    shapes: [shape],
    ip: 0,
    op,
    st: 0,
    bm: 2, // screen: the glint only lightens
    tt: 1, // alpha matte: shown only where the artwork is
  };
}

function animation(nm, w, h, seconds, assets, layers) {
  return { v: "5.7.4", fr: FPS, ip: 0, op: Math.round(seconds * FPS), w, h, nm, ddd: 0, assets, layers };
}

function asset(name) {
  const [w, h] = webpSize(join(IMAGES, `${name}.webp`));
  return { id: `img_${name}`, w, h, u: "images/", p: `${name}.webp`, e: 0 };
}

// ── the animations ───────────────────────────────────────────────────────────

/**
 * One piece of artwork that floats and sways, with a glint sweeping across it. Layers, top first:
 * the artwork as a matte (not drawn itself), the glint shown through it, the artwork, and an
 * invisible layer carrying the same motion for the glint to follow.
 */
function floating(name, { seconds = 8, steps = 32, drift = [10, 14], sway = 2, breathe = 1.5, glint = {} } = {}) {
  const img = asset(name);
  const w = img.w + PAD * 2;
  const h = img.h + PAD * 2;
  const op = Math.round(seconds * FPS);
  const motion = {
    anchor: [img.w / 2, img.h / 2],
    position: (t) => [w / 2 + drift[0] * Math.sin(TAU * t), h / 2 + drift[1] * Math.sin(TAU * t * 2 + 0.6)],
    rotation: (t) => sway * Math.sin(TAU * t + 1.1),
    scale: (t) => 100 + breathe * Math.sin(TAU * t + 2.2),
  };
  const ks = () => transform(motion, steps, op);
  const layers = [
    imageLayer(1, `${name} (matte)`, img.id, ks(), op, { td: 1 }),
    { ...glintLayer(2, img.w, img.h, steps, op, glint), parent: 4 },
    imageLayer(3, name, img.id, ks(), op),
    { ddd: 0, ind: 4, ty: 3, nm: "motion", sr: 1, ks: ks(), ao: 0, ip: 0, op, st: 0, bm: 0 },
  ];
  return animation(name, w, h, seconds, [img], layers);
}

/** The valley of tiles: each tile is its own layer (a masked square of the artwork) bobbing in a wave. */
function tilesWave() {
  const name = "tiles-wave";
  const img = asset(name);
  const grid = JSON.parse(readFileSync(join(ROOT, "scripts", "lottie-tiles-wave-grid.json"), "utf8"));
  const [pitchX, pitchY] = grid.pitch;
  const seconds = 6;
  const steps = 20;
  const op = seconds * FPS;
  const w = img.w + PAD * 2;
  const h = img.h + PAD * 2;
  const layers = grid.cells.map(([x0, y0, col, row], i) => {
    const cx = x0 + pitchX / 2;
    const cy = y0 + pitchY / 2;
    // a wave running left to right through the valley, a little later on each lower row
    const phase = col / 10 + row * 0.035;
    const bob = (t) => Math.sin(TAU * (t - phase));
    const ks = transform(
      {
        anchor: [cx, cy],
        position: (t) => [cx + PAD, cy + PAD - 9 * Math.max(0, bob(t)) ** 2],
        scale: (t) => 100 + 2.2 * Math.max(0, bob(t)),
        opacity: (t) => 88 + 12 * (0.5 + 0.5 * bob(t)),
      },
      steps,
      op,
    );
    return imageLayer(i + 1, `tile ${col},${row}`, img.id, ks, op, { hasMask: true, masksProperties: [rectMask([x0, y0, x0 + pitchX, y0 + pitchY])] });
  });
  return animation(name, w, h, seconds, [img], layers);
}

/**
 * The tile matrix (after the DataLabs cover): a staircase of glass tiles stepping down from the top
 * right corner. Every tile is its own layer cut from the tiles-wave artwork; the deepest tiles go
 * where the matrix is darkest and pale ones toward its fringe. A soft wave pulses out from the corner,
 * lifting each tile as it passes, and the loose tiles on the staircase edge blink now and then.
 */
function tilesMatrix() {
  const name = "tiles-matrix";
  const img = asset("tiles-wave");
  const grid = JSON.parse(readFileSync(join(ROOT, "scripts", "lottie-tiles-wave-grid.json"), "utf8"));
  const [pitchX, pitchY] = grid.pitch;
  const size = 150;
  const seconds = 8;
  const steps = 20;
  const op = seconds * FPS;
  // which columns each row holds (10 x 8), as in the reference
  const rows = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 2, 5, 6, 7, 8, 9],
    [6, 7, 8, 9],
    [7, 8, 9],
    [8, 9],
  ];
  const cells = rows.flatMap((cols, row) => cols.map((col) => ({ col, row })));
  const has = (col, row) => rows[row]?.includes(col) ?? false;
  // how deep each cell should be: darkest a little right of centre near the top, paler outward
  const heat = ({ col, row }) => Math.exp(-(((col - 6.2) / 2.8) ** 2) - (((row - 2.4) / 2.2) ** 2));
  const byHeat = [...cells].sort((a, b) => heat(a) - heat(b));
  const sources = [...grid.cells].sort((a, b) => a[4] - b[4]);
  const sourceFor = new Map(byHeat.map((cell, i) => [cell, sources[Math.round((i / (byHeat.length - 1)) * (sources.length - 1))]]));

  // the matrix's grid carries on past the tiles as outline cells (no fill), three rows further down
  const totalRows = rows.length + 3;
  const w = 10 * size + PAD * 2;
  const h = totalRows * size + PAD * 2;
  const tileLayers = cells.map((cell, i) => {
    const [sx, sy] = sourceFor.get(cell);
    const scx = sx + pitchX / 2;
    const scy = sy + pitchY / 2;
    const dx = PAD + cell.col * size + size / 2;
    const dy = PAD + cell.row * size + size / 2;
    // the wave starts at the top right corner and runs outward
    const phase = Math.hypot(9 - cell.col, cell.row) / 11;
    const wave = (t) => Math.sin(TAU * (t - phase));
    // a tile on the edge of the staircase (a missing neighbour) blinks once per loop
    const edge = !has(cell.col - 1, cell.row) || !has(cell.col, cell.row + 1);
    const blinkAt = (i * 0.618) % 1;
    const blink = (t) => (edge ? Math.max(0, Math.cos(TAU * (t - blinkAt))) ** 14 : 0);
    const ks = transform(
      {
        anchor: [scx, scy],
        position: (t) => [dx, dy - 4 * Math.max(0, wave(t))],
        scale: (t) => (size / pitchX) * (100 + 2.5 * Math.max(0, wave(t))),
        opacity: (t) => (84 + 16 * (0.5 + 0.5 * wave(t))) * (1 - 0.65 * blink(t)),
      },
      steps,
      op,
    );
    return imageLayer(i + 1, `tile ${cell.col},${cell.row}`, img.id, ks, op, { hasMask: true, masksProperties: [rectMask([sx, sy, sx + pitchX, sy + pitchY])] });
  });

  // the outline cells: every empty cell of the grid, a rounded square drawn only as a dark-blue
  // gradient line, strongest beside the tiles and fading out with distance; they pulse with the wave
  const outlines = [];
  for (let row = 0; row < totalRows; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      if (has(col, row)) continue;
      const nearest = Math.min(...cells.map((cell) => Math.hypot(cell.col - col, cell.row - row)));
      const strength = Math.max(0, 1 - (nearest - 1) / 3.5);
      if (strength < 0.08) continue;
      const phase = Math.hypot(9 - col, row) / 11;
      const inset = 4;
      outlines.push({
        ty: "gr",
        nm: `cell ${col},${row}`,
        np: 2,
        cix: 2,
        bm: 0,
        it: [
          { ty: "rc", nm: "cell", d: 1, s: fixed([size - inset * 2, size - inset * 2]), p: fixed([0, 0]), r: fixed(16) },
          {
            ty: "gs",
            nm: "line",
            o: fixed(100),
            w: fixed(2.5),
            lc: 2,
            lj: 2,
            ml: 4,
            bm: 0,
            t: 1,
            s: fixed([-size / 2, -size / 2]),
            e: fixed([size / 2, size / 2]),
            g: { p: 3, k: fixed([0, 0.32, 0.55, 1, 0.5, 0.04, 0.27, 0.86, 1, 0.02, 0.13, 0.48, 0, 1, 0.5, 1, 1, 1]) },
          },
          {
            ty: "tr",
            nm: "Transform",
            p: fixed([PAD + col * size + size / 2, PAD + row * size + size / 2]),
            a: fixed([0, 0]),
            s: fixed([100, 100]),
            r: fixed(0),
            o: looped(steps, op, (t) => 100 * strength * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(TAU * (t - phase))))),
            sk: fixed(0),
            sa: fixed(0),
          },
        ],
      });
    }
  }
  const outlineLayer = {
    ddd: 0,
    ind: tileLayers.length + 1,
    ty: 4,
    nm: "grid",
    sr: 1,
    ks: transform({ anchor: [0, 0], position: [0, 0] }, steps, op),
    ao: 0,
    shapes: outlines,
    ip: 0,
    op,
    st: 0,
    bm: 0,
  };
  // the tiles are drawn over the outline grid
  return animation(name, w, h, seconds, [img], [...tileLayers, outlineLayer]);
}

const files = {
  "tiles-wave.json": tilesWave(),
  "tiles-matrix.json": tilesMatrix(),
  "tiles-cluster.json": floating("tiles-cluster", { seconds: 7, drift: [8, 12], sway: 1.2, breathe: 1.2, glint: { sweep: 0.5, strength: 0.45 } }),
  "glass-ribbon.json": floating("glass-ribbon", { seconds: 6, drift: [0, 0], sway: 0, breathe: 0, glint: { sweep: 0.55, strength: 0.6 } }),
  "glass-twist.json": floating("glass-twist", { seconds: 8, drift: [12, 18], sway: 3, glint: { sweep: 0.4, strength: 0.55 } }),
  "glass-ring.json": floating("glass-ring", { seconds: 7, drift: [0, 0], sway: 0, breathe: 0, glint: { sweep: 0.55, strength: 0.6 } }),
};

for (const [file, data] of Object.entries(files)) {
  const json = JSON.stringify(data);
  writeFileSync(join(OUT, file), json);
  console.log(`${file.padEnd(20)} ${(json.length / 1024).toFixed(0)} KB  (${data.w}x${data.h}, ${data.layers.length} layers)`);
}
