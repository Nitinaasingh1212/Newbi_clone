import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Megaphone, Music2, Ticket } from 'lucide-react';
import { NewbiIcon } from '../components/common/NewbiLogo';

export const Hero = () => {
  return (
    <section className="relative flex min-h-[calc(100svh-65px)] flex-col overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* Light Mode Glow */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(55% 55% at 88% 8%, rgba(61,240,61,0.28), transparent 70%), radial-gradient(45% 50% at 0% 85%, rgba(56,189,248,0.14), transparent 70%), radial-gradient(40% 40% at 45% 40%, rgba(255,255,255,0.7), transparent 70%)',
          }}
        />
        {/* Dark Mode Glow */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(55% 55% at 88% 8%, rgba(61,240,61,0.18), transparent 70%), radial-gradient(45% 50% at 0% 85%, rgba(56,189,248,0.08), transparent 70%)',
          }}
        />
        {/* Subtle Grid / Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.035] text-black dark:text-white"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, #000 30%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 30%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-4 pb-12 pt-6 sm:px-6 sm:pt-10 md:pt-16 lg:px-10 lg:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-12">
          {/* Left Text Column */}
          <div className="order-2 lg:order-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading font-black leading-[0.92] tracking-[-0.045em] text-gray-950 dark:text-white text-[15vw] sm:text-[11vw] lg:text-[6.5vw] 2xl:text-[7.6rem]"
            >
              <span className="block">We make</span>
              <span className="block">young India</span>
              <span className="block mt-1 sm:mt-2">
                <span className="nb-sticker inline-block -rotate-[2deg]">
                  show up.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-md text-lg leading-snug text-gray-700 dark:text-zinc-300 md:text-xl font-sans"
            >
              Live shows, guestlists and paid creator campaigns across India. One free account gets you in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3.5 sm:flex-row"
            >
              <Link
                to="/signup"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border-[3px] border-black bg-neon-green px-8 font-heading text-base font-extrabold text-black shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000]"
              >
                Join free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#brands"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white/70 px-8 font-heading text-base font-bold text-gray-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_-12px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-black/[0.08] backdrop-blur-xl transition hover:bg-white/90 dark:bg-white/[0.08] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:ring-white/15 dark:hover:bg-white/[0.14]"
              >
                For brands &amp; colleges
              </a>
            </motion.div>
          </div>

          {/* Right Visual Floating Pill Stage */}
          <div className="order-1 -mb-2 lg:order-2 lg:mb-0">
            <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[290px] sm:max-w-[380px] lg:max-w-[480px]">
              {/* Radial Blur Backdrop */}
              <div className="absolute inset-[10%] rounded-full bg-neon-green/25 blur-3xl dark:bg-neon-green/20" />
              <div
                className="absolute inset-[12%] rounded-[3rem] border border-gray-950/10 dark:border-white/10"
                style={{
                  backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                  color: 'rgba(0,0,0,0.12)',
                }}
              />

              {/* Central Dynamic Brand Emblem */}
              <motion.div
                initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 w-[65%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_24px_40px_rgba(0,0,0,0.3)] flex items-center justify-center"
              >
                <div className="w-full aspect-square rounded-[2.5rem] bg-gray-950 dark:bg-white border-4 border-black dark:border-white p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-green/30 blur-2xl group-hover:scale-125 transition-transform" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon-green dark:text-black">
                    EST. 2026
                  </span>
                  <div className="my-auto text-center">
                    <span className="font-heading font-black text-6xl sm:text-7xl lg:text-8xl text-white dark:text-black tracking-tighter">
                      N<span className="text-neon-green dark:text-black">.</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 font-bold uppercase">
                    <span>LIVE EVENTS</span>
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Pill 1: Campus activations */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-[0%] top-[8%]"
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 sm:border-[3px] border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2.5 font-heading text-xs sm:text-[14px] font-extrabold text-gray-950 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] -rotate-[6deg] dark:border-white/80 dark:bg-[#111] dark:text-white">
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-neon-green" />
                  Campus activations
                </span>
              </motion.div>

              {/* Floating Pill 2: Creator campaigns */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute right-[0%] top-[20%]"
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 sm:border-[3px] border-black bg-neon-green px-3 py-1.5 sm:px-4 sm:py-2.5 font-heading text-xs sm:text-[14px] font-extrabold text-black shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] rotate-[5deg]">
                  <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                  Creator campaigns
                </span>
              </motion.div>

              {/* Floating Pill 3: Artist shows */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute left-[2%] bottom-[22%]"
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 sm:border-[3px] border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2.5 font-heading text-xs sm:text-[14px] font-extrabold text-gray-950 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] rotate-[4deg] dark:border-white/80 dark:bg-[#111] dark:text-white">
                  <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-neon-green" />
                  Artist shows
                </span>
              </motion.div>

              {/* Floating Pill 4: Guestlists & passes */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute right-[2%] bottom-[6%]"
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 sm:border-[3px] border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2.5 font-heading text-xs sm:text-[14px] font-extrabold text-gray-950 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] -rotate-[4deg] dark:border-white/80 dark:bg-[#111] dark:text-white">
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-neon-green" />
                  Guestlists &amp; passes
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
