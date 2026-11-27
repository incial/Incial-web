"use client";

import { useEffect, useRef } from "react";
import { Camera, Geometry, Mat4, Mesh, Program, Renderer, Transform, Vec3 } from "ogl";

export interface GlassTorusProps {
  /** Sizing and positioning classes for the container. */
  className?: string;
  /** Number of curved glass discs around the torus ring. Default: 34. */
  bladeCount?: number;
  /** Overall animation speed multiplier. Default: 1. */
  speed?: number;
  /** Enable per-blade hover interaction and studio-light refraction. Default: true. */
  interactive?: boolean;
  /** Render a static frame with no animation. Default: false. */
  still?: boolean;
  /** Rotate the ring as the page scrolls (degrees per viewport height). Default: 0. */
  scrollSpin?: number;
  /** Optional solid background color; defaults to transparent so it composites over any surface. */
  background?: string;
}

interface BladeInstance {
  anchor: Transform;
  backMesh: Mesh;
  frontMesh: Mesh;
  baseAngle: number;
  smoke: number;
  blueShift: number;
  hover: number;
  viewZ: number;
}

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
  uniform float uIsFront;
  uniform vec2 uPointer;

  vec3 sampleStudioEnv(vec3 dir, vec2 pointer) {
    vec3 d = normalize(dir);
    vec3 col = vec3(0.0);

    vec3 keyDir = normalize(vec3(-0.35 + pointer.x * 0.35, 0.88 - pointer.y * 0.28, 0.32));
    float keySoft = smoothstep(0.42, 0.94, dot(d, keyDir));
    float keySharp = smoothstep(0.86, 0.995, dot(d, keyDir));
    col += vec3(0.95, 0.98, 1.0) * (keySoft * 0.70 + keySharp * 1.15);

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
    float sharpFresnel = pow(1.0 - ndotv, 7.5);

    float radial = clamp(length(vLocalPos.xy) / 0.64, 0.0, 1.0);
    float bowlDepth = clamp(vLocalPos.z / 0.16, 0.0, 1.0);
    float innerMask = clamp(0.54 - (vLocalPos.x * 0.55 + vLocalPos.y * 0.35) + (1.0 - radial) * 0.32 + uBlueShift * 0.25, 0.0, 1.0);

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
    vec3 envReflect = sampleStudioEnv(R, uPointer);

    vec3 L1 = normalize(vec3(-0.46 + uPointer.x * 0.40, 0.80 - uPointer.y * 0.34, 0.60));
    vec3 L2 = normalize(vec3(0.70 - uPointer.x * 0.25, -0.35, 0.68));
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

    float baseAlpha = mix(0.32 + innerMask * 0.26, 0.64, uSmoke) * mix(0.60, 1.0, uIsFront);
    float alpha = baseAlpha + fresnel * 0.36 + bevelEdge * 0.30 + spec1 * 0.22;

    float edgeFeather = 1.0 - smoothstep(0.975, 1.0, vEdge) * 0.18;
    alpha = clamp(alpha * edgeFeather, 0.0, 0.94);

    gl_FragColor = vec4(color, alpha);
  }
