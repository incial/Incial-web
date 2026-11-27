"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { AboutData, TeamMember } from "@/lib/dataLoader";
import { normalizeImageUrl } from "@/lib/imageUtils";

export interface VoiceItem {
  quote: string;
  author: string;
  /** Shown when the person has no photo yet. */
  initials: string;
  /** Used when the person is not in the About team (or has no role there). */
  role: string;
  company: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * The About page's team (photos and roles), edited in the admin. Read straight from the source
 * every time (not the shared browser cache), so a photo added in the admin shows up at once,
 * exactly as on the About page.
 */
export function useTeamMembers(): TeamMember[] {
  const [team, setTeam] = useState<TeamMember[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/about?fresh=1", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<AboutData>) : null))
      .then((about) => {
        if (about?.teamMembers) setTeam(about.teamMembers);
      })
      .catch(() => {
        // no team data: the quotes keep their initials and written-in roles
      });
    return () => controller.abort();
  }, []);
  return team;
}

const QUOTE: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.035 } },
};
const WORD: Variants = {
  hidden: { opacity: 0, y: "0.45em" },
  shown: { opacity: 1, y: "0em", transition: { duration: 0.55, ease: EASE } },
};

/**
 * A quote from the team, with the person's photo and role from the About team in the admin
 * (matched by name), and their initials when there is no photo. The words rise in when it
 * scrolls into view.
 */
export default function VoiceCard({
  item,
  team,
  index,
  className = "",
}: {
  item: VoiceItem;
  team: TeamMember[];
  index: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [photoFailed, setPhotoFailed] = useState(false);
  const member = team.find((person) => sameName(person.name, item.author));
  const photo = normalizeImageUrl(member?.img);
  const showPhoto = Boolean(photo) && !photoFailed;
  const role = member?.role?.trim() || item.role;
  const words = item.quote.split(/\s+/).filter(Boolean);

  return (
    <motion.figure
      variants={{ hidden: {}, shown: { transition: { delayChildren: index * 0.12 } } }}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
      className={`flex flex-col justify-between gap-8 py-10 md:py-12 ${className}`}
    >
      <motion.blockquote
        variants={reduced ? undefined : QUOTE}
        className="text-lg font-normal leading-relaxed tracking-[-0.015em] text-[#151716]/85 md:text-xl"
      >
        <span className="sr-only">{item.quote}</span>
        <span aria-hidden>
          &ldquo;
          {words.map((word, i) => (
            <motion.span key={`${word}-${i}`} variants={reduced ? undefined : WORD} className="inline-block whitespace-pre">
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
          &rdquo;
        </span>
      </motion.blockquote>

      <figcaption className="flex items-center gap-3.5">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#151716]">
          {showPhoto ? (
            <Image
              src={photo}
              alt={item.author}
              fill
              sizes="48px"
              style={{ objectPosition: member?.objectPos || "center top" }}
              className="object-cover"
              onError={() => setPhotoFailed(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wider text-white"
            >
              {item.initials}
            </span>
          )}
        </span>
        <div>
          <p className="text-sm font-medium text-[#151716]">{item.author}</p>
          <p className="text-xs font-medium tracking-[0.04em] text-black/50">
            {role} · {item.company}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
}
