import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Ticket,
  LayoutDashboard,
  Star,
  Check,
  Instagram,
  Plus,
  X,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreatorPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pitch, setPitch] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await api.getCampaigns();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  const categories = ['All', 'Concert', 'Brand Activation', 'Campus Fest', 'Nightlife'];

  const filteredCampaigns =
    selectedCategory === 'All'
      ? campaigns
      : campaigns.filter((c) => c.category === selectedCategory);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setApplyLoading(true);

    try {
      const res = await api.applyToCampaign(selectedCampaign._id, {
        pitch,
        socialHandle: socialHandle || user?.email || '',
      });
      if (res.success) {
        setApplySuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyLoading(false);
    }
  };

  const creatorFaqs = [
    {
      q: 'Is it free to join?',
      a: 'Yes. No application fee, no subscription, no cut taken from what a brief pays you.',
    },
    {
      q: 'What do I need to apply?',
      a: 'An Instagram account with a real audience and a Professional (Creator or Business) account, so we can confirm your numbers through Instagram itself.',
    },
    {
      q: 'How big does my following need to be?',
      a: 'Each brief sets its own minimum, and many are open to smaller creators with an engaged, local audience. You will see the number on every campaign.',
    },
    {
      q: 'What kind of campaigns are there?',
      a: 'Brand campaigns across lifestyle, fashion, food, tech and music, event coverage at shows we run, and campus ambassador programmes.',
    },
    {
      q: 'How do I submit my work?',
      a: 'From your Newbi dashboard: paste your post links, add screenshots if the brief asks, and track approval there.',
    },
    {
      q: 'Can I refer other creators?',
      a: 'Yes. You get a personal referral code once you are in.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Creator Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              background:
                'radial-gradient(55% 55% at 88% 8%, rgba(61,240,61,0.28), transparent 70%), radial-gradient(45% 50% at 0% 85%, rgba(56,189,248,0.14), transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background:
                'radial-gradient(55% 55% at 88% 8%, rgba(61,240,61,0.18), transparent 70%), radial-gradient(45% 50% at 0% 85%, rgba(56,189,248,0.08), transparent 70%)',
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10 mb-6">
                <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
                For creators across India
              </p>

              <h1 className="font-heading font-black leading-[0.92] tracking-[-0.045em] text-gray-950 dark:text-white text-[14vw] sm:text-[10.5vw] lg:text-[6.2vw] 2xl:text-[7.2rem]">
                <span className="block">Create with brands.</span>
                <span className="block">Get into</span>
                <span className="block mt-1 sm:mt-2">
                  <span className="nb-sticker inline-block -rotate-[2deg]">
                    the shows.
                  </span>
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg sm:text-xl leading-snug text-gray-700 dark:text-zinc-300">
                Apply once. We match you to brand campaigns by city, niche and audience, and you work every campaign from one dashboard.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                <Link
                  to="/signup"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border-[3px] border-black bg-neon-green px-8 font-heading text-base font-extrabold text-black shadow-[4px_4px_0_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] transition"
                >
                  Apply as a creator
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href="#campaigns"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-white/70 dark:bg-white/[0.08] px-8 font-heading text-base font-bold text-gray-950 dark:text-white shadow-md hover:bg-white dark:hover:bg-white/[0.14] transition"
                >
                  See live briefs
                </a>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative">
              <div className="relative aspect-square max-w-[420px] mx-auto rounded-[2.5rem] bg-gray-950 dark:bg-[#0a0a0a] border border-white/10 p-8 flex flex-col justify-between shadow-2xl overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-neon-green/20 blur-3xl" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon-green">
                    CREATOR NETWORK
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-[11px] font-bold">
                    VERIFIED PASS
                  </span>
                </div>
                <div className="my-auto space-y-3">
                  <p className="font-heading font-black text-3xl sm:text-4xl text-white">
                    Direct brand briefs in your city.
                  </p>
                  <p className="text-zinc-400 text-sm">
                    No pitching in DMs. Real budgets, stage access wristbands, and automatic payouts.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/10 font-mono text-xs text-zinc-400">
                  <span>800+ Active Creators</span>
                  <span className="text-neon-green font-bold">₹2.4Cr+ Paid Out</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Briefs Section */}
      <section
        id="campaigns"
        className="scroll-mt-20 py-20 md:py-32 border-t border-gray-950/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
                <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
                01 · Open now
              </p>
              <h2 className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl text-gray-950 dark:text-white">
                Live{' '}
                <span className="nb-sticker inline-block nb-sticker-sm">
                  briefs.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-xl">
                Open a brief to see the reward, the deliverables and the follower minimum. Applying happens from your dashboard.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-heading text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-black text-white dark:bg-neon-green dark:text-black'
                      : 'bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-800 dark:text-zinc-300 hover:border-black/30 dark:hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp._id}
                className="rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-7 flex flex-col justify-between hover:border-gray-950/30 dark:hover:border-neon-green/40 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-neon-green/20 text-emerald-800 dark:text-neon-green font-mono text-[10px] font-bold uppercase tracking-wider">
                      {camp.category}
                    </span>
                    <span className="font-mono text-xs text-gray-500 dark:text-zinc-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {camp.location}
                    </span>
                  </div>

                  <h3 className="mt-4 font-heading font-extrabold text-2xl text-gray-950 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-neon-green transition-colors">
                    {camp.title}
                  </h3>

                  <p className="mt-1 font-mono text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase">
                    Brand: {camp.brand}
                  </p>

                  <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400 line-clamp-3">
                    {camp.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-gray-950/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-500 dark:text-zinc-500">Date</span>
                      <span className="font-bold text-gray-900 dark:text-zinc-200">{camp.eventDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-500 dark:text-zinc-500">Min. Followers</span>
                      <span className="font-bold text-gray-900 dark:text-zinc-200">{camp.minFollowers?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-950/10 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-500 dark:text-zinc-500 block">Reward</span>
                    <span className="font-heading font-extrabold text-base text-gray-950 dark:text-white">{camp.reward}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCampaign(camp);
                      setApplySuccess(false);
                    }}
                    className="h-11 px-5 rounded-full bg-neon-green text-black font-heading text-xs font-extrabold hover:scale-[1.03] transition-transform shadow-sm"
                  >
                    View &amp; Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Perks Section */}
      <section className="py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
              <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
              02 · What you get
            </p>
            <h2 className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl text-gray-950 dark:text-white">
              More than{' '}
              <span className="nb-sticker inline-block nb-sticker-sm">
                sponsored posts.
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-xl">
              Campaigns you would actually want to post, access to the nights we run, and one place to manage all of it.
            </p>
          </div>

          <div className="mt-12 md:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-8 rounded-[1.75rem] border border-gray-950/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
              <div className="w-12 h-12 rounded-2xl bg-gray-950 text-neon-green dark:bg-white/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-gray-950 dark:text-white">Matched brand campaigns</h3>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                Briefs from brands we work with directly, matched to your city, niche and audience. No bidding, no middlemen.
              </p>
            </div>

            <div className="p-8 rounded-[1.75rem] border border-gray-950/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
              <div className="w-12 h-12 rounded-2xl bg-gray-950 text-neon-green dark:bg-white/10 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-gray-950 dark:text-white">Into the shows</h3>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                Coverage gigs, guestlists and passes at the concerts, fests and launches Newbi runs.
              </p>
            </div>

            <div className="p-8 rounded-[1.75rem] border border-gray-950/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
              <div className="w-12 h-12 rounded-2xl bg-gray-950 text-neon-green dark:bg-white/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-gray-950 dark:text-white">One dashboard</h3>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                Briefs, deliverables, approvals and the tickets for campaigns you are on, in one place.
              </p>
            </div>

            <div className="p-8 rounded-[1.75rem] border border-gray-950/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
              <div className="w-12 h-12 rounded-2xl bg-gray-950 text-neon-green dark:bg-white/10 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-gray-950 dark:text-white">A verified creator pass</h3>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                Your Newbi profile, campaign history and status, visible to the brands we brief.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (Timeline) */}
      <section className="py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 self-start">
            <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
              <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
              03 · How it works
            </p>
            <h2 className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl text-gray-950 dark:text-white">
              From apply to{' '}
              <span className="nb-sticker inline-block nb-sticker-sm">
                paid.
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-xl">
              Four steps. Your dashboard shows where you are on every campaign.
            </p>

            <div className="mt-10 p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">
                <Instagram className="w-4 h-4" /> To apply you need
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-gray-950 dark:text-white">
                A Professional Instagram account (Creator or Business).
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                Switching takes a minute in Instagram settings. It lets us confirm your numbers through Instagram itself, with no screenshots.
              </p>
            </div>
          </div>

          <div className="space-y-8 pl-4 sm:pl-8 border-l-2 border-gray-950/10 dark:border-white/10">
            <div className="relative pl-6">
              <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-neon-green border-4 border-[#F4F2EC] dark:border-[#050505]" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-700 dark:text-neon-green">Step 01</span>
              <h3 className="mt-1 font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">Apply</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                Tell us your Instagram, city and niche. It takes a few minutes and it is free.
              </p>
            </div>

            <div className="relative pl-6">
              <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-neon-green border-4 border-[#F4F2EC] dark:border-[#050505]" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-700 dark:text-neon-green">Step 02</span>
              <h3 className="mt-1 font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">Get matched</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                We shortlist you for brand campaigns that fit your audience and your city, and tell you when a brief is yours.
              </p>
            </div>

            <div className="relative pl-6">
              <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-neon-green border-4 border-[#F4F2EC] dark:border-[#050505]" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-700 dark:text-neon-green">Step 03</span>
              <h3 className="mt-1 font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">Create</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                Post to the brief, then submit your links and proof from your dashboard. We check it and mark it done.
              </p>
            </div>

            <div className="relative pl-6">
              <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-neon-green border-4 border-[#F4F2EC] dark:border-[#050505]" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-700 dark:text-neon-green">Step 04</span>
              <h3 className="mt-1 font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">Get rewarded</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                Every brief lists its reward up front. Some come with event access or passes on top.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Creator FAQ */}
      <section className="py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 self-start">
            <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
              <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
              04 · Questions
            </p>
            <h2 className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl text-gray-950 dark:text-white">
              Before you{' '}
              <span className="nb-sticker inline-block nb-sticker-sm">
                apply.
              </span>
            </h2>
          </div>

          <div className="border-t border-gray-950/10 dark:border-white/10 divide-y divide-gray-950/10 dark:divide-white/10">
            {creatorFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full text-left flex items-center justify-between py-6 gap-4 group"
                  >
                    <span className="font-heading text-xl sm:text-2xl font-bold text-gray-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-neon-green transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`w-9 h-9 rounded-full border border-gray-950/20 dark:border-white/20 flex items-center justify-center transition-transform ${
                        isOpen ? 'bg-neon-green text-black rotate-45' : 'text-gray-950 dark:text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-gray-600 dark:text-zinc-400 text-base leading-relaxed">
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

      {/* Application Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F4F2EC] dark:bg-[#0c0f14] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-gray-950 dark:text-white"
            >
              <button
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {applySuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-neon-green/20 text-emerald-600 dark:text-neon-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl">Application Submitted!</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    We will review your profile and deliverable pitch. Check your creator dashboard for review updates.
                  </p>
                  <div className="pt-4 flex gap-3 justify-center">
                    <Link
                      to="/dashboard/applications"
                      className="px-6 py-2.5 rounded-full bg-neon-green text-black font-heading font-bold text-sm"
                    >
                      View My Applications
                    </Link>
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="px-6 py-2.5 rounded-full border border-gray-950/20 dark:border-white/20 font-heading font-bold text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-5">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-neon-green">
                      {selectedCampaign.category} Brief
                    </span>
                    <h3 className="mt-1 font-heading font-black text-2xl sm:text-3xl">
                      {selectedCampaign.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      {selectedCampaign.brand} • {selectedCampaign.location} • {selectedCampaign.eventDate}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reward:</span>
                      <span className="font-bold text-neon-green">{selectedCampaign.reward}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Points Bonus:</span>
                      <span className="font-bold">+{selectedCampaign.points} Pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deliverables:</span>
                      <span className="font-bold">{selectedCampaign.deliverables?.join(', ')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@yourhandle"
                      value={socialHandle}
                      onChange={(e) => setSocialHandle(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Pitch / Content Idea for this show *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share what style of reel or coverage you plan to create..."
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="w-full h-12 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm hover:brightness-95 transition"
                  >
                    {applyLoading ? 'Submitting...' : 'Submit Creator Application'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
