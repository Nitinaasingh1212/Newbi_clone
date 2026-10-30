import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DashboardCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalCampaign, setActiveModalCampaign] = useState(null);
  const [pitch, setPitch] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyDone, setApplyDone] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await api.getCampaigns();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  const categories = ['All', 'Concert', 'Brand Activation', 'Campus Fest', 'Nightlife'];

  const filtered = campaigns.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = async (e) => {
    e.preventDefault();
    if (!activeModalCampaign) return;
    setApplying(true);

    try {
      await api.applyToCampaign(activeModalCampaign._id, {
        pitch,
        socialHandle: user?.email,
      });
      setApplyDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            Live Campaign Briefs
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Browse open spots for concerts, festivals and brand campaigns.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city, artist, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-neon-green text-black shadow-sm'
                : 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:border-black/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((camp) => (
          <div
            key={camp._id}
            className="rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 flex flex-col justify-between shadow-sm hover:border-gray-950/30 dark:hover:border-neon-green/40 transition group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-neon-green/20 text-emerald-800 dark:text-neon-green font-bold">
                  {camp.category}
                </span>
                <span className="text-gray-500 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> {camp.location}
                </span>
              </div>

              <h3 className="mt-4 font-heading font-extrabold text-2xl text-gray-950 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-neon-green transition-colors">
                {camp.title}
              </h3>

              <p className="mt-1 font-mono text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase">
                {camp.brand}
              </p>

              <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-zinc-400 line-clamp-3">
                {camp.description}
              </p>

              <div className="mt-6 pt-4 border-t border-gray-950/10 dark:border-white/10 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-gray-500">
                  <span>Date</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-200">{camp.eventDate}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Spots</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-200">
                    {camp.spotsFilled} / {camp.spotsTotal} filled
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-950/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Reward</span>
                <span className="font-heading font-extrabold text-sm sm:text-base text-gray-950 dark:text-white">
                  {camp.reward}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveModalCampaign(camp);
                  setApplyDone(false);
                }}
                className="h-10 px-5 rounded-full bg-neon-green text-black font-heading font-extrabold text-xs hover:scale-105 transition shadow-sm"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {activeModalCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#F4F2EC] dark:bg-[#0c0f14] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-gray-950 dark:text-white"
            >
              <button
                onClick={() => setActiveModalCampaign(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              {applyDone ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-neon-green/20 text-emerald-600 dark:text-neon-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-black text-2xl">Application Sent!</h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    The team will review your application and send you the pass QR code once confirmed.
                  </p>
                  <button
                    onClick={() => setActiveModalCampaign(null)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-neon-green text-black font-heading font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-neon-green">
                      {activeModalCampaign.category} Brief
                    </span>
                    <h3 className="font-heading font-black text-2xl mt-1">
                      {activeModalCampaign.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {activeModalCampaign.brand} • {activeModalCampaign.location}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-mono space-y-1">
                    <p className="font-bold text-neon-green">Reward: {activeModalCampaign.reward}</p>
                    <p className="text-gray-600 dark:text-zinc-400">
                      Deliverables: {activeModalCampaign.deliverables?.join(', ')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Quick Pitch or Reel Idea
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Tell the brand why your audience matches this show..."
                      className="w-full p-3.5 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full h-12 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm hover:brightness-95 transition"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
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
