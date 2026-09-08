"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { isGlobalScrollLocked, lockGlobalScroll } from "@/lib/scrollLock";

interface Stat {
  id: string;
  value: string;
  label: string;
}

interface TrustApiData {
  title: string;
  stats: Stat[];
}

interface TrustSectionProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const DEFAULT_STATS: Stat[] = [
  { id: "1", value: "100+", label: "Projects Completed" },
  { id: "2", value: "60+", label: "Happy Clients" },
];

export default function TrustSection({
  onBack,
  onComplete,
}: TrustSectionProps) {
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [title, setTitle] = useState("Why Trust Incial?");
  const [sectionsConfig, setSectionsConfig] = useState<Record<string, boolean>>(
    {},
  );

  const isScrollingRef = useRef(false);

  useEffect(() => {
    fetch("/api/admin/trust")
      .then((r) => r.json())
      .then((d: TrustApiData) => {
        if (d?.stats && Array.isArray(d.stats) && d.stats.length > 0) {
          setStats(d.stats);
        } else {
          setStats(DEFAULT_STATS);
        }
        if (d?.title) setTitle(d.title);
      })
      .catch(() => {
        setStats(DEFAULT_STATS);
      });

    fetch("/api/admin/sections")
      .then((res) => res.json())
      .then((d) => {
        if (d?.sections) {
          const configMap: Record<string, boolean> = {};
          d.sections.forEach((s: any) => {
            configMap[s.id] = s.enabled;
          });
          setSectionsConfig(configMap);
        }
      })
      .catch(console.error);
  }, []);

  // ── Wheel and Touch Gestures with Lock ──────────────────────────────────
  useEffect(() => {
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const scrollThreshold = isCoarsePointer ? 25 : 35;

    const handleScroll = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < scrollThreshold) return;
      if (isScrollingRef.current || isGlobalScrollLocked()) return;

      e.preventDefault();
      isScrollingRef.current = true;
      lockGlobalScroll(900);

      if (e.deltaY > 0) {
        onComplete?.();
      } else {
        onBack?.();
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 850);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollingRef.current || isGlobalScrollLocked()) return;
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaY) > scrollThreshold) {
        e.preventDefault();
        isScrollingRef.current = true;
        lockGlobalScroll(900);

        if (deltaY > 0) {
          onComplete?.();
        } else {
          onBack?.();
        }

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 850);
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onBack, onComplete]);

  // Title formatter: extracts "Incial?" or highlights the brand name in blue
  const renderFormattedTitle = (rawTitle: string) => {
    if (rawTitle.includes("Incial?")) {
      const parts = rawTitle.split("Incial?");
      return (
        <>
          <span className="italic font-light">{parts[0]}</span>
          <span className="font-bold text-[#56A6FF]">Incial?</span>
          {parts[1] && <span className="italic font-light">{parts[1]}</span>}
        </>
      );
    }
    if (rawTitle.includes("Incial")) {
      const parts = rawTitle.split("Incial");
      return (
        <>
          <span className="italic font-light">{parts[0]}</span>
          <span className="font-bold text-[#56A6FF]">Incial</span>
          {parts[1] && <span className="italic font-light">{parts[1]}</span>}
        </>
      );
    }
    return <span className="italic font-light">{rawTitle}</span>;
  };

  return (
    <section className="h-full w-full bg-black text-white flex flex-col justify-center items-center relative overflow-hidden rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[44px] border-t border-white/20 shadow-[0_-25px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.2)]">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#56A6FF]/10 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 h-full flex flex-col justify-center items-center">
        <motion.div
          className="flex flex-col justify-center items-center w-full max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Title */}
          {sectionsConfig["trust-title"] !== false && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 sm:mb-20 md:mb-28"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] tracking-tight text-white leading-tight">
                {renderFormattedTitle(title)}
              </h2>
            </motion.div>
          )}

          {/* Stats Grid */}
          {sectionsConfig["trust-stats"] !== false && (
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-12 sm:gap-16 md:gap-24 lg:gap-32 text-center w-full">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id || index}
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="flex flex-col items-center min-w-[160px] md:min-w-[200px] cursor-default transition-transform"
                >
                  <div className="text-6xl sm:text-7xl md:text-[80px] lg:text-[90px] font-bold text-[#56A6FF] mb-2 sm:mb-3 md:mb-4 italic tracking-tighter leading-none">
                    {stat.value}
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl text-white font-normal tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}