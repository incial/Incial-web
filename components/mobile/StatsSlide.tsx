'use client';

import { memo } from 'react';
import { MobileSlide } from './MobileSlide';

interface StatsSlideProps {
  id?: string;
  onInView?: (id: string) => void;
}

const StatsSlideComponent = ({ id, onInView }: StatsSlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="flex h-full w-full flex-col items-center justify-center bg-black px-6 pb-32 text-white">
        <h2 className="mb-20 text-[28px] font-light tracking-[-0.02em] text-white">
          <span className="italic">Why Trust </span>
          <span className="font-semibold text-[#56A6FF]">Incial?</span>
        </h2>

        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center leading-none">
            <div className="text-[30px] font-semibold italic leading-none text-[#56A6FF]">
              60+
            </div>
            <div className="mt-1 text-[13px] font-normal leading-none text-white/90">
              Happy Clients
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center leading-none">
            <div className="text-[30px] font-semibold italic leading-none text-[#56A6FF]">
              100+
            </div>
            <div className="mt-1 text-[13px] font-normal leading-none text-white/90">
              Projects Completed
            </div>
          </div>
        </div>
      </div>
    </MobileSlide>
  );
};

export const StatsSlide = memo(StatsSlideComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.onInView === nextProps.onInView
  );
});