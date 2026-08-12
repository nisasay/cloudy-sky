import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PiggyBank, Plus, Trash2, Wallet, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SavingsAccountBalance } from '../types';

export const SavingsModals: React.FC = () => {
  const {
    isAnnualGoalModalOpen,
    setIsAnnualGoalModalOpen,
    selectedAccountForModal,
    setSelectedAccountForModal,
    budgetConfig,
    saveAnnualSavingsTarget,
    saveSavingsAccount,
    deleteSavingsAccount,
    t,
  } = useApp();

  // Annual Goal Modal State
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (isAnnualGoalModalOpen) {
      setGoalInput(
        budgetConfig.annualSavingsTarget && budgetConfig.annualSavingsTarget > 0
          ? budgetConfig.annualSavingsTarget.toString()
          : ''
      );
    }
  }, [isAnnualGoalModalOpen, budgetConfig.annualSavingsTarget]);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(goalInput);
    saveAnnualSavingsTarget(isNaN(val) ? 0 : Math.max(0, val));
    setIsAnnualGoalModalOpen(false);
  };

  const currentGoalNum = parseFloat(goalInput);
  const monthlyTarget = !isNaN(currentGoalNum) && currentGoalNum > 0 ? (currentGoalNum / 12).toFixed(2) : '0.00';

  // Savings Account Modal State
  const [accountName, setAccountName] = useState('');
  const [balances, setBalances] = useState<SavingsAccountBalance[]>([]);

  useEffect(() => {
    if (selectedAccountForModal === 'new') {
      setAccountName('');
      setBalances([
        { id: `bal-${Date.now()}`, currency: budgetConfig.currencyCode || 'USD', amount: 0 },
      ]);
    } else if (selectedAccountForModal) {
      setAccountName(selectedAccountForModal.name);
      setBalances(
        selectedAccountForModal.balances && selectedAccountForModal.balances.length > 0
          ? selectedAccountForModal.balances
          : [{ id: `bal-${Date.now()}`, currency: budgetConfig.currencyCode || 'USD', amount: 0 }]
      );
    }
  }, [selectedAccountForModal, budgetConfig.currencyCode]);

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForModal) return;

    const trimmedName = accountName.trim() || 'Savings Account';
    const cleanBalances = balances.map((b) => ({
      ...b,
      currency: (b.currency || 'USD').trim().toUpperCase(),
      amount: isNaN(b.amount) ? 0 : Number(b.amount),
    }));

    saveSavingsAccount({
      id: selectedAccountForModal === 'new' ? undefined : selectedAccountForModal.id,
      name: trimmedName,
      balances: cleanBalances,
    });

    setSelectedAccountForModal(null);
  };

  const handleAddBalanceRow = () => {
    setBalances((prev) => [
      ...prev,
      { id: `bal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, currency: 'USD', amount: 0 },
    ]);
  };

  const handleRemoveBalanceRow = (id: string) => {
    if (balances.length <= 1) return;
    setBalances((prev) => prev.filter((b) => b.id !== id));
  };

  const handleBalanceCurrencyChange = (id: string, currency: string) => {
    setBalances((prev) =>
      prev.map((b) => (b.id === id ? { ...b, currency } : b))
    );
  };

  const handleBalanceAmountChange = (id: string, amountStr: string) => {
    const val = parseFloat(amountStr);
    setBalances((prev) =>
      prev.map((b) => (b.id === id ? { ...b, amount: isNaN(val) ? 0 : val } : b))
    );
  };

  const handleDeleteAccount = () => {
    if (selectedAccountForModal && selectedAccountForModal !== 'new') {
      deleteSavingsAccount(selectedAccountForModal.id);
      setSelectedAccountForModal(null);
    }
  };

  const commonCurrencies = ['USD', 'CNY', 'EUR', 'JPY', 'GBP', 'HKD', 'AUD', 'CAD', 'SGD'];

  return (
    <>
      {/* 1. Annual Savings Goal Modal */}
      <AnimatePresence>
        {isAnnualGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-3xl bg-white/95 border border-white/80 p-6 shadow-2xl space-y-5 overflow-hidden"
            >
              {/* Top Accent Gradient */}
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-200/50 to-purple-200/50 blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-700">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-serif italic font-bold text-slate-800">
                    {t('annual_savings_modal_title')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAnnualGoalModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t('annual_savings_input_label')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {budgetConfig.currencySymbol || '$'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 24000"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                {/* Subtext showing monthly target divided into 12 months */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 text-xs text-indigo-900 flex items-center justify-between">
                  <span className="font-serif italic text-indigo-700">
                    {t('annual_savings_monthly_note', { amount: `${budgetConfig.currencySymbol || '$'}${monthlyTarget}` })}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAnnualGoalModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    {t('profile_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 shadow-md transition-transform active:scale-95"
                  >
                    {t('profile_save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add / Edit Savings Account Modal */}
      <AnimatePresence>
        {selectedAccountForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl bg-white/95 border border-white/80 p-6 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-700">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-serif italic font-bold text-slate-800">
                    {selectedAccountForModal === 'new'
                      ? t('account_modal_add_title')
                      : t('account_modal_edit_title')}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAccountForModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAccountSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Account Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t('account_name_label')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('account_name_placeholder')}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Balances & Currencies list */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    {t('account_balances_label')}
                  </label>

                  <div className="space-y-2.5">
                    {balances.map((b, idx) => (
                      <div
                        key={b.id || idx}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2"
                      >
                        {/* Currency Select / Input */}
                        <div className="w-28 flex-shrink-0">
                          <input
                            type="text"
                            list={`currencies-${b.id}`}
                            value={b.currency}
                            onChange={(e) => handleBalanceCurrencyChange(b.id, e.target.value)}
                            placeholder="USD"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <datalist id={`currencies-${b.id}`}>
                            {commonCurrencies.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>

                        {/* Amount Input */}
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            step="any"
                            value={b.amount === 0 ? '' : b.amount}
                            onChange={(e) => handleBalanceAmountChange(b.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Remove Row Button */}
                        {balances.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBalanceRow(b.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Currency Button */}
                  <button
                    type="button"
                    onClick={handleAddBalanceRow}
                    className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('add_currency_btn')}</span>
                  </button>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center gap-2 pt-3 flex-shrink-0">
                  {selectedAccountForModal !== 'new' && (
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      title={t('account_delete_btn')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedAccountForModal(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    {t('profile_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 shadow-md transition-transform active:scale-95"
                  >
                    {t('account_save_btn')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
