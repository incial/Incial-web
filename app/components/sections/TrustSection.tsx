import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ClientMarquee from "@/app/components/ui/ClientMarquee";

const stats = [
  { value: "50+", label: "Happy Clients" },
  { value: "10+", label: "Projects Completed" },
  { value: "5", label: "Customer Ratings" },
];

interface TrustSectionProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export default function TrustSection({
  onBack,
  onComplete,
}: TrustSectionProps) {
  const [view, setView] = useState<"stats" | "testimonials">("stats");

  const handleUp = () => {
    if (view === "testimonials") {
      setView("stats");
    } else if (onBack) {
      onBack();
    }
  };

  const handleDown = () => {
    if (view === "stats") {
      setView("testimonials");
    } else if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        handleDown();
      } else {
        handleUp();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (deltaY > 50) {
        handleDown();
      } else if (deltaY < -50) {
        handleUp();
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [view, onBack, onComplete]); // Dependencies updated to include handlers conceptually

  return (
    <section className="h-screen w-full bg-black text-white flex flex-col justify-center relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10 h-full flex flex-col justify-center">
        {/* Stats Specific Content */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center w-full px-4 md:px-0"
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: view === "stats" ? 1 : 0,
            y: view === "stats" ? 0 : -100,
            pointerEvents: view === "stats" ? "auto" : "none",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Title - Adjusted position */}
          <div className="text-center mb-16 md:mb-24 mt-[-20vh]">
            <h2 className="text-5xl md:text-7xl font-light tracking-tight">
              Why Trust <span className="font-bold text-blue-500">Incial?</span>
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center w-full max-w-5xl">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-6xl md:text-7xl font-bold text-blue-500 mb-2 italic">
                  {stat.value}
                </div>
                <div className="text-xl md:text-2xl text-white font-normal">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shared Marquee Section - Animates Position */}
        <motion.div
          className="absolute left-0 right-0 z-20 flex flex-col items-center"
          initial={{ top: "65%" }}
          animate={{
            top: view === "stats" ? "65%" : "15%",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="w-full max-w-6xl">
            <p className="text-lg md:text-xl text-white italic mb-6 pl-4 md:pl-0 text-center md:text-left transition-opacity duration-500">
              Some of Our Awesome Clients:
            </p>
            <ClientMarquee />
          </div>
        </motion.div>

        {/* Testimonials Specific Content */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center w-full pt-40"
          initial={{ opacity: 0, y: 100 }}
          animate={{
            opacity: view === "testimonials" ? 1 : 0,
            y: view === "testimonials" ? 0 : 100,
            pointerEvents: view === "testimonials" ? "auto" : "none",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 max-w-6xl mx-auto w-full px-6 mt-20">
            <div className="pl-4 border-l-2 border-blue-500/50">
              <p className="text-lg md:text-xl italic text-gray-300 mb-6 font-light leading-relaxed">
                “Founded in 2024 in Kanjirappally, Kerala, we started as a small
                team of passionate creators and strategists determined to make a
                difference in the digital world.”
              </p>
              <p className="text-right text-blue-400 font-bold tracking-wide">
                ~ Client Name
              </p>
            </div>

            <div className="pl-4 border-l-2 border-blue-500/50">
              <p className="text-lg md:text-xl italic text-gray-300 mb-6 font-light leading-relaxed">
                “Founded in 2024 in Kanjirappally, Kerala, we started as a small
                team of passionate creators and strategists determined to make a
                difference in the digital world.”
              </p>
              <p className="text-right text-blue-400 font-bold tracking-wide">
                ~ Client Name
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
