'use client';

import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function SkillsTogetherSlide({ onNext, onPrev }: SlideProps) {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [rightOffset, setRightOffset] = useState(() => {
    if (typeof window === 'undefined') return 0;
    if (window.innerWidth < 768) return 0;
    if (window.innerWidth < 1024) return Math.max(20, Math.min(20, window.innerWidth * 0.175));
    return Math.max(20, Math.min(20, window.innerWidth * 0.06));
  });
  const [leftTarget, setLeftTarget] = useState(() => {
    if (typeof window === 'undefined') return 0;
    if (window.innerWidth < 768) return -Math.max(20, Math.min(20, Math.round(window.innerWidth * 0.175)));
;
    if (window.innerWidth < 1155) return -Math.max(20, Math.min(20, Math.round(window.innerWidth * 0.1)));
    return -Math.max(90, Math.min(80, Math.round(window.innerWidth * 0.175)));
  });

  useEffect(() => {
    // Calculate responsive right offset (~5cm ≈ 189px)
    const updateOffset = () => {
      // if (window.innerWidth < 768) {
      //   setRightOffset(0);
      // setLeftTarget(-Math.max(100, Math.min(800, Math.round(window.innerWidth * 0.175))));
      //   return;
      // }

      // if (window.innerWidth < 1024) {
      //   setRightOffset(Math.max(40, Math.min(110, window.innerWidth * 0.05)));
      //   setLeftTarget(-Math.max(100, Math.min(160, Math.round(window.innerWidth * 0.1))));
      //   return;
      // }

      // setRightOffset(Math.max(80, Math.min(189, window.innerWidth * 0.06)));
      // setLeftTarget(-Math.max(100, Math.min(150, Math.round(window.innerWidth * 0.175))));
    };
    
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  const headingControls = useAnimation();

  useEffect(() => {
    let mounted = true;

    async function runSequence() {
      // Ensure heading is positioned at offset immediately (no animation)
      await headingControls.set({ x: 200, y: 28, opacity: 0 });

      // Rise in from the bottom
      await headingControls.start({ y: 0, opacity: 1 }, { duration: 0.6, ease: [0.6, 0.4, 0.3, 1]});

      // Hold static for 1s
      await new Promise((res) => setTimeout(res, 1000));

      if (!mounted) return;

      // Flip transition state (triggers color and content reveals)
      setIsTransitioned(true);

      // Then animate slide to left over 1s to the responsive left target
      await headingControls.start({ x: leftTarget }, { duration: 1, ease: [0.22, 1, 0.36, 1] });
    }

    runSequence();

    return () => {
      mounted = false;
      headingControls.stop();
    };
  }, [rightOffset, headingControls, leftTarget]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black overflow-x-hidden overflow-y-hidden px-6 sm:px-10 md:px-16 lg:pl-28 lg:pr-20 xl:pl-44 xl:pr-24 2xl:pl-56 2xl:pr-28 font-['Poppins',sans-serif] transform-gpu origin-center lg:scale-[0.9] xl:scale-[0.86] 2xl:scale-[0.82]">
      
      {/* Background glow matching landing slide */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,80,160,0.08),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-[1440px] flex flex-col items-center">
        
        {/* Upper content area with transition */}
        <div className="w-full flex flex-col md:flex-row items-center gap-10 md:gap-0 min-h-[40vh]">
          
          {/* Left Column: Heading */}
          <motion.div 
            animate={headingControls}
            initial={false}
            className={`flex flex-col w-full ${isTransitioned ? 'md:w-3/5 md:text-left md:items-start text-center items-center' : 'text-center items-center'}`}
          >
            <h2 className="text-[clamp(2.2rem,6.2vw,5.25rem)] sm:text-[clamp(2.6rem,5.8vw,5rem)] md:text-[clamp(2.8rem,5.2vw,5.1rem)] lg:text-[clamp(3.4rem,5.6vw,5.5rem)] font-bold leading-[1.1] tracking-tight text-white uppercase">
              <span className="whitespace-nowrap">Where Skills</span> <br />
              <motion.span 
                animate={{ color: isTransitioned ? '#4ADE80' : '#FFFFFF' }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                Are Built
              </motion.span> <br />
              <motion.span 
                animate={{ color: isTransitioned ? '#FB7185' : '#FFFFFF' }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                Together.
              </motion.span>
            </h2>
          </motion.div>

          {/* Right Column: Description */}
          <div className="md:w-[46%] mt-6 md:mt-0 flex items-center justify-center md:justify-start md:pl-10 lg:pl-16 xl:pl-20">
            <AnimatePresence>
              {isTransitioned && (
                <motion.div
                  initial={{ opacity: 0, x: rightOffset - leftTarget }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-[34rem]"
                >
                  <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-[1.5] font-medium text-center md:text-right">
                    <span className="block whitespace-nowrap">LearnTogether is Incial&apos;s learning</span>
                    <span className="block whitespace-nowrap">initiative designed to help students</span>
                    <span className="block whitespace-nowrap">move beyond theory and start</span>
                    <span className="block whitespace-nowrap">building real-world skills.</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Center-Bottom Section */}
        <div className="mt-10 sm:mt-14 lg:mt-16 w-full flex flex-col items-center text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium"
          >
            Explore Workshops
          </motion.button>
          
          <p className="mt-6 sm:mt-8 text-sm text-white/60 max-w-xs text-center">
            We don&apos;t just teach concepts.<br></br> We help you create with them.
          </p>
        </div>

      </div>
    </div>
  );
}
