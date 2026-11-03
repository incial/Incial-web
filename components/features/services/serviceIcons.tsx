import type { ReactNode } from "react";

/**
 * Line icons for each service, drawn in a 24x24 box. The parent sets stroke, strokeWidth,
 * fill="none" and the transform, so one set serves every size and tint.
 */
const ICONS: Record<string, ReactNode> = {
  "Digital Media Management": (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6" />
    </>
  ),
  SEO: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5" />
      <path d="M8 12.5l2-2.2 1.6 1.4 2-2.6" />
    </>
  ),
  "Digital Ads": (
    <>
      <path d="M4 10v4h3l7 4V6L7 10H4z" />
      <path d="M17.5 9.5a4 4 0 0 1 0 5" />
      <path d="M7 14l1 5h2.5l-1-3.5" />
    </>
  ),
  "Digital Marketing": (
    <>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M15 7h5v5" />
    </>
  ),
  "Website Design (UI/UX)": (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18M10 9.5V19" />
    </>
  ),
  "VFX & CGI": (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16v4M17 18h4" />
    </>
  ),
  Product: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
  "Creative Design": (
    <>
      <path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z" />
      <path d="M14 6.5l3.5 3.5" />
    </>
  ),
  "Social Media Management": (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M12 13c-2.8-1.8-3.5-3-3.5-4.2a1.7 1.7 0 0 1 3.5-.6 1.7 1.7 0 0 1 3.5.6C15.5 10 14.8 11.2 12 13z" />
    </>
  ),
  "Public Relations": (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>
  ),
};

const FALLBACK: ReactNode = <circle cx="12" cy="12" r="4" />;

export function getServiceIcon(name: string): ReactNode {
  return ICONS[name] ?? FALLBACK;
}
