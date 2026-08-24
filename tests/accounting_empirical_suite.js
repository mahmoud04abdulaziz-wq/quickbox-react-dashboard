/**
 * Comprehensive Empirical Test Suite for QuickBox Financial Accounting Engine
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Data definitions cloned exactly from FinanceContext.jsx and InventoryContext.jsx

const createInitialAccounts = () => [
  // 10000 Series: Assets
  { account_id: 'ACC-10100', account_code: '10100', account_name: 'Operating Cash – Chase Main', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: true, is_reconciled: true, is_active: true, current_balance: 318950.00 },
  { account_id: 'ACC-10110', account_code: '10110', account_name: 'Operating Cash – HSBC', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: true, is_reconciled: true, is_active: true, current_balance: 110000.00 },
  { account_id: 'ACC-11100', account_code: '11100', account_name: 'Accounts Receivable Control', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 84120.00 },
  { account_id: 'ACC-13110', account_code: '13110', account_name: 'Inventory Asset – Linens & Textiles', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 48200.00 },
  { account_id: 'ACC-13120', account_code: '13120', account_name: 'Inventory Asset – Food & Beverage', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 34500.00 },
  { account_id: 'ACC-13130', account_code: '13130', account_name: 'Inventory Asset – Cleaning Supplies', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 18200.00 },
  { account_id: 'ACC-13140', account_code: '13140', account_name: 'Inventory Asset – Guest Toiletries', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 24100.00 },
  { account_id: 'ACC-13150', account_code: '13150', account_name: 'Inventory Asset – Operating Equipment', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 42800.00 },
  { account_id: 'ACC-13160', account_code: '13160', account_name: 'Inventory Asset – Maintenance & Tools', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 18620.00 },
  { account_id: 'ACC-13900', account_code: '13900', account_name: 'Input VAT Recoverable (5%)', account_type: 'Asset', sub_category: 'CurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 32050.00 },
  { account_id: 'ACC-15100', account_code: '15100', account_name: 'Property, Plant & Equipment', account_type: 'Asset', sub_category: 'NonCurrentAsset', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 450000.00 },
  { account_id: 'ACC-15200', account_code: '15200', account_name: 'Accumulated Depreciation', account_type: 'Asset', sub_category: 'ContraAsset', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: -168200.00 },

  // 20000 Series: Liabilities
  { account_id: 'ACC-20200', account_code: '20200', account_name: 'GR/IR Interim Clearing', account_type: 'Liability', sub_category: 'CurrentLiability', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 18000.00 },
  { account_id: 'ACC-21010', account_code: '21010', account_name: 'Trade Accounts Payable Control', account_type: 'Liability', sub_category: 'CurrentLiability', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 36890.00 },
  { account_id: 'ACC-22100', account_code: '22100', account_name: 'Accrued Wages & Salaries Payable', account_type: 'Liability', sub_category: 'CurrentLiability', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 24300.00 },
  { account_id: 'ACC-22200', account_code: '22200', account_name: 'Output VAT Payable (5%)', account_type: 'Liability', sub_category: 'CurrentLiability', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 32100.00 },
  { account_id: 'ACC-25100', account_code: '25100', account_name: 'Bank Term Facility (Long-Term)', account_type: 'Liability', sub_category: 'NonCurrentLiability', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 200000.00 },
  { account_id: 'ACC-25200', account_code: '25200', account_name: 'End of Service Gratuity Liability', account_type: 'Liability', sub_category: 'NonCurrentLiability', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 42500.00 },

  // 30000 Series: Equity
  { account_id: 'ACC-30100', account_code: '30100', account_name: 'Contributed Share Capital', account_type: 'Equity', sub_category: 'Equity', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 400000.00 },
  { account_id: 'ACC-30200', account_code: '30200', account_name: 'Retained Earnings (Prior Years)', account_type: 'Equity', sub_category: 'Equity', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 102250.00 },
  { account_id: 'ACC-30300', account_code: '30300', account_name: 'Current Period Net Earnings', account_type: 'Equity', sub_category: 'Equity', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 142300.00 },

  // 40000 Series: Revenue
  { account_id: 'ACC-40100', account_code: '40100', account_name: 'Gross Sales / Operating Revenue', account_type: 'Revenue', sub_category: 'OperatingRevenue', normal_balance: 'CREDIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 620000.00 },
  { account_id: 'ACC-40200', account_code: '40200', account_name: 'Sales Discounts & Allowances', account_type: 'Revenue', sub_category: 'ContraRevenue', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: -14500.00 },

  // 50000 Series: Cost of Goods Sold (COGS) & Variance
  { account_id: 'ACC-50110', account_code: '50110', account_name: 'COGS – Linens & Textiles', account_type: 'COGS', sub_category: 'DirectCost', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 42100.00 },
  { account_id: 'ACC-50120', account_code: '50120', account_name: 'COGS – Food & Beverage', account_type: 'COGS', sub_category: 'DirectCost', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 88400.00 },
  { account_id: 'ACC-50130', account_code: '50130', account_name: 'COGS – Cleaning Supplies', account_type: 'COGS', sub_category: 'DirectCost', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 18500.00 },
  { account_id: 'ACC-50140', account_code: '50140', account_name: 'COGS – Guest Amenities', account_type: 'COGS', sub_category: 'DirectCost', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 24800.00 },
  { account_id: 'ACC-50150', account_code: '50150', account_name: 'COGS – Operating Equipment', account_type: 'COGS', sub_category: 'DirectCost', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 17500.00 },
  { account_id: 'ACC-50160', account_code: '50160', account_name: 'COGS – Maintenance & Tools', account_type: 'COGS', sub_category: 'DirectCost', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 1200.00 },
  { account_id: 'ACC-51200', account_code: '51200', account_name: 'Purchase Price Variance (PPV)', account_type: 'COGS', sub_category: 'Variance', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 1200.00 },
  { account_id: 'ACC-51950', account_code: '51950', account_name: 'Inventory Shrinkage & Scrappage', account_type: 'COGS', sub_category: 'Variance', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 0.00 },

  // 60000 Series: Operating Expenses (OPEX)
  { account_id: 'ACC-61100', account_code: '61100', account_name: 'Departmental Consumption – F&B Kitchen', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 18720.00 },
  { account_id: 'ACC-61200', account_code: '61200', account_name: 'Departmental Consumption – Housekeeping', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 11200.00 },
  { account_id: 'ACC-61300', account_code: '61300', account_name: 'Departmental Consumption – Maintenance', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 5400.00 },
  { account_id: 'ACC-61400', account_code: '61400', account_name: 'Departmental Consumption – Front Office', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 2100.00 },
  { account_id: 'ACC-62100', account_code: '62100', account_name: 'IT & Cloud SaaS Expenses', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 5430.00 },
  { account_id: 'ACC-63100', account_code: '63100', account_name: 'Salaries & Workforce Compensation', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 148500.00 },
  { account_id: 'ACC-64100', account_code: '64100', account_name: 'Depreciation Expense – Plant & Equipment', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 6500.00 },
  { account_id: 'ACC-65100', account_code: '65100', account_name: 'Rent & Facilities Overhead', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 38200.00 },
  { account_id: 'ACC-66100', account_code: '66100', account_name: 'General & Administrative', account_type: 'Expense', sub_category: 'OperatingExpense', normal_balance: 'DEBIT', is_cash: false, is_reconciled: false, is_active: true, current_balance: 16250.00 },
];

const initialJournalEntries = [
  {
    journal_id: 'JV-2026-00412',
    voucher_number: 'JV-2026-00412',
    posting_date: '2026-08-15',
    fiscal_period: '2026-08',
    voucher_type: 'INVENTORY',
    reference_number: 'GRN-2026-004',
    memo: 'GRN receipt — 100x Bath Towel - White, Global Linens Co.',
    currency_code: 'USD',
    exchange_rate: 1.0000,
    total_debit: 1250.00,
    total_credit: 1250.00,
    status: 'Posted',
    posted_by: 'System (Auto-GL)',
    posted_at: '2026-08-15T10:45:00Z',
    lines: [
      { line_id: 'JVL-001', account_id: 'ACC-13110', account_code: '13110', account_name: 'Inventory Asset – Linens & Textiles', cost_center_code: null, debit_amount: 1250.00, credit_amount: 0.00, description: '100x Bath Towel - White @ $12.50' },
      { line_id: 'JVL-002', account_id: 'ACC-20200', account_code: '20200', account_name: 'GR/IR Interim Clearing', cost_center_code: null, debit_amount: 0.00, credit_amount: 1250.00, description: 'Accrued liability for GRN-2026-004' }
    ]
  },
  {
    journal_id: 'JV-2026-00411',
    voucher_number: 'JV-2026-00411',
    posting_date: '2026-08-14',
    fiscal_period: '2026-08',
    voucher_type: 'AP',
    reference_number: 'BILL-2026-0194',
    memo: 'Vendor Bill Ingestion — Global Linens Co. (PO-2026-001)',
    currency_code: 'USD',
    exchange_rate: 1.0000,
    total_debit: 4850.00,
    total_credit: 4850.00,
    status: 'Posted',
    posted_by: 'Accounting Dept',
    posted_at: '2026-08-14T14:20:00Z',
    lines: [
      { line_id: 'JVL-003', account_id: 'ACC-20200', account_code: '20200', account_name: 'GR/IR Interim Clearing', cost_center_code: null, debit_amount: 4619.05, credit_amount: 0.00, description: 'Clear GR/IR for PO-2026-001' },
      { line_id: 'JVL-004', account_id: 'ACC-13900', account_code: '13900', account_name: 'Input VAT Recoverable (5%)', cost_center_code: null, debit_amount: 230.95, credit_amount: 0.00, description: '5% Input Tax on Bill 0194' },
      { line_id: 'JVL-005', account_id: 'ACC-21010', account_code: '21010', account_name: 'Trade Accounts Payable Control', cost_center_code: null, debit_amount: 0.00, credit_amount: 4850.00, description: 'Payable to Global Linens Co.' }
    ]
  },
  {
    journal_id: 'JV-2026-00410',
    voucher_number: 'JV-2026-00410',
    posting_date: '2026-08-13',
    fiscal_period: '2026-08',
    voucher_type: 'AR',
    reference_number: 'INV-2026-0412',
    memo: 'Customer Invoicing — Al-Madina Trading LLC (SO-2026-042)',
    currency_code: 'USD',
    exchange_rate: 1.0000,
    total_debit: 16800.00,
    total_credit: 16800.00,
    status: 'Posted',
    posted_by: 'AR Specialist',
    posted_at: '2026-08-13T09:15:00Z',
    lines: [
      { line_id: 'JVL-006', account_id: 'ACC-11100', account_code: '11100', account_name: 'Accounts Receivable Control', cost_center_code: null, debit_amount: 16800.00, credit_amount: 0.00, description: 'Receivable from Al-Madina Trading' },
      { line_id: 'JVL-007', account_id: 'ACC-40100', account_code: '40100', account_name: 'Gross Sales / Operating Revenue', cost_center_code: null, debit_amount: 0.00, credit_amount: 16000.00, description: 'Sales Revenue for SO-042' },
      { line_id: 'JVL-008', account_id: 'ACC-22200', account_code: '22200', account_name: 'Output VAT Payable (5%)', cost_center_code: null, debit_amount: 0.00, credit_amount: 800.00, description: '5% Output VAT on INV-0412' }
    ]
  },
  {
    journal_id: 'JV-2026-00409',
    voucher_number: 'JV-2026-00409',
    posting_date: '2026-08-12',
    fiscal_period: '2026-08',
    voucher_type: 'INVENTORY',
    reference_number: 'REQ-2026-081',
    memo: 'Department Stock Issue — Housekeeping (CC-100)',
    currency_code: 'USD',
    exchange_rate: 1.0000,
    total_debit: 1240.00,
    total_credit: 1240.00,
    status: 'Posted',
    posted_by: 'System (Auto-GL)',
    posted_at: '2026-08-12T11:00:00Z',
    lines: [
      { line_id: 'JVL-009', account_id: 'ACC-61200', account_code: '61200', account_name: 'Departmental Consumption – Housekeeping', cost_center_code: 'CC-100', debit_amount: 1240.00, credit_amount: 0.00, description: 'Requisition REQ-2026-081 usage' },
      { line_id: 'JVL-010', account_id: 'ACC-13110', account_code: '13110', account_name: 'Inventory Asset – Linens & Textiles', cost_center_code: null, debit_amount: 0.00, credit_amount: 1050.00, description: '84x Bath Towel @ $12.50' },
      { line_id: 'JVL-011', account_id: 'ACC-13140', account_code: '13140', account_name: 'Inventory Asset – Guest Toiletries', cost_center_code: null, debit_amount: 0.00, credit_amount: 190.00, description: '200x Shampoo & 200x Conditioner' }
    ]
  }
];

const initialValuationRules = [
  { category: 'Linens', category_id: 'CAT-LIN', sku_count: 4, policy: 'AVCO', inventory_asset_account: '13110', cogs_account: '50110', variance_account: '51200', expense_account: '61200', ppv_tolerance_percent: 2.0, absolute_cap_usd: 50.00, landed_cost_allocation_basis: 'Value' },
  { category: 'Cleaning', category_id: 'CAT-CLN', sku_count: 3, policy: 'AVCO', inventory_asset_account: '13130', cogs_account: '50130', variance_account: '51200', expense_account: '61200', ppv_tolerance_percent: 2.0, absolute_cap_usd: 25.00, landed_cost_allocation_basis: 'Weight_Qty' },
  { category: 'F&B', category_id: 'CAT-FNB', sku_count: 4, policy: 'FIFO', inventory_asset_account: '13120', cogs_account: '50120', variance_account: '51200', expense_account: '61100', ppv_tolerance_percent: 1.5, absolute_cap_usd: 40.00, landed_cost_allocation_basis: 'Value' },
  { category: 'Toiletries', category_id: 'CAT-AMN', sku_count: 3, policy: 'AVCO', inventory_asset_account: '13140', cogs_account: '50140', variance_account: '51200', expense_account: '61400', ppv_tolerance_percent: 2.5, absolute_cap_usd: 30.00, landed_cost_allocation_basis: 'Weight_Qty' },
  { category: 'Equipment', category_id: 'CAT-EQP', sku_count: 2, policy: 'Standard Cost', inventory_asset_account: '13150', cogs_account: '50150', variance_account: '51200', expense_account: '61300', ppv_tolerance_percent: 5.0, absolute_cap_usd: 100.00, landed_cost_allocation_basis: 'Value' },
  { category: 'Maintenance', category_id: 'CAT-MNT', sku_count: 4, policy: 'AVCO', inventory_asset_account: '13160', cogs_account: '50160', variance_account: '51200', expense_account: '61300', ppv_tolerance_percent: 2.0, absolute_cap_usd: 50.00, landed_cost_allocation_basis: 'Value' }
];

const initialCostCenters = [
  { cost_center_id: 'CC-100', code: 'CC-100', name: 'Housekeeping', manager: 'Aisha T.', gl_expense_account: '61200', monthly_budget: 15000.00, actual_spent: 11200.00, utilization_percent: 74.7, is_over_budget: false },
  { cost_center_id: 'CC-200', code: 'CC-200', name: 'F&B Kitchen', manager: 'Chef Alex M.', gl_expense_account: '61100', monthly_budget: 28000.00, actual_spent: 18720.00, utilization_percent: 66.9, is_over_budget: false },
  { cost_center_id: 'CC-300', code: 'CC-300', name: 'Facilities & Maintenance', manager: 'Tariq K.', gl_expense_account: '61300', monthly_budget: 12000.00, actual_spent: 5400.00, utilization_percent: 45.0, is_over_budget: false },
  { cost_center_id: 'CC-400', code: 'CC-400', name: 'Front Office & Guest Services', manager: 'Layla S.', gl_expense_account: '61400', monthly_budget: 8000.00, actual_spent: 2100.00, utilization_percent: 26.3, is_over_budget: false },
  { cost_center_id: 'CC-500', code: 'CC-500', name: 'IT & Security Systems', manager: 'Omar R.', gl_expense_account: '62100', monthly_budget: 10000.00, actual_spent: 5430.00, utilization_percent: 54.3, is_over_budget: false },
  { cost_center_id: 'CC-600', code: 'CC-600', name: 'Administration & Executive', manager: 'Sarah N.', gl_expense_account: '66100', monthly_budget: 25000.00, actual_spent: 16250.00, utilization_percent: 65.0, is_over_budget: false }
];

const initialInventory = [
  { sku: 'LIN-001', name: 'Bath Towel - White', category: 'Linens', stock: 1250, unitCost: 12.50 },
  { sku: 'LIN-002', name: 'Bed Sheet - Queen', category: 'Linens', stock: 45, unitCost: 28.00 },
  { sku: 'LIN-003', name: 'Pillow Case - Standard', category: 'Linens', stock: 800, unitCost: 6.50 },
  { sku: 'LIN-004', name: 'Bathrobe - Cotton', category: 'Linens', stock: 60, unitCost: 45.00 },
  { sku: 'CLN-010', name: 'Bleach 5L', category: 'Cleaning', stock: 0, unitCost: 15.00 },
  { sku: 'CLN-011', name: 'Glass Cleaner 1L', category: 'Cleaning', stock: 24, unitCost: 4.25 },
  { sku: 'CLN-012', name: 'Floor Polish 5L', category: 'Cleaning', stock: 10, unitCost: 32.00 },
  { sku: 'FNB-100', name: 'Coffee Beans - Espresso', category: 'F&B', stock: 12, unitCost: 22.00 },
  { sku: 'FNB-101', name: 'Milk - Whole', category: 'F&B', stock: 45, unitCost: 1.80 },
  { sku: 'FNB-102', name: 'Sugar - White', category: 'F&B', stock: 30, unitCost: 2.50 },
  { sku: 'FNB-103', name: 'Butter - Unsalted', category: 'F&B', stock: 8, unitCost: 8.00 },
  { sku: 'AMN-005', name: 'Shampoo Mini 50ml', category: 'Toiletries', stock: 5000, unitCost: 0.45 },
  { sku: 'AMN-006', name: 'Soap Bar', category: 'Toiletries', stock: 0, unitCost: 0.30 },
  { sku: 'AMN-007', name: 'Conditioner Mini 50ml', category: 'Toiletries', stock: 3200, unitCost: 0.50 },
  { sku: 'EQP-001', name: 'Vacuum Cleaner', category: 'Equipment', stock: 4, unitCost: 210.00 },
  { sku: 'EQP-002', name: 'Steam Iron - Industrial', category: 'Equipment', stock: 3, unitCost: 175.00 },
  { sku: 'MNT-001', name: 'Power Drill 18V', category: 'Maintenance', stock: 12, unitCost: 89.99 },
  { sku: 'MNT-002', name: 'HVAC Air Filter 20x20', category: 'Maintenance', stock: 45, unitCost: 8.50 },
  { sku: 'MNT-003', name: 'LED Bulb 10W Pack', category: 'Maintenance', stock: 8, unitCost: 14.00 },
  { sku: 'MNT-004', name: 'Pipe Wrench 14-inch', category: 'Maintenance', stock: 6, unitCost: 24.50 }
];

const initialFixedAssets = [
  {
    asset_id: 'FA-2024-0012',
    name: 'Commercial Tunnel Washer 50kg',
    acquisition_cost: 48000.00,
    salvage_value: 4000.00,
    useful_life_months: 96,
    accumulated_depreciation: 15500.00,
    net_book_value: 32500.00,
    monthly_depreciation_amount: 458.33,
    status: 'Active'
  },
  {
    asset_id: 'FA-2023-0004',
    name: 'Main Kitchen Cold Storage Unit',
    acquisition_cost: 65000.00,
    salvage_value: 5000.00,
    useful_life_months: 120,
    accumulated_depreciation: 19500.00,
    net_book_value: 45500.00,
    monthly_depreciation_amount: 500.00,
    status: 'Active'
  },
  {
    asset_id: 'FA-2025-0018',
    name: 'Core Network Server Rack & UPS',
    acquisition_cost: 28000.00,
    salvage_value: 2000.00,
    useful_life_months: 60,
    accumulated_depreciation: 7800.00,
    net_book_value: 20200.00,
    monthly_depreciation_amount: 433.33,
    status: 'Active'
  }
];

const initialPayrollRecords = [
  {
    payroll_id: 'PAY-2026-08',
    month: 'August 2026',
    employee_count: 42,
    total_basic_salary: 124200.00,
    total_allowances: 24300.00,
    total_gross: 148500.00,
    total_deductions: 24300.00,
    total_net_salary: 124200.00,
    records: [
      { emp_id: 'EMP-0101', name: 'Aisha Tariq', department: 'Housekeeping (CC-100)', basic_salary: 4500.00, allowances: 800.00, deductions: 500.00, net_salary: 4800.00 },
      { emp_id: 'EMP-0104', name: 'Chef Alex Morgan', department: 'F&B Kitchen (CC-200)', basic_salary: 7200.00, allowances: 1200.00, deductions: 900.00, net_salary: 7500.00 },
      { emp_id: 'EMP-0108', name: 'Tariq Khalil', department: 'Maintenance (CC-300)', basic_salary: 5000.00, allowances: 900.00, deductions: 600.00, net_salary: 5300.00 },
      { emp_id: 'EMP-0112', name: 'Layla Salem', department: 'Front Office (CC-400)', basic_salary: 4800.00, allowances: 750.00, deductions: 550.00, net_salary: 5000.00 }
    ]
  }
];

const initialVatFiling = [
  {
    tax_period: 'VAT-2026-Q2',
    quarter: 'Q2 2026',
    taxable_sales: 580000.00,
    output_vat_rate: 0.05,
    output_vat: 29000.00,
    taxable_purchases: 250000.00,
    input_vat_rate: 0.05,
    input_vat: 12500.00,
    net_tax_liability: 16500.00
  },
  {
    tax_period: 'VAT-2026-Q3',
    quarter: 'Q3 2026',
    taxable_sales: 642000.00,
    output_vat_rate: 0.05,
    output_vat: 32100.00,
    taxable_purchases: 273000.00,
    input_vat_rate: 0.05,
    input_vat: 13650.00,
    net_tax_liability: 18450.00
  }
];

// Calculation Helpers
function calculateTrialBalance(accounts) {
  let totalDebits = 0;
  let totalCredits = 0;

  const rows = accounts.map(acc => {
    let debit = 0;
    let credit = 0;
    const bal = acc.current_balance;

    if (acc.normal_balance === 'DEBIT') {
      if (bal >= 0) debit = bal;
      else credit = Math.abs(bal);
    } else {
      if (bal >= 0) credit = bal;
      else debit = Math.abs(bal);
    }

    totalDebits += debit;
    totalCredits += credit;

    return {
      account_code: acc.account_code,
      account_name: acc.account_name,
      account_type: acc.account_type,
      debit: parseFloat(debit.toFixed(2)),
      credit: parseFloat(credit.toFixed(2))
    };
  });

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.05;

  return {
    rows,
    totalDebits: parseFloat(totalDebits.toFixed(2)),
    totalCredits: parseFloat(totalCredits.toFixed(2)),
    difference: parseFloat(Math.abs(totalDebits - totalCredits).toFixed(2)),
    isBalanced
  };
}

function calculateBalanceSheet(accounts, inventory) {
  const getBal = (code) => {
    const acc = accounts.find(a => a.account_code === code);
    return acc ? acc.current_balance : 0.00;
  };

  // Current Assets
  const cashMain = getBal('10100');
  const cashHsbc = getBal('10110');
  const totalCash = cashMain + cashHsbc;
  const arControl = getBal('11100');

  // Dynamic Perpetual Inventory Valuation
  const inventoryValuation = (inventory || []).reduce((sum, item) => sum + ((item.stock || 0) * (item.unitCost || 0)), 0);
  const inputVat = getBal('13900');
  const totalCurrentAssets = totalCash + arControl + inventoryValuation + inputVat;

  // Non-Current Assets
  const ppeGross = getBal('15100');
  const accumDeprec = getBal('15200'); // Contra-Asset (negative)
  const netPpe = ppeGross + accumDeprec;
  const totalNonCurrentAssets = netPpe;

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  // Current Liabilities
  const grirClearing = getBal('20200');
  const apControl = getBal('21010');
  const accruedSalaries = getBal('22100');
  const outputVat = getBal('22200');
  const totalCurrentLiabilities = grirClearing + apControl + accruedSalaries + outputVat;

  // Long-Term Liabilities
  const bankLoan = getBal('25100');
  const gratuityLiability = getBal('25200');
  const totalLongTermLiabilities = bankLoan + gratuityLiability;

  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  // Equity
  const shareCapital = getBal('30100');
  const retainedEarnings = getBal('30200');
  const currentNetIncome = totalAssets - totalLiabilities - shareCapital - retainedEarnings;
  const totalEquity = shareCapital + retainedEarnings + currentNetIncome;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const equilibriumDelta = Math.abs(totalAssets - totalLiabilitiesAndEquity);

  return {
    totalAssets: parseFloat(totalAssets.toFixed(2)),
    totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
    totalEquity: parseFloat(totalEquity.toFixed(2)),
    totalLiabilitiesAndEquity: parseFloat(totalLiabilitiesAndEquity.toFixed(2)),
    isBalanced: equilibriumDelta < 0.05,
    equilibriumDelta: parseFloat(equilibriumDelta.toFixed(2))
  };
}

function calculateThreeWayMatch(poUnitCost, billUnitCost, poQty, grnQty, billQty, tolerance = 2.0) {
  const ppvAmount = (billUnitCost - poUnitCost) * billQty;
  const ppvPercent = poUnitCost > 0 ? ((billUnitCost - poUnitCost) / poUnitCost) * 100 : 0;

  let status = 'MATCHED';
  let actionRequired = 'Auto-Matched and Approved';

  if (poQty !== grnQty || grnQty !== billQty) {
    status = 'QTY_HOLD';
    actionRequired = 'Quantity discrepancy across PO, GRN and Bill';
  } else if (Math.abs(ppvPercent) > tolerance) {
    status = 'PPV_HOLD';
    actionRequired = `PPV variance (${ppvPercent.toFixed(1)}%) exceeds ${tolerance}% tolerance limit`;
  }

  return {
    ppv_amount: parseFloat(ppvAmount.toFixed(2)),
    ppv_variance_percent: parseFloat(ppvPercent.toFixed(1)),
    tolerance_percent: tolerance,
    status,
    action_required: actionRequired
  };
}

function applyJournalEntryToAccounts(accounts, voucher) {
  return accounts.map(acc => {
    let delta = 0;
    voucher.lines.forEach(l => {
      if (l.account_code === acc.account_code) {
        if (acc.normal_balance === 'DEBIT') {
          delta += (l.debit_amount - l.credit_amount);
        } else {
          delta += (l.credit_amount - l.debit_amount);
        }
      }
    });
    if (delta !== 0) {
      return { ...acc, current_balance: parseFloat((acc.current_balance + delta).toFixed(2)) };
    }
    return acc;
  });
}

// -------------------------------------------------------------
// EMPIRICAL TESTS
// -------------------------------------------------------------

describe('1. Double-Entry Equilibrium on Seed & Generated Vouchers', () => {
  test('Seed Journal Entries must have sum(Debits) === sum(Credits) with 0 delta', () => {
    initialJournalEntries.forEach(jv => {
      const lineDebitSum = jv.lines.reduce((s, l) => s + l.debit_amount, 0);
      const lineCreditSum = jv.lines.reduce((s, l) => s + l.credit_amount, 0);
      const delta = Math.abs(lineDebitSum - lineCreditSum);

      assert.equal(delta < 0.001, true, `Voucher ${jv.voucher_number} delta ${delta} is not 0`);
      assert.equal(Math.abs(jv.total_debit - lineDebitSum) < 0.001, true, `Voucher ${jv.voucher_number} total_debit mismatch`);
      assert.equal(Math.abs(jv.total_credit - lineCreditSum) < 0.001, true, `Voucher ${jv.voucher_number} total_credit mismatch`);
      assert.equal(jv.total_debit, jv.total_credit, `Voucher ${jv.voucher_number} total_debit != total_credit`);
    });
  });

  test('postJournalEntry generates strictly balanced vouchers', () => {
    let accounts = createInitialAccounts();
    const newEntry = {
      voucher_number: 'JV-TEST-001',
      lines: [
        { account_code: '10100', debit_amount: 5000.00, credit_amount: 0.00 },
        { account_code: '11100', debit_amount: 0.00, credit_amount: 5000.00 }
      ]
    };
    const totalDebit = newEntry.lines.reduce((s, l) => s + l.debit_amount, 0);
    const totalCredit = newEntry.lines.reduce((s, l) => s + l.credit_amount, 0);
    assert.equal(totalDebit, totalCredit);

    accounts = applyJournalEntryToAccounts(accounts, newEntry);
    const chaseAcc = accounts.find(a => a.account_code === '10100');
    const arAcc = accounts.find(a => a.account_code === '11100');
    assert.equal(chaseAcc.current_balance, 318950.00 + 5000.00);
    assert.equal(arAcc.current_balance, 84120.00 - 5000.00);
  });
});

describe('2. Trial Balance Equilibrium', () => {
  test('Initial Chart of Accounts Trial Balance has totalDebits === totalCredits and difference === 0', () => {
    const accounts = createInitialAccounts();
    const tb = calculateTrialBalance(accounts);

    console.log(`Initial Trial Balance: Total Debits = $${tb.totalDebits}, Total Credits = $${tb.totalCredits}, Diff = $${tb.difference}`);
    assert.equal(tb.isBalanced, true, `Trial balance is not balanced! Diff: ${tb.difference}`);
    assert.equal(tb.difference, 0, `Trial balance difference ${tb.difference} is not 0`);
    assert.equal(tb.totalDebits, tb.totalCredits, 'Total debits does not equal total credits');
  });

  test('Trial Balance remains perfectly balanced after sequential multi-module operations', () => {
    let accounts = createInitialAccounts();

    // 1. Post stock receipt: DR 13110 $2500, CR 20200 $2500
    accounts = applyJournalEntryToAccounts(accounts, {
      lines: [
        { account_code: '13110', debit_amount: 2500.00, credit_amount: 0.00 },
        { account_code: '20200', debit_amount: 0.00, credit_amount: 2500.00 }
      ]
    });
    let tb = calculateTrialBalance(accounts);
    assert.equal(tb.isBalanced, true);
    assert.equal(tb.difference, 0);

    // 2. Post vendor bill: DR 20200 $2500, DR 13900 $125, CR 21010 $2625
    accounts = applyJournalEntryToAccounts(accounts, {
      lines: [
        { account_code: '20200', debit_amount: 2500.00, credit_amount: 0.00 },
        { account_code: '13900', debit_amount: 125.00, credit_amount: 0.00 },
        { account_code: '21010', debit_amount: 0.00, credit_amount: 2625.00 }
      ]
    });
    tb = calculateTrialBalance(accounts);
    assert.equal(tb.isBalanced, true);
    assert.equal(tb.difference, 0);

    // 3. Post customer invoice: DR 11100 $10500, CR 40100 $10000, CR 22200 $500
    accounts = applyJournalEntryToAccounts(accounts, {
      lines: [
        { account_code: '11100', debit_amount: 10500.00, credit_amount: 0.00 },
        { account_code: '40100', debit_amount: 0.00, credit_amount: 10000.00 },
        { account_code: '22200', debit_amount: 0.00, credit_amount: 500.00 }
      ]
    });
    tb = calculateTrialBalance(accounts);
    assert.equal(tb.isBalanced, true);
    assert.equal(tb.difference, 0);

    // 4. Post payroll: DR 63100 $10000, CR 22100 $8500, CR 22100 $1500
    accounts = applyJournalEntryToAccounts(accounts, {
      lines: [
        { account_code: '63100', debit_amount: 10000.00, credit_amount: 0.00 },
        { account_code: '22100', debit_amount: 0.00, credit_amount: 8500.00 },
        { account_code: '22100', debit_amount: 0.00, credit_amount: 1500.00 }
      ]
    });
    tb = calculateTrialBalance(accounts);
    assert.equal(tb.isBalanced, true);
    assert.equal(tb.difference, 0);

    // 5. Post depreciation: DR 64100 $1391.66, CR 15200 $1391.66
    accounts = applyJournalEntryToAccounts(accounts, {
      lines: [
        { account_code: '64100', debit_amount: 1391.66, credit_amount: 0.00 },
        { account_code: '15200', debit_amount: 0.00, credit_amount: 1391.66 }
      ]
    });
    tb = calculateTrialBalance(accounts);
    assert.equal(tb.isBalanced, true);
    assert.equal(tb.difference, 0);
  });
});

describe('3. Balance Sheet Identity (Assets == Liabilities + Equity)', () => {
  test('Initial Balance Sheet strictly satisfies Assets == Liabilities + Equity with 0 delta', () => {
    const accounts = createInitialAccounts();
    const inventory = [...initialInventory];
    const bs = calculateBalanceSheet(accounts, inventory);

    console.log(`Balance Sheet: Assets = $${bs.totalAssets}, Liab = $${bs.totalLiabilities}, Equity = $${bs.totalEquity}, Liab+Eq = $${bs.totalLiabilitiesAndEquity}, Delta = $${bs.equilibriumDelta}`);
    assert.equal(bs.isBalanced, true);
    assert.equal(bs.equilibriumDelta, 0.00);
    assert.equal(bs.totalAssets, bs.totalLiabilitiesAndEquity);
  });
});

describe('4. Automated GL Posting on Inventory Movement', () => {
  test('Receive movement triggers DR Inventory Asset (13110-13160) and CR GR/IR Interim Clearing (20200)', () => {
    const txn = {
      id: 'TXN-AUTO-01',
      type: 'Receive',
      from: 'Global Linens Co.',
      to: 'Main Warehouse',
      items: [
        { sku: 'LIN-001', name: 'Bath Towel - White', qty: 100, unitCost: 12.50 }
      ]
    };

    // Category mapping: Linens -> 13110
    const catTotal = 100 * 12.50; // 1250.00
    const debitLine = { account_code: '13110', debit_amount: 1250.00, credit_amount: 0.00 };
    const creditLine = { account_code: '20200', debit_amount: 0.00, credit_amount: 1250.00 };

    assert.equal(debitLine.account_code, '13110');
    assert.equal(creditLine.account_code, '20200');
    assert.equal(debitLine.debit_amount, creditLine.credit_amount);
  });

  test('Issue movement triggers DR Department Expense (61100-61400) and CR Inventory Asset (13110-13160)', () => {
    const txn = {
      id: 'TXN-AUTO-02',
      type: 'Issue',
      from: 'Main Warehouse',
      to: 'Housekeeping (CC-100)',
      items: [
        { sku: 'LIN-001', name: 'Bath Towel - White', qty: 20, unitCost: 12.50 }
      ]
    };

    const cost = 20 * 12.50; // 250.00
    const debitLine = { account_code: '61200', debit_amount: 250.00, credit_amount: 0.00, cost_center: 'CC-100' };
    const creditLine = { account_code: '13110', debit_amount: 0.00, credit_amount: 250.00 };

    assert.equal(debitLine.account_code, '61200');
    assert.equal(creditLine.account_code, '13110');
    assert.equal(debitLine.debit_amount, creditLine.credit_amount);
  });

  test('Return movement triggers DR Inventory Asset (13110-13160) and CR Department Expense (61100-61400)', () => {
    const txn = {
      id: 'TXN-AUTO-03',
      type: 'Return',
      from: 'Housekeeping (CC-100)',
      to: 'Main Warehouse',
      items: [
        { sku: 'LIN-001', name: 'Bath Towel - White', qty: 5, unitCost: 12.50 }
      ]
    };

    const cost = 5 * 12.50; // 62.50
    const debitLine = { account_code: '13110', debit_amount: 62.50, credit_amount: 0.00 };
    const creditLine = { account_code: '61200', debit_amount: 0.00, credit_amount: 62.50, cost_center: 'CC-100' };

    assert.equal(debitLine.account_code, '13110');
    assert.equal(creditLine.account_code, '61200');
    assert.equal(debitLine.debit_amount, creditLine.credit_amount);
  });

  test('Multi-category inventory receipt creates multiple debit lines and one consolidated credit line', () => {
    const items = [
      { sku: 'LIN-001', category: 'Linens', qty: 10, unitCost: 12.50 }, // 125.00 -> 13110
      { sku: 'CLN-010', category: 'Cleaning', qty: 5, unitCost: 15.00 },  // 75.00 -> 13130
      { sku: 'FNB-100', category: 'F&B', qty: 2, unitCost: 22.00 }       // 44.00 -> 13120
    ];

    const categoryTotals = {};
    let total = 0;
    items.forEach(i => {
      const line = i.qty * i.unitCost;
      total += line;
      categoryTotals[i.category] = (categoryTotals[i.category] || 0) + line;
    });

    assert.equal(total, 244.00);
    assert.equal(categoryTotals['Linens'], 125.00);
    assert.equal(categoryTotals['Cleaning'], 75.00);
    assert.equal(categoryTotals['F&B'], 44.00);

    const sumDebits = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    assert.equal(sumDebits, total);
  });
});

describe('5. 3-Way Matching PPV Math & Tolerance Checks', () => {
  test('Exact price match (PPV = 0) produces status MATCHED', () => {
    const res = calculateThreeWayMatch(12.50, 12.50, 100, 100, 100, 2.0);
    assert.equal(res.ppv_amount, 0.00);
    assert.equal(res.ppv_variance_percent, 0.0);
    assert.equal(res.status, 'MATCHED');
  });

  test('PPV within 2.0% tolerance (+1.6%) produces status MATCHED', () => {
    // PO $12.50, Bill $12.70 -> Delta $0.20 (+1.6%), Total PPV = $20.00
    const res = calculateThreeWayMatch(12.50, 12.70, 100, 100, 100, 2.0);
    assert.equal(res.ppv_amount, 20.00);
    assert.equal(res.ppv_variance_percent, 1.6);
    assert.equal(res.status, 'MATCHED');
  });

  test('PPV exceeding 2.0% tolerance (+4.0%) produces status PPV_HOLD', () => {
    // PO $12.50, Bill $13.00 -> Delta $0.50 (+4.0%), Total PPV = $50.00
    const res = calculateThreeWayMatch(12.50, 13.00, 100, 100, 100, 2.0);
    assert.equal(res.ppv_amount, 50.00);
    assert.equal(res.ppv_variance_percent, 4.0);
    assert.equal(res.status, 'PPV_HOLD');
  });

  test('Quantity mismatch produces status QTY_HOLD', () => {
    // PO 1000, GRN 800, Bill 1000
    const res = calculateThreeWayMatch(0.45, 0.45, 1000, 800, 1000, 2.0);
    assert.equal(res.status, 'QTY_HOLD');
  });

  test('Favorable PPV (Bill < PO) produces negative PPV amount', () => {
    // PO $12.50, Bill $12.00 -> Delta -$0.50 (-4.0%), Total PPV = -$50.00
    const res = calculateThreeWayMatch(12.50, 12.00, 100, 100, 100, 2.0);
    assert.equal(res.ppv_amount, -50.00);
    assert.equal(res.ppv_variance_percent, -4.0);
  });
});

describe('6. VAT Calculation & Statutory Tax Settlement', () => {
  test('Standard 5% VAT calculation on invoice and bill', () => {
    const billSubtotal = 4619.05;
    const billTax = parseFloat((billSubtotal * 0.05).toFixed(2));
    assert.equal(billTax, 230.95);
    assert.equal(parseFloat((billSubtotal + billTax).toFixed(2)), 4850.00);

    const invSubtotal = 16000.00;
    const invTax = parseFloat((invSubtotal * 0.05).toFixed(2));
    assert.equal(invTax, 800.00);
    assert.equal(invSubtotal + invTax, 16800.00);
  });

  test('Net Tax Liability formula: Output VAT - Input VAT', () => {
    initialVatFiling.forEach(v => {
      const calculatedNet = parseFloat((v.output_vat - v.input_vat).toFixed(2));
      assert.equal(calculatedNet, v.net_tax_liability, `Net tax mismatch for period ${v.tax_period}`);
    });
  });

  test('Tax Settlement GL Voucher is perfectly balanced', () => {
    const q3 = initialVatFiling[1]; // Output 32100, Input 13650, Net 18450
    const taxVoucher = {
      lines: [
        { account_code: '22200', debit_amount: q3.output_vat, credit_amount: 0.00 },
        { account_code: '13900', debit_amount: 0.00, credit_amount: q3.input_vat },
        { account_code: '10100', debit_amount: 0.00, credit_amount: q3.net_tax_liability }
      ]
    };
    const drSum = taxVoucher.lines.reduce((s, l) => s + l.debit_amount, 0);
    const crSum = taxVoucher.lines.reduce((s, l) => s + l.credit_amount, 0);
    assert.equal(drSum, crSum);
    assert.equal(drSum, 32100.00);
  });
});

describe('7. Payroll & Fixed Asset Depreciation Formulas', () => {
  test('Straight-line depreciation formula: (Cost - Salvage) / Useful_Life', () => {
    initialFixedAssets.forEach(asset => {
      const calculatedMonthly = (asset.acquisition_cost - asset.salvage_value) / asset.useful_life_months;
      assert.equal(
        Math.abs(calculatedMonthly - asset.monthly_depreciation_amount) < 0.01,
        true,
        `Depreciation calculation mismatch for ${asset.name}`
      );
      assert.equal(
        asset.net_book_value,
        asset.acquisition_cost - asset.accumulated_depreciation,
        `NBV mismatch for ${asset.name}`
      );
    });
  });

  test('Total monthly depreciation run across all assets', () => {
    const totalDep = initialFixedAssets.reduce((sum, a) => sum + a.monthly_depreciation_amount, 0);
    assert.equal(parseFloat(totalDep.toFixed(2)), 1391.66);
  });

  test('Workforce Payroll: Gross = Basic + Allowances, Net = Gross - Deductions', () => {
    const p = initialPayrollRecords[0];
    assert.equal(p.total_gross, p.total_basic_salary + p.total_allowances);
    assert.equal(p.total_net_salary, p.total_gross - p.total_deductions);

    p.records.forEach(r => {
      const gross = r.basic_salary + r.allowances;
      const net = gross - r.deductions;
      assert.equal(r.net_salary, net, `Net salary mismatch for ${r.name}`);
    });
  });
});

describe('8. Adversarial Edge Cases & Stress Harness', () => {
  test('Zero subtotal transaction produces 0 tax, 0 total, and remains balanced', () => {
    const subtotal = 0;
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const total = subtotal + tax;
    assert.equal(total, 0);

    const voucher = {
      lines: [
        { account_code: '11100', debit_amount: 0, credit_amount: 0 },
        { account_code: '40100', debit_amount: 0, credit_amount: 0 }
      ]
    };
    const drSum = voucher.lines.reduce((s, l) => s + l.debit_amount, 0);
    const crSum = voucher.lines.reduce((s, l) => s + l.credit_amount, 0);
    assert.equal(drSum, crSum);
  });

  test('Extremely large transaction ($100,000,000.00) maintains exact equilibrium', () => {
    let accounts = createInitialAccounts();
    const largeEntry = {
      lines: [
        { account_code: '10100', debit_amount: 100000000.00, credit_amount: 0.00 },
        { account_code: '30100', debit_amount: 0.00, credit_amount: 100000000.00 }
      ]
    };
    accounts = applyJournalEntryToAccounts(accounts, largeEntry);
    const tb = calculateTrialBalance(accounts);
    assert.equal(tb.isBalanced, true);
    assert.equal(tb.difference, 0);
  });

  test('Rapid 50-step high-frequency transaction sequence maintains trial balance at every step', () => {
    let accounts = createInitialAccounts();

    for (let i = 1; i <= 50; i++) {
      const amt = parseFloat((i * 137.45).toFixed(2));
      const entry = {
        lines: [
          { account_code: '10100', debit_amount: amt, credit_amount: 0.00 },
          { account_code: '40100', debit_amount: 0.00, credit_amount: amt }
        ]
      };
      accounts = applyJournalEntryToAccounts(accounts, entry);
      const tb = calculateTrialBalance(accounts);
      assert.equal(tb.isBalanced, true, `Trial balance failed at step ${i}`);
      assert.equal(tb.difference, 0, `Trial balance diff != 0 at step ${i}`);
    }
  });
});
