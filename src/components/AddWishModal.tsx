import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Flame, Pin, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PriorityLevel } from '../types';

export const AddWishModal: React.FC = () => {
  const { isAddWishOpen, setIsAddWishOpen, addWish, budgetConfig, categories, t, getCatName } = useApp();

  const [title, setTitle] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('reminder');
  const [categoryHint, setCategoryHint] = useState(categories[0]?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceInput);
    if (!title || !price || price <= 0) return;

    addWish(title, price, priority, categoryHint);
    setIsAddWishOpen(false);
    setTitle('');
    setPriceInput('');
    setPriority('reminder');
  };

  if (!isAddWishOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-white/95 backdrop-blur-3xl border border-white/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-serif italic font-bold text-indigo-950">{t('add_wish_title')}</h3>
            </div>
            <button
              onClick={() => setIsAddWishOpen(false)}
              className="w-8 h-8 rounded-full bg-indigo-100/70 flex items-center justify-center text-indigo-600 hover:text-indigo-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1 font-serif italic">
                {t('add_wish_name')}
              </label>
              <input
                type="text"
                placeholder={t('add_wish_name_placeholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-serif italic focus:outline-none focus:border-indigo-400"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1 font-serif italic">
                {t('add_wish_price')} ({budgetConfig.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-sm font-serif italic font-bold text-indigo-950 focus:outline-none focus:border-indigo-400"
                required
              />
            </div>

            {/* Priority Tier Choice */}
            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1.5 font-serif italic">
                {t('add_wish_priority')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dream' as PriorityLevel, label: t('panelB_priority_dream'), Icon: Sparkles, color: 'text-amber-500' },
                  { id: 'heartFlutter' as PriorityLevel, label: t('panelB_priority_heart'), Icon: Flame, color: 'text-pink-500' },
                  { id: 'reminder' as PriorityLevel, label: t('panelB_priority_reminder'), Icon: Pin, color: 'text-sky-500' },
                ].map((item) => {
                  const IconComponent = item.Icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPriority(item.id)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        priority === item.id
                          ? 'bg-indigo-900 border-indigo-900 text-white shadow-sm font-serif italic'
                          : 'bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:text-indigo-950 hover:bg-indigo-100/50'
                      }`}
                    >
                      <IconComponent className={`w-3.5 h-3.5 ${priority === item.id ? 'text-indigo-200' : item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Hint */}
            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1.5 font-serif italic">
                {t('add_wish_cat_hint')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => {
                  const isSelected = categoryHint === c.name;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategoryHint(c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-900 border-indigo-900 text-white shadow-xs font-serif italic'
                          : 'bg-indigo-50/60 border-indigo-100 text-indigo-700 hover:bg-indigo-100/70'
                      }`}
                    >
                      {getCatName(c.name)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_wish_btn')}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

