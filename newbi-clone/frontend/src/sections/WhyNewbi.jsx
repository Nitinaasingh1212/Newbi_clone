import React from 'react';
import { motion } from 'framer-motion';

export const WhyNewbi = () => {
  const points = [
    {
      title: 'Execution, not decks.',
      desc: 'We run the thing, not just plan it.',
    },
    {
      title: 'One crew.',
      desc: 'Artists, production, creators, crews, report.',
    },
    {
      title: 'Our own network.',
      desc: 'Creators and ambassadors matched by city and niche.',
    },
    {
      title: 'Numbers after.',
      desc: 'Every project ends with a report you can forward.',
    },
  ];

  return (
    <section
      aria-labelledby="why-title"
      className="py-24 md:py-40 border-t border-gray-950/10 dark:border-white/10 bg-gray-950 text-white dark:bg-[#0a0a0a] transition-colors"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/[0.06] text-zinc-300 ring-white/10">
          <span
            className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]"
            aria-hidden="true"
          />
          <span className="text-white">05</span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          Why Newbi
        </p>

        <h2 id="why-title" className="sr-only">
          Why Newbi
        </h2>

        <ul className="mt-12 md:mt-20 space-y-8 md:space-y-14">
          {points.map((pt, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="font-heading font-black tracking-[-0.035em] leading-[0.98] text-[2.4rem] sm:text-5xl lg:text-6xl xl:text-[5.2rem]"
            >
              <span className="nb-fill-green text-neon-green mr-3">{pt.title}</span>
              <span className="text-zinc-400">{pt.desc}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};
