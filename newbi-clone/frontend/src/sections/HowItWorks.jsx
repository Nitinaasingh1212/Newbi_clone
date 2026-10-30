import React from 'react';
import { motion } from 'framer-motion';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Brief',
      desc: 'Tell us the goal, the audience, the city and the budget. A form or a call, whichever is faster.',
      gradient: 'rgba(61,240,61,0.12)',
    },
    {
      num: '02',
      title: 'Plan',
      desc: 'We come back with a plan, a timeline and a quote. You see exactly what happens and when.',
      gradient: 'rgba(61,240,61,0.16)',
    },
    {
      num: '03',
      title: 'Run',
      desc: 'Our crew runs it: artists, production, creators, staffing, entry. You get updates as it happens, not a week later.',
      gradient: 'rgba(61,240,61,0.20)',
    },
    {
      num: '04',
      title: 'Report',
      desc: 'Photos, content links and the numbers that matter for your goal, in one short report.',
      gradient: 'rgba(61,240,61,0.24)',
    },
  ];

  return (
    <section
      aria-labelledby="process-title"
      className="py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        {/* Sticky Left Title */}
        <div className="lg:sticky lg:top-28 self-start">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
            <span
              className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]"
              aria-hidden="true"
            />
            <span className="text-gray-950 dark:text-white">04</span>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            How it works
          </p>

          <h2
            id="process-title"
            className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-gray-950 dark:text-white"
          >
            From a brief to a{' '}
            <span className="nb-sticker inline-block nb-sticker-sm">
              full room.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-zinc-400 max-w-xl">
            Four steps, one point of contact. You never chase three vendors for one answer.
          </p>
        </div>

        {/* Stacking Step Cards */}
        <div className="space-y-6 sm:space-y-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-[2rem] border border-gray-950/10 dark:border-white/10 bg-[#F4F2EC] dark:bg-[#0b0e13] p-7 md:p-10 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.25)] hover:border-gray-950/30 dark:hover:border-neon-green/30 transition-colors"
            >
              {/* Radial glow */}
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(closest-side, ${step.gradient}, transparent)`,
                }}
              />

              <div className="relative flex items-start justify-between gap-6">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700 dark:text-neon-green">
                  Step {step.num}
                </span>
                <span className="font-heading font-extrabold tracking-[-0.04em] text-5xl md:text-6xl leading-none nb-ghost select-none">
                  {step.num}
                </span>
              </div>

              <h3 className="relative mt-4 font-heading font-black tracking-[-0.03em] text-3xl sm:text-4xl md:text-5xl leading-[0.95] text-gray-950 dark:text-white">
                {step.title}
              </h3>

              <p className="relative mt-4 max-w-md text-base sm:text-lg leading-relaxed text-gray-600 dark:text-zinc-400">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
