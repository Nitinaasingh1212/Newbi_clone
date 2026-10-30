import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserCheck, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await api.getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleAddPoints = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, points: (u.points || 0) + 100 } : u))
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            User Accounts &amp; Creators
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Directory of registered creators, brand leads, and platform administrators.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2">
        {['all', 'creator', 'brand', 'admin'].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold capitalize transition-all ${
              roleFilter === role
                ? 'bg-neon-green text-black shadow-sm'
                : 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300'
            }`}
          >
            {role === 'all' ? 'All Roles' : `${role}s`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-950/10 dark:border-white/10 font-mono text-[11px] text-gray-400 uppercase bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Points</th>
                <th className="py-3.5 px-4 text-right">Credit Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-950/5 dark:divide-white/5">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="py-4 px-4 font-bold text-gray-950 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neon-green/20 text-black dark:text-neon-green flex items-center justify-center font-heading font-extrabold text-xs">
                      {u.name?.[0]}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-600 dark:text-zinc-400">
                    {u.email}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-500'
                          : u.role === 'brand'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-neon-green'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700 dark:text-neon-green">
                    {u.points || 0} PTS
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleAddPoints(u._id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-950/20 dark:border-white/20 font-heading text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                      +100 PTS
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
