import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, ArrowRight, Zap } from 'lucide-react';

const OpeningSplash = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0); // 0: Logo reveal, 1: Text reveal, 2: Complete

  useEffect(() => {
    // Smooth progress counter
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // Stage progression triggers
    const stage1 = setTimeout(() => setStage(1), 600);
    const stage2 = setTimeout(() => setStage(2), 2200);

    // Auto complete callback
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearInterval(timer);
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999999] bg-[#05070f] text-slate-100 flex flex-col items-center justify-between p-6 overflow-hidden select-none"
    >
      {/* Background Animated Glowing Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: ['-10%', '10%', '-10%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-700/10 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: ['10%', '-10%', '10%'],
            y: ['10%', '-10%', '10%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-400/20 to-primary-600/30 blur-[140px]"
        />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * 800 + 200,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 1.5,
            }}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]"
          />
        ))}
      </div>

      {/* Top Header Label */}
      <div className="w-full flex justify-between items-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full backdrop-blur-md"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
            Rainbow Fashions • Haute Couture
          </span>
        </motion.div>

        <button
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center space-x-1 font-mono group bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* CENTER LOGO & TITLE ANIMATION */}
      <div className="flex flex-col items-center justify-center text-center z-10 max-w-xl my-auto space-y-6">
        {/* Glowing Badge Crest */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 blur-xl opacity-50 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/80 border border-amber-500/40 p-0.5 flex items-center justify-center shadow-2xl shadow-amber-500/20">
            <div className="w-full h-full rounded-[22px] bg-slate-950/90 flex items-center justify-center border border-amber-500/20 relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-dashed border-amber-500/30 rounded-[22px]"
              />
              <Crown className="w-12 h-12 text-amber-400 shadow-amber-500/50 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
            </div>
          </div>
        </motion.div>

        {/* Brand Name Typography Reveal */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm"
          >
            RAINBOW FASHIONS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-amber-300/80"
          >
            Luxury Apparel & AI Fashion Intelligence
          </motion.p>
        </div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: stage >= 1 ? 1 : 0, scale: stage >= 1 ? 1 : 0.9 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 pt-2"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-1 rounded-full flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Stylist Pro</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-1 rounded-full flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Virtual Try-On</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-1 rounded-full flex items-center space-x-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>100% Premium Stock</span>
          </span>
        </motion.div>
      </div>

      {/* BOTTOM PROGRESS BAR */}
      <div className="w-full max-w-md z-10 space-y-2">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>INITIALIZING EXPERIENCE</span>
          </span>
          <span className="font-extrabold text-amber-400">{progress}%</span>
        </div>

        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full shadow-[0_0_12px_#f59e0b]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OpeningSplash;
