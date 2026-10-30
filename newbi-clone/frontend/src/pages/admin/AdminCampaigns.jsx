import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, X, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '../../services/api';

export const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    brand: '',
    category: 'Concert',
    description: '',
    location: 'Mumbai',
    eventDate: 'December 2026',
    reward: '₹25,000 + Passes',
    points: 500,
    spotsTotal: 10,
    spotsFilled: 0,
    minFollowers: 5000,
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await api.getCampaigns();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  const handleDelete = (id) => {
    setCampaigns((prev) => prev.filter((c) => c._id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const created = {
      ...newCampaign,
      _id: `c-new-${Date.now()}`,
      status: 'open',
    };
    setCampaigns([created, ...campaigns]);
    setShowAddModal(false);
    setNewCampaign({
      title: '',
      brand: '',
      category: 'Concert',
      description: '',
      location: 'Mumbai',
      eventDate: 'December 2026',
      reward: '₹25,000 + Passes',
      points: 500,
      spotsTotal: 10,
      spotsFilled: 0,
      minFollowers: 5000,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            Campaign Briefs Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Publish new creator campaigns, track slot caps, and manage brand deliverables.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-5 rounded-full bg-neon-green text-black font-heading font-extrabold text-xs flex items-center gap-2 hover:scale-105 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Campaign Brief
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-950/10 dark:border-white/10 font-mono text-[11px] text-gray-400 uppercase bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-3.5 px-4">Title &amp; Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Reward</th>
                <th className="py-3.5 px-4">Spots</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-950/5 dark:divide-white/5">
              {campaigns.map((camp) => (
                <tr key={camp._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="py-4 px-4">
                    <p className="font-heading font-extrabold text-gray-950 dark:text-white">
                      {camp.title}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                      Brand: {camp.brand}
                    </p>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold text-[10px] uppercase">
                      {camp.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-700 dark:text-zinc-300">
                    {camp.location}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700 dark:text-neon-green">
                    {camp.reward}
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-700 dark:text-zinc-300">
                    {camp.spotsFilled} / {camp.spotsTotal}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDelete(camp._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F4F2EC] dark:bg-[#0c0f14] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-gray-950 dark:text-white"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="font-heading font-black text-2xl mb-4">Create New Campaign Brief</h2>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    placeholder="e.g. Lollapalooza India VIP Creator Squad"
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCampaign.brand}
                      onChange={(e) => setNewCampaign({ ...newCampaign, brand: e.target.value })}
                      placeholder="e.g. Budweiser / Levi's"
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newCampaign.category}
                      onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                    >
                      <option value="Concert">Concert</option>
                      <option value="Brand Activation">Brand Activation</option>
                      <option value="Campus Fest">Campus Fest</option>
                      <option value="Nightlife">Nightlife</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Reward *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCampaign.reward}
                      onChange={(e) => setNewCampaign({ ...newCampaign, reward: e.target.value })}
                      placeholder="e.g. ₹30,000 + VIP Pass"
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newCampaign.location}
                      onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                      placeholder="Mumbai / Delhi NCR"
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Brief Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    placeholder="Describe deliverables, reel style, and crowd moments..."
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm hover:brightness-95 transition"
                >
                  Publish Campaign Brief
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
