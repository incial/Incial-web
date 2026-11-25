"use client";

import MenuFrame from "@/components/layout/MenuFrame";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShaderHero from "@/components/ui/ShaderHero";
import StretchHeading from "@/components/features/products/StretchHeading";
import CaseStudyGallery from "@/components/features/case-studies/CaseStudyGallery";
import type { CaseStudy } from "@/lib/dataLoader";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

interface CaseStudiesClientProps {
  caseStudies: CaseStudy[];
  /** Banner exactly as set in the admin panel; empty when none is configured. */
  heroBanner: string;
}

export default function CaseStudiesClient({
  caseStudies,
  heroBanner,
}: CaseStudiesClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionsConfig = useSectionsConfig();
  const isDisabled = sectionsConfig["casestudies"] === false;

  if (isDisabled) {
    return (
      <div className="relative min-h-screen bg-white">
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen(!menuOpen)}
        />
        <div className="flex min-h-[70vh] items-center justify-center bg-black text-white px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Section Disabled</h1>
            <p className="text-gray-400">This page is currently unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Header */}
      <Header menuOpen={menuOpen} onToggleMenu={handleToggleMenu} blend />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-x-clip bg-[#f7f9f8] text-[#151716] min-h-screen"
        style={{ zIndex: 30 }}
      >
        {/* Full-screen opening: the shader, with the banner behind the words at half strength */}
        <ShaderHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Work" }]}
          title={<StretchHeading lead="Case" emphasis="Study" baseWeight={700} emphasisGrow={1.15} />}
          titleClassName="text-5xl italic md:text-8xl"
          tagline={
            <>
              At Incial, we pride ourselves on developing tailored digital solutions that make a real impact. Here&apos;s a glimpse of some of the
              projects we&apos;ve brought to life across various industries:
            </>
          }
          image={heroBanner || undefined}
          imageOpacity={0.1}
          scrollTargetId="case-studies-list"
        />

        {/* The projects: a pinned row that moves sideways as you scroll */}
        {caseStudies.length === 0 ? (
          <div id="case-studies-list" className="py-32 text-center text-sm italic text-black/50">
            No case studies available.
          </div>
        ) : (
          <CaseStudyGallery id="case-studies-list" studies={caseStudies} />
        )}

        {/* Footer */}
        <div className="mt-20 rounded-t-[2rem] bg-black pb-4 pt-8 text-white">
          <div className="px-6 md:px-16 lg:px-24 xl:px-32 max-w-[1400px] mx-auto">
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
