# QuickBox — Integrated Hotel Inventory & Financial Management System

> A modern, enterprise-grade React frontend for unified warehouse inventory operations and double-entry financial accounting, purpose-built for the hospitality industry.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Module Breakdown](#module-breakdown)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Handover Documentation](#handover-documentation)
- [Author](#author)

---

## Overview

QuickBox is a comprehensive hotel operations management platform that integrates two traditionally siloed business functions — **Inventory/Warehouse Management** and **Financial Accounting** — into a single, unified frontend application.

The system enforces a **shared database architecture** where physical warehouse stock movements (e.g., receiving goods from a Purchase Order) automatically trigger corresponding double-entry journal postings in the General Ledger (e.g., debiting Inventory Asset and crediting Accounts Payable). Core master data entities such as Vendors, Customers, and Cost Centers are shared across both modules, eliminating data duplication and ensuring consistency.

---

## Key Features

### Inventory Control Module
| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time KPI cards, stock movement charts, and activity feeds |
| **Inventory Master** | Tabbed grid view across all item categories (F&B, Housekeeping, Maintenance) with search, filters, and stock-level indicators |
| **Stock Operations** | High-speed warehouse receive/issue interface with SKU barcode lookup and reason logging |
| **Purchase Orders** | PO lifecycle management with 3-way matching integration |
| **Suppliers** | Vendor directory with contact details and performance tracking |
| **ROP Alerts** | Reorder-point monitoring with urgency-level alert cards |
| **Audit Logs** | Chronological transaction audit trail with expandable detail rows |
| **Reports & Analytics** | Consumption trends, department breakdowns, and turnover analysis |

### Finance Module
| Feature | Description |
|---------|-------------|
| **Financial Dashboard** | Revenue, expense, and cash-flow KPIs with aging matrix visualization |
| **General Ledger** | 5-tier Chart of Accounts with accordion drill-down into journal entries |
| **3-Way Matching** | PO ↔ GRN ↔ Invoice matching engine with Purchase Price Variance detection |
| **Accounts Payable** | Vendor bill management with payment scheduling and AP aging |
| **Accounts Receivable** | Customer invoice tracking with AR aging and collection status |
| **Party Directory** | Unified vendor/customer master (shared with Inventory) |
| **Valuation Rules** | FIFO / Moving Average Cost inventory valuation configuration |
| **Cost Centers** | Departmental budget tracking with utilization progress bars |
| **Fixed Assets** | Asset register with straight-line depreciation scheduling |
| **Payroll & VAT** | WPS salary processing and 5% UAE VAT return computation |
| **Financial Statements** | Balance Sheet, Income Statement, and Trial Balance with equilibrium verification |

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI Framework** | React | 19.2 |
| **Routing** | React Router | 7.18 |
| **Build Tool** | Vite | 8.1 |
| **Icons** | Phosphor Icons | 2.1 |
| **Styling** | Vanilla CSS (Custom Design System) | — |
| **Linter** | oxlint | 1.71 |
| **Language** | JavaScript (ES Modules) | — |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        QuickBox Frontend                        │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │  InventoryContext.jsx │◄────►│   FinanceContext.jsx      │    │
│  │                      │      │                          │    │
│  │  • Inventory Items    │      │  • Chart of Accounts     │    │
│  │  • Stock Movements    │      │  • General Ledger        │    │
│  │  • Purchase Orders    │      │  • AP / AR               │    │
│  │  • Audit Logs         │      │  • Payroll & VAT         │    │
│  │  • Suppliers          │      │  • Fixed Assets          │    │
│  └──────────┬───────────┘      └─────────────┬────────────┘    │
│             │         Shared Master Data      │                 │
│             │    ┌─────────────────────┐      │                 │
│             └───►│  Parties (Vendors/  │◄─────┘                 │
│                  │  Customers)         │                        │
│                  │  Cost Centers       │                        │
│                  └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Shared Context Pattern**: `FinanceContext.jsx` imports and consumes shared operational data from `InventoryContext.jsx`, enforcing the single-database architecture at the state management layer.
- **Event-Driven GL Posting**: Stock movements dispatched through `InventoryContext` automatically trigger journal entry creation in the financial ledger.
- **Unified Navigation Shell**: A single `Sidebar.jsx` component with dedicated section headers for Inventory and Finance ensures seamless cross-module navigation.

---

## Module Breakdown

### Inventory Views (`src/pages/`)
| File | View |
|------|------|
| `DashboardView.jsx` | Inventory Dashboard & KPIs |
| `InventoryView.jsx` | Inventory Master Grid |
| `StockOpsView.jsx` | Stock Receive / Issue Operations |
| `PurchaseOrdersView.jsx` | Purchase Order Management |
| `SuppliersView.jsx` | Supplier Directory |
| `RopAlertsView.jsx` | Reorder Point Alerts |
| `AuditLogsView.jsx` | Transaction Audit Trail |
| `ReportsView.jsx` | Analytics & Reports |
| `SettingsView.jsx` | System Configuration |

### Finance Views (`src/pages/finance/`)
| File | View |
|------|------|
| `FinancialDashboardView.jsx` | Financial Dashboard |
| `GeneralLedgerView.jsx` | General Ledger & Chart of Accounts |
| `ThreeWayMatchingView.jsx` | PO ↔ GRN ↔ Invoice Matching |
| `AccountsPayableView.jsx` | Accounts Payable |
| `AccountsReceivableView.jsx` | Accounts Receivable |
| `PartyDirectoryView.jsx` | Vendor / Customer Master |
| `ValuationRulesView.jsx` | Inventory Valuation Rules |
| `CostCentersView.jsx` | Cost Center Budgets |
| `FixedAssetsView.jsx` | Fixed Asset Register |
| `PayrollVatView.jsx` | Payroll & VAT Processing |
| `FinancialStatementsView.jsx` | Financial Statements |

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# Clone or extract the project
cd react-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with hot-reload |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the oxlint linter |

---

## Project Structure

```
react-dashboard/
├── Handover_Docs/                  # Project documentation
│   ├── Finance_System_Final.docx   # Master document (Requirements + ERD + Wireframes)
│   ├── Finance_Reqs.docx           # Financial system requirements
│   ├── Finance_ERD.docx            # Integrated Entity Relationship Diagram
│   ├── Finance_Plan.docx           # Implementation plan & WBS
│   ├── Finance_UI_Prompt.docx      # UI wireframe specifications
│   ├── Inventory_System_Requirements_Final.docx
│   ├── Wireframes/
│   │   ├── inventory/              # Inventory module wireframes
│   │   └── finance/                # Finance module wireframes (F1–F11)
│   └── Standalone_Archive/         # Archived standalone documents
├── src/
│   ├── components/                 # Shared UI components
│   │   ├── Sidebar.jsx             # Unified navigation shell
│   │   ├── Layout.jsx              # App layout wrapper
│   │   ├── Topbar.jsx              # Top navigation bar
│   │   ├── Filters.jsx             # Reusable filter bar
│   │   ├── Pagination.jsx          # Table pagination
│   │   └── ToastNotification.jsx   # Notification system
│   ├── context/
│   │   ├── InventoryContext.jsx    # Inventory state management
│   │   └── FinanceContext.jsx      # Finance state management (linked to Inventory)
│   ├── pages/
│   │   ├── DashboardView.jsx       # Inventory dashboard
│   │   ├── InventoryView.jsx       # Inventory master grid
│   │   ├── StockOpsView.jsx        # Stock operations
│   │   ├── finance/                # Finance module views (11 screens)
│   │   └── ...
│   ├── App.jsx                     # Root component with routing
│   ├── App.css                     # Design system & all component styles
│   └── main.jsx                    # Application entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## Handover Documentation

All project documentation is located in the `Handover_Docs/` directory:

| Document | Contents |
|----------|----------|
| **Finance_System_Final.docx** | Master document combining requirements, ERD, and all wireframes |
| **Finance_Reqs.docx** | Detailed functional requirements for the financial system |
| **Finance_ERD.docx** | Unified Entity Relationship Diagram (Mermaid + PostgreSQL DDL) |
| **Finance_Plan.docx** | 8-phase implementation plan with 32 work packages |
| **Finance_UI_Prompt.docx** | UI wireframe specifications for 11 financial views |
| **Inventory_System_Requirements_Final.docx** | Inventory system requirements with wireframes |

---

## Author

Developed as part of a hospitality technology internship project focused on modernizing hotel back-office operations through integrated digital systems.

---

*Built with React 19 · Vite 8 · Phosphor Icons*
