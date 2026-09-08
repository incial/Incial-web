"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

import AvatarDeckCard from "./AvatarDeckCard";

interface ServiceIntroDeckProps {
  onAction?: (slideIndex?: number) => void;
}

const SERVICES = [
  {
    index: 0,
    number: "01",
    title: "Digital Marketing",
    subtitle: "Data-Driven Performance Marketing and Targeted Acquisition",
    iconType: "marketing",
    badge: "Most Popular",
  },
  {
    index: 1,
    number: "02",
    title: "Technology",
    subtitle: "Web, Mobile & Cloud Systems Engineered for High Speed and Scale",
    iconType: "technology",
    badge: undefined,
  },
  {
    index: 2,
    number: "03",
    title: "Experience Design",
    subtitle: "Human-Centered Digital Product Design and Visual Identity Systems",
    iconType: "experience",
    badge: undefined,
  },
];

type SlotType = "center" | "left" | "right";

const getSlot = (cardIndex: number, active: number): SlotType => {
  if (cardIndex === active) return "center";
  if (active === 0) {
    return cardIndex === 1 ? "left" : "right";
  }
  if (active === 1) {
    return cardIndex === 0 ? "left" : "right";
  }
  // active === 2
  return cardIndex === 1 ? "left" : "right";
};

const slotConfigs = {
  center: {
    isCenter: true,
    zIndex: 30,
    animateY: 0,
    animateRotate: 0,
    hoverY: -8,
    className:
      "bottom-[-25px] sm:bottom-[-40px] md:bottom-[-50px] lg:bottom-[-60px] left-1/2 -translate-x-1/2 transition-all duration-500 ease-out cursor-pointer",
  },
  left: {
    isCenter: false,
    zIndex: 20,
    animateY: 14,
    animateRotate: -10,
    hoverY: 4,
    className:
      "bottom-[-45px] sm:bottom-[-65px] md:bottom-[-75px] lg:bottom-[-85px] left-1/2 -translate-x-[185px] min-[380px]:-translate-x-[205px] min-[420px]:-translate-x-[225px] sm:-translate-x-[305px] md:-translate-x-[355px] lg:-translate-x-[395px] transition-all duration-500 ease-out cursor-pointer opacity-80 hover:opacity-100",
  },
  right: {
    isCenter: false,
    zIndex: 20,
    animateY: 14,
    animateRotate: 10,
    hoverY: 4,
    className:
      "bottom-[-45px] sm:bottom-[-65px] md:bottom-[-75px] lg:bottom-[-85px] left-1/2 translate-x-[30px] min-[380px]:translate-x-[40px] min-[420px]:translate-x-[50px] sm:translate-x-[75px] md:translate-x-[95px] lg:translate-x-[115px] transition-all duration-500 ease-out cursor-pointer opacity-80 hover:opacity-100",
  },
};

