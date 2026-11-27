'use client';

import { memo } from 'react';
import ClientMarquee from '@/components/features/home/ClientMarquee';
import AccentHeading from '@/components/ui/AccentHeading';
import { useClientsData } from '@/lib/useClientsData';
import { MobileSlide } from './MobileSlide';

interface ClientsSlideProps {
  id?: string;
  onInView?: (id: string) => void;
}

const ClientsSlideComponent = ({ id, onInView }: ClientsSlideProps) => {
  const data = useClientsData();

  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-stage text-stage-ink">
        <div className="mb-14 px-6 text-center">
          <AccentHeading
            text={data?.headerText || 'Some of Our Awesome Clients:'}
            className="text-[1.75rem] tracking-tighter"
          />
        </div>
        <div className="w-full">
          <ClientMarquee clients={data ? data.clients : null} />
        </div>
      </div>
    </MobileSlide>
  );
};

export const ClientsSlide = memo(ClientsSlideComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.onInView === nextProps.onInView
  );
});
