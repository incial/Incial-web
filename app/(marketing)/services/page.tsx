"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/Footer";
import { MobileServicePage } from "@/components/mobile";
import { useDevice } from "@/hooks";
import { ServicesScroller, HowWeWork } from "@/components/features/services";
import { SERVICE_CATEGORIES } from "@/lib/serviceCatalog";

const MENU_OFFSET_Y = "6.25rem";

export default function ServicesPage() {
  const { isMobile, isLoading: isDeviceLoading } = useDevice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isMobile) {
      setHeaderHidden(false);
      return;
    }

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < 6) return;

      if (currentScrollY <= 24) {
        setHeaderHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      setHeaderHidden(delta > 0);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  if (isDeviceLoading) {
    return <div className="min-h-screen w-full bg-black" />;
  }

  if (isMobile) {
    return <MobileServicePage />;
  }

  return (
    <div className="relative min-h-screen bg-white">
      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        hidden={headerHidden}
      />

      <motion.div
        animate={{
          y: menuOpen ? MENU_OFFSET_Y : 0,
          scale: menuOpen ? 0.95 : 1,
          borderTopLeftRadius: menuOpen ? 24 : 0,
          borderTopRightRadius: menuOpen ? 24 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-x-clip bg-black text-white min-h-screen selection:bg-white/20"
        style={{ zIndex: 30 }}
      >
        <ServicesScroller categories={SERVICE_CATEGORIES} />

        <HowWeWork />

        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[84rem] px-[clamp(1rem,0.55rem+1.8vw,1.5rem)] md:px-[clamp(2rem,0.2rem+3vw,3rem)] lg:px-24">
          <Footer />
        </div>
      </motion.div>
    </div>
  );
}