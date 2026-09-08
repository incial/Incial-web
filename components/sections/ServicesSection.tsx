"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MousePointer2 } from "lucide-react";
import { isGlobalScrollLocked, lockGlobalScroll } from "@/lib/scrollLock";

import AvatarDeckCard from "@/components/features/services/AvatarDeckCard";

// ─── 3 Core Service Domains (4 Clean Points on Left, 4 Clean Points on Right) ─
export interface ServiceDetail {
  id: string;
  number: string;
  title: string;
  headline: string;
  badge?: string;
  topTag?: string;
  pillText?: string;
  metricLabel?: string;
  metricValue?: string;
  metricChange?: string;
  subtitle: string;
  leftCategory: string;
  leftServices: { name: string; desc: string }[];
  rightCategory: string;
  rightServices: { name: string; desc: string }[];
}

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    id: "marketing",
    number: "01",
    title: "Digital Marketing",
    headline: "Growth & Ads",
    badge: "Most Popular",
    topTag: "Data updated 2h ago",
    pillText: "Monthly ∨",
    metricLabel: "Conversion rate",
    metricValue: "400%",
    metricChange: "Increase vs last month",
    subtitle: "Data-Driven Performance Marketing and Targeted Acquisition",
    leftCategory: "Performance & Paid Ads",
    leftServices: [
      {
        name: "Meta & Google Ads",
        desc: "Precision-targeted paid acquisition campaigns maximizing ROAS.",
      },
      {
        name: "Conversion Funnel Optimization",
        desc: "A/B tested landing pages and high-converting checkout flows.",
      },
      {
        name: "Retargeting & Remarketing",
        desc: "Multi-channel sequences capturing high-intent abandoned visitors.",
      },
      {
        name: "Real-time Attribution Tracking",
        desc: "Custom analytics dashboards tracking LTV, CAC, and conversion paths.",
      },
    ],
    rightCategory: "Organic Growth & Content",
    rightServices: [
      {
        name: "Search Engine Optimization (SEO)",
        desc: "Technical SEO and programmatic keyword ranking domination.",
      },
      {
        name: "Social Media Growth",
        desc: "Channel-specific growth playbooks and active audience engagement.",
      },
      {
        name: "Content & Sales Copywriting",
        desc: "Compelling brand storytelling and high-converting sales messaging.",
      },
      {
        name: "Email Marketing & Automated Drips",
        desc: "High-deliverability automated drip flows and retention sequences.",
      },
    ],
  },
  {
    id: "technology",
    number: "02",
    title: "Technology",
    headline: "Web & Apps",
    topTag: "Latency telemetry",
    pillText: "Uptime ∨",
    metricLabel: "System performance",
    metricValue: "99.9%",
    metricChange: "Sub-second response time",
    subtitle: "Web, Mobile & Cloud Systems Engineered for High Speed and Scale",
    leftCategory: "Web & Mobile Platforms",
    leftServices: [
      {
        name: "Full-Stack Web Engineering",
        desc: "Modern Next.js and TypeScript platforms built for sub-second load times.",
      },
      {
        name: "iOS & Android Applications",
        desc: "High-performance native and cross-platform mobile app experiences.",
      },
      {
        name: "Headless E-Commerce",
        desc: "Bespoke online storefronts with custom global checkout architectures.",
      },
      {
        name: "Progressive Web Apps",
        desc: "Offline-first web applications delivering native desktop responsiveness.",
      },
    ],
    rightCategory: "Architecture & Infrastructure",
    rightServices: [
      {
        name: "Cloud & DevOps Automation",
        desc: "Automated CI/CD pipelines, AWS/GCP setups, and containerization.",
      },
      {
        name: "Custom API & Microservices",
        desc: "Secure, high-throughput REST and GraphQL backend architectures.",
      },
      {
        name: "Speed & Performance Audits",
        desc: "Core Web Vitals optimization and database caching strategies.",
      },
      {
        name: "Enterprise Security & Auth",
        desc: "Role-based access control, vulnerability defense, and data privacy.",
      },
    ],
  },
  {
    id: "experience",
    number: "03",
    title: "Experience Design",
    headline: "UI/UX & Brand",
    topTag: "Active telemetry",
    pillText: "Retention ∨",
    metricLabel: "User engagement",
    metricValue: "8.5x",
    metricChange: "Higher brand affinity",
    subtitle: "Human-Centered Digital Product Design and Visual Identity Systems",
    leftCategory: "UI/UX & Product Design",
    leftServices: [
      {
        name: "Design Systems & UI Kits",
        desc: "Scalable component libraries in Figma built with systematic design tokens.",
      },
      {
        name: "Web & Mobile UX Architecture",
        desc: "Wireframing, user journeys, and high-fidelity interactive prototypes.",
      },
      {
        name: "Micro-Interactions & Motion",
        desc: "Tactile interface animations that elevate the tactile digital feel.",
      },
      {
        name: "Usability Testing & Research",
        desc: "Real-user testing sessions uncovering behavioral conversion blockers.",
      },
    ],
    rightCategory: "Brand & Creative Identity",
    rightServices: [
      {
        name: "Visual Identity & Logos",
        desc: "Distinctive brand marks, color palettes, and typographic pairings.",
      },
      {
        name: "Motion Graphics & 3D Assets",
        desc: "Dynamic motion graphics that bring brand narratives alive.",
      },
      {
        name: "Comprehensive Guidelines",
        desc: "Standards manuals guaranteeing design consistency across channels.",
      },
      {
        name: "Bespoke Iconography",
        desc: "Custom vector icon sets tailored to your distinct brand personality.",
      },
    ],
  },
];

