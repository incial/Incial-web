import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Products built by Incial — software and tools crafted to help businesses work smarter.",
  alternates: { canonical: "/products" },
  openGraph: { title: "Products", url: "/products" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
