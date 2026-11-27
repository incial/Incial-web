"use client";

import { useEffect, useRef } from "react";
import { Camera, Geometry, Mat4, Mesh, Program, Renderer, Transform, Vec3 } from "ogl";

export interface GlassPathPoint {
  /** Normalized X coordinate in [0, 1] (0 = left, 1 = right). */
  x: number;
  /** Normalized Y coordinate in [0, 1] (0 = top, 1 = bottom). */
  y: number;
}

export interface GlassTwistProps {
  /** Sizing and positioning classes for the container. */
  className?: string;
  /** Number of curved glass discs along the path. Default: 36. */
  bladeCount?: number;
  /** Continuous flow speed multiplier. Default: 1. */
  speed?: number;
  /** Enable individual per-blade hover interaction. Default: true. */
  interactive?: boolean;
  /** Render a static frame with no animation. Default: false. */
  still?: boolean;
  /** Optional custom path (normalized 0..1 coordinates) for the blades to follow. */
  path?: GlassPathPoint[];
  /** Optional solid background color; defaults to transparent so it composites over any surface. */
  background?: string;
}

interface TwistBlade {
  anchor: Transform;
  backMesh: Mesh;
  frontMesh: Mesh;
  phaseOffset: number;
  hover: number;
  smoke: number;
  blueShift: number;
  fade: number;
  viewZ: number;
}

interface ResampledPoint {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

const DEFAULT_PATH: GlassPathPoint[] = [
  { x: -0.18, y: 0.28 },
  { x: 0.08, y: 0.36 },
  { x: 0.35, y: 0.48 },
  { x: 0.65, y: 0.56 },
  { x: 0.92, y: 0.64 },
  { x: 1.18, y: 0.72 },
];

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  attribute float aEdge;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying float vEdge;

  void main() {
    vEdge = aEdge;
    vLocalPos = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying float vEdge;

  uniform float uSmoke;
  uniform float uBlueShift;
  uniform float uBladeHover;
  uniform float uFade;
  uniform float uIsFront;

  vec3 sampleStudioEnv(vec3 dir) {
    vec3 d = normalize(dir);
    vec3 col = vec3(0.0);

    vec3 keyDir = normalize(vec3(-0.35, 0.88, 0.32));
    float keySoft = smoothstep(0.40, 0.94, dot(d, keyDir));
    float keySharp = smoothstep(0.85, 0.995, dot(d, keyDir));
    col += vec3(0.95, 0.98, 1.0) * (keySoft * 0.72 + keySharp * 1.15);

    vec3 blueDir1 = normalize(vec3(-0.72, -0.22, 0.65));
    float blueLobe1 = pow(max(dot(d, blueDir1), 0.0), 2.6);
    col += vec3(0.0, 0.24, 0.95) * blueLobe1 * 1.35;

    vec3 blueDir2 = normalize(vec3(0.75, 0.16, 0.64));
    float blueLobe2 = pow(max(dot(d, blueDir2), 0.0), 3.2);
    col += vec3(0.02, 0.34, 0.98) * blueLobe2 * 1.05;

    return col;
  }

  void main() {
    vec3 V = normalize(vViewPos);
    vec3 N = normalize(gl_FrontFacing ? vNormal : -vNormal);

    float ndotv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 3.2);
    float sharpFresnel = pow(1.0 - ndotv, 7.2);

    float radial = clamp(length(vLocalPos.xy) / 0.68, 0.0, 1.0);
    float bowlDepth = clamp(vLocalPos.z / 0.16, 0.0, 1.0);
    float innerMask = clamp(0.54 - (vLocalPos.x * 0.50 + vLocalPos.y * 0.35) + (1.0 - radial) * 0.32 + uBlueShift * 0.25, 0.0, 1.0);

    vec3 deepNavy   = vec3(0.00, 0.10, 0.58);
    vec3 royalBlue  = vec3(0.00, 0.24, 0.88);
    vec3 azureBlue  = vec3(0.02, 0.38, 0.98);
    vec3 iceWhite   = vec3(0.88, 0.91, 0.96);
    vec3 pureWhite  = vec3(1.00, 1.00, 1.00);

    vec3 blueCore = mix(deepNavy, royalBlue, 0.40 + bowlDepth * 0.50);
    blueCore = mix(blueCore, azureBlue, smoothstep(0.40, 0.95, radial) * 0.60);
    vec3 whiteOuter = mix(iceWhite, pureWhite, smoothstep(0.20, 0.88, radial));

    vec3 clearGlassColor = mix(whiteOuter, blueCore, smoothstep(0.16, 0.82, innerMask));
    vec3 obsidianBody = mix(vec3(0.015, 0.02, 0.032), vec3(0.08, 0.11, 0.16), fresnel * 0.60);

    vec3 bodyColor = mix(clearGlassColor, obsidianBody, uSmoke);

    vec3 R = reflect(-V, N);
    vec3 envReflect = sampleStudioEnv(R);

    vec3 L1 = normalize(vec3(-0.46, 0.80, 0.60));
    vec3 L2 = normalize(vec3(0.70, -0.35, 0.68));
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);

