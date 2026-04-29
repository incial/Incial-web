'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { navLinks } from '@/lib/constants';
import type { SectionConfig } from '@/lib/dataLoader';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [enabledSections, setEnabledSections] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/sections')
      .then((res) => res.json())
      .then((data: { sections: SectionConfig[] }) => {
        const enabled = data.sections.filter((s) => s.enabled).map((s) => s.id);
        setEnabledSections(enabled);
      })
      .catch(() => {
        setEnabledSections([]);
      });
  }, []);

  const visibleLinks = navLinks.filter((link) => {
    if (!enabledSections || !link.sectionId) return true;
    return enabledSections.includes(link.sectionId);
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-60 overflow-hidden bg-white"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-black text-2xl font-light hover:text-black/60 transition-colors"
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
          <nav className="w-full max-w-[360px] rounded-[32px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.05)]">
            {visibleLinks.map((link, i) => (
              <div key={link.label} className="w-full">
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block w-full py-6 text-center text-base font-medium text-black transition-colors hover:text-black/60"
                >
                  {link.label}
                </Link>
                {i < visibleLinks.length - 1 && (
                  <div className="mx-8 h-px bg-black/10" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
};