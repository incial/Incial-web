"use client";

import MenuFrame from "@/components/layout/MenuFrame";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Header */}
      <Header menuOpen={menuOpen} onToggleMenu={handleToggleMenu} />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-x-clip bg-black text-white min-h-screen"
        // the page shifts down and in for the open menu; these let the project page resize to fit what is left
        style={{ zIndex: 30, ["--menu-shift" as string]: menuOpen ? "100px" : "0px", ["--menu-inset" as string]: menuOpen ? "2.5vw" : "0vw" }}
      >
        {/* Content */}
        {children}
      </motion.div>
    </div>
  );
}
