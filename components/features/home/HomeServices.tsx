"use client";

import LiquidButton from "@/components/ui/LiquidButton";
import { useSectionsConfig } from "@/lib/useSectionsConfig";
import LiquidSeamWave from "./LiquidSeamWave";

/**
 * Bottom Conversion Strip below the dark Global Presence stage, transitioning via
 * LiquidSeamWave into `#f6f8fb` right before the Contact section.
 */
export default function HomeServices() {
  const sectionsConfig = useSectionsConfig();
  const topColor =
    sectionsConfig["trust"] !== false
      ? "#000000"
      : sectionsConfig["client-testimonials"] !== false
        ? "#f6f8fb"
        : sectionsConfig["client-logos"] !== false
          ? "#ffffff"
          : "#000000";

  return (
    <section
      aria-label="Start a Project"
      className="relative z-20 w-full"
    >
      {topColor !== "#f6f8fb" && <LiquidSeamWave topColor={topColor} bottomColor="#f6f8fb" />}

      <div
        data-tone="light"
        className="border-y border-black/10 bg-[#f6f8fb] px-6 py-16 text-[#151716] md:px-12 lg:px-20"
      >
        <div className="mx-auto flex max-w-[1340px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-black/50">
              Ready to build together?
            </span>
            <h3 className="mt-2 text-2xl font-light tracking-[-0.03em] text-[#151716] sm:text-3xl">
              Turn your vision into an unfair competitive advantage.
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <LiquidButton
              href="/contact"
              variant="ink"
              className="bg-[#151716] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1463ff]"
            >
              Start a project <span aria-hidden>→</span>
            </LiquidButton>
            <LiquidButton
              href="/case-studies"
              variant="outline"
              className="border-black/20 bg-white px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#151716] hover:bg-black/5"
            >
              View Case Studies
            </LiquidButton>
          </div>
        </div>
      </div>
    </section>
  );
}
