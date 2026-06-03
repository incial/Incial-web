'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
  hideNav?: boolean;
}

const Itsaboutbuild = ({ onNext, onPrev, hideNav }: SlideProps) => {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-black font-['Poppins',sans-serif] text-white">
      {/* Left Blue Line */}
     

      {/* Large Outer Arc */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute left-[-400px] top-[-40px] h-[890px] w-[890px] rounded-full border border-[#E67676]"
      />

      {/* Inner Arc */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.1 }}
        className="absolute left-[-120px] top-[180px] h-[360px] w-[360px] rounded-full border border-[#E67676]"
      />

      {/* Main Content */}
      <div className="relative z-10 flex w-full items-center gap-57 px-8 sm:px-14 md:px-20 lg:px-28">
        {/* Left Text */}
        <div className="mt-10">
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[36px]"
          >
            It’s Not Just Teaching
          </motion.h1>
        </div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-[420px]"
        >
          <h2 className="text-[30px] font-semibold tracking-[-0.03em]">
            It’s about building.
          </h2>

          <p className="mt-5 text-[14px] text-white/60">
            LearnTogether is designed as:
          </p>

          <div className="mt-6 space-y-3 text-[16px] font-medium text-[#E67676]">
            <p>A Learning Hub</p>
            <p>A Maker Space</p>
            <p>A Collaborative Community</p>
          </div>

          <p className="mt-6 text-[14px] leading-relaxed text-white/60">
            Students don’t just consume knowledge, they create with it.
          </p>
        </motion.div>
      </div>

      {/* Navigation */}
      {!hideNav && (
        <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-5 text-white/70">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPrev}
            className="transition"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="transition"
          >
            <ArrowDown size={18} strokeWidth={2} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Itsaboutbuild;