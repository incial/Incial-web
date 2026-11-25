"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPost } from "@/lib/dataLoader";

/** Plain words only: no heading marks, bold marks, links or code ticks. */
function plain(text: string): string {
  return text
    .replace(/\\?#+\s*/g, "")
    .replace(/[*_`>]+/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** The first real paragraph of a post, for a short preview; stubs and placeholders are skipped. */
function excerptOf(post: BlogPost): string {
  const MIN_LENGTH = 30;
  return (
    (post.content ?? "")
      .split(/\n\s*\n/)
      .map(plain)
      .find((paragraph) => paragraph.length >= MIN_LENGTH) ?? ""
  );
}

/** A blue plus sign where two of the grid's lines cross. */
function Cross({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-10 -translate-x-1/2 select-none text-lg leading-none text-[#56A6FF] ${className}`}>
      +
    </span>
  );
}

/**
 * One post as a standalone row of the grid: a rounded picture that fills its box, and beside it the
 * title, who wrote it and when, a short preview and a rounded button to read it. Every row has the
 * picture on the left. The whole row slides up as it is scrolled to.
 */
export default function BlogRow({ post, priority = false, last = false }: { post: BlogPost; priority?: boolean; last?: boolean }) {
  const src = post.image || post.coverImage || post.heroImage || "";
  const excerpt = excerptOf(post);

  // the vertical line closes the picture's box on its right; the plus signs sit where it meets the rows' lines
  const pictureBox = "relative aspect-[3/2] md:aspect-auto md:min-h-[24rem]";
  const textBox = "relative flex flex-col items-start justify-center px-5 py-8 text-left sm:px-8 md:border-l md:border-black/15 md:py-12 md:pl-14 lg:pl-20 lg:pr-12";

  return (
    <motion.article
      className={`border-t border-black/15 ${last ? "border-b" : ""}`}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/blogs/${post.slug}`}
        className="group grid gap-0 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
      >
        <div className={pictureBox}>
          {/* the picture fills its box edge to edge, so it touches the lines around it */}
          <div className="absolute inset-0 overflow-hidden bg-black/10">
            {src ? (
              <Image
                src={src}
                alt={post.title}
                fill
                priority={priority}
                sizes="(max-width: 768px) 92vw, 45vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="h-full w-full bg-black/10" />
            )}
          </div>
        </div>

        <div className={textBox}>
          <Cross className="left-0 top-0 hidden -translate-y-1/2 md:block" />
          {last && <Cross className="bottom-0 left-0 hidden translate-y-1/2 md:block" />}
          {post.category && <span className="mb-4 rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/60">{post.category}</span>}
          <h3 className="text-[clamp(1.6rem,1.1rem+1.6vw,2.7rem)] font-normal leading-[1.1] tracking-[-0.03em] text-[#151716]">{post.title}</h3>
          <p className="mt-3 text-[0.9rem] text-black/45">
            {[post.author, post.date, `${post.mins} min read`].filter(Boolean).join(" · ")}
          </p>
          {excerpt && <p className="mt-5 line-clamp-3 max-w-[34rem] text-[1rem] leading-relaxed text-black/60">{excerpt}</p>}
          <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#151716] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-[1.04] group-active:scale-[0.98]">
            Read article
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

/** One post in the phone list: a flush picture, then its title, details and the rounded button, rising into view. */
export function MobilePost({ post, priority = false, last = false }: { post: BlogPost; priority?: boolean; last?: boolean }) {
  const src = post.image || post.coverImage || post.heroImage || "";
  const excerpt = excerptOf(post);
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/blogs/${post.slug}`} className="group block">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-black/10">
          {src && <Image src={src} alt={post.title} fill priority={priority} sizes="92vw" className="object-cover" />}
        </div>
        {post.category && <span className="mt-5 inline-block rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/60">{post.category}</span>}
        <h3 className="mt-3 text-[1.5rem] font-normal leading-[1.12] tracking-[-0.03em]">{post.title}</h3>
        <p className="mt-2 text-[0.85rem] text-black/45">{[post.author, post.date, `${post.mins} min read`].filter(Boolean).join(" · ")}</p>
        {excerpt && <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-black/60">{excerpt}</p>}
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#151716] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]">
          Read article <span aria-hidden>→</span>
        </span>
      </Link>
      {!last && <div aria-hidden className="mt-12 h-px w-full bg-black/15" />}
    </motion.article>
  );
}
