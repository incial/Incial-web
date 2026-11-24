import type { ElementType } from "react";

interface AccentHeadingProps {
  text: string;
  /** How many words at the end are set in the bold blue accent (default 2). */
  accentWords?: number;
  as?: ElementType;
  className?: string;
}

/**
 * A light italic heading whose last words are bold and blue, the same treatment as
 * "Why Trust Incial?", so section headings read as one family.
 */
export default function AccentHeading({
  text,
  accentWords = 2,
  as: Tag = "h2",
  className = "",
}: AccentHeadingProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const split = Math.max(0, words.length - accentWords);
  const lead = words.slice(0, split).join(" ");
  const accent = words.slice(split).join(" ");

  return (
    <Tag className={`font-light italic leading-tight ${className}`}>
      {lead && <span>{lead} </span>}
      <span className="font-bold not-italic text-[#56A6FF]">{accent}</span>
    </Tag>
  );
}
