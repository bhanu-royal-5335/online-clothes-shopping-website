import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, ArrowRight, Zap, ShieldCheck, Layers, Eye } from 'lucide-react';

const OpeningSplash = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0); // 0: Core Ignition, 1: AI Calibration, 2: Grand Reveal
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Smooth 2.5-second progress counter (25ms * 100 = 2500ms)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 25);

    // Multi-phase stage progression triggers
    const stage1 = setTimeout(() => setStage(1), 700);
    const stage2 = setTimeout(() => setStage(2), 1600);

    // Auto complete callback at 2.6 seconds
    const doneTimer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 2600);

    return () => {
      clearInterval(timer);
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(16px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999999] bg-[#03050c] text-slate-100 flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden select-none"
    >
      {/* 1. CINEMATIC BACKGROUND LAYER */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing Dynamic Ambient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.25, 0.55, 0.25],
            x: ['-20%', '20%', '-20%'],
            y: ['-20%', '20%', '-20%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-48 -left-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-amber-500/30 via-amber-700/20 to-transparent blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.65, 0.3],
            x: ['20%', '-20%', '20%'],
            y: ['20%', '-20%', '20%'],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-48 -right-48 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-amber-400/20 via-primary-600/30 to-transparent blur-[160px]"
        />

        {/* 3D Holographic Laser Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at center, #f59e0b 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Laser Sweep Light Beam */}
        <motion.div
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-amber-500/10 to-transparent blur-md"
        />
      </div>

      {/* 2. FLOATING SPARKLES & LIGHT PARTICLES */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * 900 + 100,
              opacity: 0,
              scale: Math.random() * 0.6 + 0.4,
            }}
            animate={{
              y: [null, -150],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2.5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]"
          />
        ))}
      </div>

      {/* 3. TOP NAVIGATION HEADER */}
      <div className="w-full flex justify-between items-center z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center space-x-2.5 bg-slate-900/80 border border-amber-500/30 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg shadow-amber-500/5"
        >
          <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-300">
            RAINBOW FASHIONS • HAUTE COUTURE
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-amber-300 transition-all flex items-center space-x-1.5 font-mono group bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 px-4 py-2 rounded-2xl backdrop-blur-xl shadow-lg"
        >
          <span>Enter Store</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
        </motion.button>
      </div>

      {/* 4. CENTER CINEMATIC 3D ANIMATION PORTAL */}
      <div className="flex flex-col items-center justify-center text-center z-10 max-w-2xl my-auto space-y-8">
        {/* 3D Rotating Crest Badge with Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 blur-2xl opacity-40 animate-pulse" />

          {/* Dual 3D Laser Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-amber-500/40 opacity-70"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-dotted border-amber-400/20"
          />

          {/* Center Glassmorphic Crest Box */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 90 }}
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-amber-950/80 border-2 border-amber-500/50 p-1 flex items-center justify-center shadow-2xl shadow-amber-500/30 backdrop-blur-2xl"
          >
            <div className="w-full h-full rounded-[22px] bg-slate-950/95 flex items-center justify-center border border-amber-500/30 relative overflow-hidden group">
              {/* Internal Laser Shimmer */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-400/10"
              />
              <Crown className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
            </div>
          </motion.div>
        </div>

        {/* Dynamic Stage Typography */}
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="stage0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-amber-400 font-display uppercase">
                CALIBRATING LUXURY ENGINE
              </h2>
              <p className="text-xs font-mono text-slate-400 tracking-wider">
                Loading High-Fashion Catalogs & AI Neural Styling...
              </p>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Holographic Calibration Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto">
                <div className="bg-slate-900/90 border border-amber-500/30 p-2.5 rounded-2xl flex items-center space-x-2 text-left backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">AI Vision</span>
                    <span className="text-[10px] font-extrabold text-white">Color Harmony</span>
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-amber-500/30 p-2.5 rounded-2xl flex items-center space-x-2 text-left backdrop-blur-md">
                  <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">3D Overlay</span>
                    <span className="text-[10px] font-extrabold text-white">Virtual Try-On</span>
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-amber-500/30 p-2.5 rounded-2xl flex items-center space-x-2 text-left backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">Store Inventory</span>
                    <span className="text-[10px] font-extrabold text-white">100% In-Stock</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-md">
                RAINBOW FASHIONS
              </h1>
              <p className="text-xs sm:text-sm font-extrabold tracking-[0.35em] uppercase text-amber-300/90">
                THE FUTURE OF LUXURY FASHION & AI STYLING
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. BOTTOM CINEMATIC PROGRESS BAR (5 SECONDS TIMER) */}
      <div className="w-full max-w-lg z-10 space-y-3">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="flex items-center space-x-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>SYNCHRONIZING AI STYLIST PORTAL...</span>
          </span>
          <span className="font-extrabold text-amber-400 text-xs">{progress}%</span>
        </div>

        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-amber-500/30 p-0.5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full shadow-[0_0_16px_#f59e0b]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <p className="text-[10px] text-center font-mono text-slate-500 uppercase tracking-widest">
          Powered by Rainbow AI Engine • Virtual Fitting Portal
        </p>
      </div>
    </motion.div>
  );
};

export default OpeningSplash;
