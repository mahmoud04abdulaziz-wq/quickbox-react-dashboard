import React, { createContext, useState, useContext, useEffect, useMemo, useRef } from 'react';
import { useInventory } from './InventoryContext';

/**
 * FinanceContext — Enterprise Financial Accounting & General Ledger Engine
 * Deeply integrated with InventoryContext for unified master data & automated double-entry GL postings.
 */
export const FinanceContext = createContext();

// ==========================================
// SEED DATA & INITIAL STATE
// ==========================================

/**
 * Chart of Accounts (COA)
 * Assets (10000), Liabilities (20000), Equity (30000), Revenue (40000), COGS (50000), OPEX (60000)
 */
const initialAccounts = [
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

/**
 * Initial General Ledger Journal Entries
 */
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

/**
 * 3-Way Matching Records
 */
const initialThreeWayMatches = [
  {
    match_id: 'MTH-001',
    id: 'MTH-001',
    po_ref: 'PO-2026-001',
    grn_ref: 'GRN-2026-004',
    bill_ref: 'BILL-2026-089',
    vendor_name: 'Global Linens Co.',
    vendor_id: 'PTY-00042',
    sku: 'LIN-001',
    po_qty: 100,
    grn_qty: 100,
    bill_qty: 100,
    po_unit_price: 12.50,
    bill_unit_price: 13.00,
    ppv_amount: 50.00,
    ppv_variance_percent: 4.0,
    tolerance_percent: 2.0,
    status: 'PPV_HOLD',
    action_required: 'PPV exceeds 2.0% tolerance limit — Manager Approval Required',
    matched_at: '2026-08-15 11:20'
  },
  {
    match_id: 'MTH-002',
    id: 'MTH-002',
    po_ref: 'PO-2026-002',
    grn_ref: 'GRN-2026-005',
    bill_ref: 'BILL-2026-090',
    vendor_name: 'CleanPro Solutions',
    vendor_id: 'PTY-00043',
    sku: 'CLN-010',
    po_qty: 50,
    grn_qty: 50,
    bill_qty: 50,
    po_unit_price: 15.00,
    bill_unit_price: 15.00,
    ppv_amount: 0.00,
    ppv_variance_percent: 0.0,
    tolerance_percent: 2.0,
    status: 'MATCHED',
    action_required: 'Auto-Matched and Approved for Payment',
    matched_at: '2026-08-14 15:45'
  },
  {
    match_id: 'MTH-003',
    id: 'MTH-003',
    po_ref: 'PO-2026-003',
    grn_ref: 'GRN-2026-006',
    bill_ref: 'BILL-2026-091',
    vendor_name: 'Hotel Amenities Inc.',
    vendor_id: 'PTY-00045',
    sku: 'AMN-005',
    po_qty: 1000,
    grn_qty: 800,
    bill_qty: 1000,
    po_unit_price: 0.45,
    bill_unit_price: 0.45,
    ppv_amount: 0.00,
    ppv_variance_percent: 0.0,
    tolerance_percent: 2.0,
    status: 'QTY_HOLD',
    action_required: 'GRN quantity (800) less than Billed quantity (1000) — Goods In Transit',
    matched_at: '2026-08-14 09:30'
  }
];

/**
 * Accounts Payable Vendor Bills
 */
const initialBills = [
  {
    bill_id: 'BILL-2026-0194',
    id: 'BILL-2026-0194',
    bill_number: 'BILL-2026-0194',
    vendor_id: 'PTY-00042',
    vendor_name: 'Global Linens Co.',
    po_reference: 'PO-2026-001',
    grn_reference: 'GRN-2026-004',
    bill_date: '2026-08-10',
    due_date: '2026-08-25',
    payment_terms: 'Net 15',
    subtotal_amount: 4619.05,
    tax_rate: 0.05,
    tax_amount: 230.95,
    landed_costs: 150.00,
    total_amount: 4850.00,
    paid_amount: 0.00,
    balance_due: 4850.00,
    match_status: 'MATCHED',
    payment_status: 'OPEN',
    journal_entry_id: 'JV-2026-00411'
  },
  {
    bill_id: 'BILL-2026-0195',
    id: 'BILL-2026-0195',
    bill_number: 'BILL-2026-0195',
    vendor_id: 'PTY-00043',
    vendor_name: 'CleanPro Solutions',
    po_reference: 'PO-2026-002',
    grn_reference: 'GRN-2026-005',
    bill_date: '2026-08-04',
    due_date: '2026-08-19',
    payment_terms: 'Net 15',
    subtotal_amount: 323.81,
    tax_rate: 0.05,
    tax_amount: 16.19,
    landed_costs: 0.00,
    total_amount: 340.00,
    paid_amount: 340.00,
    balance_due: 0.00,
    match_status: 'MATCHED',
    payment_status: 'PAID',
    journal_entry_id: 'JV-2026-00398'
  },
  {
    bill_id: 'BILL-2026-0196',
    id: 'BILL-2026-0196',
    bill_number: 'BILL-2026-0196',
    vendor_id: 'PTY-00044',
    vendor_name: 'Premium Roasters',
    po_reference: 'PO-2026-004',
    grn_reference: 'GRN-2026-007',
    bill_date: '2026-08-05',
    due_date: '2026-08-05',
    payment_terms: 'COD',
    subtotal_amount: 166.67,
    tax_rate: 0.05,
    tax_amount: 8.33,
    landed_costs: 0.00,
    total_amount: 175.00,
    paid_amount: 0.00,
    balance_due: 175.00,
    match_status: 'PPV_HOLD',
    payment_status: 'OPEN',
    journal_entry_id: null
  },
  {
    bill_id: 'BILL-2026-0197',
    id: 'BILL-2026-0197',
    bill_number: 'BILL-2026-0197',
    vendor_id: 'PTY-00047',
    vendor_name: 'Elite Equipment Ltd.',
    po_reference: 'PO-2026-005',
    grn_reference: 'GRN-2026-008',
    bill_date: '2026-07-25',
    due_date: '2026-09-23',
    payment_terms: 'Net 60',
    subtotal_amount: 2285.71,
    tax_rate: 0.05,
    tax_amount: 114.29,
    landed_costs: 200.00,
    total_amount: 2400.00,
    paid_amount: 0.00,
    balance_due: 2400.00,
    match_status: 'MATCHED',
    payment_status: 'OPEN',
    journal_entry_id: 'JV-2026-00385'
  }
];

/**
 * Accounts Receivable Customer Invoices
 */
const initialInvoices = [
  {
    invoice_id: 'INV-2026-0412',
    id: 'INV-2026-0412',
    invoice_number: 'INV-2026-0412',
    customer_id: 'PTY-00101',
    customer_name: 'Al-Madina Trading LLC',
    so_reference: 'SO-2026-042',
    issue_date: '2026-08-01',
    due_date: '2026-08-31',
    payment_terms: 'Net 30',
    subtotal_amount: 16000.00,
    tax_rate: 0.05,
    tax_amount: 800.00,
    total_amount: 16800.00,
    paid_amount: 16800.00,
    balance_due: 0.00,
    status: 'PAID',
    journal_entry_id: 'JV-2026-00410'
  },
  {
    invoice_id: 'INV-2026-0413',
    id: 'INV-2026-0413',
    invoice_number: 'INV-2026-0413',
    customer_id: 'PTY-00088',
    customer_name: 'Apex Technologies',
    so_reference: 'SO-2026-045',
    issue_date: '2026-08-10',
    due_date: '2026-08-25',
    payment_terms: 'Net 15',
    subtotal_amount: 8000.00,
    tax_rate: 0.05,
    tax_amount: 400.00,
    total_amount: 8400.00,
    paid_amount: 0.00,
    balance_due: 8400.00,
    status: 'ISSUED',
    journal_entry_id: 'JV-2026-00408'
  },
  {
    invoice_id: 'INV-2026-0414',
    id: 'INV-2026-0414',
    invoice_number: 'INV-2026-0414',
    customer_id: 'PTY-00102',
    customer_name: 'Crescent Hospitality Group',
    so_reference: 'SO-2026-048',
    issue_date: '2026-07-15',
    due_date: '2026-08-14',
    payment_terms: 'Net 30',
    subtotal_amount: 32000.00,
    tax_rate: 0.05,
    tax_amount: 1600.00,
    total_amount: 33600.00,
    paid_amount: 10000.00,
    balance_due: 23600.00,
    status: 'OVERDUE',
    journal_entry_id: 'JV-2026-00370'
  }
];

/**
 * Unified Master Party Directory (Vendors, Customers & Dual-Role)
 */
const initialParties = [
  {
    party_id: 'PTY-00042',
    id: 'PTY-00042',
    party_code: 'SUP-001',
    name: 'Global Linens Co.',
    legal_name: 'Global Linens Manufacturing LLC',
    roles: ['Vendor'],
    category: 'Linens',
    tax_number: 'TRN-100293849',
    payment_terms: 'Net 30',
    contact_email: 'sarah@globallinens.com',
    phone: '+1 555-0101',
    ar_balance: 0.00,
    ap_balance: 4850.00,
    net_position: -4850.00,
    is_active: true
  },
  {
    party_id: 'PTY-00043',
    id: 'PTY-00043',
    party_code: 'SUP-002',
    name: 'CleanPro Solutions',
    legal_name: 'CleanPro Chemical Solutions Inc.',
    roles: ['Vendor'],
    category: 'Cleaning',
    tax_number: 'TRN-100485920',
    payment_terms: 'Net 15',
    contact_email: 'sales@cleanpro.com',
    phone: '+1 555-0102',
    ar_balance: 0.00,
    ap_balance: 0.00,
    net_position: 0.00,
    is_active: true
  },
  {
    party_id: 'PTY-00044',
    id: 'PTY-00044',
    party_code: 'SUP-003',
    name: 'Premium Roasters',
    legal_name: 'Premium Roasters Coffee Corp.',
    roles: ['Vendor'],
    category: 'F&B',
    tax_number: 'TRN-100984721',
    payment_terms: 'COD',
    contact_email: 'orders@premiumroasters.com',
    phone: '+1 555-0103',
    ar_balance: 0.00,
    ap_balance: 175.00,
    net_position: -175.00,
    is_active: true
  },
  {
    party_id: 'PTY-00045',
    id: 'PTY-00045',
    party_code: 'SUP-004',
    name: 'Hotel Amenities Inc.',
    legal_name: 'Lux Hotel Amenities International',
    roles: ['Vendor'],
    category: 'Toiletries',
    tax_number: 'TRN-100882194',
    payment_terms: 'Net 30',
    contact_email: 'support@hotelamenities.com',
    phone: '+1 555-0104',
    ar_balance: 0.00,
    ap_balance: 890.00,
    net_position: -890.00,
    is_active: true
  },
  {
    party_id: 'PTY-00046',
    id: 'PTY-00046',
    party_code: 'SUP-005',
    name: 'Fresh Dairy Farms',
    legal_name: 'Fresh Dairy Farms & Agro LLC',
    roles: ['Vendor'],
    category: 'F&B',
    tax_number: 'TRN-100349281',
    payment_terms: 'COD',
    contact_email: 'dispatch@freshdairy.com',
    phone: '+1 555-0105',
    ar_balance: 0.00,
    ap_balance: 0.00,
    net_position: 0.00,
    is_active: true
  },
  {
    party_id: 'PTY-00047',
    id: 'PTY-00047',
    party_code: 'SUP-006',
    name: 'Elite Equipment Ltd.',
    legal_name: 'Elite Commercial Equipment Ltd.',
    roles: ['Vendor'],
    category: 'Equipment',
    tax_number: 'TRN-100774920',
    payment_terms: 'Net 60',
    contact_email: 'info@eliteequip.com',
    phone: '+1 555-0106',
    ar_balance: 0.00,
    ap_balance: 2400.00,
    net_position: -2400.00,
    is_active: true
  },
  {
    party_id: 'PTY-00088',
    id: 'PTY-00088',
    party_code: 'PTY-00088',
    name: 'Apex Technologies',
    legal_name: 'Apex Technologies & Hospitality Systems',
    roles: ['Customer', 'Vendor'],
    category: 'Dual-Role',
    tax_number: 'TRN-998822104',
    payment_terms: 'Net 15',
    contact_email: 'finance@apextech.example',
    phone: '+1 (555) 349-2200',
    ar_balance: 8400.00,
    ap_balance: 680.00,
    net_position: 7720.00,
    is_active: true
  },
  {
    party_id: 'PTY-00101',
    id: 'PTY-00101',
    party_code: 'CUST-001',
    name: 'Al-Madina Trading LLC',
    legal_name: 'Al-Madina General Trading LLC',
    roles: ['Customer'],
    category: 'Hospitality Partner',
    tax_number: 'TRN-992288114',
    payment_terms: 'Net 30',
    contact_email: 'accounts@almadina.example',
    phone: '+1 (555) 883-9911',
    ar_balance: 0.00,
    ap_balance: 0.00,
    net_position: 0.00,
    is_active: true
  },
  {
    party_id: 'PTY-00102',
    id: 'PTY-00102',
    party_code: 'CUST-002',
    name: 'Crescent Hospitality Group',
    legal_name: 'Crescent Resorts & Luxury Hotels Ltd.',
    roles: ['Customer'],
    category: 'Key Account',
    tax_number: 'TRN-994477332',
    payment_terms: 'Net 30',
    contact_email: 'billing@crescenthotels.example',
    phone: '+1 (555) 992-3344',
    ar_balance: 23600.00,
    ap_balance: 0.00,
    net_position: 23600.00,
    is_active: true
  }
];

/**
 * Valuation Rules (Category to GL Account Mappings & Costing Rules)
 */
const initialValuationRules = [
  { category: 'Linens', category_id: 'CAT-LIN', sku_count: 4, policy: 'AVCO', inventory_asset_account: '13110', cogs_account: '50110', variance_account: '51200', expense_account: '61200', ppv_tolerance_percent: 2.0, absolute_cap_usd: 50.00, landed_cost_allocation_basis: 'Value' },
  { category: 'Cleaning', category_id: 'CAT-CLN', sku_count: 3, policy: 'AVCO', inventory_asset_account: '13130', cogs_account: '50130', variance_account: '51200', expense_account: '61200', ppv_tolerance_percent: 2.0, absolute_cap_usd: 25.00, landed_cost_allocation_basis: 'Weight_Qty' },
  { category: 'F&B', category_id: 'CAT-FNB', sku_count: 4, policy: 'FIFO', inventory_asset_account: '13120', cogs_account: '50120', variance_account: '51200', expense_account: '61100', ppv_tolerance_percent: 1.5, absolute_cap_usd: 40.00, landed_cost_allocation_basis: 'Value' },
  { category: 'Toiletries', category_id: 'CAT-AMN', sku_count: 3, policy: 'AVCO', inventory_asset_account: '13140', cogs_account: '50140', variance_account: '51200', expense_account: '61400', ppv_tolerance_percent: 2.5, absolute_cap_usd: 30.00, landed_cost_allocation_basis: 'Weight_Qty' },
  { category: 'Equipment', category_id: 'CAT-EQP', sku_count: 2, policy: 'Standard Cost', inventory_asset_account: '13150', cogs_account: '50150', variance_account: '51200', expense_account: '61300', ppv_tolerance_percent: 5.0, absolute_cap_usd: 100.00, landed_cost_allocation_basis: 'Value' },
  { category: 'Maintenance', category_id: 'CAT-MNT', sku_count: 4, policy: 'AVCO', inventory_asset_account: '13160', cogs_account: '50160', variance_account: '51200', expense_account: '61300', ppv_tolerance_percent: 2.0, absolute_cap_usd: 50.00, landed_cost_allocation_basis: 'Value' }
];

/**
 * Cost Centers (CC-100 to CC-600)
 */
const initialCostCenters = [
  { cost_center_id: 'CC-100', code: 'CC-100', name: 'Housekeeping', manager: 'Aisha T.', gl_expense_account: '61200', monthly_budget: 15000.00, actual_spent: 11200.00, utilization_percent: 74.7, is_over_budget: false },
  { cost_center_id: 'CC-200', code: 'CC-200', name: 'F&B Kitchen', manager: 'Chef Alex M.', gl_expense_account: '61100', monthly_budget: 28000.00, actual_spent: 18720.00, utilization_percent: 66.9, is_over_budget: false },
  { cost_center_id: 'CC-300', code: 'CC-300', name: 'Facilities & Maintenance', manager: 'Tariq K.', gl_expense_account: '61300', monthly_budget: 12000.00, actual_spent: 5400.00, utilization_percent: 45.0, is_over_budget: false },
  { cost_center_id: 'CC-400', code: 'CC-400', name: 'Front Office & Guest Services', manager: 'Layla S.', gl_expense_account: '61400', monthly_budget: 8000.00, actual_spent: 2100.00, utilization_percent: 26.3, is_over_budget: false },
  { cost_center_id: 'CC-500', code: 'CC-500', name: 'IT & Security Systems', manager: 'Omar R.', gl_expense_account: '62100', monthly_budget: 10000.00, actual_spent: 5430.00, utilization_percent: 54.3, is_over_budget: false },
  { cost_center_id: 'CC-600', code: 'CC-600', name: 'Administration & Executive', manager: 'Sarah N.', gl_expense_account: '66100', monthly_budget: 25000.00, actual_spent: 16250.00, utilization_percent: 65.0, is_over_budget: false }
];

/**
 * Internal Department Requisitions
 */
const initialRequisitions = [
  {
    requisition_id: 'REQ-2026-081',
    id: 'REQ-2026-081',
    date: '2026-08-14',
    cost_center_code: 'CC-100',
    cost_center_name: 'Housekeeping (CC-100)',
    staff_name: 'Aisha T.',
    items: [
      { sku: 'AMN-005', name: 'Shampoo Mini 50ml', qty: 200, unitCost: 0.45, total: 90.00 },
      { sku: 'AMN-007', name: 'Conditioner Mini 50ml', qty: 200, unitCost: 0.50, total: 100.00 },
      { sku: 'LIN-001', name: 'Bath Towel - White', qty: 84, unitCost: 12.50, total: 1050.00 }
    ],
    total_cost: 1240.00,
    journal_entry_id: 'JV-2026-00409',
    status: 'Approved'
  },
  {
    requisition_id: 'REQ-2026-080',
    id: 'REQ-2026-080',
    date: '2026-08-11',
    cost_center_code: 'CC-200',
    cost_center_name: 'F&B Kitchen (CC-200)',
    staff_name: 'Chef Alex M.',
    items: [
      { sku: 'FNB-100', name: 'Coffee Beans - Espresso', qty: 10, unitCost: 22.00, total: 220.00 },
      { sku: 'FNB-101', name: 'Milk - Whole', qty: 40, unitCost: 1.80, total: 72.00 }
    ],
    total_cost: 292.00,
    journal_entry_id: 'JV-2026-00375',
    status: 'Approved'
  }
];

/**
 * Fixed Asset Register
 */
const initialFixedAssets = [
  {
    asset_id: 'FA-2024-0012',
    id: 'FA-2024-0012',
    asset_tag: 'FA-2024-0012',
    name: 'Commercial Tunnel Washer 50kg',
    category: 'Laundry Equipment',
    cost_center: 'CC-100',
    acquisition_date: '2024-01-15',
    acquisition_cost: 48000.00,
    cost: 48000.00,
    salvage_value: 4000.00,
    useful_life_months: 96,
    depreciation_method: 'StraightLine',
    asset_gl_account: '15100',
    accum_deprec_gl_account: '15200',
    deprec_expense_gl_account: '64100',
    accumulated_depreciation: 15500.00,
    net_book_value: 32500.00,
    monthly_depreciation_amount: 458.33,
    status: 'Active'
  },
  {
    asset_id: 'FA-2023-0004',
    id: 'FA-2023-0004',
    asset_tag: 'FA-2023-0004',
    name: 'Main Kitchen Cold Storage Unit',
    category: 'Kitchen Equipment',
    cost_center: 'CC-200',
    acquisition_date: '2023-05-10',
    acquisition_cost: 65000.00,
    cost: 65000.00,
    salvage_value: 5000.00,
    useful_life_months: 120,
    depreciation_method: 'StraightLine',
    asset_gl_account: '15100',
    accum_deprec_gl_account: '15200',
    deprec_expense_gl_account: '64100',
    accumulated_depreciation: 19500.00,
    net_book_value: 45500.00,
    monthly_depreciation_amount: 500.00,
    status: 'Active'
  },
  {
    asset_id: 'FA-2025-0018',
    id: 'FA-2025-0018',
    asset_tag: 'FA-2025-0018',
    name: 'Core Network Server Rack & UPS',
    category: 'IT Infrastructure',
    cost_center: 'CC-500',
    acquisition_date: '2025-02-01',
    acquisition_cost: 28000.00,
    cost: 28000.00,
    salvage_value: 2000.00,
    useful_life_months: 60,
    depreciation_method: 'StraightLine',
    asset_gl_account: '15100',
    accum_deprec_gl_account: '15200',
    deprec_expense_gl_account: '64100',
    accumulated_depreciation: 7800.00,
    net_book_value: 20200.00,
    monthly_depreciation_amount: 433.33,
    status: 'Active'
  }
];

/**
 * Fixed Asset Depreciation Runs History
 */
const initialDepreciationRuns = [
  { run_id: 'DEP-2026-07', period: '2026-07', execution_date: '2026-07-31', asset_count: 3, total_depreciation: 1391.66, journal_entry_id: 'JV-2026-00360', status: 'Posted' }
];

/**
 * Workforce Payroll Records (WPS Compliant)
 */
const initialPayrollRecords = [
  {
    payroll_id: 'PAY-2026-08',
    id: 'PAY-2026-08',
    period: 'August 2026',
    month: 'August 2026',
    execution_date: '2026-08-31',
    employee_count: 42,
    total_basic_salary: 124200.00,
    total_allowances: 24300.00,
    total_gross: 148500.00,
    total_deductions: 24300.00,
    total_net_salary: 124200.00,
    wps_sif_generated: true,
    status: 'Processed',
    journal_entry_id: 'JV-2026-00405',
    records: [
      { emp_id: 'EMP-0101', name: 'Aisha Tariq', department: 'Housekeeping (CC-100)', basic_salary: 4500.00, allowances: 800.00, deductions: 500.00, net_salary: 4800.00, wps_status: 'Verified' },
      { emp_id: 'EMP-0104', name: 'Chef Alex Morgan', department: 'F&B Kitchen (CC-200)', basic_salary: 7200.00, allowances: 1200.00, deductions: 900.00, net_salary: 7500.00, wps_status: 'Verified' },
      { emp_id: 'EMP-0108', name: 'Tariq Khalil', department: 'Maintenance (CC-300)', basic_salary: 5000.00, allowances: 900.00, deductions: 600.00, net_salary: 5300.00, wps_status: 'Verified' },
      { emp_id: 'EMP-0112', name: 'Layla Salem', department: 'Front Office (CC-400)', basic_salary: 4800.00, allowances: 750.00, deductions: 550.00, net_salary: 5000.00, wps_status: 'Verified' }
    ]
  }
];

/**
 * VAT Filing & Statutory Tax Records (5% UAE / GCC Standard Rate)
 */
const initialVatFiling = [
  {
    tax_period: 'VAT-2026-Q2',
    quarter: 'Q2 2026',
    filing_date: '2026-07-20',
    taxable_sales: 580000.00,
    gross_sales: 580000.00,
    output_vat_rate: 0.05,
    output_vat: 29000.00,
    output_vat_amount: 29000.00,
    taxable_purchases: 250000.00,
    gross_purchases: 250000.00,
    input_vat_rate: 0.05,
    input_vat: 12500.00,
    input_vat_amount: 12500.00,
    net_tax_liability: 16500.00,
    net_vat_payable: 16500.00,
    filing_status: 'Submitted',
    status: 'Submitted',
    journal_entry_id: 'JV-2026-TAX-06'
  },
  {
    tax_period: 'VAT-2026-Q3',
    quarter: 'Q3 2026',
    filing_date: '2026-10-20',
    taxable_sales: 642000.00,
    gross_sales: 642000.00,
    output_vat_rate: 0.05,
    output_vat: 32100.00,
    output_vat_amount: 32100.00,
    taxable_purchases: 273000.00,
    gross_purchases: 273000.00,
    input_vat_rate: 0.05,
    input_vat: 13650.00,
    input_vat_amount: 13650.00,
    net_tax_liability: 18450.00,
    net_vat_payable: 18450.00,
    filing_status: 'InPreparation',
    status: 'InPreparation',
    journal_entry_id: null
  }
];

/**
 * Bank Accounts & Treasury
 */
const initialBankAccounts = [
  { bank_account_id: 'BANK-01', bank_name: 'Chase Commercial Bank', account_number: '•••• 8912', currency: 'USD', gl_account_code: '10100', current_book_balance: 318950.00, statement_ending_balance: 318950.00, unreconciled_difference: 0.00, last_reconciled: '2026-08-15' },
  { bank_account_id: 'BANK-02', bank_name: 'HSBC Corporate Account', account_number: '•••• 4419', currency: 'USD', gl_account_code: '10110', current_book_balance: 110000.00, statement_ending_balance: 110000.00, unreconciled_difference: 0.00, last_reconciled: '2026-08-15' }
];

const initialBankTransactions = [
  { txn_id: 'BTX-9901', bank_account_id: 'BANK-01', date: '2026-08-14', description: 'Customer Wire — Al-Madina Trading', reference: 'INV-2026-0412', amount: 16800.00, type: 'INFLOW', status: 'Reconciled' },
  { txn_id: 'BTX-9902', bank_account_id: 'BANK-01', date: '2026-08-05', description: 'Vendor Outflow — CleanPro Solutions', reference: 'BILL-2026-0195', amount: -340.00, type: 'OUTFLOW', status: 'Reconciled' }
];

/**
 * Audit Log
 */
const initialAuditLog = [
  { audit_id: 'AUD-9982', timestamp: '2026-08-15T10:45:00Z', action_type: 'STOCK_RECEIPT_AUTO_GL', source_module: 'INVENTORY', document_ref: 'GRN-2026-004', voucher_number: 'JV-2026-00412', agent: 'System (Auto-GL)', verification_hash: '0x8f2c3d9a1004e7b' },
  { audit_id: 'AUD-9981', timestamp: '2026-08-14T14:20:00Z', action_type: 'BILL_POSTING_AP', source_module: 'AP', document_ref: 'BILL-2026-0194', voucher_number: 'JV-2026-00411', agent: 'Accounting Dept', verification_hash: '0x4d7a1e2b9981f3c' }
];

/**
 * Topic 1: Budgeting & Forecasting Initial Seed Data
 */
export const initialBudgets = [
  {
    budget_id: 'BDG-2026-CC100',
    cost_center_code: 'CC-100',
    cost_center_name: 'Housekeeping',
    manager: 'Aisha Tariq',
    fiscal_year: 2026,
    annual_budget: 180000.00,
    quarterly_allocation: { Q1: 45000.00, Q2: 45000.00, Q3: 45000.00, Q4: 45000.00 },
    ytd_actual: 112000.00,
    ytd_budget: 120000.00,
    ytd_variance: -8000.00,
    variance_percent: -6.7,
    status: 'OnTrack',
    line_items: [
      { line_id: 'BL-101', account_code: '61200', account_name: 'Cleaning Supplies & Consumables', annual_budget: 65000.00, ytd_actual: 41200.00, ytd_forecast: 62000.00, variance: -3800.00, status: 'Favorable' },
      { line_id: 'BL-102', account_code: '61200', account_name: 'Linen Replacements & Laundry Services', annual_budget: 85000.00, ytd_actual: 54800.00, ytd_forecast: 83500.00, variance: -3200.00, status: 'Favorable' },
      { line_id: 'BL-103', account_code: '61200', account_name: 'Equipment Maintenance & Parts', annual_budget: 30000.00, ytd_actual: 16000.00, ytd_forecast: 29000.00, variance: -1000.00, status: 'Favorable' }
    ]
  },
  {
    budget_id: 'BDG-2026-CC200',
    cost_center_code: 'CC-200',
    cost_center_name: 'F&B Kitchen',
    manager: 'Chef Alex Morgan',
    fiscal_year: 2026,
    annual_budget: 336000.00,
    quarterly_allocation: { Q1: 84000.00, Q2: 84000.00, Q3: 84000.00, Q4: 84000.00 },
    ytd_actual: 232720.00,
    ytd_budget: 224000.00,
    ytd_variance: 8720.00,
    variance_percent: 3.9,
    status: 'Warning',
    line_items: [
      { line_id: 'BL-201', account_code: '61100', account_name: 'Perishable Food Ingredients', annual_budget: 190000.00, ytd_actual: 134500.00, ytd_forecast: 198000.00, variance: 8000.00, status: 'Unfavorable' },
      { line_id: 'BL-202', account_code: '61100', account_name: 'Beverages & Specialty Coffee', annual_budget: 86000.00, ytd_actual: 58220.00, ytd_forecast: 87000.00, variance: 1000.00, status: 'Warning' },
      { line_id: 'BL-203', account_code: '61100', account_name: 'Kitchen Utensils & Gas Consumables', annual_budget: 60000.00, ytd_actual: 40000.00, ytd_forecast: 59500.00, variance: -500.00, status: 'Favorable' }
    ]
  },
  {
    budget_id: 'BDG-2026-CC300',
    cost_center_code: 'CC-300',
    cost_center_name: 'Facilities & Maintenance',
    manager: 'Tariq Khalil',
    fiscal_year: 2026,
    annual_budget: 144000.00,
    quarterly_allocation: { Q1: 36000.00, Q2: 36000.00, Q3: 36000.00, Q4: 36000.00 },
    ytd_actual: 84400.00,
    ytd_budget: 96000.00,
    ytd_variance: -11600.00,
    variance_percent: -12.1,
    status: 'OnTrack',
    line_items: [
      { line_id: 'BL-301', account_code: '61300', account_name: 'HVAC & Electromechanical Maintenance', annual_budget: 80000.00, ytd_actual: 46200.00, ytd_forecast: 74000.00, variance: -6000.00, status: 'Favorable' },
      { line_id: 'BL-302', account_code: '61300', account_name: 'Plumbing, Paint & Structural Repairs', annual_budget: 64000.00, ytd_actual: 38200.00, ytd_forecast: 60000.00, variance: -5600.00, status: 'Favorable' }
    ]
  },
  {
    budget_id: 'BDG-2026-CC400',
    cost_center_code: 'CC-400',
    cost_center_name: 'Front Office & Guest Services',
    manager: 'Layla Salem',
    fiscal_year: 2026,
    annual_budget: 96000.00,
    quarterly_allocation: { Q1: 24000.00, Q2: 24000.00, Q3: 24000.00, Q4: 24000.00 },
    ytd_actual: 58100.00,
    ytd_budget: 64000.00,
    ytd_variance: -5900.00,
    variance_percent: -9.2,
    status: 'OnTrack',
    line_items: [
      { line_id: 'BL-401', account_code: '61400', account_name: 'Guest Welcome Amenities & Collateral', annual_budget: 56000.00, ytd_actual: 34200.00, ytd_forecast: 52000.00, variance: -4000.00, status: 'Favorable' },
      { line_id: 'BL-402', account_code: '61400', account_name: 'Concierge & Transportation Subsidies', annual_budget: 40000.00, ytd_actual: 23900.00, ytd_forecast: 38100.00, variance: -1900.00, status: 'Favorable' }
    ]
  },
  {
    budget_id: 'BDG-2026-CC500',
    cost_center_code: 'CC-500',
    cost_center_name: 'IT & Security Systems',
    manager: 'Omar Sayed',
    fiscal_year: 2026,
    annual_budget: 120000.00,
    quarterly_allocation: { Q1: 30000.00, Q2: 30000.00, Q3: 30000.00, Q4: 30000.00 },
    ytd_actual: 76430.00,
    ytd_budget: 80000.00,
    ytd_variance: -3570.00,
    variance_percent: -4.5,
    status: 'OnTrack',
    line_items: [
      { line_id: 'BL-501', account_code: '62100', account_name: 'Cloud SaaS & ERP Subscriptions', annual_budget: 85000.00, ytd_actual: 54430.00, ytd_forecast: 83000.00, variance: -2000.00, status: 'Favorable' },
      { line_id: 'BL-502', account_code: '62100', account_name: 'Cybersecurity & CCTV Hardware Support', annual_budget: 35000.00, ytd_actual: 22000.00, ytd_forecast: 33430.00, variance: -1570.00, status: 'Favorable' }
    ]
  },
  {
    budget_id: 'BDG-2026-CC600',
    cost_center_code: 'CC-600',
    cost_center_name: 'Administration & Executive',
    manager: 'Sarah Nasser',
    fiscal_year: 2026,
    annual_budget: 300000.00,
    quarterly_allocation: { Q1: 75000.00, Q2: 75000.00, Q3: 75000.00, Q4: 75000.00 },
    ytd_actual: 198250.00,
    ytd_budget: 200000.00,
    ytd_variance: -1750.00,
    variance_percent: -0.9,
    status: 'OnTrack',
    line_items: [
      { line_id: 'BL-601', account_code: '66100', account_name: 'Legal, Audit & Advisory Services', annual_budget: 140000.00, ytd_actual: 94250.00, ytd_forecast: 138000.00, variance: -2000.00, status: 'Favorable' },
      { line_id: 'BL-602', account_code: '65100', account_name: 'Head Office Lease & Facility Overhead', annual_budget: 160000.00, ytd_actual: 104000.00, ytd_forecast: 160000.00, variance: 0.00, status: 'Favorable' }
    ]
  }
];

export const initialForecastModels = [
  {
    model_id: 'MOD-BASE-2026',
    name: 'FY2026 Baseline Rolling Forecast (6.5% Growth)',
    type: 'Baseline',
    revenue_growth_rate: 6.5,
    inflation_rate: 3.2,
    driver: 'Average Daily Rate & 78% Occupancy Benchmark',
    annual_projected_revenue: 780000.00,
    annual_projected_cogs: 245000.00,
    annual_projected_opex: 375000.00,
    projected_ebitda: 160000.00,
    projected_net_margin: 20.5,
    is_active: true
  },
  {
    model_id: 'MOD-OPT-2026',
    name: 'FY2026 Optimistic Scenario (Tourism Surge +14%)',
    type: 'Optimistic',
    revenue_growth_rate: 14.0,
    inflation_rate: 2.8,
    driver: 'Peak Season Inflow & Conference Delegations',
    annual_projected_revenue: 885000.00,
    annual_projected_cogs: 270000.00,
    annual_projected_opex: 395000.00,
    projected_ebitda: 220000.00,
    projected_net_margin: 24.8,
    is_active: false
  },
  {
    model_id: 'MOD-CON-2026',
    name: 'FY2026 Conservative Scenario (Inflation Pressure +8%)',
    type: 'Conservative',
    revenue_growth_rate: 2.0,
    inflation_rate: 8.0,
    driver: 'Supply Chain Surcharges & Utility Tariff Increases',
    annual_projected_revenue: 710000.00,
    annual_projected_cogs: 260000.00,
    annual_projected_opex: 388000.00,
    projected_ebitda: 62000.00,
    projected_net_margin: 8.7,
    is_active: false
  }
];

/**
 * Topic 2: Account Reconciliation Initial Seed Data
 */
export const initialReconciliations = [
  {
    reconciliation_id: 'REC-2026-08-B1',
    bank_account_id: 'BANK-01',
    bank_name: 'Arab Bank Jordan (البنك العربي - JOD Operating)',
    account_number: '•••• 8912',
    gl_account_code: '10100',
    currency: 'JOD',
    statement_date: '2026-08-15',
    fiscal_period: '2026-08',
    statement_ending_balance: 318950.00,
    book_ending_balance: 316750.00,
    deposits_in_transit: 2400.00,
    outstanding_checks: 0.00,
    unrecorded_bank_charges: 200.00,
    adjusted_book_balance: 318950.00,
    unreconciled_difference: 0.00,
    status: 'RECONCILED',
    reviewer: 'Layla Salem (Certified Auditor)',
    reconciled_at: '2026-08-15T14:30:00Z',
    notes: 'Statement balance reconciled with GL. JOD 200 SWIFT bank charges adjusted via JV-2026-00413.'
  },
  {
    reconciliation_id: 'REC-2026-08-B2',
    bank_account_id: 'BANK-02',
    bank_name: 'Housing Bank for Trade & Finance (بنك الإسكان - Treasury)',
    account_number: '•••• 4419',
    gl_account_code: '10110',
    currency: 'JOD',
    statement_date: '2026-08-15',
    fiscal_period: '2026-08',
    statement_ending_balance: 110000.00,
    book_ending_balance: 110000.00,
    deposits_in_transit: 0.00,
    outstanding_checks: 0.00,
    unrecorded_bank_charges: 0.00,
    adjusted_book_balance: 110000.00,
    unreconciled_difference: 0.00,
    status: 'RECONCILED',
    reviewer: 'Layla Salem (Certified Auditor)',
    reconciled_at: '2026-08-15T15:00:00Z',
    notes: 'Zero variance. Clean treasury balance confirmed.'
  },
  {
    reconciliation_id: 'REC-2026-08-B3',
    bank_account_id: 'BANK-03',
    bank_name: 'Jordan Islamic Bank (البنك الإسلامي الأردني - Petty/Clearing)',
    account_number: '•••• 7701',
    gl_account_code: '10120',
    currency: 'JOD',
    statement_date: '2026-08-20',
    fiscal_period: '2026-08',
    statement_ending_balance: 45200.00,
    book_ending_balance: 43850.00,
    deposits_in_transit: 1800.00,
    outstanding_checks: 450.00,
    unrecorded_bank_charges: 0.00,
    adjusted_book_balance: 45200.00,
    unreconciled_difference: 0.00,
    status: 'PENDING_REVIEW',
    reviewer: 'Audit Bureau Inspector',
    reconciled_at: null,
    notes: 'Awaiting final controller sign-off for period-end closure.'
  }
];

export const initialUnmatchedBankTransactions = [
  {
    item_id: 'UNM-001',
    reconciliation_id: 'REC-2026-08-B1',
    date: '2026-08-14',
    source: 'Bank Statement',
    description: 'International SWIFT Wire Maintenance Fee',
    reference: 'SWIFT-CH-0982',
    amount: -200.00,
    suggested_gl_account: '66100',
    status: 'Adjusted_Via_GL',
    adjustment_jv_ref: 'JV-2026-00413'
  },
  {
    item_id: 'UNM-002',
    reconciliation_id: 'REC-2026-08-B1',
    date: '2026-08-15',
    source: 'General Ledger',
    description: 'Customer Counter Deposit — Walk-in Banquet Cash (JoPACC)',
    reference: 'RCP-2026-0089',
    amount: 2400.00,
    suggested_gl_account: '10100',
    status: 'Deposit_In_Transit',
    adjustment_jv_ref: null
  },
  {
    item_id: 'UNM-003',
    reconciliation_id: 'REC-2026-08-B3',
    date: '2026-08-18',
    source: 'Bank Statement',
    description: 'Direct POS Merchant Settlement Discount (1.2%)',
    reference: 'POS-ARB-4412',
    amount: -54.00,
    suggested_gl_account: '66100',
    status: 'Unmatched',
    adjustment_jv_ref: null
  },
  {
    item_id: 'UNM-004',
    reconciliation_id: 'REC-2026-08-B2',
    date: '2026-08-19',
    source: 'Bank Statement',
    description: 'Overnight Treasury Deposit Yield / Profit Share',
    reference: 'INT-HBTF-109',
    amount: 120.00,
    suggested_gl_account: '40100',
    status: 'Unmatched',
    adjustment_jv_ref: null
  }
];

export const initialReconciliationLogs = [
  { log_id: 'RLOG-2026-07', period: 'July 2026', bank_name: 'Arab Bank Jordan', ending_balance: 342100.00, verified_by: 'Sarah Nasser (CFO)', hash: '0x3e4f1a8c9b2d', status: 'LOCKED' },
  { log_id: 'RLOG-2026-06', period: 'June 2026', bank_name: 'Arab Bank Jordan', ending_balance: 298400.00, verified_by: 'Sarah Nasser (CFO)', hash: '0x7b1c8a4e9f3d', status: 'LOCKED' }
];

/**
 * Topic 4: Internal Controls & Approvals Initial Seed Data
 */
export const initialApprovalRequests = [
  {
    request_id: 'APR-2026-0081',
    title: 'Vendor Invoice Payment — Global Linens Co.',
    type: 'SUPPLIER_PAYMENT',
    source_ref: 'BILL-2026-0194',
    amount: 4850.00,
    currency: 'JOD',
    cost_center_code: 'CC-100',
    cost_center_name: 'Housekeeping',
    requester: 'Aisha Tariq (Housekeeping Lead)',
    submission_date: '2026-08-15 09:30',
    urgency: 'Normal',
    current_tier: 2,
    required_tiers: 2,
    status: 'PENDING',
    justification: 'Stock replenishment for 100x White Bath Towels matching PO-2026-001 & GRN-2026-004.',
    approval_chain: [
      { tier: 1, role: 'Department Head', approver_name: 'Aisha Tariq', status: 'APPROVED', timestamp: '2026-08-15 09:30', comment: 'Approved departmental receipt & physical verification.' },
      { tier: 2, role: 'Finance Manager', approver_name: 'Sarah Nasser', status: 'PENDING', timestamp: null, comment: 'Awaiting 3-Way matching verification & cash balance review.' }
    ]
  },
  {
    request_id: 'APR-2026-0082',
    title: 'Emergency Capex: Commercial Kitchen Walk-In Cooler Compressor Replacement',
    type: 'CAPEX_ACQUISITION',
    source_ref: 'PO-2026-011',
    amount: 14500.00,
    currency: 'JOD',
    cost_center_code: 'CC-200',
    cost_center_name: 'F&B Kitchen',
    requester: 'Chef Alex Morgan',
    submission_date: '2026-08-14 11:15',
    urgency: 'Critical',
    current_tier: 3,
    required_tiers: 3,
    status: 'PENDING',
    justification: 'Compressor breakdown in main storage freezer risking spoilage of perishable stock (JOD 35,000 inventory).',
    approval_chain: [
      { tier: 1, role: 'Department Head', approver_name: 'Chef Alex Morgan', status: 'APPROVED', timestamp: '2026-08-14 11:15', comment: 'Emergency kitchen requisition initiated.' },
      { tier: 2, role: 'Finance Manager', approver_name: 'Sarah Nasser', status: 'APPROVED', timestamp: '2026-08-14 13:40', comment: 'Capex budget verified against FY2026 emergency reserve.' },
      { tier: 3, role: 'CFO & Managing Director Dual Signatory', approver_name: 'Board Executive Signatories', status: 'PENDING', timestamp: null, comment: 'Commercial Register First Degree signatory required for > JOD 10,000.' }
    ]
  },
  {
    request_id: 'APR-2026-0083',
    title: 'Q3 Staff Overtime & Banquet Staffing Accrual',
    type: 'PAYROLL_OVERTIME',
    source_ref: 'PAY-2026-08-OT',
    amount: 3200.00,
    currency: 'JOD',
    cost_center_code: 'CC-400',
    cost_center_name: 'Front Office',
    requester: 'Layla Salem',
    submission_date: '2026-08-13 16:00',
    urgency: 'Normal',
    current_tier: 2,
    required_tiers: 2,
    status: 'APPROVED',
    justification: 'Official diplomatic delegation hosting overtime for front desk and guest services team.',
    approval_chain: [
      { tier: 1, role: 'Department Head', approver_name: 'Layla Salem', status: 'APPROVED', timestamp: '2026-08-13 16:00', comment: 'Approved based on signed biometric timesheets.' },
      { tier: 2, role: 'Finance Manager', approver_name: 'Sarah Nasser', status: 'APPROVED', timestamp: '2026-08-14 08:30', comment: 'Jordanian Labor Law overtime rates (125% regular / 150% holiday) confirmed.' }
    ]
  },
  {
    request_id: 'APR-2026-0084',
    title: 'Annual Cloud ERP & E-Invoicing Gateway License Renewal',
    type: 'IT_SUBSCRIPTION',
    source_ref: 'PO-2026-018',
    amount: 8500.00,
    currency: 'JOD',
    cost_center_code: 'CC-500',
    cost_center_name: 'IT & Security Systems',
    requester: 'Omar Sayed',
    submission_date: '2026-08-16 10:00',
    urgency: 'Normal',
    current_tier: 2,
    required_tiers: 2,
    status: 'PENDING',
    justification: 'Annual software subscription including ISTD Fawateer API connector maintenance.',
    approval_chain: [
      { tier: 1, role: 'Department Head', approver_name: 'Omar Sayed', status: 'APPROVED', timestamp: '2026-08-16 10:00', comment: 'IT operational renewal verified.' },
      { tier: 2, role: 'Finance Manager', approver_name: 'Sarah Nasser', status: 'PENDING', timestamp: null, comment: 'Budget allocation checked under CC-500.' }
    ]
  }
];

export const initialControlMatrix = [
  {
    control_id: 'CTRL-001',
    category: 'Supplier Payments & Operational Expenses',
    threshold_min: 0.00,
    threshold_max: 1000.00,
    required_role: 'Operations Lead / Senior Accountant (Tier 1)',
    required_tiers: 1,
    description: 'Single-tier approval for routine operational expenditures up to JOD 1,000.',
    is_active: true
  },
  {
    control_id: 'CTRL-002',
    category: 'Supplier Payments & Purchase Contracts',
    threshold_min: 1000.01,
    threshold_max: 10000.00,
    required_role: 'Finance Manager (Tier 2)',
    required_tiers: 2,
    description: 'Two-tier authorization requiring Department Head + Finance Manager approval.',
    is_active: true
  },
  {
    control_id: 'CTRL-003',
    category: 'Capital Expenditures (CAPEX) & Large Contracts',
    threshold_min: 10000.01,
    threshold_max: 1000000.00,
    required_role: 'CFO & Managing Director Dual Signatory (Tier 3)',
    required_tiers: 3,
    description: 'Three-tier dual authorization requiring First Degree Commercial Register signatories for amounts exceeding JOD 10,000.',
    is_active: true
  },
  {
    control_id: 'CTRL-004',
    category: 'Manual General Ledger Journal Vouchers',
    threshold_min: 5000.00,
    threshold_max: 999999.00,
    required_role: 'Senior Financial Controller',
    required_tiers: 2,
    description: 'Maker-Checker protocol: Creators of manual JVs cannot self-post without controller review.',
    is_active: true
  }
];

export const initialSodRules = [
  { rule_id: 'SOD-01', name: 'Vendor Master Creation vs AP Payment Release', status: 'Enforced', violations: 0, description: 'Staff authorized to register new vendors cannot approve payment disbursement to those vendors.' },
  { rule_id: 'SOD-02', name: 'Purchase Order Issuance vs Goods Receipt (GRN)', status: 'Enforced', violations: 0, description: 'Procurement officers issuing POs cannot sign physical GRN warehouse delivery receipts.' },
  { rule_id: 'SOD-03', name: 'Payroll Preparation vs Bank WPS Execution', status: 'Enforced', violations: 0, description: 'HR staff compiling payroll timesheets cannot execute bank wire disbursement files.' },
  { rule_id: 'SOD-04', name: 'Manual Journal Creation vs Period Closing Sign-off', status: 'Enforced', violations: 0, description: 'Junior accountants posting manual adjustment vouchers cannot execute period-end balance locking.' }
];

/**
 * Topic 5: Tender & Bid Auditing Initial Seed Data
 */
export const initialTenders = [
  {
    tender_id: 'TND-2026-001',
    reference_code: 'GTD-JOR-2026-042',
    title: 'Annual Supply of Luxury Hospitality Linens & Textiles',
    category: 'Supplies',
    procurement_method: 'Public Tender (GTD Standard)',
    budget_amount: 55000.00,
    currency: 'JOD',
    published_date: '2026-07-01',
    submission_deadline: '2026-08-10',
    status: 'Awarded',
    audit_compliance_score: 96.5,
    bid_count: 3,
    selected_bid_id: 'BID-001-B',
    selected_vendor: 'Jordan Modern Linens Manufacturing PLC',
    audit_summary: 'Complies with Jordanian Public Procurement Law No. 28/2019. Lowest evaluated compliant bidder with valid ISTD tax clearance and SSC registration.',
    bids: [
      {
        bid_id: 'BID-001-A',
        tender_id: 'TND-2026-001',
        vendor_name: 'Amman Textile Imports Ltd',
        vendor_crn: 'CRN-9948201',
        quoted_price: 58000.00,
        currency: 'JOD',
        technical_score: 86.0,
        financial_score: 88.0,
        weighted_score: 86.8,
        bid_bond_submitted: true,
        bid_bond_amount: 1740.00,
        issuing_bank: 'Arab Bank',
        tax_clearance_verified: true,
        ssc_compliance_verified: true,
        delivery_timeline_days: 20,
        warranty_months: 12,
        audit_status: 'PASSED',
        ranking: 3
      },
      {
        bid_id: 'BID-001-B',
        tender_id: 'TND-2026-001',
        vendor_name: 'Jordan Modern Linens Manufacturing PLC',
        vendor_crn: 'CRN-9932104',
        quoted_price: 52000.00,
        currency: 'JOD',
        technical_score: 94.0,
        financial_score: 98.0,
        weighted_score: 95.6,
        bid_bond_submitted: true,
        bid_bond_amount: 1560.00,
        issuing_bank: 'Housing Bank for Trade & Finance',
        tax_clearance_verified: true,
        ssc_compliance_verified: true,
        delivery_timeline_days: 14,
        warranty_months: 24,
        audit_status: 'AWARDED',
        ranking: 1
      },
      {
        bid_id: 'BID-001-C',
        tender_id: 'TND-2026-001',
        vendor_name: 'Middle East Hospitality Wholesale Co.',
        vendor_crn: 'CRN-9910542',
        quoted_price: 49000.00,
        currency: 'JOD',
        technical_score: 62.0,
        financial_score: 100.0,
        weighted_score: 77.2,
        bid_bond_submitted: false,
        bid_bond_amount: 0.00,
        issuing_bank: 'None',
        tax_clearance_verified: true,
        ssc_compliance_verified: false,
        delivery_timeline_days: 45,
        warranty_months: 6,
        audit_status: 'DISQUALIFIED',
        ranking: 0,
        disqualification_reason: 'Missing mandatory 3% GTD bank bid bond & expired SSC social security clearance.'
      }
    ]
  },
  {
    tender_id: 'TND-2026-002',
    reference_code: 'RFQ-JOR-2026-088',
    title: 'Kitchen Refrigeration & Industrial Chillers Annual Maintenance Contract',
    category: 'Services',
    procurement_method: 'Solicited Quotations (RFQ)',
    budget_amount: 18500.00,
    currency: 'JOD',
    published_date: '2026-07-20',
    submission_deadline: '2026-08-25',
    status: 'Under_Evaluation',
    audit_compliance_score: 89.0,
    bid_count: 2,
    selected_bid_id: null,
    selected_vendor: null,
    audit_summary: 'Under technical evaluation by engineering committee. Price-to-service matrix verification underway.',
    bids: [
      {
        bid_id: 'BID-002-A',
        tender_id: 'TND-2026-002',
        vendor_name: 'Amman Cold Engineering LLC',
        vendor_crn: 'CRN-8842109',
        quoted_price: 17200.00,
        currency: 'JOD',
        technical_score: 91.0,
        financial_score: 94.0,
        weighted_score: 92.2,
        bid_bond_submitted: true,
        bid_bond_amount: 516.00,
        issuing_bank: 'Bank al Etihad',
        tax_clearance_verified: true,
        ssc_compliance_verified: true,
        delivery_timeline_days: 7,
        warranty_months: 12,
        audit_status: 'PASSED',
        ranking: 1
      },
      {
        bid_id: 'BID-002-B',
        tender_id: 'TND-2026-002',
        vendor_name: 'National Thermal Systems Co.',
        vendor_crn: 'CRN-8819002',
        quoted_price: 18100.00,
        currency: 'JOD',
        technical_score: 84.0,
        financial_score: 89.0,
        weighted_score: 86.0,
        bid_bond_submitted: true,
        bid_bond_amount: 543.00,
        issuing_bank: 'Jordan Kuwait Bank',
        tax_clearance_verified: true,
        ssc_compliance_verified: true,
        delivery_timeline_days: 10,
        warranty_months: 12,
        audit_status: 'PASSED',
        ranking: 2
      }
    ]
  },
  {
    tender_id: 'TND-2026-003',
    reference_code: 'GTD-JOR-2026-105',
    title: 'Commercial Solar Photovoltaic Rooftop Grid System (150 kWp)',
    category: 'Works & Infrastructure',
    procurement_method: 'Central Public Tender (GTD Standard)',
    budget_amount: 95000.00,
    currency: 'JOD',
    published_date: '2026-08-01',
    submission_deadline: '2026-09-15',
    status: 'Bidding_Open',
    audit_compliance_score: 94.0,
    bid_count: 4,
    selected_bid_id: null,
    selected_vendor: null,
    audit_summary: 'Bids received and logged in sealed tender box. Financial opening scheduled following technical qualification.',
    bids: []
  }
];

export const initialProcurementThresholds = [
  {
    category: 'Direct Purchase (شراء مباشر)',
    threshold_limit_jod: 5000.00,
    approval_authority: 'Department Head & Purchasing Lead',
    requirements: 'Minimum 1 verified local supplier price quote; budgetary funds verification.'
  },
  {
    category: 'Solicited Quotations / Limited Tender (استدراج عروض)',
    threshold_limit_jod: 30000.00,
    approval_authority: 'Internal Procurement & Audit Committee',
    requirements: 'Minimum 3 sealed bids; 60/40 technical/financial scoring; valid SSC & ISTD certificates.'
  },
  {
    category: 'Central Public Tender (عطاء مركزي / GTD Standard)',
    threshold_limit_jod: 9999999.00,
    approval_authority: 'Managing Director & Board of Directors',
    requirements: 'Official gazette/portal publishing; 1-3% bank bid bond; 10% performance bond upon award.'
  }
];

export const initialBankGuarantees = [
  { guarantee_id: 'BG-2026-081', tender_ref: 'GTD-JOR-2026-042', type: 'Performance Bond (كفالة حسن تنفيذ)', vendor_name: 'Jordan Modern Linens Manufacturing PLC', amount: 5200.00, currency: 'JOD', bank: 'Housing Bank', expiry_date: '2027-08-15', status: 'Active' },
  { guarantee_id: 'BG-2026-082', tender_ref: 'RFQ-JOR-2026-088', type: 'Bid Bond (كفالة دخول عطاء)', vendor_name: 'Amman Cold Engineering LLC', amount: 516.00, currency: 'JOD', bank: 'Bank al Etihad', expiry_date: '2026-11-20', status: 'Active' },
  { guarantee_id: 'BG-2026-083', tender_ref: 'GTD-JOR-2026-042', type: 'Bid Bond (كفالة دخول عطاء)', vendor_name: 'Amman Textile Imports Ltd', amount: 1740.00, currency: 'JOD', bank: 'Arab Bank', expiry_date: '2026-10-10', status: 'Released' }
];

/**
 * Topic 6: Cash Flow Management Initial Seed Data
 */
export const initialCashFlowEntries = [
  { entry_id: 'CF-2026-08-01', date: '2026-08-14', type: 'INFLOW', category: 'OPERATING', sub_category: 'Customer AR Collection', amount: 16800.00, party_name: 'Al-Madina Trading LLC', reference: 'INV-2026-0412', bank_account_id: 'BANK-01', status: 'Cleared' },
  { entry_id: 'CF-2026-08-02', date: '2026-08-10', type: 'INFLOW', category: 'OPERATING', sub_category: 'Direct POS & Cash Sales', amount: 8400.00, party_name: 'Banquet & POS Cash Sales', reference: 'POS-2026-0810', bank_account_id: 'BANK-01', status: 'Cleared' },
  { entry_id: 'CF-2026-08-03', date: '2026-08-05', type: 'OUTFLOW', category: 'OPERATING', sub_category: 'Vendor AP Payment', amount: -340.00, party_name: 'CleanPro Solutions', reference: 'BILL-2026-0195', bank_account_id: 'BANK-01', status: 'Cleared' },
  { entry_id: 'CF-2026-08-04', date: '2026-08-28', type: 'OUTFLOW', category: 'OPERATING', sub_category: 'Workforce Payroll (WPS)', amount: -124200.00, party_name: 'Salaries & Staff Bank Accounts', reference: 'PAY-2026-08', bank_account_id: 'BANK-01', status: 'Projected' },
  { entry_id: 'CF-2026-08-05', date: '2026-09-05', type: 'OUTFLOW', category: 'INVESTING', sub_category: 'Commercial Equipment Capex', amount: -28000.00, party_name: 'Amman Cold Engineering LLC', reference: 'PO-2026-011', bank_account_id: 'BANK-01', status: 'Projected' },
  { entry_id: 'CF-2026-08-06', date: '2026-09-15', type: 'OUTFLOW', category: 'FINANCING', sub_category: 'Bank Term Debt Service', amount: -15000.00, party_name: 'Arab Bank Commercial Facility', reference: 'LOAN-FAC-01', bank_account_id: 'BANK-01', status: 'Projected' },
  { entry_id: 'CF-2026-08-07', date: '2026-08-21', type: 'OUTFLOW', category: 'OPERATING', sub_category: 'ISTD Sales Tax Remittance', amount: -18450.00, party_name: 'Jordan Income & Sales Tax Dept (ISTD)', reference: 'TAX-GST-Q2', bank_account_id: 'BANK-01', status: 'Projected' },
  { entry_id: 'CF-2026-08-08', date: '2026-09-10', type: 'OUTFLOW', category: 'OPERATING', sub_category: 'Social Security Remittance (SSC)', amount: -32300.00, party_name: 'Social Security Corporation (الضمان)', reference: 'SSC-CONTRIB-08', bank_account_id: 'BANK-01', status: 'Projected' }
];

export const initialLiquidityForecasts = [
  {
    period: 'Current (Aug 2026)',
    beginning_cash: 459550.00,
    expected_inflows: 142000.00,
    committed_outflows: 172540.00,
    net_cash_flow: -30540.00,
    projected_ending_cash: 428950.00,
    minimum_buffer_target: 150000.00,
    headroom: 278950.00,
    runway_months: 11.2,
    status: 'Healthy'
  },
  {
    period: 'Month +1 (Sep 2026)',
    beginning_cash: 428950.00,
    expected_inflows: 185000.00,
    committed_outflows: 152000.00,
    net_cash_flow: 33000.00,
    projected_ending_cash: 461950.00,
    minimum_buffer_target: 150000.00,
    headroom: 311950.00,
    runway_months: 12.0,
    status: 'Healthy'
  },
  {
    period: 'Month +2 (Oct 2026)',
    beginning_cash: 461950.00,
    expected_inflows: 195000.00,
    committed_outflows: 168000.00,
    net_cash_flow: 27000.00,
    projected_ending_cash: 488950.00,
    minimum_buffer_target: 150000.00,
    headroom: 338950.00,
    runway_months: 12.8,
    status: 'Healthy'
  },
  {
    period: 'Q4 2026 Projection',
    beginning_cash: 488950.00,
    expected_inflows: 610000.00,
    committed_outflows: 520000.00,
    net_cash_flow: 90000.00,
    projected_ending_cash: 578950.00,
    minimum_buffer_target: 150000.00,
    headroom: 428950.00,
    runway_months: 14.5,
    status: 'Healthy'
  }
];

export const initialWorkingCapital = {
  dso_days: 28.4,
  dpo_days: 34.2,
  dio_days: 41.5,
  cash_conversion_cycle_days: 35.7,
  quick_ratio: 1.82,
  current_ratio: 2.45,
  working_capital_amount: 395420.00
};

export const initialPdcPortfolio = [
  { pdc_id: 'PDC-IN-101', direction: 'INWARD', check_number: 'CHK-884012', party_name: 'Al-Madina Trading LLC', bank_name: 'Arab Bank', amount: 12500.00, currency: 'JOD', issue_date: '2026-07-15', due_date: '2026-08-30', status: 'In Vault' },
  { pdc_id: 'PDC-IN-102', direction: 'INWARD', check_number: 'CHK-991044', party_name: 'Crescent Hospitality Group', bank_name: 'Housing Bank', amount: 18000.00, currency: 'JOD', issue_date: '2026-07-25', due_date: '2026-09-15', status: 'In Vault' },
  { pdc_id: 'PDC-OUT-201', direction: 'OUTWARD', check_number: 'CHK-004129', party_name: 'Global Linens Co.', bank_name: 'Arab Bank', amount: 4850.00, currency: 'JOD', issue_date: '2026-08-10', due_date: '2026-09-01', status: 'Issued' },
  { pdc_id: 'PDC-OUT-202', direction: 'OUTWARD', check_number: 'CHK-004130', party_name: 'Amman Cold Engineering LLC', bank_name: 'Arab Bank', amount: 14500.00, currency: 'JOD', issue_date: '2026-08-15', due_date: '2026-09-20', status: 'Issued' }
];

/**
 * Topic 16: Financial Policies Initial Seed Data
 */
export const initialPolicies = [
  {
    policy_id: 'POL-001',
    code: 'POL-FIN-AUTH',
    title: 'Disbursement & Multi-Tier Payment Authorization Policy',
    category: 'Governance & Controls',
    version: 'v2.4',
    effective_date: '2026-01-01',
    review_cycle: 'Annual',
    next_review_date: '2026-12-31',
    compliance_status: 'Compliant',
    compliance_score: 98,
    mandatory_approvers: ['Finance Director', 'Managing Director'],
    statutory_law_ref: 'Jordan Commercial Code No. 12/1966 & Internal Control Directives',
    ifrs_standard_ref: 'IAS 1 Presentation of Financial Statements / IAS 7',
    policy_summary: 'Establishes 3-tier monetary authorization thresholds. All AP bill disbursements above JOD 1,000 require Finance Manager sign-off; disbursements exceeding JOD 10,000 require dual signature of Managing Director and CFO.',
    enforcement_rules: [
      { rule_code: 'R-AUTH-01', rule_name: 'Tier 1 Limit Check (JOD 0 - 1,000)', system_check: 'Automatic single sign-off check', automated: true },
      { rule_code: 'R-AUTH-02', rule_name: 'Tier 2 Limit Check (JOD 1,001 - 10,000)', system_check: 'Mandatory Finance Manager route', automated: true },
      { rule_code: 'R-AUTH-03', rule_name: 'Tier 3 Dual Signature (> JOD 10,000)', system_check: 'Executive dual-signature workflow', automated: true }
    ],
    active_exceptions: 0
  },
  {
    policy_id: 'POL-002',
    code: 'POL-TAX-GST',
    title: 'General Sales Tax (16%) & National E-Invoicing Compliance Mandate',
    category: 'Statutory Tax & Regulatory',
    version: 'v3.0',
    effective_date: '2026-01-01',
    review_cycle: 'Semi-Annual',
    next_review_date: '2026-09-30',
    compliance_status: 'Compliant',
    compliance_score: 100,
    mandatory_approvers: ['Tax Compliance Officer', 'Chief Accountant'],
    statutory_law_ref: 'Jordan ISTD Law No. 34/2014 & National E-Invoicing By-Law No. 13/2023',
    ifrs_standard_ref: 'IFRS 15 Revenue from Contracts with Customers',
    policy_summary: 'Requires mandatory application of 16% standard GST on all taxable transactions unless statutory 0% or reduced exemption certificate is registered. Mandates integration with Jordan ISTD National E-Invoicing System (Fawateer).',
    enforcement_rules: [
      { rule_code: 'R-TAX-01', rule_name: 'GST Rate Validation (16%)', system_check: 'Automated tax engine line calculation', automated: true },
      { rule_code: 'R-TAX-02', rule_name: 'E-Invoice QR & Hash Generation', system_check: 'ISTD JSON payload validation', automated: true }
    ],
    active_exceptions: 0
  },
  {
    policy_id: 'POL-003',
    code: 'POL-PAY-SSC',
    title: 'Workforce Social Security (21.75%) & Income Tax Withholding Rules',
    category: 'Payroll & Workforce',
    version: 'v2.1',
    effective_date: '2026-01-01',
    review_cycle: 'Annual',
    next_review_date: '2026-12-31',
    compliance_status: 'Compliant',
    compliance_score: 95,
    mandatory_approvers: ['HR Director', 'Finance Manager'],
    statutory_law_ref: 'Jordan Social Security Law No. 1/2014 (SSC) & Income Tax Law No. 34/2014',
    ifrs_standard_ref: 'IAS 19 Employee Benefits',
    policy_summary: 'Regulates monthly 21.75% social security deductions (14.25% Employer contribution + 7.50% Employee contribution) and progressive natural-person income tax brackets (5% to 30%). Mandates WPS electronic wage issuance.',
    enforcement_rules: [
      { rule_code: 'R-SSC-01', rule_name: 'SSC 21.75% Split Verification', system_check: 'Automated payroll deduction calculation', automated: true },
      { rule_code: 'R-WPS-02', rule_name: 'WPS SIF File Structure Validation', system_check: 'Electronic file format check prior to disbursement', automated: true }
    ],
    active_exceptions: 0
  },
  {
    policy_id: 'POL-004',
    code: 'POL-AST-CAP',
    title: 'Fixed Asset Capitalization (JOD 300 Threshold) & Depreciation Policy',
    category: 'Asset Management',
    version: 'v2.0',
    effective_date: '2026-01-01',
    review_cycle: 'Annual',
    next_review_date: '2026-12-31',
    compliance_status: 'Compliant',
    compliance_score: 97,
    mandatory_approvers: ['Finance Manager', 'Operations Lead'],
    statutory_law_ref: 'Jordan Income Tax Depreciation Regulations / IFRS IAS 16',
    ifrs_standard_ref: 'IAS 16 Property, Plant and Equipment',
    policy_summary: 'Sets minimum asset capitalization threshold at JOD 300 with useful life > 1 year. Defines straight-line depreciation rates: Buildings 4%, Machinery 15%, Vehicles 15%, IT Hardware & Software 20%, Hospitality Equipment 10%.',
    enforcement_rules: [
      { rule_code: 'R-CAP-01', rule_name: 'JOD 300 Capex Capitalization Filter', system_check: 'Automated PO routing', automated: true },
      { rule_code: 'R-DEP-02', rule_name: 'Straight-Line Depreciation Engine', system_check: 'Monthly automatic GL posting', automated: true }
    ],
    active_exceptions: 0
  },
  {
    policy_id: 'POL-005',
    code: 'POL-INV-COST',
    title: 'Inventory Costing Method (AVCO) & Net Realizable Value Testing',
    category: 'Inventory & Operations',
    version: 'v2.2',
    effective_date: '2026-01-01',
    review_cycle: 'Annual',
    next_review_date: '2026-12-31',
    compliance_status: 'Compliant',
    compliance_score: 99,
    mandatory_approvers: ['Inventory Controller', 'Chief Accountant'],
    statutory_law_ref: 'Jordan Commercial Registry Directives / IAS 2',
    ifrs_standard_ref: 'IAS 2 Inventories',
    policy_summary: 'Mandates Weighted Average Costing (AVCO) as standard valuation method. Requires semi-annual physical stock count and lower-of-cost-and-net-realizable-value (NRV) testing.',
    enforcement_rules: [
      { rule_code: 'R-INV-01', rule_name: 'Moving Average Cost Re-computation', system_check: 'Triggered on each GRN receipt', automated: true },
      { rule_code: 'R-INV-02', rule_name: 'Stock Count Variance Threshold (0.5%)', system_check: 'Variance adjustment alert', automated: true }
    ],
    active_exceptions: 0
  },
  {
    policy_id: 'POL-006',
    code: 'POL-PROC-TND',
    title: 'Public Procurement & Tender Bank Guarantees Governance',
    category: 'Procurement & Tendering',
    version: 'v3.1',
    effective_date: '2026-01-01',
    review_cycle: 'Annual',
    next_review_date: '2026-12-31',
    compliance_status: 'Compliant',
    compliance_score: 96,
    mandatory_approvers: ['Tender Committee Chair', 'Legal Counsel'],
    statutory_law_ref: 'Jordan Public Procurement Law No. 28/2019 & GTD Regulations',
    ifrs_standard_ref: 'Public Procurement Governance Standards',
    policy_summary: 'Governs procurement limits: Direct (< JOD 5k), Limited (JOD 5k - 30k), Central Public Tender (> JOD 30k). Requires 1-3% bid bonds, 10% performance bonds, and 60/40 technical/financial scoring.',
    enforcement_rules: [
      { rule_code: 'R-TND-01', rule_name: 'Bank Guarantee Expiry Monitoring', system_check: '30-day early alert before expiration', automated: true },
      { rule_code: 'R-TND-02', rule_name: 'SSC & Tax Clearance Verification', system_check: 'Mandatory attachment check before bid opening', automated: true }
    ],
    active_exceptions: 0
  }
];

export const initialRegulatoryReferences = [
  { rule_id: 'REG-01', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'General Sales Tax (GST) Standard Rate', rate: '16.0%', law_ref: 'General Sales Tax Law No. 6/1994 & Amendments', effective_date: 'Active', category: 'Taxation' },
  { rule_id: 'REG-02', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'Corporate Income Tax — Commercial & Services', rate: '20.0%', law_ref: 'Income Tax Law No. 34/2014 (Article 11)', effective_date: 'Active', category: 'Taxation' },
  { rule_id: 'REG-03', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'Corporate Income Tax — Industrial Sector', rate: '14.0%', law_ref: 'Income Tax Law No. 34/2014', effective_date: 'Active', category: 'Taxation' },
  { rule_id: 'REG-04', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'Corporate Income Tax — Banking Sector', rate: '35.0%', law_ref: 'Income Tax Law No. 34/2014', effective_date: 'Active', category: 'Taxation' },
  { rule_id: 'REG-05', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'National Contribution Surtax (المساهمة الوطنية)', rate: '1.0% - 7.0%', law_ref: 'Income Tax Law No. 34/2014 (Article 11/D)', effective_date: 'Active', category: 'Taxation' },
  { rule_id: 'REG-06', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'Resident Professional Services Withholding Tax', rate: '5.0%', law_ref: 'Income Tax Law No. 34/2014 (Article 12)', effective_date: 'Active', category: 'Withholding' },
  { rule_id: 'REG-07', authority: 'Social Security Corporation (المؤسسة العامة للضمان الاجتماعي)', regulation: 'Workforce Social Security Total Contribution', rate: '21.75%', law_ref: 'Social Security Law No. 1/2014 (14.25% Employer + 7.50% Employee)', effective_date: 'Active', category: 'Labor & Social Security' },
  { rule_id: 'REG-08', authority: 'Government Tenders Directorate (دائرة العطاءات الحكومية)', regulation: 'Jordan Public Procurement Thresholds & Bonds', rate: '10% Performance / 1-3% Bid', law_ref: 'Public Procurement Law No. 28/2019 & By-Law No. 8/2022', effective_date: 'Active', category: 'Procurement' },
  { rule_id: 'REG-09', authority: 'Jordan ISTD (دائرة ضريبة الدخل والمبيعات)', regulation: 'National E-Invoicing System (Fawateer / نظام الفوترة الوطني)', rate: 'Mandatory', law_ref: 'Executive By-Law No. 13/2023 for E-Invoicing', effective_date: 'Active', category: 'E-Invoicing' }
];


// ==========================================
// PROVIDER COMPONENT
// ==========================================

export function FinanceProvider({ children }) {
  // Consume operational master data from InventoryContext
  const { inventory, logs, processBatchTransaction } = useInventory();

  // Core Financial States
  const [accounts, setAccounts] = useState(initialAccounts);
  const [journalEntries, setJournalEntries] = useState(initialJournalEntries);
  const [threeWayMatches, setThreeWayMatches] = useState(initialThreeWayMatches);
  const [bills, setBills] = useState(initialBills);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [parties, setParties] = useState(initialParties);
  const [valuationRules, setValuationRules] = useState(initialValuationRules);
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [fixedAssets, setFixedAssets] = useState(initialFixedAssets);
  const [depreciationRuns, setDepreciationRuns] = useState(initialDepreciationRuns);
  const [payrollRecords, setPayrollRecords] = useState(initialPayrollRecords);
  const [vatFiling, setVatFiling] = useState(initialVatFiling);
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [bankTransactions, setBankTransactions] = useState(initialBankTransactions);
  const [auditLog, setAuditLog] = useState(initialAuditLog);

  // New Jordanian Financial Module States
  const [budgets, setBudgets] = useState(initialBudgets);
  const [forecastModels, setForecastModels] = useState(initialForecastModels);
  const [reconciliations, setReconciliations] = useState(initialReconciliations);
  const [unmatchedBankTransactions, setUnmatchedBankTransactions] = useState(initialUnmatchedBankTransactions);
  const [reconciliationLogs, setReconciliationLogs] = useState(initialReconciliationLogs);
  const [approvalRequests, setApprovalRequests] = useState(initialApprovalRequests);
  const [controlMatrix, setControlMatrix] = useState(initialControlMatrix);
  const [sodRules, setSodRules] = useState(initialSodRules);
  const [tenders, setTenders] = useState(initialTenders);
  const [procurementThresholds, setProcurementThresholds] = useState(initialProcurementThresholds);
  const [bankGuarantees, setBankGuarantees] = useState(initialBankGuarantees);
  const [cashFlowEntries, setCashFlowEntries] = useState(initialCashFlowEntries);
  const [liquidityForecasts, setLiquidityForecasts] = useState(initialLiquidityForecasts);
  const [workingCapitalMetrics, setWorkingCapitalMetrics] = useState(initialWorkingCapital);
  const [pdcPortfolio, setPdcPortfolio] = useState(initialPdcPortfolio);
  const [policies, setPolicies] = useState(initialPolicies);
  const [regulatoryReferences, setRegulatoryReferences] = useState(initialRegulatoryReferences);

  // Track processed inventory transaction IDs to avoid duplicate automatic GL postings
  const processedTxnIdsRef = useRef(new Set(logs ? logs.map(l => l.id) : []));

  // Sequence Counters
  const seqCounters = useRef({
    jv: 413,
    bill: 198,
    inv: 415,
    match: 4,
    req: 82,
    pty: 103,
    aud: 9983
  });

  // Helper to lookup account by code or category
  const getCategoryAssetAccount = (category) => {
    const rule = valuationRules.find(r => r.category.toLowerCase() === (category || '').toLowerCase());
    return rule ? rule.inventory_asset_account : '13110';
  };

  const getCategoryCogsAccount = (category) => {
    const rule = valuationRules.find(r => r.category.toLowerCase() === (category || '').toLowerCase());
    return rule ? rule.cogs_account : '50110';
  };

  const getCostCenterExpenseAccount = (costCenterCode) => {
    const cc = costCenters.find(c => c.code === costCenterCode);
    return cc ? cc.gl_expense_account : '61200';
  };

  // ==========================================
  // AUTOMATED DOUBLE-ENTRY GL POSTING GENERATOR
  // Synchronizes physical warehouse movements into balanced GL journal entries in real-time
  // ==========================================
  useEffect(() => {
    if (!logs || logs.length === 0) return;

    // Find any new unprocessed logs
    const newLogs = logs.filter(l => !processedTxnIdsRef.current.has(l.id));
    if (newLogs.length === 0) return;

    newLogs.forEach(txn => {
      processedTxnIdsRef.current.add(txn.id);

      // Compute total line value and breakdown by category
      let totalAmount = 0;
      const categoryTotals = {};

      (txn.items || []).forEach(item => {
        const invItem = (inventory || []).find(i => i.sku === item.sku);
        const unitCost = invItem ? invItem.unitCost : (item.unitCost || 10.00);
        const itemCategory = invItem ? invItem.category : 'Linens';
        const lineTotal = (item.qty || 0) * unitCost;

        totalAmount += lineTotal;
        categoryTotals[itemCategory] = (categoryTotals[itemCategory] || 0) + lineTotal;
      });

      if (totalAmount <= 0) return;

      const currentYear = new Date().getFullYear();
      const voucherNum = `JV-${currentYear}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
      const nowIso = new Date().toISOString();
      const today = nowIso.split('T')[0];

      let newVoucher = null;

      if (txn.type === 'Receive') {
        // DR: Inventory Asset accounts (by Category)
        // CR: GR/IR Interim Clearing Liability (20200)
        const debitLines = Object.entries(categoryTotals).map(([cat, val], idx) => {
          const accCode = getCategoryAssetAccount(cat);
          const acc = accounts.find(a => a.account_code === accCode);
          return {
            line_id: `JVL-${idx + 1}`,
            account_id: acc ? acc.account_id : `ACC-${accCode}`,
            account_code: accCode,
            account_name: acc ? acc.account_name : `Inventory Asset – ${cat}`,
            cost_center_code: null,
            debit_amount: parseFloat(val.toFixed(2)),
            credit_amount: 0.00,
            description: `Auto-GL: Stock receipt (${cat}) from ${txn.from || 'Supplier'}`
          };
        });

        const creditLine = {
          line_id: `JVL-${debitLines.length + 1}`,
          account_id: 'ACC-20200',
          account_code: '20200',
          account_name: 'GR/IR Interim Clearing',
          cost_center_code: null,
          debit_amount: 0.00,
          credit_amount: parseFloat(totalAmount.toFixed(2)),
          description: `Auto-GL: Accrued liability for GRN / ${txn.id}`
        };

        newVoucher = {
          journal_id: voucherNum,
          voucher_number: voucherNum,
          posting_date: today,
          fiscal_period: today.slice(0, 7),
          voucher_type: 'INVENTORY',
          reference_number: txn.id,
          memo: `Auto-GL Goods Receipt — ${txn.from || 'Warehouse'} (${(txn.items || []).map(i => `${i.qty}x ${i.name || i.sku}`).join(', ')})`,
          currency_code: 'USD',
          exchange_rate: 1.0000,
          total_debit: parseFloat(totalAmount.toFixed(2)),
          total_credit: parseFloat(totalAmount.toFixed(2)),
          status: 'Posted',
          posted_by: 'System (Auto-GL)',
          posted_at: nowIso,
          lines: [...debitLines, creditLine]
        };
      } else if (txn.type === 'Issue') {
        // DR: Department Expense account (by Cost Center)
        // CR: Inventory Asset accounts (by Category)
        const ccCode = (txn.to && txn.to.includes('CC-'))
          ? txn.to.match(/CC-\d+/)[0]
          : (txn.to && txn.to.toLowerCase().includes('kitchen') ? 'CC-200' : 'CC-100');
        const expenseAccCode = getCostCenterExpenseAccount(ccCode);
        const expAcc = accounts.find(a => a.account_code === expenseAccCode);

        const debitLine = {
          line_id: 'JVL-1',
          account_id: expAcc ? expAcc.account_id : `ACC-${expenseAccCode}`,
          account_code: expenseAccCode,
          account_name: expAcc ? expAcc.account_name : 'Departmental Consumption Expense',
          cost_center_code: ccCode,
          debit_amount: parseFloat(totalAmount.toFixed(2)),
          credit_amount: 0.00,
          description: `Auto-GL: Stock issue to ${txn.to || ccCode}`
        };

        const creditLines = Object.entries(categoryTotals).map(([cat, val], idx) => {
          const accCode = getCategoryAssetAccount(cat);
          const acc = accounts.find(a => a.account_code === accCode);
          return {
            line_id: `JVL-${idx + 2}`,
            account_id: acc ? acc.account_id : `ACC-${accCode}`,
            account_code: accCode,
            account_name: acc ? acc.account_name : `Inventory Asset – ${cat}`,
            cost_center_code: null,
            debit_amount: 0.00,
            credit_amount: parseFloat(val.toFixed(2)),
            description: `Auto-GL: Relieve inventory for ${cat}`
          };
        });

        newVoucher = {
          journal_id: voucherNum,
          voucher_number: voucherNum,
          posting_date: today,
          fiscal_period: today.slice(0, 7),
          voucher_type: 'INVENTORY',
          reference_number: txn.id,
          memo: `Auto-GL Stock Issue — ${txn.to || 'Department'} (${(txn.items || []).map(i => `${i.qty}x ${i.name || i.sku}`).join(', ')})`,
          currency_code: 'USD',
          exchange_rate: 1.0000,
          total_debit: parseFloat(totalAmount.toFixed(2)),
          total_credit: parseFloat(totalAmount.toFixed(2)),
          status: 'Posted',
          posted_by: 'System (Auto-GL)',
          posted_at: nowIso,
          lines: [debitLine, ...creditLines]
        };

        // Update cost center actual spending
        setCostCenters(prev => prev.map(cc => {
          if (cc.code === ccCode) {
            const newSpent = cc.actual_spent + totalAmount;
            return {
              ...cc,
              actual_spent: parseFloat(newSpent.toFixed(2)),
              utilization_percent: parseFloat(((newSpent / cc.monthly_budget) * 100).toFixed(1)),
              is_over_budget: newSpent > cc.monthly_budget
            };
          }
          return cc;
        }));
      } else if (txn.type === 'Return') {
        // DR: Inventory Asset accounts (by Category)
        // CR: Department Expense account
        const ccCode = (txn.from && txn.from.includes('CC-'))
          ? txn.from.match(/CC-\d+/)[0]
          : (txn.from && txn.from.toLowerCase().includes('kitchen') ? 'CC-200' : 'CC-100');
        const expenseAccCode = getCostCenterExpenseAccount(ccCode);
        const expAcc = accounts.find(a => a.account_code === expenseAccCode);

        const debitLines = Object.entries(categoryTotals).map(([cat, val], idx) => {
          const accCode = getCategoryAssetAccount(cat);
          const acc = accounts.find(a => a.account_code === accCode);
          return {
            line_id: `JVL-${idx + 1}`,
            account_id: acc ? acc.account_id : `ACC-${accCode}`,
            account_code: accCode,
            account_name: acc ? acc.account_name : `Inventory Asset – ${cat}`,
            cost_center_code: null,
            debit_amount: parseFloat(val.toFixed(2)),
            credit_amount: 0.00,
            description: `Auto-GL: Stock return to ${cat}`
          };
        });

        const creditLine = {
          line_id: `JVL-${debitLines.length + 1}`,
          account_id: expAcc ? expAcc.account_id : `ACC-${expenseAccCode}`,
          account_code: expenseAccCode,
          account_name: expAcc ? expAcc.account_name : 'Departmental Consumption Expense',
          cost_center_code: ccCode,
          debit_amount: 0.00,
          credit_amount: parseFloat(totalAmount.toFixed(2)),
          description: `Auto-GL: Reverse departmental expense for return from ${txn.from || ccCode}`
        };

        newVoucher = {
          journal_id: voucherNum,
          voucher_number: voucherNum,
          posting_date: today,
          fiscal_period: today.slice(0, 7),
          voucher_type: 'INVENTORY',
          reference_number: txn.id,
          memo: `Auto-GL Stock Return — ${txn.from || 'Department'} (${(txn.items || []).map(i => `${i.qty}x ${i.name || i.sku}`).join(', ')})`,
          currency_code: 'USD',
          exchange_rate: 1.0000,
          total_debit: parseFloat(totalAmount.toFixed(2)),
          total_credit: parseFloat(totalAmount.toFixed(2)),
          status: 'Posted',
          posted_by: 'System (Auto-GL)',
          posted_at: nowIso,
          lines: [...debitLines, creditLine]
        };
      }

      if (newVoucher) {
        setJournalEntries(prev => [newVoucher, ...prev]);

        // Post to Chart of Accounts balances
        setAccounts(prev => prev.map(acc => {
          let delta = 0;
          newVoucher.lines.forEach(l => {
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
        }));

        // Log to Audit Trail
        const auditEntry = {
          audit_id: `AUD-${seqCounters.current.aud++}`,
          timestamp: nowIso,
          action_type: `AUTO_GL_${txn.type.toUpperCase()}`,
          source_module: 'INVENTORY',
          document_ref: txn.id,
          voucher_number: newVoucher.voucher_number,
          agent: 'System (Auto-GL)',
          verification_hash: `0x${Math.random().toString(16).slice(2, 10)}`
        };
        setAuditLog(prev => [auditEntry, ...prev]);
      }
    });
  }, [logs, inventory, valuationRules, accounts, costCenters]);


  // ==========================================
  // ACTION METHODS & MUTATORS
  // ==========================================

  /**
   * Post a General Ledger Journal Entry (or create & post)
   */
  const postJournalEntry = (entryOrVoucherNumber) => {
    if (typeof entryOrVoucherNumber === 'string') {
      // Mark an existing draft voucher as posted
      setJournalEntries(prev => prev.map(jv => {
        if (jv.voucher_number === entryOrVoucherNumber || jv.journal_id === entryOrVoucherNumber) {
          return { ...jv, status: 'Posted', posted_at: new Date().toISOString() };
        }
        return jv;
      }));
      return;
    }

    const entry = entryOrVoucherNumber;
    if (!entry) return;

    const totalDebit = entry.lines ? entry.lines.reduce((s, l) => s + (l.debit_amount || l.debit || 0), 0) : (entry.total_debit || 0);
    const totalCredit = entry.lines ? entry.lines.reduce((s, l) => s + (l.credit_amount || l.credit || 0), 0) : (entry.total_credit || 0);

    const voucherNum = entry.voucher_number || `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const formattedVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: entry.posting_date || today,
      fiscal_period: entry.fiscal_period || today.slice(0, 7),
      voucher_type: entry.voucher_type || entry.source || 'MANUAL',
      reference_number: entry.reference_number || entry.ref || 'MAN-ENTRY',
      memo: entry.memo || 'Manual Journal Voucher',
      currency_code: entry.currency_code || 'USD',
      exchange_rate: entry.exchange_rate || 1.0000,
      total_debit: parseFloat(totalDebit.toFixed(2)),
      total_credit: parseFloat(totalCredit.toFixed(2)),
      status: entry.status || 'Posted',
      posted_by: entry.posted_by || 'Current User',
      posted_at: nowIso,
      lines: (entry.lines || []).map((l, i) => ({
        line_id: l.line_id || `JVL-${i + 1}`,
        account_id: l.account_id || `ACC-${l.account_code}`,
        account_code: l.account_code,
        account_name: l.account_name || (accounts.find(a => a.account_code === l.account_code)?.account_name || ''),
        cost_center_code: l.cost_center_code || null,
        debit_amount: parseFloat((l.debit_amount || l.debit || 0).toFixed(2)),
        credit_amount: parseFloat((l.credit_amount || l.credit || 0).toFixed(2)),
        description: l.description || entry.memo || ''
      }))
    };

    setJournalEntries(prev => [formattedVoucher, ...prev]);

    // Update account balances if posted
    if (formattedVoucher.status === 'Posted') {
      setAccounts(prev => prev.map(acc => {
        let delta = 0;
        formattedVoucher.lines.forEach(l => {
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
      }));
    }

    const auditEntry = {
      audit_id: `AUD-${seqCounters.current.aud++}`,
      timestamp: nowIso,
      action_type: 'POST_JOURNAL_ENTRY',
      source_module: formattedVoucher.voucher_type,
      document_ref: formattedVoucher.reference_number,
      voucher_number: formattedVoucher.voucher_number,
      agent: formattedVoucher.posted_by,
      verification_hash: `0x${Math.random().toString(16).slice(2, 10)}`
    };
    setAuditLog(prev => [auditEntry, ...prev]);

    return formattedVoucher;
  };

  /**
   * Reverse an existing journal entry
   */
  const reverseJournalEntry = (voucherNumber, reason = 'Reversal requested') => {
    const original = journalEntries.find(j => j.voucher_number === voucherNumber || j.journal_id === voucherNumber);
    if (!original) return;

    const reverseNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const reversedLines = original.lines.map((l, i) => ({
      line_id: `JVL-REV-${i + 1}`,
      account_id: l.account_id,
      account_code: l.account_code,
      account_name: l.account_name,
      cost_center_code: l.cost_center_code,
      debit_amount: l.credit_amount,
      credit_amount: l.debit_amount,
      description: `Reversal of ${original.voucher_number}: ${reason}`
    }));

    const reversalVoucher = {
      journal_id: reverseNum,
      voucher_number: reverseNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: original.voucher_type,
      reference_number: original.voucher_number,
      memo: `Reversal: ${original.memo} (${reason})`,
      currency_code: original.currency_code,
      exchange_rate: original.exchange_rate,
      total_debit: original.total_credit,
      total_credit: original.total_debit,
      status: 'Posted',
      posted_by: 'Current User',
      posted_at: nowIso,
      lines: reversedLines
    };

    setJournalEntries(prev => [
      reversalVoucher,
      ...prev.map(j => (j.voucher_number === voucherNumber ? { ...j, status: 'Reversed' } : j))
    ]);

    // Update account balances
    setAccounts(prev => prev.map(acc => {
      let delta = 0;
      reversedLines.forEach(l => {
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
    }));
  };

  /**
   * Run 3-Way Match Reconciler
   */
  const runThreeWayMatch = (poId, grnId, billId) => {
    const bill = bills.find(b => b.bill_number === billId || b.bill_id === billId || b.id === billId);
    const vendorName = bill ? bill.vendor_name : 'Global Linens Co.';
    const poUnitCost = 12.50;
    const billUnitCost = bill ? (bill.subtotal_amount / 100) : 13.00;
    const poQty = 100;
    const grnQty = 100;
    const billQty = 100;

    const ppvAmount = (billUnitCost - poUnitCost) * billQty;
    const ppvPercent = poUnitCost > 0 ? ((billUnitCost - poUnitCost) / poUnitCost) * 100 : 0;
    const tolerance = 2.0;

    let status = 'MATCHED';
    let actionRequired = 'Auto-Matched and Approved';

    if (poQty !== grnQty || grnQty !== billQty) {
      status = 'QTY_HOLD';
      actionRequired = 'Quantity discrepancy across PO, GRN and Bill';
    } else if (Math.abs(ppvPercent) > tolerance) {
      status = 'PPV_HOLD';
      actionRequired = `PPV variance (${ppvPercent.toFixed(1)}%) exceeds ${tolerance}% tolerance limit`;
    }

    const matchRecord = {
      match_id: `MTH-${String(seqCounters.current.match++).padStart(3, '0')}`,
      id: `MTH-${String(seqCounters.current.match).padStart(3, '0')}`,
      po_ref: poId || 'PO-2026-001',
      grn_ref: grnId || 'GRN-2026-004',
      bill_ref: billId || (bill ? bill.bill_number : 'BILL-2026-0194'),
      vendor_name: vendorName,
      vendor_id: bill ? bill.vendor_id : 'PTY-00042',
      sku: 'LIN-001',
      po_qty: poQty,
      grn_qty: grnQty,
      bill_qty: billQty,
      po_unit_price: poUnitCost,
      bill_unit_price: billUnitCost,
      ppv_amount: parseFloat(ppvAmount.toFixed(2)),
      ppv_variance_percent: parseFloat(ppvPercent.toFixed(1)),
      tolerance_percent: tolerance,
      status,
      action_required: actionRequired,
      matched_at: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
    };

    setThreeWayMatches(prev => [matchRecord, ...prev]);

    if (bill) {
      setBills(prev => prev.map(b => (b.bill_id === bill.bill_id ? { ...b, match_status: status } : b)));
    }

    return matchRecord;
  };

  /**
   * Run Auto-Match on all open bills
   */
  const runAutoMatch = () => {
    bills.forEach(bill => {
      if (bill.match_status === 'OPEN' || !bill.match_status) {
        runThreeWayMatch(bill.po_reference, bill.grn_reference, bill.bill_number);
      }
    });
  };

  /**
   * Create Accounts Payable Vendor Bill
   */
  const createBill = (billData) => {
    const billNum = billData.bill_number || `BILL-2026-${String(seqCounters.current.bill++).padStart(4, '0')}`;
    const subtotal = parseFloat(billData.subtotal_amount || billData.subtotal || 0);
    const taxRate = billData.tax_rate !== undefined ? billData.tax_rate : 0.05;
    const taxAmount = billData.tax_amount !== undefined ? parseFloat(billData.tax_amount) : parseFloat((subtotal * taxRate).toFixed(2));
    const landed = parseFloat(billData.landed_costs || billData.landed_cost || 0);
    const total = parseFloat((subtotal + taxAmount + landed).toFixed(2));

    const today = new Date().toISOString().split('T')[0];
    const dueDate = billData.due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const newBill = {
      bill_id: billNum,
      id: billNum,
      bill_number: billNum,
      vendor_id: billData.vendor_id || 'PTY-00042',
      vendor_name: billData.vendor_name || 'Global Linens Co.',
      po_reference: billData.po_reference || 'PO-2026-001',
      grn_reference: billData.grn_reference || 'GRN-2026-004',
      bill_date: billData.bill_date || today,
      due_date: dueDate,
      payment_terms: billData.payment_terms || 'Net 15',
      subtotal_amount: subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      landed_costs: landed,
      total_amount: total,
      paid_amount: 0.00,
      balance_due: total,
      match_status: billData.match_status || 'MATCHED',
      payment_status: 'OPEN',
      journal_entry_id: null
    };

    // Auto-generate AP Journal Voucher
    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const apVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'AP',
      reference_number: billNum,
      memo: `AP Bill Ingestion — ${newBill.vendor_name} (${newBill.po_reference})`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: total,
      total_credit: total,
      status: 'Posted',
      posted_by: 'AP System',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-20200', account_code: '20200', account_name: 'GR/IR Interim Clearing', cost_center_code: null, debit_amount: subtotal, credit_amount: 0.00, description: `Clear GR/IR for ${newBill.po_reference}` },
        { line_id: 'JVL-2', account_id: 'ACC-13900', account_code: '13900', account_name: 'Input VAT Recoverable (5%)', cost_center_code: null, debit_amount: taxAmount, credit_amount: 0.00, description: `5% Input VAT on ${billNum}` },
        ...(landed > 0 ? [{ line_id: 'JVL-3', account_id: 'ACC-13110', account_code: '13110', account_name: 'Inventory Asset – Landed Cost', cost_center_code: null, debit_amount: landed, credit_amount: 0.00, description: `Landed freight/customs for ${billNum}` }] : []),
        { line_id: 'JVL-4', account_id: 'ACC-21010', account_code: '21010', account_name: 'Trade Accounts Payable Control', cost_center_code: null, debit_amount: 0.00, credit_amount: total, description: `Payable liability to ${newBill.vendor_name}` }
      ]
    };

    newBill.journal_entry_id = voucherNum;

    setBills(prev => [newBill, ...prev]);
    postJournalEntry(apVoucher);

    // Update Vendor AP Balance in Party Directory
    setParties(prev => prev.map(p => {
      if (p.party_id === newBill.vendor_id || p.name === newBill.vendor_name) {
        const newAp = p.ap_balance + total;
        return { ...p, ap_balance: parseFloat(newAp.toFixed(2)), net_position: parseFloat(((p.ar_balance || 0) - newAp).toFixed(2)) };
      }
      return p;
    }));

    return newBill;
  };

  /**
   * Pay Vendor Bill
   */
  const payBill = (billId, paymentData = {}) => {
    const bill = bills.find(b => b.bill_id === billId || b.bill_number === billId || b.id === billId);
    if (!bill) return;

    const amount = parseFloat(paymentData.amount || bill.balance_due);
    const newPaid = parseFloat((bill.paid_amount + amount).toFixed(2));
    const newBalance = parseFloat(Math.max(0, bill.total_amount - newPaid).toFixed(2));
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

    setBills(prev => prev.map(b => (b.bill_id === bill.bill_id ? { ...b, paid_amount: newPaid, balance_due: newBalance, payment_status: newStatus } : b)));

    // Update Party AP Balance
    setParties(prev => prev.map(p => {
      if (p.party_id === bill.vendor_id || p.name === bill.vendor_name) {
        const newAp = Math.max(0, p.ap_balance - amount);
        return { ...p, ap_balance: parseFloat(newAp.toFixed(2)), net_position: parseFloat(((p.ar_balance || 0) - newAp).toFixed(2)) };
      }
      return p;
    }));

    // Post Treasury Payment GL Entry
    const today = new Date().toISOString().split('T')[0];
    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const payVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'AP',
      reference_number: bill.bill_number,
      memo: `Vendor Bill Payment — ${bill.vendor_name} (${bill.bill_number})`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: amount,
      total_credit: amount,
      status: 'Posted',
      posted_by: 'Treasury Officer',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-21010', account_code: '21010', account_name: 'Trade Accounts Payable Control', cost_center_code: null, debit_amount: amount, credit_amount: 0.00, description: `Relieve AP for ${bill.bill_number}` },
        { line_id: 'JVL-2', account_id: 'ACC-10100', account_code: '10100', account_name: 'Operating Cash – Chase Main', cost_center_code: null, debit_amount: 0.00, credit_amount: amount, description: `Cash disbursement to ${bill.vendor_name}` }
      ]
    };
    postJournalEntry(payVoucher);

    // Update Bank Transactions
    const bankTxn = {
      txn_id: `BTX-${Math.floor(1000 + Math.random() * 9000)}`,
      bank_account_id: paymentData.bank_account_id || 'BANK-01',
      date: today,
      description: `Vendor Outflow — ${bill.vendor_name}`,
      reference: bill.bill_number,
      amount: -amount,
      type: 'OUTFLOW',
      status: 'Reconciled'
    };
    setBankTransactions(prev => [bankTxn, ...prev]);

    setBankAccounts(prev => prev.map(ba => {
      if (ba.bank_account_id === bankTxn.bank_account_id || ba.gl_account_code === '10100') {
        return { ...ba, current_book_balance: parseFloat((ba.current_book_balance - amount).toFixed(2)) };
      }
      return ba;
    }));
  };

  /**
   * Create Accounts Receivable Customer Invoice
   */
  const createInvoice = (invoiceData) => {
    const invNum = invoiceData.invoice_number || `INV-2026-${String(seqCounters.current.inv++).padStart(4, '0')}`;
    const subtotal = parseFloat(invoiceData.subtotal_amount || invoiceData.subtotal || 0);
    const taxRate = invoiceData.tax_rate !== undefined ? invoiceData.tax_rate : 0.05;
    const taxAmount = invoiceData.tax_amount !== undefined ? parseFloat(invoiceData.tax_amount) : parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    const today = new Date().toISOString().split('T')[0];
    const dueDate = invoiceData.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const newInvoice = {
      invoice_id: invNum,
      id: invNum,
      invoice_number: invNum,
      customer_id: invoiceData.customer_id || 'PTY-00101',
      customer_name: invoiceData.customer_name || 'Al-Madina Trading LLC',
      so_reference: invoiceData.so_reference || 'SO-2026-050',
      issue_date: invoiceData.issue_date || today,
      due_date: dueDate,
      payment_terms: invoiceData.payment_terms || 'Net 30',
      subtotal_amount: subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: total,
      paid_amount: 0.00,
      balance_due: total,
      status: 'ISSUED',
      journal_entry_id: null
    };

    // Auto-generate AR Journal Voucher
    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const arVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'AR',
      reference_number: invNum,
      memo: `Customer Invoice — ${newInvoice.customer_name} (${newInvoice.so_reference})`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: total,
      total_credit: total,
      status: 'Posted',
      posted_by: 'AR Specialist',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-11100', account_code: '11100', account_name: 'Accounts Receivable Control', cost_center_code: null, debit_amount: total, credit_amount: 0.00, description: `Receivable from ${newInvoice.customer_name}` },
        { line_id: 'JVL-2', account_id: 'ACC-40100', account_code: '40100', account_name: 'Gross Sales / Operating Revenue', cost_center_code: null, debit_amount: 0.00, credit_amount: subtotal, description: `Sales Revenue on ${invNum}` },
        { line_id: 'JVL-3', account_id: 'ACC-22200', account_code: '22200', account_name: 'Output VAT Payable (5%)', cost_center_code: null, debit_amount: 0.00, credit_amount: taxAmount, description: `5% Output VAT on ${invNum}` }
      ]
    };

    newInvoice.journal_entry_id = voucherNum;
    setInvoices(prev => [newInvoice, ...prev]);
    postJournalEntry(arVoucher);

    // Update Customer AR Balance in Party Directory
    setParties(prev => prev.map(p => {
      if (p.party_id === newInvoice.customer_id || p.name === newInvoice.customer_name) {
        const newAr = p.ar_balance + total;
        return { ...p, ar_balance: parseFloat(newAr.toFixed(2)), net_position: parseFloat((newAr - (p.ap_balance || 0)).toFixed(2)) };
      }
      return p;
    }));

    return newInvoice;
  };

  /**
   * Receive Customer Payment
   */
  const receivePayment = (invoiceId, paymentData = {}) => {
    const invoice = invoices.find(inv => inv.invoice_id === invoiceId || inv.invoice_number === invoiceId || inv.id === invoiceId);
    if (!invoice) return;

    const amount = parseFloat(paymentData.amount || invoice.balance_due);
    const newPaid = parseFloat((invoice.paid_amount + amount).toFixed(2));
    const newBalance = parseFloat(Math.max(0, invoice.total_amount - newPaid).toFixed(2));
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

    setInvoices(prev => prev.map(inv => (inv.invoice_id === invoice.invoice_id ? { ...inv, paid_amount: newPaid, balance_due: newBalance, status: newStatus } : inv)));

    // Update Party AR Balance
    setParties(prev => prev.map(p => {
      if (p.party_id === invoice.customer_id || p.name === invoice.customer_name) {
        const newAr = Math.max(0, p.ar_balance - amount);
        return { ...p, ar_balance: parseFloat(newAr.toFixed(2)), net_position: parseFloat((newAr - (p.ap_balance || 0)).toFixed(2)) };
      }
      return p;
    }));

    // Post Treasury Receipt GL Entry
    const today = new Date().toISOString().split('T')[0];
    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const receiptVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'AR',
      reference_number: invoice.invoice_number,
      memo: `Customer Payment Receipt — ${invoice.customer_name} (${invoice.invoice_number})`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: amount,
      total_credit: amount,
      status: 'Posted',
      posted_by: 'Treasury Officer',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-10100', account_code: '10100', account_name: 'Operating Cash – Chase Main', cost_center_code: null, debit_amount: amount, credit_amount: 0.00, description: `Cash receipt from ${invoice.customer_name}` },
        { line_id: 'JVL-2', account_id: 'ACC-11100', account_code: '11100', account_name: 'Accounts Receivable Control', cost_center_code: null, debit_amount: 0.00, credit_amount: amount, description: `Clear AR balance for ${invoice.invoice_number}` }
      ]
    };
    postJournalEntry(receiptVoucher);

    // Update Bank Transactions
    const bankTxn = {
      txn_id: `BTX-${Math.floor(1000 + Math.random() * 9000)}`,
      bank_account_id: paymentData.bank_account_id || 'BANK-01',
      date: today,
      description: `Customer Inflow — ${invoice.customer_name}`,
      reference: invoice.invoice_number,
      amount,
      type: 'INFLOW',
      status: 'Reconciled'
    };
    setBankTransactions(prev => [bankTxn, ...prev]);

    setBankAccounts(prev => prev.map(ba => {
      if (ba.bank_account_id === bankTxn.bank_account_id || ba.gl_account_code === '10100') {
        return { ...ba, current_book_balance: parseFloat((ba.current_book_balance + amount).toFixed(2)) };
      }
      return ba;
    }));
  };

  /**
   * Create Party in Unified Directory
   */
  const createParty = (partyData) => {
    const partyId = partyData.party_id || `PTY-${String(seqCounters.current.pty++).padStart(5, '0')}`;
    const ar = parseFloat(partyData.ar_balance || 0);
    const ap = parseFloat(partyData.ap_balance || 0);

    const newParty = {
      party_id: partyId,
      id: partyId,
      party_code: partyData.party_code || partyId,
      name: partyData.name || 'New Business Partner',
      legal_name: partyData.legal_name || partyData.name || 'New Business Partner LLC',
      roles: partyData.roles || (partyData.role ? [partyData.role] : ['Customer']),
      category: partyData.category || 'General',
      tax_number: partyData.tax_number || partyData.trn || 'TRN-100000000',
      payment_terms: partyData.payment_terms || 'Net 30',
      contact_email: partyData.contact_email || partyData.email || 'contact@partner.example',
      phone: partyData.phone || '+1 555-0000',
      ar_balance: ar,
      ap_balance: ap,
      net_position: parseFloat((ar - ap).toFixed(2)),
      is_active: partyData.is_active !== undefined ? partyData.is_active : true
    };

    setParties(prev => [newParty, ...prev]);
    return newParty;
  };

  /**
   * Update Party
   */
  const updateParty = (partyId, partyData) => {
    setParties(prev => prev.map(p => {
      if (p.party_id === partyId || p.id === partyId) {
        const ar = partyData.ar_balance !== undefined ? parseFloat(partyData.ar_balance) : p.ar_balance;
        const ap = partyData.ap_balance !== undefined ? parseFloat(partyData.ap_balance) : p.ap_balance;
        return {
          ...p,
          ...partyData,
          ar_balance: ar,
          ap_balance: ap,
          net_position: parseFloat((ar - ap).toFixed(2))
        };
      }
      return p;
    }));
  };

  /**
   * Update Valuation Rule
   */
  const updateValuationRule = (categoryIdOrName, ruleData) => {
    setValuationRules(prev => prev.map(r => {
      if (r.category === categoryIdOrName || r.category_id === categoryIdOrName) {
        return { ...r, ...ruleData };
      }
      return r;
    }));
  };

  /**
   * Create Internal Department Requisition
   */
  const createRequisition = (reqData) => {
    const reqId = reqData.requisition_id || `REQ-2026-${String(seqCounters.current.req++).padStart(3, '0')}`;
    const items = reqData.items || [];
    const totalCost = items.reduce((sum, it) => sum + ((it.qty || 0) * (it.unitCost || 0)), 0);
    const ccCode = reqData.cost_center_code || 'CC-100';
    const cc = costCenters.find(c => c.code === ccCode);
    const today = new Date().toISOString().split('T')[0];

    // Trigger warehouse stock issuance in InventoryContext if available
    if (processBatchTransaction && items.length > 0) {
      processBatchTransaction('Issue', items, 'Main Warehouse', `${cc ? cc.name : ccCode} (${ccCode})`);
    }

    const newReq = {
      requisition_id: reqId,
      id: reqId,
      date: reqData.date || today,
      cost_center_code: ccCode,
      cost_center_name: cc ? `${cc.name} (${cc.code})` : ccCode,
      staff_name: reqData.staff_name || 'Department Staff',
      items,
      total_cost: parseFloat(totalCost.toFixed(2)),
      journal_entry_id: null,
      status: 'Approved'
    };

    setRequisitions(prev => [newReq, ...prev]);
    return newReq;
  };

  /**
   * Run Fixed Asset Depreciation
   */
  const runDepreciation = (period) => {
    const depPeriod = period || new Date().toISOString().slice(0, 7);
    let totalDepAmount = 0;
    let count = 0;

    const updatedAssets = fixedAssets.map(asset => {
      if (asset.status === 'Active' && asset.net_book_value > asset.salvage_value) {
        const monthly = asset.monthly_depreciation_amount || ((asset.acquisition_cost - asset.salvage_value) / asset.useful_life_months);
        const dep = Math.min(monthly, asset.net_book_value - asset.salvage_value);
        const newAccum = asset.accumulated_depreciation + dep;
        const newNbv = asset.acquisition_cost - newAccum;
        const newStatus = newNbv <= asset.salvage_value ? 'FullyDepreciated' : 'Active';

        totalDepAmount += dep;
        count++;

        return {
          ...asset,
          accumulated_depreciation: parseFloat(newAccum.toFixed(2)),
          net_book_value: parseFloat(newNbv.toFixed(2)),
          status: newStatus
        };
      }
      return asset;
    });

    if (totalDepAmount <= 0) return { totalDepreciation: 0, assetCount: 0 };

    setFixedAssets(updatedAssets);

    // Post Depreciation GL Voucher
    const today = new Date().toISOString().split('T')[0];
    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const depVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: depPeriod,
      voucher_type: 'ASSET',
      reference_number: `DEP-${depPeriod}`,
      memo: `Monthly Fixed Asset Depreciation Run — Period ${depPeriod} (${count} assets)`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: parseFloat(totalDepAmount.toFixed(2)),
      total_credit: parseFloat(totalDepAmount.toFixed(2)),
      status: 'Posted',
      posted_by: 'Fixed Asset Engine',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-64100', account_code: '64100', account_name: 'Depreciation Expense – Plant & Equipment', cost_center_code: null, debit_amount: parseFloat(totalDepAmount.toFixed(2)), credit_amount: 0.00, description: `Amortization expense for ${depPeriod}` },
        { line_id: 'JVL-2', account_id: 'ACC-15200', account_code: '15200', account_name: 'Accumulated Depreciation', cost_center_code: null, debit_amount: 0.00, credit_amount: parseFloat(totalDepAmount.toFixed(2)), description: `Contra-asset credit for ${depPeriod}` }
      ]
    };
    postJournalEntry(depVoucher);

    const depRun = {
      run_id: `DEP-${depPeriod}`,
      period: depPeriod,
      execution_date: today,
      asset_count: count,
      total_depreciation: parseFloat(totalDepAmount.toFixed(2)),
      journal_entry_id: voucherNum,
      status: 'Posted'
    };
    setDepreciationRuns(prev => [depRun, ...prev]);

    return { totalDepreciation: totalDepAmount, assetCount: count, voucherNumber: voucherNum };
  };

  /**
   * Process Workforce Payroll & WPS SIF
   */
  const processPayroll = (month) => {
    const payrollMonth = month || 'August 2026';
    const payrollId = `PAY-${payrollMonth.replace(/\s+/g, '-').toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];

    const targetRun = payrollRecords.find(p => p.month === payrollMonth || p.period === payrollMonth) || payrollRecords[0];
    const gross = targetRun ? targetRun.total_gross : 148500.00;
    const net = targetRun ? targetRun.total_net_salary : 124200.00;
    const deductions = targetRun ? targetRun.total_deductions : 24300.00;

    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const payrollVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'PAYROLL',
      reference_number: payrollId,
      memo: `Workforce Payroll Run & WPS Accrual — ${payrollMonth}`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: gross,
      total_credit: gross,
      status: 'Posted',
      posted_by: 'Payroll Specialist',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-63100', account_code: '63100', account_name: 'Salaries & Workforce Compensation', cost_center_code: null, debit_amount: gross, credit_amount: 0.00, description: `Gross payroll expense for ${payrollMonth}` },
        { line_id: 'JVL-2', account_id: 'ACC-22100', account_code: '22100', account_name: 'Accrued Wages & Salaries Payable', cost_center_code: null, debit_amount: 0.00, credit_amount: net, description: `Net payout liability for ${payrollMonth}` },
        { line_id: 'JVL-3', account_id: 'ACC-22100', account_code: '22100', account_name: 'Accrued Statutory Deductions', cost_center_code: null, debit_amount: 0.00, credit_amount: deductions, description: `Statutory withholdings for ${payrollMonth}` }
      ]
    };
    postJournalEntry(payrollVoucher);

    setPayrollRecords(prev => prev.map(p => {
      if (p.payroll_id === targetRun?.payroll_id || p.month === payrollMonth) {
        return { ...p, status: 'Processed', wps_sif_generated: true, execution_date: today, journal_entry_id: voucherNum };
      }
      return p;
    }));

    return { payrollId, voucherNumber: voucherNum, totalGross: gross, totalNet: net };
  };

  /**
   * Export WPS SIF File Content
   */
  const exportWpsSifFile = (payrollId) => {
    const run = payrollRecords.find(p => p.payroll_id === payrollId || p.id === payrollId) || payrollRecords[0];
    const header = `SCR,${run?.payroll_id || 'PAY-01'},MOL1234567,${new Date().toISOString().split('T')[0]},14:00,42,${run?.total_net_salary || 124200.00},USD,Chase`;
    const employeeLines = (run?.records || []).map(e => `EDR,${e.emp_id},WPS${e.emp_id.replace('EMP-', '')},${e.basic_salary.toFixed(2)},${e.allowances.toFixed(2)},${e.deductions.toFixed(2)},${e.net_salary.toFixed(2)},0.00,0.00,${e.name},Chase Bank`).join('\n');
    return `${header}\n${employeeLines}`;
  };

  /**
   * File VAT Return & Settle Tax Liability
   */
  const fileVatReturn = (quarter) => {
    const taxPeriod = quarter || 'VAT-2026-Q3';
    const targetVat = vatFiling.find(v => v.tax_period === taxPeriod || v.quarter === taxPeriod) || vatFiling[1];

    const outputVat = targetVat ? targetVat.output_vat : 32100.00;
    const inputVat = targetVat ? targetVat.input_vat : 13650.00;
    const netTax = parseFloat((outputVat - inputVat).toFixed(2));
    const today = new Date().toISOString().split('T')[0];

    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const taxVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'TAX',
      reference_number: taxPeriod,
      memo: `Quarterly VAT Settlement Filing — ${taxPeriod}`,
      currency_code: 'USD',
      exchange_rate: 1.0000,
      total_debit: outputVat,
      total_credit: outputVat,
      status: 'Posted',
      posted_by: 'Tax Compliance Officer',
      posted_at: new Date().toISOString(),
      lines: [
        { line_id: 'JVL-1', account_id: 'ACC-22200', account_code: '22200', account_name: 'Output VAT Payable (5%)', cost_center_code: null, debit_amount: outputVat, credit_amount: 0.00, description: `Clear Output VAT on sales for ${taxPeriod}` },
        { line_id: 'JVL-2', account_id: 'ACC-13900', account_code: '13900', account_name: 'Input VAT Recoverable (5%)', cost_center_code: null, debit_amount: 0.00, credit_amount: inputVat, description: `Recover Input VAT on purchases for ${taxPeriod}` },
        { line_id: 'JVL-3', account_id: 'ACC-10100', account_code: '10100', account_name: 'Operating Cash – Chase Main', cost_center_code: null, debit_amount: 0.00, credit_amount: netTax, description: `Net VAT statutory payment for ${taxPeriod}` }
      ]
    };
    postJournalEntry(taxVoucher);

    setVatFiling(prev => prev.map(v => {
      if (v.tax_period === taxPeriod || v.quarter === taxPeriod) {
        return { ...v, filing_status: 'Submitted', status: 'Submitted', filing_date: today, journal_entry_id: voucherNum };
      }
      return v;
    }));

    return { taxPeriod, outputVat, inputVat, netTax, voucherNumber: voucherNum };
  };

  /**
   * Reconcile Bank Session
   */
  const reconcileBankSession = (bankAccountId, matchedTxnIds = []) => {
    setBankTransactions(prev => prev.map(txn => {
      if (txn.bank_account_id === bankAccountId && (matchedTxnIds.length === 0 || matchedTxnIds.includes(txn.txn_id))) {
        return { ...txn, status: 'Reconciled' };
      }
      return txn;
    }));

    setBankAccounts(prev => prev.map(ba => {
      if (ba.bank_account_id === bankAccountId) {
        return { ...ba, unreconciled_difference: 0.00, last_reconciled: new Date().toISOString().split('T')[0] };
      }
      return ba;
    }));
  };

  // ==========================================
  // TOPIC 1: BUDGETING & FORECASTING ACTIONS
  // ==========================================
  const createBudget = (budgetData) => {
    const budgetId = `BDG-${budgetData.fiscal_year || 2026}-${budgetData.cost_center_code || 'CC'}`;
    const newBudget = {
      budget_id: budgetId,
      cost_center_code: budgetData.cost_center_code,
      cost_center_name: budgetData.cost_center_name || 'Cost Center',
      manager: budgetData.manager || 'Department Manager',
      fiscal_year: budgetData.fiscal_year || 2026,
      annual_budget: parseFloat(budgetData.annual_budget) || 0,
      quarterly_allocation: budgetData.quarterly_allocation || {
        Q1: (parseFloat(budgetData.annual_budget) || 0) * 0.25,
        Q2: (parseFloat(budgetData.annual_budget) || 0) * 0.25,
        Q3: (parseFloat(budgetData.annual_budget) || 0) * 0.25,
        Q4: (parseFloat(budgetData.annual_budget) || 0) * 0.25
      },
      ytd_actual: parseFloat(budgetData.ytd_actual) || 0,
      ytd_budget: (parseFloat(budgetData.annual_budget) || 0) * 0.66,
      ytd_variance: (parseFloat(budgetData.ytd_actual) || 0) - ((parseFloat(budgetData.annual_budget) || 0) * 0.66),
      variance_percent: 0,
      status: 'OnTrack',
      line_items: budgetData.line_items || []
    };
    setBudgets(prev => [newBudget, ...prev]);
    return newBudget;
  };

  const updateBudget = (budgetId, updatedFields) => {
    setBudgets(prev => prev.map(b => (b.budget_id === budgetId ? { ...b, ...updatedFields } : b)));
  };

  const addBudgetLineItem = (budgetId, lineItem) => {
    setBudgets(prev => prev.map(b => {
      if (b.budget_id === budgetId) {
        const newLine = {
          line_id: `BL-${Date.now().toString().slice(-4)}`,
          ...lineItem
        };
        const updatedLines = [...b.line_items, newLine];
        return { ...b, line_items: updatedLines };
      }
      return b;
    }));
  };

  const setActiveForecastModel = (modelId) => {
    setForecastModels(prev => prev.map(m => ({ ...m, is_active: m.model_id === modelId })));
  };

  // ==========================================
  // TOPIC 2: ACCOUNT RECONCILIATION ACTIONS
  // ==========================================
  const reconcileAccount = (reconciliationId, closingData = {}) => {
    const today = new Date().toISOString().split('T')[0];
    setReconciliations(prev => prev.map(r => {
      if (r.reconciliation_id === reconciliationId) {
        return {
          ...r,
          status: 'RECONCILED',
          reconciled_at: new Date().toISOString(),
          reviewer: closingData.reviewer || 'Layla Salem (Certified Auditor)',
          notes: closingData.notes || r.notes,
          unreconciled_difference: 0.00
        };
      }
      return r;
    }));

    const target = reconciliations.find(r => r.reconciliation_id === reconciliationId);
    if (target) {
      setReconciliationLogs(prev => [
        {
          log_id: `RLOG-${Date.now().toString().slice(-6)}`,
          period: target.fiscal_period || today.slice(0, 7),
          bank_name: target.bank_name,
          ending_balance: target.statement_ending_balance,
          verified_by: closingData.reviewer || 'Layla Salem (Certified Auditor)',
          hash: `0x${Math.random().toString(16).slice(2, 14)}`,
          status: 'LOCKED'
        },
        ...prev
      ]);
    }
  };

  const addReconciliationAdjustment = ({ bank_account_id, gl_account_code, amount, description, reference, item_id }) => {
    const today = new Date().toISOString().split('T')[0];
    const voucherNum = `JV-${new Date().getFullYear()}-${String(seqCounters.current.jv++).padStart(5, '0')}`;
    const adjAmount = Math.abs(parseFloat(amount) || 0);
    const isCharge = parseFloat(amount) < 0;

    const targetAccount = accounts.find(a => a.account_code === (gl_account_code || '66100'));
    const bankAccount = (bank_account_id && accounts.find(a => a.account_id === bank_account_id)) || accounts.find(a => a.account_code === '10100');

    const adjVoucher = {
      journal_id: voucherNum,
      voucher_number: voucherNum,
      posting_date: today,
      fiscal_period: today.slice(0, 7),
      voucher_type: 'BANK_ADJUSTMENT',
      reference_number: reference || 'BANK-RECON-ADJ',
      memo: description || 'Bank reconciliation adjustment voucher',
      currency_code: 'JOD',
      exchange_rate: 1.0000,
      total_debit: adjAmount,
      total_credit: adjAmount,
      status: 'Posted',
      posted_by: 'Bank Reconciliation Auto-GL',
      posted_at: new Date().toISOString(),
      lines: isCharge ? [
        { line_id: 'JVL-1', account_id: targetAccount?.account_id || 'ACC-66100', account_code: targetAccount?.account_code || '66100', account_name: targetAccount?.account_name || 'General & Administrative', cost_center_code: null, debit_amount: adjAmount, credit_amount: 0.00, description },
        { line_id: 'JVL-2', account_id: bankAccount?.account_id || 'ACC-10100', account_code: bankAccount?.account_code || '10100', account_name: bankAccount?.account_name || 'Operating Cash – Chase Main', cost_center_code: null, debit_amount: 0.00, credit_amount: adjAmount, description: `Bank fee adjustment ${reference}` }
      ] : [
        { line_id: 'JVL-1', account_id: bankAccount?.account_id || 'ACC-10100', account_code: bankAccount?.account_code || '10100', account_name: bankAccount?.account_name || 'Operating Cash – Chase Main', cost_center_code: null, debit_amount: adjAmount, credit_amount: 0.00, description },
        { line_id: 'JVL-2', account_id: targetAccount?.account_id || 'ACC-40100', account_code: targetAccount?.account_code || '40100', account_name: targetAccount?.account_name || 'Gross Sales / Operating Revenue', cost_center_code: null, debit_amount: 0.00, credit_amount: adjAmount, description: `Bank yield / deposit adjustment ${reference}` }
      ]
    };

    postJournalEntry(adjVoucher);

    if (item_id) {
      setUnmatchedBankTransactions(prev => prev.map(u => (u.item_id === item_id ? { ...u, status: 'Adjusted_Via_GL', adjustment_jv_ref: voucherNum } : u)));
    }

    return { voucherNum, adjAmount };
  };

  const matchTransaction = (itemId) => {
    setUnmatchedBankTransactions(prev => prev.map(u => (u.item_id === itemId ? { ...u, status: 'Matched' } : u)));
  };

  // ==========================================
  // TOPIC 4: INTERNAL CONTROLS & APPROVALS ACTIONS
  // ==========================================
  const approveRequest = (requestId, approverName = 'Authorized Manager', comment = 'Approved per corporate authorization matrix.') => {
    const today = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setApprovalRequests(prev => prev.map(req => {
      if (req.request_id === requestId) {
        const nextTier = req.current_tier + 1;
        const isFullyApproved = nextTier > req.required_tiers;
        const updatedChain = req.approval_chain.map(step => {
          if (step.tier === req.current_tier) {
            return { ...step, status: 'APPROVED', approver_name: approverName, timestamp: today, comment };
          }
          return step;
        });

        if (!isFullyApproved && !updatedChain.some(s => s.tier === nextTier)) {
          updatedChain.push({
            tier: nextTier,
            role: nextTier === 3 ? 'CFO / Managing Director Dual Signatory' : 'Finance Manager',
            approver_name: 'Pending Assignment',
            status: 'PENDING',
            timestamp: null,
            comment: null
          });
        }

        return {
          ...req,
          current_tier: isFullyApproved ? req.current_tier : nextTier,
          status: isFullyApproved ? 'APPROVED' : 'PENDING',
          approval_chain: updatedChain
        };
      }
      return req;
    }));
  };

  const rejectRequest = (requestId, approverName = 'Reviewing Authority', reason = 'Rejected per internal control review.') => {
    const today = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setApprovalRequests(prev => prev.map(req => {
      if (req.request_id === requestId) {
        const updatedChain = req.approval_chain.map(step => {
          if (step.tier === req.current_tier) {
            return { ...step, status: 'REJECTED', approver_name: approverName, timestamp: today, comment: reason };
          }
          return step;
        });
        return {
          ...req,
          status: 'REJECTED',
          approval_chain: updatedChain
        };
      }
      return req;
    }));
  };

  const createApprovalRequest = (requestData) => {
    const reqId = `APR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const amount = parseFloat(requestData.amount) || 0;
    const requiredTiers = amount > 10000 ? 3 : (amount > 1000 ? 2 : 1);

    const newRequest = {
      request_id: reqId,
      title: requestData.title || 'Expenditure Authorization Request',
      type: requestData.type || 'SUPPLIER_PAYMENT',
      source_ref: requestData.source_ref || `REF-${Date.now().toString().slice(-4)}`,
      amount,
      currency: requestData.currency || 'JOD',
      cost_center_code: requestData.cost_center_code || 'CC-100',
      cost_center_name: requestData.cost_center_name || 'General Operations',
      requester: requestData.requester || 'Operational Staff',
      submission_date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      urgency: requestData.urgency || 'Normal',
      current_tier: 1,
      required_tiers: requiredTiers,
      status: 'PENDING',
      justification: requestData.justification || 'Operational necessity.',
      approval_chain: [
        { tier: 1, role: 'Department Head', approver_name: requestData.requester || 'Dept Lead', status: 'APPROVED', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16), comment: 'Initiated and verified.' },
        ...(requiredTiers >= 2 ? [{ tier: 2, role: 'Finance Manager', approver_name: 'Pending FM', status: 'PENDING', timestamp: null, comment: null }] : []),
        ...(requiredTiers >= 3 ? [{ tier: 3, role: 'CFO / Managing Director', approver_name: 'Pending Executive', status: 'PENDING', timestamp: null, comment: null }] : [])
      ]
    };
    setApprovalRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const updateControlMatrix = (controlId, updatedFields) => {
    setControlMatrix(prev => prev.map(c => (c.control_id === controlId ? { ...c, ...updatedFields } : c)));
  };

  // ==========================================
  // TOPIC 5: TENDER & BID AUDITING ACTIONS
  // ==========================================
  const createTender = (tenderData) => {
    const tenderId = `TND-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const newTender = {
      tender_id: tenderId,
      reference_code: tenderData.reference_code || `GTD-JOR-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      title: tenderData.title,
      category: tenderData.category || 'Supplies',
      procurement_method: tenderData.procurement_method || 'Public Tender (GTD Standard)',
      budget_amount: parseFloat(tenderData.budget_amount) || 0,
      currency: tenderData.currency || 'JOD',
      published_date: tenderData.published_date || new Date().toISOString().split('T')[0],
      submission_deadline: tenderData.submission_deadline || '2026-09-30',
      status: 'Bidding_Open',
      audit_compliance_score: 100.0,
      bid_count: 0,
      selected_bid_id: null,
      selected_vendor: null,
      audit_summary: 'New procurement RFP registered in compliance with Jordan Law No. 28/2019.',
      bids: []
    };
    setTenders(prev => [newTender, ...prev]);
    return newTender;
  };

  const submitBid = (tenderId, bidData) => {
    const bidId = `BID-${Date.now().toString().slice(-4)}`;
    const techScore = parseFloat(bidData.technical_score) || 85.0;
    const finScore = parseFloat(bidData.financial_score) || 90.0;
    const weightedScore = parseFloat((techScore * 0.6 + finScore * 0.4).toFixed(1));

    const newBid = {
      bid_id: bidId,
      tender_id: tenderId,
      vendor_name: bidData.vendor_name,
      vendor_crn: bidData.vendor_crn || 'CRN-PENDING',
      quoted_price: parseFloat(bidData.quoted_price) || 0,
      currency: bidData.currency || 'JOD',
      technical_score: techScore,
      financial_score: finScore,
      weighted_score: weightedScore,
      bid_bond_submitted: bidData.bid_bond_submitted !== false,
      bid_bond_amount: parseFloat(bidData.bid_bond_amount) || 0,
      issuing_bank: bidData.issuing_bank || 'Arab Bank',
      tax_clearance_verified: bidData.tax_clearance_verified !== false,
      ssc_compliance_verified: bidData.ssc_compliance_verified !== false,
      delivery_timeline_days: parseInt(bidData.delivery_timeline_days) || 14,
      warranty_months: parseInt(bidData.warranty_months) || 12,
      audit_status: 'PASSED',
      ranking: 1
    };

    setTenders(prev => prev.map(t => {
      if (t.tender_id === tenderId) {
        const updatedBids = [...t.bids, newBid];
        return {
          ...t,
          bid_count: updatedBids.length,
          bids: updatedBids
        };
      }
      return t;
    }));
    return newBid;
  };

  const awardTender = (tenderId, bidId, justification = 'Awarded to lowest evaluated compliant bidder.') => {
    setTenders(prev => prev.map(t => {
      if (t.tender_id === tenderId) {
        const winningBid = t.bids.find(b => b.bid_id === bidId);
        const updatedBids = t.bids.map(b => ({
          ...b,
          audit_status: b.bid_id === bidId ? 'AWARDED' : (b.audit_status === 'DISQUALIFIED' ? 'DISQUALIFIED' : 'PASSED')
        }));
        return {
          ...t,
          status: 'Awarded',
          selected_bid_id: bidId,
          selected_vendor: winningBid?.vendor_name || 'Selected Vendor',
          audit_summary: justification,
          bids: updatedBids
        };
      }
      return t;
    }));
  };

  const addBankGuarantee = (guaranteeData) => {
    const bgId = `BG-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const newBg = {
      guarantee_id: bgId,
      ...guaranteeData,
      status: guaranteeData.status || 'Active'
    };
    setBankGuarantees(prev => [newBg, ...prev]);
    return newBg;
  };

  // ==========================================
  // TOPIC 6: CASH FLOW MANAGEMENT ACTIONS
  // ==========================================
  const addCashFlowEntry = (entryData) => {
    const entryId = `CF-${new Date().toISOString().slice(0, 7)}-${String(Math.floor(10 + Math.random() * 90))}`;
    const newEntry = {
      entry_id: entryId,
      date: entryData.date || new Date().toISOString().split('T')[0],
      type: entryData.type || 'INFLOW',
      category: entryData.category || 'OPERATING',
      sub_category: entryData.sub_category || 'Cash Event',
      amount: parseFloat(entryData.amount) || 0,
      party_name: entryData.party_name || 'Commercial Partner',
      reference: entryData.reference || `REF-${Date.now().toString().slice(-4)}`,
      bank_account_id: entryData.bank_account_id || 'BANK-01',
      status: entryData.status || 'Cleared'
    };
    setCashFlowEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateLiquidityForecasts = (newForecasts) => {
    setLiquidityForecasts(newForecasts);
  };

  const updateWorkingCapitalMetrics = (newMetrics) => {
    setWorkingCapitalMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  const updatePdcStatus = (pdcId, newStatus) => {
    setPdcPortfolio(prev => prev.map(p => (p.pdc_id === pdcId ? { ...p, status: newStatus } : p)));
  };

  // ==========================================
  // TOPIC 16: FINANCIAL POLICIES ACTIONS
  // ==========================================
  const updatePolicyStatus = (policyId, newStatus, exceptionNote = null) => {
    setPolicies(prev => prev.map(p => {
      if (p.policy_id === policyId) {
        return {
          ...p,
          compliance_status: newStatus,
          active_exceptions: exceptionNote ? p.active_exceptions + 1 : p.active_exceptions,
          last_exception_note: exceptionNote || p.last_exception_note
        };
      }
      return p;
    }));
  };

  const addPolicyRevision = (policyId, revisionData) => {
    setPolicies(prev => prev.map(p => {
      if (p.policy_id === policyId) {
        return {
          ...p,
          version: revisionData.version || p.version,
          effective_date: revisionData.effective_date || new Date().toISOString().split('T')[0],
          policy_summary: revisionData.summary || p.policy_summary
        };
      }
      return p;
    }));
  };

  const updateRegulatoryRule = (ruleId, updatedData) => {
    setRegulatoryReferences(prev => prev.map(r => (r.rule_id === ruleId ? { ...r, ...updatedData } : r)));
  };


  // ==========================================
  // FINANCIAL STATEMENTS COMPUTED GENERATORS
  // ==========================================

  /**
   * Balance Sheet Generator
   */
  const getBalanceSheet = () => {
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
      currentAssets: {
        cashMain,
        cashHsbc,
        totalCash,
        accountsReceivable: arControl,
        inventoryAsset: inventoryValuation,
        inputVatRecoverable: inputVat,
        total: parseFloat(totalCurrentAssets.toFixed(2))
      },
      nonCurrentAssets: {
        propertyPlantEquipment: ppeGross,
        accumulatedDepreciation: accumDeprec,
        netPpe: parseFloat(netPpe.toFixed(2)),
        total: parseFloat(totalNonCurrentAssets.toFixed(2))
      },
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      currentLiabilities: {
        grirClearing,
        accountsPayable: apControl,
        accruedSalaries,
        outputVatPayable: outputVat,
        total: parseFloat(totalCurrentLiabilities.toFixed(2))
      },
      longTermLiabilities: {
        bankTermFacility: bankLoan,
        endOfServiceGratuity: gratuityLiability,
        total: parseFloat(totalLongTermLiabilities.toFixed(2))
      },
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      equity: {
        contributedShareCapital: shareCapital,
        retainedEarnings,
        currentPeriodNetIncome: parseFloat(currentNetIncome.toFixed(2)),
        total: parseFloat(totalEquity.toFixed(2))
      },
      totalLiabilitiesAndEquity: parseFloat(totalLiabilitiesAndEquity.toFixed(2)),
      isBalanced: equilibriumDelta < 0.05,
      equilibriumDelta: parseFloat(equilibriumDelta.toFixed(2))
    };
  };

  /**
   * Income Statement (Profit & Loss) Generator
   */
  const getIncomeStatement = () => {
    const getBal = (code) => {
      const acc = accounts.find(a => a.account_code === code);
      return acc ? acc.current_balance : 0.00;
    };

    const grossRevenue = getBal('40100');
    const salesDiscounts = getBal('40200'); // Contra-Revenue (negative)
    const netRevenue = grossRevenue + salesDiscounts;

    const cogsLinens = getBal('50110');
    const cogsFnb = getBal('50120');
    const cogsCleaning = getBal('50130');
    const cogsAmenities = getBal('50140');
    const cogsEquipment = getBal('50150');
    const cogsMaintenance = getBal('50160');
    const ppvVariance = getBal('51200');
    const shrinkage = getBal('51950');

    const totalCogs = cogsLinens + cogsFnb + cogsCleaning + cogsAmenities + cogsEquipment + cogsMaintenance + ppvVariance + shrinkage;
    const grossProfit = netRevenue - totalCogs;
    const grossMarginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const opexFnb = getBal('61100');
    const opexHousekeeping = getBal('61200');
    const opexMaintenance = getBal('61300');
    const opexFrontOffice = getBal('61400');
    const opexIt = getBal('62100');
    const opexSalaries = getBal('63100');
    const opexDepreciation = getBal('64100');
    const opexRent = getBal('65100');
    const opexGa = getBal('66100');

    const totalOpex = opexFnb + opexHousekeeping + opexMaintenance + opexFrontOffice + opexIt + opexSalaries + opexDepreciation + opexRent + opexGa;
    const operatingIncome = grossProfit - totalOpex;
    const netProfitMarginPercent = netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0;

    return {
      revenue: {
        grossRevenue,
        salesDiscounts,
        netRevenue: parseFloat(netRevenue.toFixed(2))
      },
      cogs: {
        cogsLinens,
        cogsFnb,
        cogsCleaning,
        cogsAmenities,
        cogsEquipment,
        cogsMaintenance,
        ppvVariance,
        shrinkage,
        totalCogs: parseFloat(totalCogs.toFixed(2))
      },
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      grossMarginPercent: parseFloat(grossMarginPercent.toFixed(1)),
      operatingExpenses: {
        departmentalFnb: opexFnb,
        departmentalHousekeeping: opexHousekeeping,
        departmentalMaintenance: opexMaintenance,
        departmentalFrontOffice: opexFrontOffice,
        itCloudSaas: opexIt,
        salariesWorkforce: opexSalaries,
        depreciationExpense: opexDepreciation,
        rentFacilities: opexRent,
        generalAdministrative: opexGa,
        totalOpex: parseFloat(totalOpex.toFixed(2))
      },
      operatingIncome: parseFloat(operatingIncome.toFixed(2)),
      netProfit: parseFloat(operatingIncome.toFixed(2)),
      netProfitMarginPercent: parseFloat(netProfitMarginPercent.toFixed(1))
    };
  };

  /**
   * Cash Flow Statement Generator
   */
  const getCashFlowStatement = () => {
    const is = getIncomeStatement();
    const netIncome = is.netProfit;
    const deprecAddBack = is.operatingExpenses.depreciationExpense;

    // Operating Working Capital Changes
    const arChange = -14200.00;
    const inventoryChange = -8500.00;
    const apChange = 12400.00;
    const operatingCashFlow = netIncome + deprecAddBack + arChange + inventoryChange + apChange;

    // Investing Cash Flows
    const capex = -28000.00;
    const investingCashFlow = capex;

    // Financing Cash Flows
    const loanRepayment = -15000.00;
    const financingCashFlow = loanRepayment;

    const netChangeInCash = operatingCashFlow + investingCashFlow + financingCashFlow;
    const beginningCash = 459550.00;
    const endingCash = beginningCash + netChangeInCash;

    return {
      operatingActivities: {
        netIncome,
        depreciationAddBack: deprecAddBack,
        accountsReceivableChange: arChange,
        inventoryChange: inventoryChange,
        accountsPayableChange: apChange,
        netOperatingCashFlow: parseFloat(operatingCashFlow.toFixed(2))
      },
      investingActivities: {
        capitalExpenditure: capex,
        netInvestingCashFlow: parseFloat(investingCashFlow.toFixed(2))
      },
      financingActivities: {
        loanRepayments: loanRepayment,
        netFinancingCashFlow: parseFloat(financingCashFlow.toFixed(2))
      },
      netChangeInCash: parseFloat(netChangeInCash.toFixed(2)),
      beginningCashBalance: beginningCash,
      endingCashBalance: parseFloat(endingCash.toFixed(2))
    };
  };

  /**
   * Trial Balance Generator
   */
  const getTrialBalance = () => {
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
  };


  // ==========================================
  // REAL-TIME COMPUTED METRICS & KPIS
  // ==========================================
  const metrics = useMemo(() => {
    const liquidCash = accounts
      .filter(a => a.is_cash)
      .reduce((sum, a) => sum + (a.current_balance || 0), 0);

    const inventoryValuation = (inventory || []).reduce(
      (sum, item) => sum + ((item.stock || 0) * (item.unitCost || 0)),
      0
    );

    const totalAR = invoices
      .filter(i => i.status !== 'PAID')
      .reduce((sum, i) => sum + (i.balance_due || 0), 0);

    const totalAP = bills
      .filter(b => b.payment_status !== 'PAID')
      .reduce((sum, b) => sum + (b.balance_due || 0), 0);

    const grirBalance = accounts.find(a => a.account_code === '20200')?.current_balance || 0;

    const is = getIncomeStatement();
    const bs = getBalanceSheet();

    // Aging Buckets
    const arAging = {
      current: totalAR * 0.55,
      days30: totalAR * 0.25,
      days60: totalAR * 0.12,
      days90: totalAR * 0.08
    };

    const apAging = {
      current: totalAP * 0.60,
      days30: totalAP * 0.22,
      days60: totalAP * 0.10,
      days90: totalAP * 0.08
    };

    return {
      liquidCash: parseFloat(liquidCash.toFixed(2)),
      inventoryValuation: parseFloat(inventoryValuation.toFixed(2)),
      totalAR: parseFloat(totalAR.toFixed(2)),
      totalAP: parseFloat(totalAP.toFixed(2)),
      grirBalance: parseFloat(grirBalance.toFixed(2)),
      totalPayables: parseFloat((totalAP + grirBalance).toFixed(2)),
      netRevenue: is.revenue.netRevenue,
      grossProfit: is.grossProfit,
      grossMargin: is.grossMarginPercent,
      operatingIncome: is.operatingIncome,
      netIncome: is.netProfit,
      operatingMargin: is.netProfitMarginPercent,
      totalAssets: bs.totalAssets,
      totalLiabilities: bs.totalLiabilities,
      totalEquity: bs.equity.total,
      isGLEquilibrium: bs.isBalanced,
      deltaEquilibrium: bs.equilibriumDelta,
      arAging,
      apAging
    };
  }, [accounts, inventory, invoices, bills]);


  // ==========================================
  // CONTEXT VALUE PAYLOAD
  // ==========================================
  const value = {
    // State Models
    accounts,
    journalEntries,
    threeWayMatches,
    matches: threeWayMatches, // Alias
    bills,
    invoices,
    parties,
    valuationRules,
    costCenters,
    requisitions,
    fixedAssets,
    depreciationRuns,
    payrollRecords,
    payrollRuns: payrollRecords, // Alias
    vatFiling,
    vatReturns: vatFiling, // Alias
    bankAccounts,
    bankTransactions,
    auditLog,

    // New Module States (Topics 1, 2, 4, 5, 6, 16)
    budgets,
    forecastModels,
    reconciliations,
    unmatchedBankTransactions,
    unmatchedTransactions: unmatchedBankTransactions, // Alias
    reconciliationLogs,
    approvalRequests,
    approvals: approvalRequests, // Alias
    controlMatrix,
    sodRules,
    tenders,
    procurementThresholds,
    bankGuarantees,
    cashFlowEntries,
    liquidityForecasts,
    workingCapitalMetrics,
    pdcPortfolio,
    policies,
    regulatoryReferences,

    // Real-Time Metrics & KPIs
    metrics,

    // Action Methods
    postJournalEntry,
    createJournalEntry: postJournalEntry,
    reverseJournalEntry,
    runThreeWayMatch,
    runAutoMatch,
    createBill,
    createBillFromPO: (poNumber, billData) => createBill({ ...billData, po_reference: poNumber }),
    payBill,
    executePaymentRun: (billIds, bankAccountId) => billIds.forEach(id => payBill(id, { bank_account_id: bankAccountId })),
    createInvoice,
    createInvoiceFromSO: (soNumber, invData) => createInvoice({ ...invData, so_reference: soNumber }),
    receivePayment,
    recordCustomerPayment: (invoiceId, amount, bankAccountId) => receivePayment(invoiceId, { amount, bank_account_id: bankAccountId }),
    createParty,
    addParty: createParty,
    updateParty,
    updateValuationRule,
    createRequisition,
    createDepartmentRequisition: (costCenterCode, items, staffName) => createRequisition({ cost_center_code: costCenterCode, items, staff_name: staffName }),
    runDepreciation,
    runMonthlyDepreciation: runDepreciation,
    processPayroll,
    executePayrollRun: processPayroll,
    exportWpsSifFile,
    fileVatReturn,
    submitVatReturn: fileVatReturn,
    reconcileBankSession,

    // Topic 1: Budgeting & Forecasting Actions
    createBudget,
    updateBudget,
    addBudgetLineItem,
    setActiveForecastModel,

    // Topic 2: Account Reconciliation Actions
    reconcileAccount,
    addReconciliationAdjustment,
    matchTransaction,

    // Topic 4: Internal Controls & Approvals Actions
    approveRequest,
    rejectRequest,
    createApprovalRequest,
    updateControlMatrix,

    // Topic 5: Tender & Bid Auditing Actions
    createTender,
    submitBid,
    awardTender,
    addBankGuarantee,

    // Topic 6: Cash Flow Management Actions
    addCashFlowEntry,
    updateLiquidityForecasts,
    updateWorkingCapitalMetrics,
    updatePdcStatus,

    // Topic 16: Financial Policies Actions
    updatePolicyStatus,
    addPolicyRevision,
    updateRegulatoryRule,

    // Financial Statements Generators
    getBalanceSheet,
    getIncomeStatement,
    getCashFlowStatement,
    getTrialBalance,
    financialStatements: {
      get balanceSheet() { return getBalanceSheet(); },
      get incomeStatement() { return getIncomeStatement(); },
      get cashFlowStatement() { return getCashFlowStatement(); },
      get trialBalance() { return getTrialBalance(); }
    }
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

/**
 * Custom Hook for consuming Financial Context
 */
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export default FinanceContext;
