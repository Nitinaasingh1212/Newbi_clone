import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  FileCheck2,
  CheckCircle2,
  Gift,
  ArrowRight,
  MapPin,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardOverview = () => {
  const { user, creatorProfile } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [cData, aData] = await Promise.all([
        api.getCampaigns(),
        api.getMyApplications(),
      ]);
      setCampaigns(cData);
      setApplications(aData);
    };
    loadData();
  }, []);

  const approvedCount = applications.filter((a) => a.status === 'approved' || a.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white dark:bg-[#0c0f14] border border-white/10 p-8 sm:p-10 shadow-2xl">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-neon-green/20 blur-3xl pointer-events-none"
        />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-neon-green font-mono text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Verified Creator
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Hey, {user?.name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="mt-3 text-zinc-300 text-sm sm:text-base leading-relaxed">
            You're currently matched with {campaigns.length} live campaign briefs across concerts, fests, and brand activations in {creatorProfile?.city || 'India'}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/dashboard/campaigns"
              className="h-12 px-6 rounded-full bg-neon-green text-black font-heading font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 hover:scale-[1.02] transition"
            >
              Browse Open Briefs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard/rewards"
              className="h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition"
            >
              Points Shop ({user?.points || 1450} pts)
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Open Briefs
            </span>
            <Compass className="w-4 h-4 text-emerald-600 dark:text-neon-green" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-gray-950 dark:text-white">
            {campaigns.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Available to apply today
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Applications
            </span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-gray-950 dark:text-white">
            {applications.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            {applications.filter((a) => a.status === 'pending').length} pending review
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Approved Gigs
            </span>
            <CheckCircle2 className="w-4 h-4 text-neon-green" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-gray-950 dark:text-white">
            {approvedCount}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Passes &amp; payouts confirmed
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Rewards Balance
            </span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-emerald-700 dark:text-neon-green">
            {user?.points || 1450}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Eligible for 4 festival passes
          </p>
        </div>
      </div>

      {/* Recommended Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-gray-950 dark:text-white">
              Recommended for your niche
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Matched by city ({creatorProfile?.city || 'Mumbai'}) and music/lifestyle niche
            </p>
          </div>
          <Link
            to="/dashboard/campaigns"
            className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-neon-green hover:underline"
          >
            View all briefs →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.slice(0, 3).map((camp) => (
            <div
              key={camp._id}
              className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] flex flex-col justify-between shadow-sm hover:border-gray-950/30 dark:hover:border-neon-green/40 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded bg-neon-green/20 text-emerald-800 dark:text-neon-green font-bold">
                    {camp.category}
                  </span>
                  <span className="text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {camp.location}
                  </span>
                </div>
                <h3 className="mt-3 font-heading font-bold text-xl text-gray-950 dark:text-white leading-snug">
                  {camp.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-gray-500 dark:text-zinc-500">
                  {camp.brand}
                </p>
                <p className="mt-3 text-xs text-gray-600 dark:text-zinc-400 line-clamp-2">
                  {camp.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-950/10 dark:border-white/10 flex items-center justify-between">
                <span className="font-heading font-extrabold text-sm text-neon-green">
                  {camp.reward}
                </span>
                <Link
                  to="/dashboard/campaigns"
                  className="h-9 px-4 rounded-full bg-neon-green text-black font-heading font-bold text-xs flex items-center justify-center hover:scale-105 transition"
                >
                  Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
