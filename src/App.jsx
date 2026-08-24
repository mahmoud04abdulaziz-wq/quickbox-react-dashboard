import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomeView from './pages/HomeView';
import DashboardView from './pages/DashboardView';
import InventoryView from './pages/InventoryView';
import StockOpsView from './pages/StockOpsView';
import AuditLogsView from './pages/AuditLogsView';
import RopAlertsView from './pages/RopAlertsView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import { InventoryProvider } from './context/InventoryContext';
import { FinanceProvider } from './context/FinanceContext';
import ErrorBoundary from './components/ErrorBoundary';

// Finance Views (F1 - F11)
import FinancialDashboardView from './pages/finance/FinancialDashboardView';
import GeneralLedgerView from './pages/finance/GeneralLedgerView';
import ThreeWayMatchingView from './pages/finance/ThreeWayMatchingView';
import AccountsPayableView from './pages/finance/AccountsPayableView';
import AccountsReceivableView from './pages/finance/AccountsReceivableView';
import PartyDirectoryView from './pages/finance/PartyDirectoryView';
import ValuationRulesView from './pages/finance/ValuationRulesView';
import CostCentersView from './pages/finance/CostCentersView';
import FixedAssetsView from './pages/finance/FixedAssetsView';
import PayrollVatView from './pages/finance/PayrollVatView';
import FinancialStatementsView from './pages/finance/FinancialStatementsView';

// 6 New Jordanian Financial Views
import BudgetingForecastingView from './pages/finance/BudgetingForecastingView';
import AccountReconciliationView from './pages/finance/AccountReconciliationView';
import InternalControlsView from './pages/finance/InternalControlsView';
import TenderBidAuditingView from './pages/finance/TenderBidAuditingView';
import CashFlowManagementView from './pages/finance/CashFlowManagementView';
import FinancialPoliciesView from './pages/finance/FinancialPoliciesView';


import SocialSecurityView from './pages/finance/SocialSecurityView';
import IncomeTaxView from './pages/finance/IncomeTaxView';
import DeductionCalcView from './pages/finance/DeductionCalcView';
import PayrollProcessView from './pages/finance/PayrollProcessView';
import ExpenseClassView from './pages/finance/ExpenseClassView';
import FixedExpensesView from './pages/finance/FixedExpensesView';
import TaxExemptionsView from './pages/finance/TaxExemptionsView';
import FinancialPolicyView from './pages/finance/FinancialPolicyView';

import './App.css';

/**
 * App Component
 * Entry point of the React application, sets up routing and global context providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <InventoryProvider>
        <FinanceProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Inventory Routes */}
                <Route index element={<HomeView />} />
                <Route path="dashboard" element={<DashboardView />} />
                <Route path="inventory" element={<InventoryView />} />
                <Route path="stock" element={<StockOpsView />} />
                <Route path="audit" element={<AuditLogsView />} />
                <Route path="alerts" element={<RopAlertsView />} />
                <Route path="reports" element={<ReportsView />} />
                <Route path="settings" element={<SettingsView />} />

                {/* Finance Routes (F1 to F11) */}
                <Route path="finance" element={<FinancialDashboardView />} />
                <Route path="finance/dashboard" element={<FinancialDashboardView />} />
                <Route path="finance/general-ledger" element={<GeneralLedgerView />} />
                <Route path="finance/3-way-matching" element={<ThreeWayMatchingView />} />
                <Route path="finance/accounts-payable" element={<AccountsPayableView />} />
                <Route path="finance/accounts-receivable" element={<AccountsReceivableView />} />
                <Route path="finance/parties" element={<PartyDirectoryView />} />
                <Route path="finance/valuation-rules" element={<ValuationRulesView />} />
                <Route path="finance/cost-centers" element={<CostCentersView />} />
                <Route path="finance/fixed-assets" element={<FixedAssetsView />} />
                <Route path="finance/payroll-vat" element={<PayrollVatView />} />
                <Route path="finance/financial-statements" element={<FinancialStatementsView />} />

                {/* 6 New Jordanian Finance Routes */}
                <Route path="finance/budgeting" element={<BudgetingForecastingView />} />
                <Route path="finance/reconciliation" element={<AccountReconciliationView />} />
                <Route path="finance/internal-controls" element={<InternalControlsView />} />
                <Route path="finance/tenders" element={<TenderBidAuditingView />} />
                <Route path="finance/cash-flow" element={<CashFlowManagementView />} />
                <Route path="finance/policies" element={<FinancialPoliciesView />} />

                {/* Convenient Aliases */}
                <Route path="finance/gl" element={<GeneralLedgerView />} />
                <Route path="finance/matching" element={<ThreeWayMatchingView />} />
                <Route path="finance/payable" element={<AccountsPayableView />} />
                <Route path="finance/receivable" element={<AccountsReceivableView />} />
                <Route path="finance/valuation" element={<ValuationRulesView />} />
                <Route path="finance/costcenters" element={<CostCentersView />} />
                <Route path="finance/assets" element={<FixedAssetsView />} />
                <Route path="finance/payroll" element={<PayrollVatView />} />
                <Route path="finance/statements" element={<FinancialStatementsView />} />
                <Route path="finance/budget" element={<BudgetingForecastingView />} />
                <Route path="finance/forecast" element={<BudgetingForecastingView />} />
                <Route path="finance/recon" element={<AccountReconciliationView />} />
                <Route path="finance/controls" element={<InternalControlsView />} />
                <Route path="finance/approvals" element={<InternalControlsView />} />
                <Route path="finance/bids" element={<TenderBidAuditingView />} />
                <Route path="finance/tender-auditing" element={<TenderBidAuditingView />} />
                <Route path="finance/cashflow" element={<CashFlowManagementView />} />
                <Route path="finance/cash" element={<CashFlowManagementView />} />
                <Route path="finance/financial-policies" element={<FinancialPoliciesView />} />
                <Route path="finance/governance" element={<FinancialPoliciesView />} />
                <Route path="finance/social-security" element={<SocialSecurityView />} />
                <Route path="finance/income-tax" element={<IncomeTaxView />} />
                <Route path="finance/deduction-calc" element={<DeductionCalcView />} />
                <Route path="finance/payroll-process" element={<PayrollProcessView />} />
                <Route path="finance/expense-classification" element={<ExpenseClassView />} />
                <Route path="finance/fixed-expenses" element={<FixedExpensesView />} />
                <Route path="finance/tax-exemptions" element={<TaxExemptionsView />} />
                <Route path="finance/financial-policy" element={<FinancialPolicyView />} />
              </Route>
              </Routes>
          </BrowserRouter>
        </FinanceProvider>
      </InventoryProvider>
    </ErrorBoundary>
  );
}

export default App;