    float spec1 = pow(max(dot(N, H1), 0.0), 110.0);
    float spec2 = pow(max(dot(N, H2), 0.0), 48.0);
    float sheen = pow(max(dot(N, H1), 0.0), 7.5);

    float faceWeight = mix(0.82, 1.08, uIsFront);
    vec3 color = bodyColor * (0.90 + 0.25 * ndotv) * faceWeight;

    color += royalBlue * (1.0 - uSmoke) * innerMask * (0.36 + bowlDepth * 0.34) * (1.0 + uBladeHover * 0.55);

    vec3 reflectTint = mix(vec3(0.68, 0.84, 1.0), vec3(0.80, 0.88, 0.96), uSmoke);
    color += envReflect * reflectTint * (0.08 + fresnel * (0.62 + uBladeHover * 0.30)) * faceWeight;

    color += mix(pureWhite, azureBlue, innerMask * (1.0 - uSmoke)) * sheen * (0.18 * (1.0 - uSmoke * 0.68)) * uIsFront;

    float rimLight = 0.28 + 0.72 * max(dot(N, L1), 0.0);
    float bevelEdge = smoothstep(0.90, 0.995, vEdge);
    float glassRim = clamp(sharpFresnel * 0.95 + bevelEdge * (0.22 + fresnel * 0.65), 0.0, 1.15) * rimLight;
    vec3 blueRimColor = mix(vec3(0.02, 0.28, 0.95), vec3(0.86, 0.90, 0.98), sharpFresnel * 0.45);
    vec3 blackRimColor = vec3(0.76, 0.82, 0.90);
    vec3 rimColor = mix(blueRimColor, blackRimColor, uSmoke);
    color += rimColor * glassRim * (0.60 + uBladeHover * 0.45);

    color += vec3(0.98, 0.99, 1.0) * spec1 * (1.15 * uIsFront + 0.30 * (1.0 - uIsFront));
    color += vec3(0.08, 0.36, 0.98) * spec2 * 0.45 * (1.0 - uSmoke * 0.5);

    float baseAlpha = mix(0.34 + innerMask * 0.26, 0.66, uSmoke) * mix(0.60, 1.0, uIsFront);
    float alpha = baseAlpha + fresnel * 0.36 + bevelEdge * 0.30 + spec1 * 0.22;

    float edgeFeather = 1.0 - smoothstep(0.975, 1.0, vEdge) * 0.18;
    alpha = clamp(alpha * edgeFeather * uFade, 0.0, 0.94);

    gl_FragColor = vec4(color, alpha);
  }
