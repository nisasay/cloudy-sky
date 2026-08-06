import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Snowflake, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AnalysisResult {
  itemName: string;
  itemPrice: number;
  equivalentCoffee: number;
  budgetPercentage: number;
  equivalentText: string;
  impactAnalysis: string;
  recommendation: 'cooling' | 'buy';
  recommendationLabel: string;
  advice: string;
}

const QUICK_EXAMPLES = [
  '“我想要一把 450 块的人体工学椅”',
  '“看到一个 89 块的香薰蜡烛很好看”',
  '“看中一副 1200 块的降噪耳机”',
];

export const HesitationAssistantModal: React.FC = () => {
  const {
    isHesitationOpen,
    setIsHesitationOpen,
    budgetConfig,
    totalSpentThisMonth,
    remainingBudgetThisMonth,
    addWish,
    setIsLoggingOpen,
    setSelectedCategoryForLogging,
    categories,
  } = useApp();

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (queryText?: string) => {
    const textToAnalyze = queryText || userInput;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/hesitation-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: textToAnalyze,
          currentBudget: budgetConfig.totalBudget,
          budgetSpent: totalSpentThisMonth,
          remainingBudget: remainingBudgetThisMonth,
        }),
      });

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Failed to get hesitation analysis:', err);
      setAnalysisResult({
        itemName: '意向商品',
        itemPrice: 200,
        equivalentCoffee: 7,
        budgetPercentage: 12,
        equivalentText: '相当于 7 杯咖啡 ☕ · 占剩余预算 12%',
        impactAnalysis:
          '该额外支出属于一次性冲动萌芽，请评估是否能为你带来持续的情感或生活价值。',
        recommendation: 'cooling',
        recommendationLabel: '冷静一下',
        advice: '建议放入 24 小时冷静胶囊，给冲动降降温。',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoolDownCapsule = () => {
    if (!analysisResult) return;
    addWish({
      title: analysisResult.itemName || '意向商品',
      price: analysisResult.itemPrice || 100,
      priority: 'medium',
      priceTier: 'medium',
      categoryHint: 'Extra Expense',
    });

    setIsHesitationOpen(false);
    setUserInput('');
    setAnalysisResult(null);
  };

  const handleBuyNow = () => {
    setIsHesitationOpen(false);
    setUserInput('');
    setAnalysisResult(null);
    if (categories.length > 0) {
      setSelectedCategoryForLogging(categories[0]);
      setIsLoggingOpen(true);
    }
  };

  if (!isHesitationOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/25 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="w-full max-w-sm bg-white/95 backdrop-blur-3xl rounded-[2.5rem] p-7 shadow-2xl border border-white/80 relative overflow-visible"
        >
          {/* Floating Close Button at top-right corner boundary (Borderless, Larger Dark X) */}
          <button
            onClick={() => {
              setIsHesitationOpen(false);
              setAnalysisResult(null);
              setUserInput('');
            }}
            className="absolute top-3.5 right-4 z-30 p-1 text-indigo-950 hover:text-indigo-600 transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>

          {/* Header */}
          <div className="text-left mb-4 pr-8">
            <h3 className="text-base font-serif italic font-bold text-indigo-950 tracking-wide">
              {analysisResult ? '💡' : '有一笔钱不知道该不该花…'}
            </h3>
          </div>

          {!analysisResult ? (
            <>
              {/* Text Input with No Placeholder (Left-aligned) */}
              <div className="mb-4">
                <textarea
                  rows={2}
                  placeholder=""
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full px-4 py-3 bg-indigo-50/40 hover:bg-indigo-50/60 focus:bg-indigo-50/80 rounded-2xl text-xs text-indigo-950 focus:outline-none transition-all font-serif italic resize-none leading-relaxed text-left"
                />

                {/* Centered Double-Quoted Examples in Dark Gray */}
                <div className="flex flex-col items-center gap-2 mt-3 text-center">
                  {QUICK_EXAMPLES.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const cleanText = ex.replace(/[“”]/g, '');
                        setUserInput(cleanText);
                      }}
                      className="text-center text-xs text-gray-600 hover:text-indigo-950 font-serif italic transition-colors cursor-pointer select-none"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading || !userInput.trim()}
                className="w-full py-3 rounded-full bg-indigo-950 hover:bg-indigo-900 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                    <span>分析中…</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    <span>给出建议</span>
                  </span>
                )}
              </button>
            </>
          ) : (
            /* In-place Replaced Analysis Result */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3.5 pt-1"
            >
              {/* Item & Price Header */}
              <div className="flex items-baseline justify-between border-b border-indigo-100/60 pb-3">
                <span className="font-serif font-bold text-sm text-indigo-950">
                  {analysisResult.itemName}
                </span>
                <span className="font-serif italic font-bold text-lg text-indigo-900">
                  ¥{analysisResult.itemPrice}
                </span>
              </div>

              {/* Minimal Equivalency Line */}
              <div className="text-[11px] text-indigo-500 font-medium text-center">
                ≈ {analysisResult.equivalentCoffee} 杯咖啡 · 占剩余预算 {analysisResult.budgetPercentage}%
              </div>

              {/* Rational Advice Text */}
              <p className="text-xs leading-relaxed text-indigo-900/85 font-serif italic text-center px-1 py-0.5">
                {analysisResult.impactAnalysis}
              </p>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={handleCoolDownCapsule}
                  className="py-2.5 px-3 rounded-full bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Snowflake className="w-3.5 h-3.5 text-indigo-500" />
                  <span>冷静 24h</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-2.5 px-3 rounded-full bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-pink-300" />
                  <span>记为支出</span>
                </button>
              </div>

              {/* Re-analyze link */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setUserInput('');
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-700 font-serif italic underline cursor-pointer"
                >
                  再算一笔
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

