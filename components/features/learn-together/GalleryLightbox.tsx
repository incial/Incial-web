"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { LearnTogetherPhoto } from "@/lib/dataLoader";

/** A gallery photo shown large over the page: arrow keys or buttons step through, Escape closes. */
export default function GalleryLightbox({
  photos,
  index,
  onClose,
  onStep,
}: {
  photos: LearnTogetherPhoto[];
  index: number;
  onClose: () => void;
  onStep: (by: number) => void;
}) {
  const photo = photos[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "Photo"}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <figure className="w-[min(90vw,36rem)] overflow-hidden rounded-[1.75rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <span className="relative block aspect-square bg-[#151716]">
          <Image src={photo.img} alt={photo.caption || "LearnTogether photo"} fill sizes="36rem" className="object-cover" referrerPolicy="no-referrer" />
        </span>
        {photo.caption && <figcaption className="px-6 py-4 text-center text-lg font-medium text-black/75">{photo.caption}</figcaption>}
      </figure>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-[#151716] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span aria-hidden>×</span>
      </button>
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
          {([-1, 1] as const).map((by) => (
            <button
              key={by}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onStep(by);
              }}
              aria-label={by === 1 ? "Next photo" : "Previous photo"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg text-[#151716] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden>{by === 1 ? "→" : "←"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
