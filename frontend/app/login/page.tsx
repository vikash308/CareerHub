'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser } from '../../store/authSlice';

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40 pointer-events-none">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40 pointer-events-none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] text-white">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const inputBase =
  'w-full pl-12 pr-4 py-3.5 bg-white/[0.07] border border-white/10 rounded-xl text-white text-[0.9375rem] placeholder-white/30 outline-none transition-all duration-200 hover:border-indigo-500/50 hover:bg-white/10 focus:border-indigo-500 focus:bg-indigo-500/10 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed';
const inputError = 'border-red-400/70 bg-red-500/[0.08]';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const loading = useAppSelector((state) => state.auth.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await dispatch(
        loginUser({ email: email.trim().toLowerCase(), password })
      ).unwrap();

      toast.success(`Welcome back, ${result.user?.name ?? 'User'}`);
      router.push('/');
    } catch (errMsg) {
      toast.error(errMsg as string);
    }
  };

  return (
    <>
      {/* Animated background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 overflow-hidden" aria-hidden="true">
        <div className="blob-1 absolute -top-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="blob-2 absolute -bottom-[20%] -right-[10%] w-[55%] h-[55%] rounded-full bg-violet-500/25 blur-3xl" />
        <div className="blob-3 absolute top-1/2 left-1/2 w-[40%] h-[40%] rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
        <div className="fade-in-up w-full max-w-[440px] bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] px-10 py-12">

          {/* Brand */}
          <div className="fade-in-up fade-in-up-delay-1 flex items-center justify-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
              <BriefcaseIcon />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
              CareerHub
            </span>
          </div>

          {/* Heading */}
          <div className="fade-in-up fade-in-up-delay-2 text-center mb-9">
            <h1 className="text-[1.625rem] font-bold text-white tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-white/50 text-[0.9375rem]">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <div className="fade-in-up fade-in-up-delay-2">
              <label htmlFor="login-email" className="block text-[0.8125rem] font-semibold text-white/70 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <EmailIcon />
                <input
                  id="login-email"
                  type="email"
                  className={`${inputBase} ${errors.email ? inputError : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[0.8125rem] text-red-300 flex items-center gap-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="fade-in-up fade-in-up-delay-3">
              <label htmlFor="login-password" className="block text-[0.8125rem] font-semibold text-white/70 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <LockIcon />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputBase} pr-12 ${errors.password ? inputError : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[0.8125rem] text-red-300">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="fade-in-up fade-in-up-delay-4 mt-1">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-base tracking-wide shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(99,102,241,0.45)] active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="fade-in-up fade-in-up-delay-4 flex items-center gap-3 my-7 text-white/30 text-[0.8125rem]">
            <span className="flex-1 h-px bg-white/10" />
            <span>Don&apos;t have an account?</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          {/* Link to register */}
          <div className="fade-in-up fade-in-up-delay-5 text-center text-[0.9375rem] text-white/55">
            New to CareerHub?{' '}
            <Link href="/register" className="text-indigo-300 font-semibold hover:text-indigo-400 transition-colors">
              Create your account
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
