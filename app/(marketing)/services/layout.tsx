import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Branding, technology and digital experience services from Incial — everything a modern brand needs to grow.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Services", url: "/services" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
