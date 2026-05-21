"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import SocialLinks from "@/components/ui/SocialLinks";
import NavMenu from "@/components/layout/NavMenu";
import { MobileMenu } from "@/components/mobile/MobileMenu";

interface HeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  variant?: "default" | "pill";
  hidden?: boolean;
}

export default function Header({
  menuOpen,
  onToggleMenu,
  variant = "default",
  hidden = false,
}: HeaderProps) {
  if (variant === "pill") {
    return (
      <>
        {/* ── MOBILE header bar (pill variant) ── */}
        <div
          className={`fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-transparent px-6 py-5 md:hidden ${
            menuOpen ? "hidden" : ""
          }`}
        >
          <div className="text-sm font-light tracking-wide text-white">
            We Are <span className="font-bold">incial.</span>
          </div>
          <button
            onClick={onToggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/10"
          >
            <HiMenuAlt3 className="text-2xl" />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && <MobileMenu isOpen={menuOpen} onClose={onToggleMenu} />}
        </AnimatePresence>

        {/* ── DESKTOP pill header (unchanged) ── */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: menuOpen ? 100 : 0,
            opacity: 1,
            scale: menuOpen ? 0.95 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 origin-top hidden md:block"
        >
          <div className="flex items-center gap-4 rounded-full border border-white/20 bg-black/60 px-5 py-3 backdrop-blur-md shadow-lg shadow-black/30">
            <div className="text-sm font-light tracking-wide text-white whitespace-nowrap">
              We Are <span className="font-bold">incial.</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <SocialLinks />
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={onToggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {menuOpen ? "Close" : "Menu"}
              {menuOpen ? (
                <IoCloseOutline className="text-lg" />
              ) : (
                <HiMenuAlt3 className="text-lg" />
              )}
            </button>
          </div>
        </motion.header>
      </>
    );
  }

  // ── DEFAULT VARIANT ──
  return (
    <>
      {/* ── MOBILE header bar ── */}
      <div
        className={`fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-transparent px-6 py-5 md:hidden ${
          menuOpen ? "hidden" : ""
        }`}
      >
        <div className="text-sm font-light tracking-wide text-white">
          We Are <span className="font-bold">incial.</span>
        </div>
        <button
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/10"
        >
          <HiMenuAlt3 className="text-2xl" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="md:hidden">
              <MobileMenu isOpen={menuOpen} onClose={onToggleMenu} />
            </div>
            <div className="hidden md:block">
              <NavMenu onClose={onToggleMenu} />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP header (unchanged, push-down animation only here) ── */}
      <motion.header
        initial={{ y: 0 }}
        animate={{
          y: hidden ? -100 : menuOpen ? 100 : 0,
          scale: menuOpen ? 0.95 : 1,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-50 origin-top items-center justify-between px-10 pb-4 pt-10 md:px-20 hidden md:flex"
      >
        <div className="text-xl font-light tracking-wide text-white">
          We Are <span className="font-bold">incial.</span>
        </div>
        <button
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          {menuOpen ? "Close" : "Menu"}
          {menuOpen ? (
            <IoCloseOutline className="text-lg" />
          ) : (
            <HiMenuAlt3 className="text-lg" />
          )}
        </button>
        <SocialLinks />
      </motion.header>
    </>
  );
}