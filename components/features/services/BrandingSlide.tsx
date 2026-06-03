"use client";

import { motion } from "framer-motion";

export default function BrandingSlide() {
  const circleBorderStyle = {
    borderWidth: "clamp(1px, 0.12vw, 2px)",
  } as const;

  const mobileBrandingTextStyle = {
    fontSize: "clamp(0.38rem, 0.9vw, 0.48rem)",
    lineHeight: 1,
    letterSpacing: "0.01em",
  } as const;

  const desktopBrandingTextStyle = {
    fontSize: "clamp(0.42rem, 0.54vw, 0.5rem)",
    lineHeight: 1,
  } as const;

  const mobileSubTextStyle = {
    fontSize: "clamp(0.2rem, 0.5vw, 0.28rem)",
    lineHeight: 1,
    letterSpacing: "0.05em",
  } as const;

  const desktopSubTextStyle = {
    fontSize: "clamp(0.2rem, 0.28vw, 0.24rem)",
    lineHeight: 1,
    letterSpacing: "0.05em",
  } as const;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Container for the visual branding elements */}
      <div className="relative flex items-center justify-center">
        {/* Main Circle Group */}
        <div
          className="relative flex h-[70vmin] w-[70vmin] translate-x-[-42%] translate-y-[20%] items-center justify-center md:h-[60vmin] md:w-[60vmin] md:translate-x-[-80%] lg:h-[50vmin] lg:w-[50vmin] lg:translate-x-[-92%]"
        >
          {/* Inner Thin Circle */}
          <div
            className="absolute inset-0 rounded-full border-white"
            style={circleBorderStyle}
          />

          <motion.div className="absolute inset-[-25%]">
            {/* Mobile layout aligned like desktop geometry */}
            <svg
              className="h-full w-full md:hidden"
              viewBox="0 0 100 100"
              overflow="visible"
            >
              <defs>
                <path
                  id="brandingHeadingPathMobile"
                  d="M 15, 50 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  transform="rotate(-90 50 50)"
                />
              </defs>

              <text
                className="font-bold fill-white tracking-tighter"
                style={mobileBrandingTextStyle}
              >
                <textPath
                  href="#brandingHeadingPathMobile"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  Branding & Marketing
                </textPath>
              </text>

              <g
                className="uppercase font-medium fill-blue-300"
                style={{ textAnchor: "start", dominantBaseline: "middle" }}
              >
                <text x="92" y="50" transform="rotate(-18 50 50)" style={mobileSubTextStyle}>
                  BRANDING
                </text>
                <text x="92" y="50" transform="rotate(-6 50 50)" style={mobileSubTextStyle}>
                  SOCIAL MEDIA MANAGEMENT
                </text>
                <text x="92" y="50" transform="rotate(6 50 50)" style={mobileSubTextStyle}>
                  DIGITAL MARKETING
                </text>
                <text x="92" y="50" transform="rotate(18 50 50)" style={mobileSubTextStyle}>
                  SEO & DIGITAL ADS
                </text>
              </g>
            </svg>

            {/* Desktop/tablet original layout */}
            <svg
              className="hidden h-full w-full md:block"
              viewBox="0 0 100 100"
              overflow="visible"
            >
              <defs>
                <path
                  id="textPathDesktop"
                  d="M 15, 50 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  transform="rotate(-90 50 50)"
                />
              </defs>
              <text
                className="font-bold fill-white tracking-tighter"
                style={desktopBrandingTextStyle}
              >
                <textPath
                  href="#textPathDesktop"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  Branding & Marketing
                </textPath>
              </text>

              <g
                className="uppercase font-medium fill-blue-300"
                style={{ textAnchor: "start", dominantBaseline: "middle" }}
              >
                <text x="92" y="50" transform="rotate(-18 50 50)" style={desktopSubTextStyle}>
                  BRANDING
                </text>
                <text x="92" y="50" transform="rotate(-6 50 50)" style={desktopSubTextStyle}>
                  SOCIAL MEDIA MANAGEMENT
                </text>
                <text x="92" y="50" transform="rotate(6 50 50)" style={desktopSubTextStyle}>
                  DIGITAL MARKETING
                </text>
                <text x="92" y="50" transform="rotate(18 50 50)" style={desktopSubTextStyle}>
                  SEO & DIGITAL ADS
                </text>
              </g>
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}