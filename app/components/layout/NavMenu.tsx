"use client";

import { motion } from "framer-motion";
import { navLinks } from "@/app/lib/constants";

export default function NavMenu() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-40 flex items-center justify-center gap-0 bg-white px-6 py-8"
    >
      {navLinks.map((link, i) => (
        <div key={link} className="flex items-center">
          <a
            href="#"
            className="px-5 text-sm font-medium text-black transition-colors hover:text-black/60"
          >
            {link}
          </a>
          {i < navLinks.length - 1 && (
            <div className="h-4 w-px bg-black/20" />
          )}
        </div>
      ))}
    </motion.nav>
  );
}
