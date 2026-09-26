import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const financePagesDir = path.join(srcDir, 'pages', 'finance');
const localesDir = path.join(srcDir, 'i18n', 'locales');

console.log('======================================================================');
console.log('  CHALLENGER V4.2: FULL ADVERSARIAL VERIFICATION & STRESS HARNESS');
console.log('======================================================================\n');

let totalTests = 0;
let totalFailures = 0;
const failureDetails = [];

function assert(condition, testName, errorMsg = '') {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    return true;
  } else {
    totalFailures++;
    console.error(`  [FAIL] ${testName}`);
    if (errorMsg) {
      console.error(`         -> ${errorMsg}`);
    }
    failureDetails.push({ testName, errorMsg });
    return false;
  }
}

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

function getAllJsxFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllJsxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allJsxFiles = getAllJsxFiles(srcDir);
const relJsxFiles = allJsxFiles.map(f => path.relative(rootDir, f).replace(/\\/g, '/'));

console.log(`Total JSX Files Found across src/: ${allJsxFiles.length}`);
assert(allJsxFiles.length === 51, `Found exactly 51 JSX components in src/ (Found ${allJsxFiles.length})`);

const ALLOWED_LITERAL_TOKENS = new Set([
  'JOD', 'USD', 'EUR', 'GBP', 'IFRS', 'VAT', 'GL', 'AP', 'AR', 'PO', 'GRN', 'PDC',
  'WPS', 'SIF', 'ISTD', 'JoPACC', 'CBJ', 'IBAN', 'SWIFT', 'CCR', 'CPA', 'CEO', 'CFO',
  'EBITDA', 'SKU', 'SKUs', 'FIFO', 'LIFO', 'AVCO', 'WAC', 'COGS', 'PPV', 'KPI', 'KPIs',
  'FY', 'FY26', 'FY25', 'FY24', 'Q1', 'Q2', 'Q3', 'Q4', 'ERP', 'POS', 'SaaS', 'B2B', 'B2C',
  'ID', 'ISO', 'HTML', 'CSS', 'PDF', 'CSV', 'Excel', 'QuickBox', 'UI', 'RTL', 'LTR',
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Net', 'COD', 'ALL', 'ADJ', 'REF', 'JV', 'BL', 'FA', 'SIG', 'CC', 'vs', 'MT940', 'SHA-256', 'CCC', 'OPEX',
  'SoD', 'CAPEX', 'SOPs', 'Runway', 'com', 'Ref', 'Max', 'Min', 'TRN', 'SLA', 'SSC',
  'EN', 'AR', 'QuickBox'
]);

