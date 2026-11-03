import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Incial. Explore open roles and grow your career with a creative digital agency building brands and products.",
  alternates: { canonical: "/careers" },
  openGraph: { title: "Careers", url: "/careers" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
