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

interface SocialLinksProps {
  className?: string;
}

export default function SocialLinks({
  className = "text-white/80 hover:text-white",
}: SocialLinksProps) {
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
            className={`transition-colors ${className}`}
          >
            <Icon className="text-lg" />
          </a>
        );
      })}
    </div>
  );
}
