import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      num: '01',
      q: 'Which cities do you work in?',
      a: 'Across India. Tell us the city or campus and we will tell you how we would run it there.',
    },
    {
      num: '02',
      q: 'How early should we get in touch?',
      a: 'For events and activations, a few weeks ahead gives you the most options. An influencer or digital campaign can go live sooner.',
    },
    {
      num: '03',
      q: 'What does a project cost?',
      a: 'It depends on the format, the city and the scale. Share a rough budget in the form and we plan to it.',
    },
    {
      num: '04',
      q: 'Do you handle permits, production and staffing?',
      a: 'Yes. Venue and campus permits, technical production, fabrication, volunteer crews and running the day are part of the job.',
    },
    {
      num: '05',
      q: 'Can we run a campaign without an event?',
      a: 'Yes. Influencer, digital and social campaigns run on their own or alongside an event or activation.',
    },
    {
      num: '06',
      q: 'How do we see results?',
      a: 'Photos, content links and a short report with the numbers that matter for your goal.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section
      aria-labelledby="faq-title"
      className="py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Sticky Left Title */}
        <div className="lg:sticky lg:top-28 self-start">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
            <span
              className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]"
              aria-hidden="true"
            />
            <span className="text-gray-950 dark:text-white">06</span>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            Questions from brands
          </p>

          <h2
            id="faq-title"
            className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-gray-950 dark:text-white"
          >
            Before you{' '}
            <span className="nb-sticker inline-block nb-sticker-sm">
              ask.
            </span>
          </h2>
        </div>

        {/* Accordion Questions */}
        <div className="border-t border-gray-950/10 dark:border-white/10 divide-y divide-gray-950/10 dark:divide-white/10">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.num} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left flex items-center gap-4 sm:gap-6 min-h-[76px] py-5 cursor-pointer group"
                >
                  <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-gray-400 dark:text-zinc-600">
                    {faq.num}
                  </span>

                  <span className="flex-1 font-heading text-lg sm:text-xl md:text-2xl font-extrabold tracking-[-0.02em] text-gray-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-neon-green transition-colors">
                    {faq.q}
                  </span>

                  <span
                    className={`w-10 h-10 shrink-0 rounded-full border border-gray-950/15 dark:border-white/15 flex items-center justify-center transition-all ${
                      isOpen
                        ? 'bg-neon-green border-neon-green text-black rotate-45'
                        : 'text-gray-950 dark:text-white group-hover:border-black dark:group-hover:border-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pl-8 sm:pl-10 pr-4 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-600 dark:text-zinc-400 font-sans">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
