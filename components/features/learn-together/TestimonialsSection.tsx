"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { LearnTogetherTestimonial, LearnTogetherTestimonialLayout } from "@/lib/dataLoader";
import { LT_COLORS } from "./content";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";
import TestimonialChat from "./TestimonialChat";

const AVATAR_COLORS = [LT_COLORS.lime, LT_COLORS.lilac, LT_COLORS.sun, LT_COLORS.blue, LT_COLORS.coral] as const;
/** Each copy of a marquee row holds at least this many cards, repeating them, so it is never short. */
const MIN_PER_ROW = 6;
/** How long the spotlight shows each quote before moving on. */
const SPOTLIGHT_MS = 7000;
/** A soft, layered shadow: a close contact shadow and a wide, faint lift (never a hard band). */
const CARD_SHADOW = "0 1px 2px rgba(21,23,22,0.04), 0 8px 24px -12px rgba(21,23,22,0.12), 0 24px 48px -28px rgba(21,23,22,0.18)";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ item, colorIndex, size }: { item: LearnTogetherTestimonial; colorIndex: number; size: "sm" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14 text-sm" : "h-11 w-11 text-xs";
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-[#151716] ${box}`}
      style={{ background: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length] }}
    >
      {item.img ? <Image src={item.img} alt={item.name} fill sizes={size === "lg" ? "56px" : "44px"} className="object-cover" referrerPolicy="no-referrer" /> : <span aria-hidden>{initials(item.name)}</span>}
    </span>
  );
}

// ── Layout 1: two sliding rows (after Geniestudio) ───────────────────────────

