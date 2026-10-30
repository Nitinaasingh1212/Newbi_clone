import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import { api } from '../../services/api';

export const DashboardApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [activeProofModal, setActiveProofModal] = useState(null);
  const [reelLink, setReelLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      const data = await api.getMyApplications();
      setApplications(data);
    };
    fetchApps();
  }, []);

  const filtered =
    filter === 'All'
      ? applications
      : applications.filter((a) => a.status.toLowerCase() === filter.toLowerCase());

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-neon-green font-mono text-[10px] font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'content_submitted':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Proof In Review
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full bg-neon-green text-black font-mono text-[10px] font-bold uppercase flex items-center gap-1">
            <Check className="w-3 h-3" /> Completed &amp; Paid
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
    }
  };

  const handleProofSubmit = (e) => {
    e.preventDefault();
    if (!reelLink.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      setApplications((prev) =>
        prev.map((app) =>
          app._id === activeProofModal._id
            ? { ...app, status: 'content_submitted', contentLinks: [reelLink] }
            : app
        )
      );
      setSubmitting(false);
      setProofSuccess(true);
      setTimeout(() => {
        setActiveProofModal(null);
        setProofSuccess(false);
        setReelLink('');
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
          My Applications &amp; Deliverables
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Track campaign approvals, tickets, pass issuance, and submit proof of your reels.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Approved', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all ${
              filter === tab
                ? 'bg-neon-green text-black shadow-sm'
                : 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="p-6 sm:p-8 rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(item.status)}
                <span className="font-mono text-xs text-gray-500 dark:text-zinc-400">
                  {item.campaign?.category} • {item.campaign?.location}
                </span>
              </div>

              <h3 className="font-heading font-black text-2xl text-gray-950 dark:text-white">
                {item.campaign?.title}
              </h3>

              <p className="text-xs font-mono text-gray-500 dark:text-zinc-500 font-bold">
                Brand: {item.campaign?.brand} | Compensation: {item.campaign?.reward}
              </p>

              {item.adminNotes && (
                <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/20 text-xs font-mono text-emerald-900 dark:text-neon-green">
                  Crew Note: {item.adminNotes}
                </div>
              )}

              {item.contentLinks?.length > 0 && (
                <div className="text-xs font-mono text-gray-500 dark:text-zinc-400 flex items-center gap-2 pt-1">
                  <span>Submitted Reel:</span>
                  <a
                    href={item.contentLinks[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 dark:text-neon-green hover:underline flex items-center gap-1"
                  >
                    View Post <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              {item.status === 'approved' && (
                <button
                  onClick={() => setActiveProofModal(item)}
                  className="h-11 px-5 rounded-full bg-neon-green text-black font-heading font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition"
                >
                  <Upload className="w-3.5 h-3.5" /> Submit Reel Proof
                </button>
              )}

              <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-mono text-gray-500 dark:text-zinc-400 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payout: {item.payoutStatus || 'Pending Completion'}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-gray-950/20 dark:border-white/20">
            <p className="font-heading font-bold text-xl text-gray-500 dark:text-zinc-400">
              No applications in this view.
            </p>
          </div>
        )}
      </div>

      {/* Proof Submission Modal */}
      <AnimatePresence>
        {activeProofModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-[#F4F2EC] dark:bg-[#0c0f14] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-gray-950 dark:text-white"
            >
              <button
                onClick={() => setActiveProofModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              {proofSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neon-green/20 text-emerald-600 dark:text-neon-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-black text-xl">Proof Submitted!</h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    The team will verify your reel and initiate compensation within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProofSubmit} className="space-y-4">
                  <div>
                    <h3 className="font-heading font-black text-2xl">Submit Campaign Proof</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      {activeProofModal.campaign?.title}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                      Instagram Reel URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.instagram.com/reel/..."
                      value={reelLink}
                      onChange={(e) => setReelLink(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-mono">
                    Ensure tags @newbi.live and the brand are visible in your reel caption.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm hover:brightness-95 transition"
                  >
                    {submitting ? 'Submitting...' : 'Confirm Submission'}
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
