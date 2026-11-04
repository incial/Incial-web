'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LINE_TOP_PX = 300;
const LINE_HEIGHT_VH = 180;
const GREEN = 'rgba(115,210,140,0.75)';

interface Step {
  title: string;
  description: string;
  /** Distance down the line, in vh. */
  pointVh: number;
  side: 'right' | 'left';
  emoji: string;
  emojiSize: number;
  emojiClass: string;
  /** Extra offset from the point, as a CSS length. */
  emojiShift: string;
  /** Where the emoji drifts in from. */
  emojiFrom: { x?: number; y?: number };
}

const STEPS: Step[] = [
  {
    title: 'Design',
    description: 'Branding, UI/UX, visual systems, creative thinking.',
    pointVh: 35,
    side: 'right',
    emoji: '🖌️',
    emojiSize: 110,
    emojiClass: 'translate-x-[440px]',
    emojiShift: '- 40px',
    emojiFrom: { x: 50 },
  },
  {
    title: 'Technology',
    description: 'Digital tools, product building, automation, systems.',
    pointVh: 75,
    side: 'left',
    emoji: '💻',
    emojiSize: 120,
    emojiClass: '-translate-x-[380px]',
    emojiShift: '+ 110px',
    emojiFrom: { x: -50 },
  },
  {
    title: 'Marketing',
    description: 'Strategy, social growth, campaign execution, storytelling.',
    pointVh: 115,
    side: 'right',
    emoji: '📣',
    emojiSize: 100,
    emojiClass: 'translate-x-[280px]',
    emojiShift: '- 150px',
    emojiFrom: { y: -20 },
  },
  {
    title: 'Creative Skills',
    description: 'Ideation, presentation, communication, execution.',
    pointVh: 155,
    side: 'left',
    emoji: '💡',
    emojiSize: 90,
    emojiClass: '-translate-x-[320px]',
    emojiShift: '+ 140px',
    emojiFrom: { y: 20 },
  },
];

const pointTop = (vh: number, shift = '') =>
  `calc(${LINE_TOP_PX}px + ${vh}vh ${shift})`.replace(/\s+/g, ' ');

const Explore1 = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const line = root.querySelector<HTMLElement>('[data-flow-line]');
    const texts = STEPS.map((_, i) => root.querySelector<HTMLElement>(`[data-step-text="${i}"]`));
    const emojis = STEPS.map((_, i) => root.querySelector<HTMLElement>(`[data-step-emoji="${i}"]`));
    if (!line) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(line, { scaleY: 1 });
      gsap.set([...texts, ...emojis], { opacity: 1, x: 0, y: 0 });
      return;
    }

    // The line grows with the scroll position; each milestone's text and emoji arrive as the
    // tip of the line passes them, and run in reverse when scrolling back up.
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      });

      timeline.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

      STEPS.forEach((step, i) => {
        const at = step.pointVh / LINE_HEIGHT_VH;
        const text = texts[i];
        const emoji = emojis[i];
        if (text) {
          timeline.fromTo(
            text,
            { opacity: 0, x: step.side === 'right' ? 40 : -40 },
            { opacity: 1, x: 0, duration: 0.07, ease: 'power2.out' },
            at - 0.02,
          );
        }
        if (emoji) {
          timeline.fromTo(
            emoji,
            { opacity: 0, x: 0, y: 0, ...step.emojiFrom },
            { opacity: 1, x: 0, y: 0, duration: 0.08, ease: 'power2.out' },
            at,
          );
        }
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-[260vh] w-full justify-center overflow-x-clip bg-black px-6 pt-[120px] font-['Poppins']"
    >
      {/* EXPLORE TITLE — stays at the top while the flow scrolls */}
      <div className="pointer-events-none absolute inset-y-0 left-6 z-30">
        <div className="sticky top-24">
          <h2 className="text-[42px] font-semibold tracking-tight text-white">Explore</h2>
        </div>
      </div>

      <div className="relative w-full max-w-[1400px]">
        {/* CENTER WRAPPER */}
        <div className="relative mx-auto w-[500px]">
          {/* TOP CIRCLE HERO */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="relative h-[360px] w-[360px]">
              <div className="absolute inset-0 rounded-full border border-[rgba(115,210,140,0.7)]" />
              <div className="absolute left-1/2 top-1/2 h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(115,210,140,0.7)]" />
              <div className="absolute left-1/2 top-[223px] h-[150px] w-[2px] -translate-x-1/2 bg-[rgba(115,210,140,0.7)]" />
            </div>
          </div>

          {/* MAIN LINE — grows from the top with the scroll */}
          <div
            data-flow-line
            className="absolute left-1/2 w-[2px] -translate-x-1/2"
            style={{
              top: `${LINE_TOP_PX}px`,
              height: `${LINE_HEIGHT_VH}vh`,
              background: GREEN,
              transformOrigin: 'top',
              transform: 'scaleY(0)',
            }}
          />

          {STEPS.map((step, i) => (
            <div key={step.title}>
              {/* milestone dot */}
              <div
                className="absolute left-1/2 z-20 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(115,210,140,0.75)] bg-black"
                style={{ top: pointTop(step.pointVh) }}
              />

              {/* TEXT */}
              <div
                data-step-text={i}
                className={
                  step.side === 'right'
                    ? 'absolute left-1/2 w-[420px] translate-x-[20px] -translate-y-1/2'
                    : 'absolute left-1/2 w-[420px] -translate-x-[430px] -translate-y-1/2 text-right'
                }
                style={{ top: pointTop(step.pointVh), opacity: 0 }}
              >
                <h3 className="text-[42px] font-semibold leading-none tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.7] font-light text-white/60">
                  {step.description}
                </p>
              </div>

              {/* EMOJI */}
              <div
                data-step-emoji={i}
                className={`absolute left-1/2 ${step.emojiClass}`}
                style={{ top: pointTop(step.pointVh, step.emojiShift), opacity: 0 }}
              >
                <span style={{ fontSize: step.emojiSize }}>{step.emoji}</span>
              </div>
            </div>
          ))}

          {/* CENTER CIRCLES */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ top: pointTop(STEPS[3].pointVh, '+ 150px') }}
          >
            <div className="relative h-[260px] w-[260px]">
              <div className="absolute inset-0 rounded-full border border-[rgba(115,210,140,0.7)]" />
              <div className="absolute left-1/2 top-1/2 h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(115,210,140,0.7)]" />
              <div className="absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(115,210,140,0.9)] bg-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore1;
