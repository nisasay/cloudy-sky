import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  Cloud,
  DollarSign,
  RefreshCw,
  Lock,
  LockKeyhole,
  Check,
  User,
  Heart,
  Github,
  Award,
  Globe,
  Pin,
  Eye,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../data/translations';
import { getHasEverDissolved, saveDissolvedIds } from './DissolvableText';
import { CloudCategory, Transaction, TransactionType, SavingsAccount, WishItem, BudgetConfig } from '../types';

export const GlobalProfileModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    budgetConfig,
    updateBudgetConfig,
    resetAllData,
    language,
    setLanguage,
    t,
    transactions,
    categories,
    wishes,
    importAppData,
    getCatName,
  } = useApp();

  const [localCurrencySymbol, setLocalCurrencySymbol] = useState(budgetConfig.currencySymbol);
  const [privacyLock, setPrivacyLock] = useState(budgetConfig.privacyLockEnabled || false);
  const [syncEnabled, setSyncEnabled] = useState(budgetConfig.syncEnabled ?? true);
  const [hideRemindersInTier, setHideRemindersInTier] = useState(
    budgetConfig.hideRemindersInTierView ?? true
  );
  const [showGuideTexts, setShowGuideTexts] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleItemTapped = () => {
      setShowGuideTexts(false);
    };
    window.addEventListener('dissolve-item-tapped', handleItemTapped);
    return () => {
      window.removeEventListener('dissolve-item-tapped', handleItemTapped);
    };
  }, []);

  const hasEverDissolved = getHasEverDissolved();

  const handleToggleGuideTexts = (enabled: boolean) => {
    setShowGuideTexts(enabled);
    if (enabled) {
      // Restore all dissolved narrative texts across all screens
      saveDissolvedIds([]);
      window.dispatchEvent(new CustomEvent('dissolve-restore-all'));
    }
  };

  // Helper to parse a single CSV line respecting quotes
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          curr += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(curr.trim());
        curr = '';
      } else {
        curr += char;
      }
    }
    result.push(curr.trim());
    return result;
  };

  // Export full app data (Settings, Income, Payday, Categories, Savings Goals, Accounts, Transactions & Wishlist) to CSV
  const handleExportCSV = () => {
    const isZh = language === 'zh';
    const lines: string[] = [];

    const escapeCSV = (str: string | number | boolean | undefined | null) => {
      const s = String(str ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    // 1. BUDGET_CONFIG
    lines.push('# [BUDGET_CONFIG]');
    lines.push(isZh ? 'Key(键),Value(值)' : 'Key,Value');
    lines.push(`fixedIncome,${escapeCSV(budgetConfig.fixedIncome ?? 0)}`);
    lines.push(`payday,${escapeCSV(budgetConfig.payday ?? 10)}`);
    lines.push(`annualSavingsTarget,${escapeCSV(budgetConfig.annualSavingsTarget ?? 0)}`);
    lines.push(`currencySymbol,${escapeCSV(budgetConfig.currencySymbol ?? '$')}`);
    lines.push(`totalBudget,${escapeCSV(budgetConfig.totalBudget ?? 0)}`);
    lines.push(`privacyLockEnabled,${escapeCSV(budgetConfig.privacyLockEnabled ?? false)}`);
    lines.push(`hideRemindersInTierView,${escapeCSV(budgetConfig.hideRemindersInTierView ?? true)}`);
    lines.push('');

    // 2. CATEGORIES
    lines.push('# [CATEGORIES]');
    lines.push(isZh ? '分类ID,分类名称,预算额度,图标,颜色' : 'ID,Name,BudgetLimit,Icon,Color');
    categories.forEach((cat) => {
      lines.push([
        escapeCSV(cat.id),
        escapeCSV(cat.name),
        escapeCSV(cat.budgetLimit),
        escapeCSV(cat.icon || 'Tag'),
        escapeCSV(cat.color || ''),
      ].join(','));
    });
    lines.push('');

    // 3. SAVINGS_ACCOUNTS
    lines.push('# [SAVINGS_ACCOUNTS]');
    lines.push(isZh ? '账户ID,账户名称,多币种余额明细(Currency:Amount;...)' : 'AccountID,AccountName,Balances');
    (budgetConfig.savingsAccounts || []).forEach((acc) => {
      const balancesStr = (acc.balances || [])
        .map((b) => `${b.currency}:${b.amount}`)
        .join(';');
      lines.push([
        escapeCSV(acc.id),
        escapeCSV(acc.name),
        escapeCSV(balancesStr),
      ].join(','));
    });
    lines.push('');

    // 4. TRANSACTIONS
    lines.push('# [TRANSACTIONS]');
    lines.push(isZh ? '流水ID,内容/备注,金额,类型,时间,分类' : 'ID,Note,Amount,Type,Date,Category');
    transactions.forEach((tx) => {
      const catDisplayName = getCatName(tx.categoryName);
      lines.push([
        escapeCSV(tx.id),
        escapeCSV(tx.note || ''),
        escapeCSV(tx.amount),
        escapeCSV(tx.type),
        escapeCSV(tx.date ? tx.date.replace('T', ' ').substring(0, 19) : ''),
        escapeCSV(catDisplayName),
      ].join(','));
    });
    lines.push('');

    // 5. WISHES
    lines.push('# [WISHES]');
    lines.push(isZh ? '愿望ID,愿望名称,价格,优先级,状态,创建时间' : 'ID,Title,Price,Priority,Status,CreatedAt');
    (wishes || []).forEach((w) => {
      lines.push([
        escapeCSV(w.id),
        escapeCSV(w.title),
        escapeCSV(w.price),
        escapeCSV(w.priority),
        escapeCSV(w.status),
        escapeCSV(w.createdAt ? w.createdAt.replace('T', ' ').substring(0, 19) : ''),
      ].join(','));
    });

    const csvString = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const todayStr = new Date().toISOString().split('T')[0];
    link.download = `DailySky_FullBackup_${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import complete app data from CSV or JSON file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        // A. JSON File parsing
        if (text.trim().startsWith('{') || file.name.endsWith('.json')) {
          const parsedJson = JSON.parse(text);
          if (parsedJson && typeof parsedJson === 'object') {
            importAppData({
              budgetConfig: parsedJson.budgetConfig || parsedJson.config,
              categories: parsedJson.categories,
              transactions: parsedJson.transactions,
              wishes: parsedJson.wishes,
            });
            const txCount = parsedJson.transactions?.length || 0;
            setImportMessage(t('profile_import_success', { count: txCount }));
            return;
          }
        }

        // B. CSV File parsing (Multi-section or legacy)
        const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (rawLines.length === 0) {
          setImportMessage(t('profile_import_empty'));
          return;
        }

        let currentSection: 'NONE' | 'BUDGET_CONFIG' | 'CATEGORIES' | 'SAVINGS_ACCOUNTS' | 'TRANSACTIONS' | 'WISHES' = 'NONE';

        const importedBudgetConfig: Partial<BudgetConfig> = {};
        const importedCategories: CloudCategory[] = [];
        const importedAccounts: SavingsAccount[] = [];
        const importedTxs: Transaction[] = [];
        const importedWishes: WishItem[] = [];

        for (let i = 0; i < rawLines.length; i++) {
          const lineStr = rawLines[i].trim();
          if (!lineStr) continue;

          // Check section headers
          if (lineStr.includes('# [BUDGET_CONFIG]')) {
            currentSection = 'BUDGET_CONFIG';
            continue;
          } else if (lineStr.includes('# [CATEGORIES]')) {
            currentSection = 'CATEGORIES';
            continue;
          } else if (lineStr.includes('# [SAVINGS_ACCOUNTS]')) {
            currentSection = 'SAVINGS_ACCOUNTS';
            continue;
          } else if (lineStr.includes('# [TRANSACTIONS]')) {
            currentSection = 'TRANSACTIONS';
            continue;
          } else if (lineStr.includes('# [WISHES]')) {
            currentSection = 'WISHES';
            continue;
          }

          const cols = parseCSVLine(lineStr);
          if (cols.length === 0) continue;

          if (currentSection === 'BUDGET_CONFIG') {
            const key = cols[0];
            const val = cols[1];
            if (key === 'Key' || key === 'Key(键)') continue; // header
            if (key === 'fixedIncome') importedBudgetConfig.fixedIncome = parseFloat(val) || 0;
            if (key === 'payday') importedBudgetConfig.payday = parseInt(val, 10) || 10;
            if (key === 'annualSavingsTarget') importedBudgetConfig.annualSavingsTarget = parseFloat(val) || 0;
            if (key === 'currencySymbol') importedBudgetConfig.currencySymbol = val || '$';
            if (key === 'totalBudget') importedBudgetConfig.totalBudget = parseFloat(val) || 0;
            if (key === 'privacyLockEnabled') importedBudgetConfig.privacyLockEnabled = val === 'true';
            if (key === 'hideRemindersInTierView') importedBudgetConfig.hideRemindersInTierView = val === 'true';
          } else if (currentSection === 'CATEGORIES') {
            if (cols[0].includes('ID') || cols[0].includes('分类ID')) continue; // header
            if (cols.length >= 2) {
              importedCategories.push({
                id: cols[0] || `cat-imp-${Date.now()}-${i}`,
                name: cols[1],
                budgetLimit: parseFloat(cols[2]) || 0,
                spent: 0,
                icon: cols[3] || 'Tag',
                color: cols[4] || 'from-purple-200/80 via-indigo-100/70 to-blue-200/80',
              });
            }
          } else if (currentSection === 'SAVINGS_ACCOUNTS') {
            if (cols[0].includes('AccountID') || cols[0].includes('账户ID')) continue; // header
            if (cols.length >= 2) {
              const balancesRaw = cols[2] || '';
              const balancesArr = balancesRaw
                .split(';')
                .filter(Boolean)
                .map((bStr, bIdx) => {
                  const [curr, amtStr] = bStr.split(':');
                  return {
                    id: `bal-${bIdx}-${Date.now()}`,
                    currency: curr || 'CNY',
                    amount: parseFloat(amtStr) || 0,
                  };
                });
              importedAccounts.push({
                id: cols[0] || `acc-imp-${Date.now()}-${i}`,
                name: cols[1],
                balances: balancesArr,
              });
            }
          } else if (currentSection === 'TRANSACTIONS') {
            if (cols[0].includes('ID') || cols[0].includes('流水ID')) continue; // header
            if (cols.length >= 3) {
              const amountVal = Math.abs(parseFloat(cols[2].replace(/[^0-9.-]+/g, '')) || 0);
              if (amountVal > 0) {
                const typeStr = (cols[3] || '').toLowerCase();
                const isIncome = typeStr.includes('income') || typeStr.includes('收入');
                importedTxs.push({
                  id: cols[0] || `tx-imp-${Date.now()}-${i}`,
                  note: cols[1] || (isIncome ? '收入' : '消费'),
                  amount: amountVal,
                  type: isIncome ? 'income' : 'expense',
                  date: cols[4] ? new Date(cols[4]).toISOString() : new Date().toISOString(),
                  categoryId: 'gen',
                  categoryName: cols[5] || 'General',
                  isRainbowIncome: isIncome,
                });
              }
            }
          } else if (currentSection === 'WISHES') {
            if (cols[0].includes('ID') || cols[0].includes('愿望ID')) continue; // header
            if (cols.length >= 2) {
              const priceVal = Math.abs(parseFloat(cols[2]) || 0);
              let pTier: WishItem['priceTier'] = 'small';
              if (priceVal < 10) pTier = 'pocketMoney';
              else if (priceVal <= 100) pTier = 'small';
              else if (priceVal <= 1000) pTier = 'big';
              else pTier = 'dream';

              importedWishes.push({
                id: cols[0] || `wish-imp-${Date.now()}-${i}`,
                title: cols[1],
                price: priceVal,
                priority: (cols[3] as WishItem['priority']) || 'heartFlutter',
                priceTier: pTier,
                status: (cols[4] as WishItem['status']) || 'normal',
                createdAt: cols[5] ? new Date(cols[5]).toISOString() : new Date().toISOString(),
              });
            }
          } else {
            // Unsectioned (legacy transaction CSV format fallback)
            if (i === 0) {
              const isHeader = cols.some((col) =>
                ['内容', '金额', '类型', '时间', '分类', 'note', 'amount', 'type', 'date', 'category'].includes(
                  col.toLowerCase()
                )
              );
              if (isHeader) continue;
            }
            const note = cols[0] || '';
            const amountStr = cols[1] || '0';
            const numVal = Math.abs(parseFloat(amountStr.replace(/[^0-9.-]+/g, '')));
            if (!isNaN(numVal) && numVal > 0) {
              const typeStr = (cols[2] || '').toLowerCase();
              const isIncome = typeStr.includes('收入') || typeStr.includes('income');
              importedTxs.push({
                id: `tx-imp-legacy-${Date.now()}-${i}`,
                amount: numVal,
                date: cols[3] ? new Date(cols[3]).toISOString() : new Date().toISOString(),
                type: isIncome ? 'income' : 'expense',
                categoryId: 'gen',
                categoryName: cols[4] || 'General',
                note: note || (isIncome ? '收入' : '消费'),
                isRainbowIncome: isIncome,
              });
            }
          }
        }

        if (importedAccounts.length > 0) {
          importedBudgetConfig.savingsAccounts = importedAccounts;
        }

        importAppData({
          budgetConfig: Object.keys(importedBudgetConfig).length > 0 ? importedBudgetConfig : undefined,
          categories: importedCategories.length > 0 ? importedCategories : undefined,
          transactions: importedTxs.length > 0 ? importedTxs : undefined,
          wishes: importedWishes.length > 0 ? importedWishes : undefined,
        });

        const totalItemsCount = importedTxs.length;
        setImportMessage(t('profile_import_success', { count: totalItemsCount }));
      } catch (err) {
        console.error('Failed to parse backup file:', err);
        setImportMessage(t('profile_import_empty'));
      } finally {
        if (e.target) {
          e.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    updateBudgetConfig({
      currencySymbol: localCurrencySymbol,
      privacyLockEnabled: privacyLock,
      syncEnabled: syncEnabled,
      hideRemindersInTierView: hideRemindersInTier,
    });
    setIsProfileOpen(false);
  };

  const handleReset = () => {
    resetAllData();
    setConfirmReset(false);
    setIsProfileOpen(false);
  };

  if (!isProfileOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 pt-14 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6 overflow-hidden">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md my-auto flex flex-col max-h-[78vh]"
        >
          {/* Close Button — Positioned outside the modal box, floating top right */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            className="absolute -top-11 right-1 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xl text-indigo-950 hover:text-indigo-600 hover:bg-white shadow-lg transition-all border border-white/80 flex items-center justify-center cursor-pointer group"
            title={t('close') || '关闭'}
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90 text-indigo-900" />
          </button>

          {/* Modal Card Container with complete rounded border outline */}
          <div className="w-full bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[78vh]">
            {/* Header */}
            <div className="p-6 sm:p-7 pb-4 border-b border-indigo-100/60 flex items-center gap-2.5 bg-indigo-50/20 flex-shrink-0">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-serif italic font-bold text-indigo-950">{t('profile_title')}</h3>
            </div>

            {/* Scrollable Settings List — Scrollbar strictly inside card */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">
              {/* Settings List */}
              <div className="space-y-4 mb-6">
            {/* Language Switcher */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 font-serif italic">{t('profile_language')}</h4>
                  <p className="text-[11px] text-indigo-500">{t('profile_language_desc')}</p>
                </div>
              </div>

              <div className="flex items-center p-0.5 bg-white border border-indigo-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-serif italic font-bold rounded-lg transition-all ${
                    language === 'en'
                      ? 'bg-indigo-900 text-white shadow-sm'
                      : 'text-indigo-600/70 hover:text-indigo-950'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('zh')}
                  className={`px-2.5 py-1 text-xs font-serif italic font-bold rounded-lg transition-all ${
                    language === 'zh'
                      ? 'bg-indigo-900 text-white shadow-sm'
                      : 'text-indigo-600/70 hover:text-indigo-950'
                  }`}
                >
                  中文
                </button>
              </div>
            </div>

            {/* Currency Picker */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 font-serif italic">{t('profile_currency')}</h4>
                <p className="text-[11px] text-indigo-500">{t('profile_currency_desc')}</p>
              </div>

              <select
                value={localCurrencySymbol}
                onChange={(e) => setLocalCurrencySymbol(e.target.value)}
                className="px-3 py-1.5 bg-white border border-indigo-100 rounded-xl text-xs text-indigo-950 font-serif italic font-semibold focus:outline-none"
              >
                <option value="$">$ USD / CAD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="¥">¥ JPY / CNY</option>
                <option value="₩">₩ KRW</option>
                <option value="₹">₹ INR</option>
              </select>
            </div>

            {/* Privacy Lock Toggle */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <LockKeyhole className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 font-serif italic">{t('profile_privacy')}</h4>
                  <p className="text-[11px] text-indigo-500">{t('profile_privacy_desc')}</p>
                </div>
              </div>

              <button
                onClick={() => setPrivacyLock(!privacyLock)}
                className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                  privacyLock ? 'bg-indigo-900' : 'bg-indigo-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    privacyLock ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Cloud Sync Toggle */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-purple-600" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 font-serif italic">{t('profile_sync')}</h4>
                  <p className="text-[11px] text-indigo-500">{t('profile_sync_desc')}</p>
                </div>
              </div>

              <button
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                  syncEnabled ? 'bg-indigo-900' : 'bg-indigo-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    syncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Hide Reminders in Tier View Toggle */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Pin className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 font-serif italic">
                    {t('profile_hide_reminders')}
                  </h4>
                  <p className="text-[11px] text-indigo-500">
                    {t('profile_hide_reminders_desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setHideRemindersInTier(!hideRemindersInTier)}
                className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                  hideRemindersInTier ? 'bg-indigo-900' : 'bg-indigo-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    hideRemindersInTier ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Restore/Show Narrative Guide Texts Toggle (Visible when tapped 1+ times) */}
            {hasEverDissolved && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 font-serif italic">
                      {t('profile_show_guide_texts')}
                    </h4>
                    <p className="text-[11px] text-indigo-500">
                      {t('profile_show_guide_texts_desc')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleGuideTexts(!showGuideTexts)}
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative cursor-pointer ${
                    showGuideTexts ? 'bg-indigo-900' : 'bg-indigo-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      showGuideTexts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* CSV Data Import & Export */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 font-serif italic">
                    {t('profile_data_management')}
                  </h4>
                  <p className="text-[11px] text-indigo-500">
                    {t('profile_data_management_desc')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="py-2 px-3 rounded-xl bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('profile_export_btn')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-200" />
                  <span>{t('profile_import_btn')}</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv, .json, .txt"
                  className="hidden"
                />
              </div>

              {/* Feedback message */}
              {importMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium text-center"
                >
                  {importMessage}
                </motion.div>
              )}
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="border-t border-indigo-100 pt-4 mb-6">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition-colors"
              >
                {t('profile_reset')}
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                <p className="text-xs text-rose-900 font-serif italic">
                  {t('profile_reset_confirm')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm"
                  >
                    {t('profile_confirm_reset')}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 rounded-xl bg-indigo-100 text-indigo-900 text-xs font-semibold"
                  >
                    {t('profile_cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Profile Button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-lg cursor-pointer"
          >
            {t('profile_save')}
          </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

