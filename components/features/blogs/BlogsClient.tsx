"use client";

import MenuFrame from "@/components/layout/MenuFrame";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShaderHero from "@/components/ui/ShaderHero";
import StretchHeading from "@/components/features/products/StretchHeading";
import BlogRow, { MobilePost } from "@/components/features/blogs/BlogRow";
import type { BlogPost } from "@/lib/dataLoader";
import { useDevice } from "@/hooks";
import { useSectionsConfig } from "@/lib/useSectionsConfig";
import { MobileLayout } from "@/components/mobile";

interface BlogsClientProps {
  heroBanner?: string;
  popularPosts: BlogPost[];
  newestPosts: BlogPost[];
}

export default function BlogsClient({
  heroBanner,
  popularPosts,
  newestPosts,
}: BlogsClientProps) {
  const { isMobile, isLoading: isDeviceLoading } = useDevice();
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionsConfig = useSectionsConfig();
  const isDisabled = sectionsConfig["blogs"] === false;

  if (isDeviceLoading) {
    return <div className="min-h-screen w-full bg-black" />;
  }

  // ── Disabled state ────────────────────────────────────────────────────────
  const disabledContent = (
    <div className="flex min-h-[70vh] items-center justify-center bg-black text-white px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Section Disabled</h1>
        <p className="text-gray-400">This page is currently unavailable.</p>
      </div>
    </div>
  );

  // ── Desktop page body ─────────────────────────────────────────
  // a post shows once: if the same one is in both lists, it stays in Popular only
  const popularKeys = new Set(popularPosts.flatMap((post) => [`id:${post.id}`, `slug:${post.slug}`, `title:${post.title.trim().toLowerCase()}`]));
  const newestOnly = newestPosts.filter(
    (post) => !popularKeys.has(`id:${post.id}`) && !popularKeys.has(`slug:${post.slug}`) && !popularKeys.has(`title:${post.title.trim().toLowerCase()}`),
  );
  const groups = [
    { id: "blog-popular", label: "Popular", posts: popularPosts },
    { id: "blog-newest", label: "Newest", posts: newestOnly },
  ].filter((group) => sectionsConfig[group.id] !== false && group.posts.length > 0);

  const pageBody = (
    <>
      <ShaderHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
        title={<StretchHeading emphasis="Blogs" baseWeight={700} emphasisGrow={1.15} />}
        titleClassName="text-5xl italic md:text-8xl"
        tagline="Sharp ideas, practical playbooks, and stories from the teams building standout digital experiences."
        image={heroBanner}
        imageOpacity={0.1}
        scrollTargetId="blog-list"
      />

      <main id="blog-list" className="mx-auto max-w-[1431px] scroll-mt-4 px-5 pb-28 pt-24 sm:px-8 lg:px-12">
        {groups.map((group, groupIndex) => (
          <section key={group.id} className={groupIndex > 0 ? "mt-28" : ""}>
            <motion.h2
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 inline-flex items-center gap-4 text-2xl font-normal tracking-[-0.02em] text-[#151716] md:text-3xl"
            >
              <span className="h-px w-10 bg-black/30" />
              {group.label}
            </motion.h2>
            {/* the lines run the full width of the page, like the grid on the case studies */}
            <div className="-mx-5 sm:-mx-8 lg:-mx-12">
              {group.posts.map((post, i) => (
                <BlogRow key={post.id} post={post} priority={groupIndex === 0 && i === 0} last={i === group.posts.length - 1} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <div className="rounded-t-[2rem] bg-black pb-4 pt-8 text-white">
        <div className="mx-auto max-w-[1431px] px-5 sm:px-8 lg:px-12">
          <Footer />
        </div>
      </div>
    </>
  );

  // ── Mobile page body ───
  const mobilePageBody = (
    <div className="relative min-h-screen bg-[#f7f9f8] text-[#151716]">
      <ShaderHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
        title={<StretchHeading emphasis="Blogs" baseWeight={700} emphasisGrow={1.1} />}
        titleClassName="text-5xl italic"
        tagline="Sharp ideas, practical playbooks, and stories from the teams building standout digital experiences."
        image={heroBanner}
        imageOpacity={0.1}
        scrollTargetId="blog-list-mobile"
      />

      <main id="blog-list-mobile" className="px-5 pb-16 pt-14">
        {groups.map((group, groupIndex) => (
          <section key={group.id} className={groupIndex > 0 ? "mt-16" : ""}>
            <h2 className="mb-8 inline-flex items-center gap-3 text-2xl font-normal tracking-[-0.02em]">
              <span className="h-px w-8 bg-black/30" />
              {group.label}
            </h2>
            <div className="flex flex-col gap-12">
              {group.posts.map((post, i) => (
                <MobilePost key={post.id} post={post} priority={groupIndex === 0 && i === 0} last={i === group.posts.length - 1} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <div className="rounded-t-[2rem] bg-black px-5 pb-4 pt-8 text-white">
        <Footer />
      </div>
    </div>
  );

  // ── Disabled routing ──────────────────────────────────────────────────────
  if (isDisabled) {
    if (isMobile) {
      return <MobileLayout>{disabledContent}</MobileLayout>;
    }
    return (
      <div className="relative min-h-screen bg-white">
        <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} />
        {disabledContent}
      </div>
    );
  }

  // ── Mobile render ─────────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileLayout>{mobilePageBody}</MobileLayout>;
  }

  // ── Desktop render ────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-white">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} blend />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-x-clip bg-[#f7f9f8] text-[#151716] min-h-screen"
        style={{ zIndex: 30 }}
      >
        {pageBody}
      </motion.div>
    </div>
  );
}
