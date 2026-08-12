import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Plus, Receipt, X, Delete, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoggingExpenseModal: React.FC = () => {
  const {
    isLoggingOpen,
    setIsLoggingOpen,
    selectedCategoryForLogging,
    loggingPrefill,
    setLoggingPrefill,
    transactions,
    budgetConfig,
    language,
    logExpense,
    matchedWishForNote,
    setEditingTransaction,
    t,
    getCatName,
  } = useApp();

  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isReceiptView, setIsReceiptView] = useState(false);

  // Sync prefilled data when logging modal opens
  useEffect(() => {
    if (isLoggingOpen) {
      if (loggingPrefill) {
        setAmountInput(loggingPrefill.amount !== undefined ? String(loggingPrefill.amount) : '');
        setNoteInput(loggingPrefill.note || '');
      } else {
        setAmountInput('');
        setNoteInput('');
      }
      setIsReceiptView(false);
    }
  }, [isLoggingOpen, loggingPrefill]);

  if (!isLoggingOpen || !selectedCategoryForLogging) return null;

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setAmountInput((prev) => prev.slice(0, -1));
      return;
    }

    if (val === '.') {
      if (amountInput.includes('.')) return;
      if (amountInput === '') {
        setAmountInput('0.');
        return;
      }
    }

    // Limit decimal places to 2
    if (amountInput.includes('.')) {
      const parts = amountInput.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    // Max 7 integer digits
    if (!amountInput.includes('.') && amountInput.length >= 7) return;

    setAmountInput((prev) => prev + val);
  };

  // Check seamless wish erasure matching
  const matchedWish = noteInput.trim() ? matchedWishForNote(noteInput) : null;
  const wishToFulfillId = loggingPrefill?.wishId || matchedWish?.id;

  const handleSubmitExpense = () => {
    const numericAmount = parseFloat(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    logExpense(
      selectedCategoryForLogging.id,
      numericAmount,
      noteInput.trim(),
      wishToFulfillId
    );

    setLoggingPrefill(null);
    setIsLoggingOpen(false);
  };

  const handleClose = () => {
    setLoggingPrefill(null);
    setIsLoggingOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6 overflow-y-auto">
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-lg bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] p-6 shadow-2xl relative my-auto max-h-[82vh] overflow-y-auto"
        >
          <div className="w-12 h-1 bg-indigo-200 rounded-full mx-auto mb-4" />

          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-indigo-950 truncate font-serif italic">
                {getCatName(selectedCategoryForLogging.name)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Receipt Toggle Button */}
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
                onClick={handleClose}
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

                <div className="border-b border-dashed border-indigo-200/80 my-2" />

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
                        onClick={() => {
                          setEditingTransaction(tx);
                          handleClose();
                        }}
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

                <div className="border-b border-dashed border-indigo-200/80 my-2" />

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

                <div className="border-b-2 border-double border-indigo-200 my-3" />

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
            /* Standard Keypad / Prefilled Logging View */
            <div>
              {/* Amount Display */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 mb-3 text-right">
                <span className="text-xs text-indigo-400 block mb-1 uppercase tracking-wider font-semibold font-serif italic">
                  {t('panelA_spent')} ({budgetConfig.currencySymbol})
                </span>
                <span className="text-3xl sm:text-4xl font-serif italic text-indigo-950 font-bold">
                  {budgetConfig.currencySymbol}
                  {amountInput || '0'}
                </span>
              </div>

              {/* Note Input & Wish Matching */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t('logging_note_placeholder')}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-indigo-400 font-serif italic"
                />

                {/* Seamless Note Matching Prompt */}
                {matchedWish && !loggingPrefill?.wishId && (
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

                {/* Prefilled Wish Indicator */}
                {loggingPrefill?.wishId && (
                  <div className="mt-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2 text-xs text-indigo-800 font-serif italic">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>正在录入心愿【{loggingPrefill.note}】的支出，提交后将同步完成心愿</span>
                  </div>
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
                <span>确认记录支出</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
