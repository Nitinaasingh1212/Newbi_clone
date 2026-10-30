import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const ContactForm = () => {
  const [audience, setAudience] = useState('brand');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    budget: '',
    timeline: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const audienceOptions = [
    { value: 'brand', label: 'Brand' },
    { value: 'college', label: 'College' },
    { value: 'artist', label: 'Artist / manager' },
    { value: 'other', label: 'Something else' },
  ];

  const budgetOptions = [
    'Under ₹2 Lakhs',
    '₹2 Lakhs - ₹5 Lakhs',
    '₹5 Lakhs - ₹15 Lakhs',
    '₹15 Lakhs - ₹50 Lakhs',
    '₹50 Lakhs+',
    'Flexible / Exploring',
  ];

  const timelineOptions = [
    'Immediately (this month)',
    'Next month',
    'Within 2-3 months',
    'Later this year',
    'Planning ahead for next year',
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, email, and project idea.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.submitContact({
        audience,
        ...formData,
      });

      if (res.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          organization: '',
          budget: '',
          timeline: '',
          message: '',
        });
      } else {
        setErrorMessage(res.message || 'Error sending enquiry');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="enquire"
      aria-labelledby="enquire-title"
      className="scroll-mt-20 py-24 md:py-36 border-t border-gray-950/10 dark:border-white/10"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Sticky Title */}
        <div className="lg:sticky lg:top-28 self-start">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ring-inset backdrop-blur-md bg-white/60 text-gray-700 ring-black/[0.06] dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10">
            <span
              className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(61,240,61,0.9)]"
              aria-hidden="true"
            />
            <span className="text-gray-950 dark:text-white">07</span>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            Work with us
          </p>

          <h2
            id="enquire-title"
            className="mt-5 font-heading font-black tracking-[-0.03em] leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-gray-950 dark:text-white"
          >
            Let's make{' '}
            <span className="nb-sticker inline-block nb-sticker-sm">
              noise.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-zinc-400 max-w-xl">
            A fest, a show, a creator campaign or something in between. Tell us what you have in mind and the team replies by email within one working day.
          </p>

          <div className="mt-8 p-6 rounded-2xl border border-gray-950/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-neon-green flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Direct Line
            </p>
            <p className="mt-2 font-heading font-extrabold text-xl text-gray-950 dark:text-white">
              crew@newbi.live
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
              Hubs in Mumbai, Delhi NCR &amp; Bengaluru
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div>
          <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white dark:bg-white/[0.03] border border-black/[0.07] dark:border-white/[0.08] shadow-xl">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-neon-green/20 text-black dark:text-neon-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-neon-green" />
                  </div>
                  <h3 className="font-heading font-extrabold text-3xl text-gray-950 dark:text-white">
                    Brief received!
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-400 max-w-md mx-auto text-base">
                    Thanks for reaching out. The Newbi crew has received your enquiry and will reply by email with ideas and a timeline within 24 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2.5 rounded-full border border-gray-950/20 dark:border-white/20 font-heading text-sm font-bold text-gray-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* Audience Selector Pills */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-zinc-200 mb-2">
                      I'm a
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {audienceOptions.map((opt) => {
                        const selected = audience === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setAudience(opt.value)}
                            className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-all ${
                              selected
                                ? 'bg-black text-white dark:bg-neon-green dark:text-black border-black dark:border-neon-green shadow-sm'
                                : 'bg-white dark:bg-white/[0.04] text-gray-800 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="form-name" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                        Your name *
                      </label>
                      <input
                        id="form-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Kabir Roy"
                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                      />
                    </div>

                    <div>
                      <label htmlFor="form-email" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                        Email *
                      </label>
                      <input
                        id="form-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                      />
                    </div>

                    <div>
                      <label htmlFor="form-phone" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                        Phone <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <input
                        id="form-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98..."
                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                      />
                    </div>

                    <div>
                      <label htmlFor="form-org" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                        Brand, college or organization <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <input
                        id="form-org"
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="e.g. Red Bull / IIT Delhi"
                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                      />
                    </div>

                    <div>
                      <label htmlFor="form-budget" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                        Budget range <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <select
                        id="form-budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60 cursor-pointer"
                      >
                        <option value="">Choose a range</option>
                        {budgetOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="form-timeline" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                        When <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <select
                        id="form-timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60 cursor-pointer"
                      >
                        <option value="">Choose a timeline</option>
                        {timelineOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="form-message" className="block text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1.5">
                      What are you planning? *
                    </label>
                    <textarea
                      id="form-message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="A few lines on the idea, the city or campus, and approximate dates."
                      className="w-full p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-base text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green/60 resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-neon-green text-black text-base font-extrabold hover:brightness-95 active:scale-[0.98] transition shadow-[0_0_20px_rgba(61,240,61,0.3)] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending enquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Send enquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
