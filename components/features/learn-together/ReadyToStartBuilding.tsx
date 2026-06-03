'use client';

import { motion, type Transition } from 'framer-motion';
import { ArrowUp, ArrowDown, Search, Wrench, Sparkles } from 'lucide-react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
  hideNav?: boolean;
}

const ReadyToStartBuilding = ({ onPrev, hideNav }: SlideProps) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black font-['Poppins',sans-serif] text-white">
      {/* Left Blue Border */}

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-[760px] flex-col items-center px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h1 className="text-[clamp(2.2rem,7vw,3.5rem)] font-semibold italic tracking-[-0.04em] text-white">
            Ready to Start Building?
          </h1>

          <div className="mt-5 space-y-1 text-[15px] leading-relaxed text-white/75">
            <p>Join a workshop.</p>
            <p>Collaborate with like-minded peers.</p>
            <p>Turn skills into real-world output.</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-14 flex w-full max-w-[520px] flex-col gap-4"
        >
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="h-[54px] rounded-[18px] border border-white/10 bg-transparent px-5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
          />

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="h-[54px] w-full rounded-[18px] border border-white/10 bg-transparent px-5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
            />

            {/* Pink Dot */}
          
          </div>

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone"
            className="h-[54px] rounded-[18px] border border-white/10 bg-transparent px-5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
          />

          {/* Message */}
          <div className="relative">
            <textarea
              placeholder="Message"
              rows={5}
              className="min-h-[150px] w-full resize-none rounded-[18px] border border-white/10 bg-transparent px-5 py-5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
            />

            {/* Contact Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="absolute bottom-5 right-5 rounded-full bg-white px-6 py-2 text-[12px] font-medium text-black shadow-lg"
            >
              Contact
            </motion.button>
          </div>
        </motion.form>
      </div>

      {/* Bottom Right Arrow */}
      {!hideNav && (
        <div className="absolute bottom-6 right-6">
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
            onClick={onPrev}
            className="text-white/80 transition"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ReadyToStartBuilding;