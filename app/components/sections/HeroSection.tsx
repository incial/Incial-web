"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center">
        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={onStart}
          className="cursor-pointer rounded-full bg-[#2196F3] px-8 py-3 text-base font-medium text-white transition-all hover:bg-[#1e88e5] hover:shadow-lg hover:shadow-[#2196F3]/25"
        >
          Start
        </motion.button>
      </main>
    </div>
  );
}
