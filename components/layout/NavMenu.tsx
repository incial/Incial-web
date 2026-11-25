"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { navLinks } from "@/lib/constants";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

interface NavMenuProps {
  onClose?: () => void;
}

export default function NavMenu({ onClose }: NavMenuProps) {
  const sectionsConfig = useSectionsConfig();

  const visibleLinks = navLinks.filter((link) => {
    if (!link.sectionId) return true;
    return sectionsConfig[link.sectionId] !== false;
  });

  const handleLinkClick = (href: string) => {
    if (onClose) onClose();

    if (href.startsWith("/#") || href.startsWith("#")) {
      const hash = href.replace(/^\/?#/, "");
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        window.history.pushState(null, "", `#${hash}`);
        window.dispatchEvent(new Event("hashchange"));
      }
    }
  };

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
              onClick={() => handleLinkClick(link.href)}
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
                onClick={() => handleLinkClick(link.href)}
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