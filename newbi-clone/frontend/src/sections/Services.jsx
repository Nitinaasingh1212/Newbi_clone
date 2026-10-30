import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Services = () => {
  const [activeService, setActiveService] = useState(0);

  const servicesData = [
    {
      num: '01',
      title: 'Complete event support',
      desc: 'Concept to curtain-down. We take your brief, lock in the venue, build the stage, staff the gates and run the entire night.',
      tags: ['Budget & timeline', 'Venue sourcing & permits', 'Technical production & build', 'Show-day run of show'],
    },
    {
      num: '02',
      title: 'On-ground management',
      desc: 'Crew on headsets, gate staff, artist liaisons and stage managers who have run festivals in rain and stadiums at midnight.',
      tags: ['Stage & artist crew', 'Sound, lights & AV', 'Crowd flow & security', 'Entry & guestlist scanning'],
    },
    {
      num: '03',
      title: 'Artist management',
      desc: 'Curation, rider execution and hospitality for Indian indie, Bollywood and international headliners.',
      tags: ['Artist booking & curation', 'Contract & riders', 'Travel & hospitality', 'Show-day handling'],
    },
    {
      num: '04',
      title: 'Campus activations',
      desc: 'Fests, sponsorships and brand days on campus, run with student networks and campus ambassadors who know how their college works.',
      tags: ['College fests', 'Fest sponsorships', 'Campus ambassadors', 'Ground operations'],
    },
    {
      num: '05',
      title: 'Brand activations',
      desc: 'Experiential zones, sampling, pop-ups and in-store experiences that move people from seeing a brand to trying it.',
      tags: ['Experiential zones', 'Fabrication & AV', 'Sampling & pop-ups', 'Footfall & conversion report'],
    },
    {
      num: '06',
      title: 'Influencer campaigns',
      desc: 'Creators from our own network, matched by city, niche and audience, plus hyper-local seeding through city pages and WhatsApp groups.',
      tags: ['Creator shortlists', 'Local page seeding', 'Community seeding', 'Approvals & proof'],
    },
    {
      num: '07',
      title: 'PR & media',
      desc: 'Press and media for launches, tours and events: press releases, media invites and interviews, and the community buzz that gets people talking before the day.',
      tags: ['Press releases', 'Media invites', 'Interviews & features', 'Coverage report'],
    },
    {
      num: '08',
      title: 'Digital & social',
      desc: 'Launch campaigns, social media management and content from every night we run, with an analytics and growth report at the end.',
      tags: ['Launch campaigns', 'Social media management', 'Event content', 'Analytics report'],
    },
  ];

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="scroll-mt-20 py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10"
    >
      <span id="about" className="sr-only">About</span>
      <span id="brands" className="sr-only">Brands</span>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
            <span
              className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]"
              aria-hidden="true"
            />
            <span className="text-gray-950 dark:text-white">03</span>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            For brands &amp; colleges
          </p>

          <h2
            id="services-title"
            className="mt-6 font-heading font-black tracking-[-0.04em] leading-[0.92] text-[11vw] sm:text-[7.5vw] lg:text-[5.4vw] text-gray-950 dark:text-white"
          >
            Plans are easy.
            <br />
            We're the crew
            <br />
            <span className="nb-sticker inline-block nb-sticker-sm">
              that runs them.
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-gray-600 dark:text-zinc-400 max-w-2xl font-sans">
            Newbi is an event marketing and live entertainment company. You bring a goal, a date and a budget; we bring the artists, the venue, the build, the creators, the press and the crew, run it, and report on it. One team, so nothing falls between chairs.
          </p>
        </div>

        {/* 8 Services Grid */}
        <div className="mt-16 md:mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {servicesData.map((service, index) => {
            const isHovered = activeService === index;
            return (
              <motion.article
                key={service.num}
                onMouseEnter={() => setActiveService(index)}
                className={`relative overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:p-12 border transition-all duration-300 flex flex-col justify-between ${
                  isHovered
                    ? 'border-gray-950/40 dark:border-neon-green/50 bg-white dark:bg-white/[0.05] shadow-xl'
                    : 'border-gray-950/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl leading-none nb-ghost select-none">
                      {service.num}
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-neon-green">
                      PILLAR {service.num}
                    </span>
                  </div>

                  <h3 className="mt-6 font-heading font-extrabold tracking-[-0.03em] leading-[1] text-2xl sm:text-3xl lg:text-4xl text-gray-950 dark:text-white">
                    {service.title}
                  </h3>

                  <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-zinc-400">
                    {service.desc}
                  </p>
                </div>

                {/* Service Tag Pills */}
                <div className="mt-8 pt-6 border-t border-gray-950/10 dark:border-white/10">
                  <ul className="flex flex-wrap gap-2">
                    {service.tags.map((tag, tIdx) => (
                      <li
                        key={tIdx}
                        className="px-3 py-1.5 rounded-full border border-gray-950/15 dark:border-white/15 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-gray-800 dark:text-zinc-300 bg-black/[0.02] dark:bg-white/[0.02]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA Banner at bottom of Services */}
        <div className="mt-12 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-black font-heading font-bold text-base hover:scale-[1.03] transition-transform shadow-lg"
          >
            Brief your campaign or festival <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
