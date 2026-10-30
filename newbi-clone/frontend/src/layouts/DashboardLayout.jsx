import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Compass,
  FileCheck2,
  Gift,
  LogOut,
  ExternalLink,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NewbiLogo } from '../components/common/NewbiLogo';

export const DashboardLayout = () => {
  const { user, creatorProfile, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Campaigns', to: '/dashboard/campaigns', icon: Compass },
    { label: 'My Applications', to: '/dashboard/applications', icon: FileCheck2 },
    { label: 'Profile & Stats', to: '/dashboard/profile', icon: User },
    { label: 'Points & Rewards', to: '/dashboard/rewards', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-[#F4F2EC] dark:bg-[#080a0f] text-gray-950 dark:text-white flex transition-colors">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0c0f14] border-r border-gray-950/10 dark:border-white/10 flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-block" onClick={() => setSidebarOpen(false)}>
              <NewbiLogo />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Preview Card */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-neon-green text-black font-heading font-black text-lg flex items-center justify-center shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-extrabold text-sm truncate">{user?.name}</p>
              <p className="font-mono text-xs text-emerald-700 dark:text-neon-green font-bold">
                {user?.points || 1450} Points
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-heading text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-neon-green text-black shadow-md'
                        : 'text-gray-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-950 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-heading text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-all mt-4"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-gray-950/10 dark:border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-gray-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <span>Back to Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-red-500 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-gray-950/10 dark:border-white/10 bg-[#F4F2EC]/90 dark:bg-[#080a0f]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-black/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-heading font-extrabold text-sm sm:text-base hidden sm:inline-block">
              Creator Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Points Indicator */}
            <Link
              to="/dashboard/rewards"
              className="h-10 px-3.5 rounded-full bg-neon-green/20 text-emerald-800 dark:text-neon-green font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-neon-green/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user?.points || 1450} PTS</span>
            </Link>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Switch theme"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Avatar */}
            <Link to="/dashboard/profile" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-950 dark:bg-white text-white dark:text-black font-heading font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.[0] || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
