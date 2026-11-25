"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import type { Product } from "@/lib/dataLoader";

export function firstParagraph(product: Product): string {
  const paragraphs = Array.isArray(product.description)
    ? product.description
    : (product.description || "").split("\n\n");
  return paragraphs.find((paragraph) => paragraph.trim())?.trim() ?? "";
}

/** The first sentence of the description: enough for a caption. */
export function firstSentence(product: Product): string {
  const text = firstParagraph(product);
  const end = text.search(/[.!?](\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}

/** The product's banner: its video when one is chosen, otherwise its image. */
export function ProductMedia({ product, index }: { product: Product; index: number }) {
  const useVideo = product.mediaType === "video" && Boolean(product.video);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[22px] bg-white">
      {useVideo ? (
        <video
          src={product.video}
          poster={product.image || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 86vw, 42rem"
          className="object-cover object-top"
          priority={index === 0}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-2xl font-semibold text-black/30">{product.name}</div>
      )}
    </div>
  );
}

/** Distance between the cursor and the little dialog, in px. */
const HOVER_OFFSET = 18;

function paragraphsOf(product: Product): string[] {
  const paragraphs = Array.isArray(product.description)
    ? product.description
    : (product.description || "").split("\n\n");
  return paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean);
}

/** A small dialog that follows the cursor while it is over a product's picture, with that product's details. */
export function ProductHoverCard({ product, visible, x, y }: { product: Product; visible: boolean; x: MotionValue<number>; y: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  // sits to the lower right of the cursor, and flips to the other side near the screen's edges
  const left = useTransform(x, (cx) => {
    const width = ref.current?.offsetWidth ?? 320;
    return cx + HOVER_OFFSET + width > window.innerWidth - 12 ? cx - width - HOVER_OFFSET : cx + HOVER_OFFSET;
  });
  const top = useTransform(y, (cy) => {
    const height = ref.current?.offsetHeight ?? 220;
    return cy + HOVER_OFFSET + height > window.innerHeight - 12 ? cy - height - HOVER_OFFSET : cy + HOVER_OFFSET;
  });
  const paragraphs = paragraphsOf(product).slice(0, 2);
  const tags = (product.tags ?? []).slice(0, 4);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={ref}
          role="tooltip"
          style={{ left, top }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="pointer-events-none fixed z-[80] w-[min(21rem,86vw)] rounded-2xl bg-white p-4 text-left text-[#151716] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.4)] ring-1 ring-black/5"
        >
          <p className="text-[1.05rem] font-semibold leading-tight">
            {product.name}
            {product.tagline && <span className="ml-2 text-[0.78rem] font-normal italic text-black/40">{product.tagline}</span>}
          </p>
          {product.category && <p className="mt-1 text-[0.78rem] text-black/45">{product.category}</p>}
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed text-black/65">
              {paragraph}
            </p>
          ))}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[0.7rem] font-medium text-black/60">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * "Explore": goes to the product's own link (the "Try URL" set in the admin). A product without a
 * link sends the visitor to the contact section instead, so the button is never a dead end.
 */
export function ExploreButton({ product }: { product: Product }) {
  const external = Boolean(product.tryUrl);
  const className =
    "group/explore mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#151716] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] md:mt-5";
  const content = (
    <>
      Explore
      <span aria-hidden className="transition-transform duration-300 group-hover/explore:translate-x-1">
        →
      </span>
    </>
  );

  return external ? (
    <a href={product.tryUrl} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${product.name}`} className={className}>
      {content}
    </a>
  ) : (
    <Link href="/#contact" aria-label={`Explore ${product.name}`} className={className}>
      {content}
    </Link>
  );
}

/**
 * The product's name with its chip, its category and a short line, and the Explore button: the words
 * that sit beside the picture. `color` lets the page tint the name as the scrolling line reaches it.
 */
export function ProductCaption({ product, color }: { product: Product; color?: MotionValue<string> }) {
  const summary = firstSentence(product);
  return (
    <>
      <motion.h2
        style={color ? { color } : undefined}
        className="text-[1.3rem] font-light leading-[1.2] tracking-[-0.03em] md:max-w-[11em] md:text-[clamp(1.6rem,1rem+1.8vw,2.7rem)] md:leading-[1.1] md:tracking-[-0.035em]"
      >
        {product.name}
        <span className="relative ml-3 inline-block h-[0.95em] w-[0.95em] rounded-full bg-[#151716] align-middle shadow-[0_0_0_0.28em_rgba(34,180,90,0.16)] ring-2 ring-white">
          <Image src="/logo/Logoo-white.svg" alt="" fill sizes="40px" className="object-contain p-[0.2em]" />
        </span>
      </motion.h2>
      {(product.category || product.tagline) && (
        <p className="mt-1.5 text-[0.8rem] text-black/45 md:mt-2 md:text-[0.85rem]">{[product.category, product.tagline].filter(Boolean).join(" · ")}</p>
      )}
      {summary && <p className="mt-2 line-clamp-2 max-w-[24rem] text-[0.88rem] leading-relaxed text-black/60 md:mt-3 md:text-[0.95rem]">{summary}</p>}
      <ExploreButton product={product} />
    </>
  );
}

/** The picture card: the product's image or video, and the details dialog that follows the cursor over it. */
export function ProductCard({ product, index = 1 }: { product: Product; index?: number }) {
  // the dialog follows the cursor over the picture (not on touch screens, which have no hover)
  const [hover, setHover] = useState<"idle" | "on" | "off">("idle");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  return (
    <div
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        pointerX.set(event.clientX);
        pointerY.set(event.clientY);
        setHover("on");
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        pointerX.set(event.clientX);
        pointerY.set(event.clientY);
      }}
      onPointerLeave={() => setHover((state) => (state === "idle" ? state : "off"))}
      className="relative ml-5 aspect-[4/3] w-[calc(100%-1.25rem)] [filter:drop-shadow(0_20px_24px_rgba(0,0,0,0.2))] md:ml-0 md:w-full md:[filter:drop-shadow(0_26px_30px_rgba(0,0,0,0.2))] md:aspect-[16/10]"
    >
      <ProductMedia product={product} index={index} />
      {hover !== "idle" && <ProductHoverCard product={product} visible={hover === "on"} x={pointerX} y={pointerY} />}
    </div>
  );
}
