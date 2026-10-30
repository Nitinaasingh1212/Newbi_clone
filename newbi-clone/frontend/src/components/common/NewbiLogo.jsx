import React from 'react';

export const NewbiLogo = ({ className = 'h-7 w-auto' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <span className="font-heading font-black tracking-tighter text-2xl md:text-3xl uppercase text-gray-950 dark:text-white flex items-center">
        NEWBI
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-green ml-1 shadow-[0_0_10px_rgba(61,240,61,0.8)]"></span>
      </span>
      <span className="font-mono text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-600 dark:text-zinc-400">
        LIVE
      </span>
    </div>
  );
};

export const NewbiIcon = ({ className = 'w-12 h-12' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-neon-green/20 blur-md"></div>
      <div className="relative w-full h-full rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-black flex items-center justify-center font-heading font-black text-2xl shadow-lg border border-neon-green/40">
        N<span className="text-neon-green dark:text-black font-extrabold text-xs ml-0.5">•</span>
      </div>
    </div>
  );
};
