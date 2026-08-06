import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Utensils,
  ShoppingBag,
  Gamepad2,
  BookOpen,
  Home,
  Cloud,
  Plus,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Delete,
  X,
  CreditCard,
  DollarSign,
  TrendingDown,
  PiggyBank,
  Wallet,
  Edit3,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CloudCategory } from '../types';
import { SavingsModals } from './SavingsModals';
import { DissolvableText } from './DissolvableText';

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Sparkles,
  ShoppingBag,
  Gamepad2,
  BookOpen,
  Home,
  Cloud,
};

// Organic morphing border radius variations for Editorial cloud shapes
const ORGANIC_RADII = [
  'rounded-[60%_40%_70%_30%/50%_60%_30%_70%]',
  'rounded-[40%_60%_30%_70%/60%_40%_70%_30%]',
  'rounded-[70%_30%_50%_50%/40%_40%_60%_60%]',
  'rounded-[50%_50%_30%_70%/30%_70%_70%_30%]',
];

export const PanelA: React.FC = () => {
  const {
    transactions,
    language,
    categories,
    budgetConfig,
    remainingBudgetThisMonth,
    totalSpentThisMonth,
    isLoggingOpen,
    setIsLoggingOpen,
    selectedCategoryForLogging,
    setSelectedCategoryForLogging,
    setIsRainbowModalOpen,
    setIsBudgetConfigOpen,
    setIsAnnualGoalModalOpen,
    setSelectedAccountForModal,
    historicalSavingsProgress,
    logExpense,
    matchedWishForNote,
    fulfillWishAndLog,
    setEditingTransaction,
    t,
    getCatName,
  } = useApp();

  // Logging modal local state
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isReceiptView, setIsReceiptView] = useState(false);

  // Handle open bounce logging modal
  const handleOpenCategoryLogging = (cat: CloudCategory) => {
    setSelectedCategoryForLogging(cat);
    setAmountInput('');
    setNoteInput('');
    setIsReceiptView(false);
    setIsLoggingOpen(true);
  };

  // Keypad button click handler
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setAmountInput((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amountInput.includes('.')) {
        setAmountInput((prev) => (prev ? prev + '.' : '0.'));
      }
    } else {
      if (amountInput.length < 9) {
        setAmountInput((prev) => (prev === '0' ? val : prev + val));
      }
    }
  };

  const matchedWish = matchedWishForNote(noteInput);

  const handleSubmitExpense = () => {
    const num = parseFloat(amountInput);
    if (!num || num <= 0 || !selectedCategoryForLogging) return;

    if (matchedWish) {
      fulfillWishAndLog(matchedWish, selectedCategoryForLogging.id);
    } else {
      logExpense(selectedCategoryForLogging.id, num, noteInput);
    }

    setIsLoggingOpen(false);
  };

  // Payday calculation
  const today = new Date();
  const currentDay = today.getDate();
  const payday = budgetConfig.payday || 1;
  let daysUntilPayday = payday - currentDay;
  if (daysUntilPayday < 0) {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    daysUntilPayday += daysInMonth;
  }

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen min-h-[100dvh] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-8 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header & Context Actions - Editorial Aesthetic */}
      <div>
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tight text-indigo-950 mb-2.5">
              {t('nav_daily_sky')}
            </h1>
            <div className="text-xs uppercase tracking-widest text-indigo-500 font-semibold">
              {formattedDate}
            </div>
            <DissolvableText as="p" className="text-xs uppercase tracking-widest text-indigo-500/80 font-semibold mt-0.5">
              {t('panelA_subtitle')}
            </DissolvableText>
          </div>

          <div className="flex items-center gap-3">
            {/* Rainbow Surprise Income Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRainbowModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 border border-white/60 backdrop-blur-md text-xs font-semibold text-indigo-900 shadow-sm transition-all"
              title={t('panelA_rainbow_btn')}
            >
              <span className="text-base leading-none">🌈</span>
              <span className="hidden sm:inline font-serif italic">{t('panelA_rainbow_btn')}</span>
            </motion.button>

            {/* Context Menu (...) */}
            <button
              onClick={() => setIsBudgetConfigOpen(true)}
              className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/70 border border-white/60 backdrop-blur-md flex items-center justify-center text-indigo-800 shadow-sm transition-colors"
              title={t('panelA_config_tooltip')}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Top Summary Banner - Editorial Glass Card */}
        <div className="mb-8 p-6 sm:p-7 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_10px_30px_rgba(99,102,241,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 block mb-1">
                {t('panelA_remaining')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-serif italic text-indigo-950">
                  {budgetConfig.currencySymbol}
                  {remainingBudgetThisMonth.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-indigo-500/80 font-medium">
                  / {budgetConfig.currencySymbol}
                  {budgetConfig.totalBudget.toLocaleString()} ({t('panelA_monthly_budget')})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs bg-white/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/60 text-indigo-900 shadow-inner">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {daysUntilPayday}d
                </span>
              </div>
              <div className="w-px h-3 bg-indigo-200" />
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  {t('panelA_spent')}:{' '}
                  <strong className="text-indigo-950 font-bold">
                    {budgetConfig.currencySymbol}
                    {totalSpentThisMonth.toFixed(0)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Canvas Section Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <DissolvableText as="span" className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            {t('panelA_cloud_categories')}
          </DissolvableText>
          <DissolvableText as="span" className="text-[11px] text-indigo-500 italic font-serif">
            {t('panelA_tap_hint')}
          </DissolvableText>
        </div>

        {/* Cloud Grid Layout (Editorial Irregular Cloud Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat, index) => {
            const IconComp = ICON_MAP[cat.icon] || Cloud;
            const pctSpent = Math.min(100, Math.max(0, (cat.spent / (cat.budgetLimit || 1)) * 100));
            const organicShape = ORGANIC_RADII[index % ORGANIC_RADII.length];
            const isOver = cat.spent >= cat.budgetLimit && cat.budgetLimit > 0;

            return (
              <div key={cat.id} className="relative group">
                <div className="absolute inset-0 bg-indigo-200/30 blur-2xl rounded-full translate-y-3 pointer-events-none group-hover:bg-indigo-300/40 transition-all" />

                <motion.button
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  onClick={() => handleOpenCategoryLogging(cat)}
                  className={`relative w-full h-44 sm:h-48 backdrop-blur-2xl bg-white/50 ${organicShape} border border-white/60 shadow-[0_10px_30px_rgba(139,92,246,0.1)] flex flex-col items-center justify-center p-6 cursor-pointer text-center group-hover:border-indigo-300 transition-all overflow-hidden`}
                >
                  {/* Color fill ratio inside cloud shape representing spending progress (Left to Right, Soft Watercolor Wave Fade) */}
                  {pctSpent > 0 && (
                    <div
                      className="absolute top-0 bottom-0 left-0 pointer-events-none transition-all duration-700 ease-out flex"
                      style={{ width: `${pctSpent}%` }}
                    >
                      {/* Solid main fill body */}
                      <div className="h-full bg-indigo-300/40 flex-1 min-w-0" />

                      {/* Organic irregular wave edge (40px wide watercolor bleed) */}
                      <div className="relative w-[40px] h-full flex-shrink-0">
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 40 100"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id={`cloud-wave-fade-${cat.id}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.4" />
                              <stop offset="40%" stopColor="#a5b4fc" stopOpacity="0.25" />
                              <stop offset="75%" stopColor="#a5b4fc" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,0 L12,0 C28,15 40,32 26,48 C14,64 36,80 18,92 C8,97 3,100 0,100 Z"
                            fill={`url(#cloud-wave-fade-${cat.id})`}
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-1">
                      {getCatName(cat.name)}
                    </span>

                    <span className="text-3xl sm:text-4xl font-serif text-indigo-950 italic">
                      {budgetConfig.currencySymbol}
                      {cat.spent.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Half-Arc Horizon Line Divider & Soft Blue-Purple (#585FA2) Savings Reservoir (储蓄与沉淀板块) */}
        {(() => {
          const annualTarget = budgetConfig.annualSavingsTarget || 0;
          const hasAnnualTarget = annualTarget > 0;
          const savingsAccounts = budgetConfig.savingsAccounts || [];

          return (
            <div className="relative mt-12">
              {/* Soft Watercolor Halo Blur Diffusion (晕染效果) */}
              <div className="absolute -top-12 inset-x-0 h-28 bg-gradient-to-r from-indigo-300/50 via-purple-300/50 to-pink-300/40 blur-2xl pointer-events-none rounded-full" />

              {/* Half-Arc Horizon Line Divider with Increased Curvature & Soft Blur (加深弧度与Blur晕染地平线) */}
              <div className="w-full overflow-hidden leading-none -mb-1 pointer-events-none relative z-10">
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  className="relative block w-full h-12 sm:h-16 text-[#585FA2] fill-current"
                >
                  {/* Blurred soft glow outline along the top curve */}
                  <path
                    d="M0,80 Q600,-60 1200,80"
                    className="stroke-[#585FA2] blur-md opacity-90"
                    strokeWidth="16"
                    fill="none"
                  />
                  <path
                    d="M0,80 Q600,-60 1200,80"
                    className="stroke-indigo-100/60 blur-sm"
                    strokeWidth="6"
                    fill="none"
                  />
                  {/* Main filled area */}
                  <path d="M0,80 Q600,-60 1200,80 L1200,120 L0,120 Z"></path>
                </svg>
              </div>

              {/* Softer Blue-Purple (#585FA2) Reservoir Container */}
              <div className="p-6 sm:p-8 rounded-b-[2.5rem] bg-[#585FA2] border-t border-white/20 text-slate-100 shadow-2xl relative overflow-hidden space-y-3 sm:space-y-4">
                {/* Ambient Deep Glow Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

                {/* Section Header */}
                <div className="flex items-center justify-between mb-5 sm:mb-6 relative z-10 px-2 sm:px-6">
                  <DissolvableText as="h2" className="text-2xl sm:text-3xl font-serif italic font-normal text-white/95 tracking-wide">
                    {t('savings_section_title')}
                  </DissolvableText>
                </div>

                {/* 1. Annual Savings Target (Editorial Style with comfortable width) */}
                <div className="relative z-10 px-2 sm:px-6 w-full">
                  <motion.button
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setIsAnnualGoalModalOpen(true)}
                    className="w-full py-1.5 px-2 sm:px-4 transition-all text-left group cursor-pointer overflow-hidden relative"
                  >
                    {hasAnnualTarget ? (
                      (() => {
                        const progressPct = annualTarget > 0 ? historicalSavingsProgress / annualTarget : 0;
                        const pctDisplay = Math.round(Math.max(0, progressPct) * 100);
                        const strokeDasharray = 238.76;
                        const strokeDashoffset = strokeDasharray - strokeDasharray * Math.min(1, Math.max(0, progressPct));

                        return (
                          <div className="flex flex-row items-center justify-between gap-4">
                            <div className="space-y-0.5 text-left z-10 flex-1">
                              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-indigo-100/70 block font-serif italic">
                                {t('annual_savings_title')}
                              </span>
                              <h2 className="text-3xl sm:text-4xl font-serif italic font-extrabold text-white tracking-tight my-0.5">
                                {budgetConfig.currencySymbol}
                                {historicalSavingsProgress.toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                })}
                              </h2>
                              <p className="text-xs text-indigo-100/80 font-sans">
                                {t('annual_savings_input_label')}:{' '}
                                <strong className="text-white font-serif italic font-bold">
                                  {budgetConfig.currencySymbol}
                                  {annualTarget.toLocaleString()}
                                </strong>
                              </p>
                            </div>

                            {/* Circular Ring Progress matching the image */}
                            <div className="relative w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center flex-shrink-0">
                              <div className="absolute inset-0 rounded-full bg-white/10 blur-md" />
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                                <circle cx="48" cy="48" r="38" className="stroke-white/20" strokeWidth="7" fill="none" />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="38"
                                  className="stroke-white transition-all duration-700 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                                  strokeWidth="7"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  fill="none"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-serif italic font-bold text-white">
                                {pctDisplay}%
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-indigo-100/70 block mb-0.5 font-serif italic">
                            {t('annual_savings_title')}
                          </span>
                          <span className="text-sm sm:text-base font-serif italic font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-200" />
                            {t('annual_savings_click_set')}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-indigo-100/80 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </motion.button>
                </div>

                {/* Classical Thin Divider with Faded Ends & Comfortable Spacing */}
                <div className="relative z-10 w-full flex items-center justify-center mt-3 mb-4 sm:mt-4 sm:mb-5 px-2 sm:px-6">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </div>

                {/* 2. Savings Accounts Section (Refined Translucent Glass Cards & Dotted Add Button) */}
                <div className="relative z-10 space-y-3 pt-1 px-2 sm:px-6">
                  {savingsAccounts.length > 0 ? (
                    /* Accounts List Layout: Max 5 per row, evenly distributed */
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full">
                      {savingsAccounts.map((acc) => (
                        <motion.div
                          key={acc.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedAccountForModal(acc)}
                          className="flex-1 min-w-[120px] max-w-full p-3.5 rounded-lg bg-white/[0.05] hover:bg-white/10 backdrop-blur-md border-t border-white/25 cursor-pointer transition-colors flex flex-col justify-between"
                        >
                          <div className="mb-1.5">
                            <span className="text-xs font-bold text-white truncate block">
                              {acc.name}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {acc.balances && acc.balances.length > 0 ? (
                              acc.balances.map((b) => (
                                <span
                                  key={b.id}
                                  className="px-2 py-0.5 rounded-md bg-black/15 backdrop-blur-xs border-t border-white/15 text-[11px] font-bold text-white"
                                >
                                  {b.currency === 'USD' ? '$' : b.currency === 'CNY' ? '¥' : `${b.currency} `}
                                  {b.amount.toLocaleString()}{' '}
                                  <span className="text-[9px] font-normal text-indigo-100/70 uppercase">
                                    {b.currency}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-indigo-100/60 italic">No balances</span>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {/* Concise '+' Add Symbol button with no background & fine dashed rounded border */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedAccountForModal('new')}
                        className="px-3.5 py-2.5 rounded-lg bg-transparent hover:bg-white/10 border border-dashed border-white/35 text-white/90 hover:text-white flex items-center justify-center cursor-pointer transition-all flex-shrink-0 self-stretch min-w-[44px]"
                        title={t('add_account_btn')}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>
                  ) : (
                    /* Fine dashed box with transparent background when no accounts exist */
                    <motion.button
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setSelectedAccountForModal('new')}
                      className="w-full py-3.5 px-5 rounded-lg border border-dashed border-white/35 hover:border-white/55 bg-transparent hover:bg-white/5 text-white/80 hover:text-white font-normal text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-white/70" />
                      <span>Click here to record your savings</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bounce-Logging Numeric Keypad & Receipt History Modal */}
      <AnimatePresence>
        {isLoggingOpen && selectedCategoryForLogging && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-1 bg-indigo-200 rounded-full mx-auto mb-4" />

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-indigo-950 truncate">
                    {getCatName(selectedCategoryForLogging.name)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* "查看记录" / "记一笔" Toggle Button */}
                  <button
                    onClick={() => setIsReceiptView(!isReceiptView)}
                    className={`px-3 py-1.5 rounded-full text-xs font-serif italic font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isReceiptView
                        ? 'bg-indigo-950 text-white shadow-sm'
                        : 'bg-indigo-100 hover:bg-indigo-200/80 text-indigo-800'
                    }`}
                  >
                    {isReceiptView ? (
                      <>
                        <Plus className="w-3.5 h-3.5 text-indigo-200" />
                        <span>记一笔</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                        <span>查看记录</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsLoggingOpen(false)}
                    className="w-7 h-7 rounded-full bg-indigo-100/70 flex items-center justify-center text-indigo-600 hover:text-indigo-950 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isReceiptView ? (
                /* Receipt History View (小票形式) */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="py-1"
                >
                  <div className="bg-[#FAF9F5] text-indigo-950 p-5 rounded-2xl border border-amber-200/60 shadow-inner font-mono relative overflow-hidden">
                    {/* Header accent */}
                    <div className="text-center mb-3">
                      <div className="text-[10px] tracking-[0.2em] font-bold text-amber-800/60 uppercase">
                        *** DAILY SKY RECEIPT ***
                      </div>
                      <h4 className="text-sm font-bold font-serif text-indigo-950 mt-1">
                        【{getCatName(selectedCategoryForLogging.name)}】本月消费小票
                      </h4>
                      <div className="text-[10px] text-indigo-400 mt-0.5">
                        {new Date().getFullYear()}年{new Date().getMonth() + 1}月
                      </div>
                    </div>

                    {/* Dashed line */}
                    <div className="border-b border-dashed border-indigo-200/80 my-2" />

                    {/* Receipt Itemized Entries */}
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 my-3">
                      {(() => {
                        const categoryMonthTxs = transactions.filter((tx) => {
                          if (tx.type !== 'expense') return false;
                          const isCatMatch =
                            tx.categoryId === selectedCategoryForLogging.id ||
                            tx.categoryName === selectedCategoryForLogging.name;
                          if (!isCatMatch) return false;
                          const txDate = new Date(tx.date);
                          const now = new Date();
                          return (
                            txDate.getMonth() === now.getMonth() &&
                            txDate.getFullYear() === now.getFullYear()
                          );
                        });

                        if (categoryMonthTxs.length === 0) {
                          return (
                            <div className="py-7 text-center text-indigo-400 font-serif italic text-xs">
                              本月暂无【{getCatName(selectedCategoryForLogging.name)}】的消费记录
                              <p className="text-[10px] text-indigo-300 font-sans mt-1">
                                这朵云彩依然轻盈无负担～
                              </p>
                            </div>
                          );
                        }

                        return categoryMonthTxs.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => setEditingTransaction(tx)}
                            className="flex items-baseline justify-between gap-2 text-xs py-1 border-b border-indigo-100/40 hover:bg-amber-100/40 px-1 rounded transition-colors cursor-pointer group"
                            title={language === 'zh' ? '点击修改或删除此笔记录' : 'Click to edit or delete'}
                          >
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-sans font-medium text-indigo-950 truncate group-hover:text-indigo-700 transition-colors">
                                {tx.note || getCatName(selectedCategoryForLogging.name)}
                              </span>
                              <span className="text-[10px] text-indigo-400 font-mono">
                                {new Date(tx.date).toLocaleString(
                                  language === 'zh' ? 'zh-CN' : 'en-US',
                                  {
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                            </div>
                            <span className="font-serif italic font-bold text-sm text-indigo-950 shrink-0">
                              -{budgetConfig.currencySymbol}
                              {tx.amount.toFixed(2)}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Dashed Divider */}
                    <div className="border-b border-dashed border-indigo-200/80 my-2" />

                    {/* Receipt Footer Calculations */}
                    {(() => {
                      const categoryMonthTxs = transactions.filter((tx) => {
                        if (tx.type !== 'expense') return false;
                        const isCatMatch =
                          tx.categoryId === selectedCategoryForLogging.id ||
                          tx.categoryName === selectedCategoryForLogging.name;
                        if (!isCatMatch) return false;
                        const txDate = new Date(tx.date);
                        const now = new Date();
                        return (
                          txDate.getMonth() === now.getMonth() &&
                          txDate.getFullYear() === now.getFullYear()
                        );
                      });

                      const totalCatSpent = categoryMonthTxs.reduce(
                        (sum, tx) => sum + tx.amount,
                        0
                      );

                      return (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-indigo-950 font-bold">
                            <span>本月累计 ({categoryMonthTxs.length} 笔)</span>
                            <span className="font-serif italic text-sm text-indigo-950">
                              -{budgetConfig.currencySymbol}
                              {totalCatSpent.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-indigo-400 text-[11px]">
                            <span>分类剩余预算</span>
                            <span>
                              {budgetConfig.currencySymbol}
                              {Math.max(
                                0,
                                selectedCategoryForLogging.budgetLimit - totalCatSpent
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Double Divider */}
                    <div className="border-b-2 border-double border-indigo-200 my-3" />

                    {/* Barcode Accent */}
                    <div className="text-center pt-0.5">
                      <div className="inline-block tracking-widest text-[10px] text-indigo-400/80 font-mono select-none opacity-80">
                        ||| | ||||| || |||||| ||| |||| |
                      </div>
                      <div className="text-[9px] text-indigo-300 font-serif italic mt-0.5">
                        ～ 感谢每一笔用心的记录 ～
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Standard Keypad Logging View */
                <div>
                  {/* Amount Display */}
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 mb-3 text-right">
                    <span className="text-xs text-indigo-400 block mb-1 uppercase tracking-wider font-semibold">
                      {t('panelA_spent')} ({budgetConfig.currencySymbol})
                    </span>
                    <span className="text-3xl sm:text-4xl font-serif italic text-indigo-950 font-bold">
                      {budgetConfig.currencySymbol}
                      {amountInput || '0'}
                    </span>
                  </div>

                  {/* Note Input & Seamless Wish Erasure Matching */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder={t('logging_note_placeholder')}
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-indigo-400 font-serif italic"
                    />

                    {/* Seamless Note Matching Prompt */}
                    {matchedWish && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                          <span>
                            {t('logging_match_wish', { title: matchedWish.title })}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Numeric Keypad Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypadPress(key)}
                        className="py-3 bg-white/80 hover:bg-indigo-50/80 border border-indigo-100 rounded-2xl text-lg font-serif italic text-indigo-950 flex items-center justify-center transition-colors active:scale-95 shadow-sm cursor-pointer"
                      >
                        {key === 'backspace' ? <Delete className="w-5 h-5 text-indigo-400" /> : key}
                      </button>
                    ))}
                  </div>

                  {/* Submit Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitExpense}
                    disabled={!amountInput || parseFloat(amountInput) <= 0}
                    className="w-full py-3.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {matchedWish ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('panelB_btn_fulfill')}</span>
                      </>
                    ) : (
                      <span>{t('logging_submit')}</span>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Savings Goal & Accounts Modals */}
      <SavingsModals />
    </div>
  );
};

