import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  RefreshCw,
  Gift,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Receipt,
  Download,
  Share2,
  Heart,
  PiggyBank,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DissolvableText } from './DissolvableText';

export const PanelC: React.FC = () => {
  const {
    budgetConfig,
    totalSpentThisMonth,
    remainingBudgetThisMonth,
    totalImpulseSaved,
    fulfilledWishes,
    wishes,
    categories,
    transactions,
    historicalSavingsProgress,
    setIsProfileOpen,
    setEditingTransaction,
    t,
    getCatName,
  } = useApp();

  // Mode toggle: 'midMonth' (Real-Time Dashboard) vs 'monthEnd' (Monthly Memory & AI Summary)
  const [viewMode, setViewMode] = useState<'midMonth' | 'monthEnd'>('midMonth');

  // Collapsible Expense Breakdown state
  const [isExpensesExpanded, setIsExpensesExpanded] = useState(false);

  // AI Summary local loading state
  const [aiSummaryLines, setAiSummaryLines] = useState<string[] | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Sorted transactions for expense breakdown
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Time elapsed in month vs budget percentage calculation
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const timeElapsedPct = Math.round((dayOfMonth / daysInMonth) * 100);

  const totalEffectiveBudget = budgetConfig.totalBudget;
  const budgetSpentPct = Math.round((totalSpentThisMonth / (totalEffectiveBudget || 1)) * 100);

  // Savings target progress calculation synchronized with PanelA
  const annualSavingsTarget = budgetConfig.annualSavingsTarget || 0;
  const currentSavingsProgress = historicalSavingsProgress;
  const savingsProgressPct = Math.min(
    100,
    Math.max(0, Math.round((currentSavingsProgress / (annualSavingsTarget || 1)) * 100))
  );

  // Natural language diagnostic
  let diagnosticText = '';
  if (budgetSpentPct < timeElapsedPct - 10) {
    diagnosticText = `${timeElapsedPct}% of the month passed, but only ${budgetSpentPct}% of budget spent — Your sky is peaceful, clear, and comfortably in flow!`;
  } else if (Math.abs(budgetSpentPct - timeElapsedPct) <= 10) {
    diagnosticText = `${timeElapsedPct}% of the month passed and ${budgetSpentPct}% of budget spent — Perfectly balanced rhythm!`;
  } else {
    diagnosticText = `${timeElapsedPct}% of the month passed, and ${budgetSpentPct}% of budget spent — A little active lately! Gently glide your remaining days.`;
  }

  // Generate 3-Sentence AI Emotional Summary via Express endpoint
  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const monthName = monthNames[now.getMonth()];

      const res = await fetch('/api/monthly-ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthName,
          totalBudget: budgetConfig.totalBudget,
          totalSpent: totalSpentThisMonth,
          totalSavings: budgetConfig.totalSavings,
          categories: categories.map((c) => ({ name: c.name, spent: c.spent })),
          impulseMoneySaved: totalImpulseSaved,
          fulfilledWishesCount: fulfilledWishes.length,
          abandonedWishesCount: wishes.filter((w) => w.status === 'abandoned').length,
        }),
      });

      const data = await res.json();
      if (data.lines && Array.isArray(data.lines) && data.lines.length > 0) {
        setAiSummaryLines(data.lines);
      } else {
        setAiSummaryLines([
          `[Rhythm Summary] In ${monthName}, you navigated your cash flow with steady mindfulness, keeping total spent at $${totalSpentThisMonth.toFixed(0)}.`,
          `[Joy Preference] Your deliberate spending favored dining and micro-pleasures that truly elevated your everyday wellbeing.`,
          `[Impulse Battle Report] You successfully blocked $${totalImpulseSaved.toFixed(0)} in impulse noise and granted ${fulfilledWishes.length} genuine wishes!`,
        ]);
      }
    } catch (err) {
      console.error('Failed AI summary generation:', err);
      setAiSummaryLines([
        `[Rhythm Summary] Beautiful balance maintaining $${remainingBudgetThisMonth.toFixed(0)} in available sky reserves.`,
        `[Joy Preference] Your choices reflected authentic joy rather than fast distraction.`,
        `[Impulse Battle Report] $${totalImpulseSaved.toFixed(0)} saved in impulse-blocked wishes!`,
      ]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const abandonedWishes = wishes.filter((w) => w.status === 'abandoned');

  return (
    <div className="relative min-h-screen min-h-[100dvh] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-8 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Header & Mode Switch */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tight text-indigo-950">
            {t('nav_review')}
          </h1>
          <DissolvableText as="p" className="text-xs uppercase tracking-widest text-indigo-500 mt-1 font-semibold">
            {t('panelC_subtitle')}
          </DissolvableText>
        </div>

        {/* Mode Switch (Mid-Month vs Month-End) */}
        <div className="p-1 rounded-full bg-white/60 border border-white/60 backdrop-blur-md flex items-center gap-1 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setViewMode('midMonth')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'midMonth'
                ? 'bg-white text-indigo-950 shadow-sm font-serif italic'
                : 'text-indigo-400 hover:text-indigo-800'
            }`}
          >
            {t('panelC_mode_mid')}
          </button>
          <button
            onClick={() => setViewMode('monthEnd')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'monthEnd'
                ? 'bg-white text-indigo-950 shadow-sm font-serif italic'
                : 'text-indigo-400 hover:text-indigo-800'
            }`}
          >
            {t('panelC_mode_end')}
          </button>
        </div>
      </header>

      {/* Mid-Month Mode (Real-Time Dashboard) */}
      {viewMode === 'midMonth' && (
        <div className="space-y-6">
          {/* 1. Dual Cards: Left = Spent (已花), Right = Remaining Budget (剩余预算) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white/50 border border-white/60 backdrop-blur-xl shadow-sm">
              <span className="text-xs text-indigo-400 block mb-1">{t('panelA_spent')}</span>
              <span className="text-2xl sm:text-3xl font-serif italic font-extrabold text-indigo-950">
                {budgetConfig.currencySymbol}
                {totalSpentThisMonth.toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/50 border border-white/60 backdrop-blur-xl shadow-sm">
              <span className="text-xs text-indigo-400 block mb-1">{t('panelA_remaining')}</span>
              <span className="text-2xl sm:text-3xl font-serif italic font-extrabold text-indigo-950">
                {budgetConfig.currencySymbol}
                {remainingBudgetThisMonth.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 2. Simple Icon + Text Diagnostic Evaluation */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/60 border border-white/80 text-xs text-indigo-950 font-medium flex items-center gap-3 shadow-sm backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 animate-pulse" />
            <p className="leading-relaxed font-serif italic text-xs sm:text-sm">{diagnosticText}</p>
          </div>

          {/* 3. Expense Breakdown (Single Card with Divider Lines, Default Top 5) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600 stroke-[1.75]" />
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-serif italic">
                  {t('language') === 'zh' ? '分类消费明细' : 'Expense Breakdown'}
                </h3>
              </div>
              <span className="text-xs text-indigo-400 font-sans">
                {t('language') === 'zh' ? `共 ${transactions.length} 笔` : `${transactions.length} total`}
              </span>
            </div>

            {sortedTransactions.length === 0 ? (
              <div className="py-4 text-center text-xs text-indigo-400 italic font-serif pl-4">
                {t('panelA_empty_txs')}
              </div>
            ) : (
              <div className="divide-y divide-indigo-100/70 my-1 pl-3 sm:pl-5">
                {(isExpensesExpanded ? sortedTransactions : sortedTransactions.slice(0, 5)).map((tx) => {
                  const categoryText = tx.categoryName || (tx.type === 'income' ? (t('language') === 'zh' ? '收入' : 'Income') : (t('language') === 'zh' ? '支出' : 'Expense'));
                  const descriptionText = tx.note || categoryText;
                  const formattedDate = new Date(tx.date).toLocaleDateString(undefined, {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setEditingTransaction(tx)}
                      className="py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-indigo-100/40 px-2 rounded-lg cursor-pointer group"
                      title={t('language') === 'zh' ? '点击修改或删除此笔记录' : 'Click to edit or delete'}
                    >
                      <div>
                        <span className="font-serif italic font-bold text-indigo-950 block text-xs group-hover:text-indigo-700 transition-colors">
                          {descriptionText}
                        </span>
                        <span className="text-[10px] text-indigo-400/80 font-mono block mt-0.5">
                          {categoryText} · {formattedDate}
                        </span>
                      </div>

                      <span
                        className={`font-serif italic font-bold text-xs sm:text-sm ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-indigo-950'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {budgetConfig.currencySymbol}
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {sortedTransactions.length > 5 && (
              <button
                onClick={() => setIsExpensesExpanded(!isExpensesExpanded)}
                className="w-full py-1.5 text-center text-xs font-serif italic text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 cursor-pointer transition-colors pt-1"
              >
                <span>
                  {isExpensesExpanded
                    ? (t('language') === 'zh' ? '收起' : 'Show less')
                    : (t('language') === 'zh' ? `点击展开更多 (${sortedTransactions.length - 5} 笔)` : `Show more (${sortedTransactions.length - 5})`)}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isExpensesExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>

          {/* 4. Savings Status (Clean Horizontal Progress Bar) - Synchronized with PanelA */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-indigo-600 stroke-[1.75]" />
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-serif italic">
                  {t('savings_section_title')}
                </h3>
              </div>
              <span className="text-xs text-indigo-400 font-serif italic">
                {savingsProgressPct}% {t('language') === 'zh' ? '已达成' : 'achieved'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <h2 className="text-2xl sm:text-3xl font-serif italic font-extrabold text-indigo-950">
                  {budgetConfig.currencySymbol}
                  {currentSavingsProgress.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-indigo-500/80 block font-medium">
                  {t('annual_savings_input_label')}:{' '}
                  <strong className="text-indigo-900 font-serif italic">
                    {budgetConfig.currencySymbol}
                    {annualSavingsTarget.toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full h-3.5 rounded-full bg-indigo-100/80 p-0.5 overflow-hidden border border-indigo-200/40 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${savingsProgressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 shadow-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Bottom: Real-Time Wish Achievement Wall */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 stroke-[1.75]" />
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-serif italic">
                  {t('panelC_wish_wall')}
                </h3>
              </div>
              <span className="text-xs text-indigo-400 font-sans">
                {t('language') === 'zh' ? `共 ${fulfilledWishes.length} 项` : `${fulfilledWishes.length} total`}
              </span>
            </div>

            {fulfilledWishes.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic font-serif pl-4">
                {t('panelC_no_fulfilled')}
              </div>
            ) : (
              <div className="divide-y divide-slate-200/70 my-1 pl-3 sm:pl-5">
                {fulfilledWishes.map((w) => {
                  const categoryText = w.categoryHint || (t('language') === 'zh' ? '愿望拔草' : 'Wish Fulfilled');
                  const formattedDate = new Date(w.createdAt).toLocaleDateString(undefined, {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={w.id}
                      className="py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-white/30 px-2 rounded-lg"
                    >
                      <div>
                        <span className="font-serif italic font-medium text-slate-400 line-through block text-xs">
                          {w.title}
                        </span>
                        <span className="text-[10px] text-slate-400/80 font-mono block mt-0.5">
                          {categoryText} · {formattedDate}
                        </span>
                      </div>

                      <span className="font-serif italic font-medium text-slate-400 text-xs sm:text-sm">
                        {budgetConfig.currencySymbol}
                        {w.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Month-End / Historical Report Mode (3-Sentence AI Emotional Summary) */}
      {viewMode === 'monthEnd' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/60 border border-white/80 backdrop-blur-3xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-serif italic font-bold text-indigo-950">
                  {t('panelC_ai_title')}
                </h3>
              </div>

              <button
                onClick={handleGenerateAiSummary}
                disabled={isGeneratingAi}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? t('panelC_ai_generating') : t('panelC_ai_btn')}</span>
              </button>
            </div>

            {aiSummaryLines ? (
              <div className="space-y-3.5">
                {aiSummaryLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-sm leading-relaxed text-indigo-950 font-serif italic"
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white/40 border border-white/60 text-xs text-indigo-400 italic font-serif">
                {t('panelC_ai_prompt_hint')}
              </div>
            )}
          </div>

          {/* Static Month Comparison Table */}
          <div className="p-6 rounded-3xl bg-white/50 border border-white/60 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 font-serif italic">
              {t('language') === 'zh' ? '历史月度印记' : 'Historical Monthly Memory'}
            </h4>

            <div className="space-y-2">
              {[
                { month: t('language') === 'zh' ? '本月' : 'Current Month', spent: totalSpentThisMonth, budget: budgetConfig.totalBudget },
                { month: t('language') === 'zh' ? '2026年6月' : 'June 2026', spent: 1420, budget: 1800 },
                { month: t('language') === 'zh' ? '2026年5月' : 'May 2026', spent: 1680, budget: 1800 },
              ].map((m, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/60 flex items-center justify-between text-xs text-indigo-950 shadow-xs"
                >
                  <span className="font-serif italic font-bold text-sm">{m.month}</span>
                  <div className="font-serif italic text-sm">
                    <span className="text-indigo-950 font-bold">
                      {budgetConfig.currencySymbol}
                      {m.spent}
                    </span>
                    <span className="text-indigo-400 ml-1">
                      / {budgetConfig.currencySymbol}
                      {m.budget}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


