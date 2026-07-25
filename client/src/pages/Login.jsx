import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Shirt, Eye, EyeOff, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, forgotPasswordPhone, resetPasswordPhone, forgotPasswordEmailOTP, resetPasswordEmailOTP } = useAuth();

  // Unified Login State
  const [identifier, setIdentifier] = useState(''); // Email or Phone Number
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot / Reset Password Modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState('');
  const [resetCountryCode, setResetCountryCode] = useState('+91');
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

  // Unified Submit Handler (Email OR Phone Number + Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter your email or phone number and password');
      return;
    }

    setLoading(true);
    try {
      await login(identifier, password);
      toast.success('Logged in successfully!');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Reset Handler (Always resets loading state reliably)
  const handleSendResetCode = async () => {
    if (!resetTarget) {
      toast.error('Please enter your email address or phone number');
      return;
    }

    setResetLoading(true);
    try {
      const isEmail = resetTarget.includes('@');
      if (isEmail) {
        const res = await forgotPasswordEmailOTP(resetTarget.trim());
        toast.success(res.message || `Reset code sent to ${resetTarget}`);
      } else {
        const res = await forgotPasswordPhone(resetTarget.trim(), resetCountryCode);
        toast.success(res.message || `Reset code sent to ${resetTarget}`);
      }
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code. Verify your entry.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
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
      const isEmail = resetTarget.includes('@');
      if (isEmail) {
        await resetPasswordEmailOTP({
          email: resetTarget.trim(),
          otp: resetOTP.trim(),
          password: newPassword,
        });
      } else {
        await resetPasswordPhone({
          phone: resetTarget.trim(),
          countryCode: resetCountryCode,
          otp: resetOTP.trim(),
          password: newPassword,
        });
      }

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
          <div className="inline-flex h-12 w-12 bg-amber-500/10 rounded-2xl items-center justify-center text-amber-500 shadow-inner">
            <Shirt className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white flex items-center justify-center space-x-1">
            <span>Welcome back</span>
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </h2>
          <p className="text-xs text-slate-400">Sign in with your Email Address or Phone Number</p>
        </div>

        {/* UNIFIED LOGIN FORM (EMAIL OR PHONE) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-450 font-bold uppercase">Email Address or Phone Number</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="customer@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-450 font-bold uppercase">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold uppercase text-amber-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
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
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Developer Demo Credentials Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-xs text-slate-500 space-y-1.5">
          <p className="font-extrabold uppercase text-slate-450 tracking-wider">Demo Credentials:</p>
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
                  <span>Reset Password</span>
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
                      Enter Email Address or Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="user@example.com or 9876543210"
                      value={resetTarget}
                      onChange={(e) => setResetTarget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendResetCode}
                    disabled={resetLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Enter 6-Digit OTP Code</label>
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
