import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Together",
  description:
    "Incial's learning programs and training initiatives — learn, build and grow together with our team.",
  alternates: { canonical: "/learn-together" },
  openGraph: { title: "Learn Together", url: "/learn-together" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
