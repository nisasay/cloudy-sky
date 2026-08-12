import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Check, DollarSign, Tag, FileText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';

export const EditTransactionModal: React.FC = () => {
  const {
    editingTransaction,
    setEditingTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    budgetConfig,
    getCatName,
    t,
  } = useApp();

  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setAmountInput(editingTransaction.amount.toString());
      setNoteInput(editingTransaction.note || '');
      setSelectedCatId(editingTransaction.categoryId || (categories[0]?.id ?? 'c1'));
      setTxType(editingTransaction.type || 'expense');
      setShowConfirmDelete(false);
    }
  }, [editingTransaction, categories]);

  if (!editingTransaction) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    updateTransaction(editingTransaction.id, {
      amount: parsedAmount,
      note: noteInput.trim(),
      categoryId: selectedCatId,
      type: txType,
    });

    setEditingTransaction(null);
  };

  const handleDelete = () => {
    deleteTransaction(editingTransaction.id);
    setEditingTransaction(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-3xl border border-white/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base font-serif italic font-bold text-indigo-950">
                {t('language') === 'zh' ? '交易明细与修改' : 'Transaction Details & Edit'}
              </h3>
            </div>

            <button
              onClick={() => setEditingTransaction(null)}
              className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Type Selector (Expense / Income) */}
            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1.5 font-serif italic">
                {t('language') === 'zh' ? '交易类型' : 'Transaction Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    txType === 'expense'
                      ? 'bg-indigo-900 border-indigo-900 text-white shadow-sm font-serif italic'
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:bg-indigo-100/50'
                  }`}
                >
                  <ArrowDownCircle className={`w-3.5 h-3.5 ${txType === 'expense' ? 'text-indigo-200' : 'text-rose-500'}`} />
                  <span>{t('language') === 'zh' ? '支出' : 'Expense'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    txType === 'income'
                      ? 'bg-indigo-900 border-indigo-900 text-white shadow-sm font-serif italic'
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:bg-indigo-100/50'
                  }`}
                >
                  <ArrowUpCircle className={`w-3.5 h-3.5 ${txType === 'income' ? 'text-indigo-200' : 'text-emerald-500'}`} />
                  <span>{t('language') === 'zh' ? '收入' : 'Income'}</span>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1 font-serif italic">
                {t('language') === 'zh' ? '金额' : 'Amount'} ({budgetConfig.currencySymbol})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400 font-serif italic">
                  {budgetConfig.currencySymbol}
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-base font-serif italic text-indigo-950 font-bold focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Description / Note */}
            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1 font-serif italic">
                {t('language') === 'zh' ? '描述 / 备注' : 'Description / Note'}
              </label>
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={t('language') === 'zh' ? '如：午餐、买咖啡、外卖...' : 'e.g. Lunch, Coffee...'}
                className="w-full px-4 py-2.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-950 placeholder-indigo-300 font-serif italic focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Category selection (only relevant for expenses) */}
            {txType === 'expense' && (
              <div>
                <label className="text-xs font-bold text-indigo-400 block mb-1.5 font-serif italic">
                  {t('language') === 'zh' ? '关联云朵分类' : 'Category'}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-900 border-indigo-900 text-white shadow-xs font-serif italic'
                            : 'bg-indigo-50/60 border-indigo-100 text-indigo-700 hover:bg-indigo-100/70'
                        }`}
                      >
                        {getCatName(cat.name)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2">
              {showConfirmDelete ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-rose-800">
                    {t('language') === 'zh' ? '确定要删除此记录？' : 'Delete this transaction?'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                    >
                      {t('language') === 'zh' ? '确认删除' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      {t('language') === 'zh' ? '取消' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-indigo-200" />
                    <span>{t('language') === 'zh' ? '保存修改' : 'Save Changes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('language') === 'zh' ? '删除记录' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
