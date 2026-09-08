'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { ChevronRight } from 'lucide-react';
import { ServiceDetail, SERVICE_DETAILS } from '@/components/sections/ServicesSection';
import { GlassServiceIcon } from '@/components/features/services/GlassIcons';

export interface MobileServiceDetailModalProps {
  isOpen: boolean;
  initialServiceIndex?: number;
  onClose: () => void;
  onNavigate?: (id: string) => void;
}

export const MobileServiceDetailModal = ({
  isOpen,
  initialServiceIndex = 0,
  onClose,
}: MobileServiceDetailModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialServiceIndex);
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialServiceIndex);
      setActiveTab('left');
    }
  }, [isOpen, initialServiceIndex]);

  const service: ServiceDetail = SERVICE_DETAILS[currentIndex] || SERVICE_DETAILS[0];
  const nextService =
    currentIndex < SERVICE_DETAILS.length - 1 ? SERVICE_DETAILS[currentIndex + 1] : null;

  const currentServices =
    activeTab === 'left' ? service.leftServices : service.rightServices;

  const handleNext = () => {
    if (nextService) {
      setCurrentIndex((prev) => prev + 1);
      setActiveTab('left');
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Dark blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full h-[92vh] max-h-[780px] bg-[#090b10] border-t border-white/15 rounded-t-[32px] shadow-[0_-15px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white select-none"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[220px] bg-gradient-to-b from-[#56A6FF]/15 via-purple-600/5 to-transparent rounded-full blur-3xl opacity-80" />
            </div>

            {/* Top Bar with Service Indicator & Close Button */}
            <div className="relative z-20 w-full flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#56A6FF]/10 border border-[#56A6FF]/25 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#56A6FF] shadow-[0_0_6px_#56A6FF]" />
                <span className="text-[11px] font-semibold text-[#56A6FF] tracking-wider uppercase">
                  {service.number} / 03 • {service.title}
                </span>
              </div>

              {/* Prominent Close Button */}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/15 focus:outline-none"
                aria-label="Close service details"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Header: Title & 3D Glass Icon */}
              <div className="flex items-center justify-between gap-4 mt-1 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[26px] min-[400px]:text-[28px] font-bold text-white tracking-tight leading-tight">
                    {service.title}
                  </h2>
                  <p className="mt-1 text-[12px] min-[400px]:text-[13px] text-white/65 leading-snug font-normal">
                    {service.subtitle}
                  </p>
                </div>
                <div className="shrink-0 relative">
                  <div className="w-14 h-14 min-[400px]:w-16 min-[400px]:h-16 rounded-2xl bg-white/[0.04] border border-white/15 p-2 flex items-center justify-center backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
                    <GlassServiceIcon type={service.id} size={48} />
                  </div>
                </div>
              </div>

              {/* Category Switcher Tabs */}
              <div className="w-full my-4 flex-shrink-0">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4">
                  <button
                    onClick={() => setActiveTab('left')}
                    className={`relative py-2 px-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      activeTab === 'left'
                        ? 'text-white bg-[#56A6FF]/25 border border-[#56A6FF]/50 shadow-[0_0_12px_rgba(86,166,255,0.25)]'
                        : 'text-white/50 hover:text-white/80 border border-transparent'
                    }`}
                  >
                    <span className="truncate block">{service.leftCategory}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('right')}
                    className={`relative py-2 px-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      activeTab === 'right'
                        ? 'text-white bg-[#56A6FF]/25 border border-[#56A6FF]/50 shadow-[0_0_12px_rgba(86,166,255,0.25)]'
                        : 'text-white/50 hover:text-white/80 border border-transparent'
                    }`}
                  >
                    <span className="truncate block">{service.rightCategory}</span>
                  </button>
                </div>

                {/* 4 Deliverables */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${service.id}-${activeTab}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5"
                  >
                    {currentServices.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#56A6FF] mt-1.5 shrink-0 shadow-[0_0_8px_#56A6FF]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-white/95 leading-snug">
                            {item.name}
                          </p>
                          <p className="text-[12px] text-white/60 leading-relaxed mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation & Indicators */}
              <div className="w-full pt-3 mt-auto flex items-center justify-between border-t border-white/10 flex-shrink-0">
                {/* 3-Dot Service Switcher */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10">
                  {SERVICE_DETAILS.map((item, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setActiveTab('left');
                        }}
                        className="py-1 px-0.5 cursor-pointer focus:outline-none"
                        aria-label={`View ${item.title}`}
                      >
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-6 bg-[#56A6FF] shadow-[0_0_8px_#56A6FF]'
                              : 'w-2 bg-white/25 hover:bg-white/50'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Next Button or Close */}
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 border border-white/15 text-[12px] font-medium text-white/90 transition-all cursor-pointer"
                >
                  <span>
                    {nextService ? `Next: ${nextService.title.split(' ')[0]}` : 'Back to Cards'}
                  </span>
                  <ChevronRight size={14} className="text-[#56A6FF]" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Also export as MobileServiceSlide for backward compatibility
export const MobileServiceSlide = memo(MobileServiceDetailModal);

