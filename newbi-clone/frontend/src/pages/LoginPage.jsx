import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewbiLogo } from '../components/common/NewbiLogo';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAsDemo, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  const handleDemo = async (role) => {
    const res = await loginAsDemo(role);
    if (res.success) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Headline */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <NewbiLogo />
          </Link>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            Sign in to access your creator passes, briefs, and dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="p-7 sm:p-10 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Password
                </label>
                <span className="text-xs font-mono text-emerald-700 dark:text-neon-green hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition shadow-[0_0_15px_rgba(61,240,61,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Instant Testing */}
          <div className="mt-8 pt-6 border-t border-gray-950/10 dark:border-white/10">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-500 text-center mb-3">
              Fast Demo Sign In
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('creator')}
                className="py-2 px-1 text-center rounded-lg border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-neon-green/40 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-semibold"
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => handleDemo('brand')}
                className="py-2 px-1 text-center rounded-lg border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-neon-green/40 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-semibold"
              >
                Brand
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="py-2 px-1 text-center rounded-lg border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-neon-green/40 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-semibold text-emerald-700 dark:text-neon-green"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-600 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold underline text-gray-950 dark:text-white">
              Join free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
