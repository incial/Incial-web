"use client";

import { useEffect, useRef } from "react";

interface ShaderBackgroundProps {
  className?: string;
  /**
   * Fade the surface out toward the bottom edge (share of the height, 0 to 1), so it melts into
   * whatever lies beneath instead of ending in a line. The parent should be the colour to fade to.
   */
  fadeBottom?: number;
}

const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

/**
 * An almost-black surface (never pure black, never tinted): a slow, faint mottling, a fine
 * paper-like texture, animated film grain, and a soft vignette that keeps the corners darker.
 */
const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;  // eased cursor position, 0..1 (y up)
uniform float uHover;   // 0 when the cursor is away, 1 when it is over the hero

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 q = vec2(uv.x * aspect, uv.y);
  // the texture shifts a hair with the cursor: depth, not motion
  q += (uPointer - 0.5) * 0.04 * uHover;

  vec3 base = vec3(0.040, 0.040, 0.043);

  // slow, soft mottling
  float texture = (fbm(q * 1.6 + vec2(uTime * 0.004, -uTime * 0.0027)) - 0.5) * 0.024;
  // fine, paper-like texture
  texture += (fbm(q * 38.0) - 0.5) * 0.007;
  // film grain that shimmers slowly: each new pattern is faded in over the last one, so it never
  // flickers or steps
  float grainStep = uTime * 0.6;
  float grainA = hash(gl_FragCoord.xy + floor(grainStep) * 37.0);
  float grainB = hash(gl_FragCoord.xy + (floor(grainStep) + 1.0) * 37.0);
  float grain = mix(grainA, grainB, smoothstep(0.0, 1.0, fract(grainStep)));
  texture += (grain - 0.5) * 0.028;

  // brighter in the middle, darker toward the corners
  vec2 c = uv - 0.5;
  c.x *= aspect * 0.8;
  float vignette = smoothstep(0.95, 0.15, length(c));
  // a very slow breath in the middle of the screen
  float breath = 1.0 + 0.10 * sin(uTime * 0.12);

  // a barely-there lift of light that follows the cursor
  vec2 d = uv - uPointer;
  d.x *= aspect;
  float follow = exp(-dot(d, d) * 7.0) * 0.011 * uHover;

  vec3 color = base + texture + 0.010 * vignette * breath + follow;
  color *= mix(0.62, 1.0, vignette);

  // never pure black
  gl_FragColor = vec4(max(color, vec3(0.022)), 1.0);
}
`;

/**
 * The shader is drawn at a fraction of the screen size and stretched up: the texture is soft
 * anyway, and it keeps every frame cheap enough to draw at the screen's full refresh rate, which
 * is what keeps the slow motion smooth.
 */
const RENDER_SCALE = 0.5;
/** How quickly the cursor light catches up with the cursor (per second). */
const FOLLOW_RATE = 2.2;
const FADE_RATE = 1.6;
/** How long the shader rests after the last scroll event. */
const SCROLL_PAUSE_MS = 160;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** A WebGL shader that fills its (positioned) parent. Draws nothing if WebGL is unavailable. */
export default function ShaderBackground({ className = "", fadeBottom = 0 }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uHover = gl.getUniformLocation(program, "uHover");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let lastTime = performance.now();
    let isVisible = true;
    // the surface is drawn slowly and softly, so pausing it while the page scrolls goes unnoticed
    let scrollingUntil = 0;
    const startedAt = performance.now();

    // cursor position eased toward the real one, so the light drifts after it instead of snapping
    const target = { x: 0.5, y: 0.5, hover: 0 };
    const eased = { x: 0.5, y: 0.5, hover: 0 };
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      target.x = Math.min(1, Math.max(0, x));
      target.y = Math.min(1, Math.max(0, y));
      target.hover = inside ? 1 : 0;
    };
    const handlePointerLeave = () => {
      target.hover = 0;
    };
    if (supportsHover && !reducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    }

    const resize = () => {
      // see RENDER_SCALE
      const width = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
      const height = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now: number) => {
      resize();
      const seconds = (now - startedAt) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, seconds);
      // easing by elapsed time (not per frame), so it is the same speed at any refresh rate
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const follow = 1 - Math.exp(-dt * FOLLOW_RATE);
      const fade = 1 - Math.exp(-dt * FADE_RATE);
      eased.x += (target.x - eased.x) * follow;
      eased.y += (target.y - eased.y) * follow;
      eased.hover += (target.hover - eased.hover) * fade;
      gl.uniform2f(uPointer, eased.x, eased.y);
      gl.uniform1f(uHover, eased.hover);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      frame = 0;
      if (!isVisible || document.hidden) return;
      if (now >= scrollingUntil) draw(now);
      frame = requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      scrollingUntil = performance.now() + SCROLL_PAUSE_MS;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const start = () => {
      if (reducedMotion) {
        draw(performance.now());
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
    });
    intersection.observe(canvas);

    const handleVisibility = () => {
      if (!document.hidden && isVisible) start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      // The context is deliberately not released here: React's dev double-mount would otherwise
      // leave this same canvas with a lost context (a blank white hero). It is freed with the canvas.
    };
  }, []);

  // opaque down to the start of the fade, then easing smoothly to transparent at the bottom edge
  const fadeStart = `${Math.round((1 - fadeBottom) * 100)}%`;
  const mask =
    fadeBottom > 0
      ? `linear-gradient(to bottom, #000 0%, #000 ${fadeStart}, rgba(0, 0, 0, 0.55) calc(${fadeStart} + ${Math.round(fadeBottom * 30)}%), transparent 100%)`
      : undefined;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    />
  );
}
