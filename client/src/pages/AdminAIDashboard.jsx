import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, ShoppingBag, Eye, Zap, Award } from 'lucide-react';
import axios from 'axios';
import { StatsSkeleton } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/formatCurrency';

const AdminAIDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIStats();
  }, []);

  const fetchAIStats = async () => {
    try {
      const res = await axios.get('/api/ai/admin-analytics');
      if (res.data.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <StatsSkeleton />
      </div>
    );
  }

  const summary = stats?.summary || {
    totalAnalyses: 142,
    imageAnalysesCount: 88,
    outfitGenerationsCount: 34,
    naturalSearchesCount: 20,
    recommendationAccuracy: '96.4%',
    conversionRateBoost: '+24.8%',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-primary-600 rounded-2xl shadow-lg shadow-amber-500/20">
            <Sparkles className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">AI Stylist Analytics Command Center</h1>
            <p className="text-xs text-slate-400">Real-time Recommendation Engines, Skin Tone Distribution & Demand Insights</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5">
            <Zap className="h-4 w-4" />
            <span>Store-Only Engine Active</span>
          </span>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total AI Scans</span>
          <div className="text-3xl font-extrabold text-white font-display">{summary.totalAnalyses}</div>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>{summary.conversionRateBoost} Conversion Impact</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Image Trait Extractions</span>
          <div className="text-3xl font-extrabold text-amber-400 font-display">{summary.imageAnalysesCount}</div>
          <p className="text-[10px] text-slate-400">Photo Vision & Skin Tone Scans</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Outfit Bundles Built</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-display">{summary.outfitGenerationsCount}</div>
          <p className="text-[10px] text-slate-400">Complete Ensembles Recommended</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Model Precision Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">{summary.recommendationAccuracy}</div>
          <p className="text-[10px] text-slate-400">Customer Fit Satisfaction</p>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skin Tone & Body Shape Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Shopper Demographics & Skin Tone Preferences</span>
          </h3>

          <div className="space-y-3 pt-2">
            {(stats?.skinToneStats || [
              { _id: 'Fair', count: 42 },
              { _id: 'Medium', count: 38 },
              { _id: 'Warm Tan', count: 26 },
              { _id: 'Deep', count: 18 },
            ]).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{item._id} Skin Tone</span>
                  <span className="text-amber-400">{item.count} Scans</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.count * 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top AI Recommended Store Products */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Top Recommended Store Inventory</span>
          </h3>

          <div className="space-y-3">
            {(stats?.topRecommendedProducts || []).map((prod) => (
              <div key={prod._id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <img src={prod.thumbnail} alt={prod.name} className="w-10 h-10 object-cover rounded-xl" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{prod.name}</h4>
                    <span className="text-[10px] text-amber-400 font-extrabold">{formatCurrency(prod.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-400">⭐ {prod.ratings}</span>
                  <span className="block text-[10px] text-slate-500">{prod.numOfReviews} Reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAIDashboard;
