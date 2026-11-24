"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import ClientMarquee from "@/components/features/home/ClientMarquee";
import AccentHeading from "@/components/ui/AccentHeading";
import { useClientsData } from "@/lib/useClientsData";
import { useSectionsConfig } from "@/lib/useSectionsConfig";
import { useViewProgress } from "@/lib/useViewProgress";

/**
 * Logo rows plus testimonials. It rises over the pinned Trust stage as one layer of a parallax
 * hand-over: the heading, each logo row and the testimonials travel at different speeds.
 */
export default function ClientSection({ exit }: { exit?: MotionValue<number> }) {
  const idleExit = useMotionValue(0);
  const exitProgress = exit ?? idleExit;
  const data = useClientsData();
  const sectionsConfig = useSectionsConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const rise = useViewProgress(sectionRef);

  const headingY = useTransform(rise, (p) => (1 - p) * 90);
  const headingOpacity = useTransform(rise, [0.15, 0.7], [0, 1]);
  const testimonialsY = useTransform(rise, (p) => (1 - p) * 220);
  // while the contact section rises over this one, this layer drifts up slowly and dims
  const layerY = useTransform(exitProgress, (e) => `${-e * 30}dvh`);
  const layerOpacity = useTransform(exitProgress, (e) => 1 - 0.55 * e);
  const layerScale = useTransform(exitProgress, (e) => 1 - 0.05 * e);

  return (
    <section
      ref={sectionRef}
      id="client"
      className="relative flex h-dvh min-h-[34rem] w-full flex-col justify-center overflow-hidden bg-black py-14 text-white md:py-16"
    >
      <motion.div
        style={{ y: layerY, opacity: layerOpacity, scale: layerScale }}
        className="mx-auto flex w-full max-w-[120rem] flex-col items-center"
      >
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="mb-14 px-6 text-center md:mb-20"
        >
          <AccentHeading
            text={data?.headerText || "Some of Our Awesome Clients:"}
            className="text-[clamp(1.75rem,1rem+3vw,3.4rem)] tracking-tighter"
          />
        </motion.div>

        {sectionsConfig["client-logos"] !== false && (
          <div className="w-full">
            <ClientMarquee clients={data ? data.clients : null} depth={rise} />
          </div>
        )}

        {sectionsConfig["client-testimonials"] !== false &&
          (data?.testimonials.length ?? 0) > 0 && (
            <motion.div
              style={{ y: testimonialsY }}
              className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-8 px-6 md:mt-24 md:grid-cols-2 md:gap-20"
            >
              {data?.testimonials.map((test) => (
                <div key={test.id} className="flex flex-col">
                  <p className="mb-4 font-[Poppins] text-base font-light italic leading-relaxed text-white/80 md:text-lg">
                    &ldquo;{test.quote}&rdquo;
                  </p>
                  <p className="text-right text-sm font-light italic tracking-wide text-white/60">
                    ~ {test.author}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
      </motion.div>
    </section>
  );
}
