import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cloud, Plus, Trash2, Calendar, DollarSign, PieChart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CloudCategory } from '../types';
import { WatercolorPieChart } from './WatercolorPieChart';

export const BudgetConfigModal: React.FC = () => {
  const {
    isBudgetConfigOpen,
    setIsBudgetConfigOpen,
    categories,
    updateCategories,
    budgetConfig,
    updateBudgetConfig,
    t,
  } = useApp();

  const [localCategories, setLocalCategories] = useState<CloudCategory[]>(categories);
  const [fixedIncomeInput, setFixedIncomeInput] = useState(budgetConfig.fixedIncome.toString());
  const [paydayInput, setPaydayInput] = useState(budgetConfig.payday.toString());
  const [savingsTargetInput, setSavingsTargetInput] = useState(budgetConfig.savingsTarget.toString());

  // Sync when modal opens
  React.useEffect(() => {
    if (isBudgetConfigOpen) {
      setLocalCategories(categories);
      setFixedIncomeInput(budgetConfig.fixedIncome.toString());
      setPaydayInput(budgetConfig.payday.toString());
      setSavingsTargetInput(budgetConfig.savingsTarget.toString());
    }
  }, [isBudgetConfigOpen, categories, budgetConfig]);

  const handleCategoryLimitChange = (id: string, newLimit: number) => {
    setLocalCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, budgetLimit: Math.max(0, newLimit) } : c))
    );
  };

  const handleCategoryNameChange = (id: string, newName: string) => {
    setLocalCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleAddCategory = () => {
    const newCat: CloudCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Cloud',
      budgetLimit: 200,
      spent: 0,
      color: 'from-sky-200/80 via-indigo-100/70 to-blue-200/80',
      icon: 'Cloud',
    };
    setLocalCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    if (localCategories.length <= 1) return;
    setLocalCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    updateCategories(localCategories);
    updateBudgetConfig({
      fixedIncome: parseFloat(fixedIncomeInput) || 0,
      payday: parseInt(paydayInput, 10) || 1,
      savingsTarget: parseFloat(savingsTargetInput) || 10000,
    });
    setIsBudgetConfigOpen(false);
  };

  if (!isBudgetConfigOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-xl bg-white/95 backdrop-blur-3xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-serif italic font-bold text-indigo-950">
                {t('config_title')}
              </h3>
            </div>
            <button
              onClick={() => setIsBudgetConfigOpen(false)}
              className="w-8 h-8 rounded-full bg-indigo-100/70 flex items-center justify-center text-indigo-600 hover:text-indigo-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Payday & Fixed Income Settings */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {t('config_income')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-indigo-400 font-serif italic">
                  {budgetConfig.currencySymbol}
                </span>
                <input
                  type="number"
                  value={fixedIncomeInput}
                  onChange={(e) => setFixedIncomeInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs font-serif italic font-bold text-indigo-950 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {t('config_payday')}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={paydayInput}
                onChange={(e) => setPaydayInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs font-serif italic font-bold text-indigo-950 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Category List Editing */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                {t('panelA_cloud_categories')}
              </span>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-950 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('config_add_cloud')}</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {localCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleCategoryNameChange(cat.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-indigo-100 rounded-xl text-xs font-serif italic font-bold text-indigo-950 focus:outline-none focus:border-indigo-400"
                  />

                  <div className="w-28 relative">
                    <span className="absolute left-2.5 top-2 text-xs text-indigo-400 font-serif italic">
                      {budgetConfig.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={cat.budgetLimit}
                      onChange={(e) =>
                        handleCategoryLimitChange(cat.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-6 pr-2 py-1.5 bg-white border border-indigo-100 rounded-xl text-xs font-serif italic font-bold text-indigo-950 focus:outline-none focus:border-indigo-400 text-right"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-indigo-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Watercolor Pie Chart Allocation Render */}
          <div className="mb-6">
            <WatercolorPieChart
              categories={localCategories}
              fixedIncome={parseFloat(fixedIncomeInput) || 0}
              currencySymbol={budgetConfig.currencySymbol}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            {t('config_save_btn')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

