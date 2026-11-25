"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  BookOpen,
  Briefcase,
  Package,
  Settings2,
  Images,
  LogOut,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const groups: Array<{ title: string; items: NavItem[] }> = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Website",
    items: [
      { href: "/admin/about", label: "About", icon: Users },
      { href: "/admin/clients", label: "Clients", icon: Building2 },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/trust", label: "Training stats", icon: BarChart3 },
    ],
  },
  {
    title: "Publishing",
    items: [
      { href: "/admin/blogs", label: "Blog posts", icon: BookOpen },
      { href: "/admin/casestudies", label: "Case studies", icon: Briefcase },
    ],
  },
  { title: "Library", items: [{ href: "/admin/media", label: "Media library", icon: Images }] },
  { title: "System", items: [{ href: "/admin/settings", label: "Section settings", icon: Settings2 }] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "A").charAt(0).toUpperCase();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-separator bg-surface">
      <div className="flex h-16 items-center gap-3 border-b border-separator px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
          <span className="text-base font-black">I</span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide text-foreground">Incial</div>
          <div className="text-[11px] text-muted">Content admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">{group.title}</div>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-default hover:text-foreground"
                    }`}
                  >
                    {active && <span aria-hidden className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />}
                    <Icon size={18} className="shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-separator p-3">
        <Dropdown>
          <Button variant="ghost" className="h-auto w-full justify-start gap-3 px-2 py-2" aria-label="Account menu">
            <Avatar size="sm">
              {user?.image && <Avatar.Image alt={user.name ?? "Admin"} src={user.image} />}
              <Avatar.Fallback>{initial}</Avatar.Fallback>
            </Avatar>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-foreground">{user?.name ?? "Admin"}</span>
              <span className="block truncate text-xs text-muted">{user?.email}</span>
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-muted" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              onAction={(key) => {
                if (key === "signout") signOut({ callbackUrl: "/admin/login" });
                if (key === "site") window.open("/", "_blank", "noopener,noreferrer");
              }}
            >
              <Dropdown.Item id="site" textValue="View website">
                <Label>View website</Label>
              </Dropdown.Item>
              <Dropdown.Item id="signout" textValue="Sign out" variant="danger">
                <LogOut size={14} />
                <Label>Sign out</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </aside>
  );
}
