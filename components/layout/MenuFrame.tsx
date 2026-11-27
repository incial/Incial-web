"use client";

import { motion } from "framer-motion";

interface MenuFrameProps {
  open: boolean;
}

/**
 * The rounded "card" look of the open menu, drawn as a fixed white frame with a rounded window
 * cut out of it. The page behind is only shifted, never scaled: a scaled ancestor makes pinned
 * (sticky) sections drift as the page scrolls, while this frame cannot affect them at all.
 * When the menu is closed the window is the whole screen, so the frame is out of sight.
 */
export default function MenuFrame({ open }: MenuFrameProps) {
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{
        top: open ? "6.25rem" : "0rem",
        left: open ? "2.5vw" : "0vw",
        right: open ? "2.5vw" : "0vw",
        // the card runs off the bottom edge of the screen: only its top corners are rounded
        bottom: "0vh",
        borderTopLeftRadius: open ? 24 : 0,
        borderTopRightRadius: open ? 24 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed z-[39]"
      style={{ boxShadow: "0 0 0 200vmax var(--stage-frame)" }}
    />
  );
}
