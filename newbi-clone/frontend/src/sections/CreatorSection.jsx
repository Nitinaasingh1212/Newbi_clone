import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, ArrowUpRight } from 'lucide-react';

export const CreatorSection = () => {
  const creatorPerks = [
    'Briefs, deliverables and approvals in one place',
    'Access to concerts, fests and live events',
    'Tickets and passes for campaigns you are on',
    'Free to join',
  ];

  const communityPerks = [
    'Guestlists for shows in your city',
    'Volunteer gigs at live events',
    'Giveaways, passes and a QR code for entry',
  ];

  return (
    <section
      id="community"
      aria-labelledby="join-title"
      className="scroll-mt-20 py-20 md:py-32 border-t border-gray-950/10 dark:border-white/10"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Pill & Title */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
            <span
              className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]"
              aria-hidden="true"
            />
            <span className="text-gray-950 dark:text-white">01</span>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            Creators &amp; community
          </p>

          <h2
            id="join-title"
            className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-gray-950 dark:text-white"
          >
            Be part of{' '}
            <span className="nb-sticker inline-block nb-sticker-sm">
              the night.
            </span>
          </h2>

          <p className="mt-5 text-base md:text-lg leading-relaxed text-gray-600 dark:text-zinc-400 max-w-xl">
            Every show and campaign we run lives on newbi.live for the people in it. Creators get a dashboard. The community gets guestlists, passes and giveaways. One account, no forms to fill twice.
          </p>
        </div>

        {/* 2 Big Cards Grid */}
        <div className="mt-12 md:mt-16 grid gap-6 lg:grid-cols-2">
          {/* Card 1: For creators */}
          <div className="relative overflow-hidden flex flex-col p-7 sm:p-10 lg:p-14 rounded-[2rem] bg-gray-950 text-white dark:bg-[#0a0a0a] dark:border dark:border-white/10 shadow-2xl">
            {/* Background Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-32 -right-32 w-[30rem] h-[30rem] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(closest-side, rgba(61,240,61,0.22), transparent)',
              }}
            />

            <p className="relative font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-neon-green">
              For creators
            </p>

            <h3 className="relative mt-5 font-heading font-extrabold tracking-[-0.035em] leading-[0.95] text-3xl sm:text-4xl lg:text-5xl">
              Apply once. Work every campaign from one dashboard.
            </h3>

            <p className="relative mt-5 max-w-md text-base sm:text-lg leading-relaxed text-zinc-300">
              Join the Newbi creator network and we match you to brand campaigns by city, niche and audience.
            </p>

            <ul className="relative mt-7 space-y-3 max-w-md">
              {creatorPerks.map((perk, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] sm:text-base text-zinc-200">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center bg-neon-green text-black"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="relative mt-auto pt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/creator"
                className="inline-flex h-14 px-8 items-center gap-2 rounded-full font-heading font-bold text-base transition hover:scale-[1.03] active:scale-[0.98] bg-neon-green text-black shadow-[0_0_20px_rgba(61,240,61,0.35)]"
              >
                Apply as a creator
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/creator"
                className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold underline underline-offset-4 decoration-neon-green text-white hover:text-neon-green transition-colors"
              >
                How the network works
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: For the community */}
          <div className="relative overflow-hidden flex flex-col p-7 sm:p-10 lg:p-14 rounded-[2rem] bg-white/70 dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10 text-gray-950 dark:text-white shadow-lg">
            <p className="relative font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-gray-500 dark:text-zinc-500">
              For the community
            </p>

            <h3 className="relative mt-5 font-heading font-extrabold tracking-[-0.035em] leading-[0.95] text-3xl sm:text-4xl lg:text-5xl">
              Be on the list for every show near you.
            </h3>

            <p className="relative mt-5 max-w-md text-base sm:text-lg leading-relaxed text-gray-600 dark:text-zinc-400">
              Students and fans sign in once to join guestlists, volunteer at gigs and enter giveaways. Your passes live in your account, with a QR code at the gate.
            </p>

            <ul className="relative mt-7 space-y-3 max-w-md">
              {communityPerks.map((perk, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] sm:text-base text-gray-700 dark:text-zinc-300">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center bg-gray-950 text-white dark:bg-neon-green dark:text-black"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="relative mt-auto pt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/signup"
                className="inline-flex h-14 px-8 items-center gap-2 rounded-full font-heading font-bold text-base transition hover:scale-[1.03] active:scale-[0.98] bg-gray-950 text-white dark:bg-white dark:text-black"
              >
                Join the community
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold underline underline-offset-4 decoration-neon-green text-gray-950 dark:text-white hover:text-emerald-700 dark:hover:text-neon-green transition-colors"
              >
                How the community works
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
