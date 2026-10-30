import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { ContactForm } from '../sections/ContactForm';

export const ContactPage = () => {
  const quickLinks = [
    {
      title: "I'm a creator",
      desc: 'Apply to the Newbi creator network for paid brand campaigns.',
      href: '/creator',
      cta: 'Apply for briefs',
    },
    {
      title: 'Guestlists and passes',
      desc: 'Your passes, guestlists and giveaways live in your free account.',
      href: '/signup',
      cta: 'Claim entry',
    },
    {
      title: 'A story for ConcertZone',
      desc: 'Pitch an artist, a music scene or an underground night to our editors.',
      href: '/work',
      cta: 'Pitch a story',
    },
  ];

  const locations = [
    {
      city: 'Mumbai (HQ)',
      address: 'Waterfield Road, Bandra West, Mumbai 400050',
      contact: 'mumbai@newbi.live',
    },
    {
      city: 'Delhi NCR',
      address: 'Aurobindo Marg, Hauz Khas, New Delhi 110016',
      contact: 'delhi@newbi.live',
    },
    {
      city: 'Bengaluru',
      address: '12th Main Road, Indiranagar, Bengaluru 560038',
      contact: 'blr@newbi.live',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Top Hero Header */}
      <section className="pt-16 pb-12 border-b border-gray-950/10 dark:border-white/10 bg-[#F4F2EC] dark:bg-[#050505]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10 mb-6">
            <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
            Contact
          </p>

          <h1 className="font-heading font-black tracking-[-0.04em] leading-[0.92] text-[13vw] sm:text-[8vw] lg:text-[5.5vw] text-gray-950 dark:text-white">
            Tell us what you're{' '}
            <span className="nb-sticker inline-block nb-sticker-sm">
              planning.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-zinc-400 leading-relaxed font-sans max-w-2xl">
            A college activation, a live show or a creator campaign. Write to us here and the team replies by email within one working day.
          </p>

          {/* Quick Pathway Cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                to={item.href}
                className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:border-black/30 dark:hover:border-neon-green/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-gray-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-neon-green transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 font-heading text-xs font-bold text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform">
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neon-green" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <ContactForm />

      {/* City Hubs Section */}
      <section className="py-20 border-t border-gray-950/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.01]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-neon-green mb-2">
            On-Ground Footprint
          </p>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            Where the Newbi crew operates
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {locations.map((loc) => (
              <div
                key={loc.city}
                className="p-7 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] space-y-3"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-neon-green" />
                  <h3 className="font-heading font-extrabold text-xl text-gray-950 dark:text-white">
                    {loc.city}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {loc.address}
                </p>
                <p className="pt-2 font-mono text-xs font-bold text-gray-800 dark:text-zinc-300">
                  {loc.contact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
