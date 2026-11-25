"use client";

import type { ReactNode } from "react";

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

/** A vertical list of the things being edited (products, posts and so on); the picked one is highlighted. */
export default function ItemList({ items, selected, onSelect }: { items: ListItem[]; selected: number; onSelect: (index: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(index)}
          className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left transition-colors ${
            selected === index ? "border-accent bg-accent/10" : "border-separator bg-surface hover:bg-surface-secondary"
          }`}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
            {item.subtitle && <span className="block truncate text-xs text-muted">{item.subtitle}</span>}
          </span>
          {item.badge && <span className="flex shrink-0 items-center gap-1.5">{item.badge}</span>}
        </button>
      ))}
    </div>
  );
}
