"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FlowSectionProps {
  index: number;
  /** Space reserved for the section before its content is mounted (CSS length). */
  minHeight: string;
  onElement: (index: number, element: HTMLElement | null) => void;
  children: ReactNode;
}

/**
 * One step of the continuous Learn Together flow.
 *
 * - The content mounts as it nears the screen and unmounts once it has left, so each slide's
 *   own entrance animation plays when you arrive (and again if you come back).
 * - GSAP ScrollTrigger scrubs a gentle rise-in on the way in and a dim-out on the way out, so
 *   neighbouring sections blend instead of cutting.
 */
export default function FlowSection({ index, minHeight, onElement, children }: FlowSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(index === 0);
  const [lockedHeight, setLockedHeight] = useState(0);

  useEffect(() => {
    onElement(index, sectionRef.current);
    return () => onElement(index, null);
  }, [index, onElement]);

  // mount when the section is well inside the screen, unmount once it is fully out
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const enter = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "-12% 0px -12% 0px" },
    );
    const leave = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setMounted(false);
    });
    enter.observe(element);
    leave.observe(element);
    return () => {
      enter.disconnect();
      leave.disconnect();
    };
  }, []);

  // remember the tallest the content has been, so the page never jumps when it unmounts
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (mounted && inner) setLockedHeight((prev) => Math.max(prev, inner.offsetHeight));
  }, [mounted]);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      if (index > 0) {
        gsap.fromTo(
          inner,
          { opacity: 0.12, y: 70, scale: 0.965 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 95%", end: "top 40%", scrub: 0.7 },
          },
        );
      }
      gsap.fromTo(
        inner,
        { opacity: 1, scale: 1 },
        {
          opacity: 0.2,
          scale: 0.965,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: section, start: "bottom 60%", end: "bottom 5%", scrub: 0.7 },
        },
      );
    }, section);

    return () => context.revert();
  }, [index]);

  return (
    <section
      ref={sectionRef}
      data-flow-section={index}
      className="relative w-full"
      style={{ minHeight: lockedHeight > 0 ? `${lockedHeight}px` : minHeight }}
    >
      <div ref={innerRef} style={{ transformOrigin: "center top", willChange: "transform, opacity" }}>
        {mounted ? children : null}
      </div>
    </section>
  );
}
