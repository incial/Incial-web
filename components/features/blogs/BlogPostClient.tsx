"use client";

import MenuFrame from "@/components/layout/MenuFrame";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { BlogPost } from "@/lib/dataLoader";

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

type ContentBlockType = "h1" | "h2" | "h3" | "li" | "p" | "divider";

interface ContentBlock {
  type: ContentBlockType;
  text: string;
}

/** After this many sentences a gallery picture is set into the text. */
const SENTENCES_BETWEEN_GALLERIES = 6;
const SUBTITLE_MAX = 170;
const EASE = [0.22, 1, 0.36, 1] as const;

function getPostImages(post: BlogPost): string[] {
  return (post.images || []).map((img) => (typeof img === "string" ? img.trim() : "")).filter(Boolean);
}

function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g);
  return (sentences ?? [normalized]).map((sentence) => sentence.trim()).filter(Boolean);
}

function parseContentToBlocks(content?: string): ContentBlock[] {
  if (!content) {
    return [{ type: "p", text: "This post is currently being written. Check back soon for the full article." }];
  }

  const blocks: ContentBlock[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("\\#")) {
      blocks.push({ type: "p", text: line.slice(1).replace(/^#+\s*/, "").trim() });
      continue;
    }
    const heading = line.match(/^(#{1,3})\s*(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text: heading[2].trim() });
      continue;
    }
    if (line === "---") {
      blocks.push({ type: "divider", text: "" });
      continue;
    }
    if (line.startsWith("- ")) {
      blocks.push({ type: "li", text: line.slice(2) });
      continue;
    }
    blocks.push({ type: "p", text: line });
  }
  return blocks;
}

/**
 * Splits off a short line for under the heading: the first sentence of the opening paragraph. The
 * article then begins with the rest of that paragraph (or the next one), so nothing is said twice.
 */
function splitIntro(blocks: ContentBlock[]): { subtitle: string; body: ContentBlock[] } {
  const at = blocks.findIndex((block) => block.type === "p" && block.text.replace(/\s+/g, " ").length >= 30);
  if (at === -1) return { subtitle: "", body: blocks };
  const plain = blocks[at].text.replace(/[*_`>]+/g, "").replace(/\s+/g, " ").trim();
  const sentences = splitIntoSentences(blocks[at].text);
  const first = splitIntoSentences(plain)[0] ?? plain;
  const subtitle = first.length > SUBTITLE_MAX ? `${first.slice(0, SUBTITLE_MAX - 1).trimEnd()}…` : first;
  const rest = sentences.slice(1).join(" ").trim();
  const body = [...blocks];
  if (rest) body[at] = { type: "p", text: rest };
  else body.splice(at, 1);
  return { subtitle, body };
}

/** Turns **bold** marks in the saved text into real bold. */
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={index} className="font-semibold text-[#151716]">{part.slice(2, -2)}</strong> : part,
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Slides up and fades in as it is scrolled to. */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function renderBlock(block: ContentBlock, key: string): React.JSX.Element {
  switch (block.type) {
    case "divider":
      return <div key={key} className="my-10 h-px bg-black/15" />;
    case "h1":
      return (
        <Reveal key={key}>
          <h2 className="mt-14 text-[clamp(1.8rem,1.3rem+1.4vw,2.6rem)] font-normal leading-tight tracking-[-0.03em]">{block.text}</h2>
        </Reveal>
      );
    case "h2":
      return (
        <Reveal key={key}>
          <h2 className="mt-12 text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] font-normal leading-tight tracking-[-0.025em]">{block.text}</h2>
        </Reveal>
      );
    case "h3":
      return (
        <Reveal key={key}>
          <h3 className="mt-10 text-[1.25rem] font-semibold leading-snug tracking-[-0.01em]">{block.text}</h3>
        </Reveal>
      );
    case "li":
      return (
        <Reveal key={key}>
          <p className="flex gap-3 text-[1.0625rem] leading-[1.8] text-black/75">
            <span aria-hidden className="mt-[0.8em] size-1.5 shrink-0 rounded-full bg-[#56A6FF]" />
            <span>{inline(block.text)}</span>
          </p>
        </Reveal>
      );
    default:
      return (
        <Reveal key={key}>
          <p className="text-[1.0625rem] leading-[1.85] text-black/75">{inline(block.text)}</p>
        </Reveal>
      );
  }
}

function GalleryFigure({ src, alt, index }: { src: string; alt: string; index: number }) {
  return (
    <Reveal>
      <figure className="my-10 overflow-hidden rounded-2xl bg-black/5">
        <div className="relative aspect-[16/10] w-full">
          <Image src={src} alt={`${alt}: picture ${index + 1}`} fill sizes="(max-width: 1024px) 92vw, 46rem" className="object-cover" />
        </div>
      </figure>
    </Reveal>
  );
}

/** The article: the first paragraph is the lead, and gallery pictures are set in between the paragraphs. */
function Article({ blocks, gallery, title }: { blocks: ContentBlock[]; gallery: string[]; title: string }) {
  const nodes: React.JSX.Element[] = [];
  let galleryIndex = 0;
  let sentences = 0;
  let leadDone = false;

  const addGallery = () => {
    if (galleryIndex >= gallery.length) return;
    nodes.push(<GalleryFigure key={`g-${galleryIndex}`} src={gallery[galleryIndex]} alt={title} index={galleryIndex} />);
    galleryIndex += 1;
  };

  blocks.forEach((block, index) => {
    if (block.type !== "p") {
      nodes.push(renderBlock(block, `b-${index}`));
      return;
    }
    if (!leadDone) {
      leadDone = true;
      nodes.push(
        <Reveal key={`lead-${index}`}>
          <p className="text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] leading-[1.6] tracking-[-0.01em] text-[#151716]">{inline(block.text)}</p>
        </Reveal>,
      );
      sentences += splitIntoSentences(block.text).length;
      return;
    }
    nodes.push(renderBlock(block, `b-${index}`));
    sentences += splitIntoSentences(block.text).length;
    if (sentences >= SENTENCES_BETWEEN_GALLERIES) {
      addGallery();
      sentences = 0;
    }
  });
  while (galleryIndex < gallery.length) addGallery();

  return <div className="flex max-w-[56rem] flex-col gap-6">{nodes}</div>;
}

/** The fixed column: who wrote it, when, how long it takes to read, and ways to share it. */
function Details({ post }: { post: BlogPost }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = () => (typeof window === "undefined" ? "" : window.location.href);

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // the browser blocked it; nothing to do
    }
  }

  const shareClass = "rounded-full border border-black/15 px-3.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-black hover:text-white";

  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-5 text-[0.9rem] lg:flex lg:flex-col lg:gap-7">
      <Link href="/blogs" className="col-span-2 w-fit border-b border-black/20 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] transition-opacity hover:opacity-60">
        <span aria-hidden>← </span>
        All articles
      </Link>

      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#151716] text-sm font-medium text-white">{initialsOf(post.author)}</span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-black/45">Written by</p>
          <p className="font-medium">{post.author}</p>
        </div>
      </div>

      <dl className="flex flex-col gap-3 text-right lg:gap-5 lg:border-t lg:border-black/15 lg:pt-6 lg:text-left">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-black/45">Published</dt>
          <dd className="mt-0.5 whitespace-nowrap font-medium lg:mt-1">{post.date}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-black/45">Reading time</dt>
          <dd className="mt-0.5 font-medium lg:mt-1">{post.mins} min read</dd>
        </div>
        {post.category && (
          <div className="hidden lg:block">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-black/45">Topic</dt>
            <dd className="mt-1">
              <span className="rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/60">{post.category}</span>
            </dd>
          </div>
        )}
      </dl>

      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-black/15 pt-4 lg:block lg:pt-6">
        {post.category && <span className="rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/60 lg:hidden">{post.category}</span>}
        <p className="mb-3 hidden text-[11px] uppercase tracking-[0.08em] text-black/45 lg:block">Share</p>
        <div className="flex flex-wrap justify-end gap-2 lg:justify-start">
          <a href="https://www.linkedin.com/sharing/share-offsite/" onClick={(event) => { event.currentTarget.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`; }} target="_blank" rel="noopener noreferrer" className={shareClass}>
            LinkedIn
          </a>
          <a href="https://twitter.com/intent/tweet" onClick={(event) => { event.currentTarget.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl())}&text=${encodeURIComponent(post.title)}`; }} target="_blank" rel="noopener noreferrer" className={shareClass}>
            X
          </a>
          <button type="button" onClick={copy} className={shareClass}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ post }: { post: BlogPost }) {
  const src = post.image || post.coverImage || post.heroImage || "";
  return (
    <Link href={`/blogs/${post.slug}`} className="group block">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-black/10">
        {src && <Image src={src} alt={post.title} fill sizes="(max-width: 768px) 92vw, 30vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />}
      </div>
      <p className="mt-4 text-[1.2rem] font-normal leading-snug tracking-[-0.02em]">{post.title}</p>
      <p className="mt-1 text-[0.85rem] text-black/45">
        {post.author} · {post.mins} min read
      </p>
    </Link>
  );
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { subtitle, body: blocks } = useMemo(() => splitIntro(parseContentToBlocks(post.content)), [post.content]);
  const gallery = getPostImages(post);
  const cover = post.coverImage || post.heroImage || post.image || "";

  return (
    <div className="relative min-h-screen bg-white">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} blend />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{ y: menuOpen ? 100 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative origin-top overflow-x-clip bg-white text-[#151716] min-h-screen"
        style={{ zIndex: 30 }}
      >
        {/* the cover fills the whole screen: the picture, the heading and a short line about the article */}
        <section className="relative flex h-dvh min-h-[34rem] items-end overflow-hidden bg-black text-white">
          {cover && <Image src={cover} alt="" fill priority sizes="100vw" className="object-cover opacity-80" />}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
          {/* at the top of the image, under the site's own header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-x-0 top-24 z-10 mx-auto max-w-[1431px] px-5 sm:px-8 md:top-28 lg:px-12"
          >
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blogs", href: "/blogs" }, { label: post.title }]} variant="pill" size="base" animate={false} className="!justify-start !pt-0" />
          </motion.div>
          <div className="relative z-10 mx-auto w-full max-w-[1431px] px-5 pb-14 pt-40 sm:px-8 md:pb-20 lg:px-12">
            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="max-w-[20ch] text-balance text-[clamp(2.3rem,1.2rem+4.4vw,5.2rem)] font-normal leading-[1.04] tracking-[-0.04em]"
            >
              {post.title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                className="mt-6 max-w-[40rem] text-[clamp(1rem,0.9rem+0.5vw,1.3rem)] leading-relaxed text-white/80"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </section>

        {/* just below the cover, two columns: the details stay still on the left, the article runs down the right */}
        <div className="mx-auto grid max-w-[1431px] lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="border-b border-black/15 px-5 py-6 sm:px-8 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-14 lg:pl-12 lg:pr-10">
            <Details post={post} />
          </aside>
          <article className="px-5 py-14 sm:px-8 md:py-20 lg:px-16 xl:px-20">
            <Article blocks={blocks} gallery={gallery} title={post.title} />
          </article>
        </div>

        {relatedPosts.length > 0 && (
          <section className="border-t border-black/15">
            <div className="mx-auto max-w-[1431px] px-5 py-20 sm:px-8 lg:px-12">
              <h2 className="mb-12 inline-flex items-center gap-4 text-2xl font-normal tracking-[-0.02em] md:text-3xl">
                <span className="h-px w-10 bg-black/30" />
                More to read
              </h2>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <RelatedCard key={related.id} post={related} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="rounded-t-[2rem] bg-black pb-4 pt-8 text-white">
          <div className="mx-auto max-w-[1431px] px-5 sm:px-8 lg:px-12">
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
