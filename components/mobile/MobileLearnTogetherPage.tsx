'use client';

import { MobileLayout } from './MobileLayout';
import { LearnLandingSlide } from './learn-together/LearnLandingSlide';
import { SkillsTogetherSlide } from './learn-together/SkillsTogetherSlide';
import Itstartedwith from './learn-together/itstartedwith';
import Whatwexlpore from './learn-together/Whatwexlpore';
import Explore1 from './learn-together/Explore1';
import Notjustech from './learn-together/Notjustech';
import Itsaboutbuild from './learn-together/Itsaboutbuild';
import Wedont from './learn-together/Wedont';
import OurApproach from './learn-together/OurApproach';
import ReadyToStartBuilding from './learn-together/ReadyToStartBuilding';

const slideIds = [
  'landing',
  'skills',
  'started',
  'explore',
  'explore-deep',
  'not-just-tech',
  'build',
  'we-dont',
  'approach',
  'ready',
];

const scrollToSlide = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const MobileLearnTogetherPage = () => {
  return (
    <MobileLayout>
      <LearnLandingSlide id={slideIds[0]} onInView={() => {}} />
      <SkillsTogetherSlide
        id={slideIds[1]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[2])}
        onPrev={() => scrollToSlide(slideIds[0])}
      />
      <Itstartedwith
        id={slideIds[2]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[3])}
        onPrev={() => scrollToSlide(slideIds[1])}
      />
      <Whatwexlpore
        id={slideIds[3]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[4])}
        onPrev={() => scrollToSlide(slideIds[2])}
      />
      <Explore1
        id={slideIds[4]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[5])}
        onPrev={() => scrollToSlide(slideIds[3])}
      />
      <Notjustech
        id={slideIds[5]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[6])}
        onPrev={() => scrollToSlide(slideIds[4])}
      />
      <Itsaboutbuild
        id={slideIds[6]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[7])}
        onPrev={() => scrollToSlide(slideIds[5])}
      />
      <Wedont
        id={slideIds[7]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[8])}
        onPrev={() => scrollToSlide(slideIds[6])}
      />
      <OurApproach
        id={slideIds[8]}
        onInView={() => {}}
        onNext={() => scrollToSlide(slideIds[9])}
        onPrev={() => scrollToSlide(slideIds[7])}
      />
      <ReadyToStartBuilding
        id={slideIds[9]}
        onInView={() => {}}
        onPrev={() => scrollToSlide(slideIds[8])}
      />
    </MobileLayout>
  );
};


