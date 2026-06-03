'use client';

import { MobileSlide } from '../MobileSlide';
import DesktopItstartedwith from '../../features/learn-together/itstartedwith';

interface SlideProps {
  id?: string;
  onInView?: (id: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const Itstartedwith = ({ id, onInView, onNext, onPrev }: SlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="h-full w-full origin-top scale-[0.9] sm:scale-100">
        <DesktopItstartedwith onNext={onNext} onPrev={onPrev} hideNav />
      </div>
    </MobileSlide>
  );
};

export default Itstartedwith;
