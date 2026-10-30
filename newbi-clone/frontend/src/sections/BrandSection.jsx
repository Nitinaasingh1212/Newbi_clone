import React from 'react';

export const BrandSection = () => {
  const services = [
    { name: 'Complete event support', ghost: false },
    { name: 'On-ground management', ghost: true },
    { name: 'Artist management', ghost: false },
    { name: 'Campus activations', ghost: true },
    { name: 'Brand activations', ghost: false },
    { name: 'Influencer campaigns', ghost: true },
    { name: 'PR & media', ghost: false },
    { name: 'Digital & social', ghost: true },
  ];

  return (
    <section
      aria-label="What we run"
      className="overflow-hidden border-y border-gray-950/10 dark:border-white/10 py-6 md:py-8 bg-black/[0.02] dark:bg-white/[0.01]"
    >
      <div className="flex w-max animate-marquee">
        {/* First Loop */}
        <ul className="flex items-center shrink-0">
          {services.map((item, idx) => (
            <li
              key={idx}
              className={`shrink-0 flex items-center font-heading font-extrabold tracking-[-0.02em] text-3xl sm:text-5xl md:text-6xl px-4 sm:px-6 md:px-8 text-gray-950 dark:text-white select-none ${
                item.ghost ? 'nb-ghost' : ''
              }`}
            >
              {item.name}
              <span
                aria-hidden="true"
                className="ml-8 sm:ml-12 md:ml-16 w-3 h-3 md:w-4 md:h-4 rounded-full bg-neon-green shadow-[0_0_8px_rgba(61,240,61,0.8)]"
              />
            </li>
          ))}
        </ul>

        {/* Duplicate Loop for seamless infinity */}
        <ul className="flex items-center shrink-0" aria-hidden="true">
          {services.map((item, idx) => (
            <li
              key={`dup-${idx}`}
              className={`shrink-0 flex items-center font-heading font-extrabold tracking-[-0.02em] text-3xl sm:text-5xl md:text-6xl px-4 sm:px-6 md:px-8 text-gray-950 dark:text-white select-none ${
                item.ghost ? 'nb-ghost' : ''
              }`}
            >
              {item.name}
              <span
                aria-hidden="true"
                className="ml-8 sm:ml-12 md:ml-16 w-3 h-3 md:w-4 md:h-4 rounded-full bg-neon-green shadow-[0_0_8px_rgba(61,240,61,0.8)]"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
