export type TransactionType = 'income' | 'expense';

export interface DashboardTransaction {
  name: string;
  category: string;
  amount: number;
  transactionType: TransactionType;
  date: string;
}

export interface DashboardBudget {
  label: string;
  category: string;
  limit: number;
  startDate: string;
  endDate: string;
}

export interface DashboardTransactionView {
  name: string;
  category: string;
  amount: number;
  transactionType: TransactionType;
  dateLabel: string;
}

export interface DashboardBudgetView {
  label: string;
  used: number;
  limit: number;
  percentUsed: number;
}

export interface DashboardSnapshot {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetSummary: DashboardBudgetView[];
  recentTransactions: DashboardTransactionView[];
}

const demoReferenceDate = new Date('2026-05-08T12:00:00.000Z');
const demoOpeningBalance = 5810.18;

const demoTransactions: DashboardTransaction[] = [
  { name: 'Salary', category: 'Income', amount: 4920, transactionType: 'income', date: '2026-05-07' },
  { name: 'Grocery run', category: 'Food', amount: 62.48, transactionType: 'expense', date: '2026-05-08' },
  { name: 'Cafe stop', category: 'Food', amount: 5.52, transactionType: 'expense', date: '2026-05-08' },
  { name: 'Train pass', category: 'Transport', amount: 45, transactionType: 'expense', date: '2026-05-06' },
  { name: 'Movie night', category: 'Entertainment', amount: 90, transactionType: 'expense', date: '2026-05-05' },
  { name: 'Rent', category: 'Housing', amount: 1700, transactionType: 'expense', date: '2026-05-03' },
  { name: 'Utilities', category: 'Utilities', amount: 180.25, transactionType: 'expense', date: '2026-05-02' },
  { name: 'Insurance', category: 'Insurance', amount: 77.75, transactionType: 'expense', date: '2026-05-01' },
  { name: 'Home supplies', category: 'Home', amount: 149, transactionType: 'expense', date: '2026-05-01' },
];

const demoBudgets: DashboardBudget[] = [
  { label: 'Food', category: 'Food', limit: 250, startDate: '2026-05-01', endDate: '2026-05-31' },
  { label: 'Transport', category: 'Transport', limit: 120, startDate: '2026-05-01', endDate: '2026-05-31' },
  { label: 'Entertainment', category: 'Entertainment', limit: 150, startDate: '2026-05-01', endDate: '2026-05-31' },
];

export function formatCurrency(value: number, minimumFractionDigits = 2, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function getMonthBounds(referenceDate: Date) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

function isDateWithinRange(dateValue: string, start: Date, end: Date) {
  const current = new Date(`${dateValue}T12:00:00.000Z`);
  return current >= start && current <= end;
}

function sumTransactionAmount(transactions: DashboardTransaction[], transactionType: TransactionType, referenceDate?: Date) {
  const monthBounds = referenceDate ? getMonthBounds(referenceDate) : null;

  return transactions.reduce((total, transaction) => {
    const isMatchingType = transaction.transactionType === transactionType;
    const isMatchingMonth = monthBounds ? isDateWithinRange(transaction.date, monthBounds.start, monthBounds.end) : true;

    if (!isMatchingType || !isMatchingMonth) {
      return total;
    }

    return total + transaction.amount;
  }, 0);
}

export function calculateCurrentBalance(transactions: DashboardTransaction[], openingBalance = 0) {
  const incomeTotal = sumTransactionAmount(transactions, 'income');
  const expenseTotal = sumTransactionAmount(transactions, 'expense');

  return openingBalance + incomeTotal - expenseTotal;
}

export function calculateMonthlyIncome(transactions: DashboardTransaction[], referenceDate: Date) {
  return sumTransactionAmount(transactions, 'income', referenceDate);
}

export function calculateMonthlyExpenses(transactions: DashboardTransaction[], referenceDate: Date) {
  return sumTransactionAmount(transactions, 'expense', referenceDate);
}

export function calculateBudgetUsed(budget: DashboardBudget, transactions: DashboardTransaction[]) {
  return transactions.reduce((total, transaction) => {
    const isExpense = transaction.transactionType === 'expense';
    const matchesCategory = transaction.category === budget.category;
    const transactionDate = new Date(`${transaction.date}T12:00:00.000Z`);
    const budgetStart = new Date(`${budget.startDate}T12:00:00.000Z`);
    const budgetEnd = new Date(`${budget.endDate}T12:00:00.000Z`);
    const inBudgetRange = transactionDate >= budgetStart && transactionDate <= budgetEnd;

    if (!isExpense || !matchesCategory || !inBudgetRange) {
      return total;
    }

    return total + transaction.amount;
  }, 0);
}

function getRelativeDayLabel(dateValue: string, referenceDate: Date) {
  const currentDate = new Date(`${dateValue}T12:00:00.000Z`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceInDays = Math.round((referenceDate.getTime() - currentDate.getTime()) / millisecondsPerDay);

  if (differenceInDays <= 0) {
    return 'Today';
  }

  if (differenceInDays === 1) {
    return 'Yesterday';
  }

  return `${differenceInDays} days ago`;
}

export function buildDashboardSnapshot({
  transactions,
  budgets,
  openingBalance = 0,
  referenceDate = demoReferenceDate,
}: {
  transactions: DashboardTransaction[];
  budgets: DashboardBudget[];
  openingBalance?: number;
  referenceDate?: Date;
}): DashboardSnapshot {
  const recentTransactions = [...transactions]
    .sort((left, right) => new Date(`${right.date}T12:00:00.000Z`).getTime() - new Date(`${left.date}T12:00:00.000Z`).getTime())
    .slice(0, 3)
    .map((transaction) => ({
      name: transaction.name,
      category: transaction.category,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      dateLabel: getRelativeDayLabel(transaction.date, referenceDate),
    }));

  return {
    currentBalance: calculateCurrentBalance(transactions, openingBalance),
    monthlyIncome: calculateMonthlyIncome(transactions, referenceDate),
    monthlyExpenses: calculateMonthlyExpenses(transactions, referenceDate),
    budgetSummary: budgets.map((budget) => {
      const used = calculateBudgetUsed(budget, transactions);
      const percentUsed = Math.min((used / budget.limit) * 100, 100);

      return {
        label: budget.label,
        used,
        limit: budget.limit,
        percentUsed,
      };
    }),
    recentTransactions,
  };
}

export const dashboardSnapshot = buildDashboardSnapshot({
  transactions: demoTransactions,
  budgets: demoBudgets,
  openingBalance: demoOpeningBalance,
  referenceDate: demoReferenceDate,
});