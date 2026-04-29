"use client";

import { useState } from "react";
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

function RelatedCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/blogs/${post.slug}`} className="group block">
        <div className="bg-white rounded-[20px] p-[8px] flex flex-col gap-[8px] shadow-sm group-hover:shadow-md transition-shadow duration-300">
          <div className="relative rounded-[14px] overflow-hidden aspect-video w-full">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover grayscale brightness-60 group-hover:brightness-70 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h4 className="text-[13px] font-semibold leading-snug text-white line-clamp-2">
                {post.title}
              </h4>
            </div>
          </div>
          <div className="flex items-center justify-between px-1.5 pb-1 text-[11px] text-gray-400 italic">
            <span>{post.author}</span>
            <span>{post.mins} min read</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPostClient({
  post,
  relatedPosts,
}: BlogPostClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const paragraphs = post.content
    ? post.content.split("\n\n").filter(Boolean)
    : [
        "This post is currently being written. Check back soon for the full article.",
      ];

  return (
    <div className="relative min-h-screen bg-white">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
          scale: menuOpen ? 0.95 : 1,
          borderTopLeftRadius: menuOpen ? 24 : 0,
          borderTopRightRadius: menuOpen ? 24 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-hidden bg-black text-white min-h-screen"
        style={{ zIndex: 30 }}
      >
        {/* ── Hero Image ── */}
        <div className="relative w-full h-[55vh] min-h-[340px] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black" />

          {/* Meta overlay — mobile: px-5, desktop: px-[90px] */}
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-[90px] pb-8 md:pb-10 max-w-[1431px] mx-auto">
            <div className="mb-3 pt-6 hidden md:flex">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blogs", href: "/blogs" },
                  { label: post.title },
                ]}
                variant="pill"
                size="lg"
              />
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="inline-block uppercase text-[10px] tracking-widest font-semibold text-white/40 mb-3"
            >
              {post.category === "popular" ? "Popular" : "Newest"}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl md:text-5xl lg:text-6xl font-bold leading-[1.15] max-w-4xl"
            >
              {post.title}
            </motion.h1>

            {/* Meta row — wraps gracefully on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-sm text-white/50"
            >
              <span className="font-medium text-white/80">
                By {post.author}
              </span>
              <span className="w-px h-4 bg-white/20 hidden sm:block" />
              <span>{post.date}</span>
              <span className="w-px h-4 bg-white/20 hidden sm:block" />
              <span>{post.mins} min read</span>
            </motion.div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <main className="px-5 md:px-[90px] max-w-[1431px] mx-auto py-10 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Article body */}
            <article className="flex-1 min-w-0">
              <div className="max-w-[760px]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="origin-left h-px bg-white/10 mb-8 md:mb-10"
                />

                <div className="space-y-6">
                  {paragraphs.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: i * 0.04 }}
                      className="text-[15px] md:text-[17px] leading-relaxed text-white/70 font-light"
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>

                {/* Back link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-12 md:mt-14 pt-10 border-t border-white/10"
                >
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors group"
                  >
                    <span className="transform group-hover:-translate-x-1 transition-transform duration-200">
                      ←
                    </span>
                    Back to all blogs
                  </Link>
                </motion.div>
              </div>
            </article>

            {/* Sidebar — Related Posts (stacks below on mobile, side on lg+) */}
            {relatedPosts.length > 0 && (
              <aside className="w-full lg:w-[320px] shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6">
                    Related Posts
                  </h3>
                  {/* Mobile: horizontal scroll row; desktop: vertical stack */}
                  <div className="flex flex-row gap-4 overflow-x-auto pb-2 lg:flex-col lg:space-y-5 lg:overflow-visible lg:pb-0">
                    {relatedPosts.map((rp, i) => (
                      <div key={rp.id} className="min-w-[220px] lg:min-w-0">
                        <RelatedCard post={rp} index={i} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </aside>
            )}
          </div>
        </main>

        <div className="px-5 md:px-[90px] max-w-[1431px] mx-auto">
          <Footer />
        </div>
      </motion.div>
    </div>
  );
}