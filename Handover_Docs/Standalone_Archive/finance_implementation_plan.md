# QUICKBOX FINANCIAL MANAGEMENT SYSTEM

## Standalone Frontend Technical Implementation Plan & Work Breakdown Structure (WBS)

**Document Version:** 1.0.0\
**Project Phase:** Technical Engineering & Implementation Blueprint\
**Target Domain:** Standalone Enterprise Financial Management &
Accounting System\
**Frontend Architecture:** React 19 + Vite 8 + React Router v7 +
TanStack Table v8 + Recharts + Tailwind CSS / Modern CSS\
**Target File Location:**
`react-dashboard/Handover_Docs/finance_implementation_plan.md`

------------------------------------------------------------------------

## 1. Executive Summary & Architectural Vision

### 1.1 System Overview

The **QuickBox Financial Management System** is a high-performance,
pixel-perfect, standalone web application engineered for comprehensive
enterprise accounting, treasury management, compliance, and financial
intelligence. The system delivers an end-to-end double-entry bookkeeping
engine, multi-currency General Ledger, automated Accounts Receivable
(AR) and Accounts Payable (AP) workflows, payroll compensation with Wage
Protection System (WPS) integration, fixed asset lifecycle and
depreciation scheduling, Value Added Tax (VAT) settlement, two-way
automated bank reconciliation, and formal statutory financial reporting
(Balance Sheet, Income Statement / P&L, Statement of Cash Flows, Trial
Balance).

### 1.2 Standalone Autonomy Mandate

**Strict Isolation Boundary:** The QuickBox Financial System is
architected and built as a **100% standalone, autonomous financial
platform**. It operates independently of any external warehouse,
physical stock, supply chain, or inventory tracking systems. All master
data, chart of accounts, journal entries, customer billings, vendor
payables, payroll records, and financial statements are self-contained
within dedicated financial domain contexts, schemas, and services.

### 1.3 Core Engineering Principles

1.  **Mathematical Invariant Integrity:** The fundamental double-entry
    theorem ($\sum\text{Debits} \equiv \sum\text{Credits}$) is enforced
    synchronously at the UI, form validation, and state store layers
    prior to any transaction posting.
2.  **High-Density Tabular UI:** Built on the proven design patterns of
    enterprise financial software---combining high information density,
    subtle zebra striping, monospace numeric formatting, contextual
    status badges, expandable sub-tables, and instant client-side
    filtering.
3.  **Modular Context Architecture:** Decoupled React 19 Contexts manage
    discrete financial domains while orchestrating automated journal
    voucher creation through a centralized General Ledger bus.
4.  **Sub-Millisecond Client-Side Calculations:** All financial metrics,
    aging analyses, depreciation schedules, tax liabilities, and
    statement totals compute dynamically with zero UI stutter.
5.  **Auditability & Compliance Ready:** Every transaction maintains
    immutable audit metadata (timestamp, user, voucher reference,
    previous state) compatible with IFRS, GAAP, GCC VAT, and statutory
    audit mandates.

------------------------------------------------------------------------

## 2. System Architecture & Technology Stack

### 2.1 Complete Technical Stack Specification

  --------------------------------------------------------------------------------
  Architecture      Technology / Library       Version         Core Purpose &
  Layer                                                        Technical Rationale
  ----------------- -------------------------- --------------- -------------------
  **UI Framework**  **React**                  `^19.2.0`       Utilizes React 19
                                                               concurrent
                                                               features,
                                                               `useActionState`,
                                                               `useOptimistic`,
                                                               `useMemo`,
                                                               `useCallback`, and
                                                               modern
                                                               server/client
                                                               component
                                                               paradigms.

  **DOM Renderer**  **React DOM**              `^19.2.0`       Client-side root
                                                               bootstrapping via
                                                               `createRoot` with
                                                               `StrictMode`
                                                               enabled.

  **Build Tool &    **Vite**                   `^8.1.0`        Ultra-fast Hot
  Bundler**                                                    Module Replacement
                                                               (HMR), optimized
                                                               Rollup production
                                                               bundling, and fast
                                                               ES module
                                                               resolution.

  **Babel/React     `@vitejs/plugin-react`     `^6.0.0`        Fast JSX runtime
  Plugin**                                                     compilation and
                                                               React Fast Refresh
                                                               support.

  **Routing         **React Router**           `^7.18.0`       Declarative
  Engine**                                                     client-side
                                                               routing, nested
                                                               layout routes
                                                               (`Outlet`), dynamic
                                                               route parameters,
                                                               and programmatic
                                                               navigation.

  **Iconography**   `@phosphor-icons/react` /  `^2.1.0`        High-clarity vector
                    `lucide-react`                             iconography across
                                                               regular, bold, and
                                                               fill weights for
                                                               financial actions,
                                                               status badges, and
                                                               navigation.

  **Table Engine**  `@tanstack/react-table`    `^8.15.0`       Headless,
                                                               high-performance
                                                               data grid engine
                                                               supporting
                                                               multi-column
                                                               sorting, faceted
                                                               filtering,
                                                               pagination, column
                                                               visibility, and
                                                               expandable
                                                               accordion rows.

  **Data            `recharts`                 `^2.12.0`       Declarative
  Visualization**                                              charting library
                                                               for rendering
                                                               30-day cash flow
                                                               curves, revenue
                                                               vs. expense
                                                               comparisons, and
                                                               AR/AP aging
                                                               breakdowns.

  **Form &          `react-hook-form` **+**    `^7.51.0` /     High-performance
  Validation**      `zod`                      `^3.22.0`       form state
                                                               management with
                                                               type-safe schema
                                                               validation for
                                                               multi-line journal
                                                               builders and
                                                               invoice forms.

  **Styling &       **Tailwind CSS / Custom    `^3.4.0` /      High-density CSS
  Design System**   CSS Tokens**               Custom          variables,
                                                               responsive
                                                               flex/grid layouts,
                                                               customized slim
                                                               scrollbars, and
                                                               semantic status
                                                               color tokens.

  **Date & Currency `date-fns` **+** `Intl`    `^3.6.0`        Fiscal period
  Utils**           **API**                                    manipulation,
                                                               quarter boundaries,
                                                               aging calculations,
                                                               and multi-currency
                                                               formatting (`USD`,
                                                               `AED`, `EUR`,
                                                               `SAR`).

  **Code Quality &  `oxlint` **/** `eslint`    `^1.70.0`       High-speed static
  Linting**                                                    analysis and strict
                                                               code style
                                                               enforcement.

  **Testing Suite** `vitest` **+**             `^1.5.0`        Unit and
                    `@testing-library/react`                   integration testing
                                                               for financial
                                                               calculation engines
                                                               and context state
                                                               reducers.
  --------------------------------------------------------------------------------

### 2.2 Global Design Tokens & Typography

    :root {
      /* Surface & Background Tokens */
      --bg-sidebar: #f8faf9;
      --bg-main: #ffffff;
      --bg-subtle: #f9fafb;
      --bg-elevated: #ffffff;
      --border-color: #e5e7eb;
      --border-subtle: #f3f4f6;

      /* Typography Tokens */
      --text-main: #111827;
      --text-muted: #6b7280;
      --text-faint: #9ca3af;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

      /* Financial Brand & Accent Colors */
      --primary-green: #5eb160;
      --primary-green-hover: #4e9e50;
      --primary-navy: #0f172a;
      --primary-blue: #2563eb;
      --primary-blue-hover: #1d4ed8;

      /* Semantic Financial Status Colors */
      --status-success-bg: #dcfce7;
      --status-success-text: #16a34a;
      --status-success-border: #bbf7d0;

      --status-warning-bg: #fef9c3;
      --status-warning-text: #ca8a04;
      --status-warning-border: #fef08a;

      --status-danger-bg: #fef2f2;
      --status-danger-text: #ef4444;
      --status-danger-border: #fecaca;

      --status-info-bg: #e0e7ff;
      --status-info-text: #4f46e5;
      --status-info-border: #c7d2fe;

      --status-neutral-bg: #f3f4f6;
      --status-neutral-text: #374151;
      --status-neutral-border: #e5e7eb;
    }

