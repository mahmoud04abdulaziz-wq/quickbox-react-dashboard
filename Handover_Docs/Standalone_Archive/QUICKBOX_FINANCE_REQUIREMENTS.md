# QUICKBOX FINANCIAL MANAGEMENT SYSTEM

## Architectural Research, Feature Requirements & Implementation Roadmap

**Project Phase:** Phase 2 --- Financial System Specification &
Standalone Architecture\
**Target Domain:** Corporate Accounting, General Ledger, AP/AR, Payroll,
Tax & Financial Reporting\
**Frontend Basis:** QuickBox React Dashboard (Vite + React 19 + Phosphor
Icons)

------------------------------------------------------------------------

## 1. Executive Summary

This document establishes the technical research, functional
requirements, and standalone frontend architecture for the **QuickBox
Financial Management System (QFMS)**.

Designed as a high-density, professional financial workstation, QuickBox
provides comprehensive enterprise accounting capabilities---including
General Ledger (GL) management, strict Double-Entry Journal Postings,
Accounts Receivable (AR) with multi-line invoicing and aging analysis,
Accounts Payable (AP) with vendor bill tracking and three-way matching,
Multi-tier Payroll Processing with statutory tax withholdings and Wage
Protection System (WPS) compliance, Fixed Asset Depreciation modeling,
Treasury and Bank Reconciliation, and real-time generation of statutory
Financial Statements (Balance Sheet, Profit & Loss / Income Statement,
Statement of Cash Flows, and Trial Balance).

The frontend operates as a **strictly standalone web application** with
zero dependencies on external inventory data models, providing dedicated
state stores, mock financial datasets, and robust fiscal validation.

------------------------------------------------------------------------

## 2. Frontend UI Transformation Mapping

To maintain high visual density and ergonomic workflow familiarity, the
core React dashboard layout is directly mapped to corporate financial
accounting operations.

### 2.1 Main Data Table Transformation (`ReservationsTable.jsx` → `TransactionsTable.jsx` / `GeneralLedgerTable.jsx`)

The 12-column reservations grid is mapped 1:1 to financial transaction
and general ledger data points:

  ----------------------------------------------------------------------------
  Original Reservation New Financial Column Data Description & UI Behavior
  Column                                    
  -------------------- -------------------- ----------------------------------
  **Checkbox**         **Select**           Multi-select checkbox for bulk
                                            journal reconciliation, batch
                                            posting, or export.

  **Booking ID**       **Transaction /      Unique financial identifier (e.g.,
                       Journal Ref**        `TX-2026-001`, `JV-2026-089`,
                                            `INV-2026-1092`).

  **Guest Name**       **Account / Entity   Primary account title or
                       Name**               counterparty (e.g., *Operating
                                            Cash Account*, *Enterprise Tech
                                            Solutions LLC*).

  **Room**             **Account Category** Financial classification (*Current
                                            Assets*, *Operating Expense*,
                                            *Accounts Payable*, *Revenue*).

  **Source**           **Sub-Ledger / Cost  Departmental cost allocation
                       Center**             (*HQ - Executive*, *Operations &
                                            Facilities*, *Sales & Marketing*).

  **Check-In Date**    **Posting Date**     Effective accounting transaction
                                            date (styled in **bold text**).

  **Check-Out Date**   **Due / Value Date** Settlement date for invoices or
                                            bank value clearance date.

  **Orders**           **Debit (\$)**       Debit entry amount formatted with
                                            2 decimal places (e.g.,
                                            `$12,450.00`).

  **Amount**           **Credit (\$)**      Credit entry amount formatted with
                                            2 decimal places (e.g., `$0.00` or
                                            `$12,450.00`).

  **Balance**          **Running Balance    Computed cumulative account
                       (\$)**               balance:
                                            `Prior Balance + Debit - Credit`
                                            (e.g., `$48,220.00`).

  **Status (Pill)**    **Reconciliation     Visual badge: • 🟢 **Reconciled /
                       Status (Pill)**      Posted** (`#dcfce7` / `#16a34a`)•
                                            🟡 **Pending Approval** (`#fef9c3`
                                            / `#ca8a04`)• 🔴 **Unbalanced /
                                            Overdue** (`#fee2e2` / `#dc2626`)

  **Self               **Bank / Entity      Institution & vendor brand logos
  Check-In/Out**       Logo**               (Chase, HSBC, Standard Chartered,
                                            Microsoft, AWS) using
                                            `/public/logos/`.

  **Menu (⋯)**         **Action Controls**  Clickable **View Journal / Audit**
                                            icon to navigate to the detailed
                                            double-entry breakdown.
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

