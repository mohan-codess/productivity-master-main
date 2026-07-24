'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SocialAuth from '@/components/auth/SocialAuth';
import { getSiteUrl } from '@/lib/utils/url';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(urlError);
  }, [searchParams]);

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[A-Z]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwStrength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${getSiteUrl()}/dashboard`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#07090E] text-white font-['Inter'] p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      {/* Background Radial Orbs & Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tr from-indigo-600/35 via-purple-600/25 to-pink-500/20 blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-10 right-10 w-[24rem] h-[24rem] rounded-full bg-gradient-to-br from-blue-600/20 via-teal-500/15 to-purple-600/20 blur-[90px] pointer-events-none"
      />

      {/* Modern Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] rounded-3xl bg-[#11141F]/90 backdrop-blur-2xl border border-white/15 p-7 sm:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.7),0_2px_8px_rgba(255,255,255,0.06)_inset]"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.5)] border border-white/20 mb-3">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-['Outfit'] tracking-tight text-white">
            Productivity Master
          </h1>
          <p className="text-[13.5px] text-white/60 mt-1">
            Start tracking habits and building streak momentum
          </p>
        </div>

        {/* Tab Switcher (Sign In / Create Account) */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/12 mb-6">
          <Link
            href="/login"
            className="flex-1 py-2.5 text-[13.5px] font-medium rounded-lg text-white/60 hover:text-white hover:bg-white/[0.04] transition-all text-center"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="flex-1 py-2.5 text-[13.5px] font-semibold rounded-lg bg-indigo-600 text-white shadow-[0_2px_10px_rgba(79,70,229,0.4)] transition-all cursor-default text-center"
          >
            Create Account
          </button>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 p-5 rounded-2xl bg-white/[0.04] border border-white/10"
          >
            <div className="w-14 h-14 rounded-full inline-flex items-center justify-center mb-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={30} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5 font-['Outfit'] tracking-tight">
              Account Created!
            </h3>
            <p className="text-[14px] text-white/60">
              Redirecting to your habit dashboard…
            </p>
          </motion.div>
        ) : (
          <>
            {/* Error Alert */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: error ? 1 : 0, height: error ? 'auto' : 0 }}
              className="overflow-hidden"
            >
              {error && (
                <div
                  className="mb-5 p-3.5 rounded-xl flex items-start gap-3 text-xs font-medium"
                  style={{
                    background: error.includes('already registered')
                      ? 'rgba(79, 70, 229, 0.15)'
                      : 'rgba(244, 63, 94, 0.15)',
                    border: `1px solid ${
                      error.includes('already registered')
                        ? 'rgba(79, 70, 229, 0.3)'
                        : 'rgba(244, 63, 94, 0.3)'
                    }`,
                    color: error.includes('already registered') ? '#818cf8' : '#fb7185',
                  }}
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1 leading-relaxed">
                    <span>{error}</span>
                    {error.includes('already registered') && (
                      <Link
                        href="/login"
                        className="text-white font-semibold underline underline-offset-2 hover:text-indigo-300 transition-colors"
                      >
                        Account exists. Log in here &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
              {/* Full Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-white/90 px-0.5">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={17} className="absolute left-3.5 z-10 text-white/50 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    required
                    style={{ paddingLeft: '44px', paddingRight: '16px' }}
                    className="w-full py-2.5 bg-white/[0.07] hover:bg-white/[0.09] focus:bg-white/[0.1] border border-white/15 focus:border-indigo-500 rounded-xl text-white text-[14px] placeholder:text-white/35 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-white/90 px-0.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={17} className="absolute left-3.5 z-10 text-white/50 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    autoComplete="email"
                    required
                    style={{ paddingLeft: '44px', paddingRight: '16px' }}
                    className="w-full py-2.5 bg-white/[0.07] hover:bg-white/[0.09] focus:bg-white/[0.1] border border-white/15 focus:border-indigo-500 rounded-xl text-white text-[14px] placeholder:text-white/35 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-white/90 px-0.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={17} className="absolute left-3.5 z-10 text-white/50 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    className="w-full py-2.5 bg-white/[0.07] hover:bg-white/[0.09] focus:bg-white/[0.1] border border-white/15 focus:border-indigo-500 rounded-xl text-white text-[14px] placeholder:text-white/35 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 z-10 p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-1 px-0.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Password Strength:</span>
                      <span className="font-semibold text-white/90">{pwStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwStrength.score >= 1 ? pwStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwStrength.score >= 2 ? pwStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwStrength.score >= 3 ? pwStrength.color : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold text-[14.5px] bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border border-white/20 shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.5)] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Zap size={16} className="animate-spin" /> Creating Account…
                  </span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={17} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                Or signup with
              </span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            {/* Google OAuth Button */}
            <SocialAuth loading={loading} setLoading={setLoading} />

            {/* Terms Disclaimer */}
            <p className="text-center mt-5 text-[11.5px] text-white/40 leading-relaxed max-w-[280px] mx-auto">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        )}

        {/* Security Badge */}
        <div className="mt-5 pt-4 border-t border-white/12 flex items-center justify-center gap-4 text-white/40 text-xs">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Free Forever Plan
          </span>
          <span>•</span>
          <span>No Credit Card Required</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090E]" />}>
      <SignupContent />
    </Suspense>
  );
}
