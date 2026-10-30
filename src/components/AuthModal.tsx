import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    loginWithPhoneOrDemo,
    language,
    showToast,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'phone' | 'forgot'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Sync with prop when modal opens
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalMode);
      setErrorMessage('');
      setForgotSuccess(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage('');
    setForgotSuccess(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।' : 'Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(language === 'bn' ? 'আপনার পূর্ণ নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(language === 'bn' ? 'সঠিক ইমেইল এড্রেস লিখুন।' : 'Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const res = await register(name, email, password, phone);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || (language === 'bn' ? 'অ্যাকাউন্ট খুলতে সমস্যা হয়েছে।' : 'Registration failed.'));
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'bn' ? 'সঠিক মোবাইল নাম্বার দিন (যেমন: 01723-373133)' : 'Please enter a valid phone number.');
      return;
    }

    loginWithPhoneOrDemo('customer', name || 'Customer', cleanPhone, `${cleanPhone}@ascomputer.com`);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার ইমেইল এড্রেস দিন।' : 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
      }
      setForgotSuccess(true);
      showToast(language === 'bn' ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!' : 'Password reset link sent to your email!', 'info');
    } catch (err: any) {
      console.warn('Reset password error:', err);
      setErrorMessage(
        err?.code === 'auth/user-not-found'
          ? (language === 'bn' ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' : 'No account found with this email.')
          : (language === 'bn' ? 'পাসওয়ার্ড রিসেট লিংক পাঠাতে ব্যর্থ হয়েছে।' : 'Could not send reset email.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={e => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[#08172B] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative p-5 pb-4 bg-gradient-to-r from-[#08172B] via-[#0d223f] to-[#08172B] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF]/40 to-[#00D4FF]/30 p-0.5 flex items-center justify-center shadow-lg shadow-[#168BFF]/30 overflow-hidden">
              <div className="w-full h-full bg-[#08172B] rounded-[10px] overflow-hidden flex items-center justify-center">
                <img
                  src={settings.logoUrl || 'https://i.imgur.com/OfCvr1N.jpeg'}
                  alt="AS Computer Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{language === 'bn' ? 'AS Computer অ্যাকাউন্ট' : 'AS Computer Account'}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'লগইন করে আপনার অর্ডার ট্র্যাক ও নিয়ন্ত্রণ করুন' : 'Sign in to manage orders & tracking'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-900/90 border-b border-slate-800 text-xs font-semibold p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-[#168BFF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লগইন' : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-[#168BFF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন একাউন্ট' : 'Register'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'phone'
                ? 'bg-[#168BFF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ফোন লগইন' : 'Phone'}</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="text-[11px] leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#168BFF] text-white p-2.5 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>{language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-[#00D4FF] hover:underline"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-[#168BFF] text-white p-2.5 pr-10 rounded-xl text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white font-bold transition-all shadow-lg shadow-[#168BFF]/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In Now'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'আপনার নাম *' : 'Full Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="মোঃ আমির হামজা"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#168BFF] text-white p-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'মোবাইল নাম্বার (ঐচ্ছিক)' : 'Phone Number (Optional)'}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01723-373133"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#168BFF] text-white p-2.5 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'ইমেইল এড্রেস *' : 'Email Address *'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#168BFF] text-white p-2.5 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'পাসওয়ার্ড তৈরি করুন (কমপক্ষে ৬ অক্ষর) *' : 'Create Password *'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-[#168BFF] text-white p-2.5 pr-10 rounded-xl text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-1"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি সম্পন্ন করুন' : 'Complete Registration'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. PHONE NUMBER QUICK LOGIN */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-slate-300 space-y-1">
                <p className="font-semibold text-white">
                  {language === 'bn' ? 'পাসওয়ার্ড ছাড়াই মোবাইল নাম্বার দিয়ে সরাসরি প্রবেশ' : 'Instant Sign-In with Phone Number'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn'
                    ? 'আপনার মোবাইল নাম্বারটি দিলে যেকোনো সময় আগের অর্ডার ও ট্র্যাকিং দেখতে পাবেন।'
                    : 'Track orders instantly using your contact phone.'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'আপনার নাম' : 'Your Name'}</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="গ্রাহকের নাম"
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'মোবাইল নাম্বার *' : 'Phone Number *'}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{language === 'bn' ? 'নাম্বার দিয়ে প্রবেশ করুন' : 'Continue with Phone'}</span>
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD TAB */}
          {activeTab === 'forgot' && (
            <div className="space-y-3.5">
              {forgotSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-xs">
                    {language === 'bn' ? 'রিসেট লিংক পাঠানো হয়েছে!' : 'Password Reset Email Sent!'}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {language === 'bn'
                      ? 'আপনার ইমেইলে দেওয়া লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।'
                      : 'Please check your email inbox to reset your password.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="px-4 py-2 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    {language === 'bn' ? 'লগইন পেইজে ফিরুন' : 'Back to Login'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>{language === 'bn' ? 'আপনার রেজিস্টার্ড ইমেইল দিন' : 'Registered Email'}</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1272d4] text-white font-bold flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-slate-400 hover:text-white text-[11px]"
                    >
                      ← {language === 'bn' ? 'লগইনে ফেরত যান' : 'Back to Login'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
