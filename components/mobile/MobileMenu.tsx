'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks, socialLinks } from '@/lib/constants';
import type { SectionConfig } from '@/lib/dataLoader';
import { fetchCachedJson } from '@/lib/publicCache';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Panel colour and ink: a white panel with black type. */
const MENU_BG = '#ffffff';
const MENU_INK = '#000000';
/** Links that are not the active one sit quietly in a pale grey. */
const MENU_DIM = 'rgba(0, 0, 0, 0.17)';

const WIPE_EASE = [0.76, 0, 0.24, 1] as const;
const RISE_EASE = [0.22, 1, 0.36, 1] as const;

const FOOTER_LINKS = ['LinkedIn', 'Instagram'] as const;

const listVariants: Variants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.4 } },
  closed: {},
};

// each line rises out from under its own baseline
const lineVariants: Variants = {
  closed: { y: '108%' },
  open: { y: '0%', transition: { duration: 0.8, ease: RISE_EASE } },
};

const fadeVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.6, delay: 0.8 } },
};

/** The link for `pathname`; the home link only matches the home page. */
function indexOfCurrentPage(links: ReadonlyArray<{ href: string }>, pathname: string): number {
  const found = links.findIndex((link) => {
    const path = link.href.split('#')[0] || '/';
    return path === '/' ? pathname === '/' && !link.href.includes('#') : pathname.startsWith(path);
  });
  return Math.max(found, 0);
}

/**
 * Full-screen phone menu: a panel wipes up over the page, the page links rise into place as
 * large type, and the link under your finger (or the current page) is solid while the rest sit
 * dimmed. Closing wipes the panel back down.
 */
export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const pathname = usePathname();
  const [enabledSections, setEnabledSections] = useState<string[] | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetchCachedJson<{ sections: SectionConfig[] }>('/api/admin/sections')
      .then((data) => {
        const enabled = data?.sections
          ? data.sections.filter((s) => s.enabled).map((s) => s.id)
          : [];

        setEnabledSections(enabled);
      })
      .catch(() => {
        setEnabledSections([]);
      });
  }, [isOpen]);

  // Escape closes, and the page behind does not scroll while the menu is up
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const visibleLinks = useMemo(() => {
    return navLinks.filter((link) => {
      if (!enabledSections || !link.sectionId) return true;
      return enabledSections.includes(link.sectionId);
    });
  }, [enabledSections]);

  const currentIndex = useMemo(
    () => indexOfCurrentPage(visibleLinks, pathname),
    [visibleLinks, pathname],
  );
  const activeIndex = hovered ?? currentIndex;

  const handleLinkClick = useCallback(
    (href: string) => {
      onClose();

      if (href.startsWith('/#') || href.startsWith('#')) {
        const hash = href.replace(/^\/?#/, '');
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          window.location.hash = hash;
          window.dispatchEvent(new Event('hashchange'));
        }
      }
    },
    [onClose],
  );

  const footerLinks = socialLinks.filter((link) =>
    (FOOTER_LINKS as ReadonlyArray<string>).includes(link.label),
  );

  return (
    <AnimatePresence onExitComplete={() => setHovered(null)}>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] overflow-hidden"
          style={{ background: MENU_BG, color: MENU_INK, willChange: 'clip-path' }}
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          transition={{ duration: 0.75, ease: WIPE_EASE }}
        >
          {/* top bar: sits exactly where the page's own header does */}
          <motion.div
            variants={fadeVariants}
            initial="closed"
            animate="open"
            className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 pt-[45px]"
          >
            <div className="text-[15.5px] leading-none tracking-[-0.02em]">
              <span className="font-normal">We Are </span>
              <span className="font-extrabold">incial.</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/90 focus:outline-none"
            >
              <span className="relative block h-3.5 w-3.5">
                <span className="absolute left-0 top-[6px] h-[1.5px] w-3.5 rotate-45 bg-black" />
                <span className="absolute left-0 top-[6px] h-[1.5px] w-3.5 -rotate-45 bg-black" />
              </span>
            </button>
          </motion.div>

          {/* the links */}
          <motion.nav
            variants={listVariants}
            initial="closed"
            animate="open"
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6"
            onPointerLeave={() => setHovered(null)}
          >
            {visibleLinks.map((link, index) => (
              <div key={`${link.label}-${index}`} className="overflow-hidden">
                <motion.div variants={lineVariants}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    onPointerEnter={() => setHovered(index)}
                    onPointerDown={() => setHovered(index)}
                    onFocus={() => setHovered(index)}
                    className="block py-[0.02em] font-medium uppercase leading-[0.98] tracking-[-0.03em] transition-colors duration-500"
                    style={{
                      fontSize: 'clamp(2.4rem, 11.2vw, 4.2rem)',
                      color: index === activeIndex ? MENU_INK : MENU_DIM,
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              </div>
            ))}
          </motion.nav>

          {/* bottom row: brochure on the left, socials on the right */}
          <motion.div
            variants={fadeVariants}
            initial="closed"
            animate="open"
            className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-8 text-[15px] font-medium"
          >
            <a
              href="/pdf/Brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="underline-offset-4 hover:underline"
            >
              Our Works
            </a>
            <div className="flex items-center gap-5">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
