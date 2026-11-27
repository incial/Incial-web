'use client';

import { memo } from 'react';
import { MobileSlide } from './MobileSlide';

import Footer from '../layout/Footer';

interface ContactSlideProps {
  id?: string;
  onInView?: (id: string) => void;
}

const ContactSlideComponent = ({ id, onInView }: ContactSlideProps) => {
  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="flex h-full w-full flex-col bg-stage px-6 text-stage-ink">
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <section className="mx-auto w-full max-w-[304px]">
            <div className="mb-7 text-left">
              <h2 className="text-[29px] font-semibold italic leading-[1.15] tracking-[-0.04em] text-stage-ink">
                Have a question?
              </h2>
              <h2 className="text-[29px] font-semibold italic leading-[1.15] tracking-[-0.04em] text-stage-ink">
                Need a quote?
              </h2>
              <p className="mt-2 text-[12px] leading-[1.45] text-stage-ink/70">
                We promise to reply within 24 hours, every time.
              </p>
            </div>

            <form className="space-y-2.5">
              {['Full Name', 'Email', 'Phone'].map((placeholder) => (
                <div
                  key={placeholder}
                  className="h-[36px] rounded-full border border-stage-ink/10 bg-stage-ink/5 px-4"
                >
                  <input
                    type={placeholder === 'Email' ? 'email' : placeholder === 'Phone' ? 'tel' : 'text'}
                    placeholder={placeholder}
                    className="h-full w-full bg-transparent text-[12px] text-stage-ink outline-none placeholder:text-stage-ink/40"
                  />
                </div>
              ))}

              <div className="relative min-h-[116px] rounded-[18px] border border-stage-ink/10 bg-stage-ink/5 px-4 pb-4 pt-3.5">
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="h-[74px] w-full resize-none bg-transparent text-[12px] text-stage-ink outline-none placeholder:text-stage-ink/40"
                />

                <div className="absolute bottom-3 right-3">
                  <button
                    type="submit"
                    className="rounded-full bg-stage-ink px-4 py-1.5 text-[12px] font-semibold text-stage shadow-[0_1px_10px_rgba(0,0,0,0.08)]"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        {/* Footer placed at the bottom of the flex layout */}
        <div className="w-full">
          <Footer noPadding />
        </div>
      </div>
    </MobileSlide>
  );
};

export const ContactSlide = memo(ContactSlideComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.onInView === nextProps.onInView
  );
});