------------------------------------------------------------------------

## 3. Component Hierarchy & Directory Architecture

### 3.1 Application File Structure

    react-dashboard/
    ├── index.html                           # HTML5 mounting shell
    ├── vite.config.js                       # Vite build configuration with alias & plugins
    ├── package.json                         # Dependencies & scripts
    ├── public/                              # Static brand assets, bank logos
    │   ├── favicon.svg
    │   └── bank-logos/
    ├── src/
    │   ├── main.jsx                         # Application entrypoint with StrictMode
    │   ├── App.jsx                          # Root Provider tree & React Router definition
    │   ├── App.css                          # Global financial design tokens & component styles
    │   ├── index.css                        # CSS reset & base layout rules
    │   │
    │   ├── assets/                          # SVG icons, illustrations
    │   │
    │   ├── components/                      # Modular UI Components
    │   │   ├── layout/                      # Application Shell Components
    │   │   │   ├── Layout.jsx               # Master shell (Sidebar + Topbar + Content + Toast)
    │   │   │   ├── Sidebar.jsx              # Finance navigation with active counters & badges
    │   │   │   ├── Topbar.jsx               # Global search, period selector, alert bell, profile
    │   │   │   ├── FloatingToast.jsx        # Viewport alert overlay for tax & overdue warnings
    │   │   │   └── ErrorBoundary.jsx        # Graceful error catching fallback UI
    │   │   │
    │   │   ├── ui/                          # Reusable Atomic UI Primitives
    │   │   │   ├── MetricCard.jsx           # KPI widget with icon, value, delta trend
    │   │   │   ├── Badge.jsx                # Semantic status pill (Paid, Overdue, Balanced)
    │   │   │   ├── Modal.jsx                # Accessible modal dialog wrapper
    │   │   │   ├── Drawer.jsx               # Slide-over panel (for Invoice/Journal creation)
    │   │   │   ├── DropdownMenu.jsx         # Contextual action popover (3-dot menu)
    │   │   │   ├── Tabs.jsx                 # Category tab navigation bar
    │   │   │   ├── Pagination.jsx           # High-density page selector & record counter
    │   │   │   ├── DateRangePicker.jsx      # Fiscal period & date range selector
    │   │   │   └── SearchInput.jsx          # Instant search filter input
    │   │   │
    │   │   ├── finance/                     # Domain-Specific Financial Composites
    │   │   │   ├── DoubleEntryBuilder.jsx   # Multi-row journal builder with live balance totalizer
    │   │   │   ├── InvoiceDrawer.jsx        # Multi-line customer billing drawer
    │   │   │   ├── BillPaymentModal.jsx     # AP bill settlement & disbursement dialog
    │   │   │   ├── ReconciliationWorkspace.jsx # 2-pane bank vs ledger match tool
    │   │   │   ├── DepreciationScheduleTable.jsx # Asset amortization schedule breakdown
    │   │   │   ├── FinancialStatementViewer.jsx # Multi-level hierarchical statement renderer
    │   │   │   ├── WpsExportModal.jsx       # Central Bank WPS SIF file export dialog
    │   │   │   └── AccountLedgerDrawer.jsx  # Drill-down transaction history for a single GL account
    │   │   │
    │   │   └── charts/                      # Financial Visualization Components
    │   │       ├── CashFlowTrendChart.jsx   # 30-day continuous cash flow SVG/Recharts curve
    │   │       ├── RevenueExpenseBarChart.jsx # Monthly comparative revenue vs. expense bars
    │   │       ├── AgingBreakdownPie.jsx    # AR / AP aging bucket distribution chart
    │   │       └── AssetDepreciationCurve.jsx # Fixed asset NBV decline curve over useful life
    │   │
    │   ├── context/                         # Modular Financial Domain Contexts
    │   │   ├── FinanceContext.jsx           # GL, Chart of Accounts, Journal Entries, Balance Invariant
    │   │   ├── InvoicingContext.jsx         # Invoices, Customers, AR Aging, Payments, DSO
    │   │   ├── ExpensesContext.jsx          # Vendor Bills, AP Aging, Expense Categories, Approvals
    │   │   ├── BankingContext.jsx           # Bank Accounts, Feeds, Reconciliation Rules, Matching Engine
    │   │   ├── PayrollContext.jsx           # Employee Directory, Salaries, Deductions, WPS Runs
    │   │   └── TaxContext.jsx               # VAT Rates, Output/Input VAT, Tax Returns, Filings
    │   │
    │   ├── hooks/                           # Custom React Business Logic Hooks
    │   │   ├── useGeneralLedger.js          # GL queries, trial balance synthesis, account balance lookup
    │   │   ├── useDoubleEntryValidation.js  # Live debit/credit equality checker
    │   │   ├── useInvoicing.js              # Invoice creation, status mutations, payment allocation
    │   │   ├── useExpenses.js               # Bill recording, payment scheduling, 3-way matching
    │   │   ├── usePayroll.js                # Gross-to-net calculation, payroll run execution
    │   │   ├── useTaxCalculator.js          # VAT rate computation, net tax liability synthesizer
    │   │   ├── useDepreciationCalculator.js # Straight-line & accelerated depreciation engine
    │   │   └── useFinancialStatements.js    # Balance Sheet, P&L, Cash Flow generator
    │   │
    │   ├── services/                        # Business Logic & Math Engine Services
    │   │   ├── AccountingEngine.js          # Double-entry verification, journal posting pipeline
    │   │   ├── StatementGenerator.js        # Algorithmic synthesis of P&L, Balance Sheet, Cash Flow
    │   │   ├── ReconciliationService.js     # Exact and fuzzy bank statement match rules
    │   │   ├── WpsFileGenerator.js          # WPS Salary Information File (SIF) text formatter
    │   │   ├── DepreciationEngine.js        # Mathematical depreciation schedule generators
    │   │   └── CsvExportService.js          # Financial tabular export to CSV/Excel
    │   │
    │   ├── types/                           # JSDoc / TypeScript Schema Definitions
    │   │   ├── account.types.js             # COA account types and classes
    │   │   ├── journal.types.js             # Journal voucher and line item types
    │   │   ├── invoice.types.js             # Invoice, line items, customer types
    │   │   ├── expense.types.js             # Vendor bill, payment terms, expense types
    │   │   ├── payroll.types.js             # Employee contract, deduction, payslip types
    │   │   ├── fixedAsset.types.js          # Asset register, depreciation schedule types
    │   │   ├── banking.types.js             # Bank account, statement feed, match types
    │   │   └── tax.types.js                 # VAT return, tax bracket, filing types
    │   │
    │   ├── utils/                           # Formatting & Math Utilities
    │   │   ├── currencyFormatter.js         # Precise currency formatting with locale support
    │   │   ├── dateUtils.js                 # Fiscal years, quarters, aging day calculations
    │   │   ├── mathUtils.js                 # Precision floating-point arithmetic (cents rounding)
    │   │   └── printUtils.js                # Print styling and document trigger utilities
    │   │
    │   ├── mock/                            # Standalone Mock Financial Data Generators
    │   │   ├── mockAccounts.js              # 5-tier standard Chart of Accounts (68 accounts)
    │   │   ├── mockJournals.js              # Balanced journal vouchers with multi-line splits
    │   │   ├── mockInvoices.js              # AR invoices with line items, VAT, and aging states
    │   │   ├── mockBills.js                 # AP vendor bills with categorized expenses
    │   │   ├── mockEmployees.js             # Employee directory with compensation packages
    │   │   ├── mockAssets.js                # Fixed asset register with accumulated depreciation
    │   │   ├── mockBankFeeds.js             # Real-world bank feeds and statement transactions
    │   │   ├── mockTaxes.js                 # Quarterly VAT returns and tax authority logs
    │   │   └── mockDataSeeder.js            # Unified data seeder with local storage persistence
    │   │
    │   └── pages/                           # 10 Master Application Routed Views
    │       ├── DashboardView.jsx            # Executive Financial Overview (/dashboard)
    │       ├── GeneralLedgerView.jsx        # Chart of Accounts & GL Ledgers (/general-ledger)
    │       ├── JournalEntriesView.jsx       # Double-Entry Journal Vouchers (/journals)
    │       ├── InvoicingView.jsx            # Invoicing & Accounts Receivable (/invoicing)
    │       ├── ExpensesView.jsx             # Bills, Expenses & Accounts Payable (/expenses)
    │       ├── PayrollView.jsx              # Payroll, Compensation & WPS (/payroll)
    │       ├── TaxComplianceView.jsx        # VAT & Regulatory Tax Compliance (/tax-compliance)
    │       ├── FixedAssetsView.jsx          # Fixed Asset Register & Depreciation (/fixed-assets)
    │       ├── BankingReconciliationView.jsx# Bank Feeds & 2-Pane Reconciliation (/banking)
    │       ├── ReportsView.jsx              # Financial Statements & Analytics (/reports)
    │       └── SettingsView.jsx             # Fiscal Year, Base Currency, VAT Rates (/settings)