### 2.2 Sidebar Navigation Restructuring (`Sidebar.jsx`)

The left navigation hierarchy is structured to reflect chief financial
officer (CFO), controller, and staff accountant workflows:

    quickbox (Logo - CurrencyDollarSimple icon)
    ├── Home (Financial Overview & KPI Summary)
    ├── DAILY ACCOUNTING
    │   ├── General Ledger (Active page - Double-entry journal view)
    │   ├── Journal Entries (Multi-line debit/credit voucher creation)
    │   ├── Cash & Bank Operations (Reconciliation & liquidity tracking)
    │   └── Chart of Accounts (Hierarchical 5-tier account tree)
    ├── RECEIVABLES & PAYABLES
    │   ├── Accounts Receivable (Customer billing & aging analysis)
    │   ├── Accounts Payable (Vendor invoices & payment approvals)
    │   └── Expense Claims (Employee reimbursements & petty cash)
    ├── PAYROLL & TAXES
    │   ├── Payroll Processing (Salary sheets, allowances & deductions)
    │   ├── Tax Management (VAT calculation & withholding schedules)
    │   └── Fixed Assets Register (Depreciation schedules & asset book values)
    ├── FINANCIAL STATEMENTS & REPORTS
    │   ├── Balance Sheet (Assets, Liabilities & Equity statement)
    │   ├── Profit & Loss / Income Statement (Net operating income trends)
    │   ├── Cash Flow Statement (Operating, investing & financing activities)
    │   └── Trial Balance (Debit/Credit equality audit report)
    └── Settings (Fiscal Year, Currencies, Tax Rates & System Preferences)

------------------------------------------------------------------------

### 2.3 Topbar & Filter Bar Adaptations (`Filters.jsx` & `Topbar.jsx`)

- **Global Search Bar:** Instant filtering by Transaction Ref, Account
  Code, Customer/Vendor Name, or Check Number.
- **Category Dropdown:** Filter by *All Categories*, *Assets (1000)*,
  *Liabilities (2000)*, *Equity (3000)*, *Revenue (4000)*, or *Expenses
  (5000/6000)*.
- **Status Filter:** Quick-toggle pills for *All Transactions*, *Posted
  / Reconciled*, *Pending Review*, and *Unbalanced / Flagged*.
- **Storage Location Filter:** Dropdown to isolate transactions by
  Fiscal Quarter (e.g., `Q3-2026`) or Cost Center (`Corporate HQ`,
  `Operations`, `Sales & Marketing`).
- **Primary Action Button:** Change `Add Booking` (green button) →
  `+ New Journal Entry` or `📄 Create Invoice`.

------------------------------------------------------------------------

## 3. Core Technical Features & Specifications

### 3.1 ⚠️ Floating Toast Low-Balance & Overdue Invoice Notification System

To prevent financial risk (e.g., overdraft fees, liquidity shortfall, or
delinquent customer accounts), the system features an automated
real-time alerting engine.

- **Trigger Condition:** Whenever
  `Operating Cash Balance <= Liquidity Threshold ($10,000.00)` OR
  `Overdue Invoices Count > 0` OR `Journal Entry Debit != Credit`.