export default function ServiceIntroDeck({ onAction }: ServiceIntroDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastSwipeTime = useRef(0);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SERVICES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  }, []);

  const triggerSwipe = useCallback(
    (direction: "next" | "prev") => {
      const now = Date.now();
      if (now - lastSwipeTime.current < 350) return;
      lastSwipeTime.current = now;

      if (direction === "next") {
        handleNext();
      } else {
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX < 0) {
        triggerSwipe("next");
      } else {
        triggerSwipe("prev");
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Sort so center card renders last in DOM tree to guarantee proper stacking
  const sortedCards = [...SERVICES].sort((a, b) => {
    const slotA = getSlot(a.index, activeIndex);
    const slotB = getSlot(b.index, activeIndex);
    const order = { left: 1, right: 1, center: 2 };
    return order[slotA] - order[slotB];
  });

  return (
    <div className="relative w-full h-full bg-[#07080b] text-white flex flex-col justify-between items-center overflow-hidden select-none px-4 pt-[115px] min-[380px]:pt-[125px] sm:pt-24 pb-5 sm:pb-8">
      {/* ── Background Subtle Glow (No Stars) ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* ── Top Hero Content (Positioned clearly below the fixed navbar) ── */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl lg:max-w-5xl mx-auto flex-shrink-0">
        {/* Main Headline (Balanced scale, font-semibold, ONLY 'Magic' in serif italic display font) */}
        <div className="flex flex-col items-center">
          <h1 className="text-[26px] min-[380px]:text-[30px] min-[420px]:text-[34px] sm:text-4xl md:text-[3.25rem] lg:text-[3.85rem] xl:text-[4.25rem] font-semibold text-white tracking-tight leading-[1.14] flex flex-col items-center">
            <span>Services That Make</span>
            <span className="mt-0.5 sm:mt-1">
              <span
                className="font-serif italic font-normal text-[#56A6FF]"
                style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', serif" }}
              >
                Magic
              </span>{" "}
              Happen
            </span>
          </h1>
        </div>

        {/* Subtitle Paragraph (Balanced ordinary font, no brackets) */}
        <p className="mt-1.5 min-[380px]:mt-2 sm:mt-3 text-xs min-[380px]:text-[13px] sm:text-base md:text-xl lg:text-[1.25rem] text-white/70 max-w-2xl leading-relaxed font-normal tracking-wide">
          And Seriously Grow Your Business
        </p>
      </div>

      {/* ── Floating Left Tag (Designer Pill with Top-Right Cursor Arrow) ── */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden md:flex absolute top-[11%] sm:top-[14%] md:top-[26%] left-[3%] sm:left-[6%] lg:left-[10%] z-30 pointer-events-auto cursor-pointer group"
      >
        <div className="relative inline-flex items-center">
          {/* Rounded Pill Badge with text Designer */}
          <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#5ba4e6] text-white text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide shadow-[0_4px_20px_rgba(91,164,230,0.4)] group-hover:scale-105 transition-transform flex items-center justify-center">
            Designer
          </div>

          {/* Authentic Figma Cursor pointing diagonally UP-RIGHT (↗) */}
          <div className="absolute -top-3.5 -right-4 sm:-top-4.5 sm:-right-5.5 drop-shadow-[0_2px_10px_rgba(91,164,230,0.6)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform -scale-x-100 pointer-events-none">
            <MousePointer2
              size={24}
              className="sm:w-8 sm:h-8"
              fill="#5ba4e6"
              color="#000000"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Floating Right Tag (Developer Pill with Top-Left Cursor Arrow in Blue) ── */}
      <motion.div
        animate={{
          y: [0, 6, 0],
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        }}
        className="hidden md:flex absolute top-[19%] sm:top-[22%] md:top-[33%] right-[3%] sm:right-[6%] lg:right-[10%] z-30 pointer-events-auto cursor-pointer group"
      >
        <div className="relative inline-flex items-center">
          {/* Authentic Figma Cursor pointing diagonally UP-LEFT (↖) in Blue */}
          <div className="absolute -top-3.5 -left-4 sm:-top-4.5 sm:-left-5.5 drop-shadow-[0_2px_10px_rgba(91,164,230,0.6)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform pointer-events-none">
            <MousePointer2
              size={24}
              className="sm:w-8 sm:h-8"
              fill="#5ba4e6"
              color="#000000"
              strokeWidth={1.5}
            />
          </div>

          {/* Rounded Pill Badge with text Developer in Blue */}
          <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#5ba4e6] text-white text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide shadow-[0_4px_20px_rgba(91,164,230,0.4)] group-hover:scale-105 transition-transform flex items-center justify-center">
            Developer
          </div>
        </div>
      </motion.div>

      {/* ── 3-Card Deck Arc with Horizontal Swipe Gestures & Balanced Distance ── */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragEnd={(_, info) => {
          const swipeThreshold = 35;
          if (info.offset.x < -swipeThreshold || info.velocity.x < -200) {
            triggerSwipe("next");
          } else if (info.offset.x > swipeThreshold || info.velocity.x > 200) {
            triggerSwipe("prev");
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full flex items-end justify-center h-[290px] min-[380px]:h-[320px] min-[420px]:h-[350px] sm:h-[390px] md:h-[430px] lg:h-[460px] mt-4 min-[380px]:mt-6 sm:mt-10 overflow-visible cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {sortedCards.map((card) => {
          const slot = getSlot(card.index, activeIndex);
          const config = slotConfigs[slot];

          return (
            <AvatarDeckCard
              key={card.number}
              number={card.number}
              title={card.title}
              subtitle={card.subtitle}
              iconType={card.iconType}
              badge={card.badge}
              isCenter={config.isCenter}
              compact={slot !== "center"}
              zIndex={config.zIndex}
              animateY={config.animateY}
              initialRotate={0}
              animateRotate={config.animateRotate}
              hoverY={config.hoverY}
              onClick={() => {
                if (slot === "center") {
                  onAction && onAction(card.index);
                } else {
                  setActiveIndex(card.index);
                }
              }}
              className={config.className}
            />
          );
        })}
      </motion.div>

      {/* ── Interactive Card Indicators & Subtle Horizontal Swipe Guide ── */}
      <div className="relative z-30 flex flex-col items-center gap-2 mt-5 min-[380px]:mt-6 sm:mt-7">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
          {SERVICES.map((card, idx) => (
            <button
              key={card.number}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-[#56A6FF] shadow-[0_0_8px_#56A6FF]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to ${card.title}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] min-[380px]:text-[11px] font-medium text-white/45 tracking-wider uppercase">
          <span className="text-[#56A6FF] animate-pulse">‹</span>
          <span>Swipe to explore cards</span>
          <span className="text-[#56A6FF] animate-pulse">›</span>
        </div>
      </div>
    </div>
  );
}
