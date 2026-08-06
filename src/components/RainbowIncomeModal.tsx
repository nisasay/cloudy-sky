import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, DollarSign, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RainbowIncomeModal: React.FC = () => {
  const {
    isRainbowModalOpen,
    setIsRainbowModalOpen,
    logRainbowIncome,
    budgetConfig,
    t,
  } = useApp();

  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountInput);
    if (!num || num <= 0) return;

    logRainbowIncome(num, noteInput || t('rainbow_default_note'));
    setIsRainbowModalOpen(false);
    setAmountInput('');
    setNoteInput('');
  };

  if (!isRainbowModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-white/95 backdrop-blur-3xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌈</span>
              <h3 className="text-lg font-serif italic font-bold text-indigo-950">
                {t('rainbow_title')}
              </h3>
            </div>
            <button
              onClick={() => setIsRainbowModalOpen(false)}
              className="w-8 h-8 rounded-full bg-indigo-100/70 flex items-center justify-center text-indigo-600 hover:text-indigo-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-indigo-600/80 mb-5 leading-relaxed font-serif italic">
            {t('rainbow_desc')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {t('rainbow_amount')} ({budgetConfig.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-base font-serif italic font-bold text-indigo-950 focus:outline-none focus:border-indigo-400"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {t('rainbow_note')}
              </label>
              <input
                type="text"
                placeholder={t('rainbow_note_placeholder')}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-serif italic focus:outline-none focus:border-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>{t('rainbow_submit')}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

