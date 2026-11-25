"use client";

import MenuFrame from "@/components/layout/MenuFrame";
import { motion } from "framer-motion";
import { AboutSection } from "@/components/sections";
import { Header } from "@/components/layout";
import { useState } from "react";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionsConfig = useSectionsConfig();
  const isDisabled = sectionsConfig["about"] === false;

  if (isDisabled) {
    return (
      <div className="relative bg-white min-h-screen">
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen(!menuOpen)}
        />
        <div className="flex min-h-[70vh] items-center justify-center bg-black text-white px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Section Disabled</h1>
            <p className="text-gray-400">This page is currently unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white min-h-screen">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-x-hidden bg-black text-white min-h-screen"
        style={{ zIndex: 30 }}
      >
        <main className="pt-24">
          <AboutSection />
        </main>
      </motion.div>
    </div>
  );
}
