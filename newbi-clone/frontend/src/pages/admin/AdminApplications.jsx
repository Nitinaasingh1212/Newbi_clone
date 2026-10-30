import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Check, Eye } from 'lucide-react';
import { api } from '../../services/api';

export const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchApps = async () => {
      const data = await api.getAllApplications();
      setApplications(data);
    };
    fetchApps();
  }, []);

  const handleUpdateStatus = async (appId, status) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === appId ? { ...app, status } : app))
    );
    await api.updateApplicationStatus(appId, { status });
  };

  const filtered =
    filter === 'All'
      ? applications
      : applications.filter((a) => a.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
          Creator Applications Review
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Review pitches, verify Instagram audience credentials, and issue show wristbands.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
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

      {/* Applications Table */}
      <div className="rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-950/10 dark:border-white/10 font-mono text-[11px] text-gray-400 uppercase bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-3.5 px-4">Creator</th>
                <th className="py-3.5 px-4">Campaign &amp; Brand</th>
                <th className="py-3.5 px-4">Pitch / Note</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-950/5 dark:divide-white/5">
              {filtered.map((app) => (
                <tr key={app._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="py-4 px-4">
                    <p className="font-heading font-extrabold text-gray-950 dark:text-white">
                      {app.user?.name || 'Aarav Sharma'}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                      {app.socialHandle || '@aarav.live'} • {app.user?.points} pts
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {app.campaign?.title || 'Sunburn Arena Delhi'}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-700 dark:text-neon-green font-bold">
                      {app.campaign?.reward}
                    </p>
                  </td>

                  <td className="py-4 px-4 text-xs text-gray-600 dark:text-zinc-400 max-w-xs truncate">
                    "{app.pitch || 'Excited to deliver high quality coverage!'}"
                  </td>

                  <td className="py-4 px-4">
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

                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-neon-green text-black font-heading text-xs font-bold hover:brightness-95 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 font-heading text-xs font-bold hover:bg-red-500/20 transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
