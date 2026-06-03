"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoScreenProps {
  onNextClick?: () => void;
  skipAnimation?: boolean;
  sizeMode?: "mobile" | "desktop";
}

export default function LogoScreen({
  skipAnimation,
  sizeMode = "desktop",
}: LogoScreenProps) {
  const isMobile = sizeMode === "mobile";

  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: [0, 1, 1, 0],
      transition: {
        pathLength: { duration: 2.5, ease: "easeInOut" },
        opacity: { duration: 3.5, times: [0, 0.1, 0.8, 1], ease: "easeInOut" },
      },
    },
  };

  // --- MOBILE LAYOUT & ANIMATION ---
  if (isMobile) {
    return (
      <motion.div
        key="logo-screen-mobile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex h-full w-full items-center justify-center"
      >
        {/* Left Button (hidden on mobile, kept for structure matching) */}
        <motion.div
          initial={{ x: -50, opacity: skipAnimation ? 1 : 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={skipAnimation ? { duration: 0 } : { delay: 2.5 }}
          className="absolute left-[10%] hidden md:block"
        >
          <Link
            href="/about"
            className="inline-block rounded-full border border-white/30 px-8 py-3 text-sm text-white transition hover:bg-white hover:text-black"
          >
            About Us
          </Link>
        </motion.div>

        {/* Inner Logo Wrapper: scaled and shifted upwards by 38px to stay perfectly centered */}
        <motion.div
          className="relative flex w-[75vw] max-w-[320px] aspect-square items-center justify-center"
          initial={{ scale: 0.95, y: 0 }}
          animate={{ scale: 1, y: -38 }}
          exit={{ scale: 0.95, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Sharp Stroke Layer */}
          {!skipAnimation && (
            <motion.svg
              viewBox="0 0 626 590"
              className="absolute inset-0 h-full w-full stroke-white"
              fill="transparent"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial="hidden"
              animate="visible"
            >
              <motion.rect
                x="164"
                y="150"
                width="122"
                height="122"
                rx="61"
                variants={pathVariants}
              />
              <motion.path
                d="M150 417C150 342.442 211.442 282 286 282V509H150V417Z"
                variants={pathVariants}
              />
              <motion.path
                d="M309 150C400.679 150 476 224.321 476 316V509H309V150Z"
                variants={pathVariants}
              />
            </motion.svg>
          )}

          {/* Full Finished Logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={skipAnimation ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              skipAnimation
                ? { duration: 0 }
                : { delay: 2.2, duration: 1.5, ease: "easeOut" }
            }
          >
            <Image
              src="/logo/Logoo-white.svg"
              alt="Incial Logo"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Right Button (hidden on mobile, kept for structure matching) */}
        <motion.div
          initial={{ x: 50, opacity: skipAnimation ? 1 : 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={skipAnimation ? { duration: 0 } : { delay: 2.5 }}
          className="absolute right-[10%] hidden md:block"
        >
          <a
            href="/pdf/Brochure.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 px-8 py-3 text-sm text-white transition hover:bg-white hover:text-black inline-block"
          >
            Our Works
          </a>
        </motion.div>
      </motion.div>
    );
  }

  // --- DESKTOP LAYOUT & ANIMATION (Original unmodified behavior) ---
  return (
    <motion.div
      key="logo-screen-desktop"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full w-full items-center justify-center"
    >
      {/* Left Button */}
      <motion.div
        initial={{ x: -50, opacity: skipAnimation ? 1 : 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={skipAnimation ? { duration: 0 } : { delay: 2.5 }}
        className="absolute left-[10%] hidden md:block"
      >
        <Link
          href="/about"
          className="inline-block rounded-full border border-white/30 px-8 py-3 text-sm text-white transition hover:bg-white hover:text-black"
        >
          About Us
        </Link>
      </motion.div>

      {/* Desktop Logo Container (Standard Flex centering, no offsets) */}
      <div className="relative flex h-80 w-80 items-center justify-center md:h-[32rem] md:w-[32rem] lg:h-[40rem] lg:w-[40rem]">
        {/* Sharp Stroke Layer */}
        {!skipAnimation && (
          <motion.svg
            viewBox="0 0 626 590"
            className="absolute inset-0 h-full w-full stroke-white"
            fill="transparent"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="hidden"
            animate="visible"
          >
            <motion.rect
              x="164"
              y="150"
              width="122"
              height="122"
              rx="61"
              variants={pathVariants}
            />
            <motion.path
              d="M150 417C150 342.442 211.442 282 286 282V509H150V417Z"
              variants={pathVariants}
            />
            <motion.path
              d="M309 150C400.679 150 476 224.321 476 316V509H309V150Z"
              variants={pathVariants}
            />
          </motion.svg>
        )}

        {/* Full Finished Logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={skipAnimation ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            skipAnimation
              ? { duration: 0 }
              : { delay: 2.2, duration: 1.5, ease: "easeOut" }
          }
        >
          <Image
            src="/logo/Logoo-white.svg"
            alt="Incial Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>

      {/* Right Button */}
      <motion.div
        initial={{ x: 50, opacity: skipAnimation ? 1 : 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={skipAnimation ? { duration: 0 } : { delay: 2.5 }}
        className="absolute right-[10%] hidden md:block"
      >
        <a
          href="/pdf/Brochure.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/30 px-8 py-3 text-sm text-white transition hover:bg-white hover:text-black inline-block"
        >
          Our Works
        </a>
      </motion.div>
    </motion.div>
  );
}
