import React from 'react';
import { motion } from 'motion/react';
import { Cloud, Sparkles, BarChart3, Droplets, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const {
    activePanel,
    setActivePanel,
    setIsHesitationOpen,
    setIsProfileOpen,
    t,
  } = useApp();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] max-w-xl mx-auto pointer-events-none">
      <div className="relative flex items-center justify-between pointer-events-auto">
        {/* Editorial Glassmorphism Tab Bar */}
        <div className="flex-1 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-full p-1.5 shadow-[0_10px_30px_rgba(99,102,241,0.12)] flex items-center justify-around mr-3">
          {/* Panel A: Daily Sky */}
          <button
            onClick={() => setActivePanel('A')}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all ${
              activePanel === 'A'
                ? 'bg-indigo-900 text-white shadow-md font-serif italic'
                : 'text-indigo-600/70 hover:text-indigo-950'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight">{t('nav_daily_sky')}</span>
          </button>

          {/* Panel B: Wishlist */}
          <button
            onClick={() => setActivePanel('B')}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all ${
              activePanel === 'B'
                ? 'bg-indigo-900 text-white shadow-md font-serif italic'
                : 'text-indigo-600/70 hover:text-indigo-950'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight">{t('nav_wishlist')}</span>
          </button>

          {/* Panel C: Accumulation & Review */}
          <button
            onClick={() => setActivePanel('C')}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all ${
              activePanel === 'C'
                ? 'bg-indigo-900 text-white shadow-md font-serif italic'
                : 'text-indigo-600/70 hover:text-indigo-950'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight">{t('nav_review')}</span>
          </button>

          {/* Profile Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 rounded-full text-indigo-600/70 hover:text-indigo-950 transition-colors"
            title={t('nav_profile_tooltip')}
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* 💧 Hesitation Assistant Floating Liquid Companion Drop */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -5, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: 'easeInOut',
          }}
          onClick={() => setIsHesitationOpen(true)}
          className="w-13 h-13 rounded-full bg-indigo-900 text-white p-0.5 shadow-xl flex items-center justify-center cursor-pointer border border-white/80 relative group"
          title={t('nav_consult_tooltip')}
        >
          {/* Inner Liquid Glow */}
          <div className="w-full h-full rounded-full bg-indigo-900 backdrop-blur-md flex items-center justify-center text-white">
            <Droplets className="w-5 h-5 text-indigo-200 animate-pulse" />
          </div>

          {/* Floating Ripple Tag */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border-2 border-white animate-ping pointer-events-none" />
        </motion.button>
      </div>
    </div>
  );
};

