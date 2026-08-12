import { BudgetConfig, CloudCategory, SavingsAccount, Transaction, WishItem } from '../types';

export const initialSavingsAccounts: SavingsAccount[] = [
  {
    id: 'acc-1',
    name: '应急准备金 (Emergency Reserve)',
    balances: [
      { id: 'bal-1', currency: 'USD', amount: 8000 },
    ],
  },
  {
    id: 'acc-2',
    name: '高息理财账户 (High Yield Savings)',
    balances: [
      { id: 'bal-2', currency: 'CNY', amount: 50000 },
      { id: 'bal-3', currency: 'USD', amount: 3000 },
    ],
  },
  {
    id: 'acc-3',
    name: '证券投资账户 (Investment Portfolio)',
    balances: [
      { id: 'bal-4', currency: 'USD', amount: 15000 },
    ],
  },
];

export const initialBudgetConfig: BudgetConfig = {
  totalBudget: 1800,
  fixedIncome: 4500,
  payday: 1, // 1st of every month
  savingsTarget: 10000,
  totalSavings: 6420,
  annualSavingsTarget: 24000,
  savingsAccounts: initialSavingsAccounts,
  currencySymbol: '$',
  currencyCode: 'USD',
  privacyLockEnabled: false,
  syncEnabled: true,
  hideRemindersInTierView: true,
};

export const initialCategories: CloudCategory[] = [
  {
    id: 'dining',
    name: 'Dining & Delights',
    budgetLimit: 500,
    spent: 245,
    color: 'from-amber-200/80 via-orange-100/70 to-rose-200/80',
    icon: 'Utensils',
  },
  {
    id: 'joy',
    name: 'Joy Fund',
    budgetLimit: 350,
    spent: 120,
    color: 'from-purple-200/80 via-pink-100/70 to-indigo-200/80',
    icon: 'Sparkles',
  },
  {
    id: 'daily',
    name: 'Daily Supplies',
    budgetLimit: 400,
    spent: 185,
    color: 'from-sky-200/80 via-blue-100/70 to-cyan-200/80',
    icon: 'ShoppingBag',
  },
  {
    id: 'entertainment',
    name: 'Culture & Play',
    budgetLimit: 250,
    spent: 90,
    color: 'from-emerald-200/80 via-teal-100/70 to-sky-200/80',
    icon: 'Gamepad2',
  },
  {
    id: 'learning',
    name: 'Self & Mind',
    budgetLimit: 200,
    spent: 45,
    color: 'from-violet-200/80 via-fuchsia-100/70 to-purple-200/80',
    icon: 'BookOpen',
  },
  {
    id: 'sanctuary',
    name: 'Home Sanctuary',
    budgetLimit: 100,
    spent: 20,
    color: 'from-blue-200/80 via-indigo-100/70 to-slate-200/80',
    icon: 'Home',
  },
];

const now = new Date();
const todayISO = now.toISOString();

export const initialWishes: WishItem[] = [
  {
    id: 'wish-1',
    title: 'Vintage Film Camera',
    price: 320,
    priority: 'heartFlutter',
    priceTier: 'big',
    status: 'normal',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    categoryHint: 'Joy Fund',
  },
  {
    id: 'wish-2',
    title: 'Ceramic Espresso Cup Set',
    price: 38,
    priority: 'reminder',
    priceTier: 'small',
    status: 'normal',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    categoryHint: 'Home Sanctuary',
  },
  {
    id: 'wish-3',
    title: 'Noise-Canceling Headphones',
    price: 240,
    priority: 'heartFlutter',
    priceTier: 'big',
    status: 'coolDown',
    coolDownUntil: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'wish-4',
    title: 'Kyoto Autumn Retreat Flight',
    price: 1450,
    priority: 'dream',
    priceTier: 'dream',
    status: 'normal',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'wish-5',
    title: 'Matcha Whisk & Organic Tea',
    price: 28,
    priority: 'reminder',
    priceTier: 'small',
    status: 'normal',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'wish-6',
    title: 'Designer Leather Boots',
    price: 420,
    priority: 'heartFlutter',
    priceTier: 'big',
    status: 'abandoned', // Impulse blocked!
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    reasonNotes: 'Realized I already have two pairs in great shape. Saved $420!',
  },
  {
    id: 'wish-7',
    title: 'Acoustic Guitar Tuner & Strings',
    price: 22,
    priority: 'reminder',
    priceTier: 'small',
    status: 'fulfilled',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    amount: 18.5,
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'expense',
    categoryId: 'dining',
    categoryName: 'Dining & Delights',
    note: 'Organic Oat Latte & Bakery Treat',
  },
  {
    id: 'tx-2',
    amount: 22.0,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    type: 'expense',
    categoryId: 'joy',
    categoryName: 'Joy Fund',
    note: 'Acoustic Guitar Tuner & Strings', // matched wish
  },
  {
    id: 'tx-3',
    amount: 150.0,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'income',
    categoryId: 'rainbow',
    categoryName: 'Rainbow Surprise',
    note: 'Sold unused vintage coat on secondhand app',
    isRainbowIncome: true,
  },
  {
    id: 'tx-4',
    amount: 62.0,
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    type: 'expense',
    categoryId: 'daily',
    categoryName: 'Daily Supplies',
    note: 'Eco-friendly soap refills & kitchen towels',
  },
  {
    id: 'tx-5',
    amount: 45.0,
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    type: 'expense',
    categoryId: 'learning',
    categoryName: 'Self & Mind',
    note: 'Art history book & notebook',
  },
  // Historical transactions from previous months
  {
    id: 'tx-hist-1',
    amount: 1200.0,
    date: new Date(Date.now() - 86400000 * 35).toISOString(),
    type: 'expense',
    categoryId: 'daily',
    categoryName: 'Daily Supplies',
    note: 'Previous month living expenses',
  },
  {
    id: 'tx-hist-2',
    amount: 300.0,
    date: new Date(Date.now() - 86400000 * 38).toISOString(),
    type: 'income',
    categoryId: 'rainbow',
    categoryName: 'Rainbow Surprise',
    note: 'Freelance design bonus',
    isRainbowIncome: true,
  },
  {
    id: 'tx-hist-3',
    amount: 1400.0,
    date: new Date(Date.now() - 86400000 * 65).toISOString(),
    type: 'expense',
    categoryId: 'sanctuary',
    categoryName: 'Home Sanctuary',
    note: 'Home improvement & utility fees',
  },
  {
    id: 'tx-hist-4',
    amount: 500.0,
    date: new Date(Date.now() - 86400000 * 68).toISOString(),
    type: 'income',
    categoryId: 'rainbow',
    categoryName: 'Rainbow Surprise',
    note: 'Annual performance reward',
    isRainbowIncome: true,
  },
];
