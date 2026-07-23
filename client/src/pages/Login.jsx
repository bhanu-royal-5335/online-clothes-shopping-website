import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Shirt, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all credentials');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-lg space-y-6"
      >
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-primary-100 dark:bg-primary-950/40 rounded-full items-center justify-center text-primary-600">
            <Shirt className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center space-x-1">
            <span>Welcome back</span>
            <Sparkles className="h-5 w-5 text-primary-500 fill-primary-500/20" />
          </h2>
          <p className="text-xs text-slate-400">Enter credentials to access your Rainbow Fashions profile</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 relative">
            <label className="text-xs text-slate-450 font-bold uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@smartcart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-450 font-bold uppercase">Password</label>
              <button
                type="button"
                onClick={() => {
                  // Simulated forgot password helper
                  toast.success('Demonstration: Reset link simulated and sent to your email.');
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl shadow-md shadow-primary-500/10 hover:scale-102 transition-all duration-200 mt-2"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Alert */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-xs text-slate-500 space-y-1.5">
          <p className="font-extrabold uppercase text-slate-450 tracking-wider">Developer Demo Logins:</p>
          <p>• Customer: <span className="font-semibold text-slate-700 dark:text-slate-300">customer@smartcart.com</span> (pw: <span className="font-mono">customer123password</span>)</p>
          <p>• Admin: <span className="font-semibold text-slate-700 dark:text-slate-300">admin@smartcart.com</span> (pw: <span className="font-mono">admin123password</span>)</p>
        </div>

        {/* Footnote */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-600 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
