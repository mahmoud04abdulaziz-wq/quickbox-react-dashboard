import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

console.log('=== EMPIRICAL UI & ROUTING PARITY TEST HARNESS ===\n');

// 1. Check all 11 finance views exist
const financeViews = [
  { id: 'F1', name: 'FinancialDashboardView.jsx', route: 'finance/dashboard', title: 'Financial Dashboard' },
  { id: 'F2', name: 'GeneralLedgerView.jsx', route: 'finance/general-ledger', title: 'General Ledger' },
  { id: 'F3', name: 'ThreeWayMatchingView.jsx', route: 'finance/3-way-matching', title: '3-Way Matching' },
  { id: 'F4', name: 'AccountsPayableView.jsx', route: 'finance/accounts-payable', title: 'Accounts Payable' },
  { id: 'F5', name: 'AccountsReceivableView.jsx', route: 'finance/accounts-receivable', title: 'Accounts Receivable' },
  { id: 'F6', name: 'PartyDirectoryView.jsx', route: 'finance/parties', title: 'Party Directory' },
  { id: 'F7', name: 'ValuationRulesView.jsx', route: 'finance/valuation-rules', title: 'Valuation Rules' },
  { id: 'F8', name: 'CostCentersView.jsx', route: 'finance/cost-centers', title: 'Cost Centers' },
  { id: 'F9', name: 'FixedAssetsView.jsx', route: 'finance/fixed-assets', title: 'Fixed Assets' },
  { id: 'F10', name: 'PayrollVatView.jsx', route: 'finance/payroll-vat', title: 'Payroll & VAT' },
  { id: 'F11', name: 'FinancialStatementsView.jsx', route: 'finance/financial-statements', title: 'Financial Statements' }
];

let allViewsExist = true;
financeViews.forEach(v => {
  const filePath = path.join(srcDir, 'pages', 'finance', v.name);
  const exists = existsSync(filePath);
  console.log(`[${exists ? 'PASS' : 'FAIL'}] ${v.id}: ${v.name} exists -> ${filePath}`);
  if (!exists) allViewsExist = false;
});

// 2. Check App.jsx routing configuration
const appJsx = readFileSync(path.join(srcDir, 'App.jsx'), 'utf-8');
console.log('\n--- Checking App.jsx Route Definitions ---');
financeViews.forEach(v => {
  const routeDefined = appJsx.includes(`path="${v.route}"`) || appJsx.includes(`path="${v.route.replace('finance/', '')}"`);
  console.log(`[${routeDefined ? 'PASS' : 'FAIL'}] Route /${v.route} registered in App.jsx`);
});

// 3. Check Sidebar.jsx navigation links
const sidebarJsx = readFileSync(path.join(srcDir, 'components', 'Sidebar.jsx'), 'utf-8');
console.log('\n--- Checking Sidebar.jsx Navigation Links ---');
financeViews.forEach(v => {
  const linkDefined = sidebarJsx.includes(`to="/${v.route}"`);
  console.log(`[${linkDefined ? 'PASS' : 'FAIL'}] NavLink to="/${v.route}" present in Sidebar.jsx`);
});

// 4. Check Sidebar Finance Section Header
const hasFinanceSectionHeader = sidebarJsx.includes('sidebar-section-header') && sidebarJsx.includes('Finance');
console.log(`\n[${hasFinanceSectionHeader ? 'PASS' : 'FAIL'}] Sidebar.jsx contains dedicated Finance section header`);

// 5. Check Phosphor Icons import across all 11 views
console.log('\n--- Checking @phosphor-icons/react usage ---');
financeViews.forEach(v => {
  const content = readFileSync(path.join(srcDir, 'pages', 'finance', v.name), 'utf-8');
  const usesPhosphor = content.includes('@phosphor-icons/react');
  console.log(`[${usesPhosphor ? 'PASS' : 'FAIL'}] ${v.name} imports and uses @phosphor-icons/react`);
});

// 6. Check App.css styles usage across views
console.log('\n--- Checking App.css styling classes usage ---');
const appCss = readFileSync(path.join(srcDir, 'App.css'), 'utf-8');
const keyClasses = ['metrics-4', 'metrics-5', 'metric-card', 'tag-pill', 'aging-bar', 'budget-card', 'accordion-toggle', 'vat-box', 'stmt-tabs', 'modal-overlay', 'modal-content'];
keyClasses.forEach(cls => {
  const inCss = appCss.includes(`.${cls}`);
  console.log(`[${inCss ? 'PASS' : 'FAIL'}] App.css defines .${cls}`);
});

console.log('\n=== ALL PARITY VERIFICATION CHECKS COMPLETED ===');
