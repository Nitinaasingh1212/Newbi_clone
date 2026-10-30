import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { NewbiLogo } from './NewbiLogo';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-950/10 dark:border-white/10 bg-[#F4F2EC] dark:bg-[#050505] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Info */}
          <div className="space-y-5">
            <Link to="/" aria-label="newbi.live home" className="inline-block">
              <NewbiLogo />
            </Link>
            <p className="max-w-sm text-sm sm:text-base leading-relaxed text-gray-600 dark:text-zinc-400">
              Concerts, college fests, brand activations and creator campaigns across India, planned, produced and run end to end by the Newbi crew.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/newbi.live"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-gray-950/15 dark:border-white/15 flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-neon-green hover:border-black dark:hover:border-neon-green transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/newbi-live"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-gray-950/15 dark:border-white/15 flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-neon-green hover:border-black dark:hover:border-neon-green transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:crew@newbi.live"
                aria-label="Email"
                className="w-10 h-10 rounded-full border border-gray-950/15 dark:border-white/15 flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-neon-green hover:border-black dark:hover:border-neon-green transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white mb-4">
              Explore
            </p>
            <ul className="space-y-2.5 font-heading text-sm text-gray-600 dark:text-zinc-400">
              <li>
                <Link to="/#about" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  About Newbi
                </Link>
              </li>
              <li>
                <Link to="/work" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  Work Archive
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  Work With Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  Contact Crew
                </Link>
              </li>
            </ul>
          </div>

          {/* Join In */}
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white mb-4">
              Join In
            </p>
            <ul className="space-y-2.5 font-heading text-sm text-gray-600 dark:text-zinc-400">
              <li>
                <Link to="/creator" className="hover:text-neon-green transition-colors flex items-center gap-1">
                  Creators Network <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  Community Guestlists
                </Link>
              </li>
              <li>
                <Link to="/work" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  ConcertZone
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                  Creator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Operations */}
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white mb-4">
              Legal & Info
            </p>
            <ul className="space-y-2.5 font-heading text-sm text-gray-600 dark:text-zinc-400">
              <li>
                <span className="hover:text-gray-950 dark:hover:text-white cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-gray-950 dark:hover:text-white cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-gray-950 dark:hover:text-white cursor-pointer transition-colors">
                  Refund & Pass Policy
                </span>
              </li>
              <li>
                <Link to="/admin" className="text-xs font-mono text-neon-green hover:underline">
                  Crew Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Massive Display Wordmark */}
        <div className="mt-16 pt-8 border-t border-gray-950/10 dark:border-white/10 select-none overflow-hidden text-center">
          <p className="nb-ghost font-heading font-black tracking-[-0.07em] leading-[0.8] text-[15vw] translate-y-[0.1em] text-gray-950 dark:text-white">
            newbi.live
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500 dark:text-zinc-500">
          <p>© 2026 newbi.live. All rights reserved.</p>
          <p>Operated by Newbi Entertainment & Marketing LLP.</p>
        </div>
      </div>
    </footer>
  );
};
