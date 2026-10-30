import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

export const AdminRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    category: 'Event Pass',
    pointsCost: 1000,
    stock: 20,
    description: '',
  });

  useEffect(() => {
    const fetchRewards = async () => {
      const data = await api.getRewards();
      setRewards(data);
    };
    fetchRewards();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const created = {
      ...newReward,
      _id: `r-new-${Date.now()}`,
      claimed: 0,
    };
    setRewards([...rewards, created]);
    setShowAddModal(false);
    setNewReward({
      title: '',
      category: 'Event Pass',
      pointsCost: 1000,
      stock: 20,
      description: '',
    });
  };

  const handleDelete = (id) => {
    setRewards((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            Rewards Catalogue
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Manage festival passes, backstage passes, merch, and electronics in the points store.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-5 rounded-full bg-neon-green text-black font-heading font-extrabold text-xs flex items-center gap-2 hover:scale-105 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Reward Item
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => (
          <div
            key={r._id}
            className="p-6 rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-zinc-300 font-bold uppercase">
                  {r.category}
                </span>
                <span className="font-bold text-gray-500">
                  {r.stock} in stock
                </span>
              </div>

              <h3 className="mt-4 font-heading font-extrabold text-xl text-gray-950 dark:text-white">
                {r.title}
              </h3>

              <p className="mt-2 text-xs text-gray-600 dark:text-zinc-400">
                {r.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-950/10 dark:border-white/10 flex items-center justify-between">
              <span className="font-heading font-black text-lg text-emerald-700 dark:text-neon-green">
                {r.pointsCost} PTS
              </span>
              <button
                onClick={() => handleDelete(r._id)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition"
                title="Remove Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-[#F4F2EC] dark:bg-[#0c0f14] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-gray-950 dark:text-white">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-heading font-black text-2xl mb-4">Add Reward Item</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder="e.g. VIP Backstage Wristband"
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                  >
                    <option value="Event Pass">Event Pass</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Voucher">Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Points Cost *
                  </label>
                  <input
                    type="number"
                    required
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward({ ...newReward, pointsCost: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  value={newReward.stock}
                  onChange={(e) => setNewReward({ ...newReward, stock: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="Ticket access level, gates, etc."
                  className="w-full p-3 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm hover:brightness-95 transition"
              >
                Add to Store
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
