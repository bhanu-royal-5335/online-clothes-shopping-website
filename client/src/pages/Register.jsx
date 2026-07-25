import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shirt, Eye, EyeOff, Sparkles, Phone, ShieldCheck, X, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN 🇮🇳' },
  { code: '+1', country: 'US 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+61', country: 'AU 🇦🇺' },
];

const Register = () => {
  const navigate = useNavigate();
  const { user, sendRegistrationOTP, verifyRegistrationOTPAndRegister, register } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Verification Modal State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (showOTPModal && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showOTPModal, resendTimer]);

  // Handle Form Submission (Step 1: Validate & Send OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !phone || !password || !confirmPassword) {
      toast.error('Please enter all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Send OTP to phone
      const data = await sendRegistrationOTP(phone, countryCode);
      toast.success(data.message || `OTP sent to ${countryCode}${phone}`);
      setShowOTPModal(true);
      setResendTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please check phone number.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Account Creation
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setVerifyingOTP(true);
    try {
      await verifyRegistrationOTPAndRegister({
        name,
        email: email || undefined,
        phone,
        countryCode,
        password,
        otp: otpCode,
      });

      toast.success('Account created & phone verified successfully!');
      setShowOTPModal(false);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP. Try again.');
    } finally {
      setVerifyingOTP(false);
    }
  };

  // Resend OTP Handler
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      const data = await sendRegistrationOTP(phone, countryCode);
      toast.success('New OTP sent to your phone');
      setResendTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
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
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-amber-500/10 rounded-2xl items-center justify-center text-amber-500">
            <Shirt className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white flex items-center justify-center space-x-1">
            <span>Create Account</span>
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </h2>
          <p className="text-xs text-slate-400">Join Rainbow Fashions with Phone & OTP Verification</p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-450 font-bold uppercase">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-450 font-bold uppercase">Phone Number (OTP Verification) *</label>
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-450 font-bold uppercase">Email Address (Optional)</label>
            <div className="relative">
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-450 font-bold uppercase">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-450 font-bold uppercase">Confirm Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition-all duration-200 mt-2"
          >
            {loading ? 'Sending OTP Code...' : 'Create Account & Verify Phone'}
          </button>
        </form>

        {/* Footnote */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 font-bold hover:underline">
            Login Here
          </Link>
        </div>
      </motion.div>

      {/* STEP 2: 6-DIGIT OTP VERIFICATION MODAL */}
      <AnimatePresence>
        {showOTPModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOTPModal(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display">Verify Phone Number</h3>
                    <p className="text-[10px] text-slate-400">OTP sent to {countryCode} {phone}</p>
                  </div>
                </div>
                <button onClick={() => setShowOTPModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4 text-center">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="_ _ _ _ _ _"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-amber-500/40 rounded-2xl py-3 text-center text-2xl tracking-[0.5em] font-extrabold text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingOTP}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{verifyingOTP ? 'Verifying Code...' : 'Verify OTP & Complete Registration'}</span>
                </button>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-850">
                  <span>Didn&apos;t get the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className={`font-bold flex items-center space-x-1 ${
                      resendTimer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-amber-500 hover:underline'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resendTimer > 0 ? '' : 'animate-spin'}`} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
