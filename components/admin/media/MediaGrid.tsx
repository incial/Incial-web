"use client";

import Image from "next/image";
import { Check, Film } from "lucide-react";
import { formatSize, isVideo, type MediaFile } from "./useMediaLibrary";

interface MediaGridProps {
  files: MediaFile[];
  selectedKey?: string | null;
  onSelect: (file: MediaFile) => void;
  /** Smaller tiles, for the picker inside an upload field. */
  compact?: boolean;
}

/** A checkerboard behind pictures, so transparent logos stay visible. */
const CHECKER =
  "bg-[conic-gradient(var(--surface-secondary)_25%,var(--surface)_0_50%,var(--surface-secondary)_0_75%,var(--surface)_0)] bg-[length:16px_16px]";

/** Thumbnails of stored files; each shows whether a page uses it. */
export default function MediaGrid({ files, selectedKey, onSelect, compact = false }: MediaGridProps) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]"}`}>
      {files.map((file) => {
        const selected = file.key === selectedKey;
        const used = file.usedIn.length > 0;
        return (
          <button
            key={file.key}
            type="button"
            onClick={() => onSelect(file)}
            title={file.name}
            className={`group flex flex-col overflow-hidden rounded-2xl border bg-surface text-left transition-all focus-visible:outline-2 focus-visible:outline-accent ${
              selected ? "border-accent ring-2 ring-accent/40" : "border-separator hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md"
            }`}
          >
            <span className={`relative block aspect-[4/3] w-full overflow-hidden ${CHECKER}`}>
              {isVideo(file) ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
                  <Film size={compact ? 22 : 28} />
                </span>
              ) : (
                <Image src={file.url} alt={file.name} fill sizes="220px" className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]" />
              )}
              {selected && (
                <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow">
                  <Check size={14} />
                </span>
              )}
            </span>
            <span className="flex flex-col gap-1 border-t border-separator px-3 py-2">
              <span className="truncate text-xs font-medium text-foreground">{file.name}</span>
              <span className="flex items-center justify-between gap-2 text-[11px] text-muted">
                <span>{formatSize(file.size)}</span>
                <span className={`inline-flex items-center gap-1 ${used ? "text-success" : "text-muted"}`}>
                  <span className={`size-1.5 rounded-full ${used ? "bg-success" : "bg-muted"}`} />
                  {used ? "In use" : "Unused"}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
