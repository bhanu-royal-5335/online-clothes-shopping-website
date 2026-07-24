import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateAISize } from '../utils/aiEngine';

const AISizeGuideModal = ({ isOpen, onClose, onSelectSize }) => {
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [fit, setFit] = useState('regular');
  const [computedSize, setComputedSize] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    const recommended = calculateAISize({
      heightCm: Number(height),
      weightKg: Number(weight),
      fitPreference: fit,
    });
    setComputedSize(recommended);
  };

  const handleApply = () => {
    if (computedSize && onSelectSize) {
      onSelectSize(computedSize);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 z-10 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-primary-600 rounded-2xl shadow">
                  <Ruler className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center space-x-1.5">
                    <span>AI Size Recommender</span>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-400">Calculate your exact tailoring fit</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Height (cm)</label>
                  <input
                    type="number"
                    required
                    min="120"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="180"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fit Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {['tight', 'regular', 'loose'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFit(option)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        fit === option
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="h-4 w-4" />
                <span>Calculate Best Size</span>
              </button>
            </form>

            {/* Computed Size Result */}
            {computedSize && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl space-y-3 text-center"
              >
                <div className="flex items-center justify-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs font-extrabold uppercase">Recommended Size</span>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-widest">{computedSize}</div>
                <button
                  onClick={handleApply}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Select Size {computedSize} & Apply
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AISizeGuideModal;
