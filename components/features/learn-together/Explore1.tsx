'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

const Explore1 = ({ onNext, onPrev }: SlideProps) => {
  const [showLine, setShowLine] = useState(false);

  const [showFirstLabel, setShowFirstLabel] = useState(false);
  const [showSecondLabel, setShowSecondLabel] = useState(false);
  const [showThirdLabel, setShowThirdLabel] = useState(false);
  const [showFourthLabel, setShowFourthLabel] = useState(false);

  const lineGrowDurationMs = 6000;
  const lineTopPx = 300;
  const lineHeightVh = 180;
  const firstPointVh = 35;
  const secondPointVh = 75;
  const thirdPointVh = 115;
  const fourthPointVh = 155;

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLine(true), 280);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-explore-scrollbar', 'true');
    styleTag.textContent = `
      html, body {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      styleTag.remove();
    };
  }, []);

  useEffect(() => {
    if (!showLine) return;

    let rafId = 0;
    const start = window.performance.now();

    const lineHeightPx = window.innerHeight * (lineHeightVh / 100);

    const firstLabelOffsetPx = window.innerHeight * (firstPointVh / 100);
    const secondLabelOffsetPx = window.innerHeight * (secondPointVh / 100);
    const thirdLabelOffsetPx = window.innerHeight * (thirdPointVh / 100);
    const fourthLabelOffsetPx = window.innerHeight * (fourthPointVh / 100);

    const step = (now: number) => {
      const progress = Math.min(
        (now - start) / lineGrowDurationMs,
        1
      );

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      window.scrollTo({
        top: maxScroll * progress,
        behavior: 'auto',
      });

      const grownPx = lineHeightPx * progress;

      if (!showFirstLabel && grownPx >= firstLabelOffsetPx) {
        setShowFirstLabel(true);
      }

      if (!showSecondLabel && grownPx >= secondLabelOffsetPx) {
        setShowSecondLabel(true);
      }

      if (!showThirdLabel && grownPx >= thirdLabelOffsetPx) {
        setShowThirdLabel(true);
      }

      if (!showFourthLabel && grownPx >= fourthLabelOffsetPx) {
        setShowFourthLabel(true);
      }

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [showLine, lineGrowDurationMs, lineHeightVh, lineTopPx, firstPointVh, secondPointVh, thirdPointVh, fourthPointVh]);

  return (
    <div className="relative flex min-h-[260vh] w-full justify-center overflow-hidden bg-black px-6 pt-[120px] font-['Poppins']">
      <div className="relative w-full max-w-[1400px]">

        {/* EXPLORE TITLE */}
        <div className="fixed left-6 top-6 z-30">
          <h2 className="text-[42px] font-semibold tracking-tight text-white">
            Explore
          </h2>
        </div>

        {/* CENTER WRAPPER */}
        <div className="relative mx-auto w-[500px]">

          {/* ===================================== */}
          {/* TOP CIRCLE HERO */}
          {/* ===================================== */}

          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="relative h-[360px] w-[360px]">

              {/* OUTER */}
              <div className="absolute inset-0 rounded-full border border-[rgba(115,210,140,0.7)]" />

              {/* INNER */}
              <div className="absolute left-1/2 top-1/2 h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(115,210,140,0.7)]" />

              {/* STEM */}
              <div className="absolute left-1/2 top-[223px] h-[150px] w-[2px] -translate-x-1/2 bg-[rgba(115,210,140,0.7)]" />
            </div>
          </div>

          {/* ===================================== */}
          {/* MAIN LINE */}
          {/* ===================================== */}

          <AnimatePresence>
            {showLine && (
              <motion.div
                className="absolute left-1/2 top-[300px] w-[2px] -translate-x-1/2 bg-[rgba(115,210,140,0.75)]"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: `${lineHeightVh}vh`,
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  height: {
                    duration: 6,
                    ease: 'linear',
                  },
                  opacity: {
                    duration: 0.4,
                  },
                }}
              />
            )}
          </AnimatePresence>

          {/* ===================================== */}
          {/* DESIGN */}
          {/* ===================================== */}

          <div
            className="absolute left-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(115,210,140,0.75)] bg-black z-20"
            style={{ top: `calc(${lineTopPx}px + ${firstPointVh}vh)` }}
          />

          {showFirstLabel && (
            <>
              {/* TEXT */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute left-1/2 w-[420px] translate-x-[20px] -translate-y-1/2"
                style={{ top: `calc(${lineTopPx}px + ${firstPointVh}vh)` }}
              >
                <h3 className="text-[42px] font-semibold leading-none tracking-tight text-white">
                  Design
                </h3>

                <p className="mt-3 text-[15px] leading-[1.7] font-light text-white/60">
                  Branding, UI/UX, visual systems,
                  creative thinking.
                </p>
              </motion.div>

              {/* EMOJI */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="absolute left-1/2 translate-x-[440px]"
                style={{ top: `calc(${lineTopPx}px + ${firstPointVh}vh - 40px)` }}
              >
                <span className="text-[110px]">🖌️</span>
              </motion.div>
            </>
          )}

          {/* ===================================== */}
          {/* TECHNOLOGY */}
          {/* ===================================== */}

          <div
            className="absolute left-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(115,210,140,0.75)] bg-black z-20"
            style={{ top: `calc(${lineTopPx}px + ${secondPointVh}vh)` }}
          />

          {showSecondLabel && (
            <>
              {/* TEXT */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute left-1/2 w-[420px] -translate-x-[430px] -translate-y-1/2 text-right"
                style={{ top: `calc(${lineTopPx}px + ${secondPointVh}vh)` }}
              >
                <h3 className="text-[42px] font-semibold leading-none tracking-tight text-white">
                  Technology
                </h3>

                <p className="mt-3 text-[15px] leading-[1.7] font-light text-white/60">
                  Digital tools, product building,
                  automation, systems.
                </p>
              </motion.div>

              {/* EMOJI */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="absolute left-1/2 -translate-x-[380px]"
                style={{ top: `calc(${lineTopPx}px + ${secondPointVh}vh + 110px)` }}
              >
                <span className="text-[120px]">💻</span>
              </motion.div>
            </>
          )}
          <div
            className="absolute left-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(115,210,140,0.75)] bg-black z-20"
            style={{ top: `calc(${lineTopPx}px + ${thirdPointVh}vh)` }}
          />

          {showThirdLabel && (
            <>
              {/* TEXT */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute left-1/2 w-[420px] translate-x-[20px] -translate-y-1/2"
                style={{ top: `calc(${lineTopPx}px + ${thirdPointVh}vh)` }}
              >
                <h3 className="text-[42px] font-semibold leading-none tracking-tight text-white">
                  Marketing
                </h3>

                <p className="mt-3 text-[15px] leading-[1.7] font-light text-white/60">
                  Strategy, social growth,
                  campaign execution,
                  storytelling.
                </p>
              </motion.div>

              {/* MEGAPHONE */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="absolute left-1/2 translate-x-[280px]"
                style={{ top: `calc(${lineTopPx}px + ${thirdPointVh}vh - 150px)` }}
              >
                <span className="text-[100px]">📣</span>
              </motion.div>
            </>
          )}

          {/* ===================================== */}
          {/* CREATIVE SKILLS */}
          {/* ===================================== */}


          {/* CENTER CIRCLES */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ top: `calc(${lineTopPx}px + ${fourthPointVh}vh + 150px)` }}
          >
            <div className="relative h-[260px] w-[260px]">

              {/* OUTER */}
              <div className="absolute inset-0 rounded-full border border-[rgba(115,210,140,0.7)]" />

              {/* MIDDLE */}
              <div className="absolute left-1/2 top-1/2 h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(115,210,140,0.7)]" />

              {/* INNER */}
              <div className="absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(115,210,140,0.9)] bg-black" />
            </div>
          </div>

          <div
            className="absolute left-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(115,210,140,0.75)] bg-black z-20"
            style={{ top: `calc(${lineTopPx}px + ${fourthPointVh}vh)` }}
          />

          {showFourthLabel && (
            <>
              {/* TEXT */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute left-1/2 w-[420px] -translate-x-[430px] -translate-y-1/2 text-right"
                style={{ top: `calc(${lineTopPx}px + ${fourthPointVh}vh)` }}
              >
                <h3 className="text-[42px] font-semibold leading-none tracking-tight text-white">
                  Creative Skills
                </h3>

                <p className="mt-3 text-[15px] leading-[1.7] font-light text-white/60">
                  Ideation, presentation,
                  communication, execution.
                </p>
              </motion.div>

              {/* BULB */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="absolute left-1/2 -translate-x-[320px]"
                style={{ top: `calc(${lineTopPx}px + ${fourthPointVh}vh + 140px)` }}
              >
                <span className="text-[90px]">💡</span>
              </motion.div>
            </>
          )}

          {/* ===================================== */}
          {/* MARKETING */}
          {/* ===================================== */}

         
        </div>
      </div>
    </div>
  );
};

export default Explore1;