'use client'

import React, { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function SecondSlideAnimated() {
  const headingControls = useAnimation()
  const paraControls = useAnimation()
  const ctaControls = useAnimation()

  useEffect(() => {
    // timeline approximating the uploaded video: initial -> final
    function run() {
      // move heading to left and change colors
      headingControls.start({ left: '8%', x: '0%', transition: { duration: 0.9, ease: 'easeInOut' } })

      // reveal right paragraph slightly after heading begins
      paraControls.start({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.28, ease: 'easeOut' } })

      // move CTA from center to the right column
      ctaControls.start({ left: '72%', x: '0%', transition: { duration: 0.8, delay: 0.35, ease: 'easeInOut' } })
    }

    run()
  }, [headingControls, paraControls, ctaControls])

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white font-['Poppins',sans-serif] transform-gpu origin-center lg:scale-[0.80] xl:scale-[0.76] 2xl:scale-[0.72]">
      {/* Top navigation is provided globally; local header removed to avoid duplication */}

      {/* Heading - absolute positioned so we can animate alignment precisely */}
      <motion.div
        initial={{ left: '50%', x: '-50%' }}
        animate={headingControls}
        style={{ position: 'absolute', top: '18%' }}
        className="z-10 max-w-[980px]"
      >
        <h1 className="leading-[0.9] font-extrabold text-[clamp(2.8rem,8vw,6.25rem)] md:text-[clamp(3.5rem,7.5vw,6.75rem)] text-center lg:text-left">
          <motion.div
            initial={{ color: '#FFFFFF' }}
            animate={{ color: '#FFFFFF' }}
            transition={{ duration: 0.6 }}
          >
            Where Skills
          </motion.div>

          <motion.div
            initial={{ color: '#FFFFFF' }}
            animate={{ color: '#4CAF50' }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <br />
            Are Built
          </motion.div>

          <motion.div
            initial={{ color: '#FFFFFF' }}
            animate={{ color: '#FF6B6B' }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <br />
            Together.
          </motion.div>
        </h1>
      </motion.div>

      {/* CTA - starts centered under heading and moves right */}
      <motion.div
        initial={{ left: '50%', x: '-50%' }}
        animate={ctaControls}
        style={{ position: 'absolute', top: '48%' }}
        className="z-10"
      >
        <button className="rounded-full bg-white text-black px-6 py-3 text-sm font-medium">Explore Workshops</button>
      </motion.div>

      {/* Right column paragraph - fades in to final position */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={paraControls}
        style={{ position: 'absolute', top: '22%', right: '6%', maxWidth: 520 }}
        className="z-10 text-right text-white/90"
      >
        <p className="text-base md:text-lg leading-relaxed">
          LearnTogether is Incial’s learning initiative designed to help students move beyond theory and start building real-world skills.
        </p>

        <div className="mt-8 flex flex-col items-center lg:items-end gap-6">
          <p className="text-sm text-white/60 max-w-xs text-center lg:text-right mt-3">
            We don’t just teach concepts. We help you create with them.
          </p>
        </div>
      </motion.div>

      {/* Right side small arrow indicators */}
      <div className="absolute right-6 bottom-6 z-20 flex flex-col items-center gap-2 text-white/80">
        <div className="text-xs">↑</div>
        <div className="text-xs">↓</div>
      </div>

      {/* subtle bottom center scaffold to hint next slide */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-6 z-0">
        <div className="h-2 w-28 rounded-full bg-white/6" />
      </div>
    </section>
  )
}