`;

function createCurvedDiscGeometry(gl: Renderer["gl"], lowDetail = false): Geometry {
  const radialSegs = lowDetail ? 10 : 14;
  const angularSegs = lowDetail ? 44 : 68;
  const radius = 0.64;
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

function getBladeStyle(t: number): { smoke: number; blueShift: number } {
  const angle = t * Math.PI * 2;
  const smokeWave = Math.sin(angle * 3.0 + 0.65) * 0.72 + Math.cos(angle * 2.0 - 0.9) * 0.28;
  const smoke = Math.max(0, Math.min(1, (smokeWave - 0.32) * 3.2));
  const blueShift = Math.sin(angle * 2.0 + 1.2) * 0.45;
  return { smoke, blueShift };
}

/**
 * Interactive 3D WebGL twisted glass torus sculpture built with OGL.
 * Hovering over individual blades fans, lifts, and illuminates them smoothly
 * with zero drag-orbiting.
 */
export default function GlassTorus({
  className = "",
  bladeCount = 34,
  speed = 1,
  interactive = true,
  still = false,
  scrollSpin = 0,
  background,
}: GlassTorusProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isStatic = still || reduced;

    const isCompactViewport = window.innerWidth <= 768;
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, isCompactViewport ? 1.5 : 2),
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

    const camera = new Camera(gl, { fov: 34, near: 0.1, far: 40 });
    camera.position.set(0, 0, 6.4);

    const root = new Transform();
    const torusGroup = new Transform();
    torusGroup.setParent(root);

    const geometry = createCurvedDiscGeometry(gl, bladeCount <= 36 || isCompactViewport);

    const pointerUniform: [number, number] = [0, 0];
    const sharedUniforms = () => ({
      uSmoke: { value: 0 },
      uBlueShift: { value: 0 },
      uBladeHover: { value: 0 },
      uPointer: { value: pointerUniform },
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

    const blades: BladeInstance[] = [];

    for (let i = 0; i < bladeCount; i++) {
      const t = i / bladeCount;
      const baseAngle = t * Math.PI * 2;
      const { smoke, blueShift } = getBladeStyle(t);

      const anchor = new Transform();
      anchor.setParent(torusGroup);

      const backMesh = new Mesh(gl, { geometry, program: backProgram });
      const frontMesh = new Mesh(gl, { geometry, program: frontProgram });
      backMesh.setParent(anchor);
      frontMesh.setParent(anchor);

      const blade: BladeInstance = { anchor, backMesh, frontMesh, baseAngle, smoke, blueShift, hover: 0, viewZ: 0 };

      backMesh.onBeforeRender(() => {
        backProgram.uniforms.uSmoke.value = blade.smoke;
        backProgram.uniforms.uBlueShift.value = blade.blueShift;
        backProgram.uniforms.uBladeHover.value = blade.hover;
      });

      frontMesh.onBeforeRender(() => {
        frontProgram.uniforms.uSmoke.value = blade.smoke;
        frontProgram.uniforms.uBlueShift.value = blade.blueShift;
        frontProgram.uniforms.uBladeHover.value = blade.hover;
      });

      blades.push(blade);
    }

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Local NDC pointer coordinates (-1..1 inside the container) for per-blade hover proximity
    const pointerNdc = { x: 0, y: 0, active: false };
    const pointerCurrent = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
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

    let scrollAngle = 0;
    let scrollRaf = 0;
    const updateScroll = () => {
      scrollRaf = 0;
      const rect = container.getBoundingClientRect();
      const fromCenter = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) / window.innerHeight;
      scrollAngle = fromCenter * scrollSpin * (Math.PI / 180);
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScroll);
    };
    if (scrollSpin !== 0 && !isStatic) {
      window.addEventListener("scroll", onScroll, { passive: true });
      updateScroll();
    }

    const centroid = new Vec3();
    const ndcPos = new Vec3();
    const viewMat = new Mat4();
    const projViewMat = new Mat4();
    const majorRadius = 1.18;

    let elapsed = 0;
    let orbitOffset = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let visible = true;

    const renderFrame = (now: number) => {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0.0001, (now - lastTime) / 1000));
      lastTime = now;

      if (!isStatic) {
        const ptrEase = 1 - Math.exp(-7.0 * dt);
        pointerCurrent.x += ((pointerNdc.active ? pointerNdc.x : 0) - pointerCurrent.x) * ptrEase;
        pointerCurrent.y += ((pointerNdc.active ? pointerNdc.y : 0) - pointerCurrent.y) * ptrEase;

        elapsed += dt * speed;
        orbitOffset += dt * speed * 0.22;
      }

      torusGroup.rotation.x = 0.48;
      torusGroup.rotation.z = 0.12 + scrollAngle;
      torusGroup.rotation.y = 0;

      pointerUniform[0] = 0;
      pointerUniform[1] = 0;

      const wavePhase = elapsed * 1.05;
      const hoverEase = 1 - Math.exp(-12.0 * dt);

      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];
        const theta = blade.baseAngle + orbitOffset;
        const wave = Math.sin(blade.baseAngle * 3.0 - wavePhase);
        const h = blade.hover;

        blade.anchor.position.set(
          Math.cos(theta) * majorRadius,
          h * 0.085,
          Math.sin(theta) * majorRadius,
        );

        blade.anchor.rotation.order = "YXZ";
        blade.anchor.rotation.y = -theta + 0.44;
        blade.anchor.rotation.x = 0.84 + wave * 0.03 + h * 0.34;
        blade.anchor.rotation.z = 0.28 - h * 0.16;

        const scale = 1 + h * 0.13;
        blade.anchor.scale.set(scale, scale, scale);
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

      if (!isStatic && visible && !document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden && !rafId && !isStatic) {
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

    const handleVisibility = () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!document.hidden && visible && !rafId && !isStatic) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    renderFrame(performance.now());

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      geometry.remove();
      backProgram.remove();
      frontProgram.remove();
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
    };
  }, [bladeCount, speed, interactive, still, scrollSpin]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={background ? { background } : undefined}
      className={`relative select-none ${className}`}
    />
  );
}