------------------------------------------------------------------------

## 4. State Management Architecture

### 4.1 Modular React Context Hierarchy

The state layer is divided into specialized, modular React Contexts
wrapped in a strict provider tree inside `App.jsx`. This architecture
ensures domain encapsulation, eliminates global state bloat, and
provides granular re-rendering boundaries.

    ┌──────────────────────────────────────────────────────────────────────────────────────────┐
    │                                   <App /> Provider Tree                                  │
    ├──────────────────────────────────────────────────────────────────────────────────────────┤
    │  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
    │  │ <FinanceProvider> (GL, Chart of Accounts, Journal Engine, Invariant Validation)    │  │
    │  │   ┌──────────────────────────────────────────────────────────────────────────────┐ │  │
    │  │   │ <InvoicingProvider> (Customer Invoices, AR Aging, Payments, DSO Metrics)     │ │  │
    │  │   │   ┌────────────────────────────────────────────────────────────────────────┐ │ │  │
    │  │   │   │ <ExpensesProvider> (Vendor Bills, AP Aging, Payment Schedules, Opex)   │ │ │  │
    │  │   │   │   ┌──────────────────────────────────────────────────────────────────┐ │ │ │  │
    │  │   │   │   │ <BankingProvider> (Bank Accounts, Feeds, 2-Pane Reconciler)      │ │ │ │  │
    │  │   │   │   │   ┌────────────────────────────────────────────────────────────┐ │ │ │ │  │
    │  │   │   │   │   │ <PayrollProvider> (Employees, Gross-to-Net, WPS, Payslips) │ │ │ │ │  │
    │  │   │   │   │   │   ┌──────────────────────────────────────────────────────┐ │ │ │ │ │  │
    │  │   │   │   │   │   │ <TaxProvider> (VAT Rates, Tax Returns, Filings)      │ │ │ │ │ │  │
    │  │   │   │   │   │   │   ┌────────────────────────────────────────────────┐ │ │ │ │ │ │  │
    │  │   │   │   │   │   │   │ <RouterProvider> (Layout Shell & 10 App Views) │ │ │ │ │ │ │  │
    │  │   │   │   │   │   │   └────────────────────────────────────────────────┘ │ │ │ │ │ │  │
    │  │   │   │   │   │   └──────────────────────────────────────────────────────┘ │ │ │ │ │  │
    │  │   │   │   │   └────────────────────────────────────────────────────────────┘ │ │ │ │  │
    │  │   │   │   └──────────────────────────────────────────────────────────────────┘ │ │ │  │
    │  │   │   └────────────────────────────────────────────────────────────────────────┘ │ │  │
    │  │   └──────────────────────────────────────────────────────────────────────────────┘ │  │
    │  └────────────────────────────────────────────────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────────────────────────────────────────────┘

### 4.2 Detailed Domain Context Specifications

#### 1. `FinanceContext.jsx` (Core General Ledger Engine)

- **Managed State:**
  - `accounts`: Master Chart of Accounts array (1000--6000 series) with
    account code, name, class, normal balance, and current balance.
  - `journals`: Array of posted and draft double-entry journal vouchers
    with multi-line debits and credits.
  - `fiscalYear`: Current active fiscal year object (start date, end
    date, locked periods array).
  - `trialBalance`: Computed array of all accounts with debit/credit
    balance snapshot.
- **Exposed Actions & Reducer Methods:**
  - `postJournalEntry(entry)`: Validates
    $\sum\text{Debits} \equiv \sum\text{Credits}$, generates sequential
    voucher ID (`JV-2026-XXXX`), appends to journal state, and updates
    corresponding GL account balances immutably.
  - `reverseJournalEntry(voucherId, reason)`: Creates an equal and
    opposite offsetting journal voucher, tagging the original as
    `Reversed`.
  - `addAccount(accountData)`: Creates a new COA account with validation
    against duplicate codes.
  - `updateAccount(accountId, updates)`: Updates account metadata (name,
    description, active status).
  - `lockFiscalPeriod(periodId)`: Locks a monthly period against new
    postings or modifications.

