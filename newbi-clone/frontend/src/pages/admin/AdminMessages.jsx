import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Building2, Check, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const AdminMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await api.getContactMessages();
      setMessages(data);
    };
    fetchMessages();
  }, []);

  const handleMarkReplied = (id) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, status: 'replied' } : m))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
          Client &amp; College Enquiries
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Inbound briefs submitted through the Work With Us form across all channels.
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m._id}
            className="p-6 sm:p-8 rounded-3xl border border-gray-950/10 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {m.audience}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <h3 className="font-heading font-black text-2xl text-gray-950 dark:text-white">
                {m.name}
              </h3>

              <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {m.email}</span>
                {m.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {m.phone}</span>}
                {m.organization && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {m.organization}</span>}
              </div>

              <p className="text-sm sm:text-base text-gray-700 dark:text-zinc-300 font-sans leading-relaxed pt-2">
                "{m.message}"
              </p>

              <div className="pt-2 flex flex-wrap gap-3 text-xs font-mono">
                <span className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                  Budget: <strong className="text-neon-green">{m.budget || 'Open'}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                  Timeline: <strong>{m.timeline || 'Flexible'}</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {m.status === 'replied' ? (
                <span className="px-3 py-1.5 rounded-full bg-neon-green/20 text-emerald-800 dark:text-neon-green font-mono text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Replied
                </span>
              ) : (
                <button
                  onClick={() => handleMarkReplied(m._id)}
                  className="px-4 py-2 rounded-xl bg-neon-green text-black font-heading text-xs font-bold hover:brightness-95 transition"
                >
                  Mark as Replied
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
