"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassServiceIcon } from "./GlassIcons";

export interface AvatarDeckCardProps {
  number?: string;
  title: string;
  subtitle?: string;
  headline?: string;
  icon?: ReactNode;
  iconType?: string;
  badge?: string;
  gradient?: string;
  children?: ReactNode;
  zIndex?: number;
  initialY?: number;
  animateY?: number;
  initialRotate?: number;
  animateRotate?: number;
  hoverY?: number;
  hoverScale?: number;
  delay?: number;
  className?: string;
  isCenter?: boolean;
  isRelative?: boolean;
  compact?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  onClick?: () => void;
  shadowColor?: string;
  topTag?: string;
  pillText?: string;
  metricLabel?: string;
  metricValue?: string;
  metricChange?: string;
}

// Fallback subtitles matching each service domain
const DEFAULT_SUBTITLES: Record<string, string> = {
  technology:
    "Web, Mobile & Cloud Systems Engineered for High Speed and Scale",
  "digital marketing":
    "Data-Driven Performance Marketing and Targeted Acquisition",
  marketing:
    "Data-Driven Performance Marketing and Targeted Acquisition",
  "experience design":
    "Human-Centered Digital Product Design and Visual Identity Systems",
  experience:
    "Human-Centered Digital Product Design and Visual Identity Systems",
};

/**
 * AvatarDeckCard redesigned to match the frosted glass aesthetic in the reference:
 * - Top-left aligned main heading
 * - Descriptive subtext directly below the heading
 * - Luminous 3D glass icon in the center/lower section
 * - Frosted dark glassmorphic surface with backdrop blur, specular rim, and ambient blue glow
 */
export default function AvatarDeckCard({
  number,
  title,
  subtitle,
  headline,
  icon,
  iconType,
  badge,
  gradient,
  children,
  zIndex = 10,
  initialY,
  animateY = 0,
  initialRotate = 0,
  animateRotate = 0,
  hoverY,
  hoverScale,
  delay = 0,
  className = "",
  isCenter = false,
  isRelative = false,
  compact = false,
  buttonText,
  onButtonClick,
  onClick,
  shadowColor,
}: AvatarDeckCardProps) {
  const sizeClasses = isCenter
    ? "w-[275px] min-[380px]:w-[295px] min-[420px]:w-[320px] sm:w-[320px] md:w-[340px] lg:w-[365px] h-[335px] min-[380px]:h-[360px] min-[420px]:h-[380px] sm:h-[400px] md:h-[440px] lg:h-[470px] rounded-[26px] min-[380px]:rounded-[30px] sm:rounded-[34px] md:rounded-[38px] p-5 min-[380px]:p-6 sm:p-7 md:p-8 border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(59,130,246,0.22)]"
    : "w-[245px] min-[380px]:w-[265px] min-[420px]:w-[285px] sm:w-[290px] md:w-[315px] lg:w-[335px] h-[310px] min-[380px]:h-[335px] min-[420px]:h-[355px] sm:h-[380px] md:h-[415px] lg:h-[440px] rounded-[22px] min-[380px]:rounded-[26px] sm:rounded-[30px] md:rounded-[34px] p-4 min-[380px]:p-5 sm:p-6 md:p-7 border border-white/15 shadow-[inset_0_1px_1.2px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.85),0_0_22px_rgba(59,130,246,0.15)]";

  const yInitial = initialY !== undefined ? initialY : animateY;

  const hoverMotion = hoverScale
    ? { scale: hoverScale }
    : hoverY !== undefined
    ? { y: hoverY }
    : isCenter
    ? { y: animateY - 12, scale: 1.02 }
    : { y: animateY - 10, scale: 1.02 };

  const positionClass = isRelative ? "relative origin-center" : "absolute origin-bottom";

  const displayTitle = title || headline || "Service";
  const titleKey = (title || "").toLowerCase().trim();
  const displaySubtitle =
    subtitle ||
    DEFAULT_SUBTITLES[titleKey] ||
    "Custom digital solutions tailored specifically to elevate and scale your brand.";

  const iconKey = iconType || title || number || "";

  return (
    <motion.div
      initial={{ opacity: 1, y: yInitial, rotate: initialRotate, scale: isCenter ? 0.98 : 1 }}
      animate={{ opacity: 1, y: animateY, rotate: animateRotate, scale: 1 }}
      whileHover={hoverMotion}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`${positionClass} flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all group backdrop-blur-2xl ${sizeClasses} ${className}`}
      style={{
        background:
          gradient ||
          "linear-gradient(175deg, rgba(255, 255, 255, 0.08) 0%, rgba(13, 23, 48, 0.65) 25%, rgba(6, 12, 28, 0.82) 70%, rgba(3, 7, 18, 0.94) 100%)",
        zIndex,
        boxShadow: shadowColor ? `0 20px 50px ${shadowColor}` : undefined,
      }}
    >
      {/* ── Soft Ambient Background Gradient Glow ── */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/25 rounded-full blur-3xl" />
      </div>

      {/* ── Top Subtle Specular Rim Line ── */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* ── Optional Badge (e.g. "Most Popular") ── */}
      {badge && !compact && (
        <div className="relative z-10 self-end mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
            {badge}
          </span>
        </div>
      )}

      {/* ── TOP SECTION: Main Heading & Subtext (Left-Aligned) ── */}
      <div className="relative z-10 w-full flex flex-col text-left flex-shrink-0">
        {/* Service number — visible on compact side cards */}
        {compact && (
          <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">
            {number}
          </span>
        )}
        <h3 className="text-lg min-[380px]:text-[20px] sm:text-[22px] md:text-2xl font-semibold text-white tracking-tight leading-snug">
          {displayTitle}
        </h3>
        {/* Subtitle — hidden on compact (side) cards, visible on center card */}
        {!compact && (
          <>
            <p className="mt-1.5 sm:mt-2 text-xs min-[380px]:text-[12.5px] sm:text-[13px] text-white/65 font-normal leading-relaxed line-clamp-2">
              {displaySubtitle}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] min-[380px]:text-[11px] font-medium text-[#56A6FF]">
              <span>Tap to view deliverables</span>
              <span>→</span>
            </div>
          </>
        )}
        {/* Compact hint to tap */}
        {compact && (
          <p className="mt-1 text-[10px] text-white/35 font-normal leading-relaxed">
            Tap to explore
          </p>
        )}
      </div>

      {/* ── CENTER / LOWER SECTION: 3D Glass Icon — hidden when compact ── */}
      {!compact && (
        <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto py-1 sm:py-3">
          {icon ? (
            icon
          ) : (
            <div className="scale-[0.85] min-[380px]:scale-[0.92] sm:scale-100 transition-transform">
              <GlassServiceIcon
                type={iconKey}
                size={isCenter ? 175 : 155}
                className="transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Optional Action Button ── */}
      {buttonText && (
        <div className="relative z-10 w-full pt-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onButtonClick) onButtonClick();
              else if (onClick) onClick();
            }}
            className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-white text-black text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span>{buttonText}</span>
          </motion.button>
        </div>
      )}

      {children && <div className="relative z-10">{children}</div>}
    </motion.div>
  );
}
