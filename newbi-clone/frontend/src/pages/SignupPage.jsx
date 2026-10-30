import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewbiLogo } from '../components/common/NewbiLogo';

export const SignupPage = () => {
  const [role, setRole] = useState('creator');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    instagramHandle: '',
    city: 'Mumbai',
    organization: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register({
      ...formData,
      role,
    });

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Error signing up');
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <NewbiLogo />
          </Link>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-950 dark:text-white">
            Join the night.
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            One free account gives you access to paid campaigns, guestlists and gigs.
          </p>
        </div>

        <div className="p-7 sm:p-10 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-950/10 dark:border-white/10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="mb-6 grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setRole('creator')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all ${
                role === 'creator'
                  ? 'bg-neon-green text-black shadow-sm'
                  : 'text-gray-700 dark:text-zinc-300'
              }`}
            >
              I'm a Creator
            </button>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all ${
                role === 'brand'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-gray-700 dark:text-zinc-300'
              }`}
            >
              I'm a Brand / Org
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                Full name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                Email address *
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="aarav@live.com"
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                name="password"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              />
            </div>

            {role === 'creator' ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    name="instagramHandle"
                    value={formData.instagramHandle}
                    onChange={handleChange}
                    placeholder="@aarav.live"
                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60 cursor-pointer"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Goa">Goa</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                  Brand or College Name
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g. Puma India"
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-neon-green text-black font-heading font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition shadow-[0_0_15px_rgba(61,240,61,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account &amp; Get In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline text-gray-950 dark:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
