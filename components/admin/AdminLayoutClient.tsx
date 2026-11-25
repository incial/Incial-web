"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Spinner } from "@heroui/react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import LivePreview, { type DockSide } from "@/components/admin/LivePreview";

export type AdminTheme = "light" | "dark";

/** The public page that shows what is being edited on each admin page. */
function previewPathFor(pathname: string): string {
  if (pathname.startsWith("/admin/products")) return "/products";
  if (pathname.startsWith("/admin/about")) return "/about";
  if (pathname.startsWith("/admin/blogs")) return "/blogs";
  if (pathname.startsWith("/admin/casestudies")) return "/case-studies";
  return "/";
}

const KEYS = { open: "admin_preview_open", side: "admin_preview_side", theme: "admin_theme" } as const;

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // the choice just is not remembered
  }
}

/**
 * Handles session-based routing and renders the admin shell for signed-in users: the sidebar, the top
 * bar, the page itself and the live preview docked to one side of it.
 */
export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [previewOpen, setPreviewOpen] = useState(true);
  const [side, setSide] = useState<DockSide>("right");
  const [theme, setTheme] = useState<AdminTheme>("dark");

  // saved choices are read after mounting, so the server and the first client render match
  useEffect(() => {
    try {
      /* eslint-disable react-hooks/set-state-in-effect */
      if (localStorage.getItem(KEYS.open) === "0") setPreviewOpen(false);
      if (localStorage.getItem(KEYS.side) === "left") setSide("left");
      if (localStorage.getItem(KEYS.theme) === "light") setTheme("light");
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // defaults stay
    }
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, pathname, router]);

  const togglePreview = useCallback(() => {
    setPreviewOpen((open) => {
      remember(KEYS.open, open ? "0" : "1");
      return !open;
    });
  }, []);

  const changeSide = useCallback((next: DockSide) => {
    setSide(next);
    remember(KEYS.side, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      remember(KEYS.theme, next);
      return next;
    });
  }, []);

  const themeProps = { "data-theme": theme } as const;
  const rootClass = `admin-panel ${theme} bg-background text-foreground`;

  // the login page stands alone
  if (pathname === "/admin/login") {
    return (
      <div {...themeProps} className={`${rootClass} min-h-screen`}>
        {children}
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div {...themeProps} className={`${rootClass} flex h-screen items-center justify-center`}>
        <Spinner />
      </div>
    );
  }

  const preview = previewOpen ? <LivePreview src={previewPathFor(pathname)} side={side} onSideChange={changeSide} onClose={togglePreview} /> : null;

  return (
    <div {...themeProps} className={`${rootClass} flex h-screen w-full overflow-hidden`}>
      <Toaster position="bottom-right" theme={theme} richColors />
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader previewOpen={previewOpen} onTogglePreview={togglePreview} theme={theme} onToggleTheme={toggleTheme} />
        <div className="flex min-h-0 flex-1">
          {side === "left" && preview}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="@container mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
          {side === "right" && preview}
        </div>
      </div>
    </div>
  );
}
