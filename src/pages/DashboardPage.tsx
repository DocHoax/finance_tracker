import { ArrowDownRight, ArrowUpRight, BadgeDollarSign, WalletCards } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { dashboardSnapshot, formatCurrency } from '../lib/financeDashboard';

export function DashboardPage() {
  const { currentBalance, monthlyIncome, monthlyExpenses, budgetSummary, recentTransactions } = dashboardSnapshot;

  return (
    <AppShell>
      <section className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-accent/15 via-white/5 to-white/0 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current balance</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-semibold text-white">{formatCurrency(currentBalance)}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  A live summary of income, expenses, budgets, and savings goals will land here once the Supabase data layer is wired.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-accent/20 bg-accent/10 p-4 text-accent sm:block">
                <WalletCards className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard icon={ArrowUpRight} label="Income this month" value={formatCurrency(monthlyIncome, 0, 0)} tone="text-emerald-300" />
            <MetricCard icon={ArrowDownRight} label="Expenses this month" value={formatCurrency(monthlyExpenses, 0, 0)} tone="text-rose-300" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Budget overview</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Monthly progress</h3>
              </div>
              <BadgeDollarSign className="h-6 w-6 text-accent" />
            </div>

            <div className="mt-5 space-y-4">
              {budgetSummary.map((budget) => {
                return (
                  <div key={budget.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{budget.label}</span>
                      <span>
                        {formatCurrency(budget.used, 0, 0)} / {formatCurrency(budget.limit, 0, 0)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-accent to-emerald-300" style={{ width: `${budget.percentUsed}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Recent activity</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Latest transactions</h3>
            <div className="mt-5 space-y-3">
              {recentTransactions.map((transaction) => (
                <article key={transaction.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{transaction.name}</p>
                    <p className="text-sm text-slate-400">
                      {transaction.category} · {transaction.dateLabel}
                    </p>
                  </div>
                  <p className={transaction.transactionType === 'expense' ? 'text-rose-300' : 'text-emerald-300'}>
                    {transaction.transactionType === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof ArrowUpRight; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p>
        </div>
        <Icon className="h-7 w-7 text-slate-300" />
      </div>
    </div>
  );
}