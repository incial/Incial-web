import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Incial",
  description:
    "Meet the team behind Incial, our story, purpose, awards and the impact we create for brands and businesses.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Incial", url: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
