import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  FileCheck2,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 142,
    totalCreators: 118,
    totalBrands: 24,
    totalCampaigns: 6,
    activeCampaigns: 6,
    totalApplications: 48,
    pendingApplications: 12,
    totalMessages: 19,
    newMessages: 5,
  });

  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const s = await api.getAdminStats();
      const a = await api.getAllApplications();
      const m = await api.getContactMessages();
      if (s) setStats(s);
      if (a) setApplications(a.slice(0, 5));
      if (m) setMessages(m.slice(0, 5));
    };
    loadData();
  }, []);

  const handleApprove = (appId) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === appId ? { ...app, status: 'approved' } : app))
    );
  };

  const handleReject = (appId) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === appId ? { ...app, status: 'rejected' } : app))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
          System Overview
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Monitor platform activity, pending campaign approvals, and incoming enquiries.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Total Users
            </span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-neon-green" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-gray-950 dark:text-white">
            {stats.totalUsers}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 font-mono">
            {stats.totalCreators} Creators • {stats.totalBrands} Brands
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Active Campaigns
            </span>
            <Compass className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-gray-950 dark:text-white">
            {stats.activeCampaigns}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 font-mono">
            Across 5 major metros
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Pending Reviews
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-amber-500">
            {stats.pendingApplications}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 font-mono">
            Requires crew review
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-bold">
              Inquiries
            </span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-4 font-heading font-black text-4xl text-gray-950 dark:text-white">
            {stats.totalMessages}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 font-mono">
            {stats.newMessages} new from brands &amp; colleges
          </p>
        </div>
      </div>

      {/* Recent Applications Quick Review */}
      <div className="p-7 rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-xl text-gray-950 dark:text-white">
            Recent Creator Applications
          </h2>
          <Link
            to="/admin/applications"
            className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-neon-green hover:underline"
          >
            Manage all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-gray-950/10 dark:border-white/10 font-mono text-[11px] text-gray-400 uppercase">
                <th className="py-3 px-2">Creator</th>
                <th className="py-3 px-2">Campaign</th>
                <th className="py-3 px-2">Reward</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-950/5 dark:divide-white/5">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="py-3 px-2 font-bold text-gray-950 dark:text-white">
                    {app.user?.name || 'Aarav Sharma'}
                    <span className="block text-[11px] font-normal text-gray-400 font-mono">
                      {app.socialHandle || '@aarav.live'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-700 dark:text-zinc-300">
                    {app.campaign?.title || 'Sunburn Arena Delhi'}
                  </td>
                  <td className="py-3 px-2 font-mono font-bold text-emerald-700 dark:text-neon-green">
                    {app.campaign?.reward || '₹28,000 + Passes'}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-neon-green'
                          : app.status === 'rejected'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right space-x-1.5">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(app._id)}
                          className="px-2.5 py-1 rounded-lg bg-neon-green text-black font-heading text-[11px] font-extrabold hover:brightness-95"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app._id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 font-heading text-[11px] font-extrabold hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="font-mono text-xs text-gray-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Contact Enquiries */}
      <div className="p-7 rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-xl text-gray-950 dark:text-white">
            Recent Enquiries &amp; Briefs
          </h2>
          <Link
            to="/admin/messages"
            className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-neon-green hover:underline"
          >
            View all enquiries →
          </Link>
        </div>

        <div className="grid gap-3">
          {messages.map((m) => (
            <div
              key={m._id}
              className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-zinc-300 mr-2">
                  {m.audience}
                </span>
                <span className="font-heading font-extrabold text-sm text-gray-950 dark:text-white">
                  {m.name}
                </span>
                <span className="text-gray-500 dark:text-zinc-400 ml-2">({m.organization || m.email})</span>
                <p className="mt-1 text-gray-600 dark:text-zinc-300 line-clamp-1">{m.message}</p>
              </div>

              <span className="font-mono text-[11px] font-bold text-neon-green shrink-0">
                {m.budget || 'Open Budget'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
