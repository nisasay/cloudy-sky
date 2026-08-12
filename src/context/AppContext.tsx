import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  initialBudgetConfig,
  initialCategories,
  initialTransactions,
  initialWishes,
} from '../data/initialData';
import { translations, Language, getCategoryDisplayName } from '../data/translations';
import {
  BudgetConfig,
  CloudCategory,
  SavingsAccount,
  SavingsAccountBalance,
  Transaction,
  WishItem,
  WishStatus,
} from '../types';

interface AppContextType {
  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
  getCatName: (name: string) => string;

  // State
  activePanel: 'A' | 'B' | 'C';
  setActivePanel: (panel: 'A' | 'B' | 'C') => void;
  transactions: Transaction[];
  wishes: WishItem[];
  categories: CloudCategory[];
  budgetConfig: BudgetConfig;

  // Modals
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  isLoggingOpen: boolean;
  setIsLoggingOpen: (open: boolean) => void;
  selectedCategoryForLogging: CloudCategory | null;
  setSelectedCategoryForLogging: (cat: CloudCategory | null) => void;
  loggingPrefill: { amount?: number; note?: string; wishId?: string } | null;
  setLoggingPrefill: (prefill: { amount?: number; note?: string; wishId?: string } | null) => void;
  openLoggingModal: (
    category: CloudCategory,
    prefill?: { amount?: number; note?: string; wishId?: string }
  ) => void;
  
  isRainbowModalOpen: boolean;
  setIsRainbowModalOpen: (open: boolean) => void;

  isHesitationOpen: boolean;
  setIsHesitationOpen: (open: boolean) => void;
  hesitationWish: WishItem | null;
  setHesitationWish: (wish: WishItem | null) => void;

  isBudgetConfigOpen: boolean;
  setIsBudgetConfigOpen: (open: boolean) => void;

  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;

  isAddWishOpen: boolean;
  setIsAddWishOpen: (open: boolean) => void;

  // Savings Modals & Actions
  isAnnualGoalModalOpen: boolean;
  setIsAnnualGoalModalOpen: (open: boolean) => void;
  selectedAccountForModal: SavingsAccount | null | 'new';
  setSelectedAccountForModal: (acc: SavingsAccount | null | 'new') => void;

  saveAnnualSavingsTarget: (target: number) => void;
  saveSavingsAccount: (account: Omit<SavingsAccount, 'id'> & { id?: string }) => void;
  deleteSavingsAccount: (accountId: string) => void;

  // Wish Actions
  addWish: (title: string, price: number, priority: WishItem['priority'], categoryHint?: string) => void;
  updateWishStatus: (wishId: string, status: WishStatus, reasonNotes?: string) => void;
  putWishInCooldown: (wishId: string, hours?: number) => void;

