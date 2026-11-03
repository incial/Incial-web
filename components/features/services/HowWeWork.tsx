"use client";

import { motion } from "framer-motion";
import { SERVICE_CATEGORIES } from "@/lib/serviceCatalog";

export default function HowWeWork() {
  return (
    <section className="bg-[#fcfcfe] px-[clamp(1rem,4vw,6rem)] py-[clamp(4rem,10vw,9rem)] text-black">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl font-[Poppins,sans-serif] text-[clamp(2rem,1.2rem+3.2vw,4.5rem)] font-extrabold uppercase leading-[1.02]"
      >
        How we bring brands <span className="text-[#2a3fd6]">to life</span>
      </motion.h2>
      <div className="mt-[clamp(2.5rem,6vw,5rem)] grid gap-8 md:grid-cols-3">
        {SERVICE_CATEGORIES.map((cat, i) => (
          <motion.article
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="border-t border-black/20 pt-5"
          >
            <p className="font-mono text-xs tracking-[0.2em] text-black/50">0{i + 1}</p>
            <h3 className="mt-3 font-[Poppins,sans-serif] text-2xl font-bold">{cat.headline}</h3>
            <p className="text-[#2a3fd6]">{cat.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-black/60">{cat.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
