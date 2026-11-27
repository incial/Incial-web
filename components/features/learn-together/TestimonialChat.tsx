"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { LearnTogetherTestimonial } from "@/lib/dataLoader";
import { SwapMascot } from "./Characters";
import { LT_COLORS } from "./content";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

const BUBBLE_COLORS = [LT_COLORS.lime, LT_COLORS.lilac, LT_COLORS.sun, LT_COLORS.blue, LT_COLORS.coral] as const;
const SHADOW = "0 1px 2px rgba(21,23,22,0.04), 0 8px 24px -12px rgba(21,23,22,0.12), 0 24px 48px -28px rgba(21,23,22,0.18)";
/** How long the "typing…" dots show before each message lands. */
const TYPING_SECONDS = 0.7;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ item, color, size = 36 }: { item: LearnTogetherTestimonial; color: string; size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full text-[0.68rem] font-semibold text-[#151716] ring-2 ring-white"
      style={{ background: color, width: size, height: size }}
    >
      {item.img ? <Image src={item.img} alt="" fill sizes={`${size}px`} className="object-cover" referrerPolicy="no-referrer" /> : <span aria-hidden>{initials(item.name)}</span>}
    </span>
  );
}

function TypingDots({ side }: { side: "left" | "right" }) {
  return (
    <span
      data-typing
      aria-hidden
      className={`absolute bottom-0 flex items-center gap-1 rounded-full bg-white px-4 py-3 opacity-0 ${side === "left" ? "left-0" : "right-0"}`}
      style={{ boxShadow: SHADOW }}
    >
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="lt-typing-dot h-2 w-2 rounded-full bg-black/40" style={{ animationDelay: `${dot * 0.15}s` }} />
      ))}
    </span>
  );
}

function Message({ item, index }: { item: LearnTogetherTestimonial; index: number }) {
  const side = index % 2 === 0 ? "left" : "right";
  const color = BUBBLE_COLORS[index % BUBBLE_COLORS.length];
  return (
    <li data-message className={`flex items-end gap-3 ${side === "right" ? "flex-row-reverse" : ""}`}>
      <Avatar item={item} color={color} />
      <figure className={`relative flex max-w-[min(85%,30rem)] flex-col ${side === "right" ? "items-end" : "items-start"}`}>
        <figcaption className={`mb-1.5 px-1 text-xs ${side === "right" ? "text-right" : ""}`}>
          <span className="font-semibold text-[#151716]">{item.name}</span>
          {item.role && <span className="text-black/50"> · {item.role}</span>}
        </figcaption>
        <div className="relative">
          <TypingDots side={side} />
          <blockquote
            data-bubble
            className={`rounded-[1.4rem] px-5 py-3.5 text-[clamp(0.98rem,0.92rem+0.25vw,1.1rem)] leading-snug text-[#151716] ${
              side === "left" ? "rounded-bl-md bg-white" : "rounded-br-md"
            }`}
            style={{ background: side === "right" ? color : undefined, boxShadow: SHADOW, transformOrigin: side === "left" ? "0% 100%" : "100% 100%" }}
          >
            {item.quote}
          </blockquote>
        </div>
      </figure>
    </li>
  );
}

/**
 * The testimonials as a group chat: the heading holds on the left while, in a chat window on the
 * right, each testimonial arrives as a message as you scroll to it ("typing…" dots first, then the
 * bubble pops in), alternating sides and colours like a real conversation. With reduced motion the
 * messages are simply there.
 */
export default function TestimonialChat({ items }: { items: LearnTogetherTestimonial[] }) {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ root }) => {
    gsap.from("[data-chat-heading] [data-line]", { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: root, start: "top 78%" } });
    gsap.from("[data-chat-window]", { y: 60, opacity: 0, duration: 1.1, ease: EASE_OUT, scrollTrigger: { trigger: root, start: "top 70%" } });

    gsap.utils.toArray<HTMLElement>("[data-message]").forEach((message) => {
      const typing = message.querySelector("[data-typing]");
      const bubble = message.querySelector("[data-bubble]");
      const caption = message.querySelector("figcaption");
      const avatar = message.firstElementChild;
      if (!typing || !bubble) return;
      gsap.set([bubble, caption, avatar], { opacity: 0 });
      gsap
        .timeline({ scrollTrigger: { trigger: message, start: "top 88%" } })
        .fromTo(avatar, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" })
        .fromTo(typing, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(2)" }, "<")
        .to(typing, { scale: 0.6, opacity: 0, duration: 0.2 }, `+=${TYPING_SECONDS}`)
        .fromTo(bubble, { scale: 0.6, y: 14, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }, "<")
        .to(caption, { opacity: 1, duration: 0.3 }, "<0.15");
    });
  });

  return (
    <section ref={ref} id="testimonials" className="relative py-[clamp(4.5rem,9vw,8rem)]">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16 lg:px-12">
        {/* left: holds while the conversation scrolls */}
        <div className="md:sticky md:top-[clamp(6rem,14vh,9rem)] md:self-start">
          <h2 data-chat-heading className="text-[clamp(2.6rem,1.5rem+4.4vw,6rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">In their</span>
            </span>
            <span className="block overflow-hidden pb-[0.16em] pr-[0.1em]">
              <em data-line className="block text-[#7bbf3a]">own words.</em>
            </span>
          </h2>
          <p className="mt-5 max-w-[24rem] text-[clamp(1rem,0.94rem+0.25vw,1.15rem)] leading-snug text-black/65">
            Straight from the group chat: what learners and mentors say after building with us.
          </p>
          <div className="mt-8 hidden md:block">
            <SwapMascot start="marketer" label="Switch character" className="w-[clamp(8rem,12vw,11rem)] -rotate-3" />
          </div>
        </div>

        {/* right: the chat window */}
        <div data-chat-window className="overflow-hidden rounded-[2rem] bg-white" style={{ boxShadow: SHADOW }}>
          <header className="flex items-center gap-3 border-b border-black/[0.07] px-5 py-4 md:px-6">
            <span className="flex -space-x-2.5">
              {items.slice(0, 4).map((item, index) => (
                <Avatar key={item.id} item={item} color={BUBBLE_COLORS[index % BUBBLE_COLORS.length]} size={34} />
              ))}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-[#151716]">LearnTogether crew</span>
              <span className="flex items-center gap-1.5 text-xs text-black/50">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#5cbf3f]" />
                {items.length} {items.length === 1 ? "voice" : "voices"}
              </span>
            </span>
          </header>

          <ol className="flex flex-col gap-7 px-4 py-8 md:px-7 md:py-10" style={{ background: "#f8f5ee" }}>
            {items.map((item, index) => (
              <Message key={item.id} item={item} index={index} />
            ))}
          </ol>

          <a
            href="#community"
            className="group flex items-center justify-between gap-3 border-t border-black/[0.07] px-5 py-4 text-sm text-black/45 transition-colors duration-300 hover:text-[#151716] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#151716] md:px-6"
          >
            <span>Join the conversation…</span>
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-[#151716] text-white transition-transform duration-300 group-hover:-rotate-45">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