- **UI Presentation:** A sleek, high-priority **Floating Toast Popup**
  anchored at the top-right of the viewport (overlaid on the Topbar).
- **Toast Design:**
  - **Icon:** Glowing warning triangle (`WarningCircle` in warning
    yellow/red).
  - **Title:** `"Critical Financial Alert"`
  - **Body:**
    `"2 bank accounts have dropped below minimum liquidity reserve, and 3 invoices totaling $14,200.00 are overdue (>30 days)."`
  - **Actions:** Two buttons inside the toast:
    1.  `Review Accounts` (auto-filters the ledger to highlight
        low-balance accounts or overdue AR).
    2.  `Dismiss` (acknowledges alert for the active user session).
- **Badge Indicator:** The Topbar notification bell displays a red
  pulsing counter badge (`5`) representing pending financial exceptions.

------------------------------------------------------------------------

### 3.2 📜 Dedicated General Ledger Audit Trail & Movement History Page

Financial compliance and governance require complete, tamper-evident
auditability of every debit and credit entry. Rather than a cramped
modal, a dedicated **Audit Logs & Journal History** page provides deep
forensics and filtering capabilities.

- **Page Layout:** A full-width high-density data grid mirroring the
  General Ledger layout.
- **Audit Table Contents:**
  - **Timestamp:** Date and exact time of posting (e.g.,
    `14.08.2026 - 10:15:32 UTC`).
  - **Action Type:** Badge indicating `+ Posted Journal`,
    `• Period Adjustment`, `🔒 Fiscal Year Lock`, or
    `↩️ Reversal Entry`.
  - **Voucher / Ref #:** Unique journal voucher reference (e.g.,
    `JV-2026-089`).
  - **Debit / Credit Net:** Transaction magnitude (e.g., `$45,000.00`).
  - **Source Account / Cost Center:** Affected account and department
    (e.g., *1020 - Main Operating Bank Account*, *HQ Administration*).
  - **Authorized Accountant:** Name and avatar of the finance team
    member (e.g., *Sarah Jenkins, CPA*).
- **Filters:** Top-bar filters to isolate logs by Fiscal Period Range,
  Account Number, Minimum Dollar Amount, or Authorizing User.
- **Export:** An `Export Audit Trail (CSV / PDF)` button for formal
  external audit compliance and reporting.

------------------------------------------------------------------------

## 4. Proposed Data Architecture (JSON Schema)

