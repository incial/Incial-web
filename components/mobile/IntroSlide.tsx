'use client';

import { memo, useState } from 'react';
import { MobileSlide } from './MobileSlide';
import ServiceIntroDeck from '@/components/features/services/ServiceIntroDeck';
import { MobileServiceDetailModal } from './MobileServiceSlide';

interface IntroSlideProps {
  id?: string;
  onInView?: (id: string) => void;
  onNavigate?: (id: string) => void;
}

const IntroSlideComponent = ({ id, onInView }: IntroSlideProps) => {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);

  const handleAction = (slideIndex?: number) => {
    setSelectedServiceIndex(slideIndex ?? 0);
  };

  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="w-full h-full relative">
        <ServiceIntroDeck onAction={handleAction} />

        {/* Dedicated Service Detail Modal — Only shown when a card is clicked */}
        <MobileServiceDetailModal
          isOpen={selectedServiceIndex !== null}
          initialServiceIndex={selectedServiceIndex ?? 0}
          onClose={() => setSelectedServiceIndex(null)}
        />
      </div>
    </MobileSlide>
  );
};

export const IntroSlide = memo(IntroSlideComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.onInView === nextProps.onInView &&
    prevProps.onNavigate === nextProps.onNavigate
  );
});