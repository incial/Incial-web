"use client";

import { useMemo, type CSSProperties } from "react";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import SkeletonImage from "@/components/ui/SkeletonImage";
import type { Client } from "@/lib/dataLoader";
import { useClientsData } from "@/lib/useClientsData";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

const ROW_COUNT = 2;
const MIN_ITEMS_PER_HALF = 10;
const PIXELS_PER_SECOND = 46;
const ITEM_WIDTH_PX = 352;
const SKELETON_COUNT = 8;

const MASK_STYLE: CSSProperties = {
  maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
  WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
};

/** Deals clients into `ROW_COUNT` rows, round-robin, so both rows have a balanced mix. */
function splitIntoTwoRows(clients: ReadonlyArray<Client>): Client[][] {
  const rows: Client[][] = Array.from({ length: ROW_COUNT }, () => []);
  clients.forEach((client, index) => rows[index % ROW_COUNT].push(client));
  return rows.filter((row) => row.length > 0);
}

/** Repeats a row until it is wide enough for a seamless marquee loop. */
function fillRow(row: ReadonlyArray<Client>): Client[] {
  const copies = Math.max(1, Math.ceil(MIN_ITEMS_PER_HALF / row.length));
  return Array.from({ length: copies }, () => row).flat();
}

function ClientLogo({ client, eager }: { client: Client; eager: boolean }) {
  return (
    <div className="relative mx-6 flex h-20 w-48 shrink-0 items-center justify-center sm:mx-8 sm:h-24 sm:w-60 md:mx-10 md:h-28 md:w-68">
      <SkeletonImage
        src={client.src}
        alt={client.name}
        fill
        sizes="(max-width: 640px) 12rem, (max-width: 768px) 15rem, 17rem"
        loading={eager ? "eager" : "lazy"}
        className="pointer-events-none object-contain object-center opacity-80 [filter:grayscale(1)_contrast(1.1)] [mix-blend-mode:multiply]"
      />
    </div>
  );
}

/**
 * White rounded-top Clients section rising over the black services showcase above it, featuring a
 * centered heading and two full-width continuously scrolling rows of logos faded at both edges.
 */
export default function HomeClients() {
  const data = useClientsData();
  const sectionsConfig = useSectionsConfig();

  const rows = useMemo(
    () => (data?.clients ? splitIntoTwoRows(data.clients) : []),
    [data],
  );

  if (sectionsConfig["client-logos"] === false) return null;

  const heading = (data?.headerText || "Some of Our Awesome Clients").replace(/:$/, "");

  return (
    <section
      id="clients"
      data-tone="light"
      aria-label="Our Clients"
      className="relative z-20 -mt-[clamp(1.75rem,4vw,3rem)] overflow-hidden rounded-t-[clamp(1.75rem,4vw,3rem)] bg-white pb-[clamp(6rem,11vw,9.5rem)] pt-[clamp(6rem,11vw,9.5rem)] text-[#151716]"
    >
      <h2 className="mb-16 px-6 text-center text-[clamp(1.35rem,1rem+1.5vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.03em] text-[#151716]/85 sm:mb-20 md:mb-24 lg:mb-28">
        {heading}
      </h2>

      {!data ? (
        <div aria-hidden className="flex w-full flex-col gap-10 sm:gap-14" style={MASK_STYLE}>
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center overflow-hidden">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div
                  key={index}
                  className="mx-6 h-20 w-48 shrink-0 overflow-hidden rounded bg-black/5 sm:mx-8 sm:h-24 sm:w-60 md:mx-10 md:h-28 md:w-68"
                >
                  <SkeletonBlock />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-10 overflow-hidden sm:gap-14" style={MASK_STYLE}>
          {rows.map((row, rowIndex) => {
            const items = fillRow(row);
            const duration = (items.length * ITEM_WIDTH_PX) / PIXELS_PER_SECOND;
            return (
              <div key={rowIndex} className="overflow-hidden">
                <div
                  className="client-marquee-track items-center"
                  data-direction={rowIndex % 2 === 0 ? "left" : "right"}
                  style={
                    {
                      "--marquee-duration": `${duration}s`,
                      animationDelay: `${-rowIndex * 11}s`,
                    } as CSSProperties
                  }
                >
                  {[0, 1].map((copy) =>
                    items.map((client, index) => (
                      <ClientLogo
                        key={`${copy}-${client.id}-${index}`}
                        client={client}
                        eager={copy === 0 && index < 6}
                      />
                    )),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