#### 2. `InvoicingContext.jsx` (Accounts Receivable & Billing)

- **Managed State:**
  - `invoices`: Array of customer invoices with line items, tax
    calculations, payment status, and due dates.
  - `customers`: Directory of client accounts with credit limits,
    payment terms, and contact details.
  - `arMetrics`: Computed object containing Total AR, Current, 1-30,
    31-60, 61-90, 90+ days overdue, and Days Sales Outstanding (DSO).
- **Exposed Actions & Reducer Methods:**
  - `createInvoice(invoiceData)`: Computes subtotal, tax amount, and
    total balance. Auto-dispatches an automated journal entry to
    `FinanceContext`
    (`Dr 1110 AR, Cr 4010 Revenue, Cr 2210 Output VAT`).
  - `recordPayment(invoiceId, paymentData)`: Updates invoice balance
    due, transitions status (`Partially Paid` / `Paid`), and dispatches
    collection journal (`Dr 1020 Bank, Cr 1110 AR`).
  - `voidInvoice(invoiceId, reason)`: Marks invoice as voided and posts
    offsetting GL reversal entry.

#### 3. `ExpensesContext.jsx` (Accounts Payable & Vendor Expenses)

- **Managed State:**
  - `bills`: Array of vendor bills and expense records with category,
    payment due date, and approval status.
  - `vendors`: Supplier directory with Tax Registration Numbers (TRN),
    payment terms, and banking info.
  - `apMetrics`: Computed object containing Total AP, Bills Due This
    Week, and Monthly Opex.
- **Exposed Actions & Reducer Methods:**
  - `recordBill(billData)`: Validates expense line items, records
    payable, and auto-dispatches GL entry
    (`Dr 6xxx Expense, Dr 2220 Input VAT, Cr 2010 AP`).
  - `approveBill(billId)`: Transitions bill from `Pending Approval` to
    `Approved`.
  - `payBill(billId, paymentDetails)`: Settles bill, records
    disbursement, and dispatches GL entry (`Dr 2010 AP, Cr 1020 Bank`).

#### 4. `BankingContext.jsx` (Treasury, Bank Feeds & 2-Way Matcher)

