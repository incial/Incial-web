import type { Metadata } from "next";
import {
  Poppins,
  Noto_Sans,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_Malayalam,
  Noto_Sans_Devanagari,
  Noto_Sans_Arabic,
} from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "600", "800"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "600", "800"],
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  variable: "--font-noto-sans-malayalam",
  subsets: ["malayalam"],
  weight: ["400", "500", "700", "600", "800"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "700", "600", "800"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "600", "800"],
});

export const metadata: Metadata = {
  title: "Incial — We Build Brands",
  description:
    "Incial is a creative digital agency building brands, experiences, and products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${notoSans.variable} ${notoSansJP.variable} ${notoSansKR.variable} ${notoSansMalayalam.variable} ${notoSansDevanagari.variable} ${notoSansArabic.variable} font-[family:var(--font-poppins)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
