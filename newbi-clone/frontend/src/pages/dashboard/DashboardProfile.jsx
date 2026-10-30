import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Instagram,
  MapPin,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Save,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardProfile = () => {
  const { user, creatorProfile, updateProfileData } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    instagramHandle: creatorProfile?.instagramHandle || '@aarav.live',
    city: creatorProfile?.city || 'Mumbai',
    niche: creatorProfile?.niche?.join(', ') || 'Live Music, College Festivals, Nightlife',
    bio: creatorProfile?.bio || 'Documenting concerts, festivals & underground music scenes across India.',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate/call API
      const updatedUser = { ...user, name: formData.name, phone: formData.phone };
      const updatedProfile = {
        ...creatorProfile,
        instagramHandle: formData.instagramHandle,
        city: formData.city,
        niche: formData.niche.split(',').map((s) => s.trim()),
        bio: formData.bio,
      };

      updateProfileData(updatedUser, updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Banner / Pass Badge */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0f14] border border-gray-950/10 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-neon-green text-black font-heading font-black text-4xl flex items-center justify-center shrink-0 shadow-md">
          {user?.name?.[0] || 'A'}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-950 dark:text-white">
              {user?.name}
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-neon-green text-black font-mono text-[10px] font-extrabold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Verified Creator Pass
            </span>
          </div>

          <p className="font-mono text-xs text-gray-500 dark:text-zinc-400">
            {formData.instagramHandle} • {formData.city} • Joined 2026
          </p>

          <p className="text-sm text-gray-600 dark:text-zinc-300 max-w-xl font-sans pt-1">
            "{formData.bio}"
          </p>
        </div>
      </div>

      {/* Verified Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10">
          <span className="text-[11px] font-mono uppercase text-gray-500 dark:text-zinc-500 font-bold block">
            Audience
          </span>
          <p className="mt-2 font-heading font-black text-2xl text-gray-950 dark:text-white">
            {(creatorProfile?.followersCount || 42500).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-neon-green font-mono">
            Instagram Verified
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10">
          <span className="text-[11px] font-mono uppercase text-gray-500 dark:text-zinc-500 font-bold block">
            Engagement Rate
          </span>
          <p className="mt-2 font-heading font-black text-2xl text-emerald-700 dark:text-neon-green">
            {creatorProfile?.engagementRate || 6.4}%
          </p>
          <span className="text-[10px] text-gray-400 font-mono">Top 5% in music</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10">
          <span className="text-[11px] font-mono uppercase text-gray-500 dark:text-zinc-500 font-bold block">
            Completed Gigs
          </span>
          <p className="mt-2 font-heading font-black text-2xl text-gray-950 dark:text-white">
            {creatorProfile?.totalCompletedCampaigns || 7} Shows
          </p>
          <span className="text-[10px] text-gray-400 font-mono">100% on-time</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10">
          <span className="text-[11px] font-mono uppercase text-gray-500 dark:text-zinc-500 font-bold block">
            Creator Rating
          </span>
          <p className="mt-2 font-heading font-black text-2xl text-amber-500">
            ★ {creatorProfile?.rating || 4.95}
          </p>
          <span className="text-[10px] text-gray-400 font-mono">Brand rated</span>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10 shadow-lg">
        <h2 className="font-heading font-black text-2xl text-gray-950 dark:text-white mb-6">
          Edit Creator Profile
        </h2>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-neon-green/20 border border-neon-green text-emerald-950 dark:text-neon-green text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 dark:text-zinc-300">
                Instagram Handle
              </label>
              <input
                type="text"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 dark:text-zinc-300">
                Primary City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60 cursor-pointer"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
                <option value="Goa">Goa</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 dark:text-zinc-300">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98..."
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 dark:text-zinc-300">
              Content Niches (comma separated)
            </label>
            <input
              type="text"
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700 dark:text-zinc-300">
              Creator Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-12 px-8 rounded-full bg-neon-green text-black font-heading font-extrabold text-sm flex items-center gap-2 hover:brightness-95 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
