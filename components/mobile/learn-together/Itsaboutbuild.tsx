'use client';

import { MobileSlide } from '../MobileSlide';
import DesktopItsaboutbuild from '../../features/learn-together/Itsaboutbuild';

interface SlideProps {
  id?: string;
  onInView?: (id: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const Itsaboutbuild = ({ id, onInView, onNext, onPrev }: SlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="h-full w-full origin-top scale-[0.9] sm:scale-100">
        <DesktopItsaboutbuild onNext={onNext} onPrev={onPrev} hideNav />
      </div>
    </MobileSlide>
  );
};

export default Itsaboutbuild;
