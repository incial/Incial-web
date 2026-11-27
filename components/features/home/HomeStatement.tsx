"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/** The statement shown below the hero. */
const STATEMENT =
  "At Incial, we believe every business deserves a brand people remember, technology that simply works, and growth you can see - and we're here to build it.";
/** How much the page scrolls while the words light up, in viewport heights (plus one screen pinned). */
const SCROLL_DVH = 140;

interface WordToken {
  text: string;
  start: number;
}

function tokenize(): { words: WordToken[]; total: number } {
  const words: WordToken[] = [];
  let position = 0;
  for (const word of STATEMENT.split(" ")) {
    words.push({ text: word, start: position });
    position += word.length + 1;
  }
  return { words, total: position };
}
const { words: WORDS, total: TOTAL } = tokenize();

function Word({ token, lit }: { token: WordToken; lit: number }) {
  return (
    <span className="inline-block whitespace-nowrap">
      {Array.from(token.text).map((letter, offset) => (
        <span key={offset} className="transition-colors duration-200" style={{ color: token.start + offset < lit ? "#ffffff" : "rgba(255,255,255,0.32)" }}>
          {letter}
        </span>
      ))}
    </span>
  );
}

/**
 * The black statement after the hero: one large sentence pinned in the middle of the screen.
 * It starts dim grey; as the page scrolls it lights up in white letter by letter, left to right,
 * then the page moves on.
 */
export default function HomeStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end end"] });
  const [lit, setLit] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.round(Math.min(1, Math.max(0, progress / 0.9)) * TOTAL);
    setLit((current) => (current === next ? current : next));
  });

  return (
    <section ref={ref} data-tone="dark" aria-label="About Incial" className="relative bg-black text-white" style={{ height: `${100 + SCROLL_DVH}dvh` }}>
      <div className="sticky top-0 flex h-dvh items-center justify-center px-6">
        <p className="sr-only">{STATEMENT}</p>
        <div className="w-full">
          <div
            aria-hidden
            className="mx-auto w-fit max-w-[24ch] text-[clamp(2rem,1rem+3.4vw,4.5rem)] font-normal leading-[1.18] tracking-[-0.03em]"
          >
            {WORDS.map((word) => (
              <span key={word.start}>
                <Word token={word} lit={lit} />{" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
