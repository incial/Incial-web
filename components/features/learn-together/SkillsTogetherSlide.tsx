'use client';

import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function SkillsTogetherSlide({ onNext, onPrev }: SlideProps) {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [rightOffset, setRightOffset] = useState(() => {
    if (typeof window === 'undefined') return 120;
    return Math.max(80, Math.min(189, window.innerWidth * 0.06));
  });
  const [leftTarget, setLeftTarget] = useState(() => {
    if (typeof window === 'undefined') return -285;
    return -Math.max(175, Math.min(335, Math.round(window.innerWidth * 0.175)));
  });

  useEffect(() => {
    // Calculate responsive right offset (~5cm ≈ 189px)
    const updateOffset = () => {
      const offset = Math.max(80, Math.min(189, window.innerWidth * 0.06));
      setRightOffset(offset);
      const left = -Math.max(175, Math.min(335, Math.round(window.innerWidth * 0.175)));
      setLeftTarget(left);
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
      await headingControls.set({ x: rightOffset });

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
    <div className="relative flex h-screen w-full items-center justify-center bg-black overflow-x-hidden overflow-y-hidden pl-40 pr-8 md:pl-48 md:pr-20 lg:pl-56 lg:pr-32 font-['Poppins',sans-serif] transform-gpu origin-center lg:scale-[0.82] xl:scale-[0.78] 2xl:scale-[0.74]">
      
      {/* Background glow matching landing slide */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,80,160,0.08),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-[1440px] flex flex-col items-center">
        
        {/* Upper content area with transition */}
        <div className="w-full flex flex-col md:flex-row items-center min-h-[40vh]">
          
          {/* Left Column: Heading */}
          <motion.div 
            animate={headingControls}
            initial={false}
            className={`flex flex-col ${isTransitioned ? 'md:w-3/5 text-left items-start' : 'w-full text-center items-center'}`}
          >
            <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.1] tracking-tight text-white uppercase">
              <span className="whitespace-nowrap">Where Skills</span> <br />
              <motion.span 
                animate={{ color: isTransitioned ? '#4ADE80' : '#FFFFFF' }}
                transition={{ duration: 0.8, delay: isTransitioned ? 0.6 : 0 }}
                className="inline-block"
              >
                Are Built
              </motion.span> <br />
              <motion.span 
                animate={{ color: isTransitioned ? '#FB7185' : '#FFFFFF' }}
                transition={{ duration: 0.8, delay: isTransitioned ? 0.8 : 0 }}
                className="inline-block"
              >
                Together.
              </motion.span>
            </h2>
          </motion.div>

          {/* Right Column: Description */}
          <div className="md:w-[46%] mt-8 md:mt-0 flex items-center justify-start md:pl-20 lg:pl-32">
            <AnimatePresence>
              {isTransitioned && (
                <motion.div
                  initial={{ opacity: 0, x: 120 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="w-full max-w-[34rem]"
                >
                  <p className="text-lg md:text-xl text-gray-200 leading-[1.35] font-medium">
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
        <div className="mt-20 flex flex-col items-center text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium"
          >
            Explore Workshops
          </motion.button>
          
          <p className="mt-8 text-sm text-white/60 max-w-xs text-center lg:text-right">
            We don&apos;t just teach concepts.<br></br> We help you create with them.
          </p>
        </div>

        {/* Navigation Arrows in bottom right */}
        <div className="absolute bottom-12 right-12 flex flex-col gap-6 text-white/50">
          <motion.button 
            whileHover={{ scale: 1.2, color: '#fff' }}
            onClick={onPrev}
            className="p-2 transition-colors"
          >
            <ArrowUp size={28} strokeWidth={2} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.2, color: '#fff' }}
            onClick={onNext}
            className="p-2 transition-colors"
          >
            <ArrowDown size={28} strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
