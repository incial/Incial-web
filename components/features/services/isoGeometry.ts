/** Shared geometry for the Incial logo stage (SVG layer and dust layer must agree). */

/**
 * The stage is drawn in its own units. Wide screens use the split layout (stack left, text
 * right); phones and portrait tablets use the stacked one (stack above, text below).
 */
export interface StageSpec {
  viewW: number;
  viewH: number;
  /** Horizontal centre of the isometric stack. */
  stackX: number;
  /** Centre of the stage, where the flat dust logo starts (when there is no logo to sample). */
  centerX: number;
  centerY: number;
}

export const SPLIT_SPEC: StageSpec = { viewW: 860, viewH: 560, stackX: 285, centerX: 430, centerY: 280 };
export const STACKED_SPEC: StageSpec = { viewW: 520, viewH: 560, stackX: 260, centerX: 260, centerY: 280 };

/** Isometric stack: base slab, one plate per service, logo lid on top. */
export const STACK_CY = 300;
export const SLAB_SIDE = 170;
export const SLAB_RADIUS = 30;
export const SLAB_THICKNESS = 16;
export const PLATE_SIDE = 140;
export const PLATE_RADIUS = 26;
export const PLATE_THICKNESS = 8;
export const PLATE_SPACING = 32;
export const BASE_LID_GAP = PLATE_SPACING * 1.5;
export const LOGO_SCALE = 1.45;

const COS45 = Math.SQRT1_2;

/** Maps slab-plane coordinates (u, v) around (cx, cy) to the isometric screen position. */
export function planeToScreen(u: number, v: number, cx: number, cy: number): [number, number] {
  return [cx + (u - v) * COS45, cy + (u + v) * COS45 * 0.5];
}

/** Vertical layout of the stack when `revealed` plates are open. */
export function stackLayout(revealed: number) {
  const baseY = STACK_CY + (revealed * PLATE_SPACING) / 2 + 13;
  return {
    baseY,
    lidY: baseY - BASE_LID_GAP - revealed * PLATE_SPACING,
    plateY: (k: number) => baseY - (k + 1) * PLATE_SPACING,
  };
}

/** SVG paths of the Incial logo mark, in a ±40 coordinate box. */
export const LOGO_PATHS = {
  dot: { cx: -22, cy: -27, r: 17 },
  lower: "M-39 40 V27 A30 30 0 0 1 -9 -3 H-4 V40 Z",
  tall: "M2 40 V-40 A38 38 0 0 1 40 -2 V40 Z",
} as const;

export function insideLogo(x: number, y: number): boolean {
  const { cx, cy, r } = LOGO_PATHS.dot;
  if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) return true;

  if (x >= -39 && x <= -4 && y >= -3 && y <= 40) {
    if (x < -9 && y < 27) return (x + 9) ** 2 + (y - 27) ** 2 <= 30 * 30;
    return true;
  }

  if (x >= 2 && x <= 40 && y >= -40 && y <= 40) {
    if (y < -2) return (x - 2) ** 2 + (y + 2) ** 2 <= 38 * 38;
    return true;
  }
  return false;
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smoothstep = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