- **Managed State:**
  - `bankAccounts`: List of corporate treasury and bank accounts
    (Account #, IBAN, GL Link, Currency, Current Balance).
  - `feedTransactions`: Live imported bank statement transaction stream
    (Date, Description, Withdrawal, Deposit, Match Status).
  - `reconciliationSession`: Active workspace session with matched
    pairs, unmatched items, and discrepancy totalizer.
- **Exposed Actions & Reducer Methods:**
  - `importBankFeed(accountId, transactionsArray)`: Parses and loads
    external bank statement records.
  - `matchTransactions(feedTxId, ledgerTxId)`: Pairs a bank statement
    line with a GL cash entry, marking both as reconciled.
  - `createAdjustingEntry(feedTxId, accountCode, memo)`: Generates an
    immediate expense/fee journal entry for bank-originated charges.
  - `finalizeReconciliation(sessionId)`: Commits reconciliation report
    and locks verified bank statement period.

#### 5. `PayrollContext.jsx` (Compensation, Deductions & WPS Engine)

- **Managed State:**
  - `employees`: Staff register with basic salary, allowances breakdown,
    bank routing details, and tax status.
  - `payrollRuns`: Historical and draft monthly payroll batch runs.
  - `activeBatch`: Current draft payroll run with live gross-to-net
    calculations.
- **Exposed Actions & Reducer Methods:**
  - `generateMonthlyPayroll(period)`: Computes basic pay, allowances,
    employee social security, tax withholdings, and net pay for all
    active employees.
  - `commitPayrollRun(batchId)`: Finalizes payroll, generates WPS Salary
    Information File (SIF), and posts consolidated payroll journal
    voucher
    (`Dr 6010 Basic, Dr 6020 Allowances, Dr 6040 Employer SS, Cr 2110 Net Pay, Cr 2120 SS Payable, Cr 2230 Tax Withholding`).
  - `exportWpsSifFile(batchId)`: Generates and triggers download of
    Central Bank compliant text file.

#### 6. `TaxContext.jsx` (VAT & Regulatory Compliance)

- **Managed State:**
  - `taxRates`: Configured VAT tax brackets (Standard 5%/15%, Zero-Rated
    0%, Exempt).
  - `taxPeriods`: Historical and active tax quarters/months with
    calculated Output VAT, Input VAT, and Net Liability.
  - `taxAuditLog`: Immutable audit trail of every taxable invoice and
    bill transaction.
- **Exposed Actions & Reducer Methods:**
  - `calculateTaxReturn(period)`: Aggregates all sales invoices and
    expense bills for the period to synthesize the official VAT Return
    form.
  - `fileTaxReturn(period, filingData)`: Records filing reference,
    generates tax settlement journal entry
    (`Dr 2210 Output VAT, Cr 2220 Input VAT, Cr 1020 Bank/2215 Settlement Payable`),
    and marks period as filed.

------------------------------------------------------------------------

## 5. Data Models, TypeScript/JSDoc Schemas & Mock Data Generation

### 5.1 Formal Data Schemas

    /**
     * @typedef {'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'} AccountClass
     * @typedef {'Debit' | 'Credit'} NormalBalance
     * 
     * @typedef {Object} Account
     * @property {string} id - Unique identifier (e.g., 'acc_1020')
     * @property {string} code - 4-digit accounting code (e.g., '1020')
     * @property {string} name - Account title (e.g., 'Operating Bank Account')
     * @property {AccountClass} class - Main classification tier
     * @property {string} subCategory - Sub-classification (e.g., 'Cash & Cash Equivalents')
     * @property {NormalBalance} normalBalance - 'Debit' or 'Credit'
     * @property {number} currentBalance - Real-time monetary balance (in base currency cents/dollars)
     * @property {boolean} isActive - Status flag
     * @property {string} currency - Base currency code (e.g., 'USD', 'AED')
     */

    /**
     * @typedef {Object} JournalLine
     * @property {number} lineNumber - 1-indexed line order
     * @property {string} accountId - Foreign key to Account
     * @property {string} accountCode - Snapshot of account code
     * @property {string} accountName - Snapshot of account title
     * @property {number} debit - Debit amount (>= 0.00)
     * @property {number} credit - Credit amount (>= 0.00)
     * @property {string} [memo] - Optional line-level note
     * @property {string} [costCenter] - Optional cost center identifier
     */

    /**
     * @typedef {'Draft' | 'Posted' | 'Reversed'} JournalStatus
     * @typedef {'General' | 'Opening' | 'Adjusting' | 'Closing' | 'Payroll' | 'Depreciation' | 'Tax'} JournalType
     * 
     * @typedef {Object} JournalEntry
     * @property {string} id - Unique sequential voucher ID (e.g., 'JV-2026-00104')
     * @property {string} postingDate - ISO Date (YYYY-MM-DD)
     * @property {string} fiscalPeriod - Period key (e.g., '2026-08')
     * @property {JournalType} type - Classification type
     * @property {string} reference - Business reference / memo
     * @property {JournalLine[]} lines - Array of debit/credit lines (must balance: Sum(debit) == Sum(credit))
     * @property {number} totalAmount - Total balanced voucher amount
     * @property {JournalStatus} status - Posting state
     * @property {string} createdBy - User name / ID
     * @property {string} createdAt - ISO Timestamp
     * @property {string} [postedAt] - ISO Timestamp of GL posting
     */

    /**
     * @typedef {'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Void'} InvoiceStatus
     * 
     * @typedef {Object} InvoiceLineItem
     * @property {string} id - Line item UUID
     * @property {string} description - Service or billing item description
     * @property {number} quantity - Quantity units
     * @property {number} unitRate - Unit price
     * @property {number} discountPercent - Discount rate (0-100)
     * @property {number} taxRatePercent - VAT rate (e.g., 5, 15)
     * @property {number} lineTotal - Computed line net total after discount and tax
     */

    /**
     * @typedef {Object} Invoice
     * @property {string} id - Invoice number (e.g., 'INV-2026-0412')
     * @property {string} customerId - Foreign key to Customer
     * @property {string} customerName - Customer legal name
     * @property {string} issueDate - ISO Date (YYYY-MM-DD)
     * @property {string} dueDate - ISO Date (YYYY-MM-DD)
     * @property {string} paymentTerms - Terms string (e.g., 'Net 30', 'Due on Receipt')
     * @property {InvoiceLineItem[]} lineItems - Billed items
     * @property {number} subtotal - Net amount before tax
     * @property {number} taxAmount - Total calculated Output VAT
     * @property {number} totalAmount - Grand total (Subtotal + Tax)
     * @property {number} paidAmount - Total payments applied to date
     * @property {number} balanceDue - Remaining amount due
     * @property {InvoiceStatus} status - Invoice lifecycle state
     * @property {string} currency - Billing currency code
     * @property {string} [notes] - Customer-facing notes
     */

    /**
     * @typedef {'Pending Approval' | 'Approved' | 'Scheduled' | 'Paid' | 'Overdue'} BillStatus
     * 
     * @typedef {Object} VendorBill
     * @property {string} id - Bill reference (e.g., 'BILL-2026-089')
     * @property {string} vendorId - Foreign key to Vendor
     * @property {string} vendorName - Vendor trade name
     * @property {string} expenseCategory - Operational classification (Rent, Utilities, Software)
     * @property {string} expenseAccountId - GL Account FK (6000-series)
     * @property {string} billDate - ISO Date (YYYY-MM-DD)
     * @property {string} dueDate - ISO Date (YYYY-MM-DD)
     * @property {number} subtotal - Net expense amount
     * @property {number} taxAmount - Recoverable Input VAT amount
     * @property {number} totalAmount - Total payable amount
     * @property {number} paidAmount - Settled amount
     * @property {BillStatus} status - Payable state
     * @property {string} paymentMethod - Payment channel (Bank Transfer, Credit Card, Cheque)
     * @property {string} [receiptUrl] - Receipt attachment URL / document reference
     */

    /**
     * @typedef {Object} EmployeeCompensation
     * @property {string} id - Employee ID (e.g., 'EMP-1042')
     * @property {string} name - Full employee name
     * @property {string} department - Department / Division
     * @property {string} role - Job title
     * @property {number} basicSalary - Fixed monthly base pay
     * @property {number} housingAllowance - Monthly housing stipend
     * @property {number} transportAllowance - Monthly transportation allowance
     * @property {number} otherAllowances - Overtime, bonus, or variable allowances
     * @property {number} employeeSocialSecurity - Deducted employee pension share
     * @property {number} employerSocialSecurity - Employer pension contribution expense
     * @property {number} incomeTaxWithholding - Monthly payroll tax deduction
     * @property {string} bankIban - Direct deposit IBAN
     * @property {string} bankCode - Central Bank routing code
     * @property {boolean} isActive - Active employment status
     */

    /**
     * @typedef {'Straight-Line' | 'Declining-Balance' | 'Sum-of-Years'} DepreciationMethod
     * @typedef {'Active' | 'Disposed' | 'Fully Depreciated'} AssetStatus
     * 
     * @typedef {Object} FixedAsset
     * @property {string} id - Fixed asset code (e.g., 'FA-0082')
     * @property {string} name - Asset title (e.g., 'Dell PowerEdge Server Rack')
     * @property {string} category - Category (IT Equipment, Office Furniture, Vehicles)
     * @property {string} purchaseDate - Acquisition date
     * @property {number} purchaseCost - Gross historical acquisition cost
     * @property {number} salvageValue - Estimated residual scrap value
     * @property {number} usefulLifeYears - Expected economic life in years
     * @property {DepreciationMethod} method - Depreciation formula
     * @property {string} assetAccountId - Balance Sheet Asset GL Account (1500-series)
     * @property {string} accumDepAccountId - Balance Sheet Contra-Asset GL Account (15x9)
     * @property {string} depExpenseAccountId - Income Statement Expense GL Account (6410)
     * @property {number} accumulatedDepreciation - Total amortized to date
     * @property {number} netBookValue - Cost minus Accumulated Depreciation
     * @property {AssetStatus} status - Operational state
     */

### 5.2 Standalone Mock Data Generator & Seeder

The application includes a self-contained mock data engine
(`mockDataSeeder.js`) that boots the application with complete,
realistic, balanced financial data across 12 months: \* **Chart of
Accounts:** Complete 68-account 5-tier COA with starting debit/credit
balances verifying
$\sum\text{Assets} \equiv \sum\text{Liabilities} + \sum\text{Equity}$.
\* **140+ Balanced Journal Entries:** Covering opening entries, sales
invoices, vendor payments, monthly payroll runs, monthly asset
depreciation entries, and tax settlements. \* **40+ Customer Invoices:**
With realistic multi-line items, 5% and 15% VAT calculations, and
distributed AR aging buckets (Current, 1-30, 31-60, 61-90, 90+ days). \*
**35+ Vendor Bills:** Categorized across Rent, Utilities, SaaS,
Professional Fees, and Direct Costs. \* **42 Staff Payroll Records:**
Complete with gross-to-net calculations, WPS banking coordinates, and
payslip data. \* **24 Fixed Assets:** Complete with straight-line
depreciation amortization schedules and accumulated depreciation
contra-balances. \* **Bank Statement Feeds:** 120+ real-world bank
transactions designed for interactive demonstration of the 2-pane
matching algorithm.

------------------------------------------------------------------------

## 6. Implementation Work Breakdown Structure (WBS) across 6 Phases

    ====================================================================================================
                   QUICKBOX FINANCE FRONTEND — 12-WEEK IMPLEMENTATION ROADMAP (WBS)
    ====================================================================================================
     PHASE 1: CORE FOUNDATION & GENERAL LEDGER           [Weeks 1–2]  ████████░░░░░░░░░░░░░░░░░░░░
     PHASE 2: TRANSACTIONS & AP/AR WORKFLOWS             [Weeks 3–4]  ░░░░░░░░████████░░░░░░░░░░░░
     PHASE 3: PAYROLL, TAX & FIXED ASSETS                [Weeks 5–6]  ░░░░░░░░░░░░░░░░████████░░░░
     PHASE 4: TREASURY, BANKING & RECONCILIATION         [Weeks 7–8]  ░░░░░░░░░░░░░░░░░░░░░░░░████
     PHASE 5: FINANCIAL STATEMENTS & REPORTING           [Weeks 9–10] ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
     PHASE 6: COMPLIANCE, SECURITY & QA TESTING          [Weeks 11–12]░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ====================================================================================================

### Phase 1: Core Foundation, App Shell & General Ledger (Weeks 1--2)

#### Objective

Establish the project repository, build system, global design tokens,
responsive App Shell, and the core General Ledger / Chart of Accounts
engine with double-entry invariant validation.

#### Work Packages (WP) & Deliverables

- **WP 1.1: Project Scaffolding & Design Tokens Setup**
  - Initialize Vite 8 + React 19 project structure with strict
    ESLint/Oxlint rules.
  - Implement global CSS design variables (`--bg-sidebar`,
    `--primary-green`, status colors, typography) in `App.css`.
  - Configure React Router v7 with layout nesting and 10 view routes.
- **WP 1.2: Enterprise App Shell & Navigation Layout**
  - Build `Layout.jsx` container with fixed 220px sidebar and fluid main
    content panel with rounded card borders.
  - Build `Sidebar.jsx` with section dividers (General Ledger, Sales &
    Purchasing, Workforce & Compliance, Treasury, Reports), active pill
    highlight, and unread alert counters.
  - Build `Topbar.jsx` with global search, fiscal period dropdown
    selector, pulse alert bell, and user avatar.
  - Build `FloatingToast.jsx` fixed top-right alert overlay for critical
    discrepancy and overdue warnings.
- **WP 1.3: Master Chart of Accounts (COA) & General Ledger Engine**
  - Implement `FinanceContext.jsx` state store with 5-tier account
    hierarchy.
  - Build `GeneralLedgerView.jsx` featuring top 4 KPI cards (Total
    Active Accounts, Assets, Liabilities, Equity), category tabs (`All`,
    `1000 Assets`, `2000 Liabilities`, `3000 Equity`, `4000 Revenue`,
    `5000 Expenses`), and TanStack Table COA grid.
  - Implement `+ Add New Account` modal with account code
    auto-generation and parent selector.
  - Implement `AccountLedgerDrawer.jsx` to view the running transaction
    history for any selected account.
- **WP 1.4: Double-Entry Journal Entry Engine & Builder**
  - Build `JournalEntriesView.jsx` displaying journal vouchers with
    status badges (`Posted`, `Draft`, `Reversed`).
  - Implement expandable accordion rows (`DoubleEntrySubTable`)
    revealing line-item account debits and credits.
  - Build `DoubleEntryBuilder.jsx` modal with dynamic multi-row inputs,
    live debit/credit totalizer, and submit lock when
    $\sum\text{Debits} \neq \sum\text{Credits}$.

------------------------------------------------------------------------

### Phase 2: Transactions, Invoicing & AP/AR Workflows (Weeks 3--4)

#### Objective

Build the end-to-end Accounts Receivable (AR) customer invoicing
pipeline and Accounts Payable (AP) vendor bill management system with
automated General Ledger posting.

#### Work Packages (WP) & Deliverables

- **WP 2.1: Invoicing & Accounts Receivable (AR) Pipeline**
  - Implement `InvoicingContext.jsx` managing customer invoices, payment
    allocations, and customer records.
  - Build `InvoicingView.jsx` with 4 KPI cards (Total AR, Collected MTD,
    Overdue AR, Days Sales Outstanding / DSO).
  - Implement category tabs (`All Invoices`, `Draft`, `Sent / Pending`,
    `Paid`, `Overdue`) and search/filter bar.
  - Build Invoices Table with multi-select checkboxes, monetary
    formatting, status pills (`Paid 🟢`, `Pending 🟡`, `Overdue 🔴`),
    and action menus.
- **WP 2.2: Interactive Invoice Builder Drawer & Payment Collector**
  - Build `InvoiceDrawer.jsx` slide-over builder: customer selector,
    payment terms, dynamic line items (description, quantity, unit rate,
    discount %, VAT rate %), and live auto-calculated totals.
  - Implement automated GL posting upon invoice approval
    (`Dr 1110 AR, Cr 4010 Revenue, Cr 2210 Output VAT`).
  - Build `RecordPaymentModal.jsx` for full or partial payment
    collections with automated cash journal generation
    (`Dr 1020 Bank, Cr 1110 AR`).
- **WP 2.3: Vendor Bills & Accounts Payable (AP) Management**
  - Implement `ExpensesContext.jsx` managing vendor payables and
    categorized expenses.
  - Build `ExpensesView.jsx` with 4 KPI cards (Total AP, Bills Due This
    Week, Monthly Opex, Paid MTD).
  - Build category tabs (`All Payables`, `Rent & Utilities`,
    `Software & IT`, `Professional Fees`, `General Office`).
  - Build Bills Table with receipt attachment preview indicators, status
    badges (`Pending Approval`, `Approved`, `Paid`, `Overdue`), and
    `Pay Now` action triggers.
- **WP 2.4: Record Expense Modal & Bill Settlement Workflow**
  - Build `RecordExpenseModal.jsx` with vendor selector, expense
    category account picker, VAT deduction calculation, and
    drag-and-drop receipt uploader.
  - Build `BillPaymentModal.jsx` to disburse payments from selected
    corporate bank accounts with GL journal posting
    (`Dr 2010 AP, Cr 1020 Bank`).

------------------------------------------------------------------------

### Phase 3: Payroll, Tax & Fixed Asset Management (Weeks 5--6)

#### Objective

Implement workforce payroll compensation with Central Bank WPS export,
statutory VAT calculation and filing, and capital asset depreciation
scheduling.

#### Work Packages (WP) & Deliverables

- **WP 3.1: Payroll Register & Gross-to-Net Engine**
  - Implement `PayrollContext.jsx` managing employee contracts, salary
    structures, and recurring deductions.
  - Build `PayrollView.jsx` with 4 KPI cards (Total Monthly Payroll
    Cost, Net Pay Disbursement, Statutory Deductions, Active Headcount).
  - Build Payroll Register Grid displaying Employee ID, Name,
    Department, Basic Pay, Allowances, Gross Pay, Deductions, Social
    Security, Tax Withholding, and Net Payout.
  - Implement `PayslipModal.jsx` for viewing and downloading individual
    branded employee payslips.
- **WP 3.2: Monthly Payroll Batch Wizard & WPS SIF Export**
  - Build `RunMonthlyPayrollWizard.jsx` calculating gross-to-net for the
    active cycle with one-click posting.
  - Integrate automated payroll journal posting to `FinanceContext`
    (`Dr 6010, Dr 6020, Dr 6040, Cr 2110, Cr 2120, Cr 2230`).
  - Build `WpsFileGenerator.js` service and `WpsExportModal.jsx`
    generating standard Central Bank Salary Information Files (SIF).
- **WP 3.3: Value Added Tax (VAT) Compliance & Filing Center**
  - Implement `TaxContext.jsx` with multi-rate VAT configuration (5%,
    15%, Zero, Exempt).
  - Build `TaxComplianceView.jsx` with 4 KPI cards (Net VAT Liability,
    Output VAT Collected, Input VAT Recoverable, Next Filing Deadline
    countdown).
  - Build Tax Returns Table showing historical and active filing
    quarters with Output/Input VAT breakdowns.
  - Implement `FileTaxReturnModal.jsx` generating the statutory return
    summary and automated tax settlement journal.
- **WP 3.4: Fixed Asset Register & Depreciation Scheduler**
  - Implement `FixedAssetRegister` data structures and
    `DepreciationEngine.js` supporting Straight-Line, Declining Balance,
    and Sum-of-Years-Digits methods.
  - Build `FixedAssetsView.jsx` with 4 KPI cards (Gross Acquisition
    Cost, Accumulated Depreciation, Net Book Value, Active Assets
    Count).
  - Build Fixed Assets Grid displaying asset codes, categories, purchase
    dates, salvage values, and current NBV.
  - Build `DepreciationScheduleTable.jsx` drawer rendering the
    month-by-month amortization schedule with "Post Monthly Depreciation
    to GL" button (`Dr 6410 Dep Expense, Cr 15x9 Accum Dep`).

------------------------------------------------------------------------

### Phase 4: Treasury, Banking & 2-Way Bank Reconciliation (Weeks 7--8)

#### Objective

Implement corporate bank account treasury management, bank statement
feed importing, and the interactive dual-pane reconciliation workspace.

#### Work Packages (WP) & Deliverables

- **WP 4.1: Corporate Bank Accounts & Treasury Overview**
  - Implement `BankingContext.jsx` managing bank accounts (Operating,
    Payroll, Savings) and live statement feeds.
  - Build top treasury overview cards inside
    `BankingReconciliationView.jsx` (Total Bank Balance, GL Cash
    Balance, Unreconciled Variance, Reconciliation Status %).
- **WP 4.2: Bank Statement Importer & Rule Engine**
  - Implement `StatementImportModal.jsx` supporting CSV and OFX bank
    statement uploads.
  - Implement `ReconciliationService.js` rule matcher:
    - Rule 1: Exact Match (Amount + Reference + Date $\pm 2$ days).
    - Rule 2: One-to-Many Match (Batch deposits matching multiple
      invoices).
    - Rule 3: Direct Expense Creation (Bank fees/interest auto-creating
      expense journals).
- **WP 4.3: Interactive Dual-Pane Reconciliation Workspace**
  - Build `ReconciliationWorkspace.jsx` split screen:
    - **Left Pane:** Bank Statement Transactions (Date, Description,
      Withdrawal, Deposit, Select Checkbox).
    - **Right Pane:** General Ledger Cash Book Entries (Date, Reference,
      Payee, Debit, Credit, Select Checkbox).
  - Build live bottom reconciliation status bar displaying:

$$\text{Bank Balance} - \text{GL Balance} = \text{Unreconciled Difference}$$

- Implement one-click "Confirm Reconciliation" and generate discrepancy
  report PDF.

------------------------------------------------------------------------

### Phase 5: Financial Statements & Executive Reporting (Weeks 9--10)

#### Objective

Engineer the core statutory financial reporting engine (Balance Sheet,
P&L, Statement of Cash Flows, Trial Balance), comparative variance
analytics, and the Executive Dashboard.

#### Work Packages (WP) & Deliverables

- **WP 5.1: Financial Statements Generation Engine**
  - Implement `StatementGenerator.js` to compute real-time IFRS/GAAP
    statements directly from GL account balances:
    1.  **Balance Sheet:**
        $\text{Total Assets} \equiv \text{Total Liabilities} + \text{Total Equity}$.
    2.  **Profit & Loss (P&L):** Operating Revenue, Cost of Sales, Gross
        Profit, Opex, EBITDA, Net Profit.
    3.  **Statement of Cash Flows:** Cash from Operating (CFO),
        Investing (CFI), and Financing (CFF) Activities via the Indirect
        Method.
    4.  **Trial Balance:** Full listing of debit and credit balances
        verifying $\Delta = \$ 0.00$.
- **WP 5.2: Reports View & Multi-Period Comparison**
  - Build `ReportsView.jsx` with tabbed navigation across the 4 primary
    statements plus AR/AP Aging matrices.
  - Implement interactive fiscal period picker (`Current Month`, `QTD`,
    `YTD`, `Prior Year`, `Custom Range`).
  - Implement comparative analysis toggle with variance dollar
    ($\Delta\$$) and percentage ($\Delta\%$) columns.
  - Implement drill-down interaction: clicking any statement line opens
    `AccountLedgerDrawer` showing all underlying journal entries.
  - Build print layout stylesheet (`@media print`) and CSV/Excel data
    export utility (`CsvExportService.js`).
- **WP 5.3: Executive Financial Dashboard View**
  - Build `DashboardView.jsx` (`/dashboard`) integrating top 4 executive
    KPI cards (Total Liquidity, AR, AP, Net Profit Margin).
  - Implement `CashFlowTrendChart.jsx` (30-day continuous inflow/outflow
    SVG curve with gradient fill).
  - Implement `AgingBreakdownPie.jsx` and Revenue vs. Expense
    comparative bar chart using Recharts.
  - Build Recent Financial Activity Feed and Quick Action Shortcuts
    (`+ New Journal`, `+ Create Invoice`, `+ Record Expense`).

------------------------------------------------------------------------

### Phase 6: Compliance, Security, Permissions & QA Testing (Weeks 11--12)

#### Objective

Implement Role-Based Access Control (RBAC), period locking, audit trail
logs, end-to-end automated testing, and performance optimization.

#### Work Packages (WP) & Deliverables

- **WP 6.1: Role-Based Access Control (RBAC) & Settings View**
  - Implement role permissions context and matrix (CFO, Senior
    Accountant, AP/AR Clerk, Payroll Officer, Auditor).
  - Build `SettingsView.jsx` with Fiscal Year setup, Base Currency
    configuration, VAT Rates editor, and User Role permissions table.
  - Implement Period Lock mechanism to freeze historical fiscal months
    against modifications.
- **WP 6.2: Financial Audit Logs & Compliance Trail**
  - Build dedicated audit trail logger recording every journal creation,
    invoice modification, bill approval, and tax filing with user
    identity, timestamp, and before/after state diff.
- **WP 6.3: Comprehensive Automated Testing Suite**
  - Unit tests for mathematical engines (Double-entry validator, VAT
    calculations, Straight-line depreciation, Gross-to-net payroll, Cash
    flow indirect synthesis).
  - Component and integration tests for all 10 views and form builders
    using Vitest and React Testing Library.
  - End-to-end (E2E) workflow test suites in Playwright covering the
    full invoice-to-collection and bill-to-settlement lifecycles.
- **WP 6.4: Performance Optimization & Production Build Verification**
  - Implement TanStack Table row virtualization for handling 10,000+
    ledger entries at 60 FPS.
  - Optimize Vite bundle splitting and verify sub-1.5s initial page load
    time.

------------------------------------------------------------------------

## 7. Security, Permissions Matrix & Audit Compliance

### 7.1 Role-Based Access Control (RBAC) Matrix

  --------------------------------------------------------------------------------------
  System Module / Capability     CFO /        Senior     AP / AR    Payroll    External
                               Controller   Accountant    Clerk     Officer    Auditor
  --------------------------- ------------ ------------ ---------- ---------- ----------
  **Executive Dashboard          **Full       **Full    View Only  No Access  View Only
  (**`/dashboard`**)**          Access**     Access**                         

  **Chart of Accounts & GL       **Full       **Full    View Only  No Access  View Only
  (**`/general-ledger`**)**     Access**     Access**                         

  **Post Journal Vouchers     **Approve &   **Create &  Draft Only No Access  View Only
  (**`/journals`**)**            Post**       Post**                          

  **Lock / Unlock Fiscal         **Full     No Access   No Access  No Access  No Access
  Periods**                     Access**                                      

  **Create & Approve Invoices    **Full       **Full    **Create & No Access  View Only
  (**`/invoicing`**)**          Access**     Access**     Send**              

  **Record Customer              **Full       **Full      **Full   No Access  View Only
  Payments**                    Access**     Access**    Access**             

  **Approve & Pay Vendor         **Full       **Full      Draft    No Access  View Only
  Bills (**`/expenses`**)**     Access**     Access**   Bills Only            

  **Execute Payroll & WPS     **Approve &   View Only   No Access    **Full   View Only
  Export (**`/payroll`**)**      Post**                             Access**  

  **File VAT Tax Returns         **Full     **Draft &   View Only  No Access  View Only
  (**`/tax-compliance`**)**     Access**     Review**                         

  **Manage Fixed Assets          **Full       **Full    View Only  No Access  View Only
  (**`/fixed-assets`**)**       Access**     Access**                         

  **Bank Reconciliation          **Full       **Full    Match Only No Access  View Only
  (**`/banking`**)**            Access**     Access**                         

  **Financial Statements         **Full       **Full     Summary   No Access    **Full
  (**`/reports`**)**            Access**     Access**      Only                Access**

  **System Settings & RBAC       **Full     No Access   No Access  No Access  No Access
  (**`/settings`**)**           Access**                                      
  --------------------------------------------------------------------------------------

### 7.2 Audit Trail & Tamper-Proof Financial Logging

- Every write or mutation action generates an immutable record in the
  audit log schema.
- Posted General Ledger vouchers cannot be deleted or edited;
  corrections must be executed via official offsetting **Reversal
  Journal Entries** (`type: 'Reversal'`), maintaining an unbroken audit
  chain.
- Locked fiscal periods reject any retroactive journal postings,
  ensuring closed financial periods remain pristine for regulatory
  review.

------------------------------------------------------------------------

## 8. Quality Assurance, Testing Strategy & Verification Plan

### 8.1 Testing Pyramid Breakdown

                   ┌────────────────────────┐
                   │  End-to-End (Playwright)│  ~25 User Journey Tests
                   ├────────────────────────┤
                   │   Integration Tests    │  ~80 Context & Workflow Tests
                   │ (React Testing Library)│
                   ├────────────────────────┤
                   │       Unit Tests       │  ~150 Math & Accounting Engine Tests
                   │        (Vitest)        │
                   └────────────────────────┘

### 8.2 Critical Unit Test Verification Matrix

  ----------------------------------------------------------------------------------------------------------------------------------------------------
  Test Suite                 Target Service / Module      Critical Invariant / Behavior Under Test                                 Success Criteria
  -------------------------- ---------------------------- ------------------------------------------------------------------------ -------------------
  `doubleEntry.test.js`      `AccountingEngine.js`        Invariant: $\sum\text{Debits} \equiv \sum\text{Credits}$                 Rejects unbalanced
                                                                                                                                   vouchers; posts
                                                                                                                                   balanced entries
                                                                                                                                   accurately.

  `taxCalculator.test.js`    `useTaxCalculator.js`        VAT formula: $\text{Output VAT} - \text{Input VAT} = \text{Liability}$   Correctly applies
                                                                                                                                   5% and 15%
                                                                                                                                   brackets; handles
                                                                                                                                   zero-rated/exempt
                                                                                                                                   items.

  `depreciation.test.js`     `DepreciationEngine.js`      Straight-line:                                                           NBV decreases
                                                          $\frac{\text{Cost} - \text{Salvage}}{\text{Life}} \times \frac{1}{12}$   monotonically to
                                                                                                                                   salvage value;
                                                                                                                                   monthly amounts
                                                                                                                                   match exactly.

  `payrollEngine.test.js`    `usePayroll.js`              Gross-to-Net: $\text{Gross} - \sum\text{Deductions} = \text{Net Pay}$    Correctly computes
                                                                                                                                   employee pension,
                                                                                                                                   employer share, and
                                                                                                                                   income tax
                                                                                                                                   withholdings.

  `cashFlow.test.js`         `StatementGenerator.js`      Indirect Method:                                                         Net cash flow
                                                          $\text{CFO} + \text{CFI} + \text{CFF} = \Delta\text{Cash}$               precisely
                                                                                                                                   reconciles to
                                                                                                                                   Balance Sheet cash
                                                                                                                                   account delta.

  `reconciliation.test.js`   `ReconciliationService.js`   2-Way Matcher: Exact and fuzzy reference matching                        Correctly
                                                                                                                                   auto-matches
                                                                                                                                   identical statement
                                                                                                                                   lines; identifies
                                                                                                                                   variances.
  ----------------------------------------------------------------------------------------------------------------------------------------------------

### 8.3 Manual & Automated Acceptance Verification Checklist

- [x] **Standalone Decoupling:** Zero references, imports, or
  dependencies to any warehouse, physical inventory, SKU, or stock data
  context.
- [x] **10 Master Views Covered:** Executive Dashboard, General Ledger,
  Journals, Invoicing, Expenses, Payroll, Tax Compliance, Fixed Assets,
  Banking Reconciliation, Financial Statements.
- [x] **Double-Entry Equilibrium:** All journal builders and automated
  posting pipelines strictly enforce debit/credit equality.
- [x] **English Language Standard:** 100% written in English across all
  documentation, code specifications, schemas, and UI labels.
- [x] **Production-Grade Completeness:** Complete WBS across 6 phases
  with specific work packages, tech stack specifications, RBAC matrix,
  and testing architecture.

------------------------------------------------------------------------

## 9. Conclusion & Technical Sign-Off

This Implementation Plan provides an exhaustive, production-grade
engineering roadmap for building the standalone QuickBox Financial
Management System. By adhering to the modular React 19 architecture,
strict double-entry invariants, high-density UI conventions, and the
6-phase Work Breakdown Structure, the development team will deliver a
robust, compliant, and scalable enterprise financial platform.
