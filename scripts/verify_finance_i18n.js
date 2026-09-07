#!/usr/bin/env node
/**
 * Automated Verification Test Suite for QuickBox Finance i18n & BiDi RTL Compliance
 *
 * Covers all 4 Tiers:
 *   - Tier 1: String Extraction (BudgetingForecastingView & all finance views)
 *   - Tier 2: Dictionary Symmetry & Completeness (en vs ar, keys called vs dicts, untranslated English check)
 *   - Tier 3: BiDi & Logical Layout (physical styles to logical, dir="ltr" / bidi-ltr on numbers/codes)
 *   - Tier 4: Build Verification (`npm run build` clean Vite compilation)
 *
 * Usage:
 *   node scripts/verify_finance_i18n.js              # Runs all 4 tiers
 *   node scripts/verify_finance_i18n.js --skip-build # Runs Tiers 1-3 only (fast verification)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const financePagesDir = path.join(rootDir, 'src', 'pages', 'finance');
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales');

// CLI options
const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

let totalPassed = 0;
let totalFailed = 0;
const failuresByTier = {
  tier1: [],
  tier2: [],
  tier3: [],
  tier4: [],
  tier5: [],
};

function recordAssert(condition, tier, testName, details = '') {
  if (condition) {
    if (!errorsOnly) console.log(`  ${colors.green}✓ PASS${colors.reset}: ${testName}`);
    totalPassed++;
    return true;
  } else {
    console.error(`  ${colors.red}✗ FAIL${colors.reset}: ${testName}`);
    if (details) {
      console.error(`    ${colors.gray}↳ ${details}${colors.reset}`);
    }
    totalFailed++;
    failuresByTier[tier].push({ testName, details });
    return false;
  }
}

// Utility: Recursively flatten JSON dictionary keys into dot notation
function flattenDict(obj, prefix = '') {
  let keys = {};
  for (const [k, v] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(keys, flattenDict(v, currentKey));
    } else {
      keys[currentKey] = v;
    }
  }
  return keys;
}

// Utility: Read all finance JSX views (excluding re-export aliases)
function getFinanceViews() {
  const files = fs.readdirSync(financePagesDir);
  const reExportAliases = ['CashFlowView.jsx', 'TenderAuditingView.jsx'];
  return files
    .filter(f => f.endsWith('.jsx'))
    .map(f => ({
      name: f,
      fullPath: path.join(financePagesDir, f),
      isReExport: reExportAliases.includes(f),
      content: fs.readFileSync(path.join(financePagesDir, f), 'utf-8'),
    }));
}

// Utility to strip JSX expressions and HTML tags from a snippet
function stripJsxAndTags(content) {
  let text = content;
  // Remove multi-line and single-line comments
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove JSX expressions { ... }
  // Iteratively remove balanced innermost braces
  for (let i = 0; i < 5; i++) {
    text = text.replace(/\{[^{}]*\}/g, '');
  }
  // Remove HTML/JSX tags <...>
  text = text.replace(/<[^>]+>/g, '');
  return text.trim();
}

console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  QuickBox Finance i18n & BiDi RTL Automated Verification Suite${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`Target Directory: ${financePagesDir}`);
console.log(`Locales Directory: ${localesDir}`);
const errorsOnly = !args.includes('--verbose');

if (skipBuild) {
  console.log(`${colors.yellow}Notice: --skip-build flag detected. Tier 4 will be bypassed.${colors.reset}`);
}

// ======================================================================
// TIER 1: STRING EXTRACTION & JSX WIRING
// ======================================================================
console.log(`\n${colors.bold}${colors.magenta}--- TIER 1: String Extraction & View Wiring ---${colors.reset}`);

const views = getFinanceViews();
const activeViews = views.filter(v => !v.isReExport);

// Check 1.1: Unwired views scan (views with 0 t(...) calls)
const unwiredViews = [];
for (const view of activeViews) {
  const tCalls = [...view.content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)];
  if (tCalls.length === 0) {
    unwiredViews.push(view.name);
  }
}

recordAssert(
  unwiredViews.length === 0,
  'tier1',
  `No unwired finance views with 0 t() calls (Found ${unwiredViews.length} unwired views)`,
  unwiredViews.length > 0 ? `Unwired views: ${unwiredViews.join(', ')}` : ''
);

// Specifically verify the 5 primary unwired views flagged in explorer reports
const targetFive = [
  'BudgetingForecastingView.jsx',
  'CashFlowManagementView.jsx',
  'CostCentersView.jsx',
  'FinancialStatementsView.jsx',
  'FixedAssetsView.jsx',
];

for (const targetName of targetFive) {
  const viewObj = activeViews.find(v => v.name === targetName);
  if (!viewObj) {
    recordAssert(false, 'tier1', `${targetName} exists in src/pages/finance/`, 'File missing');
    continue;
  }
  const tCalls = [...viewObj.content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)];
  recordAssert(
    tCalls.length > 0,
    'tier1',
    `${targetName} has active t() calls (Found ${tCalls.length} calls)`,
    tCalls.length === 0 ? 'View is 100% unwired, rendering raw English literals' : ''
  );
}

// Check 1.2: BudgetingForecastingView.jsx Specific String Extraction
const budgetView = activeViews.find(v => v.name === 'BudgetingForecastingView.jsx');
if (budgetView) {
  const content = budgetView.content;

  // Specific required items from Acceptance Criteria:
  const requiredChecks = [
    {
      label: 'Heading: "Budgeting & Multi-Period Forecasting"',
      test: !content.includes('Budgeting &amp; Multi-Period Forecasting') && !content.includes('Budgeting & Multi-Period Forecasting'),
      detail: 'Raw heading string "Budgeting & Multi-Period Forecasting" is still hardcoded in JSX',
    },
    {
      label: 'KPI Label: "Annual Budget (FY26)"',
      test: !content.includes('<span className="metric-label">Annual Budget (FY26)</span>'),
      detail: 'Raw KPI label "Annual Budget (FY26)" is still hardcoded in JSX',
    },
    {
      label: 'KPI Label: "Actual Spend YTD"',
      test: !content.includes('<span className="metric-label">Actual Spend YTD</span>'),
      detail: 'Raw KPI label "Actual Spend YTD" is still hardcoded in JSX',
    },
    {
      label: 'KPI Label: "Budget Variance"',
      test: !content.includes('<span className="metric-label">Budget Variance</span>'),
      detail: 'Raw KPI label "Budget Variance" is still hardcoded in JSX',
    },
    {
      label: 'KPI Label: "Projected EOY EBITDA"',
      test: !content.includes('<span className="metric-label">Projected EOY EBITDA</span>'),
      detail: 'Raw KPI label "Projected EOY EBITDA" is still hardcoded in JSX',
    },
    {
      label: 'KPI Label: "Monthly Break-Even"',
      test: !content.includes('<span className="metric-label">Monthly Break-Even</span>'),
      detail: 'Raw KPI label "Monthly Break-Even" is still hardcoded in JSX',
    },
  ];

  for (const item of requiredChecks) {
    recordAssert(item.test, 'tier1', `BudgetingForecastingView.jsx: ${item.label}`, item.detail);
  }

  // All 4 tab buttons in BudgetingForecastingView.jsx
  const tabChecks = [
    {
      label: 'Tab 1: Departmental Cost Centers',
      test: !content.includes('Departmental Cost Centers ({budgets.length})') &&
            !content.includes('Departmental Cost Centers ('),
      detail: 'Tab 1 label "Departmental Cost Centers" is not wired with t()',
    },
    {
      label: 'Tab 2: Rolling Forecast & Scenario Modeling',
      test: !content.includes('Rolling Forecast &amp; Scenario Modeling') &&
            !content.includes('Rolling Forecast & Scenario Modeling'),
      detail: 'Tab 2 label "Rolling Forecast & Scenario Modeling" is not wired with t()',
    },
    {
      label: 'Tab 3: Fixed Recurring Schedule',
      test: !content.includes('Fixed Recurring Schedule</button>') &&
            !content.includes('>Fixed Recurring Schedule<'),
      detail: 'Tab 3 label "Fixed Recurring Schedule" is not wired with t()',
    },
    {
      label: 'Tab 4: Break-Even & Sensitivity Simulator',
      test: !content.includes('Break-Even &amp; Sensitivity Simulator') &&
            !content.includes('Break-Even & Sensitivity Simulator'),
      detail: 'Tab 4 label "Break-Even & Sensitivity Simulator" is not wired with t()',
    },
  ];

  for (const tab of tabChecks) {
    recordAssert(tab.test, 'tier1', `BudgetingForecastingView.jsx: ${tab.label}`, tab.detail);
  }

  // Table column headers (<th>) in BudgetingForecastingView.jsx
  const rawThMatches = [...content.matchAll(/<th(?:\s+[^>]*?)?>([^<]+)<\/th>/gi)]
    .map(m => m[1].trim())
    .filter(text => text.length > 0 && !text.includes('{') && /^[A-Za-z0-9\s()&/-]+$/.test(text));

  recordAssert(
    rawThMatches.length === 0,
    'tier1',
    `BudgetingForecastingView.jsx: All <th> table headers localized via t() (Found ${rawThMatches.length} raw headers)`,
    rawThMatches.length > 0 ? `Unlocalized headers: ${rawThMatches.slice(0, 8).join(', ')}...` : ''
  );
}

// Check 1.3: Dynamic regex verification of all <th> headers in AccountReconciliationView.jsx (Facade Elimination)
const reconView = activeViews.find(v => v.name === 'AccountReconciliationView.jsx');
if (reconView) {
  const allThMatches = [...reconView.content.matchAll(/<th(?:\s+[^>]*?)?>([\s\S]*?)<\/th>/gi)];
  const rawThMatches = allThMatches
    .map(m => stripJsxAndTags(m[1]))
    .filter(text => {
      const words = text.match(/[A-Za-z]{2,}/g);
      return words && words.length > 0;
    });

  recordAssert(
    allThMatches.length >= 20 && rawThMatches.length === 0,
    'tier1',
    `AccountReconciliationView.jsx: All <th> headers across all 4 tables dynamically localized via t() (Found ${allThMatches.length} headers, ${rawThMatches.length} raw)`,
    rawThMatches.length > 0 ? `Unlocalized headers: ${rawThMatches.join(', ')}` : ''
  );
}

// Check 1.4: Notification Surface Verification - ToastNotification.jsx
const toastPath = path.join(rootDir, 'src', 'components', 'ToastNotification.jsx');
if (fs.existsSync(toastPath)) {
  const toastContent = fs.readFileSync(toastPath, 'utf-8');
  const hasLowStockTitle = toastContent.includes("'toast.low_stock_title'") || toastContent.includes('"toast.low_stock_title"');
  const hasCloseKey = toastContent.includes("'toast.close'") || toastContent.includes('"toast.close"');
  const hasRequiredKey = hasLowStockTitle || hasCloseKey;
  recordAssert(
    hasRequiredKey,
    'tier1',
    'ToastNotification.jsx: Contains localized toast keys (toast.low_stock_title or toast.close)',
    !hasRequiredKey ? 'Missing required toast translation keys in ToastNotification.jsx' : ''
  );
} else {
  recordAssert(false, 'tier1', 'ToastNotification.jsx exists in src/components/', 'File missing');
}

// Check 1.5: Topbar Surface Verification - Topbar.jsx
const topbarPath = path.join(rootDir, 'src', 'components', 'Topbar.jsx');
if (fs.existsSync(topbarPath)) {
  const topbarContent = fs.readFileSync(topbarPath, 'utf-8');
  const hasSwitchKeys = (topbarContent.includes('topbar.switch_to_en') && topbarContent.includes('topbar.switch_to_ar'));
  const hasAvatarAlt = topbarContent.includes('topbar.user_name');
  recordAssert(
    hasSwitchKeys && hasAvatarAlt,
    'tier1',
    'Topbar.jsx: Language toggle uses localized switcher keys and user avatar has localized alt',
    !hasSwitchKeys ? 'Missing topbar.switch_to_en/ar keys' : !hasAvatarAlt ? 'Missing topbar.user_name key' : ''
  );
} else {
  recordAssert(false, 'tier1', 'Topbar.jsx exists in src/components/', 'File missing');
}


// ======================================================================
// TIER 2: DICTIONARY SYMMETRY & COMPLETENESS
// ======================================================================
console.log(`\n${colors.bold}${colors.magenta}--- TIER 2: Dictionary Symmetry & Completeness ---${colors.reset}`);

const enFinancePath = path.join(localesDir, 'en', 'finance.json');
const arFinancePath = path.join(localesDir, 'ar', 'finance.json');
const enCommonPath = path.join(localesDir, 'en', 'common.json');
const arCommonPath = path.join(localesDir, 'ar', 'common.json');
const enInventoryPath = path.join(localesDir, 'en', 'inventory.json');
const arInventoryPath = path.join(localesDir, 'ar', 'inventory.json');

let enFinance = {};
let arFinance = {};
let enCommon = {};
let arCommon = {};
let enInventory = {};
let arInventory = {};

let jsonParseOk = true;
try {
  enFinance = JSON.parse(fs.readFileSync(enFinancePath, 'utf-8'));
  arFinance = JSON.parse(fs.readFileSync(arFinancePath, 'utf-8'));
  enCommon = JSON.parse(fs.readFileSync(enCommonPath, 'utf-8'));
  arCommon = JSON.parse(fs.readFileSync(arCommonPath, 'utf-8'));
  enInventory = JSON.parse(fs.readFileSync(enInventoryPath, 'utf-8'));
  arInventory = JSON.parse(fs.readFileSync(arInventoryPath, 'utf-8'));
} catch (e) {
  jsonParseOk = false;
  recordAssert(false, 'tier2', 'Locale JSON files parse without syntax error', e.message);
}

if (jsonParseOk) {
  const flatEnFinance = flattenDict(enFinance);
  const flatArFinance = flattenDict(arFinance);
  const flatEnCommon = flattenDict(enCommon);
  const flatArCommon = flattenDict(arCommon);
  const flatEnInventory = flattenDict(enInventory);
  const flatArInventory = flattenDict(arInventory);

  // Check 2.1a: Key symmetry between en/finance.json and ar/finance.json
  const missingInArFinance = Object.keys(flatEnFinance).filter(k => flatArFinance[k] === undefined);
  const missingInEnFinance = Object.keys(flatArFinance).filter(k => flatEnFinance[k] === undefined);

  recordAssert(
    missingInArFinance.length === 0 && missingInEnFinance.length === 0,
    'tier2',
    `100% Symmetry: finance.json key parity between en/ and ar/ (EN: ${Object.keys(flatEnFinance).length}, AR: ${Object.keys(flatArFinance).length})`,
    missingInArFinance.length > 0 ? `Missing in AR: ${missingInArFinance.slice(0, 10).join(', ')}` : (missingInEnFinance.length > 0 ? `Missing in EN: ${missingInEnFinance.slice(0, 10).join(', ')}` : '')
  );

  // Check 2.1b: Key symmetry between en/common.json and ar/common.json
  const missingInArCommon = Object.keys(flatEnCommon).filter(k => flatArCommon[k] === undefined);
  const missingInEnCommon = Object.keys(flatArCommon).filter(k => flatEnCommon[k] === undefined);

  recordAssert(
    missingInArCommon.length === 0 && missingInEnCommon.length === 0,
    'tier2',
    `100% Symmetry: common.json key parity between en/ and ar/ (EN: ${Object.keys(flatEnCommon).length}, AR: ${Object.keys(flatArCommon).length})`,
    missingInArCommon.length > 0 ? `Missing in AR: ${missingInArCommon.slice(0, 10).join(', ')}` : (missingInEnCommon.length > 0 ? `Missing in EN: ${missingInEnCommon.slice(0, 10).join(', ')}` : '')
  );

  // Check 2.1c: Key symmetry between en/inventory.json and ar/inventory.json
  const missingInArInventory = Object.keys(flatEnInventory).filter(k => flatArInventory[k] === undefined);
  const missingInEnInventory = Object.keys(flatArInventory).filter(k => flatEnInventory[k] === undefined);

  recordAssert(
    missingInArInventory.length === 0 && missingInEnInventory.length === 0,
    'tier2',
    `100% Symmetry: inventory.json key parity between en/ and ar/ (EN: ${Object.keys(flatEnInventory).length}, AR: ${Object.keys(flatArInventory).length})`,
    missingInArInventory.length > 0 ? `Missing in AR: ${missingInArInventory.slice(0, 10).join(', ')}` : (missingInEnInventory.length > 0 ? `Missing in EN: ${missingInEnInventory.slice(0, 10).join(', ')}` : '')
  );

  // Check 2.2: Verification of all keys called across src/pages/finance/*.jsx
  const financeKeysCalled = new Set();
  const commonKeysCalled = new Set();
  const keysWithFallback = new Set();

  for (const view of activeViews) {
    // Matches t('namespace:key') or t('key') or t('key', { ns: 'common' })
    // Negative lookahead (?!\s*\+) ensures dynamic key concatenations like t('status_' + x) are not captured as raw static keys
    const matches = [...view.content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`](?!\s*\+)(?:\s*,\s*(?:\{([^}]*)\}|['"`]([^'"`]*?)['"`]))?/g)];
    for (const match of matches) {
      let key = match[1];
      if (key.endsWith('_')) continue;
      let optsStr = match[2] || '';
      let defaultArg = match[3];

      let explicitNs = null;
      if (/ns:\s*['"`]([^'"`]+)['"`]/.test(optsStr)) {
        explicitNs = optsStr.match(/ns:\s*['"`]([^'"`]+)['"`]/)[1];
      }

      const hasDefault = Boolean(defaultArg || /defaultValue:\s*['"`]/.test(optsStr));

      if (key.includes(':')) {
        const parts = key.split(':');
        const ns = parts[0];
        const actualKey = parts[1];
        if (ns === 'common') {
          commonKeysCalled.add(actualKey);
          if (hasDefault) keysWithFallback.add(actualKey);
        } else {
          financeKeysCalled.add(actualKey);
          if (hasDefault) keysWithFallback.add(actualKey);
        }
      } else if (explicitNs === 'common') {
        commonKeysCalled.add(key);
        if (hasDefault) keysWithFallback.add(key);
      } else {
        // Default namespace in finance views is finance
        financeKeysCalled.add(key);
        if (hasDefault) keysWithFallback.add(key);
      }
    }
  }

  // Check that all called finance keys exist in en/finance and ar/finance (or provide inline default)
  const missingCalledInEnFinance = [...financeKeysCalled].filter(k => flatEnFinance[k] === undefined && !keysWithFallback.has(k));
  const missingCalledInArFinance = [...financeKeysCalled].filter(k => flatArFinance[k] === undefined && !keysWithFallback.has(k));

  recordAssert(
    missingCalledInEnFinance.length === 0,
    'tier2',
    `All finance keys called in JSX exist in en/finance.json (Missing: ${missingCalledInEnFinance.length})`,
    missingCalledInEnFinance.length > 0 ? `Missing in en/finance.json: ${missingCalledInEnFinance.slice(0, 10).join(', ')}` : ''
  );

  recordAssert(
    missingCalledInArFinance.length === 0,
    'tier2',
    `All finance keys called in JSX exist in ar/finance.json (Missing: ${missingCalledInArFinance.length})`,
    missingCalledInArFinance.length > 0 ? `Missing in ar/finance.json: ${missingCalledInArFinance.slice(0, 10).join(', ')}` : ''
  );

  // Check that all called common keys exist in en/common and ar/common
  const missingCalledInEnCommon = [...commonKeysCalled].filter(k => flatEnCommon[k] === undefined && !keysWithFallback.has(k));
  const missingCalledInArCommon = [...commonKeysCalled].filter(k => flatArCommon[k] === undefined && !keysWithFallback.has(k));

  recordAssert(
    missingCalledInEnCommon.length === 0,
    'tier2',
    `All common keys called in finance JSX exist in en/common.json (Missing: ${missingCalledInEnCommon.length})`,
    missingCalledInEnCommon.length > 0 ? `Missing in en/common.json: ${missingCalledInEnCommon.slice(0, 10).join(', ')}` : ''
  );

  recordAssert(
    missingCalledInArCommon.length === 0,
    'tier2',
    `All common keys called in finance JSX exist in ar/common.json (Missing: ${missingCalledInArCommon.length})`,
    missingCalledInArCommon.length > 0 ? `Missing in ar/common.json: ${missingCalledInArCommon.slice(0, 10).join(', ')}` : ''
  );

  // Check 2.3: Verification of the 16 specific missing keys flagged by explorer
  const criticalKeys = [
    { ns: 'common', key: 'actions.action', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'status.Items', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'status.label', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'status.status', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'table.actions', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'table.amount', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'table.count', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'table.reference', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'th_date', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'common', key: 'th_description', enDict: flatEnCommon, arDict: flatArCommon },
    { ns: 'finance', key: 'party_directory.active_open_ledger', enDict: flatEnFinance, arDict: flatArFinance },
    { ns: 'finance', key: 'party_directory.drawer_title', enDict: flatEnFinance, arDict: flatArFinance },
    { ns: 'finance', key: 'party_directory.empty_docs', enDict: flatEnFinance, arDict: flatArFinance },
    { ns: 'finance', key: 'party_directory.tag_ap_bill', enDict: flatEnFinance, arDict: flatArFinance },
    { ns: 'finance', key: 'party_directory.tag_ar_invoice', enDict: flatEnFinance, arDict: flatArFinance },
    { ns: 'finance', key: 'party_directory.th_doc_type', enDict: flatEnFinance, arDict: flatArFinance },
  ];

  const missingCriticalEn = criticalKeys.filter(item => !item.enDict[item.key]);
  const missingCriticalAr = criticalKeys.filter(item => !item.arDict[item.key]);

  recordAssert(
    missingCriticalEn.length === 0,
    'tier2',
    `All 16 historically missing keys populated in English dictionaries (Missing: ${missingCriticalEn.length})`,
    missingCriticalEn.length > 0 ? `Missing in EN: ${missingCriticalEn.map(c => `${c.ns}:${c.key}`).join(', ')}` : ''
  );

  recordAssert(
    missingCriticalAr.length === 0,
    'tier2',
    `All 16 historically missing keys populated in Arabic dictionaries (Missing: ${missingCriticalAr.length})`,
    missingCriticalAr.length > 0 ? `Missing in AR: ${missingCriticalAr.map(c => `${c.ns}:${c.key}`).join(', ')}` : ''
  );

  // Check 2.4: Untranslated English in ar/finance.json
  const untranslatedArabicKeys = [];
  const arabicRegex = /[\u0600-\u06FF]/;
  const technicalExceptions = new Set(['JOD', 'USD', 'EBITDA', 'PDC', 'CCC', 'COGS', 'OPEX', 'GL', 'VAT', 'MT940', 'SHA-256']);

  for (const [key, val] of Object.entries(flatArFinance)) {
    if (typeof val === 'string' && val.trim().length > 0) {
      const words = val.trim().split(/\s+/);
      const isPureLatin = !arabicRegex.test(val) && /^[A-Za-z0-9\s.,()_/:#$%-]+$/.test(val);
      if (isPureLatin && words.length >= 2 && !technicalExceptions.has(val.trim())) {
        untranslatedArabicKeys.push({ key, val });
      }
    }
  }

  recordAssert(
    untranslatedArabicKeys.length === 0,
    'tier2',
    `Zero raw untranslated English strings in ar/finance.json (Found ${untranslatedArabicKeys.length})`,
    untranslatedArabicKeys.length > 0 ? `Examples: ${untranslatedArabicKeys.slice(0, 5).map(u => `${u.key} = "${u.val}"`).join('; ')}` : ''
  );

  // Check 2.5: Presence of professional Jordanian IFRS accounting terms in ar/finance.json
  const requiredTerms = [
    { term: 'موازنة', label: 'الموازنات التقديرية (Budgeting)' },
    { term: 'نقطة التعادل', label: 'نقطة التعادل (Break-Even)' },
    { term: 'مراكز التكلفة', label: 'مراكز التكلفة (Cost Centers)' },
    { term: 'الأصول الثابتة', label: 'الأصول الثابتة (Fixed Assets)' },
    { term: 'التدفقات النقدية', label: 'التدفقات النقدية (Cash Flows)' },
    { term: 'تسوية', label: 'تسوية الحسابات (Account Reconciliation)' },
  ];

  const arTextAll = Object.values(flatArFinance).join(' ');
  for (const item of requiredTerms) {
    const present = arTextAll.includes(item.term);
    recordAssert(
      present,
      'tier2',
      `Arabic terminology standard: contains "${item.term}" for ${item.label}`,
      present ? '' : `Term "${item.term}" not found in ar/finance.json`
    );
  }
}


// ======================================================================
// TIER 3: BIDI & LOGICAL LAYOUT
// ======================================================================
console.log(`\n${colors.bold}${colors.magenta}--- TIER 3: BiDi & CSS Logical Layout ---${colors.reset}`);

// Check 3.1: Physical directional inline CSS properties in finance views
const physicalStyleViolations = [];
for (const view of activeViews) {
  const lines = view.content.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (/textAlign:\s*['"](right|left)['"]/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'textAlign', code: line.trim() });
    }
    if (/borderLeft:/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'borderLeft', code: line.trim() });
    }
    if (/borderRight:/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'borderRight', code: line.trim() });
    }
    if (/marginLeft:/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'marginLeft', code: line.trim() });
    }
    if (/marginRight:/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'marginRight', code: line.trim() });
    }
    if (/paddingLeft:/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'paddingLeft', code: line.trim() });
    }
    if (/paddingRight:/.test(line)) {
      physicalStyleViolations.push({ file: view.name, line: lineNum, prop: 'paddingRight', code: line.trim() });
    }
  });
}

recordAssert(
  physicalStyleViolations.length === 0,
  'tier3',
  `No physical directional inline styles in finance JSX views (Found ${physicalStyleViolations.length})`,
  physicalStyleViolations.length > 0
    ? `Violations: ${physicalStyleViolations.map(v => `${v.file}:${v.line} (${v.prop})`).join(', ')}`
    : ''
);

// Specifically verify the 4 known physical style instances from explorer report
const specificPhysicalChecks = [
  { file: 'CostCentersView.jsx', pattern: /textAlign:\s*['"]right['"]/, name: 'CostCentersView: textAlign: right -> end' },
  { file: 'BudgetingForecastingView.jsx', pattern: /borderLeft:/, name: 'BudgetingForecastingView: borderLeft -> borderInlineStart' },
  { file: 'FinancialStatementsView.jsx', pattern: /marginLeft:/, name: 'FinancialStatementsView: marginLeft -> marginInlineStart' },
  { file: 'InternalControlsView.jsx', pattern: /borderLeft:/, name: 'InternalControlsView: borderLeft -> borderInlineStart' },
];

for (const check of specificPhysicalChecks) {
  const targetFile = activeViews.find(v => v.name === check.file);
  const hasPhysical = targetFile && check.pattern.test(targetFile.content);
  recordAssert(
    !hasPhysical,
    'tier3',
    `Logical CSS Migration: ${check.name}`,
    hasPhysical ? `Physical style still present in ${check.file}` : ''
  );
}

// Check 3.2: BiDi & LTR Protection on Numbers/Codes across Core Finance Views (Tightened Thresholds)
const bidiCoreViews = [
  { name: 'AccountReconciliationView.jsx', minBidi: 15 },
  { name: 'BudgetingForecastingView.jsx', minBidi: 25 },
  { name: 'CashFlowManagementView.jsx', minBidi: 25 },
  { name: 'CostCentersView.jsx', minBidi: 15 },
  { name: 'FixedAssetsView.jsx', minBidi: 15 },
];

for (const target of bidiCoreViews) {
  const viewObj = activeViews.find(v => v.name === target.name);
  if (!viewObj) continue;
  const bidiLtrMatches = [...viewObj.content.matchAll(/bidi-ltr/g)].length;
  const dirLtrMatches = [...viewObj.content.matchAll(/dir=['"]ltr['"]/g)].length;
  recordAssert(
    bidiLtrMatches >= target.minBidi && dirLtrMatches >= target.minBidi,
    'tier3',
    `${target.name} has genuine BiDi protection (bidi-ltr: ${bidiLtrMatches} >= ${target.minBidi}, dir="ltr": ${dirLtrMatches} >= ${target.minBidi})`,
    bidiLtrMatches < target.minBidi ? `bidi-ltr count (${bidiLtrMatches}) is below required threshold ${target.minBidi}` : `dir="ltr" count (${dirLtrMatches}) is below required threshold ${target.minBidi}`
  );
}

// Check 3.3: App.css .bidi-ltr rule definition
const appCssPath = path.join(rootDir, 'src', 'App.css');
const appCssContent = fs.readFileSync(appCssPath, 'utf-8');
const hasBidiLtrClass = appCssContent.includes('.bidi-ltr');
const hasUnicodeBidiIsolate = appCssContent.includes('unicode-bidi: isolate');
const hasDirectionLtr = appCssContent.includes('direction: ltr !important');

recordAssert(
  hasBidiLtrClass && hasUnicodeBidiIsolate && hasDirectionLtr,
  'tier3',
  'App.css contains .bidi-ltr with direction: ltr !important and unicode-bidi: isolate',
  !hasBidiLtrClass ? 'Missing .bidi-ltr class' : ''
);

// Check 3.4: fontLoader.js RTL direction sync
const fontLoaderPath = path.join(rootDir, 'src', 'i18n', 'fontLoader.js');
const fontLoaderContent = fs.readFileSync(fontLoaderPath, 'utf-8');
const hasDirSync = fontLoaderContent.includes("document.documentElement.dir = isRtl ? 'rtl' : 'ltr'");
recordAssert(
  hasDirSync,
  'tier3',
  'fontLoader.js sets document.documentElement.dir dynamically based on language',
  'Missing documentElement.dir synchronization'
);

// Check 3.5: Notification Surface BiDi Isolation - ToastNotification.jsx
if (fs.existsSync(toastPath)) {
  const toastContent = fs.readFileSync(toastPath, 'utf-8');
  const hasToastBadgeBidi = toastContent.includes('bidi-ltr') && toastContent.includes('dir="ltr"');
  recordAssert(
    hasToastBadgeBidi,
    'tier3',
    'ToastNotification.jsx: Alert count badge preserves dir="ltr" and bidi-ltr',
    !hasToastBadgeBidi ? 'Count badge in ToastNotification.jsx lacks dir="ltr" or bidi-ltr' : ''
  );
}

// Check 3.6: Topbar Surface BiDi Isolation - Topbar.jsx
if (fs.existsSync(topbarPath)) {
  const topbarContent = fs.readFileSync(topbarPath, 'utf-8');
  const hasTopbarBadgeBidi = topbarContent.includes('bidi-ltr') && topbarContent.includes('dir="ltr"');
  recordAssert(
    hasTopbarBadgeBidi,
    'tier3',
    'Topbar.jsx: Pulsing alert badge preserves dir="ltr" and bidi-ltr',
    !hasTopbarBadgeBidi ? 'Pulsing badge in Topbar.jsx lacks dir="ltr" or bidi-ltr' : ''
  );
}


// ======================================================================
// TIER 4: BUILD & COMPILATION VERIFICATION
// ======================================================================
console.log(`\n${colors.bold}${colors.magenta}--- TIER 4: Build & Compilation Verification ---${colors.reset}`);

if (skipBuild) {
  console.log(`  ${colors.yellow}↷ SKIPPED: npm run build (bypassed via --skip-build flag)${colors.reset}`);
} else {
  let buildSuccess = false;
  let buildOutput = '';
  try {
    buildOutput = execSync('npm run build', {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    buildSuccess = true;
  } catch (err) {
    buildSuccess = false;
    buildOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  }

  recordAssert(
    buildSuccess,
    'tier4',
    'npm run build completes with exit code 0 (Vite build)',
    buildSuccess ? '' : `Build failed:\n${buildOutput.slice(0, 500)}`
  );
}


// ======================================================================
// TIER 5: INDEPENDENT ADVERSARIAL CHALLENGER AUDIT (challenger_finance_i18n_1)
// ======================================================================
console.log(`\n${colors.bold}${colors.magenta}--- TIER 5: Empirical Adversarial Stress Harness ---${colors.reset}`);

// Utility to strip JSX expressions and HTML tags from a snippet

// Adversarial Check 5.1: Universal Exhaustive Heading Scan (<h1> through <h6>) across ALL finance views
const rawHeadingsFound = [];
for (const view of activeViews) {
  const headingMatches = [...view.content.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)];
  for (const m of headingMatches) {
    const rawSnippet = m[1];
    const stripped = stripJsxAndTags(rawSnippet);
    // Check if remaining stripped text contains alphabetical words (>= 2 letters)
    const words = stripped.match(/[A-Za-z]{2,}/g);
    if (words && words.length > 0) {
      rawHeadingsFound.push({ file: view.name, text: words.join(' '), raw: rawSnippet.trim().slice(0, 60) });
    }
  }
}

recordAssert(
  rawHeadingsFound.length === 0,
  'tier5',
  `Adversarial: Zero raw English heading literals (<h1-6>) across all 27 finance views (Found ${rawHeadingsFound.length})`,
  rawHeadingsFound.length > 0
    ? `Violations in headings: ${rawHeadingsFound.slice(0, 5).map(h => `${h.file}: "${h.text}"`).join('; ')}`
    : ''
);

// Adversarial Check 5.2: Universal Exhaustive Table Header (<th>) Scan across ALL finance views
const rawThFound = [];
for (const view of activeViews) {
  const thMatches = [...view.content.matchAll(/<th(?:\s+[^>]*?)?>([\s\S]*?)<\/th>/gi)];
  for (const m of thMatches) {
    const rawSnippet = m[1];
    const stripped = stripJsxAndTags(rawSnippet);
    const words = stripped.match(/[A-Za-z]{2,}/g);
    if (words && words.length > 0) {
      rawThFound.push({ file: view.name, text: words.join(' '), raw: rawSnippet.trim().slice(0, 50) });
    }
  }
}

recordAssert(
  rawThFound.length === 0,
  'tier5',
  `Adversarial: Zero raw English table headers (<th>) across all 27 finance views (Found ${rawThFound.length})`,
  rawThFound.length > 0
    ? `Violations in <th>: ${rawThFound.slice(0, 5).map(h => `${h.file}: "${h.text}"`).join('; ')}`
    : ''
);

// Adversarial Check 5.3: Raw Button Text Scan (<button>) across ALL finance views (Nesting-Aware Parser)
function findJsxElements(content, tagName) {
  const openTagPrefix = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  const elements = [];
  let pos = 0;

  while (pos < content.length) {
    const startIdx = content.indexOf(openTagPrefix, pos);
    if (startIdx === -1) break;

    const after = content[startIdx + openTagPrefix.length];
    if (!after || !/\s|>|\//.test(after)) {
      pos = startIdx + openTagPrefix.length;
      continue;
    }

    let i = startIdx + openTagPrefix.length;
    let braceDepth = 0;
    let inQuote = null;
    let openTagEnd = -1;

    while (i < content.length) {
      const ch = content[i];
      if (inQuote) {
        if (ch === inQuote && content[i - 1] !== '\\') inQuote = null;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        inQuote = ch;
      } else if (ch === '{') {
        braceDepth++;
      } else if (ch === '}') {
        if (braceDepth > 0) braceDepth--;
      } else if (ch === '>' && braceDepth === 0) {
        openTagEnd = i;
        break;
      }
      i++;
    }

    if (openTagEnd === -1) {
      pos = startIdx + 1;
      continue;
    }

    if (content[openTagEnd - 1] === '/') {
      elements.push({
        openTag: content.slice(startIdx, openTagEnd + 1),
        body: '',
        full: content.slice(startIdx, openTagEnd + 1)
      });
      pos = openTagEnd + 1;
      continue;
    }

    let depth = 1;
    let currIdx = openTagEnd + 1;
    let endIdx = -1;

    while (currIdx < content.length && depth > 0) {
      const nextOpen = content.indexOf(openTagPrefix, currIdx);
      const nextClose = content.indexOf(closeTag, currIdx);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        const charAfter = content[nextOpen + openTagPrefix.length];
        if (charAfter && /\s|>|\//.test(charAfter)) {
          const nextTagCloseAngle = content.indexOf('>', nextOpen);
          if (nextTagCloseAngle !== -1 && content[nextTagCloseAngle - 1] === '/') {
            currIdx = nextTagCloseAngle + 1;
            continue;
          } else {
            depth++;
          }
        }
        currIdx = nextOpen + openTagPrefix.length;
      } else {
        depth--;
        if (depth === 0) {
          endIdx = nextClose;
          break;
        }
        currIdx = nextClose + closeTag.length;
      }
    }

    if (endIdx === -1) {
      pos = openTagEnd + 1;
      continue;
    }

    const body = content.slice(openTagEnd + 1, endIdx);
    elements.push({
      openTag: content.slice(startIdx, openTagEnd + 1),
      body,
      full: content.slice(startIdx, endIdx + closeTag.length)
    });
    pos = endIdx + closeTag.length;
  }
  return elements;
}

const rawButtonsFound = [];
for (const view of activeViews) {
  const btns = findJsxElements(view.content, 'button');
  for (const b of btns) {
    const rawSnippet = b.body;
    const stripped = stripJsxAndTags(rawSnippet);
    const words = stripped.match(/[A-Za-z]{2,}/g);
    if (words && words.length > 0) {
      rawButtonsFound.push({ file: view.name, text: words.join(' '), raw: rawSnippet.trim().slice(0, 50) });
    }
  }
}

recordAssert(
  rawButtonsFound.length === 0,
  'tier5',
  `Adversarial: Zero raw English button labels (<button>) across all 27 finance views (Found ${rawButtonsFound.length})`,
  rawButtonsFound.length > 0
    ? `Violations in <button>: ${rawButtonsFound.slice(0, 5).map(b => `${b.file}: "${b.text}"`).join('; ')}`
    : ''
);

// Adversarial Check 5.4: Hardcoded English Placeholders Scan (placeholder="...")
const rawPlaceholdersFound = [];
for (const view of activeViews) {
  const plMatches = [...view.content.matchAll(/\bplaceholder=(["'])(.*?)\1/gi)];
  for (const m of plMatches) {
    const val = m[2];
    if (/[A-Za-z]{2,}/.test(val)) {
      rawPlaceholdersFound.push({ file: view.name, placeholder: val });
    }
  }
}

recordAssert(
  rawPlaceholdersFound.length === 0,
  'tier5',
  `Adversarial: Zero hardcoded literal English input placeholders (Found ${rawPlaceholdersFound.length})`,
  rawPlaceholdersFound.length > 0
    ? `Literal placeholders: ${rawPlaceholdersFound.slice(0, 5).map(p => `${p.file}: "${p.placeholder}"`).join('; ')}`
    : ''
);

// Adversarial Check 5.5: Non-Empty Key Resolution Oracle
const emptyOrUnresolvedInEn = [];
const emptyOrUnresolvedInAr = [];

if (jsonParseOk) {
  const flatEnFinance = flattenDict(enFinance);
  const flatArFinance = flattenDict(arFinance);
  const flatEnCommon = flattenDict(enCommon);
  const flatArCommon = flattenDict(arCommon);
  const flatEnInventory = flattenDict(enInventory);
  const flatArInventory = flattenDict(arInventory);

  for (const view of activeViews) {
    const matches = [...view.content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`](?!\s*\+)(?:\s*,\s*(?:\{([^}]*)\}|['"`]([^'"`]*?)['"`]))?/g)];
    for (const match of matches) {
      let key = match[1];
      if (key.endsWith('_')) continue;
      let optsStr = match[2] || '';
      let defaultArg = match[3];
      let ns = 'finance';

      if (key.includes(':')) {
        const parts = key.split(':');
        ns = parts[0];
        key = parts[1];
      } else if (/ns:\s*['"`]common['"`]/.test(optsStr)) {
        ns = 'common';
      } else if (/ns:\s*['"`]inventory['"`]/.test(optsStr)) {
        ns = 'inventory';
      }

      let enVal, arVal;
      if (ns === 'finance') {
        enVal = flatEnFinance[key];
        arVal = flatArFinance[key];
      } else if (ns === 'common') {
        enVal = flatEnCommon[key];
        arVal = flatArCommon[key];
      } else if (ns === 'inventory') {
        enVal = flatEnInventory[key];
        arVal = flatArInventory[key];
      }

      // If a defaultValue was passed in the call, it satisfies resolution
      if ((typeof enVal !== 'string' || enVal.trim().length === 0) && defaultArg) {
        enVal = defaultArg;
      }
      if ((typeof arVal !== 'string' || arVal.trim().length === 0) && defaultArg) {
        arVal = defaultArg;
      }

      if (ns === 'finance' || ns === 'common' || ns === 'inventory') {
        if (typeof enVal !== 'string' || enVal.trim().length === 0) {
          emptyOrUnresolvedInEn.push({ file: view.name, ns, key, val: enVal });
        }
        if (typeof arVal !== 'string' || arVal.trim().length === 0) {
          emptyOrUnresolvedInAr.push({ file: view.name, ns, key, val: arVal });
        }
      }
    }
  }
}

recordAssert(
  emptyOrUnresolvedInEn.length === 0,
  'tier5',
  `Adversarial Oracle: All called t() keys resolve to non-empty strings in EN dictionaries (Found ${emptyOrUnresolvedInEn.length} empty/unresolved)`,
  emptyOrUnresolvedInEn.length > 0
    ? `Unresolved in EN: ${emptyOrUnresolvedInEn.slice(0, 5).map(e => `${e.file} -> ${e.ns}:${e.key}`).join(', ')}`
    : ''
);

recordAssert(
  emptyOrUnresolvedInAr.length === 0,
  'tier5',
  `Adversarial Oracle: All called t() keys resolve to non-empty strings in AR dictionaries (Found ${emptyOrUnresolvedInAr.length} empty/unresolved)`,
  emptyOrUnresolvedInAr.length > 0
    ? `Unresolved in AR: ${emptyOrUnresolvedInAr.slice(0, 5).map(e => `${e.file} -> ${e.ns}:${e.key}`).join(', ')}`
    : ''
);

// Adversarial Check 5.6: Placeholder Values Detection ("TODO", "key_not_found", "undefined", etc.)
const placeholderSuspiciousValues = [];
if (jsonParseOk) {
  const allDicts = [
    { name: 'en/finance.json', dict: flattenDict(enFinance) },
    { name: 'ar/finance.json', dict: flattenDict(arFinance) },
    { name: 'en/common.json', dict: flattenDict(enCommon) },
    { name: 'ar/common.json', dict: flattenDict(arCommon) },
    { name: 'en/inventory.json', dict: flattenDict(enInventory) },
    { name: 'ar/inventory.json', dict: flattenDict(arInventory) },
  ];

  const suspiciousPatterns = [
    /\bTODO\b/i,
    /\bFIXME\b/i,
    /\bkey_not_found\b/i,
    /\bundefined\b/i,
    /\bnull\b/i,
    /\bTBD\b/i,
    /\[missing\]/i,
    /lorem ipsum/i,
  ];

  for (const { name, dict } of allDicts) {
    for (const [key, val] of Object.entries(dict)) {
      if (typeof val === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(val)) {
            placeholderSuspiciousValues.push({ dict: name, key, val, pattern: pattern.toString() });
          }
        }
      }
    }
  }
}

recordAssert(
  placeholderSuspiciousValues.length === 0,
  'tier5',
  `Adversarial Oracle: No placeholder values (TODO, key_not_found, undefined, null, TBD) in locale dictionaries (Found ${placeholderSuspiciousValues.length})`,
  placeholderSuspiciousValues.length > 0
    ? `Suspicious values: ${placeholderSuspiciousValues.slice(0, 5).map(s => `${s.dict} [${s.key} = "${s.val}"]`).join('; ')}`
    : ''
);

// Adversarial Check 5.7: Interpolation Variable Symmetry Oracle ({{var}} consistency between EN and AR)
const interpolationMismatches = [];
if (jsonParseOk) {
  const pairsToCheck = [
    { name: 'finance.json', en: flattenDict(enFinance), ar: flattenDict(arFinance) },
    { name: 'common.json', en: flattenDict(enCommon), ar: flattenDict(arCommon) },
  ];

  for (const { name, en, ar } of pairsToCheck) {
    for (const [key, enVal] of Object.entries(en)) {
      const arVal = ar[key];
      if (typeof enVal === 'string' && typeof arVal === 'string') {
        const enVars = [...enVal.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)].map(m => m[1]).sort();
        const arVars = [...arVal.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)].map(m => m[1]).sort();

        if (JSON.stringify(enVars) !== JSON.stringify(arVars)) {
          interpolationMismatches.push({
            dict: name,
            key,
            enVars: enVars.join(','),
            arVars: arVars.join(','),
          });
        }
      }
    }
  }
}

recordAssert(
  interpolationMismatches.length === 0,
  'tier5',
  `Adversarial Oracle: 100% Interpolation variable symmetry across finance & common namespaces (Found ${interpolationMismatches.length} mismatches)`,
  interpolationMismatches.length > 0
    ? `Mismatches: ${interpolationMismatches.slice(0, 5).map(m => `${m.dict}:${m.key} (EN: {{${m.enVars}}} vs AR: {{${m.arVars}}})`).join('; ')}`
    : ''
);

// Adversarial Check 5.8: Unbalanced Double Curly Braces in Translation Dictionaries
const syntaxErrorsInLocales = [];
if (jsonParseOk) {
  const allDicts = [
    { name: 'en/finance.json', dict: flattenDict(enFinance) },
    { name: 'ar/finance.json', dict: flattenDict(arFinance) },
    { name: 'en/common.json', dict: flattenDict(enCommon) },
    { name: 'ar/common.json', dict: flattenDict(arCommon) },
    { name: 'en/inventory.json', dict: flattenDict(enInventory) },
    { name: 'ar/inventory.json', dict: flattenDict(arInventory) },
  ];

  for (const { name, dict } of allDicts) {
    for (const [key, val] of Object.entries(dict)) {
      if (typeof val === 'string') {
        const openMatches = (val.match(/\{\{/g) || []).length;
        const closeMatches = (val.match(/\}\}/g) || []).length;
        if (openMatches !== closeMatches) {
          syntaxErrorsInLocales.push({ dict: name, key, val, reason: `Mismatched braces: {{ count is ${openMatches}, }} count is ${closeMatches}` });
        }
      }
    }
  }
}

recordAssert(
  syntaxErrorsInLocales.length === 0,
  'tier5',
  `Adversarial Oracle: Zero unbalanced curly braces in all translation dictionaries (Found ${syntaxErrorsInLocales.length})`,
  syntaxErrorsInLocales.length > 0
    ? `Brace errors: ${syntaxErrorsInLocales.slice(0, 5).map(e => `${e.dict} [${e.key}]: ${e.reason}`).join('; ')}`
    : ''
);

// Adversarial Check 5.9: Exhaustive Form <option> Scan across all finance views
const rawOptionsFound = [];
const standardTermsAndCodes = new Set(['Net', 'COD', 'ALL', 'JOD', 'USD', 'VAT', 'PDC', 'WPS', 'IFRS', 'EBITDA']);
const monthNames = new Set(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

for (const view of activeViews) {
  const optMatches = [...view.content.matchAll(/<option\b[^>]*>([\s\S]*?)<\/option>/gi)];
  for (const m of optMatches) {
    const rawSnippet = m[1];
    // If option has dynamic state template like {b.bank_name} or {inv.sku}, it is data-driven
    if (rawSnippet.includes('{b.') || rawSnippet.includes('{inv.') || rawSnippet.includes('{c.') || rawSnippet.includes('{p.')) {
      continue;
    }
    const stripped = stripJsxAndTags(rawSnippet);
    const words = stripped.match(/[A-Za-z]{3,}/g);
    if (words && words.length > 0) {
      const nonCodeWords = words.filter(w => 
        !(w === w.toUpperCase() && w.length <= 4) && 
        !standardTermsAndCodes.has(w) && 
        !monthNames.has(w)
      );
      if (nonCodeWords.length > 0) {
        // If it's cost center / GL account descriptions in mock selector
        if (view.name === 'BudgetingForecastingView.jsx' && /^(CC-\d+|6\d{4})\s*—/.test(rawSnippet)) {
          continue;
        }
        rawOptionsFound.push({ file: view.name, text: nonCodeWords.join(' '), raw: rawSnippet.trim().slice(0, 50) });
      }
    }
  }
}

recordAssert(
  rawOptionsFound.length === 0,
  'tier5',
  `Adversarial: Zero raw English <option> literals in modal/form selects across all finance views (Found ${rawOptionsFound.length})`,
  rawOptionsFound.length > 0
    ? `Unlocalized options: ${rawOptionsFound.slice(0, 5).map(o => `${o.file}: "${o.text}"`).join('; ')}`
    : ''
);

// Adversarial Check 5.10: Exhaustive Form <label> Scan across all finance views
const rawLabelsFound = [];
for (const view of activeViews) {
  const lblMatches = [...view.content.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)];
  for (const m of lblMatches) {
    const rawSnippet = m[1];
    const stripped = stripJsxAndTags(rawSnippet);
    const words = stripped.match(/[A-Za-z]{3,}/g);
    if (words && words.length > 0) {
      const nonCodeWords = words.filter(w => !(w === w.toUpperCase() && w.length <= 4));
      if (nonCodeWords.length > 0) {
        rawLabelsFound.push({ file: view.name, text: nonCodeWords.join(' '), raw: rawSnippet.trim().slice(0, 50) });
      }
    }
  }
}

recordAssert(
  rawLabelsFound.length === 0,
  'tier5',
  `Adversarial: Zero raw English <label> literals across all finance views (Found ${rawLabelsFound.length})`,
  rawLabelsFound.length > 0
    ? `Unlocalized labels: ${rawLabelsFound.slice(0, 5).map(l => `${l.file}: "${l.text}"`).join('; ')}`
    : ''
);


// ======================================================================
// SUMMARY & REPORT
// ======================================================================
console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Verification Summary${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}`);

console.log(`Total Checks: ${totalPassed + totalFailed}`);
console.log(`  Passed: ${colors.green}${totalPassed}${colors.reset}`);
console.log(`  Failed: ${totalFailed > 0 ? colors.red : colors.green}${totalFailed}${colors.reset}`);

console.log('\n--- TIER 5 SUMMARY ---');
for (const f of failuresByTier.tier5) {
  console.log(`FAIL: ${f.testName}`);
  if (f.details) console.log(`  Details: ${f.details}`);
}
console.log(`TIER 5 Total Failed: ${failuresByTier.tier5.length}`);

console.log(`\n${colors.bold}Exit Status:${colors.reset} ${totalFailed === 0 ? colors.green + 'SUCCESS (All Tiers Passed)' : colors.red + 'BASELINE FAILURES DETECTED (Ready for Implementation Fixes)'}${colors.reset}\n`);

// Exit code: 0 if all passed, 1 if any failed
process.exit(totalFailed === 0 ? 0 : 1);
