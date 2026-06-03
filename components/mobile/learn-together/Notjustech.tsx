'use client';

import { MobileSlide } from '../MobileSlide';
import DesktopNotjustech from '../../features/learn-together/Notjustech';

interface SlideProps {
  id?: string;
  onInView?: (id: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const Notjustech = ({ id, onInView, onNext, onPrev }: SlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="h-full w-full origin-top scale-[0.9] sm:scale-100">
        <DesktopNotjustech onNext={onNext} onPrev={onPrev} hideNav />
      </div>
    </MobileSlide>
  );
};

export default Notjustech;
