"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { navLinks } from "@/lib/constants";
import type { SectionConfig } from "@/lib/dataLoader";

export default function NavMenu() {
  const [enabledSections, setEnabledSections] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/sections")
      .then((res) => res.json())
      .then((data: { sections: SectionConfig[] }) => {
        const enabled = data.sections.filter((s) => s.enabled).map((s) => s.id);
        setEnabledSections(enabled);
      })
      .catch(() => {
        setEnabledSections([]);
      });
  }, []);

  const visibleLinks = navLinks.filter((link) => {
    if (!enabledSections || !link.sectionId) return true;
    return enabledSections.includes(link.sectionId);
  });

  return (
    <>
      {/* ── DESKTOP nav (horizontal bar, unchanged) ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-40 hidden items-center justify-center gap-0 bg-white px-6 py-8 md:flex"
      >
        {visibleLinks.map((link, i) => (
          <div key={link.label} className="flex items-center">
            <Link
              href={link.href}
              className="px-5 text-sm font-medium text-black transition-colors hover:text-black/60"
            >
              {link.label}
            </Link>
            {i < visibleLinks.length - 1 && (
              <div className="h-4 w-px bg-black/20" />
            )}
          </div>
        ))}
      </motion.nav>

      {/* ── MOBILE full-screen overlay (z-40 so mobile header bar on z-50 stays above) ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white md:hidden"
      >
        <nav className="flex flex-col items-center w-full">
          {visibleLinks.map((link, i) => (
            <div key={link.label} className="flex flex-col items-center w-48">
              <Link
                href={link.href}
                className="w-full py-5 text-center text-base font-medium text-black transition-colors hover:text-black/50"
              >
                {link.label}
              </Link>
              {i < visibleLinks.length - 1 && (
                <div className="h-px w-full bg-black/10" />
              )}
            </div>
          ))}
        </nav>
      </motion.div>
    </>
  );
}