  // Logging & Cash Flow
  logExpense: (categoryId: string, amount: number, note: string, matchedWishId?: string) => void;
  logRainbowIncome: (amount: number, note: string) => void;
  fulfillWishAndLog: (wish: WishItem, categoryId: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (importedTxs: Transaction[], newCategoriesToAdd?: CloudCategory[]) => void;
  importAppData: (data: {
    budgetConfig?: Partial<BudgetConfig>;
    categories?: CloudCategory[];
    transactions?: Transaction[];
    wishes?: WishItem[];
  }) => void;

  // Config & Categories
  updateBudgetConfig: (newConfig: Partial<BudgetConfig>) => void;
  updateCategories: (newCategories: CloudCategory[]) => void;
  
  // Computed values
  totalSpentThisMonth: number;
  remainingBudgetThisMonth: number;
  totalImpulseSaved: number;
  fulfilledWishes: WishItem[];
  historicalSavingsProgress: number;
  matchedWishForNote: (note: string) => WishItem | null;
  resetAllData: () => void;
}

const STORAGE_KEY = 'daily_sky_data_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePanel, setActivePanel] = useState<'A' | 'B' | 'C'>('A');

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lang`);
    return (saved as Language) || 'zh';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_lang`, language);
  }, [language]);

  // Translation function
  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations['en'];
    let str = langDict[key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }
    return str;
  };

  const getCatName = (name: string): string => {
    return getCategoryDisplayName(name, language);
  };

  // Load state from localStorage or initialData
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_txs`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [wishes, setWishes] = useState<WishItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wishes`);
    return saved ? JSON.parse(saved) : initialWishes;
  });

  const [categories, setCategories] = useState<CloudCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cats`);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
    return saved ? JSON.parse(saved) : initialBudgetConfig;
  });

  // Modal states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [selectedCategoryForLogging, setSelectedCategoryForLogging] = useState<CloudCategory | null>(null);
  const [loggingPrefill, setLoggingPrefill] = useState<{
    amount?: number;
    note?: string;
    wishId?: string;
  } | null>(null);

  const openLoggingModal = (
    category: CloudCategory,
    prefill?: { amount?: number; note?: string; wishId?: string }
  ) => {
    setSelectedCategoryForLogging(category);
    setLoggingPrefill(prefill || null);
    setIsLoggingOpen(true);
  };
  const [isRainbowModalOpen, setIsRainbowModalOpen] = useState(false);
  const [isHesitationOpen, setIsHesitationOpen] = useState(false);
  const [hesitationWish, setHesitationWish] = useState<WishItem | null>(null);
  const [isBudgetConfigOpen, setIsBudgetConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddWishOpen, setIsAddWishOpen] = useState(false);

  // Savings Modal states
  const [isAnnualGoalModalOpen, setIsAnnualGoalModalOpen] = useState(false);
  const [selectedAccountForModal, setSelectedAccountForModal] = useState<SavingsAccount | null | 'new'>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_wishes`, JSON.stringify(wishes));
  }, [wishes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cats`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(budgetConfig));
  }, [budgetConfig]);

  // Recalculate category spent amounts from transactions
  useEffect(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.categoryId) {
        categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
      }
    });

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        spent: categoryTotals[cat.id] || 0,
      }))
    );
  }, [transactions]);

  // Derived calculations
  const totalSpentThisMonth = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalRainbowIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.isRainbowIncome)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const effectiveBudget = budgetConfig.totalBudget + totalRainbowIncome;
  const remainingBudgetThisMonth = effectiveBudget - totalSpentThisMonth;

  const totalImpulseSaved = wishes
    .filter((w) => w.status === 'abandoned')
    .reduce((acc, w) => acc + w.price, 0);

  const fulfilledWishes = wishes.filter((w) => w.status === 'fulfilled');

  // Real-time note matching against wishes (especially priority == 'reminder' or matching title)
  const matchedWishForNote = (note: string): WishItem | null => {
    if (!note || note.trim().length < 2) return null;
    const cleanNote = note.trim().toLowerCase();

    return (
      wishes.find((w) => {
        if (w.status !== 'normal' && w.status !== 'coolDown') return false;
        const cleanTitle = w.title.toLowerCase();
        return cleanTitle.includes(cleanNote) || cleanNote.includes(cleanTitle);
      }) || null
    );
  };

  // Actions
  const logExpense = (categoryId: string, amount: number, note: string, matchedWishId?: string) => {
    if (amount <= 0) return;

    const cat = categories.find((c) => c.id === categoryId);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount,
      date: new Date().toISOString(),
      type: 'expense',
      categoryId,
      categoryName: cat ? cat.name : 'General',
      note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If matched wish, mark fulfilled and apply watercolor erase
    if (matchedWishId) {
      updateWishStatus(matchedWishId, 'fulfilled');
    }
  };

  const logRainbowIncome = (amount: number, note: string) => {
    if (amount <= 0) return;

    const newTx: Transaction = {
      id: `rainbow-${Date.now()}`,
      amount,
      date: new Date().toISOString(),
      type: 'income',
      categoryId: 'rainbow',
      categoryName: 'Rainbow Surprise',
      note: note || 'Unexpected Rainbow Income 🌈',
      isRainbowIncome: true,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Confetti celebration for rainbow surprise!
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          const updatedCatId = updates.categoryId !== undefined ? updates.categoryId : tx.categoryId;
          const cat = categories.find((c) => c.id === updatedCatId);
          return {
            ...tx,
            ...updates,
            categoryId: updatedCatId,
            categoryName: cat ? cat.name : (updates.categoryName || tx.categoryName),
          };
        }
        return tx;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const addWish = (
    title: string,
    price: number,
    priority: WishItem['priority'],
    categoryHint?: string
  ) => {
    let priceTier: WishItem['priceTier'] = 'small';
    if (price < 10) priceTier = 'pocketMoney';
    else if (price <= 100) priceTier = 'small';
    else if (price <= 1000) priceTier = 'big';
    else priceTier = 'dream';

    const newWish: WishItem = {
      id: `wish-${Date.now()}`,
      title,
      price,
      priority,
      priceTier,
      status: 'normal',
      createdAt: new Date().toISOString(),
      categoryHint,
    };

    setWishes((prev) => [newWish, ...prev]);
  };

  const updateWishStatus = (wishId: string, status: WishStatus, reasonNotes?: string) => {
    setWishes((prev) =>
      prev.map((w) => {
        if (w.id === wishId) {
          return {
            ...w,
            status,
            reasonNotes: reasonNotes || w.reasonNotes,
          };
        }
        return w;
      })
    );

    if (status === 'fulfilled') {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
      });
    }
  };

  const putWishInCooldown = (wishId: string, hours = 24) => {
    const coolDownUntil = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    setWishes((prev) =>
      prev.map((w) => {
        if (w.id === wishId) {
          return {
            ...w,
            status: 'coolDown',
            coolDownUntil,
            coolDownDurationHours: hours,
          };
        }
        return w;
      })
    );
  };

  const fulfillWishAndLog = (wish: WishItem, categoryId: string) => {
    updateWishStatus(wish.id, 'fulfilled');
    logExpense(categoryId, wish.price, wish.title, wish.id);
  };

  const updateBudgetConfig = (newConfig: Partial<BudgetConfig>) => {
    setBudgetConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateCategories = (newCategories: CloudCategory[]) => {
    setCategories(newCategories);
    // Recalculate total budget if needed
    const sumLimits = newCategories.reduce((acc, c) => acc + c.budgetLimit, 0);
    setBudgetConfig((prev) => ({ ...prev, totalBudget: sumLimits }));
  };

  // Savings handlers
  const saveAnnualSavingsTarget = (target: number) => {
    setBudgetConfig((prev) => ({
      ...prev,
      annualSavingsTarget: target,
    }));
  };

  const saveSavingsAccount = (accountData: Omit<SavingsAccount, 'id'> & { id?: string }) => {
    setBudgetConfig((prev) => {
      const existing = prev.savingsAccounts || [];
      let updated: SavingsAccount[];
      if (accountData.id) {
        updated = existing.map((acc) =>
          acc.id === accountData.id ? (accountData as SavingsAccount) : acc
        );
      } else {
        const newAcc: SavingsAccount = {
          id: `acc-${Date.now()}`,
          name: accountData.name,
          balances: accountData.balances,
        };
        updated = [...existing, newAcc];
      }
      return {
        ...prev,
        savingsAccounts: updated,
      };
    });
  };

  const deleteSavingsAccount = (accountId: string) => {
    setBudgetConfig((prev) => ({
      ...prev,
      savingsAccounts: (prev.savingsAccounts || []).filter((acc) => acc.id !== accountId),
    }));
  };

  // Historical Savings Progress Calculation:
  // Historical monthly total income (fixedIncome * past elapsed months + past rainbow income) - total past expenses (excluding current month)
  const calculateHistoricalSavingsProgress = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const pastTxs = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() < currentMonth);
    });

    const pastMonthsSet = new Set<string>();
    pastTxs.forEach((tx) => {
      const d = new Date(tx.date);
      pastMonthsSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    const pastMonthsCount = pastMonthsSet.size > 0 ? pastMonthsSet.size : (pastTxs.length > 0 ? 1 : 0);

    const pastFixedIncomeTotal = pastMonthsCount * (budgetConfig.fixedIncome || 0);
    const pastRainbowIncomeTotal = pastTxs
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const pastExpenseTotal = pastTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);

    return pastFixedIncomeTotal + pastRainbowIncomeTotal - pastExpenseTotal;
  };

  const historicalSavingsProgress = calculateHistoricalSavingsProgress();

  const importTransactions = (importedTxs: Transaction[], newCategoriesToAdd?: CloudCategory[]) => {
    if (newCategoriesToAdd && newCategoriesToAdd.length > 0) {
      setCategories((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const toAdd = newCategoriesToAdd.filter((c) => !existingIds.has(c.id));
        return [...prev, ...toAdd];
      });
    }
    if (importedTxs && importedTxs.length > 0) {
      setTransactions((prev) => [...importedTxs, ...prev]);
    }
  };

  const importAppData = (data: {
    budgetConfig?: Partial<BudgetConfig>;
    categories?: CloudCategory[];
    transactions?: Transaction[];
    wishes?: WishItem[];
  }) => {
    if (data.budgetConfig) {
      setBudgetConfig((prev) => ({
        ...prev,
        ...data.budgetConfig,
      }));
    }
    if (data.categories && data.categories.length > 0) {
      setCategories(data.categories);
    }
    if (data.transactions && data.transactions.length > 0) {
      setTransactions((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTxs = data.transactions!.filter((t) => !existingIds.has(t.id));
        return [...newTxs, ...prev];
      });
    }
    if (data.wishes && data.wishes.length > 0) {
      setWishes((prev) => {
        const existingIds = new Set(prev.map((w) => w.id));
        const newWishes = data.wishes!.filter((w) => !existingIds.has(w.id));
        return [...newWishes, ...prev];
      });
    }
  };

  const resetAllData = () => {
    const zeroedCategories: CloudCategory[] = initialCategories.map((c) => ({
      ...c,
      budgetLimit: 0,
      spent: 0,
    }));

    const zeroedBudgetConfig: BudgetConfig = {
      ...budgetConfig,
      totalBudget: 0,
      fixedIncome: 0,
      savingsTarget: 0,
      totalSavings: 0,
      annualSavingsTarget: 0,
      savingsAccounts: [],
    };

    setTransactions([]);
    setWishes([]);
    setCategories(zeroedCategories);
    setBudgetConfig(zeroedBudgetConfig);

    localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_wishes`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_cats`, JSON.stringify(zeroedCategories));
    localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(zeroedBudgetConfig));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getCatName,
        activePanel,
        setActivePanel,
        transactions,
        wishes,
        categories,
        budgetConfig,
        editingTransaction,
        setEditingTransaction,
        isLoggingOpen,
        setIsLoggingOpen,
        selectedCategoryForLogging,
        setSelectedCategoryForLogging,
        loggingPrefill,
        setLoggingPrefill,
        openLoggingModal,
        isRainbowModalOpen,
        setIsRainbowModalOpen,
        isHesitationOpen,
        setIsHesitationOpen,
        hesitationWish,
        setHesitationWish,
        isBudgetConfigOpen,
        setIsBudgetConfigOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAddWishOpen,
        setIsAddWishOpen,
        isAnnualGoalModalOpen,
        setIsAnnualGoalModalOpen,
        selectedAccountForModal,
        setSelectedAccountForModal,
        saveAnnualSavingsTarget,
        saveSavingsAccount,
        deleteSavingsAccount,
        addWish,
        updateWishStatus,
        putWishInCooldown,
        logExpense,
        logRainbowIncome,
        fulfillWishAndLog,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        importAppData,
        updateBudgetConfig,
        updateCategories,
        totalSpentThisMonth,
        remainingBudgetThisMonth,
        totalImpulseSaved,
        fulfilledWishes,
        historicalSavingsProgress,
        matchedWishForNote,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
