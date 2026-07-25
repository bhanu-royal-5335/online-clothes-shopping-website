import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, Sparkles, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPasswordEmailOTP, resetPasswordEmailOTP } = useAuth();

  // Input states
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Send Reset OTP to Email
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPasswordEmailOTP(email.trim());
      toast.success(res.message || `Verification code sent to ${email}`);
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Save New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetOTP || !newPassword) {
      toast.error('Please enter the 6-digit OTP code and new password');
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
      await resetPasswordEmailOTP({
        email: email.trim(),
        otp: resetOTP.trim(),
        password: newPassword,
      });

      toast.success('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Please check your OTP code.');
    } finally {
      setLoading(false);
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
            {!otpSent
              ? 'Enter your registered email address to receive a 6-digit verification code'
              : 'Enter the 6-digit code sent to your email inbox and set your new password'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendResetCode} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending OTP Email...' : 'Send Verification OTP'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-semibold"
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

            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold uppercase">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-semibold"
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
              }}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors pt-1"
            >
              ← Change Email or Resend OTP
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
