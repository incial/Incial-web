'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ringClass = 'absolute rounded-full border-[1px] border-white/14 pointer-events-none';



const circleTraceTransitions = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1] as const,
};

const circleRadii = [162, 392, 586] as const;

export default function LearnLandingSlide() {
  const reduce = useReducedMotion();
  const [strokeWidths, setStrokeWidths] = useState<[number, number, number]>([2, 38, 1.5]);

  useEffect(() => {
    const calculateResponsiveStrokeWidths = () => {
      // Get 1vw and 1vh in pixels
      const vwPx = window.innerWidth * 0.01;
      const vhPx = window.innerHeight * 0.01;

      // SVG scales with min(172vw, 172vh), matching the Tailwind class
      const effectiveSvgSize = Math.min(vwPx * 172, vhPx * 172);

      // Responsive 5cm target: CSS 1cm ≈ 37.7952755906 px (96dpi standard)
      const cmPx = 37.7952755906;
      const desiredCm = 5; // target 5 cm
      const desiredPx = desiredCm * cmPx;

      // Scale desired pixel value according to SVG size relative to viewBox (1200 reference)
      const peakUnclamped = desiredPx * (effectiveSvgSize / 1200);

      // Clamp to reasonable visual bounds across very small/very large screens
      const peak = Math.max(Math.min(peakUnclamped, 380), 24);

      const thinStart = Math.max(effectiveSvgSize * 0.007, 1.2); // thin starting edge
      const thinEnd = Math.max(effectiveSvgSize * 0.005, 1.0);   // thin final settling

      setStrokeWidths([thinStart, peak, thinEnd]);
    };

    calculateResponsiveStrokeWidths();
    window.addEventListener('resize', calculateResponsiveStrokeWidths);
    return () => window.removeEventListener('resize', calculateResponsiveStrokeWidths);
  }, []);

  const polarToCartesian = (radius: number, angleDeg: number) => {
    const angle = (angleDeg * Math.PI) / 180;
    return {
      x: Math.round(radius * Math.sin(angle)),
      y: Math.round(-radius * Math.cos(angle)),
    };
  };

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black font-['Poppins',sans-serif] text-white">
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.08, ease: 'easeOut' }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[#000000]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,80,160,0.016),transparent_42%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.008),transparent_20%)]" />
        <div className="absolute left-1/2 top-1/2 h-[30vh] w-[30vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7850a0]/2 blur-[80px]" />
      </motion.div>

      {reduce ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-x-0 bottom-0 flex items-end justify-center"
            style={{ height: '90vh' }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{ transform: 'translateY(34vh) scale(0.92)' }}
            >
              <div
                className={ringClass}
                style={{ width: 'min(200vw, 950px, 130dvh)', height: 'min(200vw, 950px, 130dvh)' }}
              />
              <div className="absolute z-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <h1 className="text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl md:text-[5rem]">
                    Learn<span className="relative">Tog</span>ether
                  </h1>
                </div>
                <p className="mt-2 text-2xl font-medium text-[#89C6FF] sm:text-3xl">by incial</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 320, opacity: 0, scale: 0.72 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.08, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.svg
              className="absolute left-1/2 top-1/2 z-0 h-[min(172vw,172vh)] w-[min(172vw,172vh)] max-h-none max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              width="1400"
              height="1400"
              viewBox="0 0 1200 1200"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Upward reveal mask: circles are revealed from below as one system */}
              <motion.g clipPath="url(#circleRevealClip)">
                {circleRadii.map((radius) => (
                  <g key={`group-${radius}`}>
                    <g clipPath={`url(#innerClip-${radius})`}>
                      <motion.circle
                        cx="600"
                        cy="600"
                        r={radius}
                        fill="none"
                        stroke="rgba(200, 150, 255, 0.18)"
                        strokeLinecap="round"
                        animate={{ strokeWidth: strokeWidths }}
                        transition={{
                          ...circleTraceTransitions,
                          times: [0, 0.35, 1]
                        }}
                      />
                    </g>

                    {/* Stable outer boundary stays on top so outer edge doesn't shift */}
                    <circle
                      cx="600"
                      cy="600"
                      r={radius}
                      fill="none"
                      stroke="rgba(200, 150, 255, 0.18)"
                      strokeWidth={1.25}
                    />
                  </g>
                ))}
              </motion.g>

              <defs>
                <clipPath id="circleRevealClip">
                  <motion.rect
                    x="0"
                    width="1200"
                    height="1200"
                    initial={{ y: 1200 }}
                    animate={{ y: 0 }}
                    transition={circleTraceTransitions}
                  />
                </clipPath>
                {circleRadii.map((radius) => (
                  <clipPath key={`clip-${radius}`} id={`innerClip-${radius}`}>
                    <circle cx="600" cy="600" r={radius} />
                  </clipPath>
                ))}
              </defs>
            </motion.svg>

            <motion.div
              initial={{ opacity: 0, y: 8, scaleY: 0.94 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <motion.h1
                  initial={{ y: 26, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl font-bold leading-none tracking-tight text-white sm:text-4xl md:text-5xl"
                >
                  Learn
                  <span className="relative">
                    <motion.div
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute z-20 transform scale-x-[-1] drop-shadow-[0_0_10px_rgba(255,60,60,0.28)]"
                      style={{
                        fontSize: '0.7em',
                        bottom: '75%',
                        right: '75%',
                        rotate: '-20deg',
                        filter: 'saturate(1.8) brightness(1.08) contrast(1.12)',
                      }}
                    >
                      📌
                    </motion.div>
                    Tog
                  </span>
                  ether
                </motion.h1>

                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-1.5 text-lg font-medium text-[#89C6FF] sm:text-xl"
                >
                  by incial
                </motion.p>
              </div>

              {
                (() => {
                  const raw = [
                    { id: 'i1', emoji: '🎉', size: 64, scale: 1, ...polarToCartesian(240, -105) },
                    { id: 'i2', emoji: '🖌️', size: 68, scale: 1, ...polarToCartesian(245, 102) },
                    { id: 'i3', emoji: '💡', size: 72, scale: 1, ...(() => {
                      const chartPosition = polarToCartesian(200, 32);
                      const bulbPosition = polarToCartesian(205, -38);

                      return { x: bulbPosition.x, y: chartPosition.y };
                    })() },
                    { id: 'i4', emoji: '📈', size: 70, scale: 1, ...polarToCartesian(200, 32) },
                    { id: 'i5', emoji: '📖', size: 84, scale: 0.92, ...polarToCartesian(225, -138) },
                    { id: 'i6', emoji: '💻', size: 86, scale: 0.9, ...polarToCartesian(194, 140) },
                  ];

                  // Determine min/max final Y to compute delays so lower items can settle earlier
                  const ys = raw.map((r) => r.y);
                  const minY = Math.min(...ys);
                  const maxY = Math.max(...ys);
                  const range = Math.max(1, maxY - minY);

                  const maxStagger = 0.5; // seconds of stagger across items

                  // precompute delays so we can synchronize a subset of icons
                  const computed = raw.map((it) => {
                    const norm = (it.y - minY) / range; // 0..1 lowest->highest
                    const d = (1 - norm) * maxStagger * 0.9; // slightly bias
                    return d;
                  });

                  // reference delay: use the delay currently used by the 🎉 (i1) / 🖌️ (i2) group
                  const refIndex = raw.findIndex((r) => r.id === 'i1');
                  const referenceDelay = refIndex >= 0 ? computed[refIndex] : 0;

                  return raw.map((it, idx) => {
                    // synchronize these four icons to the reference delay
                    const syncIds = new Set(['i1', 'i2', 'i3', 'i4']);
                    const delay = syncIds.has(it.id) ? referenceDelay : computed[idx];

                    return (
                      <motion.div
                        key={it.id}
                        initial={{ x: 0, y: 180, opacity: 0, scale: 0.68 }}
                        animate={{ x: it.x, y: it.y, opacity: 1, scale: 1 }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
                        className="absolute left-1/2 top-1/2 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 text-4xl md:text-5xl drop-shadow-2xl"
                        style={{ width: it.size, height: it.size }}
                      >
                        <div className="flex h-full w-full items-center justify-center" style={{ transform: it.scale ? `scale(${it.scale})` : undefined }}>
                          {it.emoji}
                        </div>
                      </motion.div>
                    );
                  });
                })()
              }
            </motion.div>
          </motion.div>
        </motion.div>
      )}


    </section>
  );
}