import { useState, useEffect } from 'react';
import { Store, TrendingUp, Package, DollarSign, CreditCard, ArrowUpRight, Award, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const { data } = await api.get('/api/vendors/profile');
        setProfile(data);
      } catch (err) {
        console.error('Failed to load vendor profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  const handleRequestPayout = async () => {
    if (!profile?.vendor?.balance || profile.vendor.balance <= 0) {
      toast.error('No available balance for payout.');
      return;
    }

    setPayoutLoading(true);
    try {
      const { data } = await api.post('/api/vendors/payout', { amount: profile.vendor.balance });
      toast.success(data.message);
      setProfile((prev) => ({
        ...prev,
        vendor: data.vendor,
        metrics: { ...prev.metrics, availablePayout: 0 },
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payout request failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-medium">
        Loading Vendor Marketplace Intelligence...
      </div>
    );
  }

  const { vendor, metrics } = profile || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Seller Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center space-x-2">
                <span>{vendor?.storeName || 'Boutique Seller Studio'}</span>
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </h1>
              <p className="text-xs text-slate-400">Verified Rainbow Fashions SaaS Merchant</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
            <span className="text-slate-400">Commission Rate: </span>
            <span className="font-extrabold text-amber-400">{vendor?.commissionPercentage || 10}%</span>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={payoutLoading || !metrics?.availablePayout}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all"
          >
            <CreditCard className="h-4 w-4" />
            <span>{payoutLoading ? 'Processing...' : 'Request Bank Payout'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales Revenue</span>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(metrics?.grossEarnings || 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
            <DollarSign className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(metrics?.availablePayout || 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Boutique Products</span>
            <Package className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalProducts || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Dispatched</span>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalOrders || 0}</p>
        </div>
      </div>

      {/* Seller Bank & Account Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-amber-500" />
          <span>Registered Merchant Payout Settlement Bank</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-slate-400 font-bold uppercase">Bank Name</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{vendor?.bankDetails?.bankName || 'State Bank of India'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-slate-400 font-bold uppercase">Account Number</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{vendor?.bankDetails?.accountNumber || 'XXXX-XXXX-5335'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-slate-400 font-bold uppercase">IFSC Code</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{vendor?.bankDetails?.ifscCode || 'SBIN0001234'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
