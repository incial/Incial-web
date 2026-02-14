"use client";

import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { socialLinks } from "@/app/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LinkedIn: FaLinkedinIn,
  "X / Twitter": FaXTwitter,
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  WhatsApp: FaWhatsapp,
};

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {socialLinks.map(({ label, href }) => {
        const Icon = iconMap[label];
        if (!Icon) return null;
        return (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="text-white/80 transition-colors hover:text-white"
          >
            <Icon className="text-lg" />
          </a>
        );
      })}
    </div>
  );
}
