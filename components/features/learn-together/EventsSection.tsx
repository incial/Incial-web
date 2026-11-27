"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { LearnTogetherEvent } from "@/lib/dataLoader";
import { LT_COLORS } from "./content";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

const ROW_COLORS = [LT_COLORS.sun, LT_COLORS.lilac, LT_COLORS.lime, LT_COLORS.blue, LT_COLORS.coral] as const;

/**
 * The past events as an editorial index: one big row per event (number, date, title with a line
 * about it, and the place) between hairlines. On desktop, hovering the list brings up a photo
 * card that follows the pointer and shows the hovered event; the row slides over with a wash of
 * colour. On phones each row carries its photo, since there is no pointer to follow.
 */
export default function EventsSection({ events }: { events: LearnTogetherEvent[] }) {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(0);
  const moveRef = useRef<((x: number, y: number) => void) | null>(null);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    gsap.from("[data-events-heading] [data-line]", { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: root, start: "top 78%" } });
    gsap.from("[data-event-row]", { y: 50, opacity: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: "[data-event-list]", start: "top 85%" } });
    gsap.from("[data-event-rule]", { scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "power3.inOut", stagger: 0.08, scrollTrigger: { trigger: "[data-event-list]", start: "top 85%" } });

    if (!isDesktop) return;
    // the photo card trails the pointer with a little lag and leans with its movement
    const card = root.querySelector<HTMLElement>("[data-event-preview]");
    const list = root.querySelector<HTMLElement>("[data-event-list]");
    if (!card || !list) return;
    const toX = gsap.quickTo(card, "x", { duration: 0.55, ease: "power3.out" });
    const toY = gsap.quickTo(card, "y", { duration: 0.55, ease: "power3.out" });
    const toRotate = gsap.quickTo(card, "rotate", { duration: 0.8, ease: "power3.out" });
    let lastX = 0;
    moveRef.current = (x, y) => {
      const box = list.getBoundingClientRect();
      toX(x - box.left);
      toY(y - box.top);
      toRotate(gsap.utils.clamp(-10, 10, (x - lastX) * 0.6));
      lastX = x;
    };
    return () => {
      moveRef.current = null;
    };
  });

  return (
    <section ref={ref} id="events" className="relative py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <h2 data-events-heading className="text-[clamp(2.8rem,1.6rem+5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">Past</span>
            </span>
            <span className="block overflow-hidden pb-[0.16em] pr-[0.1em]">
              <em data-line className="block text-[#ff6b57]">Events.</em>
            </span>
          </h2>
          <span className="mb-4 text-sm font-medium tabular-nums text-black/45">({String(events.length).padStart(2, "0")})</span>
        </div>

        <div data-event-list className="group/list relative mt-10" onPointerMove={(event) => moveRef.current?.(event.clientX, event.clientY)}>
          {/* the photo card that follows the pointer (desktop only); GSAP moves this wrapper */}
          <div data-event-preview aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block">
            <div
              className="relative h-[15rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 scale-75 overflow-hidden rounded-[1.5rem] opacity-0 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] transition-[opacity,scale] duration-300 group-hover/list:scale-100 group-hover/list:opacity-100"
              style={{ background: ROW_COLORS[hovered % ROW_COLORS.length] }}
            >
              {events.map((event, index) =>
                event.img ? (
                  <Image
                    key={event.id}
                    src={event.img}
                    alt=""
                    fill
                    sizes="20rem"
                    className={`object-cover transition-opacity duration-300 ${index === hovered ? "opacity-100" : "opacity-0"}`}
                    referrerPolicy="no-referrer"
                  />
                ) : null,
              )}
            </div>
          </div>

          <ol>
            {events.map((event, index) => (
              <li key={event.id} data-event-row onPointerEnter={() => setHovered(index)} className="group/row relative">
                <span data-event-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-black/15" />
                {/* the wash of colour that rises behind the hovered row */}
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 rounded-[1rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:scale-y-100"
                  style={{ background: ROW_COLORS[index % ROW_COLORS.length] }}
                />
                <article className="relative grid gap-4 py-7 md:grid-cols-[3rem_10rem_minmax(0,1fr)_11rem_3rem] md:items-center md:gap-6 md:px-5 md:py-9">
                  {/* phones: the photo sits in the row */}
                  {event.img && (
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-[1.25rem] md:hidden">
                      <Image src={event.img} alt={event.title} fill sizes="92vw" className="object-cover" referrerPolicy="no-referrer" />
                    </span>
                  )}
                  <span className="hidden text-sm font-semibold tabular-nums text-black/40 md:block">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-medium text-black/55">{event.date}</span>
                  <div className="min-w-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/row:translate-x-3">
                    <h3 className="text-[clamp(1.7rem,1.1rem+2vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{event.title}</h3>
                    {event.summary && <p className="mt-2 max-w-[40rem] text-[0.98rem] leading-snug text-black/60 md:line-clamp-1">{event.summary}</p>}
                  </div>
                  <span className="text-sm font-medium text-black/55 md:text-right">{event.location}</span>
                  <span
                    aria-hidden
                    className="hidden h-12 w-12 items-center justify-center justify-self-end rounded-full border border-black/20 text-lg transition-[transform,background-color,color] duration-500 group-hover/row:-rotate-45 group-hover/row:bg-[#151716] group-hover/row:text-white md:flex"
                  >
                    →
                  </span>
                </article>
              </li>
            ))}
          </ol>
          <span aria-hidden className="block h-px bg-black/15" />
        </div>
      </div>
    </section>
  );
}
