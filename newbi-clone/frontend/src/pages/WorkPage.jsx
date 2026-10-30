import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play,
  X,
  ArrowUpRight,
  Users,
  Eye,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const WorkPage = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [activeReel, setActiveReel] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await api.getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const categories = ['All', 'Concerts', 'Campus Fests', 'Brand Activations', 'Creator Tours'];

  const filteredProjects =
    filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="flex flex-col py-12 md:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10 mb-6">
              <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]" />
              The Archive
            </p>

            <h1 className="font-heading font-black tracking-[-0.04em] leading-[0.92] text-[13vw] sm:text-[8vw] lg:text-[5.5vw] text-gray-950 dark:text-white">
              Every night{' '}
              <span className="nb-sticker inline-block nb-sticker-sm">
                we've built.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-gray-600 dark:text-zinc-400 leading-relaxed font-sans">
              Concerts, launches, fests and campaigns Newbi has produced and run across India. Tap the green button on a poster to watch its reel.
            </p>
          </div>

          <Link
            to="/contact"
            className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-neon-green text-black font-heading text-base font-extrabold hover:scale-[1.03] transition-transform shadow-[0_0_20px_rgba(61,240,61,0.3)] shrink-0 self-start md:self-auto"
          >
            Produce a show with us <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="mt-12 flex flex-wrap gap-2.5 pb-4 border-b border-gray-950/10 dark:border-white/10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-heading text-xs sm:text-sm font-bold transition-all ${
                filter === cat
                  ? 'bg-black text-white dark:bg-neon-green dark:text-black shadow-md'
                  : 'bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-800 dark:text-zinc-300 hover:border-black/30 dark:hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="group rounded-[2rem] border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all"
            >
              {/* Image & Video Trigger Banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Reel Trigger Button */}
                <button
                  onClick={() => setActiveReel(item)}
                  className="absolute bottom-4 right-4 h-11 px-4 rounded-full bg-neon-green text-black font-heading font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Watch Reel
                </button>
              </div>

              {/* Project Info */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-zinc-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.city}</span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="mt-3 font-heading font-extrabold text-2xl text-gray-950 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-1 font-mono text-xs font-bold uppercase text-emerald-700 dark:text-neon-green">
                    {item.brandOrArtist}
                  </p>

                  <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Live Verified Numbers */}
                <div className="mt-6 pt-5 border-t border-gray-950/10 dark:border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-gray-500 block">Footfall</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.footfall}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-gray-500 block">Impressions</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.reach}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-black/[0.04] dark:bg-white/5 text-gray-700 dark:text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reel Video Player Modal */}
      <AnimatePresence>
        {activeReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm aspect-[9/16] rounded-3xl bg-black overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between p-6 text-white"
            >
              <button
                onClick={() => setActiveReel(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neon-green text-black">
                  Newbi Live Reel
                </span>
                <span className="font-mono text-xs text-zinc-300">
                  {activeReel.city}
                </span>
              </div>

              {/* Simulated Ambient Video Stage */}
              <div className="absolute inset-0 z-0">
                <img
                  src={activeReel.image}
                  alt={activeReel.title}
                  className="w-full h-full object-cover opacity-60 animate-pulse-subtle"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-neon-green/30 border-2 border-neon-green flex items-center justify-center animate-ping">
                    <Play className="w-8 h-8 text-neon-green fill-current" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-2">
                <p className="font-heading font-extrabold text-2xl text-white">
                  {activeReel.title}
                </p>
                <p className="text-xs text-zinc-300">
                  {activeReel.brandOrArtist} • {activeReel.footfall} • {activeReel.reach}
                </p>
                <div className="pt-2">
                  <Link
                    to="/contact"
                    className="w-full h-11 rounded-xl bg-neon-green text-black font-heading font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    Produce This Vibe For Your Event <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
