import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, KeyRound, Sparkles, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN 🇮🇳' },
  { code: '+1', country: 'US 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+61', country: 'AU 🇦🇺' },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPasswordPhone, resetPasswordPhone, forgotPasswordEmailOTP, resetPasswordEmailOTP } = useAuth();

  // Reset Method: 'email' | 'phone'
  const [resetMethod, setResetMethod] = useState('email');

  // Input states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Step 2 states
  const [otpSent, setOtpSent] = useState(false);
  const [resetOTP, setResetOTP] = useState('');
  const [demoResetOTP, setDemoResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Send Reset Code
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMethod === 'email') {
        if (!email) {
          toast.error('Please enter your email address');
          setLoading(false);
          return;
        }
        const res = await forgotPasswordEmailOTP(email);
        if (res.debugOTP) {
          setDemoResetOTP(res.debugOTP);
          setResetOTP(res.debugOTP);
          toast.success(`Demo OTP Generated: ${res.debugOTP}`, { duration: 6000 });
        } else {
          toast.success(res.message || `Reset code sent to ${email}`);
        }
      } else {
        if (!phone) {
          toast.error('Please enter your phone number');
          setLoading(false);
          return;
        }
        const res = await forgotPasswordPhone(phone, countryCode);
        if (res.debugOTP) {
          setDemoResetOTP(res.debugOTP);
          setResetOTP(res.debugOTP);
          toast.success(`Demo OTP Generated: ${res.debugOTP}`, { duration: 6000 });
        } else {
          toast.success(res.message || `Reset code sent to ${phone}`);
        }
      }
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetOTP || !newPassword) {
      toast.error('Please enter the OTP and new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (resetMethod === 'email') {
        await resetPasswordEmailOTP({
          email: email.trim(),
          otp: resetOTP.trim(),
          password: newPassword,
        });
      } else {
        await resetPasswordPhone({
          phone: phone.trim(),
          countryCode,
          otp: resetOTP.trim(),
          password: newPassword,
        });
      }

      toast.success('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Verify your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOTP = () => {
    if (demoResetOTP) {
      navigator.clipboard.writeText(demoResetOTP);
      setCopied(true);
      toast.success('OTP copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-amber-500/10 rounded-2xl items-center justify-center text-amber-500 shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white flex items-center justify-center space-x-1">
            <span>Reset Password</span>
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </h2>
          <p className="text-xs text-slate-400">
            {!otpSent ? 'Select method to receive your password reset verification code' : 'Enter the code and set your new password'}
          </p>
        </div>

        {!otpSent ? (
          <div className="space-y-4">
            {/* Toggle Method Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setResetMethod('email')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  resetMethod === 'email'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Via Email</span>
              </button>
              <button
                type="button"
                onClick={() => setResetMethod('phone')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  resetMethod === 'phone'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Via Phone</span>
              </button>
            </div>

            <form onSubmit={handleSendResetCode} className="space-y-4">
              {resetMethod === 'email' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-450 font-bold uppercase">Registered Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="customer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-450 font-bold uppercase">Registered Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-3 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.country})
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Sending Reset OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {/* Demo OTP Banner if generated in local/demo gateway mode */}
            <AnimatePresence>
              {demoResetOTP && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-center space-y-1 relative"
                >
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-amber-500">
                    Demo Mode Verification Code
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl font-black tracking-widest text-amber-400 font-mono">
                      {demoResetOTP}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOTP}
                      className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Use this code to complete password verification.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold uppercase">Enter 6-Digit OTP Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="••••••"
                value={resetOTP}
                onChange={(e) => setResetOTP(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-center text-xl tracking-widest font-black text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold uppercase">New Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-semibold"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold uppercase">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-semibold"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>{loading ? 'Resetting Password...' : 'Verify OTP & Save Password'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setResetOTP('');
                setDemoResetOTP('');
              }}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              ← Change {resetMethod === 'email' ? 'Email' : 'Phone'} or Try Again
            </button>
          </form>
        )}

        {/* Back to Login Footer */}
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          Remember your password?{' '}
          <Link to="/login" className="text-amber-500 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
