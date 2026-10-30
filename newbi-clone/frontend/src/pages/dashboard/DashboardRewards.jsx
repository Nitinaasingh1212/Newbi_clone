import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardRewards = () => {
  const { user, updateProfileData } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [redeemingId, setRedeemingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRewards = async () => {
      const data = await api.getRewards();
      setRewards(data);
    };
    fetchRewards();
  }, []);

  const handleRedeem = async (reward) => {
    if ((user?.points || 0) < reward.pointsCost) {
      setErrorMessage(
        `Insufficient points! You have ${user?.points || 0} pts, but this reward requires ${reward.pointsCost} pts.`
      );
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    setRedeemingId(reward._id);
    setErrorMessage('');

    try {
      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3DF03D', '#39FF14', '#ffffff', '#000000'],
      });

      const res = await api.redeemReward(reward._id);
      const newPoints = (user?.points || 0) - reward.pointsCost;
      updateProfileData({ ...user, points: newPoints });

      setSuccessMessage(
        `🎉 Successfully redeemed "${reward.title}"! Your digital access code & pass details have been sent to your email.`
      );
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      setErrorMessage(err.message || 'Error redeeming perk');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Points Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gray-950 text-white dark:bg-[#0c0f14] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-neon-green/20 blur-3xl pointer-events-none"
        />

        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-neon-green font-mono text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Newbi Rewards Club
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl">
            Points &amp; Perks Shop
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg">
            Earn points for every approved creator campaign and event coverage. Redeem them directly for VIP passes, exclusive merch, and gear.
          </p>
        </div>

        <div className="text-center sm:text-right p-6 rounded-2xl bg-white/5 border border-white/10 shrink-0 z-10">
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest block">
            Your Balance
          </span>
          <span className="font-heading font-black text-4xl sm:text-5xl text-neon-green block mt-1">
            {user?.points || 1450} <span className="text-sm font-mono text-white">PTS</span>
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-5 rounded-2xl bg-neon-green/20 border border-neon-green text-emerald-950 dark:text-neon-green text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((item) => {
          const canAfford = (user?.points || 0) >= item.pointsCost;
          return (
            <div
              key={item._id}
              className="rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-7 flex flex-col justify-between shadow-sm hover:border-gray-950/30 dark:hover:border-neon-green/40 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-zinc-300 font-bold uppercase">
                    {item.category}
                  </span>
                  <span className="text-gray-400 font-bold">
                    {item.stock} left in stock
                  </span>
                </div>

                <h3 className="mt-4 font-heading font-extrabold text-2xl text-gray-950 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-gray-950/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Cost</span>
                  <span className="font-heading font-black text-xl text-emerald-700 dark:text-neon-green">
                    {item.pointsCost} PTS
                  </span>
                </div>

                <button
                  onClick={() => handleRedeem(item)}
                  disabled={redeemingId === item._id || !canAfford}
                  className={`h-11 px-5 rounded-full font-heading font-extrabold text-xs transition-all shadow-sm ${
                    canAfford
                      ? 'bg-neon-green text-black hover:scale-105 active:scale-95'
                      : 'bg-black/10 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {redeemingId === item._id ? 'Redeeming...' : canAfford ? 'Redeem Pass' : 'Need More Points'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
