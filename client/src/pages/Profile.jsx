import { useState, useEffect } from 'react';
import { User, Key, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, verifyEmail } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'wishlist'
  
  // Profile inputs
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Wishlist products
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Load wishlist details when wishlist tab becomes active
  useEffect(() => {
    const fetchWishlist = async () => {
      if (activeTab === 'wishlist' && user?.wishlist?.length > 0) {
        setLoadingWishlist(true);
        try {
          // Fetch wishlisted products by passing user wishlist IDs
          const productsData = [];
          for (const id of user.wishlist) {
            try {
              const { data } = await api.get(`/api/products/${id}`);
              productsData.push(data);
            } catch (err) {
              console.warn(`Failed to retrieve product details for ID: ${id}`);
            }
          }
          setWishlistProducts(productsData);
        } catch (error) {
          console.error('Wishlist fetch error:', error.message);
        } finally {
          setLoadingWishlist(false);
        }
      } else if (activeTab === 'wishlist') {
        setWishlistProducts([]);
      }
    };
    fetchWishlist();
  }, [activeTab, user?.wishlist]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdating(true);
    try {
      const payload = { name, email };
      if (password) payload.password = password;

      await updateProfile(payload);
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyEmail();
      toast.success('Email marked as verified!');
    } catch (error) {
      toast.error('Verification failed. Try again later.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Sidebar Tabs */}
        <div className="space-y-2.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className="h-4.5 w-4.5" />
            <span>Wishlist Products</span>
          </button>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="md:col-span-3">
          
          {/* TAB 1: Profile updating */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Account Stats / Info card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center font-bold text-lg">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-white">{user?.name}</h3>
                    <p className="text-xs text-slate-400">Account Role: <span className="capitalize text-primary-600 font-bold">{user?.role}</span></p>
                  </div>
                </div>

                {user?.isVerified ? (
                  <span className="flex items-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>Email Verified</span>
                  </span>
                ) : (
                  <button
                    onClick={handleVerifyEmail}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-1.5 rounded-full transition-colors"
                  >
                    Verify Email Now
                  </button>
                )}
              </div>

              {/* Editing Form */}
              <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <User className="h-4.5 w-4.5 text-primary-500" />
                  <span>Update Profile Info</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>
                </div>

                <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Key className="h-4.5 w-4.5 text-primary-500" />
                  <span>Change Password</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep unchanged"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs shadow-md shadow-primary-500/10 hover:scale-102 transition-all"
                >
                  {updating ? 'Saving changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Wishlist products list */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Saved Products</h2>

              {loadingWishlist ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
                </div>
              ) : wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                  <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your wishlist is currently empty.</p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all"
                  >
                    Go Find Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
