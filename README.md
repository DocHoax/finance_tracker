# Personal Finance Tracker

Personal Finance Tracker is a Supabase-first web app for managing income, expenses, budgets, and savings goals in one place. The current implementation includes a React dashboard shell, Supabase Auth pages, and a PostgreSQL schema with row-level security.

## What this project does

- Tracks income and expenses by category.
- Shows a dashboard with current balance, monthly income, monthly expenses, budget progress, and recent transactions.
- Supports user sign-up and sign-in with Supabase Auth.
- Stores finance data in Supabase Postgres with row-level security so each user only sees their own records.
- Prepares the app for realtime updates, charts, and budget alerts.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Supabase Auth and Postgres
- Recharts for future chart views
- Lucide React icons

## Current status

- The app shell is implemented and runs locally.
- Login and registration pages are wired to Supabase Auth.
- The dashboard values are generated from shared demo data and calculation helpers in `src/lib/financeDashboard.ts`.
- The Supabase schema and RLS policies are defined in SQL.
- Realtime subscriptions, CRUD flows, and chart pages are planned next.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Add your Supabase project values.
4. Run the SQL migration in `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor.
5. Start the app with `npm run dev`.

## Environment variables

These values are required for authentication to work.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type-checks the app and creates a production build.
- `npm run preview` serves the production build locally.

## Project structure

- `src/main.tsx` mounts the React app and router.
- `src/App.tsx` defines the top-level routes.
- `src/components/layout/AppShell.tsx` contains the shared app frame.
- `src/pages/DashboardPage.tsx` renders the current dashboard view.
- `src/pages/LoginPage.tsx` handles Supabase sign-in.
- `src/pages/RegisterPage.tsx` handles Supabase sign-up.
- `src/lib/supabase.ts` creates the Supabase client.
- `src/lib/financeDashboard.ts` stores the shared demo ledger, calculation helpers, and snapshot builder.
- `supabase/migrations/0001_initial_schema.sql` defines tables and RLS policies.

## Supabase schema

The first migration creates five tables.

### `profiles`

Stores the user profile that mirrors the Supabase auth user.

- `id` links to `auth.users.id`.
- `email` stores the user email.
- `full_name` stores the display name.
- `created_at` and `updated_at` track profile timestamps.

### `categories`

Stores income and expense categories.

- `user_id` is optional for system categories and required for user-created categories.
- `name` is the category label, such as Food or Transport.
- `type` is either `income` or `expense`.
- `is_system` marks built-in categories.

### `transactions`

Stores income and expense entries.

- `user_id` identifies the owning user.
- `category_id` links the transaction to a category.
- `amount` stores the transaction amount as a non-negative number.
- `transaction_type` is `income` or `expense`.
- `transaction_date` stores the day of the transaction.
- `description` stores notes or memo text.

### `budgets`

Stores per-category budget limits.

- `user_id` identifies the owner.
- `category_id` links the budget to a category.
- `period` is `weekly` or `monthly`.
- `amount` is the budget limit.
- `start_date` and `end_date` define the active range.

### `savings_goals`

Stores savings targets.

- `user_id` identifies the owner.
- `name` is the goal name.
- `target_amount` is the goal amount.
- `current_amount` is the amount already saved.
- `target_date` is the target deadline.

## Row-level security

All tables have row-level security enabled.

- `profiles` can only be read, inserted, or updated by the matching user.
- `categories` can be read by the owner or by anyone for system categories.
- `transactions`, `budgets`, and `savings_goals` can only be read and changed by the owning user.

This means each signed-in user only has access to their own data unless a row is intentionally marked as system data.

## Dashboard values

The current dashboard uses a shared demo ledger so the UI is visible before the live data layer is connected.

- Current balance: `$8,420.18`
- Monthly income: `$4,920`
- Monthly expenses: `$2,310`
- Food budget: `$68` used out of `$250`
- Transport budget: `$45` used out of `$120`
- Entertainment budget: `$90` used out of `$150`
- Recent transactions:
  - Grocery run: `-$62.48`
  - Salary: `+$4,920.00`
  - Train pass: `-$45.00`

## How values are calculated

The shared dashboard helper in `src/lib/financeDashboard.ts` is the source of truth for the demo values and formulas.

### Current balance formula

`current balance = opening balance + total income - total expenses`

For the current demo snapshot, the opening balance is `$5,810.18`. The shared ledger adds that opening balance to the demo income and expenses to produce the displayed balance of `$8,420.18`.

### Monthly income formula

`monthly income = sum of income transactions in the current calendar month`

The demo ledger contains a single current-month income transaction for `$4,920`, which is why the monthly income card shows `$4,920`.

### Monthly expenses formula

`monthly expenses = sum of expense transactions in the current calendar month`

The demo ledger contains current-month expense transactions that add up to `$2,310`.

### Budget usage formula

`budget used = sum of expense transactions in the budget category and date range`

`remaining budget = budget amount - budget used`

`budget percent used = min((budget used / budget amount) * 100, 100)`

Example values from the demo ledger:

- Food percent used = `68 / 250 * 100 = 27.2%`
- Transport percent used = `45 / 120 * 100 = 37.5%`
- Entertainment percent used = `90 / 150 * 100 = 60%`

The visual progress bar is capped at 100 percent so it does not overflow the card.

### Recent transaction display rule

- Income transactions render with a `+` prefix and green styling.
- Expense transactions render with a `-` prefix and red styling.

The app derives the prefix from `transactionType`, while the amount is stored as a positive number in the shared demo ledger and in the Supabase schema.

### Savings goal progress formula

`savings goal progress = (current amount / target amount) * 100`

This is not yet rendered in the dashboard, but the schema already supports it through `current_amount` and `target_amount`.

### Category breakdown chart formula

`category share = category spending / total spending`

This will power the pie or donut chart view once chart pages are added.

## Authentication flow

- Sign-up uses Supabase Auth email and password.
- Full name is stored as user metadata during sign-up.
- Sign-in uses Supabase Auth email and password.
- If Supabase environment variables are missing, the forms show a clear configuration error.

## Deployment

- Frontend hosting target: Vercel
- Database and auth: Supabase cloud
- If a custom API is added later, it can be deployed on Render, Railway, or Fly.io

## Roadmap

1. Route protection and session persistence.
2. Category CRUD and transaction CRUD.
3. Budget creation, live budget calculations, and overspending alerts.
4. Savings goals and chart visualizations.
5. Realtime syncing, UI polish, and mobile testing.
6. Tests, deployment, and final documentation.

## Notes

- The current UI is intentionally using sample values so the dashboard has a realistic layout before live data is connected.
- When the data layer is wired, the demo ledger in `src/lib/financeDashboard.ts` should be replaced by Supabase queries and shared calculation helpers should continue to own the formulas.
