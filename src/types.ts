export type TransactionType = 'expense' | 'income';

export type PriorityLevel = 'dream' | 'heartFlutter' | 'reminder';

export type PriceTier = 'pocketMoney' | 'small' | 'big' | 'dream';

export type WishStatus = 'normal' | 'coolDown' | 'fulfilled' | 'abandoned';

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO string
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  note: string;
  isRainbowIncome?: boolean;
}

export interface WishItem {
  id: string;
  title: string;
  price: number;
  priority: PriorityLevel; // 'dream' = ✨ Ultimate Dreams, 'heartFlutter' = 🔥 Heart-Flutter, 'reminder' = 📌 Quick Reminders
  priceTier: PriceTier; // 'pocketMoney' (<$10), 'small' ($10-$100), 'big' ($100-$1000), 'dream' (>$1000)
  status: WishStatus;
  createdAt: string;
  coolDownUntil?: string; // ISO timestamp
  coolDownDurationHours?: number;
  categoryHint?: string;
  reasonNotes?: string;
}

export interface CloudCategory {
  id: string;
  name: string;
  budgetLimit: number;
  spent: number;
  color: string; // Tailored gradient/watercolor hue
  icon: string; // Lucide icon identifier
}

export interface SavingsAccountBalance {
  id: string;
  currency: string;
  amount: number;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balances: SavingsAccountBalance[];
}

export interface BudgetConfig {
  totalBudget: number;
  fixedIncome: number;
  payday: number; // Day of the month (1-31)
  savingsTarget: number;
  totalSavings: number; // Accumulated long-term savings pool
  annualSavingsTarget?: number; // Target for annual savings
  savingsAccounts?: SavingsAccount[]; // User savings accounts
  currencySymbol: string;
  currencyCode: string;
  privacyLockEnabled?: boolean;
  syncEnabled?: boolean;
  hideRemindersInTierView?: boolean;
}

export interface MonthlySummaryData {
  monthName: string;
  totalBudget: number;
  totalSpent: number;
  totalSavings: number;
  impulseMoneySaved: number;
  fulfilledWishesCount: number;
  abandonedWishesCount: number;
  aiSummaryLines?: string[];
}
