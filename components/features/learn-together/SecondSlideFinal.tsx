import React from 'react'

export default function SecondSlideFinal() {
  return (
    <section className="w-full min-h-screen bg-black text-white transform-gpu origin-center lg:scale-[0.80] xl:scale-[0.76] 2xl:scale-[0.72]">
      <div className="max-w-7xl mx-auto px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="leading-[0.9] text-white font-extrabold">
              <div className="text-6xl md:text-7xl lg:text-8xl">Where Skills</div>
              <div className="text-6xl md:text-7xl lg:text-8xl text-[#4CAF50]">Are Built</div>
              <div className="text-6xl md:text-7xl lg:text-8xl text-[#FF6B6B]">Together.</div>
            </h1>
          </div>

          <div className="text-right">
            <p className="text-lg md:text-xl max-w-lg mx-auto leading-relaxed text-white/90">
              LearnTogether is Incial’s learning initiative designed to help students move beyond theory and start building real-world skills.
            </p>

            <div className="mt-12 flex flex-col items-center lg:items-end gap-6">
              <button className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium">Explore Workshops</button>

              <p className="text-sm text-white/60 max-w-xs text-center lg:text-right">
                We don’t just teach concepts. We help you create with them.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 h-12 flex items-end justify-end text-white/60">
          <div className="flex flex-col items-end gap-1 pr-4">
            <span className="text-xs">↑</span>
            <span className="text-xs">↓</span>
          </div>
        </div>
      </div>
    </section>
  )
}
