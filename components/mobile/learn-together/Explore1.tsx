'use client';

import { MobileSlide } from '../MobileSlide';
import DesktopExplore1 from '../../features/learn-together/Explore1';

interface SlideProps {
  id?: string;
  onInView?: (id: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const Explore1 = ({ id, onInView, onNext, onPrev }: SlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="h-full w-full origin-top scale-[0.9] sm:scale-100">
        <DesktopExplore1 onNext={onNext} onPrev={onPrev} />
      </div>
    </MobileSlide>
  );
};

export default Explore1;
