"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import SkeletonImage from "@/components/ui/SkeletonImage";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import type { Client } from "@/lib/dataLoader";

interface ClientMarqueeProps {
  /** `null` while the list is loading. */
  clients: ReadonlyArray<Client> | null;
  /**
   * 0 -> 1 while the section rises into view. Each row then travels a different distance, so the
   * rows rise at different speeds (parallax). Omit for rows that simply sit in place.
   */
  depth?: MotionValue<number>;
}

const DESKTOP_QUERY = "(min-width: 1024px)";
const MIN_CARDS_PER_HALF = 8;
const PIXELS_PER_SECOND = 38;
// average card width, used to keep the scroll speed the same in pixels on every screen
const CARD_WIDTH_REM = { phone: 13, desktop: 24 };
const SKELETON_CARDS = 6;
const CARD_CLASS =
  "relative mr-1 flex aspect-[5/2] w-[clamp(11rem,52vw,16rem)] shrink-0 lg:aspect-[7/2] lg:w-[clamp(13rem,32vw,26rem)] items-center justify-center overflow-hidden rounded-[5px] bg-[#202020]";

/** Deals clients into `rowCount` rows, round-robin, so every row has a similar mix. */
function splitIntoRows(clients: ReadonlyArray<Client>, rowCount: number): Client[][] {
  const rows: Client[][] = Array.from({ length: rowCount }, () => []);
  clients.forEach((client, index) => rows[index % rowCount].push(client));
  return rows.filter((row) => row.length > 0);
}

/** Repeats a short row until it is long enough for a seamless loop. */
function fillRow(row: ReadonlyArray<Client>): Client[] {
  const copies = Math.max(1, Math.ceil(MIN_CARDS_PER_HALF / row.length));
  return Array.from({ length: copies }, () => row).flat();
}

/** A row whose rise is offset by `index`: lower rows start further down and catch up. */
function ParallaxRow({
  depth,
  index,
  children,
}: {
  depth: MotionValue<number>;
  index: number;
  children: ReactNode;
}) {
  const y = useTransform(depth, (d) => (1 - d) * (36 + index * 44));
  return (
    <motion.div style={{ y }} className="overflow-hidden">
      {children}
    </motion.div>
  );
}

function ClientCard({ client, eager }: { client: Client; eager: boolean }) {
  return (
    <div className={CARD_CLASS}>
      <SkeletonImage
        src={client.src}
        alt={client.name}
        fill
        sizes="(max-width: 1024px) 52vw, 26rem"
        loading={eager ? "eager" : "lazy"}
        // white logos on dark cards, whatever the source artwork: opaque white backgrounds
        // turn black and blend into the card
        className="pointer-events-none object-contain object-center px-[14%] py-3 mix-blend-screen lg:px-[18%] lg:py-6 [filter:grayscale(1)_invert(1)_brightness(1.25)]"
      />
    </div>
  );
}

/**
 * Three (phones) or five (desktop) rows of dark logo cards drifting in opposite directions,
 * faded at both edges. They never pause, not even on hover; reduced motion keeps them still.
 */
export default function ClientMarquee({ clients, depth }: ClientMarqueeProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const settled = useMotionValue(1);
  const rowDepth = depth ?? settled;

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const rows = useMemo(
    () => (clients ? splitIntoRows(clients, 5) : []),
    [clients],
  );

  const maskStyle = {
    maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
    WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
  };

  if (!clients) {
    return (
      <div aria-hidden className="flex flex-col gap-1" style={maskStyle}>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-1 overflow-hidden">
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <div key={index} className={CARD_CLASS}>
                <SkeletonBlock />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="client-marquee flex flex-col gap-1 overflow-hidden" style={maskStyle}>
      {rows.map((row, rowIndex) => {
        const cards = fillRow(row);
        // the same pixel speed on every row, however many cards it holds
        const duration = (cards.length * (isDesktop ? CARD_WIDTH_REM.desktop : CARD_WIDTH_REM.phone) * 16) / PIXELS_PER_SECOND;
        return (
          <ParallaxRow key={rowIndex} depth={rowDepth} index={rowIndex}>
            <div
              className="client-marquee-track"
              data-direction={rowIndex % 2 === 0 ? "left" : "right"}
              style={
                {
                  "--marquee-duration": `${duration}s`,
                  animationDelay: `${-rowIndex * 9}s`,
                } as React.CSSProperties
              }
            >
              {[0, 1].map((copy) =>
                cards.map((client, index) => (
                  <ClientCard
                    key={`${copy}-${client.id}-${index}`}
                    client={client}
                    eager={copy === 0 && index < 4}
                  />
                )),
              )}
            </div>
          </ParallaxRow>
        );
      })}
    </div>
  );
}
