'use client';

import { MobileLayout } from './MobileLayout';
import { LearnLandingSlide } from './learn-together/LearnLandingSlide';

export const MobileLearnTogetherPage = () => {
  return (
    <MobileLayout>
      <LearnLandingSlide 
        id="landing"
        onInView={() => {}}
      />
    </MobileLayout>
  );
};


