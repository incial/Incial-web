'use client';

import React from 'react';

export default function SecondSlideInitial() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white font-['Poppins',sans-serif] transform-gpu origin-center lg:scale-[0.80] xl:scale-[0.76] 2xl:scale-[0.72]">
      {/* Main centered content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-[980px] leading-[0.9] font-extrabold text-[clamp(2.8rem,8vw,6.25rem)] md:text-[clamp(3.5rem,7.5vw,6.75rem)]">
          Where Skills
          <br />
          Are Built
          <br />
          Together.
        </h1>

        <div className="mt-10">
          <button className="rounded-full bg-white text-black px-6 py-3 text-sm font-medium">Explore Workshops</button>
        </div>

        <p className="mt-6 max-w-[560px] text-sm text-white/70">
          We don't just teach concepts.
          <br />
          We help you create with them.
        </p>
      </div>

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
  );
}