`;

function createCurvedDiscGeometry(gl: Renderer["gl"]): Geometry {
  const radialSegs = 14;
  const angularSegs = 68;
  const radius = 0.68;
  const dome = 0.16;
  const halfThick = 0.020;

  const positions: number[] = [];
  const normals: number[] = [];
  const edges: number[] = [];
  const indices: number[] = [];

  const pushVertex = (x: number, y: number, z: number, nx: number, ny: number, nz: number, edge: number) => {
    positions.push(x, y, z);
    const len = Math.hypot(nx, ny, nz) || 1;
    normals.push(nx / len, ny / len, nz / len);
    edges.push(edge);
  };

  const addCap = (side: 1 | -1) => {
    const baseIndex = positions.length / 3;
    const centerZ = side * halfThick + dome;
    pushVertex(0, 0, centerZ, 0, 0, side, 0);

    for (let r = 1; r <= radialSegs; r++) {
      const t = r / radialSegs;
      const rho = t * radius;
      const taper = Math.sqrt(Math.max(0.24, 1 - Math.pow(t, 6) * 0.7));
      const zCurve = dome * (1 - t * t);
      const z = zCurve + side * halfThick * taper;
      const dzdr = (-2 * dome * t) / radius;

      for (let a = 0; a <= angularSegs; a++) {
        const phi = (a / angularSegs) * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);
        const x = rho * cosP;
        const y = rho * sinP;

        const nx = -dzdr * cosP * side;
        const ny = -dzdr * sinP * side;
        const nz = side;
        const edgeFactor = Math.pow(t, 3.8) * 0.74;
        pushVertex(x, y, z, nx, ny, nz, edgeFactor);
      }
    }

    const ringStride = angularSegs + 1;
    for (let a = 0; a < angularSegs; a++) {
      if (side === 1) {
        indices.push(baseIndex, baseIndex + 1 + a, baseIndex + 1 + a + 1);
      } else {
        indices.push(baseIndex, baseIndex + 1 + a + 1, baseIndex + 1 + a);
      }
    }
    for (let r = 1; r < radialSegs; r++) {
      const row0 = baseIndex + 1 + (r - 1) * ringStride;
      const row1 = baseIndex + 1 + r * ringStride;
      for (let a = 0; a < angularSegs; a++) {
        const i0 = row0 + a;
        const i1 = row0 + a + 1;
        const i2 = row1 + a;
        const i3 = row1 + a + 1;
        if (side === 1) {
          indices.push(i0, i2, i1, i1, i2, i3);
        } else {
          indices.push(i0, i1, i2, i1, i3, i2);
        }
      }
    }
  };

  addCap(1);
  addCap(-1);

  const rimSegs = 5;
  const rimBase = positions.length / 3;
  const rimStride = angularSegs + 1;
  const rimHalfT = halfThick * Math.sqrt(0.28);

  for (let s = 0; s <= rimSegs; s++) {
    const v = s / rimSegs;
    const theta = (v - 0.5) * Math.PI;
    const rOut = radius + Math.cos(theta) * (rimHalfT * 1.15);
    const zOut = -Math.sin(theta) * rimHalfT;

    for (let a = 0; a <= angularSegs; a++) {
      const phi = (a / angularSegs) * Math.PI * 2;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const nx = cosP * Math.cos(theta);
      const ny = sinP * Math.cos(theta);
      const nz = -Math.sin(theta);
      pushVertex(rOut * cosP, rOut * sinP, zOut, nx, ny, nz, 1.0);
    }
  }

  for (let s = 0; s < rimSegs; s++) {
    const row0 = rimBase + s * rimStride;
    const row1 = rimBase + (s + 1) * rimStride;
    for (let a = 0; a < angularSegs; a++) {
      const i0 = row0 + a;
      const i1 = row0 + a + 1;
      const i2 = row1 + a;
      const i3 = row1 + a + 1;
      indices.push(i0, i1, i2, i1, i3, i2);
    }
  }

  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    normal: { size: 3, data: new Float32Array(normals) },
    aEdge: { size: 1, data: new Float32Array(edges) },
    index: { data: new Uint16Array(indices) },
  });
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * Converts normalized [0,1] control points into an arc-length-parameterized lookup table
 * with smooth Catmull-Rom tangents so blades glide at constant speed along any drawn path.
 */
function buildArcLengthPath(points: GlassPathPoint[], samples = 160): ResampledPoint[] {
  const pts = points.length >= 2 ? points : DEFAULT_PATH;
  const n = pts.length;
  const raw: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= samples; i++) {
    const u = (i / samples) * (n - 1);
    const idx = Math.min(n - 2, Math.floor(u));
    const localT = u - idx;
    const p0 = pts[Math.max(0, idx - 1)];
    const p1 = pts[idx];
    const p2 = pts[Math.min(n - 1, idx + 1)];
    const p3 = pts[Math.min(n - 1, idx + 2)];
    raw.push({
      x: catmullRom(p0.x, p1.x, p2.x, p3.x, localT),
      y: catmullRom(p0.y, p1.y, p2.y, p3.y, localT),
    });
  }

  const lengths: number[] = [0];
  let total = 0;
  for (let i = 1; i < raw.length; i++) {
    total += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
    lengths.push(total);
  }
  if (total < 1e-5) total = 1;

  const result: ResampledPoint[] = [];
  let j = 0;
  for (let i = 0; i <= samples; i++) {
    const targetLen = (i / samples) * total;
    while (j < lengths.length - 2 && lengths[j + 1] < targetLen) j++;
    const segLen = Math.max(1e-6, lengths[j + 1] - lengths[j]);
    const frac = (targetLen - lengths[j]) / segLen;
    const x = raw[j].x + (raw[j + 1].x - raw[j].x) * frac;
    const y = raw[j].y + (raw[j + 1].y - raw[j].y) * frac;
    result.push({ x, y, tx: 1, ty: 0 });
  }

  for (let i = 0; i < result.length; i++) {
    const prev = result[Math.max(0, i - 1)];
    const next = result[Math.min(result.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    result[i].tx = dx / len;
    result[i].ty = dy / len;
  }

  return result;
}

function samplePath(table: ResampledPoint[], s: number): ResampledPoint {
  const clamped = Math.max(0, Math.min(1, s));
  const f = clamped * (table.length - 1);
  const idx = Math.min(table.length - 2, Math.floor(f));
  const t = f - idx;
  const a = table[idx];
  const b = table[idx + 1];
  const tx = a.tx + (b.tx - a.tx) * t;
  const ty = a.ty + (b.ty - a.ty) * t;
  const len = Math.hypot(tx, ty) || 1;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    tx: tx / len,
    ty: ty / len,
  };
}

function getContinuousStyle(s: number): { smoke: number; blueShift: number } {
  const angle = s * Math.PI * 2;
  const smokeWave = Math.sin(angle * 2.0 + 0.8);
  const smoke = Math.max(0, Math.min(1, (smokeWave - 0.35) * 2.6));
  const blueShift = Math.cos(angle * 2.0) * 0.35;
  return { smoke, blueShift };
}

/**
 * Full-bleed, continuous-flow 3D twisted glass helix sculpture built with OGL.
 * Fills its entire container without fixed dimensions, streams blades seamlessly
 * along either the default full-page S-curve or any custom drawn `path`, and
 * supports individual per-blade hover interaction.
 */
export default function GlassTwist({
  className = "",
  bladeCount = 36,
  speed = 1,
  interactive = true,
  still = false,
  path,
  background,
}: GlassTwistProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathTableRef = useRef<ResampledPoint[]>(buildArcLengthPath(path && path.length >= 2 ? path : DEFAULT_PATH));
  const hasCustomPathRef = useRef<boolean>(Boolean(path && path.length >= 2));

  useEffect(() => {
    const custom = Boolean(path && path.length >= 2);
    hasCustomPathRef.current = custom;
    pathTableRef.current = buildArcLengthPath(custom && path ? path : DEFAULT_PATH);
  }, [path]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isStatic = still || reduced;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      return;
    }

    const { gl } = renderer;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(gl.canvas);

    const fovDeg = 34;
    const camZ = 7.2;
    const camera = new Camera(gl, { fov: fovDeg, near: 0.1, far: 40 });
    camera.position.set(0, 0, camZ);

    const root = new Transform();
    const twistGroup = new Transform();
    twistGroup.setParent(root);

    const geometry = createCurvedDiscGeometry(gl);

    const sharedUniforms = () => ({
      uSmoke: { value: 0 },
      uBlueShift: { value: 0 },
      uBladeHover: { value: 0 },
      uFade: { value: 1 },
    });

    const backProgram = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: { ...sharedUniforms(), uIsFront: { value: 0 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: gl.FRONT,
    });

    const frontProgram = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: { ...sharedUniforms(), uIsFront: { value: 1 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: gl.BACK,
    });

    const blades: TwistBlade[] = [];

    for (let i = 0; i < bladeCount; i++) {
      const phaseOffset = i / bladeCount;
      const anchor = new Transform();
      anchor.setParent(twistGroup);

      const backMesh = new Mesh(gl, { geometry, program: backProgram });
      const frontMesh = new Mesh(gl, { geometry, program: frontProgram });
      backMesh.setParent(anchor);
      frontMesh.setParent(anchor);

      const blade: TwistBlade = {
        anchor,
        backMesh,
        frontMesh,
        phaseOffset,
        hover: 0,
        smoke: 0,
        blueShift: 0,
        fade: 1,
        viewZ: 0,
      };

      backMesh.onBeforeRender(() => {
        backProgram.uniforms.uSmoke.value = blade.smoke;
        backProgram.uniforms.uBlueShift.value = blade.blueShift;
        backProgram.uniforms.uBladeHover.value = blade.hover;
        backProgram.uniforms.uFade.value = blade.fade;
      });

      frontMesh.onBeforeRender(() => {
        frontProgram.uniforms.uSmoke.value = blade.smoke;
        frontProgram.uniforms.uBlueShift.value = blade.blueShift;
        frontProgram.uniforms.uBladeHover.value = blade.hover;
        frontProgram.uniforms.uFade.value = blade.fade;
      });

      blades.push(blade);
    }

    let worldHalfW = 3.5;
    let worldHalfH = 2.2;

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      const aspect = width / height;
      renderer.setSize(width, height);
      camera.perspective({ aspect });
      worldHalfH = Math.tan(((fovDeg * Math.PI) / 180) * 0.5) * camZ;
      worldHalfW = worldHalfH * aspect;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const pointerNdc = { x: 0, y: 0, active: false };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointerNdc.active = true;
    };

    const onPointerLeave = () => {
      pointerNdc.active = false;
    };

    if (interactive && !isStatic) {
      container.addEventListener("pointermove", onPointerMove, { passive: true });
      container.addEventListener("pointerleave", onPointerLeave);
    }

    const centroid = new Vec3();
    const ndcPos = new Vec3();
    const viewMat = new Mat4();
    const projViewMat = new Mat4();

    let flowOffset = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let visible = true;

    const renderFrame = (now: number) => {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0.0001, (now - lastTime) / 1000));
      lastTime = now;

      if (!isStatic) {
        flowOffset = (flowOffset + dt * speed * 0.055) % 1;
      }

      const hoverEase = 1 - Math.exp(-12.0 * dt);
      const table = pathTableRef.current;
      const isCustom = hasCustomPathRef.current;

      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];
        const s = (blade.phaseOffset + flowOffset) % 1;
        const pt = samplePath(table, s);
        const { smoke, blueShift } = getContinuousStyle(s);
        blade.smoke = smoke;
        blade.blueShift = blueShift;

        // Seamless fade at the endpoints for custom paths; default path runs off-screen
        blade.fade = isCustom
          ? Math.min(1, s / 0.08) * Math.min(1, (1 - s) / 0.08)
          : Math.min(1, s / 0.04) * Math.min(1, (1 - s) / 0.04);

        const h = blade.hover;
        const wx = (pt.x * 2 - 1) * worldHalfW;
        const wy = (1 - pt.y * 2) * worldHalfH;

        const helixAngle = s * Math.PI * 4.0;
        const nx = -pt.ty;
        const ny = pt.tx;
        const offsetMag = Math.sin(helixAngle) * (isCustom ? 0.015 : 0.14);

        blade.anchor.position.set(
          wx + nx * offsetMag,
          wy + ny * offsetMag + h * 0.10,
          Math.cos(helixAngle) * (isCustom ? 0.16 : 0.24) + h * 0.16,
        );

        const worldTx = pt.tx * worldHalfW;
        const worldTy = -pt.ty * worldHalfH;
        const pathAngle = Math.atan2(worldTy, worldTx);
        const roll = s * Math.PI * 2.0 * 2.0 + h * 0.42;
        const viewAngle = Math.atan2(wx, camZ);

        blade.anchor.rotation.order = "YXZ";
        blade.anchor.rotation.y = 0.58 - viewAngle - h * 0.20;
        blade.anchor.rotation.x = 0.22 + Math.sin(helixAngle) * 0.14;
        blade.anchor.rotation.z = pathAngle + roll;

        const scaleBase = Math.min(1.35, Math.max(0.75, worldHalfH * 0.44));
        const bladeScale = scaleBase * (1 + h * 0.14);
        blade.anchor.scale.set(0.78 * bladeScale, 1.22 * bladeScale, bladeScale);
      }

      root.updateMatrixWorld(true);
      viewMat.copy(camera.viewMatrix);
      projViewMat.multiply(camera.projectionMatrix, viewMat);

      let closestIdx = -1;
      let closestDist = 0.24;

      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];
        centroid.set(0, 0, 0.08);
        centroid.applyMatrix4(blade.anchor.worldMatrix);

        if (interactive && !isStatic && pointerNdc.active) {
          ndcPos.copy(centroid).applyMatrix4(projViewMat);
          const dist = Math.hypot(ndcPos.x - pointerNdc.x, ndcPos.y - pointerNdc.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }

        centroid.applyMatrix4(viewMat);
        blade.viewZ = centroid.z;
      }

      if (!isStatic) {
        for (let i = 0; i < blades.length; i++) {
          const targetHover = i === closestIdx ? 1 : 0;
          blades[i].hover += (targetHover - blades[i].hover) * hoverEase;
        }
      }

      blades.sort((a, b) => a.viewZ - b.viewZ);
      for (let i = 0; i < blades.length; i++) {
        blades[i].backMesh.renderOrder = i * 2;
        blades[i].frontMesh.renderOrder = i * 2 + 1;
      }

      renderer.render({ scene: root, camera });

      if (!isStatic && visible) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !rafId && !isStatic) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(renderFrame);
        } else if (!visible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(container);

    renderFrame(performance.now());

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
      geometry.remove();
      backProgram.remove();
      frontProgram.remove();
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
    };
  }, [bladeCount, speed, interactive, still]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={background ? { background } : undefined}
      className={`relative select-none ${className}`}
    />
  );
}