function QuoteCard({ item, colorIndex }: { item: LearnTogetherTestimonial; colorIndex: number }) {
  return (
    <figure
      className="flex w-[min(80vw,24rem)] shrink-0 flex-col justify-between gap-8 rounded-[1.75rem] bg-white p-7 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <blockquote className="text-[clamp(1.02rem,0.95rem+0.3vw,1.2rem)] font-medium leading-snug tracking-[-0.015em] text-[#151716]">&ldquo;{item.quote}&rdquo;</blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar item={item} colorIndex={colorIndex} size="sm" />
        <span>
          <span className="block font-semibold text-[#151716]">{item.name}</span>
          {item.role && <span className="block text-sm text-black/55">{item.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/** Repeats a row's cards until one copy is long enough to fill wide screens. */
function fill(items: LearnTogetherTestimonial[]): LearnTogetherTestimonial[] {
  if (items.length === 0) return [];
  const result: LearnTogetherTestimonial[] = [];
  while (result.length < Math.max(MIN_PER_ROW, items.length)) result.push(...items);
  return result;
}

/** One endless row: two copies side by side, sliding by half so it loops without a seam. */
function MarqueeRow({ items, reverse, offset, duration }: { items: LearnTogetherTestimonial[]; reverse: boolean; offset: number; duration: number }) {
  const cards = fill(items);
  return (
    // generous padding above and below (pulled back with negative margins) so the shadows are never clipped
    <div className="lt-marquee-row relative -my-8 overflow-hidden py-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className={`lt-marquee flex w-max ${reverse ? "lt-marquee-reverse" : ""}`} style={{ ["--marquee-duration" as string]: `${duration}s` }}>
        {[0, 1].map((copy) => (
          // the second copy is only there for the loop, so screen readers hear each quote once
          <div key={copy} className="flex gap-5 pr-5" aria-hidden={copy === 1 || undefined}>
            {cards.map((item, index) => (
              <QuoteCard key={`${copy}-${item.id}-${index}`} item={item} colorIndex={index + offset} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MarqueeLayout({ items }: { items: LearnTogetherTestimonial[] }) {
  // one row for a handful of quotes; two (split between them) once there are enough
  const rows = items.length >= 4 ? [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)] : [items];
  return (
    <div className="mt-[clamp(1.5rem,4vw,3rem)] flex flex-col">
      {rows.map((row, i) => (
        <div key={i} data-quotes-row>
          <MarqueeRow items={row} reverse={i === 1} offset={i * 2} duration={44 + i * 8} />
        </div>
      ))}
    </div>
  );
}

// ── Layout 2: one big quote at a time ────────────────────────────────────────

function SpotlightLayout({ items }: { items: LearnTogetherTestimonial[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);
  const count = items.length;
  const go = useCallback((index: number) => setActive((index + count) % count), [count]);

  // moves on by itself, unless paused (hover or focus) or motion is reduced
  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => go(active + 1), SPOTLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, count, go]);

  // each new quote rises in
  useEffect(() => {
    const node = quoteRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(node.children, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT, stagger: 0.06 });
    return () => {
      tween.kill();
    };
  }, [active]);

  const item = items[active];
  return (
    <div
      data-quotes-row
      className="mx-auto mt-[clamp(2.5rem,5vw,4rem)] grid max-w-[1500px] gap-5 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-12"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <figure className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[2.25rem] bg-white p-8 md:p-12" style={{ boxShadow: CARD_SHADOW }} aria-live="polite">
        <span aria-hidden className="pointer-events-none absolute -right-4 -top-16 select-none text-[16rem] font-semibold leading-none" style={{ color: AVATAR_COLORS[active % AVATAR_COLORS.length], opacity: 0.35 }}>
          &rdquo;
        </span>
        <div ref={quoteRef} className="relative">
          <span className="block text-sm font-semibold tabular-nums text-black/40">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <blockquote className="mt-6 max-w-[48rem] text-[clamp(1.5rem,1.05rem+1.7vw,2.7rem)] font-medium leading-[1.18] tracking-[-0.03em] text-[#151716]">&ldquo;{item.quote}&rdquo;</blockquote>
        </div>
        <figcaption className="relative mt-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-5">
          <span className="flex items-center gap-4">
            <Avatar item={item} colorIndex={active} size="lg" />
            <span>
              <span className="block text-lg font-semibold text-[#151716]">{item.name}</span>
              {item.role && <span className="block text-sm text-black/55">{item.role}</span>}
            </span>
          </span>
          {count > 1 && (
            <span className="flex gap-2">
              {([-1, 1] as const).map((by) => (
                <button
                  key={by}
                  type="button"
                  onClick={() => go(active + by)}
                  aria-label={by === 1 ? "Next testimonial" : "Previous testimonial"}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-black/15 text-lg transition-colors duration-300 hover:bg-[#151716] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151716]"
                >
                  <span aria-hidden>{by === 1 ? "→" : "←"}</span>
                </button>
              ))}
            </span>
          )}
        </figcaption>
      </figure>

      {/* everyone, as a list to jump between (desktop); the bar under the current one fills until it moves on */}
      {count > 1 && (
        <ol className="hidden flex-col gap-2 lg:flex">
          {items.map((person, index) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => go(index)}
                aria-current={index === active || undefined}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-[1.25rem] p-3 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151716] ${
                  index === active ? "bg-white" : "hover:bg-white/60"
                }`}
                style={index === active ? { boxShadow: CARD_SHADOW } : undefined}
              >
                <Avatar item={person} colorIndex={index} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[#151716]">{person.name}</span>
                  {person.role && <span className="block truncate text-sm text-black/55">{person.role}</span>}
                </span>
                {index === active && (
                  <span
                    key={`${active}-${paused}`}
                    aria-hidden
                    className="absolute inset-x-3 bottom-1.5 h-0.5 origin-left rounded-full"
                    style={{
                      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
                      animation: paused ? "none" : `lt-progress ${SPOTLIGHT_MS}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            </li>
          ))}
        </ol>
      )}

      {/* phones: dots */}
      {count > 1 && (
        <div className="flex justify-center gap-2 lg:hidden">
          {items.map((person, index) => (
            <button
              key={person.id}
              type="button"
              onClick={() => go(index)}
              aria-label={`Show testimonial ${index + 1}`}
              aria-current={index === active || undefined}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === active ? "w-8 bg-[#151716]" : "w-2.5 bg-black/20"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * What learners and mentors said, in the layout chosen at /admin/learntogether: a group chat
 * (TestimonialChat), two endless rows of white cards gliding in opposite directions (hover pauses
 * a row), or one big quote at a time with everyone listed beside it (it moves on by itself).
 */
export default function TestimonialsSection({ items, layout }: { items: LearnTogetherTestimonial[]; layout: LearnTogetherTestimonialLayout }) {
  if (layout === "chat") return <TestimonialChat items={items} />;
  return <TestimonialsBoard items={items} layout={layout} />;
}

/** The sliding-rows and one-at-a-time layouts, under a centred heading. */
function TestimonialsBoard({ items, layout }: { items: LearnTogetherTestimonial[]; layout: LearnTogetherTestimonialLayout }) {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ root }) => {
    gsap.from("[data-quotes-heading] [data-line]", { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: root, start: "top 78%" } });
    gsap.from("[data-quotes-row]", { y: 60, opacity: 0, duration: 1.1, ease: EASE_OUT, stagger: 0.12, scrollTrigger: { trigger: root, start: "top 65%" } });
  });

  return (
    <section ref={ref} id="testimonials" className="relative overflow-hidden py-[clamp(4.5rem,9vw,8rem)]">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center px-5 text-center sm:px-8 lg:px-12">
        <h2 data-quotes-heading className="text-[clamp(2.6rem,1.5rem+4.6vw,6.4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-line className="block">In their</span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] pr-[0.1em]">
            <em data-line className="block text-[#7bbf3a]">own words.</em>
          </span>
        </h2>
        <p className="mt-4 max-w-[36rem] text-balance text-[clamp(1rem,0.94rem+0.25vw,1.15rem)] text-black/60">What learners and mentors say after building with us.</p>
      </div>

      {layout === "spotlight" ? <SpotlightLayout items={items} /> : <MarqueeLayout items={items} />}
    </section>
  );
}
