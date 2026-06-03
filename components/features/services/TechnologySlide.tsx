"use client";

import { motion } from "framer-motion";

export default function TechnologySlide() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* ✅ CURVED TEXT (FIXED) - Positioned relative to the viewport to match the global circle */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "-130vh",
          left: "40%",
          transform: "translateX(-50%)",
          width: "180vh",
          height: "180vh",
        }}
      >
        <svg viewBox="0 0 1000 1000" className="w-full h-full overflow-visible">
          <defs>
            <path
              id="techCurveCircle"
              d="M 35,500 A 465,465 0 0,0 965,500"
            />
          </defs>
          <text
            fontWeight="bold"
            fill="white"
            letterSpacing="-2"
            dominantBaseline="middle"
            style={{ fontSize: "clamp(3rem, 9vmin, 7rem)" }}
          >
            <textPath href="#techCurveCircle" startOffset="50%" textAnchor="middle">
              Technology
            </textPath>
          </text>
        </svg>
      </div>

      <div className="relative w-full h-full max-w-6xl flex items-center justify-center">

        {/* ✅ SERVICES (FIXED POSITION) */}
        <div
          className="absolute flex flex-col gap-[3vh] -rotate-12"
          style={{
            top: "65%",
            left: "18%",
          }}
        >
          <div className="flex flex-col gap-[3vmin] font-medium tracking-widest text-blue-200">

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{ fontSize: "clamp(1rem, 2.5vmin, 2rem)" }}
            >
              WEBSITE BUILDING & DESIGN (UI/UX)
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              style={{ fontSize: "clamp(1rem, 2.5vmin, 2rem)" }}
            >
              VFX & CGI
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              style={{ fontSize: "clamp(1rem, 2.5vmin, 2rem)" }}
            >
              PRODUCT DESIGN
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}