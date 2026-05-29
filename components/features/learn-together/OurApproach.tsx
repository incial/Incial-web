'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

const OurApproach = ({ onNext, onPrev }: SlideProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-['Poppins',sans-serif] text-white pl-10">

      {/* Blue Border */}

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute left-6 top-5 leading-[0.9]"
      >
        <h1 className="text-[92px] font-bold tracking-[-0.06em] pt-[100px]">
          Our
          <br />
          Approach
        </h1>
      </motion.div>

      {/* Center Pink Dot */}
 

      {/* Bottom Left Text */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="absolute bottom-6 left-6 max-w-[370px]"
      >
        <p className="text-[12px] leading-relaxed text-white/90">
          Incial was built because we learned together.
        </p>

        <p className="mt-5 text-[12px] leading-relaxed text-white/90">
          LearnTogether exists so the next generation can
          <br />
          do the same, but faster, better, and with
          <br />
          guidance.
        </p>

        <p className="mt-5 text-[12px] leading-relaxed text-white/90">
          We believe practical learning should be
          <br />
          accessible, structured, and community-driven.
        </p>
      </motion.div>

      {/* Right Side Labels */}
      <div className="absolute right-8 top-[32%] flex flex-col items-end gap-10">
        {/* Playful */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <span className="text-[18px]">🎨</span>

          <h3 className="text-[46px] font-semibold tracking-[-0.04em] text-[#0084FF]">
            playful
          </h3>
        </motion.div>

        {/* Deeply collaborative */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex items-center gap-3"
        >
          <span className="text-[38px]">🙌🏼</span>

          <h3 className="text-[50px] font-semibold tracking-[-0.05em] text-[#FF4A4A]">
            Deeply collaborative
          </h3>
        </motion.div>

        {/* Skill-driven */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center gap-3"
        >
          <h3 className="text-[50px] font-semibold tracking-[-0.05em] text-[#39C15B]">
            Skill-driven
          </h3>

          <span className="text-[32px]">✨</span>
        </motion.div>

        {/* Outcome-focused */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex items-center gap-3"
        >
          <span className="text-[32px]">🎯</span>

          <h3 className="text-[50px] font-semibold tracking-[-0.05em] text-[#D6A62C]">
            Outcome-focused
          </h3>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-5 text-white/70">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.94 }}
          onClick={onPrev}
          className="transition"
        >
          <ArrowUp size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.94 }}
          onClick={onNext}
          className="transition"
        >
          <ArrowDown size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default OurApproach;