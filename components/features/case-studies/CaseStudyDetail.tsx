"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CaseStudy } from "@/lib/dataLoader";

interface CaseStudyDetailProps {
  study: CaseStudy;
  previous?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

interface Tab {
  label: string;
  content: string;
}

const LINE = "border-white/15";

const EASE = [0.22, 1, 0.36, 1] as const;
/** The picture is still settling in when the page opens, so the words wait a moment. */
const START = 0.1;

/** A line of text whose letters slide up, one after another, out from under an invisible edge. */
function SlideText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  let index = 0;
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wordIndex) => (
        <span key={wordIndex} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          {word.split("").map((letter) => (
            <motion.span
              key={index}
              className="inline-block"
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, delay: delay + index++ * 0.028, ease: EASE }}
            >
              {letter}
            </motion.span>
          ))}
          {" "}
        </span>
      ))}
    </span>
  );
}

/** A block that rises a little and fades in, at its own moment. */
function Rise({ delay, children, className = "" }: { delay: number; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A project's page: a fixed panel of words on the left (back link, name, a line about it, what was
 * done, tabbed text, previous and next) and the project's pictures, large, scrolling on the right.
 */
export default function CaseStudyDetail({ study, previous, next }: CaseStudyDetailProps) {
  const tabs = useMemo<Tab[]>(() => {
    const list: Tab[] = [];
    if (study.introduction) list.push({ label: "Overview", content: study.introduction });
    (study.sections || []).forEach((section, index) => {
      if (section.content) list.push({ label: section.title || `Part ${index + 1}`, content: section.content });
    });
    return list;
  }, [study]);
  const [active, setActive] = useState(0);
  const current = tabs[Math.min(active, tabs.length - 1)];

  // the facts about the project, shown as a short list
  const facts = Array.from(new Set([...(study.tags ?? []), study.category, study.client, study.location, study.year].filter((fact): fact is string => Boolean(fact)))).slice(0, 5);

  const pictures = [study.heroImage || study.coverImage, ...(study.images ?? [])].filter((src): src is string => Boolean(src));

  return (
    <div className="md:mx-[var(--menu-inset,0px)] md:flex md:h-[calc(100dvh-var(--menu-shift,0px))] md:overflow-hidden md:transition-[height,margin] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]">
      <aside
        className="flex shrink-0 flex-col bg-black px-6 pb-8 pt-28 md:h-full md:w-[clamp(24rem,40vw,42rem)] md:overflow-hidden md:px-10 md:pb-6 md:pt-24">
        <Rise delay={START}>
          <Link href="/case-studies" className={`block border-b ${LINE} pb-5 text-sm uppercase tracking-tight text-white transition-opacity hover:opacity-60`}>
            <span aria-hidden>← </span>
            Back to work
          </Link>
        </Rise>

        <h1 className="mt-10 text-[clamp(2rem,1.4rem+1.6vw,3rem)] font-normal leading-[1.05] tracking-[-0.03em]">
          <SlideText text={study.title} delay={START + 0.15} />
        </h1>
        {study.heroQuote && (
          <Rise delay={START + 0.55} className="mt-4 max-w-[40rem]">
            <p className="text-[15px] leading-relaxed text-white/60">{study.heroQuote}</p>
          </Rise>
        )}

        {facts.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] text-white sm:grid-cols-2">
            {facts.map((fact, index) => (
              <li key={fact}>
                <Rise delay={START + 0.75 + index * 0.07}>· {fact}</Rise>
              </li>
            ))}
          </ul>
        )}

        {current && (
          <Rise delay={START + 1.1} className="mt-12 md:flex md:min-h-0 md:flex-1 md:flex-col">
            <div role="tablist" aria-label="About the project" className="flex flex-wrap gap-x-6 gap-y-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label + index}
                  role="tab"
                  type="button"
                  aria-selected={index === active}
                  onClick={() => setActive(index)}
                  className={`max-w-[18rem] truncate border-b pb-1 text-[13px] uppercase tracking-tight transition-colors ${
                    index === active ? "border-white text-white" : "border-transparent text-white/45 hover:text-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div role="tabpanel" className="mt-7 max-w-[46rem] space-y-3 overflow-y-auto pr-2 text-[15px] leading-relaxed text-white/90 md:min-h-0 md:flex-1 md:text-base">
              {current.content.split("\n").filter(Boolean).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </Rise>
        )}

        <Rise delay={START + 1.3}>
          <nav aria-label="Other projects" className={`mt-8 flex shrink-0 justify-between border-t ${LINE} pt-5 text-sm uppercase tracking-tight md:mt-auto`}>
            {previous ? (
              <Link href={`/case-studies/${previous.slug}`} className="transition-opacity hover:opacity-60" aria-label={`Previous project: ${previous.title}`}>
                Previous
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/case-studies/${next.slug}`} className="transition-opacity hover:opacity-60" aria-label={`Next project: ${next.title}`}>
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </Rise>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 md:h-full md:gap-4 md:overflow-y-auto md:overscroll-contain md:p-4">
        {pictures.length === 0 ? (
          <div className="flex min-h-[40dvh] items-center justify-center rounded-lg bg-[#111] text-sm text-white/30">No pictures yet</div>
        ) : (
          pictures.map((src, index) => (
            <div key={`${src}-${index}`} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#111] md:aspect-auto md:h-[calc(100dvh-var(--menu-shift,0px)-2rem)] md:shrink-0 md:transition-[height] md:duration-500">
              <Image
                src={src}
                alt={index === 0 ? study.title : `${study.title}: picture ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 68vw"
                className="object-cover"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