function stripJsxExpressions(text) {
  let prev = '';
  let curr = text;
  curr = curr.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  curr = curr.replace(/\/\*[\s\S]*?\*\//g, '');
  while (prev !== curr) {
    prev = curr;
    curr = curr.replace(/\{[^{}]*\}/g, '');
  }
  return curr;
}

function extractSuspiciousEnglishWords(text) {
  const noTags = text.replace(/<[^>]+>/g, ' ');
  const words = noTags.match(/[A-Za-z]{2,}/g) || [];
  return words.filter(w => {
    if (ALLOWED_LITERAL_TOKENS.has(w)) return false;
    if (w === w.toUpperCase() && w.length <= 4) return false;
    return true;
  });
}

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

// ----------------------------------------------------------------------
// 1. ADVERSARIAL LEAKAGE PROBE: ALL 51 JSX COMPONENTS
// ----------------------------------------------------------------------
console.log('\n--- TEST 1: Adversarial Leakage Probing across all 51 JSX Components ---');

const unwiredHeadings = [];
const unwiredThs = [];
const unwiredButtons = [];
const unwiredLabels = [];
const unwiredPlaceholders = [];

for (const filePath of allJsxFiles) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check buttons
  const btns = findJsxElements(content, 'button');
  for (const b of btns) {
    const stripped = stripJsxExpressions(b.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredButtons.push({ file: relPath, words: words.join(', '), snippet: b.body.trim().slice(0, 70) });
    }
  }

  // Check headings h1-h6
  for (let h = 1; h <= 6; h++) {
    const heads = findJsxElements(content, `h${h}`);
    for (const elem of heads) {
      const stripped = stripJsxExpressions(elem.body);
      const words = extractSuspiciousEnglishWords(stripped);
      if (words.length > 0) {
        unwiredHeadings.push({ file: relPath, tag: `h${h}`, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
      }
    }
  }

  // Check table headers <th>
  const ths = findJsxElements(content, 'th');
  for (const elem of ths) {
    const stripped = stripJsxExpressions(elem.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredThs.push({ file: relPath, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
    }
  }

  // Check <label> elements (excluding inputs/icons)
  const labels = findJsxElements(content, 'label');
  for (const elem of labels) {
    const stripped = stripJsxExpressions(elem.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredLabels.push({ file: relPath, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
    }
  }

  // Check literal placeholders: placeholder="English text"
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
    const phMatches = [...line.matchAll(/placeholder\s*=\s*["']([^"']+)["']/gi)];
    for (const ph of phMatches) {
      const val = ph[1].trim();
      const words = extractSuspiciousEnglishWords(val);
      if (words.length > 0) {
        unwiredPlaceholders.push({ file: relPath, line: idx + 1, words: words.join(', '), val });
      }
    }
  });
}

assert(unwiredHeadings.length === 0, `Zero unwired <h1-6> headings across all 51 components (Found ${unwiredHeadings.length})`,
  unwiredHeadings.map(h => `[${h.file}] <${h.tag}> "${h.words}"`).join('; '));

assert(unwiredThs.length === 0, `Zero unwired <th> headers across all 51 components (Found ${unwiredThs.length})`,
  unwiredThs.map(t => `[${t.file}] "${t.words}"`).join('; '));

assert(unwiredButtons.length === 0, `Zero unwired <button> elements across all 51 components (Found ${unwiredButtons.length})`,
  unwiredButtons.map(b => `[${b.file}] "${b.words}"`).join('; '));

assert(unwiredLabels.length === 0, `Zero unwired <label> elements across all 51 components (Found ${unwiredLabels.length})`,
  unwiredLabels.map(l => `[${l.file}] "${l.words}"`).join('; '));

assert(unwiredPlaceholders.length === 0, `Zero unwired static placeholder attributes across all 51 components (Found ${unwiredPlaceholders.length})`,
  unwiredPlaceholders.map(p => `[${p.file}:L${p.line}] "${p.val}"`).join('; '));


// ----------------------------------------------------------------------
// 2. SPECIFIC AUDIT: AuditLogsView, ReportsView, DashboardView, SettingsView
// ----------------------------------------------------------------------
console.log('\n--- TEST 2: Dedicated Audit of 4 Key Views ---');

const targetedViews = [
  'src/pages/AuditLogsView.jsx',
  'src/pages/ReportsView.jsx',
  'src/pages/DashboardView.jsx',
  'src/pages/SettingsView.jsx'
];

for (const targetRel of targetedViews) {
  const fullP = path.join(rootDir, targetRel);
  const exists = fs.existsSync(fullP);
  assert(exists, `Target view exists: ${targetRel}`);

  if (exists) {
    const content = fs.readFileSync(fullP, 'utf-8');
    const hasTCall = /useTranslation/.test(content);
    assert(hasTCall, `${targetRel} invokes useTranslation() hook`);

    // Check headings
    const heads = findJsxElements(content, 'h1').concat(findJsxElements(content, 'h2'));
    let headLeaks = 0;
    heads.forEach(h => {
      const stripped = stripJsxExpressions(h.body);
      const w = extractSuspiciousEnglishWords(stripped);
      if (w.length > 0) headLeaks++;
    });
    assert(headLeaks === 0, `${targetRel}: Zero hardcoded English in <h1>/<h2> headings (Found ${headLeaks})`);

    // Check <th>
    const thElements = findJsxElements(content, 'th');
    let thLeaks = 0;
    thElements.forEach(th => {
      const stripped = stripJsxExpressions(th.body);
      const w = extractSuspiciousEnglishWords(stripped);
      if (w.length > 0) thLeaks++;
    });
    assert(thLeaks === 0, `${targetRel}: Zero hardcoded English in <th> headers (Found ${thLeaks})`);
  }
}


// ----------------------------------------------------------------------
// 3. DICTIONARY PARITY & SYMMETRY (common.json, inventory.json, finance.json)
// ----------------------------------------------------------------------
console.log('\n--- TEST 3: Programmatic Leaf Key Parity & Symmetry Audit ---');

const namespaces = ['common', 'inventory', 'finance'];

for (const ns of namespaces) {
  const enPath = path.join(localesDir, 'en', `${ns}.json`);
  const arPath = path.join(localesDir, 'ar', `${ns}.json`);

  assert(fs.existsSync(enPath), `en/${ns}.json file exists`);
  assert(fs.existsSync(arPath), `ar/${ns}.json file exists`);

  const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const arJson = JSON.parse(fs.readFileSync(arPath, 'utf-8'));

  const flatEn = flattenDict(enJson);
  const flatAr = flattenDict(arJson);

  const enKeys = Object.keys(flatEn);
  const arKeys = Object.keys(flatAr);

  const missingInAr = enKeys.filter(k => !(k in flatAr));
  const missingInEn = arKeys.filter(k => !(k in flatEn));

  assert(missingInAr.length === 0, `${ns}.json: 0 leaf keys missing in Arabic (EN: ${enKeys.length}, AR: ${arKeys.length})`,
    missingInAr.slice(0, 5).join(', '));
  assert(missingInEn.length === 0, `${ns}.json: 0 leaf keys missing in English (EN: ${enKeys.length}, AR: ${arKeys.length})`,
    missingInEn.slice(0, 5).join(', '));

  // Check non-empty strings
  const emptyEn = Object.entries(flatEn).filter(([_, v]) => typeof v !== 'string' || v.trim().length === 0);
  const emptyAr = Object.entries(flatAr).filter(([_, v]) => typeof v !== 'string' || v.trim().length === 0);

  assert(emptyEn.length === 0, `${ns}.json: All English keys are non-empty strings (Found ${emptyEn.length} empty)`);
  assert(emptyAr.length === 0, `${ns}.json: All Arabic keys are non-empty strings (Found ${emptyAr.length} empty)`);

  // Arabic leakage check
  const arEnglishLeaks = [];
  for (const [key, val] of Object.entries(flatAr)) {
    if (typeof val !== 'string') continue;
    if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val)) continue;
    const cleanVal = val.replace(/\{\{[^}]+\}\}/g, ' ');
    const words = cleanVal.match(/[A-Za-z]{2,}/g) || [];
    const unauthorized = words.filter(w => {
      if (ALLOWED_LITERAL_TOKENS.has(w)) return false;
      if (w === w.toUpperCase() && w.length <= 4) return false;
      return true;
    });
    if (unauthorized.length > 0) {
      arEnglishLeaks.push({ key, val, unauthorized: unauthorized.join(', ') });
    }
  }

  assert(arEnglishLeaks.length === 0, `ar/${ns}.json: Zero unauthorized English words in Arabic values (Found ${arEnglishLeaks.length})`,
    arEnglishLeaks.slice(0, 3).map(l => `[${l.key}]: "${l.unauthorized}" in "${l.val}"`).join('; '));
}


// ----------------------------------------------------------------------
// 4. BIDI ISOLATION & PHYSICAL DIRECTIONAL CSS AUDIT
// ----------------------------------------------------------------------
console.log('\n--- TEST 4: BiDi & Physical Directional CSS Audit across all 51 components ---');

const physicalPatterns = [
  { name: 'textAlign: left/right', regex: /textAlign\s*:\s*['"`](left|right)['"`]/i },
  { name: 'borderLeft', regex: /borderLeft\s*:/ },
  { name: 'borderRight', regex: /borderRight\s*:/ },
  { name: 'marginLeft', regex: /marginLeft\s*:/ },
  { name: 'marginRight', regex: /marginRight\s*:/ },
  { name: 'paddingLeft', regex: /paddingLeft\s*:/ },
  { name: 'paddingRight', regex: /paddingRight\s*:/ },
  { name: 'float: left/right', regex: /float\s*:\s*['"`](left|right)['"`]/i },
];

let physicalViolations = [];
for (const filePath of allJsxFiles) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
    for (const pat of physicalPatterns) {
      if (pat.regex.test(line)) {
        physicalViolations.push({ file: relPath, line: idx + 1, prop: pat.name, snippet: line.trim() });
      }
    }
  });
}

assert(
  physicalViolations.length === 0,
  `Zero physical directional inline styles across all 51 JSX components (Found ${physicalViolations.length})`,
  physicalViolations.map(v => `${v.file}:${v.line} -> ${v.prop}`).join(', ')
);


// ----------------------------------------------------------------------
// SUMMARY & VERDICT
// ----------------------------------------------------------------------
console.log('\n======================================================================');
console.log('  CHALLENGER V4.2 VERIFICATION SUMMARY');
console.log('======================================================================');
console.log(`Total Adversarial Checks: ${totalTests}`);
console.log(`Passed: ${totalTests - totalFailures}`);
console.log(`Failed: ${totalFailures}`);

if (totalFailures === 0) {
  console.log('\nVERDICT: APPROVE (Zero bugs detected across all 51 JSX components & dictionaries)');
  process.exit(0);
} else {
  console.error(`\nVERDICT: REJECT (${totalFailures} failures detected)`);
  process.exit(1);
}
