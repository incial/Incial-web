"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Card, Chip } from "@heroui/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  CircleCheck,
  CircleDashed,
  Package,
  Plus,
  Layers,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { apiGetSection } from "@/lib/adminApi";
import type { AboutData, BlogsData, CaseStudiesData, ClientsData, ProductsData, SectionsConfig } from "@/lib/dataLoader";
import { ProgressBar, ProgressRing } from "@/components/admin/Charts";

interface Data {
  products?: ProductsData;
  clients?: ClientsData;
  cases?: CaseStudiesData;
  blogs?: BlogsData;
  about?: AboutData;
  sections?: SectionsConfig;
}

interface Check {
  label: string;
  hint: string;
  href: string;
  done: number;
  total: number;
}

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function KpiCard({ label, value, caption, icon: Icon, href }: { label: string; value: number | string; caption: string; icon: LucideIcon; href: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full gap-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon size={20} />
          </div>
          <ArrowUpRight size={16} className="text-muted transition-colors group-hover:text-accent" />
        </div>
        <div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
          <div className="mt-0.5 text-xs text-muted">{caption}</div>
        </div>
      </Card>
    </Link>
  );
}

const ACTIONS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/admin/products", label: "Add a product", icon: Package },
  { href: "/admin/clients", label: "Add a client logo", icon: Building2 },
  { href: "/admin/casestudies", label: "Add a case study", icon: Briefcase },
  { href: "/admin/blogs", label: "Write a blog post", icon: BookOpen },
];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<Data>({});
  const [hello, setHello] = useState("Welcome");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHello(greeting());
    // each section loads on its own, so one that is missing does not blank the rest
    const load = <K extends keyof Data>(key: K, section: string) =>
      apiGetSection<NonNullable<Data[K]>>(section)
        .then((value) => setData((current) => ({ ...current, [key]: value })))
        .catch(() => {});
    load("products", "products");
    load("clients", "clients");
    load("cases", "casestudies");
    load("blogs", "blogs");
    load("about", "about");
    load("sections", "sections");
  }, []);

  const checks = useMemo<Check[]>(() => {
    const products = data.products?.products ?? [];
    const clients = data.clients?.clients ?? [];
    const cases = data.cases?.cases ?? [];
    const posts = [...(data.blogs?.popularPosts ?? []), ...(data.blogs?.newestPosts ?? [])];
    const team = data.about?.teamMembers ?? [];
    return [
      { label: "Clients on the world map", hint: "Give each client a city", href: "/admin/clients", done: clients.filter((c) => c.location).length, total: clients.length },
      { label: "Clients with a logo", hint: "Upload the missing logos", href: "/admin/clients", done: clients.filter((c) => c.src).length, total: clients.length },
      { label: "Products with a picture", hint: "Add an image or video", href: "/admin/products", done: products.filter((p) => p.image || p.video).length, total: products.length },
      { label: "Case studies with a cover", hint: "Add a cover or hero image", href: "/admin/casestudies", done: cases.filter((c) => c.coverImage || c.heroImage).length, total: cases.length },
      { label: "Blog posts with an image", hint: "Add a cover image", href: "/admin/blogs", done: posts.filter((p) => p.image).length, total: posts.length },
      { label: "Team members with a photo", hint: "Upload their photos", href: "/admin/about", done: team.filter((m) => m.img).length, total: team.length },
    ];
  }, [data]);

  const doneTotal = checks.reduce((sum, check) => sum + check.done, 0);
  const grandTotal = checks.reduce((sum, check) => sum + check.total, 0);
  const percent = grandTotal > 0 ? (doneTotal / grandTotal) * 100 : 0;

  const sections = data.sections?.sections ?? [];
  const hidden = sections.filter((section) => !section.enabled);
  const products = data.products?.products ?? [];
  const cases = data.cases?.cases ?? [];
  const posts = (data.blogs?.popularPosts.length ?? 0) + (data.blogs?.newestPosts.length ?? 0);
  const name = session?.user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {hello}
            {name ? `, ${name}` : ""}
          </h2>
          <p className="mt-1 text-sm text-muted">Here is how your website content looks today.</p>
        </div>
        <Link href="/admin/settings">
          <Button variant="secondary">
            <Settings2 size={16} />
            Section settings
          </Button>
        </Link>
      </div>

      {/* the numbers */}
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
        <KpiCard label="Products" value={products.length} caption={`${products.filter((p) => p.available !== false).length} live on the website`} icon={Package} href="/admin/products" />
        <KpiCard label="Client logos" value={data.clients?.clients.length ?? 0} caption={`${data.clients?.clients.filter((c) => c.location).length ?? 0} placed on the world map`} icon={Building2} href="/admin/clients" />
        <KpiCard label="Case studies" value={cases.length} caption={`${cases.filter((c) => c.featured).length} featured`} icon={Briefcase} href="/admin/casestudies" />
        <KpiCard label="Blog posts" value={posts} caption={`${data.blogs?.popularPosts.length ?? 0} popular · ${data.blogs?.newestPosts.length ?? 0} newest`} icon={BookOpen} href="/admin/blogs" />
      </div>

      <div className="grid items-start gap-6 @5xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* content health */}
        <Card className="gap-6">
          <Card.Header>
            <Card.Title>Content health</Card.Title>
            <Card.Description>How complete the content on your website is. Pick an item to fix it.</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-8 @2xl:flex-row @2xl:items-center">
            <div className="flex flex-col items-center gap-3">
              <ProgressRing percent={percent} size={148} label="complete" />
              <span className="text-xs text-muted">
                {doneTotal} of {grandTotal} items done
              </span>
            </div>
            <div className="flex w-full flex-col gap-5">
              {checks.map((check) => {
                const complete = check.total > 0 && check.done === check.total;
                return (
                  <Link key={check.label} href={check.href} className="group block">
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                        {complete ? <CircleCheck size={15} className="shrink-0 text-success" /> : <CircleDashed size={15} className="shrink-0 text-muted" />}
                        <span className="truncate">{check.label}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {check.done} / {check.total}
                      </span>
                    </div>
                    <ProgressBar value={check.done} max={check.total} tone={complete ? "success" : "accent"} />
                    {!complete && check.total > 0 && <p className="mt-1 text-xs text-muted transition-colors group-hover:text-accent">{check.hint} →</p>}
                  </Link>
                );
              })}
            </div>
          </Card.Content>
        </Card>

        {/* quick actions */}
        <Card className="gap-2">
          <Card.Header>
            <Card.Title>Quick actions</Card.Title>
            <Card.Description>Jump straight into adding something new.</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-1">
            {ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-default">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Plus size={16} />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                <Icon size={16} className="text-muted" />
                <ArrowRight size={14} className="text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </Card.Content>
        </Card>
      </div>

      {/* what is on and off */}
      <Card className="gap-4">
        <Card.Header className="flex-row items-start justify-between gap-3">
          <div>
            <Card.Title>Website sections</Card.Title>
            <Card.Description>
              {sections.length - hidden.length} live{hidden.length > 0 ? `, ${hidden.length} hidden` : ""}. Change this in section settings.
            </Card.Description>
          </div>
          <Link href="/admin/settings">
            <Button size="sm" variant="secondary">
              Manage
            </Button>
          </Link>
        </Card.Header>
        <Card.Content>
          {sections.length === 0 ? (
            <p className="text-sm text-muted">Loading sections…</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 @xl:grid-cols-2 @5xl:grid-cols-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between gap-3 rounded-xl border border-separator px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Layers size={15} className="shrink-0 text-muted" />
                    <span className="truncate text-sm text-foreground">{section.label}</span>
                  </div>
                  <Chip size="sm" variant="soft" color={section.enabled ? "success" : "default"}>
                    {section.enabled ? "Live" : "Hidden"}
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted">
        <Users size={13} />
        Changes appear on the website as soon as you save. The live preview reloads by itself.
      </p>
    </div>
  );
}
