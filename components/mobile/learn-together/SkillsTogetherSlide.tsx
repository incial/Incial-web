'use client';

import { MobileSlide } from '../MobileSlide';
import DesktopSkillsTogetherSlide from '../../features/learn-together/SkillsTogetherSlide';

interface SlideProps {
  id?: string;
  onInView?: (id: string) => void;
}

export const SkillsTogetherSlide = ({ id, onInView }: SlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="h-full w-full origin-top scale-[0.9] sm:scale-100">
        <DesktopSkillsTogetherSlide />
      </div>
    </MobileSlide>
  );
};
