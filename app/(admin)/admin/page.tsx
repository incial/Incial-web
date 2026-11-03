"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  BarChart3,
  BookOpen,
  Briefcase,
  Package,
  Settings2,
  ArrowRight,
} from "lucide-react";
import { apiGetSection } from "@/lib/adminApi";
import type { BlogsData, ClientsData, TrustData } from "@/lib/dataLoader";

const sections = [
  {
    href: "/admin/about",
    label: "About Section",
    icon: Users,
    desc: "Team members, story, purpose & awards",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
  {
    href: "/admin/clients",
    label: "Clients",
    icon: Building2,
    desc: "Client logos & testimonials",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
  {
    href: "/admin/trust",
    label: "Training Stats",
    icon: BarChart3,
    desc: "Happy clients, projects, ratings",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
  {
    href: "/admin/blogs",
    label: "Blog Posts",
    icon: BookOpen,
    desc: "Popular and newest articles",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
  {
    href: "/admin/casestudies",
    label: "Case Studies",
    icon: Briefcase,
    desc: "Client success stories & project showcases",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    desc: "Manage product offerings and details",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
  {
    href: "/admin/settings",
    label: "Section Settings",
    icon: Settings2,
    desc: "Enable or disable main site sections",
    color: "",
    border: "border-[#1e1e1e]",
    iconColor: "text-white",
    iconBg: "bg-[#1a1a1a]",
  },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ blogs: 0, clients: 0, stats: 0 });

  useEffect(() => {
    Promise.all([
      apiGetSection<BlogsData>("blogs"),
      apiGetSection<ClientsData>("clients"),
      apiGetSection<TrustData>("trust"),
    ])
      .then(([blogs, clients, trust]) => {
        setCounts({
          blogs: blogs.popularPosts.length + blogs.newestPosts.length,
          clients: clients.clients.length,
          stats: trust.stats.length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl font-[Inter,sans-serif]">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1 font-[Poppins,sans-serif]">
          Welcome back 👋
        </h2>
        <p className="text-[#8e8e8e] text-sm">
          Manage your website content from here. Changes are reflected
          immediately.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Blog Posts",
            value: counts.blogs,
          },
          {
            label: "Client Logos",
            value: counts.clients,
          },
          {
            label: "Trust Stats",
            value: counts.stats,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-transparent border border-[#1e1e1e] rounded-2xl p-4"
          >
            <p className="text-[#8e8e8e] text-xs mb-2 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-white font-[Poppins,sans-serif]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(
          ({
            href,
            label,
            icon: Icon,
            desc,
            border,
            iconColor,
            iconBg,
          }) => (
            <Link
              key={href}
              href={href}
              className={`group relative bg-transparent border ${border} rounded-2xl p-5 flex items-start gap-4 hover:bg-[#0a0a0a] transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div
                className={`${iconBg} border border-[#1e1e1e] rounded-full p-2.5 shrink-0`}
              >
                <Icon size={18} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm mb-1 font-[Poppins,sans-serif]">
                  {label}
                </div>
                <div className="text-[#8e8e8e] text-xs leading-relaxed">
                  {desc}
                </div>
              </div>
              <ArrowRight
                size={15}
                className="text-[#8e8e8e] group-hover:text-white transition-colors shrink-0 mt-0.5"
              />
            </Link>
          ),
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 bg-[#0a0a0d] border border-[#1e1e1e] rounded-2xl p-5 flex gap-4">
        <div className="w-1 bg-white rounded-full shrink-0" />
        <div>
          <p className="text-white text-xs font-semibold mb-1 uppercase tracking-wider">
            How it works
          </p>
          <p className="text-[#8e8e8e] text-sm leading-relaxed">
            Edit any section using the sidebar. Click{" "}
            <strong className="text-white font-medium">Save Changes</strong> in
            each editor to publish instantly. The public website reads data
            directly from your saved content.
          </p>
        </div>
      </div>
    </div>
  );
}
