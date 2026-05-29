'use client';

import { motion, type Transition } from 'framer-motion';
import { ArrowUp, ArrowDown, Search, Wrench, Sparkles } from 'lucide-react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

const cardTransition: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 16,
};

const Wedont = ({ onNext, onPrev }: SlideProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-['Poppins',sans-serif] text-white">
      {/* Left Blue Line */}

      {/* Top Heading */}
      <div className="absolute left-1/2 top-10 z-20 -translate-x-1/2 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-[44px] font-semibold tracking-[-0.04em]"
        >
          We Don’t List Sessions.
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 text-[32px] font-semibold tracking-[-0.03em]"
        >
          We Design Journeys.
        </motion.h2>
      </div>

      {/* Discover Card */}
      <motion.div
        initial={{ opacity: 0, x: -120, rotate: -20 }}
        animate={{ opacity: 1, x: 0, rotate: 16 }}
        transition={{ ...cardTransition, delay: 0.1 }}
        className="absolute left-[60px] top-[180px]"
      >
        {/* Icon */}
        <div className="absolute -right-10 -top-8 z-10">
          <div className="relative">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#9CB7CC]">
              <div className="h-[42px] w-[42px] rounded-full bg-[#C7DDF0]" />
            </div>

            <div className="absolute -bottom-2 left-1/2 h-[24px] w-[10px] -translate-x-1/2 rotate-45 rounded-full bg-[#707070]" />
          </div>
        </div>

        <div className="h-[210px] w-[300px] rounded-[16px] bg-[#1682EA] px-7 py-6 shadow-2xl">
          <h3 className="text-[30px] font-semibold">Discover</h3>

          <p className="mt-10 text-[18px] leading-[1.15] text-white/95">
            Understand what the skill
            <br />
            truly means, why it matters
            <br />
            and where it’s applied.
          </p>
        </div>
      </motion.div>

      {/* Learn Card */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: -14 }}
        transition={{ ...cardTransition, delay: 0.25 }}
        className="absolute bottom-[120px] left-[470px]"
      >
        <div className="absolute -bottom-6 right-[-40px]">
          <div className="relative rotate-[25deg]">
            <div className="h-[72px] w-[72px] rounded-[14px] bg-[#90B95A]" />
            <div className="absolute left-[-6px] top-[-6px] h-[72px] w-[72px] rounded-[14px] border-[4px] border-[#C6DCA4]" />
          </div>
        </div>

        <div className="h-[210px] w-[300px] rounded-[16px] bg-[#EF4343] px-7 py-6 shadow-2xl">
          <h3 className="text-[30px] font-semibold">Learn</h3>

          <p className="mt-10 text-[18px] leading-[1.15] text-white/95">
            Break down the
            <br />
            fundamentals, tools,
            <br />
            systems, frameworks.
          </p>
        </div>
      </motion.div>

      {/* Build Card */}
      <motion.div
        initial={{ opacity: 0, x: 120, rotate: 12 }}
        animate={{ opacity: 1, x: 0, rotate: 3 }}
        transition={{ ...cardTransition, delay: 0.35 }}
        className="absolute right-[-20px] top-[150px]"
      >
        <div className="absolute -left-12 -top-10 rotate-[-20deg]">
          <Wrench size={54} className="text-[#7F8A97]" strokeWidth={2.5} />
        </div>

        <div className="h-[220px] w-[310px] rounded-[16px] bg-[#5AB561] px-7 py-6 shadow-2xl">
          <h3 className="text-[30px] font-semibold">Build</h3>

          <p className="mt-10 text-[18px] leading-[1.15] text-white/95">
            Create something real, a
            <br />
            brand identity, campaign
            <br />
            plan, prototype, workflow
            <br />
            system.
          </p>
        </div>
      </motion.div>

      {/* Apply Card */}
      <motion.div
        initial={{ opacity: 0, x: 120, y: 100, rotate: 8 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -6 }}
        transition={{ ...cardTransition, delay: 0.45 }}
        className="absolute bottom-[90px] right-[120px]"
      >
        <div className="absolute -right-6 -top-10 rotate-[20deg]">
          <Sparkles
            size={54}
            className="fill-[#F9D98B] text-[#F9D98B]"
            strokeWidth={1.8}
          />
        </div>

        <div className="h-[190px] w-[290px] rounded-[16px] bg-[#D8AB39] px-7 py-6 shadow-2xl">
          <h3 className="text-[30px] font-semibold">Apply</h3>

          <p className="mt-10 text-[18px] leading-[1.15] text-white/95">
            Use it in real scenarios.
            <br />
            Build portfolio-ready
            <br />
            outputs. Execute practically.
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="absolute bottom-7 right-7 z-30 flex flex-col gap-5 text-white/70">
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

export default Wedont;