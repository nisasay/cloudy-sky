import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Pin,
  Layers,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  MoreHorizontal,
  X,
  Snowflake,
  Leaf,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Brain,
  HelpCircle,
  Sprout,
  ShoppingBag,
  Gem,
  Crown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PriceTier, PriorityLevel, WishItem } from '../types';
import { DissolvableText } from './DissolvableText';

export const PanelB: React.FC = () => {
  const {
    wishes,
    budgetConfig,
    categories,
    updateWishStatus,
    putWishInCooldown,
    openLoggingModal,
    setIsAddWishOpen,
    setHesitationWish,
    setIsHesitationOpen,
    t,
    getCatName,
  } = useApp();

  // Mode: 'priority' (3-page horizontal horizontal paging) vs 'tier' (Purchasing Power tiers)
  const [viewMode, setViewMode] = useState<'priority' | 'tier'>('priority');

  // Priority Paging Tab: 'heartFlutter' (default center), 'dream', 'reminder'
  const [activePriorityTab, setActivePriorityTab] = useState<PriorityLevel>('heartFlutter');

  // Selected Wish Detail Modal Sheet
  const [selectedWish, setSelectedWish] = useState<WishItem | null>(null);

  // Category selector modal when marking "Bought It!"
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Cool-down drawer collapsed toggle
  const [isCooldownDrawerOpen, setIsCooldownDrawerOpen] = useState(false);

  // Fulfilled drawer collapsed toggle
  const [isFulfilledDrawerOpen, setIsFulfilledDrawerOpen] = useState(false);

  // Filter out active vs cool-down vs fulfilled/abandoned
  const normalWishes = wishes.filter((w) => w.status === 'normal');
  const coolDownWishes = wishes.filter((w) => w.status === 'coolDown');
  const fulfilledWishes = wishes.filter((w) => w.status === 'fulfilled');

  // Priority page filtering
  const filteredPriorityWishes = normalWishes.filter((w) => w.priority === activePriorityTab);

  // Bottom drawers filtered by active priority tab when in priority view mode
  const displayCoolDownWishes =
    viewMode === 'priority'
      ? coolDownWishes.filter((w) => w.priority === activePriorityTab)
      : coolDownWishes;

  const displayFulfilledWishes =
    viewMode === 'priority'
      ? fulfilledWishes.filter((w) => w.priority === activePriorityTab)
      : fulfilledWishes;

  // Tier group filtering (respecting hideRemindersInTierView setting)
  const shouldHideReminders = budgetConfig.hideRemindersInTierView ?? true;
  const getTierWishes = (tier: PriceTier) =>
    normalWishes.filter((w) => {
      if (shouldHideReminders && w.priority === 'reminder') {
        return false;
      }
      return w.priceTier === tier;
    });

  const handleActionBoughtIt = () => {
    if (!selectedWish) return;
    setIsCategoryPickerOpen(true);
  };

  const handleConfirmCategoryAndBuy = (catId: string) => {
    if (!selectedWish) return;
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      openLoggingModal(cat, {
        amount: selectedWish.price,
        note: selectedWish.title,
        wishId: selectedWish.id,
      });
    }
    setIsCategoryPickerOpen(false);
    setSelectedWish(null);
  };

  const handleActionAbandon = () => {
    if (!selectedWish) return;
    updateWishStatus(selectedWish.id, 'abandoned', 'Decided against it — added to Impulse Blocked Pool!');
    setSelectedWish(null);
  };

  const handleActionCooldown = (hours = 24) => {
    if (!selectedWish) return;
    putWishInCooldown(selectedWish.id, hours);
    setSelectedWish(null);
  };

  const handleOpenHesitation = (wish: WishItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setHesitationWish(wish);
    setIsHesitationOpen(true);
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-8 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Header & View Mode Switch */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tight text-indigo-950">
            {t('nav_wishlist')}
          </h1>
          <DissolvableText id="panelB_subtitle" as="p" className="text-xs uppercase tracking-widest text-indigo-500 mt-1 font-semibold">
            {t('panelB_subtitle')}
          </DissolvableText>
        </div>

        <div className="flex items-center gap-3">
          {/* Dual-View Mode Toggle Button */}
          <button
            onClick={() => setViewMode(viewMode === 'priority' ? 'tier' : 'priority')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 border border-white/60 backdrop-blur-md text-xs font-semibold text-indigo-900 shadow-sm transition-all"
            title="Toggle Priority Paging vs Purchasing Power Tiers"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>{viewMode === 'priority' ? 'Priority View' : 'Tier View'}</span>
          </button>

          {/* Add Wish Button */}
          <button
            onClick={() => setIsAddWishOpen(true)}
            className="w-10 h-10 rounded-full bg-indigo-900 hover:bg-indigo-800 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
            title={t('panelB_add_wish')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Priority Mode (3-Page Horizontal Paging) */}
      {viewMode === 'priority' && (
        <div>
          {/* 3 Horizontal Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 mb-6 shadow-sm">
            <button
              onClick={() => setActivePriorityTab('dream')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePriorityTab === 'dream'
                  ? 'bg-white border border-indigo-200 text-indigo-950 shadow-md font-serif italic'
                  : 'text-indigo-400 hover:text-indigo-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('panelB_priority_dream')}</span>
            </button>

            <button
              onClick={() => setActivePriorityTab('heartFlutter')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePriorityTab === 'heartFlutter'
                  ? 'bg-white border border-indigo-200 text-indigo-950 shadow-md font-serif italic'
                  : 'text-indigo-400 hover:text-indigo-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-pink-500" />
              <span>{t('panelB_priority_heart')}</span>
            </button>

            <button
              onClick={() => setActivePriorityTab('reminder')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePriorityTab === 'reminder'
                  ? 'bg-white border border-indigo-200 text-indigo-950 shadow-md font-serif italic'
                  : 'text-indigo-400 hover:text-indigo-800'
              }`}
            >
              <Pin className="w-3.5 h-3.5 text-sky-500" />
              <span>{t('panelB_priority_reminder')}</span>
            </button>
          </div>

          {/* Cards List for active priority page */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePriorityTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filteredPriorityWishes.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white/40 border border-white/60 text-indigo-400 text-sm italic font-serif">
                  {t('panelB_empty')}
                </div>
              ) : (
                filteredPriorityWishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedWish(wish)}
                    className="group p-4 sm:p-5 rounded-3xl bg-white/50 hover:bg-white/70 border border-white/70 hover:border-indigo-200 backdrop-blur-xl shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {wish.priority === 'dream' && <Sparkles className="w-5 h-5 text-amber-500" />}
                        {wish.priority === 'heartFlutter' && <Flame className="w-5 h-5 text-pink-500" />}
                        {wish.priority === 'reminder' && <Pin className="w-5 h-5 text-sky-500" />}
                      </div>
                      <div>
                        <h3 className="text-base font-serif italic text-indigo-950 group-hover:text-indigo-700 transition-colors">
                          {wish.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-indigo-400">
                          {wish.categoryHint && (
                            <span className="text-indigo-600 font-medium">{t('panelB_cat_hint', { hint: getCatName(wish.categoryHint) })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-serif italic font-bold text-indigo-950">
                        {budgetConfig.currencySymbol}
                        {wish.price.toLocaleString()}
                      </span>

                      {/* Ask Liquid Assistant Button */}
                      <button
                        onClick={(e) => handleOpenHesitation(wish, e)}
                        className="p-2.5 rounded-xl bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-700 border border-indigo-200 transition-colors shadow-sm"
                        title={t('panelB_btn_hesitate')}
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Purchasing Power Mode (Dual-View Tier View) */}
      {viewMode === 'tier' && (
        <div className="space-y-6">
          {[
            { tier: 'pocketMoney' as PriceTier, title: t('panelB_price_pocket'), Icon: Sprout },
            { tier: 'small' as PriceTier, title: t('panelB_price_small'), Icon: ShoppingBag },
            { tier: 'big' as PriceTier, title: t('panelB_price_big'), Icon: Gem },
            { tier: 'dream' as PriceTier, title: t('panelB_price_dream'), Icon: Crown },
          ].map((group) => {
            const list = getTierWishes(group.tier);
            const TierIcon = group.Icon;

            return (
              <div key={group.tier} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase tracking-wider px-1 font-serif italic">
                  <TierIcon className="w-4 h-4 text-indigo-600 stroke-[1.75]" />
                  <span>{group.title}</span>
                  <span className="text-indigo-400 font-normal">({list.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {list.length === 0 ? (
                    <div className="p-3 text-xs text-indigo-400 italic rounded-2xl bg-white/30 border border-white/50">
                      {t('panelB_empty')}
                    </div>
                  ) : (
                    list.map((wish) => (
                      <div
                        key={wish.id}
                        onClick={() => setSelectedWish(wish)}
                        className="p-4 rounded-2xl bg-white/50 hover:bg-white/80 border border-white/60 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                      >
                        <div>
                          <h4 className="text-sm font-serif italic text-indigo-950 font-bold">{wish.title}</h4>
                        </div>
                        <span className="text-base font-serif italic font-bold text-indigo-950">
                          {budgetConfig.currencySymbol}
                          {wish.price}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fulfilled / Completed Section (Strikethrough / Grayed out) */}
      {displayFulfilledWishes.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setIsFulfilledDrawerOpen(!isFulfilledDrawerOpen)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/60 text-xs font-semibold text-slate-600 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{t('panelB_fulfilled_badge')} ({displayFulfilledWishes.length})</span>
            </div>
            {isFulfilledDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {isFulfilledDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {displayFulfilledWishes.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWish(w)}
                    className="p-3.5 rounded-2xl bg-slate-100/50 border border-slate-200/60 flex items-center justify-between text-xs transition-colors cursor-pointer hover:bg-slate-100/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-serif italic font-medium text-slate-500 line-through decoration-slate-400 truncate">
                        {w.title}
                      </span>
                    </div>
                    <span className="font-serif italic font-bold text-slate-400 line-through decoration-slate-400 ml-2 flex-shrink-0">
                      {budgetConfig.currencySymbol}
                      {w.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Cool-down Collapsed Bottom Drawer */}
      {displayCoolDownWishes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setIsCooldownDrawerOpen(!isCooldownDrawerOpen)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/50 border border-white/60 text-xs font-semibold text-indigo-700 hover:bg-white/70 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-sky-500" />
              <span>{t('panelB_cooldown_badge')} ({displayCoolDownWishes.length})</span>
            </div>
            {isCooldownDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {isCooldownDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {displayCoolDownWishes.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWish(w)}
                    className="p-3 rounded-2xl bg-white/60 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-serif italic font-medium">{w.title}</span>
                    </div>
                    <span className="font-serif italic font-bold text-indigo-950">
                      {budgetConfig.currencySymbol}
                      {w.price}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Wish Detail Sheet — 3-Option Action Modal */}
      <AnimatePresence>
        {selectedWish && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 pt-14 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6 overflow-hidden">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative w-full max-w-md my-auto flex flex-col max-h-[78vh]"
            >
              {/* Floating Close Button — Outside the card box */}
              <button
                type="button"
                onClick={() => setSelectedWish(null)}
                className="absolute -top-11 right-1 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xl text-indigo-950 hover:text-indigo-600 hover:bg-white shadow-lg transition-all border border-white/80 flex items-center justify-center cursor-pointer group"
                title={t('close') || '关闭'}
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90 text-indigo-900" />
              </button>

              {/* Modal Box Container */}
              <div className="w-full bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[78vh]">
                <div className="p-6 pb-3 border-b border-indigo-100/60 flex items-center justify-between bg-indigo-50/20 flex-shrink-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    {t('nav_wishlist')}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Wish Card Preview */}
                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 mb-2">
                    <h3 className="text-xl font-serif italic text-indigo-950 font-bold">{selectedWish.title}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-serif italic font-extrabold text-indigo-950">
                        {budgetConfig.currencySymbol}
                        {selectedWish.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons / Status */}
                  {selectedWish.status === 'fulfilled' ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-serif italic font-bold text-emerald-900">
                        {t('panelB_fulfilled_badge')}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* 1. [ 🍂 No Longer Want It ] */}
                      <button
                        onClick={handleActionAbandon}
                        className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Leaf className="w-4 h-4 text-amber-600" />
                          <span>{t('panelB_btn_abandon')}</span>
                        </div>
                      </button>

                      {/* 2. [ ❄️ Put in Cool-down Period ] */}
                      <button
                        onClick={() => handleActionCooldown(24)}
                        className="w-full p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Snowflake className="w-4 h-4 text-sky-600" />
                          <span>{t('panelB_btn_cooldown')}</span>
                        </div>
                      </button>

                      {/* 3. [ 🎉 Bought It! ] */}
                      <button
                        onClick={handleActionBoughtIt}
                        className="w-full p-3.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-between shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('panelB_btn_fulfill')}</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Selection Modal for "Bought It!" */}
      <AnimatePresence>
        {isCategoryPickerOpen && selectedWish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white/95 backdrop-blur-3xl border border-white/80 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-base font-serif italic font-bold text-indigo-950 mb-1">{t('fulfill_title')}</h3>
              <p className="text-xs text-indigo-500 mb-4">
                {t('fulfill_subtitle')}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleConfirmCategoryAndBuy(cat.id)}
                    className="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 text-xs font-semibold text-indigo-950 text-left transition-colors"
                  >
                    {getCatName(cat.name)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsCategoryPickerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-100 text-xs text-indigo-700 hover:bg-indigo-200 font-semibold"
              >
                {t('profile_cancel')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

