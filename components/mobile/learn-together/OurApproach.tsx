'use client';

import { MobileSlide } from '../MobileSlide';
import DesktopOurApproach from '../../features/learn-together/OurApproach';

interface SlideProps {
  id?: string;
  onInView?: (id: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const OurApproach = ({ id, onInView, onNext, onPrev }: SlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="h-full w-full origin-top scale-[0.9] sm:scale-100">
        <DesktopOurApproach onNext={onNext} onPrev={onPrev} hideNav />
      </div>
    </MobileSlide>
  );
};

export default OurApproach;
