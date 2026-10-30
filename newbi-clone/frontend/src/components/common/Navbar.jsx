import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Moon,
  Sun,
  UserRound,
  ArrowRight,
  Globe,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NewbiLogo } from './NewbiLogo';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/#about' },
    { label: 'Creators', href: '/creator' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-950/10 dark:border-white/10 bg-[#F4F2EC]/90 dark:bg-[#050505]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center min-h-[44px]" aria-label="newbi.live home">
          <NewbiLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`px-3 xl:px-4 h-11 inline-flex items-center rounded-lg font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  isActive
                    ? 'text-neon-green bg-black/5 dark:bg-white/5'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Toggle */}
          <button
            type="button"
            aria-label="Language"
            className="hidden md:flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="English (India)"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Switch light or dark theme"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User Logged In State vs Sign In */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="h-10 sm:h-11 px-3 sm:px-4 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/80 dark:bg-white/[0.08] ring-1 ring-inset ring-black/10 dark:ring-white/15 text-gray-950 dark:text-white font-heading text-xs sm:text-sm font-bold hover:bg-white dark:hover:bg-white/[0.14] transition-colors"
              >
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
                ) : (
                  <LayoutDashboard className="w-3.5 h-3.5 text-neon-green" />
                )}
                <span>{isAdmin ? 'Admin' : 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                title="Log out"
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex h-10 sm:h-11 px-3 sm:px-4 xl:px-5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/70 dark:bg-white/[0.08] ring-1 ring-inset ring-black/10 dark:ring-white/15 text-gray-950 dark:text-white font-heading text-xs sm:text-sm font-bold hover:bg-white dark:hover:bg-white/[0.14] transition-colors"
            >
              <UserRound className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </Link>
          )}

          {/* "Work with us" Neon Button */}
          <Link
            to="/contact"
            className="hidden sm:inline-flex h-10 sm:h-11 px-3.5 sm:px-4 xl:px-5 whitespace-nowrap items-center rounded-full bg-neon-green text-black font-heading text-xs sm:text-sm font-extrabold hover:scale-[1.03] active:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(61,240,61,0.3)]"
          >
            Work with us
          </Link>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-[#F4F2EC] dark:bg-[#050505] p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400 dark:text-zinc-500">
                Navigation
              </p>
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-950 dark:text-white hover:text-neon-green transition-colors py-2 flex items-center justify-between group"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-neon-green" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-950/10 dark:border-white/10 space-y-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                    <div>
                      <p className="font-heading font-bold text-sm">{user?.name}</p>
                      <p className="font-mono text-xs text-gray-500 dark:text-zinc-400">{user?.role} • {user?.points} pts</p>
                    </div>
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-full bg-neon-green text-black font-heading text-xs font-bold"
                    >
                      Dashboard
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full h-12 rounded-xl border border-red-500/30 text-red-500 font-heading text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-12 flex items-center justify-center rounded-xl border border-gray-950/20 dark:border-white/20 font-heading text-sm font-bold text-gray-950 dark:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-12 flex items-center justify-center rounded-xl bg-neon-green text-black font-heading text-sm font-bold"
                  >
                    Join free
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 text-xs font-mono text-gray-500 dark:text-zinc-500">
                <span>© 2026 newbi.live</span>
                <span className="flex items-center gap-1 text-neon-green">
                  <Sparkles className="w-3.5 h-3.5" /> Young India
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
