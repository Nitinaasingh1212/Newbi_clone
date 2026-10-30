import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  Compass,
  FileCheck2,
  Users,
  MessageSquare,
  Gift,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NewbiLogo } from '../components/common/NewbiLogo';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', to: '/admin', icon: BarChart3, end: true },
    { label: 'Campaigns', to: '/admin/campaigns', icon: Compass },
    { label: 'Applications', to: '/admin/applications', icon: FileCheck2 },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Enquiries', to: '/admin/messages', icon: MessageSquare },
    { label: 'Rewards Shop', to: '/admin/rewards', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-[#F4F2EC] dark:bg-[#06080d] text-gray-950 dark:text-white flex transition-colors">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gray-950 text-white dark:bg-[#090c12] border-r border-white/10 flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setSidebarOpen(false)}>
              <NewbiLogo />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Badge */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-green text-black font-heading font-black text-sm flex items-center justify-center shrink-0">
              HQ
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-extrabold text-sm truncate">{user?.name || 'Newbi Admin'}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-neon-green font-bold">
                Platform Admin
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
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
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Options */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:bg-white/5 transition"
          >
            <span>Creator View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-gray-950/10 dark:border-white/10 bg-[#F4F2EC]/90 dark:bg-[#06080d]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-black/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-heading font-black text-sm sm:text-base">
              Newbi Live Command Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="px-3 py-1 rounded-full bg-neon-green/20 text-emerald-800 dark:text-neon-green font-mono text-xs font-bold">
              LIVE SYSTEM
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
