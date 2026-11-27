"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchCachedJson } from "@/lib/publicCache";
import { normalizeImageUrl } from "@/lib/imageUtils";
import type { LearnTogetherData } from "@/lib/dataLoader";

const EMPTY_COMMUNITY = { title: "", text: "", buttonLabel: "", url: "" };

/** Image addresses tidied the same way as the rest of the site's CMS pictures. */
function tidy(data: LearnTogetherData): LearnTogetherData {
  return {
    stats: (data.stats ?? []).filter((stat) => stat.value && stat.label),
    gallery: (data.gallery ?? []).map((photo) => ({ ...photo, img: normalizeImageUrl(photo.img) })).filter((photo) => photo.img),
    events: (data.events ?? []).map((event) => ({ ...event, img: normalizeImageUrl(event.img) })).filter((event) => event.title),
    testimonials: (data.testimonials ?? []).map((item) => ({ ...item, img: normalizeImageUrl(item.img) })).filter((item) => item.quote && item.name),
    community: { ...EMPTY_COMMUNITY, ...data.community },
    testimonialLayout: data.testimonialLayout === "marquee" || data.testimonialLayout === "spotlight" ? data.testimonialLayout : "chat",
  };
}

/**
 * The admin-edited LearnTogether content (gallery, events, testimonials, numbers, community link),
 * or null until it has loaded (or when there is none). Once it arrives and its sections are on the
 * page, every ScrollTrigger below them is re-measured.
 */
export function useLearnTogetherContent(): LearnTogetherData | null {
  const [content, setContent] = useState<LearnTogetherData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCachedJson<LearnTogetherData>("/api/admin/learntogether")
      .then((data) => {
        if (!cancelled && data) setContent(tidy(data));
      })
      .catch((error: unknown) => {
        console.error("LearnTogether content could not be loaded", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!content) return;
    // the new sections (one of them pinned) sit above triggers made earlier, so order them by
    // position on the page before measuring again
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [content]);

  return content;
}
