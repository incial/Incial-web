"use client";

import React from "react";

interface GlassIconProps {
  className?: string;
  size?: number;
}

/**
 * 3D Glass Infinity / Looping 8 Icon
 * Accurately modeled after the reference image:
 * - Angled isometric figure-8 geometry
 * - Thick refractive translucent glass body with cyan to royal-blue depth
 * - Glowing internal refraction caustic core
 * - Precision specular highlight lines along top and side bevel ridges
 * - Soft ambient blue glow beneath the icon
 */
export function GlassInfinityIcon({ className = "", size = 180 }: GlassIconProps) {
  const id = "glass-infinity";
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* ── Ambient Radial Backlight / Caustic Glow ── */}
      <div
        className="absolute w-[180px] h-[180px] rounded-full pointer-events-none opacity-85 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.75) 0%, rgba(37, 99, 235, 0.45) 45%, rgba(29, 78, 216, 0.15) 70%, transparent 85%)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_15px_30px_rgba(0,10,35,0.7)]"
      >
        <defs>
          {/* Glass Outer Wall Gradient */}
          <linearGradient id={`${id}-body`} x1="25%" y1="10%" x2="80%" y2="95%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="65%" stopColor="#1d4ed8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.5" />
          </linearGradient>

          {/* Deep Shadow Rim */}
          <linearGradient id={`${id}-rim-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#1e40af" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>

          {/* Specular Edge Highlight */}
          <linearGradient id={`${id}-specular`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#dbeafe" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>

          {/* Secondary Inner Ridge Highlight */}
          <linearGradient id={`${id}-inner-ridge`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#93c5fd" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#2563eb" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.6" />
          </linearGradient>

          {/* Refractive blur filter for inner caustics */}
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Main Isometric Transform Group ── */}
        <g transform="translate(100, 100) rotate(-28) skewX(-14) scale(0.92) translate(-100, -100)">
          {/* Base Drop Shadow on Glass floor */}
          <path
            d="M 68 38 C 96 38, 126 50, 126 78 C 126 94, 114 104, 100 110 C 114 116, 126 126, 126 142 C 126 170, 96 182, 68 182 C 40 182, 20 170, 20 142 C 20 126, 32 116, 46 110 C 32 104, 20 94, 20 78 C 20 50, 40 38, 68 38 Z"
            fill="#030712"
            opacity="0.5"
            transform="translate(8, 12)"
            filter="blur(8px)"
          />

          {/* ── Lower Glass Layer (Depth Wall) ── */}
          <rect
            x="42"
            y="32"
            width="88"
            height="56"
            rx="28"
            fill="none"
            stroke={`url(#${id}-rim-dark)`}
            strokeWidth="18"
            strokeLinejoin="round"
            className="opacity-70"
          />
          <rect
            x="42"
            y="98"
            width="88"
            height="56"
            rx="28"
            fill="none"
            stroke={`url(#${id}-rim-dark)`}
            strokeWidth="18"
            strokeLinejoin="round"
            className="opacity-70"
          />

          {/* ── Translucent Glass Volume Body ── */}
          <rect
            x="40"
            y="30"
            width="88"
            height="56"
            rx="28"
            fill={`url(#${id}-body)`}
            stroke={`url(#${id}-specular)`}
            strokeWidth="14"
            strokeLinejoin="round"
            filter={`url(#${id}-glow)`}
          />
          <rect
            x="58"
            y="44"
            width="52"
            height="28"
            rx="14"
            fill="#050a18"
            fillOpacity="0.8"
            stroke={`url(#${id}-inner-ridge)`}
            strokeWidth="2.5"
          />

          <rect
            x="40"
            y="96"
            width="88"
            height="56"
            rx="28"
            fill={`url(#${id}-body)`}
            stroke={`url(#${id}-specular)`}
            strokeWidth="14"
            strokeLinejoin="round"
            filter={`url(#${id}-glow)`}
          />
          <rect
            x="58"
            y="110"
            width="52"
            height="28"
            rx="14"
            fill="#050a18"
            fillOpacity="0.8"
            stroke={`url(#${id}-inner-ridge)`}
            strokeWidth="2.5"
          />

          {/* ── Glass Bevel Specular Highlights (White Edges) ── */}
          <path
            d="M 52 30 C 72 26, 96 26, 116 30"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="opacity-90"
          />
          <path
            d="M 40 44 C 36 54, 38 68, 44 76"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="opacity-80"
          />

          <path
            d="M 52 152 C 72 156, 96 156, 116 152"
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-85"
          />
          <path
            d="M 128 110 C 132 120, 130 134, 124 142"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="opacity-90"
          />

          {/* Central Intersection Bridge Specular Glint */}
          <path
            d="M 46 94 L 62 88 M 110 94 L 126 88"
            stroke="#dbeafe"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-75"
          />

          {/* Corner Specular Glint Nodes */}
          <circle cx="48" cy="38" r="2.2" fill="#ffffff" />
          <circle cx="120" cy="104" r="2.2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 3D Glass Tech Cube / Processor Core Icon
 * For "Technology":
 * - Layered isometric crystalline processor cube
 * - Cybernetic refractive blue bevels and internal luminous core
 * - Clean geometric specular edges
 */
export function GlassTechCubeIcon({ className = "", size = 180 }: GlassIconProps) {
  const id = "glass-tech";
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient Caustic Glow */}
      <div
        className="absolute w-[170px] h-[170px] rounded-full pointer-events-none opacity-80 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.7) 0%, rgba(37, 99, 235, 0.45) 50%, transparent 80%)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_15px_30px_rgba(0,10,35,0.7)]"
      >
        <defs>
          <linearGradient id={`${id}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`${id}-left`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id={`${id}-right`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={`${id}-specular`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* ── Floor Shadow ── */}
        <ellipse cx="100" cy="162" rx="55" ry="18" fill="#020617" opacity="0.5" filter="blur(7px)" />

        {/* ── Outer 3D Glass Isometric Cube ── */}
        <path
          d="M 100 102 L 48 72 L 48 132 L 100 162 Z"
          fill={`url(#${id}-left)`}
          stroke={`url(#${id}-specular)`}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M 100 102 L 152 72 L 152 132 L 100 162 Z"
          fill={`url(#${id}-right)`}
          stroke={`url(#${id}-specular)`}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M 100 42 L 152 72 L 100 102 L 48 72 Z"
          fill={`url(#${id}-top)`}
          stroke={`url(#${id}-specular)`}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* ── Inner Floating Glowing Glass Node / Core ── */}
        <path
          d="M 100 64 L 126 79 L 100 94 L 74 79 Z"
          fill="#38bdf8"
          fillOpacity="0.3"
          stroke="#e0f2fe"
          strokeWidth="1.6"
        />
        <path
          d="M 100 94 L 74 79 L 74 109 L 100 124 Z"
          fill="#1d4ed8"
          fillOpacity="0.35"
          stroke="#93c5fd"
          strokeWidth="1.2"
        />
        <path
          d="M 100 94 L 126 79 L 126 109 L 100 124 Z"
          fill="#2563eb"
          fillOpacity="0.4"
          stroke="#93c5fd"
          strokeWidth="1.2"
        />

        <circle cx="100" cy="85" r="9" fill="#38bdf8" opacity="0.6" filter="blur(4px)" />
        <circle cx="100" cy="85" r="4" fill="#ffffff" opacity="0.9" />

        {/* ── Isometric Circuit Specular Bevels ── */}
        <path d="M 100 42 L 100 102" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="opacity-90" />
        <path d="M 48 72 L 100 102" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" className="opacity-75" />
        <path d="M 152 72 L 100 102" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" className="opacity-75" />

        <circle cx="100" cy="42" r="2.5" fill="#ffffff" />
        <circle cx="48" cy="72" r="2" fill="#ffffff" />
        <circle cx="152" cy="72" r="2" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * 3D Glass Interlocking Design Prism Icon
 * For "Experience Design":
 * - Interconnected luminous refractive rings / gemstone prism
 * - Creative prismatic refractions and specular highlights
 */
export function GlassDesignPrismIcon({ className = "", size = 180 }: GlassIconProps) {
  const id = "glass-prism";
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient Caustic Glow */}
      <div
        className="absolute w-[170px] h-[170px] rounded-full pointer-events-none opacity-80 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(96, 165, 250, 0.7) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 80%)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_15px_30px_rgba(0,10,35,0.7)]"
      >
        <defs>
          <linearGradient id={`${id}-body`} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#2563eb" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id={`${id}-specular`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#bfdbfe" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="100" cy="164" rx="58" ry="16" fill="#020617" opacity="0.5" filter="blur(7px)" />

        {/* Ring 1 (Back) */}
        <circle
          cx="82"
          cy="92"
          r="46"
          fill="none"
          stroke={`url(#${id}-body)`}
          strokeWidth="15"
          className="opacity-60"
        />

        {/* Ring 2 (Front Intersecting) */}
        <circle
          cx="118"
          cy="108"
          r="46"
          fill={`url(#${id}-body)`}
          stroke={`url(#${id}-specular)`}
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Inner Hollow for Ring 2 */}
        <circle
          cx="118"
          cy="108"
          r="26"
          fill="#060c1c"
          fillOpacity="0.8"
          stroke="#93c5fd"
          strokeWidth="2"
        />

        {/* Inner Hollow for Ring 1 */}
        <circle
          cx="82"
          cy="92"
          r="26"
          fill="#060c1c"
          fillOpacity="0.8"
          stroke="#60a5fa"
          strokeWidth="1.8"
        />

        {/* ── Specular Highlights ── */}
        <path
          d="M 56 68 C 68 56, 92 54, 108 64"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="opacity-95"
        />
        <path
          d="M 94 82 C 108 72, 134 72, 150 86"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="opacity-95"
        />
        <path
          d="M 134 148 C 122 156, 100 156, 86 146"
          stroke="#60a5fa"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="opacity-80"
        />

        <circle cx="68" cy="62" r="2.4" fill="#ffffff" />
        <circle cx="140" cy="80" r="2.4" fill="#ffffff" />
        <circle cx="100" cy="100" r="2" fill="#93c5fd" />
      </svg>
    </div>
  );
}

/**
 * Renders the appropriate 3D Glass Icon based on type/title
 */
export function GlassServiceIcon({
  type,
  size = 170,
  className = "",
}: {
  type?: string;
  size?: number;
  className?: string;
}) {
  const normalized = (type || "").toLowerCase();

  if (normalized.includes("tech") || normalized.includes("web") || normalized.includes("01")) {
    return <GlassTechCubeIcon size={size} className={className} />;
  }
  if (
    normalized.includes("experience") ||
    normalized.includes("design") ||
    normalized.includes("ui") ||
    normalized.includes("03")
  ) {
    return <GlassDesignPrismIcon size={size} className={className} />;
  }
  // Default to the reference image's 3D Glass Infinity Loop (Digital Marketing)
  return <GlassInfinityIcon size={size} className={className} />;
}
