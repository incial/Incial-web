"use client";

import { motion } from "framer-motion";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import SocialLinks from "@/app/components/ui/SocialLinks";

interface HeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
}

export default function Header({ menuOpen, onToggleMenu }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{
        y: menuOpen ? 100 : 0,
        scale: menuOpen ? 0.95 : 1,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-50 flex origin-top items-center justify-between px-10 pb-4 pt-10 md:px-20"
    >
      {/* Logo */}
      <div className="text-xl font-light tracking-wide text-white">
        We Are <span className="font-bold">incial.</span>
      </div>

      {/* Menu toggle */}
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

      {/* Social icons */}
      <SocialLinks />
    </motion.header>
  );
}
