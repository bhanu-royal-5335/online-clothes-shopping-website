import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Shirt, Eye, EyeOff, Sparkles, X, CheckCircle, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN 🇮🇳' },
  { code: '+1', country: 'US 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+61', country: 'AU 🇦🇺' },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginPhone, forgotPasswordPhone, resetPasswordPhone } = useAuth();

  // Login Mode Tab
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'

  // Email form state
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Phone form state
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phonePassword, setPhonePassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot / Reset Password Modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetMethod, setResetMethod] = useState('phone'); // 'phone' | 'email'
  const [resetTarget, setResetTarget] = useState('');
  const [resetOTP, setResetOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  // Email Submit Handler
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !emailPassword) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, emailPassword);
      toast.success('Logged in successfully!');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Phone Submit Handler (NO OTP Required - Password Auth Only)
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !phonePassword) {
      toast.error('Please enter phone number and password');
      return;
    }

    setLoading(true);
    try {
      await loginPhone(phone, countryCode, phonePassword);
      toast.success('Logged in successfully with Phone Number!');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Invalid phone or password.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleSendResetOTP = async () => {
    if (!resetTarget) {
      toast.error('Please enter your phone number or email');
      return;
    }

    setResetLoading(true);
    try {
      if (resetMethod === 'phone') {
        const res = await forgotPasswordPhone(resetTarget, countryCode);
        setOtpSent(true);
        toast.success(res.message || `Reset OTP sent to ${resetTarget}`);
      } else {
        await axios.post('/api/auth/forgot-password', { email: resetTarget });
        toast.success('Password reset instructions sent to your email.');
        setForgotModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordPhone = async (e) => {
    e.preventDefault();
    if (!resetOTP || !newPassword) {
      toast.error('Please enter OTP and new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setResetLoading(true);
    try {
      await resetPasswordPhone({
        phone: resetTarget,
        countryCode,
        otp: resetOTP,
        password: newPassword,
      });

      toast.success('Password reset successfully! Please sign in with your new password.');
      setForgotModalOpen(false);
      setOtpSent(false);
      setResetTarget('');
      setResetOTP('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
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
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-primary-100 dark:bg-primary-950/40 rounded-2xl items-center justify-center text-primary-600 shadow-inner">
            <Shirt className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white flex items-center justify-center space-x-1">
            <span>Welcome back</span>
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </h2>
          <p className="text-xs text-slate-400">Select your preferred login method to sign in</p>
        </div>

        {/* Login Method Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
              loginMethod === 'phone'
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-md border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Phone className="h-4 w-4" />
            <span>Phone Login</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
              loginMethod === 'email'
                ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-md border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Email Login</span>
          </button>
        </div>

        {/* PHONE LOGIN FORM (NO OTP REQUIRED FOR LOGIN) */}
        {loginMethod === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold uppercase">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-450 font-bold uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetMethod('phone');
                    setResetTarget(phone);
                    setForgotModalOpen(true);
                  }}
                  className="text-[10px] font-bold uppercase text-amber-500 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In with Phone'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* EMAIL LOGIN FORM */}
        {loginMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="customer@rainbowfashions.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-450 font-bold uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetMethod('email');
                    setResetTarget(email);
                    setForgotModalOpen(true);
                  }}
                  className="text-[10px] font-bold uppercase text-primary-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl shadow-md shadow-primary-500/10 hover:scale-102 transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In with Email'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Demo Credentials Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-xs text-slate-500 space-y-1.5">
          <p className="font-extrabold uppercase text-slate-450 tracking-wider">Developer Demo Credentials:</p>
          <p>• Customer: <span className="font-semibold text-slate-700 dark:text-slate-300">customer@rainbowfashions.com</span> (pw: <span className="font-mono">customer123password</span>)</p>
          <p>• Admin: <span className="font-semibold text-slate-700 dark:text-slate-300">bhanuroyal177@gmail.com</span> (pw: <span className="font-mono">admin123password</span>)</p>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-amber-500 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </motion.div>

      {/* Forgot / Reset Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setForgotModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  <span>Reset Password ({resetMethod === 'phone' ? 'Phone OTP' : 'Email'})</span>
                </h3>
                <button
                  onClick={() => setForgotModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">
                      {resetMethod === 'phone' ? 'Enter Phone Number' : 'Enter Email Address'}
                    </label>
                    <input
                      type={resetMethod === 'phone' ? 'tel' : 'email'}
                      placeholder={resetMethod === 'phone' ? '9876543210' : 'user@example.com'}
                      value={resetTarget}
                      onChange={(e) => setResetTarget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleSendResetOTP}
                    disabled={resetLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow"
                  >
                    {resetLoading ? 'Sending...' : resetMethod === 'phone' ? 'Send 6-Digit Reset OTP' : 'Send Email Reset Link'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordPhone} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={resetOTP}
                      onChange={(e) => setResetOTP(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-center text-lg tracking-widest font-extrabold text-amber-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow mt-2"
                  >
                    {resetLoading ? 'Resetting...' : 'Verify OTP & Save Password'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
