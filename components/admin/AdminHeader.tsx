"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Tooltip } from "@heroui/react";
import { ExternalLink, Moon, PanelRight, Sun } from "lucide-react";
import type { AdminTheme } from "@/components/admin/AdminLayoutClient";

export const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/about": "About",
  "/admin/clients": "Clients",
  "/admin/trust": "Training stats",
  "/admin/blogs": "Blog posts",
  "/admin/casestudies": "Case studies",
  "/admin/products": "Products",
  "/admin/settings": "Section settings",
};

interface AdminHeaderProps {
  previewOpen: boolean;
  onTogglePreview: () => void;
  theme: AdminTheme;
  onToggleTheme: () => void;
}

export default function AdminHeader({ previewOpen, onTogglePreview, theme, onToggleTheme }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-separator bg-surface px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link href="/admin" className="text-muted transition-colors hover:text-foreground">
          Admin
        </Link>
        <span className="text-muted">/</span>
        <h1 className="font-semibold text-foreground">{title}</h1>
      </nav>

      <div className="flex items-center gap-2">
        <Tooltip delay={300}>
          <Button isIconOnly variant="ghost" aria-label={theme === "dark" ? "Switch to the light look" : "Switch to the dark look"} onPress={onToggleTheme}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
          <Tooltip.Content>{theme === "dark" ? "Light look" : "Dark look"}</Tooltip.Content>
        </Tooltip>
        <Button variant={previewOpen ? "secondary" : "ghost"} onPress={onTogglePreview} aria-pressed={previewOpen}>
          <PanelRight size={16} />
          Preview
        </Button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          View site
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