To transition from static mock reservations to enterprise double-entry
accounting data, the frontend structure will use the following state
model:

    [
      {
        "accountId": "ACC-1020",
        "accountCode": "1020",
        "accountName": "Main Operating Bank Account",
        "category": "Current Assets",
        "class": "Asset",
        "normalBalance": "Debit",
        "costCenter": "Corporate Treasury",
        "currentBalance": 428950.00,
        "liquidityThreshold": 25000.00,
        "currency": "USD",
        "bankName": "Chase Commercial Banking",
        "bankLogo": "/logos/chase.png",
        "status": "Reconciled",
        "statusClass": "in-stock",
        "journalHistory": [
          {
            "id": "JV-2026-104",
            "date": "14.08.2026 09:30",
            "type": "Client Payment",
            "reference": "INV-2026-884",
            "debit": 18500.00,
            "credit": 0.00,
            "contraAccount": "1110 - Accounts Receivable",
            "costCenter": "Enterprise Sales",
            "accountant": "Sarah Jenkins"
          },
          {
            "id": "JV-2026-102",
            "date": "10.08.2026 14:00",
            "type": "Vendor Disbursement",
            "reference": "BILL-2026-312",
            "debit": 0.00,
            "credit": 6200.00,
            "contraAccount": "2010 - Accounts Payable",
            "costCenter": "IT Infrastructure",
            "accountant": "Michael Chang"
          }
        ]
      },
      {
        "accountId": "ACC-1110",
        "accountCode": "1110",
        "accountName": "Accounts Receivable (Trade Debtors)",
        "category": "Current Assets",
        "class": "Asset",
        "normalBalance": "Debit",
        "costCenter": "Enterprise Sales",
        "currentBalance": 84120.00,
        "liquidityThreshold": 0.00,
        "currency": "USD",
        "bankName": "Internal AR Ledger",
        "bankLogo": "/logos/quickbox.png",
        "status": "Pending Review",
        "statusClass": "low-stock",
        "journalHistory": [
          {
            "id": "JV-2026-098",
            "date": "12.08.2026 16:45",
            "type": "Invoice Issuance",
            "reference": "INV-2026-0412",
            "debit": 14200.00,
            "credit": 0.00,
            "contraAccount": "4010 - Sales Revenue",
            "costCenter": "Enterprise Sales",
            "accountant": "Sarah Jenkins"
          }
        ]
      },
      {
        "accountId": "ACC-2010",
        "accountCode": "2010",
        "accountName": "Accounts Payable (Trade Creditors)",
        "category": "Current Liabilities",
        "class": "Liability",
        "normalBalance": "Credit",
        "costCenter": "Procurement & Operations",
        "currentBalance": 36890.00,
        "liquidityThreshold": 0.00,
        "currency": "USD",
        "bankName": "Internal AP Ledger",
        "bankLogo": "/logos/quickbox.png",
        "status": "Reconciled",
        "statusClass": "in-stock",
        "journalHistory": [
          {
            "id": "JV-2026-095",
            "date": "08.08.2026 11:20",
            "type": "Vendor Bill Approval",
            "reference": "BILL-2026-109",
            "debit": 0.00,
            "credit": 8400.00,
            "contraAccount": "6210 - Software Subscriptions",
            "costCenter": "Engineering & IT",
            "accountant": "David Ross"
          }
        ]
      }
    ]

------------------------------------------------------------------------

## 5. Phased Implementation Roadmap

### Phase 1: Data Model & Table Refactoring

1.  Create `mockFinance.js` with 25--30 realistic enterprise financial
    entities (Chart of Accounts, Journal Vouchers, Accounts
    Payable/Receivable, Payroll records, Fixed Assets).
2.  Refactor `ReservationsTable.jsx` into `TransactionsTable.jsx` and
    `GeneralLedgerTable.jsx`, updating table headers (`<th>`) and cell
    mappings (`<td>`) to render Account Codes, Posting Dates, Debits,
    Credits, and Running Balances.
3.  Apply financial status pill styling in `App.css`
    (`.status.reconciled`, `.status.pending`, `.status.overdue`,
    `.status.unbalanced`).

### Phase 2: Navigation & Filter Bar Adaptation

1.  Update `Sidebar.jsx` with full financial management navigation
    groupings and Phosphor icons (`CurrencyDollarSimple`, `BookOpen`,
    `Receipt`, `UsersThree`, `Calculator`, `ChartLineUp`).
2.  Update `Filters.jsx` dropdown labels to filter by Account Category
    (Assets, Liabilities, Equity, Revenue, Expense) and Cost Center.
3.  Connect search input to filter ledger rows by Transaction Ref,
    Account Name, or Entity dynamically.

### Phase 3: Toast Notifications & Audit Modal

1.  Build a `ToastNotification.jsx` component that evaluates liquidity
    thresholds and unbalanced entries on load and displays high-priority
    toast alerts.
2.  Build an `AuditLogsView.jsx` dedicated page view (routed via
    sidebar), rendering double-entry journal logs in a filterable,
    audit-ready data grid.
3.  Test layout density and responsiveness to guarantee zero unwanted
    scrollbars, maintaining the pixel-perfect aesthetic achieved in
    Phase 1.

------------------------------------------------------------------------

*Document generated as part of the QuickBox Financial System Handover
Specification.*
