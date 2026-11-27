"use client";

import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LearnTogetherPhoto } from "@/lib/dataLoader";
import { LT_COLORS } from "./content";
import GalleryLightbox from "./GalleryLightbox";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

/** Tile shapes, in turn, so the columns do not line up into a grid. */
const SHAPES = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]"] as const;
/** How far each column travels relative to the others (and which way). */
const COLUMN_SPEEDS = [1, -0.7, 0.85, -1] as const;
/** Each column holds at least this many photos, repeating them, so it always has room to move. */
const MIN_PER_COLUMN = 5;

interface Tile {
  photo: LearnTogetherPhoto;
  /** index in the original list, for the counter and the large view */
  index: number;
  key: string;
}

/** Deals the photos round the columns, repeating them until every column is full enough to move. */
function dealColumns(photos: LearnTogetherPhoto[], columns: number): Tile[][] {
  const needed = Math.max(photos.length, columns * MIN_PER_COLUMN);
  const result: Tile[][] = Array.from({ length: columns }, () => []);
  for (let i = 0; i < needed; i += 1) {
    const index = i % photos.length;
    result[i % columns].push({ photo: photos[index], index, key: `${photos[index].id}-${i}` });
  }
  return result;
}

function PhotoTile({ tile, shape, onOpen }: { tile: Tile; shape: string; onOpen: (index: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(tile.index)}
      aria-label={tile.photo.caption ? `Open photo: ${tile.photo.caption}` : `Open photo ${tile.index + 1}`}
      className={`group relative block w-full overflow-hidden rounded-[1.25rem] bg-white/10 ${shape} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
    >
      <Image
        src={tile.photo.img}
        alt={tile.photo.caption || "LearnTogether photo"}
        fill
        sizes="(max-width: 768px) 45vw, 22vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      {tile.photo.caption && (
        <span className="absolute inset-x-2 bottom-2 translate-y-2 rounded-full bg-white/90 px-3 py-1.5 text-left text-xs font-semibold text-[#151716] opacity-0 backdrop-blur transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {tile.photo.caption}
        </span>
      )}
    </button>
  );
}

/**
 * The gallery: a dark rounded panel holds still while columns of photos glide past vertically,
 * alternating up and down at different speeds as you scroll. A vertical scrollbar on the right
 * shows how far through you are (drag it, click the track, or use the arrow keys); hovering a
 * photo shows its caption and clicking opens it large.
 */
export default function GalleryColumns({ photos, onScrollTo }: { photos: LearnTogetherPhoto[]; onScrollTo: (y: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const count = photos.length;
  const desktopColumns = useMemo(() => dealColumns(photos, 4), [photos]);
  const phoneColumns = useMemo(() => dealColumns(photos, 2), [photos]);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((by: number) => setOpen((current) => (current === null ? current : (current + by + count) % count)), [count]);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    gsap.from("[data-gallery-heading] [data-line]", { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: root, start: "top 70%" } });

    const area = root.querySelector<HTMLElement>(isDesktop ? "[data-columns='desktop']" : "[data-columns='phone']");
    if (!area) return;
    const columns = gsap.utils.toArray<HTMLElement>("[data-column]", area);
    // how far a column can travel inside the window
    const room = (column: HTMLElement) => Math.max(0, column.scrollHeight - area.clientHeight);

    let shown = -1;
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${window.innerHeight * (isDesktop ? 2.2 : 1.6)}`,
        pin: "[data-gallery-stage]",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          root.style.setProperty("--progress", String(self.progress));
          const index = Math.round(self.progress * Math.max(0, count - 1));
          if (index !== shown) {
            shown = index;
            setActive(index);
          }
        },
      },
    });
    columns.forEach((column, i) => {
      const speed = COLUMN_SPEEDS[i % COLUMN_SPEEDS.length];
      const share = Math.abs(speed);
      // upward columns start at the top and rise; downward ones start low and sink
      timeline.fromTo(
        column,
        { y: () => (speed > 0 ? 0 : -room(column) * share) },
        { y: () => (speed > 0 ? -room(column) * share : 0) },
        0,
      );
    });
    triggerRef.current = timeline.scrollTrigger ?? null;
    return () => {
      triggerRef.current = null;
    };
  });

  // the scrollbar: a share of the track maps to the same share of the way through the gallery
  const scrollToShare = useCallback(
    (share: number) => {
      const trigger = triggerRef.current;
      const section = ref.current;
      if (!trigger || !section) return;
      const start = section.getBoundingClientRect().top + window.scrollY;
      onScrollTo(start + Math.min(1, Math.max(0, share)) * (trigger.end - trigger.start));
    },
    [onScrollTo],
  );

  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const box = track.getBoundingClientRect();
    scrollToShare((event.clientY - box.top) / box.height);
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const by = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!by) return;
    event.preventDefault();
    scrollToShare(count > 1 ? Math.min(count - 1, Math.max(0, active + by)) / (count - 1) : 0);
  };

  const renderColumns = (columns: Tile[][], variant: "desktop" | "phone") => (
    <div
      data-columns={variant}
      className={`relative h-full gap-3 overflow-hidden md:gap-4 ${variant === "desktop" ? "hidden grid-cols-4 md:grid" : "grid grid-cols-2 md:hidden"}`}
    >
      {columns.map((column, i) => (
        <div key={i} data-column className="flex flex-col gap-3 md:gap-4">
          {column.map((tile, j) => (
            <PhotoTile key={tile.key} tile={tile} shape={SHAPES[(i + j) % SHAPES.length]} onOpen={setOpen} />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <section ref={ref} id="gallery" className="relative">
      <div data-gallery-stage className="flex h-[100svh] flex-col px-3 py-3 md:px-4 md:py-4">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2.5rem] text-[#fffbe8] md:rounded-[3.5rem]" style={{ background: LT_COLORS.ink }}>
          <div className="flex items-end justify-between gap-6 px-6 pb-6 pt-8 md:px-12 md:pb-8 md:pt-12">
            <h2 data-gallery-heading className="text-[clamp(2.2rem,1.3rem+3.6vw,5rem)] font-semibold leading-[1] tracking-[-0.05em]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-line className="block">Snapshots from</span>
              </span>
              <span className="block overflow-hidden pb-[0.14em] pr-[0.1em]">
                <em data-line className="block text-[#b8ef5a]">the room.</em>
              </span>
            </h2>
            <span className="mb-2 hidden text-sm text-white/50 md:block">Scroll through, tap a photo to open it.</span>
          </div>

          <div className="relative min-h-0 flex-1 pl-4 pr-14 md:pl-12 md:pr-24">
            {renderColumns(desktopColumns, "desktop")}
            {renderColumns(phoneColumns, "phone")}
            {/* soft fades where the photos enter and leave */}
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-12" style={{ background: `linear-gradient(${LT_COLORS.ink}, transparent)` }} />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: `linear-gradient(transparent, ${LT_COLORS.ink})` }} />

            {/* the vertical scrollbar and where you are */}
            {count > 1 && (
              <div className="absolute right-3 top-0 flex h-full flex-col items-center gap-3 pb-4 md:right-8">
                <span className="text-xs font-semibold tabular-nums text-white/60">{String(active + 1).padStart(2, "0")}</span>
                <div
                  ref={trackRef}
                  role="scrollbar"
                  aria-label="Gallery position"
                  aria-controls="gallery"
                  aria-orientation="vertical"
                  aria-valuemin={1}
                  aria-valuemax={count}
                  aria-valuenow={active + 1}
                  aria-valuetext={`Photo ${active + 1} of ${count}`}
                  tabIndex={0}
                  onKeyDown={onKey}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    fromPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
                  }}
                  className="relative w-2.5 flex-1 cursor-pointer touch-none rounded-full bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 w-full rounded-full bg-[#b8ef5a]"
                    style={{ height: `${100 / count}%`, transform: `translateY(calc(var(--progress, 0) * ${(count - 1) * 100}%))` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-white/35">{String(count).padStart(2, "0")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {open !== null && <GalleryLightbox photos={photos} index={open} onClose={close} onStep={step} />}
    </section>
  );
}