interface ServicesSectionProps {
  initialSlide?: number;
  startAtEnd?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
}

const MOTION_EASING = [0.22, 1, 0.36, 1] as const;

export default function ServicesSection({
  startAtEnd = false,
  onBack,
  onComplete,
}: ServicesSectionProps) {
  // stage: -1 = rest state (3-card bottom deck + headline), 0 = Marketing, 1 = Technology, 2 = Experience Design
  const [stage, setStage] = useState<number>(() =>
    startAtEnd ? SERVICE_DETAILS.length - 1 : -1,
  );
  const [direction, setDirection] = useState<number>(1);

  // Synchronize stage if startAtEnd changes
  useEffect(() => {
    if (startAtEnd) {
      setStage(SERVICE_DETAILS.length - 1);
    } else {
      setStage(-1);
    }
  }, [startAtEnd]);

  // Keep latest stage in ref so event listeners always read the live stage without re-binding
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Deliberate Scroll Catcher system:
  // - isTransitioningRef: locks while card animation is executing (850ms)
  // - isMountedGracePeriod: locks on initial mount (900ms) while entrance slide finishes
  // - lastWheelTimeRef: tracks wheel stream pauses (neutralizes trackpad inertia)
  // - deltaAccumulatorRef: requires deliberate accumulated scroll gesture (threshold 70)
  const isTransitioningRef = useRef(false);
  const lastWheelTimeRef = useRef(0);
  const deltaAccumulatorRef = useRef(0);
  const isMountedGracePeriod = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      isMountedGracePeriod.current = false;
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const isPoppedUp = stage >= 0;
  const current = stage >= 0 ? stage : 0;
  const active = SERVICE_DETAILS[current] || SERVICE_DETAILS[0];

  // ── Navigation helpers with Firm Catch Lock ─────────────────────────────
  const goToStage = (targetStage: number, dir: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    deltaAccumulatorRef.current = 0;
    setDirection(dir);
    setStage(targetStage);
    stageRef.current = targetStage;
    lockGlobalScroll(850);

    setTimeout(() => {
      isTransitioningRef.current = false;
      deltaAccumulatorRef.current = 0;
    }, 850);
  };

  const handleScrollDown = () => {
    const s = stageRef.current;
    if (s === -1) {
      goToStage(0, 1); // 1st deliberate scroll: brings Card 0 (Marketing) up to center
    } else if (s < SERVICE_DETAILS.length - 1) {
      goToStage(s + 1, 1); // Next deliberate scroll: next card in sequential order
    } else {
      // Last card (stage === 2: Experience Design) -> advance to next section
      if (onComplete) {
        isTransitioningRef.current = true;
        lockGlobalScroll(1000);
        onComplete();
      } else {
        deltaAccumulatorRef.current = 0;
      }
    }
  };

  const handleScrollUp = () => {
    const s = stageRef.current;
    if (s > 0) {
      goToStage(s - 1, -1); // Previous card
    } else if (s === 0) {
      goToStage(-1, -1); // Return down to 3-card bottom deck
    } else if (s === -1 && onBack) {
      isTransitioningRef.current = true;
      lockGlobalScroll(900);
      onBack();
    }
  };

  // ── Deliberate Scroll Catcher ──────────────────────────────────────────
  useEffect(() => {
    let decayTimer: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      const timeSinceLast = now - lastWheelTimeRef.current;
      lastWheelTimeRef.current = now;

      // When transition is active, in mount grace period, or global lock is held:
      // Swallow the event completely and keep accumulator at zero so inertia never bleeds!
      if (
        isTransitioningRef.current ||
        isMountedGracePeriod.current ||
        isGlobalScrollLocked()
      ) {
        deltaAccumulatorRef.current = 0;
        return;
      }

      // If wheel paused for > 200ms, start a fresh accumulation stroke
      if (timeSinceLast > 200) {
        deltaAccumulatorRef.current = 0;
      }

      deltaAccumulatorRef.current += e.deltaY;
      const SCROLL_THRESHOLD = 70; // Deliberate threshold to catch and prevent inertia skipping

      if (deltaAccumulatorRef.current > SCROLL_THRESHOLD) {
        deltaAccumulatorRef.current = 0;
        handleScrollDown();
      } else if (deltaAccumulatorRef.current < -SCROLL_THRESHOLD) {
        deltaAccumulatorRef.current = 0;
        handleScrollUp();
      }

      clearTimeout(decayTimer);
      decayTimer = setTimeout(() => {
        deltaAccumulatorRef.current = 0;
      }, 150);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        isTransitioningRef.current ||
        isMountedGracePeriod.current ||
        isGlobalScrollLocked()
      ) {
        return;
      }

      const deltaY = touchStartY - e.touches[0].clientY;
      const TOUCH_THRESHOLD = 60;

      if (deltaY > TOUCH_THRESHOLD) {
        touchStartY = e.touches[0].clientY;
        handleScrollDown();
      } else if (deltaY < -TOUCH_THRESHOLD) {
        touchStartY = e.touches[0].clientY;
        handleScrollUp();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      clearTimeout(decayTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onBack, onComplete]);

  // Card motion variants for smooth scroll-driven vertical reveal
  const cardVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      y: dir >= 0 ? 85 : -70,
      scale: 0.94,
    }),
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      opacity: 0,
      y: dir >= 0 ? -70 : 85,
      scale: 0.94,
    }),
  };

  const leftTextVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: -25,
      y: dir >= 0 ? 20 : -20,
    }),
    center: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: -15,
      y: dir >= 0 ? -20 : 20,
    }),
  };

  const rightTextVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: 25,
      y: dir >= 0 ? 20 : -20,
    }),
    center: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: 15,
      y: dir >= 0 ? -20 : 20,
    }),
  };

  return (
    <section className="h-full w-full bg-[#07080b] text-white overflow-hidden relative select-none flex flex-col justify-between items-center">
      {/* ── Background Subtle Ambient Blue/Purple Glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* ── Top Hero Headline (Fades out when scrolled down into card details) ── */}
      <motion.div
        animate={{
          opacity: isPoppedUp ? 0 : 1,
          y: isPoppedUp ? -45 : 0,
          scale: isPoppedUp ? 0.94 : 1,
        }}
        transition={{ duration: 0.6, ease: MOTION_EASING }}
        style={{ pointerEvents: isPoppedUp ? "none" : "auto" }}
        className="relative z-20 flex flex-col items-center text-center px-4 pt-8 sm:pt-12 md:pt-16 lg:pt-20 max-w-4xl lg:max-w-5xl mx-auto flex-shrink-0"
      >
        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl md:text-[3.25rem] lg:text-[3.85rem] xl:text-[4.25rem] font-semibold text-white tracking-tight leading-[1.14] flex flex-col items-center">
            <span>Services That Make</span>
            <span className="mt-0.5 sm:mt-1">
              <span
                className="font-serif italic font-normal text-[#56A6FF]"
                style={{
                  fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
                }}
              >
                Magic
              </span>{" "}
              Happen
            </span>
          </h1>
        </div>

        <p className="mt-2.5 sm:mt-3 text-base sm:text-lg md:text-xl lg:text-[1.25rem] text-white/70 max-w-2xl leading-relaxed font-normal tracking-wide">
          And Seriously Grow Your Business
        </p>
      </motion.div>

      {/* ── Floating Left Tag (Designer) ── */}
      <motion.div
        animate={{
          opacity: isPoppedUp ? 0 : 1,
          y: isPoppedUp ? -15 : [0, -7, 0],
        }}
        transition={{
          opacity: { duration: 0.35 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden md:flex absolute top-[38%] md:top-[40%] left-[6%] lg:left-[10%] z-30 pointer-events-auto cursor-pointer group"
        style={{ pointerEvents: isPoppedUp ? "none" : "auto" }}
      >
        <div className="relative inline-flex items-center">
          <div className="px-4 py-1.5 rounded-full bg-[#5ba4e6] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_20px_rgba(91,164,230,0.4)] group-hover:scale-105 transition-transform flex items-center justify-center">
            Designer
          </div>
          <div className="absolute -top-4.5 -right-5.5 drop-shadow-[0_2px_10px_rgba(91,164,230,0.6)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform -scale-x-100 pointer-events-none">
            <MousePointer2
              size={32}
              fill="#5ba4e6"
              color="#000000"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Floating Right Tag (Developer) ── */}
      <motion.div
        animate={{
          opacity: isPoppedUp ? 0 : 1,
          y: isPoppedUp ? 15 : [0, 7, 0],
        }}
        transition={{
          opacity: { duration: 0.35 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        }}
        className="hidden md:flex absolute top-[44%] md:top-[46%] right-[6%] lg:right-[10%] z-30 pointer-events-auto cursor-pointer group"
        style={{ pointerEvents: isPoppedUp ? "none" : "auto" }}
      >
        <div className="relative inline-flex items-center">
          <div className="absolute -top-4.5 -left-5.5 drop-shadow-[0_2px_10px_rgba(91,164,230,0.6)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform pointer-events-none">
            <MousePointer2
              size={32}
              fill="#5ba4e6"
              color="#000000"
              strokeWidth={1.5}
            />
          </div>
          <div className="px-4 py-1.5 rounded-full bg-[#5ba4e6] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_20px_rgba(91,164,230,0.4)] group-hover:scale-105 transition-transform flex items-center justify-center">
            Developer
          </div>
        </div>
      </motion.div>

      {/* ── LEFT SUPPORTING TEXT (Revealed beside card when centered, NO callout box) ── */}
      <motion.div
        animate={{
          opacity: isPoppedUp ? 1 : 0,
          x: isPoppedUp ? 0 : -45,
          pointerEvents: isPoppedUp ? "auto" : "none",
        }}
        transition={{ duration: 0.6, ease: MOTION_EASING }}
        className="hidden md:flex flex-col justify-center absolute top-1/2 -translate-y-1/2 right-[calc(50%+195px)] sm:right-[calc(50%+215px)] md:right-[calc(50%+235px)] lg:right-[calc(50%+255px)] w-[280px] sm:w-[310px] md:w-[340px] lg:w-[370px] z-30 text-left"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`left-${active.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: MOTION_EASING }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#5ba4e6] shadow-[0_0_8px_#5ba4e6]" />
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                {active.leftCategory}
              </h4>
            </div>

            {/* 4 Clean Points directly on canvas with glowing cyan bullets */}
            <ul className="space-y-3.5 sm:space-y-4">
              {active.leftServices.map((item, i) => (
                <li key={i} className="group/item flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#5ba4e6] mt-1.5 shrink-0 shadow-[0_0_8px_#5ba4e6] group-hover/item:scale-125 transition-transform" />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-white/95 group-hover/item:text-[#5ba4e6] transition-colors leading-snug">
                      {item.name}
                    </p>
                    <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── RIGHT SUPPORTING TEXT (Revealed beside card when centered, NO callout box) ── */}
      <motion.div
        animate={{
          opacity: isPoppedUp ? 1 : 0,
          x: isPoppedUp ? 0 : 45,
          pointerEvents: isPoppedUp ? "auto" : "none",
        }}
        transition={{ duration: 0.6, ease: MOTION_EASING }}
        className="hidden md:flex flex-col justify-center absolute top-1/2 -translate-y-1/2 left-[calc(50%+195px)] sm:left-[calc(50%+215px)] md:left-[calc(50%+235px)] lg:left-[calc(50%+255px)] w-[280px] sm:w-[310px] md:w-[340px] lg:w-[370px] z-30 text-left"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`right-${active.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: MOTION_EASING }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#5ba4e6] shadow-[0_0_8px_#5ba4e6]" />
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                {active.rightCategory}
              </h4>
            </div>

            {/* 4 Clean Points directly on canvas with glowing cyan bullets */}
            <ul className="space-y-3.5 sm:space-y-4">
              {active.rightServices.map((item, i) => (
                <li key={i} className="group/item flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#5ba4e6] mt-1.5 shrink-0 shadow-[0_0_8px_#5ba4e6] group-hover/item:scale-125 transition-transform" />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-white/95 group-hover/item:text-[#5ba4e6] transition-colors leading-snug">
                      {item.name}
                    </p>
                    <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN CONTINUOUS STAGE
          - Exactly one continuous coordinate space (no new section!)
          - The Center Card physically GLIDES UP to the exact screen center
          - Side cards fade out as center card rises
          - All 3 cards cycle smoothly according to scroll (Marketing -> Technology -> Experience)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full flex items-end justify-center h-[280px] sm:h-[310px] md:h-[350px] lg:h-[380px] overflow-visible">
        {/* ── CARD 1: Technology (Left Card - Fades out as center card rises up) ── */}
        <motion.div
          animate={{
            opacity: isPoppedUp ? 0 : 1,
            x: isPoppedUp ? -80 : 0,
            scale: isPoppedUp ? 0.9 : 1,
            pointerEvents: isPoppedUp ? "none" : "auto",
          }}
          transition={{ duration: 0.5, ease: MOTION_EASING }}
          className="absolute z-20"
        >
          <AvatarDeckCard
            number="02"
            title="Technology"
            subtitle="Web, Mobile & Cloud Systems Engineered for High Speed and Scale"
            iconType="technology"
            zIndex={20}
            animateY={18}
            initialRotate={0}
            animateRotate={-12}
            hoverY={4}
            onClick={() => goToStage(1, 1)}
            className="bottom-[-75px] sm:bottom-[-90px] md:bottom-[-105px] lg:bottom-[-120px] left-1/2 -translate-x-[245px] sm:-translate-x-[305px] md:-translate-x-[355px] lg:-translate-x-[395px]"
          />
        </motion.div>

        {/* ── CARD 2: CENTER HERO CARD — GLIDES TO THE EXACT VERTICAL CENTER ── */}
        <motion.div
          animate={{
            y: isPoppedUp ? "-36vh" : "0vh",
            scale: isPoppedUp ? 1.04 : 1,
          }}
          transition={{ duration: 0.65, ease: MOTION_EASING }}
          onClick={() => {
            if (isPoppedUp) goToStage(-1, -1);
            else goToStage(0, 1);
          }}
          className="cursor-pointer z-30 absolute bottom-[-60px] sm:bottom-[-75px] md:bottom-[-90px] lg:bottom-[-105px] left-1/2 -translate-x-1/2"
          title={isPoppedUp ? "Click to lower card" : "Click to view details"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: isPoppedUp ? 25 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4, ease: MOTION_EASING }}
            >
              <AvatarDeckCard
                number={active.number}
                title={active.title}
                subtitle={active.subtitle}
                iconType={active.id}
                badge={active.badge}
                isCenter
                zIndex={30}
                animateY={0}
                initialRotate={0}
                animateRotate={0}
                isRelative
                className="shadow-[0_25px_60px_-10px_rgba(91,164,230,0.35),0_20px_50px_rgba(0,0,0,0.85)]"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── CARD 3: Experience Design (Right Card - Fades out as center card rises up) ── */}
        <motion.div
          animate={{
            opacity: isPoppedUp ? 0 : 1,
            x: isPoppedUp ? 80 : 0,
            scale: isPoppedUp ? 0.9 : 1,
            pointerEvents: isPoppedUp ? "none" : "auto",
          }}
          transition={{ duration: 0.5, ease: MOTION_EASING }}
          className="absolute z-20"
        >
          <AvatarDeckCard
            number="03"
            title="Experience Design"
            subtitle="Human-Centered Digital Product Design and Visual Identity Systems"
            iconType="experience"
            zIndex={20}
            animateY={18}
            initialRotate={0}
            animateRotate={12}
            hoverY={4}
            onClick={() => goToStage(2, 1)}
            className="bottom-[-75px] sm:bottom-[-90px] md:bottom-[-105px] lg:bottom-[-120px] left-1/2 translate-x-[25px] sm:translate-x-[40px] md:translate-x-[55px] lg:translate-x-[75px]"
          />
        </motion.div>
      </div>

      {/* ── ACTIVE 3-CARD INDICATOR (Clean modern sans-serif typography, no monospace) ── */}
      {isPoppedUp && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none"
        >
          {/* Segmented Interactive 3-Card Pill Indicators */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-lg shadow-black/20">
            {SERVICE_DETAILS.map((item, idx) => {
              const isActive = idx === stage;
              return (
                <button
                  key={item.id}
                  onClick={() => goToStage(idx, idx > stage ? 1 : -1)}
                  className="group relative flex items-center justify-center py-1 cursor-pointer focus:outline-none"
                  title={`View ${item.title} (${idx + 1} of ${SERVICE_DETAILS.length})`}
                >
                  <motion.div
                    animate={{
                      width: isActive ? 32 : 8,
                      backgroundColor: isActive
                        ? "#5ba4e6"
                        : "rgba(255, 255, 255, 0.25)",
                    }}
                    transition={{ duration: 0.35, ease: MOTION_EASING }}
                    className={`h-2 rounded-full transition-colors ${
                      isActive
                        ? "shadow-[0_0_12px_rgba(91,164,230,0.9)]"
                        : "group-hover:bg-white/45"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Bottom Deck Rest Prompt (Only shown at rest) ── */}
      {!isPoppedUp && (
        <button
          onClick={() => goToStage(0, 1)}
          className="relative z-30 flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors tracking-wide pb-3 cursor-pointer focus:outline-none"
        >
          <span>Scroll down</span>
          <ChevronDown size={14} className="text-[#5ba4e6] animate-bounce" />
        </button>
      )}
    </section>
  );
}
