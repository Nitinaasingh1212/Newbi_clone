import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

export const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(0);

  const services = [
    {
      id: '01',
      title: 'Complete Event Support',
      tagline: 'End-to-end planning, production, permits, and execution across India.',
      scope: [
        'Budget planning & financial management',
        'Venue scouting, liaison & statutory licensing',
        'Stage, trussing, acoustic sound & intelligent lights',
        'Artist rider coordination & backstage hospitality',
        'Turnstile entry, barcode/RFID scanners & security',
      ],
      idealFor: 'Music festivals, stadium tours, arena concerts, mega youth conferences.',
    },
    {
      id: '02',
      title: 'On-Ground Management',
      tagline: 'Precision crew, headset communications, security and crowd flow.',
      scope: [
        'Command center operations & headset radios',
        'Crowd barricading, ingress/egress safety lanes',
        'Volunteer crew training and deployment (50-200+ crew)',
        'Emergency response, medical kiosk & fire protocols',
      ],
      idealFor: 'High-density festivals, college cultural festivals, night runs.',
    },
    {
      id: '03',
      title: 'Artist Management & Booking',
      tagline: 'Direct artist access for indie, commercial, Bollywood and international DJs.',
      scope: [
        'Artist curation aligned with audience demographics',
        'Technical & hospitality rider fulfillment',
        'VIP luxury transport, airport escorts, and 5-star hotel handling',
        'Green room and backstage security clearance',
      ],
      idealFor: 'College headliner nights, brand launches, music festivals.',
    },
    {
      id: '04',
      title: 'Campus Activations',
      tagline: 'Direct access to premier universities and colleges with verified campus reps.',
      scope: [
        'Pan-India campus ambassador network (100+ colleges)',
        'Interactive pop-up zones in cafeteria & sports courtyards',
        'College festival title sponsorships & branded arenas',
        'Student sampling, product trial kits & instant QR surveys',
      ],
      idealFor: 'Youth brands, fintech apps, gaming gear, fashion & sneaker labels.',
    },
    {
      id: '05',
      title: 'Brand Activations & Pop-ups',
      tagline: 'Immersive experiential zones that convert casual viewers into obsessed advocates.',
      scope: [
        'Custom modular booth fabrication & neon signages',
        'Interactive gaming kiosks, photo ops & 360-glam booths',
        'Trained brand promoters and energetic MCs',
        'Detailed footfall audit, leads captured and demographic reports',
      ],
      idealFor: 'FMCG sampling, automotive launches, tech demos, beverage brands.',
    },
    {
      id: '06',
      title: 'Influencer & Creator Campaigns',
      tagline: 'Hyper-local seeding, live reel drops, and creator squads with real engagement.',
      scope: [
        'Selection from our verified 800+ creator network',
        'Brief creation, content direction and brand safety review',
        'On-site content rooms, backstage creator lounges',
        'Instant deliverable verification and payout processing',
      ],
      idealFor: 'Product launches, music video promotions, fest buzz, apparel collections.',
    },
    {
      id: '07',
      title: 'PR & Media Relations',
      tagline: 'Leading youth publications, news outlets, and viral cultural coverage.',
      scope: [
        'Press release drafting & multi-city wire distribution',
        'Media invites, paparazzi management, and red carpet step-and-repeats',
        'Exclusive artist & founder print/podcast interviews',
        'Comprehensive post-campaign media coverage dossier',
      ],
      idealFor: 'Concert tours, album launches, brand partnership announcements.',
    },
    {
      id: '08',
      title: 'Digital & Social Strategy',
      tagline: 'Social management, viral clip clipping, trending audio and live broadcasts.',
      scope: [
        'Real-time content creation during show hours (30-min turnaround)',
        'Meta & Google Ads hyper-targeted geo-fencing for ticket sales',
        'Discord & WhatsApp VIP community channel management',
        'Final data intelligence report with reach, impressions, and ROI',
      ],
      idealFor: 'Tour ticketing campaigns, brand awareness bursts, festival livestreams.',
    },
  ];

  const current = services[selectedService];

  return (
    <div className="flex flex-col py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10 mb-6">
            <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
            Capabilities &amp; Services
          </p>

          <h1 className="font-heading font-black tracking-[-0.04em] leading-[0.92] text-[13vw] sm:text-[8vw] lg:text-[5.5vw] text-gray-950 dark:text-white">
            Everything it takes to make{' '}
            <span className="nb-sticker inline-block nb-sticker-sm">
              young India move.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-zinc-400 leading-relaxed font-sans max-w-2xl">
            From technical staging in muddy grounds to 100-creator synchronized social drop days, Newbi is built for high-stakes execution.
          </p>
        </div>

        {/* Interactive Service Explorer */}
        <div className="mt-16 md:mt-24 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          {/* Service Selector Tabs */}
          <div className="space-y-2">
            {services.map((item, idx) => {
              const isSelected = selectedService === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedService(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gray-950 text-white dark:bg-white dark:text-black border-gray-950 dark:border-white shadow-xl'
                      : 'bg-white/50 dark:bg-white/[0.02] border-gray-950/10 dark:border-white/10 text-gray-800 dark:text-zinc-300 hover:border-gray-950/30 dark:hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-neon-green dark:text-emerald-700' : 'text-gray-400'
                      }`}
                    >
                      {item.id}
                    </span>
                    <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight">
                      {item.title}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'translate-x-1' : 'opacity-30 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Detail Display */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-12 rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-gray-950/10 dark:border-white/10 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-950/10 dark:border-white/10">
                <span className="font-heading font-black text-6xl text-neon-green">
                  {current.id}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 font-mono text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300">
                  Full Service
                </span>
              </div>

              <h2 className="mt-8 font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white leading-tight">
                {current.title}
              </h2>

              <p className="mt-3 text-lg sm:text-xl text-gray-600 dark:text-zinc-300 font-sans leading-relaxed">
                {current.tagline}
              </p>

              <div className="mt-8 pt-8 border-t border-gray-950/10 dark:border-white/10 space-y-4">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                  What we handle
                </p>
                <div className="space-y-3">
                  {current.scope.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-4 h-4 rounded-full bg-neon-green/20 text-emerald-700 dark:text-neon-green flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-base text-gray-800 dark:text-zinc-200 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-950/10 dark:border-white/10">
                <span className="font-mono text-xs font-bold uppercase text-gray-400 dark:text-zinc-500 block mb-1">
                  Ideal for
                </span>
                <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  {current.idealFor}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-950/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/contact"
                className="h-14 px-8 inline-flex items-center gap-2 rounded-full bg-neon-green text-black font-heading font-bold text-base hover:scale-[1.03] transition-transform shadow-lg"
              >
                Request Proposal for {current.title} <ArrowUpRight className="w-4 h-4" />
              </Link>
              <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">
                Custom quotes within 24 hours
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
