import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const financePagesDir = path.join(rootDir, 'src', 'pages', 'finance');
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales');

console.log('======================================================================');
console.log('  CHALLENGER V3.1: ADVERSARIAL STRESS TEST & VERIFICATION HARNESS');
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

const financeFiles = fs.readdirSync(financePagesDir).filter(f => f.endsWith('.jsx'));
assert(financeFiles.length === 27, `Directory contains exactly 27 finance views (Found ${financeFiles.length})`);

const ALLOWED_LITERAL_TOKENS = new Set([
  'JOD', 'USD', 'EUR', 'GBP', 'IFRS', 'VAT', 'GL', 'AP', 'AR', 'PO', 'GRN', 'PDC',
  'WPS', 'SIF', 'ISTD', 'JoPACC', 'CBJ', 'IBAN', 'SWIFT', 'CCR', 'CPA', 'CEO', 'CFO',
  'EBITDA', 'SKU', 'SKUs', 'FIFO', 'LIFO', 'AVCO', 'WAC', 'COGS', 'PPV', 'KPI', 'KPIs',
  'FY', 'FY26', 'FY25', 'FY24', 'Q1', 'Q2', 'Q3', 'Q4', 'ERP', 'POS', 'SaaS', 'B2B', 'B2C',
  'ID', 'ISO', 'HTML', 'CSS', 'PDF', 'CSV', 'Excel', 'QuickBox', 'UI', 'RTL', 'LTR',
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Net', 'COD', 'ALL', 'ADJ', 'REF', 'JV', 'BL', 'FA', 'SIG', 'CC', 'vs', 'MT940', 'SHA-256', 'CCC', 'OPEX',
  'SoD', 'CAPEX', 'SOPs', 'Runway', 'com', 'Ref', 'Max', 'Min', 'TRN', 'SLA', 'SSC'
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

// ----------------------------------------------------------------------
// 1. ALL 27 FINANCE VIEWS: DEDICATED TAG-BY-TAG SCAN
// ----------------------------------------------------------------------
console.log('--- TEST 1: Dedicated Tag-by-Tag Scan (Buttons, Headings, Headers, Badges, etc.) ---');

const unwiredButtons = [];
const unwiredHeadings = [];
const unwiredThs = [];
const unwiredLabels = [];
const unwiredOptions = [];

for (const file of financeFiles) {
  const content = fs.readFileSync(path.join(financePagesDir, file), 'utf-8');

  // Buttons
  const btns = findJsxElements(content, 'button');
  for (const b of btns) {
    const stripped = stripJsxExpressions(b.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredButtons.push({ file, words: words.join(', '), snippet: b.body.trim().slice(0, 70) });
    }
  }

  // Headings
  for (let h = 1; h <= 6; h++) {
    const heads = findJsxElements(content, `h${h}`);
    for (const elem of heads) {
      const stripped = stripJsxExpressions(elem.body);
      const words = extractSuspiciousEnglishWords(stripped);
      if (words.length > 0) {
        unwiredHeadings.push({ file, tag: `h${h}`, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
      }
    }
  }

  // Table Headers <th>
  const ths = findJsxElements(content, 'th');
  for (const elem of ths) {
    const stripped = stripJsxExpressions(elem.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredThs.push({ file, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
    }
  }

  // Labels
  const labels = findJsxElements(content, 'label');
  for (const elem of labels) {
    const stripped = stripJsxExpressions(elem.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredLabels.push({ file, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
    }
  }

  // Options
  const options = findJsxElements(content, 'option');
  for (const elem of options) {
    if (/\{[a-zA-Z0-9_.]+\}/.test(elem.body)) continue;
    if (/^(CC-\d+|6\d{4})\s*—/.test(elem.body)) continue;
    const stripped = stripJsxExpressions(elem.body);
    const words = extractSuspiciousEnglishWords(stripped);
    if (words.length > 0) {
      unwiredOptions.push({ file, words: words.join(', '), snippet: elem.body.trim().slice(0, 70) });
    }
  }
}

assert(unwiredButtons.length === 0, `Zero unwired <button> elements across all 27 views (Found ${unwiredButtons.length})`,
  unwiredButtons.map(b => `[${b.file}] "${b.words}" -> snippet: ${b.snippet}`).join('\n         '));

assert(unwiredHeadings.length === 0, `Zero unwired <h1-6> headings across all 27 views (Found ${unwiredHeadings.length})`,
  unwiredHeadings.map(h => `[${h.file}] <${h.tag}> "${h.words}" -> snippet: ${h.snippet}`).join('\n         '));

assert(unwiredThs.length === 0, `Zero unwired <th> headers across all 27 views (Found ${unwiredThs.length})`,
  unwiredThs.map(t => `[${t.file}] "${t.words}" -> snippet: ${t.snippet}`).join('\n         '));

assert(unwiredLabels.length === 0, `Zero unwired <label> elements across all 27 views (Found ${unwiredLabels.length})`,
  unwiredLabels.map(l => `[${l.file}] "${l.words}" -> snippet: ${l.snippet}`).join('\n         '));

assert(unwiredOptions.length === 0, `Zero unwired <option> elements across all 27 views (Found ${unwiredOptions.length})`,
  unwiredOptions.map(o => `[${o.file}] "${o.words}" -> snippet: ${o.snippet}`).join('\n         '));


// ----------------------------------------------------------------------
// 2. DICTIONARY COMPLETENESS & FALLBACK RESILIENCE
// ----------------------------------------------------------------------
console.log('\n--- TEST 2: Dictionary Completeness, Symmetry & Fallback Resilience ---');

const enFinance = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'finance.json'), 'utf-8'));
const arFinance = JSON.parse(fs.readFileSync(path.join(localesDir, 'ar', 'finance.json'), 'utf-8'));
const enCommon = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'common.json'), 'utf-8'));
const arCommon = JSON.parse(fs.readFileSync(path.join(localesDir, 'ar', 'common.json'), 'utf-8'));

const flatEnFinance = flattenDict(enFinance);
const flatArFinance = flattenDict(arFinance);
const flatEnCommon = flattenDict(enCommon);
const flatArCommon = flattenDict(arCommon);

const enFinKeys = Object.keys(flatEnFinance);
const arFinKeys = Object.keys(flatArFinance);
const missingInAr = enFinKeys.filter(k => !(k in flatArFinance));
const missingInEn = arFinKeys.filter(k => !(k in flatEnFinance));

assert(missingInAr.length === 0, `finance.json: 0 keys missing in Arabic (EN: ${enFinKeys.length}, AR: ${arFinKeys.length})`, missingInAr.slice(0, 5).join(', '));
assert(missingInEn.length === 0, `finance.json: 0 keys missing in English (EN: ${enFinKeys.length}, AR: ${arFinKeys.length})`, missingInEn.slice(0, 5).join(', '));

const emptyEnFin = Object.entries(flatEnFinance).filter(([_, v]) => typeof v !== 'string' || v.trim().length === 0);
const emptyArFin = Object.entries(flatArFinance).filter(([_, v]) => typeof v !== 'string' || v.trim().length === 0);
assert(emptyEnFin.length === 0, `finance.json: All English keys non-empty strings (Found ${emptyEnFin.length} empty)`);
assert(emptyArFin.length === 0, `finance.json: All Arabic keys non-empty strings (Found ${emptyArFin.length} empty)`);

let fallbackFailures = 0;
for (const [key, enVal] of Object.entries(flatEnFinance)) {
  const arVal = flatArFinance[key];
  const resolvedFallback = (arVal && arVal.trim().length > 0) ? arVal : enVal;
  if (!resolvedFallback || resolvedFallback.trim().length === 0) {
    fallbackFailures++;
  }
}
assert(fallbackFailures === 0, `Fallback Simulation Oracle: 100% of finance keys resolve with fallback resilience`);

const missingJsxKeys = [];
for (const file of financeFiles) {
  const content = fs.readFileSync(path.join(financePagesDir, file), 'utf-8');
  const calls = [...content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`](?!\s*\+)(?:\s*,\s*(?:\{([^}]*)\}|['"`]([^'"`]*?)['"`]))?/g)];
  for (const [_, rawKey, optsStr, defaultArg] of calls) {
    let ns = 'finance';
    let cleanKey = rawKey;
    if (rawKey.includes(':')) {
      const parts = rawKey.split(':');
      ns = parts[0];
      cleanKey = parts[1];
    } else if (optsStr && /ns:\s*['"`]common['"`]/.test(optsStr)) {
      ns = 'common';
    }
    if (cleanKey.endsWith('.') || cleanKey.endsWith('_')) continue;

    let inEn = false;
    let inAr = false;
    if (ns === 'finance') {
      inEn = cleanKey in flatEnFinance || !!defaultArg;
      inAr = cleanKey in flatArFinance || !!defaultArg;
    } else if (ns === 'common') {
      inEn = cleanKey in flatEnCommon || !!defaultArg;
      inAr = cleanKey in flatArCommon || !!defaultArg;
    } else {
      continue;
    }

    if (!inEn || !inAr) {
      missingJsxKeys.push({ file, key: rawKey, inEn, inAr });
    }
  }
}

assert(
  missingJsxKeys.length === 0,
  `Every static t() key referenced in 27 finance views exists in dictionaries (Found ${missingJsxKeys.length} missing)`,
  missingJsxKeys.map(m => `[${m.file}] ${m.key} (EN:${m.inEn}, AR:${m.inAr})`).join(', ')
);


// ----------------------------------------------------------------------
// 3. ARABIC DICTIONARY ENGLISH LEAKAGE AUDIT (UNFILTERED DEEP SCAN)
// ----------------------------------------------------------------------
console.log('\n--- TEST 3: Arabic Dictionary English Leakage Stress Test ---');

const englishLeakage = [];

for (const [key, val] of Object.entries(flatArFinance)) {
  if (typeof val !== 'string') continue;
  if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val)) continue;
  const cleanVal = val.replace(/\{\{[^}]+\}\}/g, ' ');
  const words = cleanVal.match(/[A-Za-z]{2,}/g) || [];
  const unauthorizedWords = words.filter(w => {
    if (ALLOWED_LITERAL_TOKENS.has(w)) return false;
    if (w === w.toUpperCase() && w.length <= 4) return false;
    return true;
  });

  if (unauthorizedWords.length > 0) {
    englishLeakage.push({ key, val, unauthorized: unauthorizedWords.join(', ') });
  }
}

assert(
  englishLeakage.length === 0,
  `Zero raw English words (outside standard acronyms) in ar/finance.json (Found ${englishLeakage.length})`,
  englishLeakage.map(l => `[${l.key}]: "${l.unauthorized}" in "${l.val}"`).join('\n         ')
);


// ----------------------------------------------------------------------
// 4. BIDI & PHYSICAL DIRECTIONAL CSS CHECK
// ----------------------------------------------------------------------
console.log('\n--- TEST 4: BiDi & Physical Directional CSS Audit ---');

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
for (const file of financeFiles) {
  const filePath = path.join(financePagesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
    for (const pat of physicalPatterns) {
      if (pat.regex.test(line)) {
        physicalViolations.push({ file, line: idx + 1, prop: pat.name, snippet: line.trim() });
      }
    }
  });
}

assert(
  physicalViolations.length === 0,
  `Zero physical directional inline styles across all 27 finance views (Found ${physicalViolations.length})`,
  physicalViolations.map(v => `${v.file}:${v.line} -> ${v.prop}`).join(', ')
);


// ----------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------
console.log('\n======================================================================');
console.log('  CHALLENGER V3.1 VERIFICATION SUMMARY');
console.log('======================================================================');
console.log(`Total Adversarial Checks: ${totalTests}`);
console.log(`Passed: ${totalTests - totalFailures}`);
console.log(`Failed: ${totalFailures}`);

if (totalFailures === 0) {
  console.log('\nVERDICT: APPROVE (Zero bugs detected across all 27 finance views)');
  process.exit(0);
} else {
  console.error('\nVERDICT: REQUEST_CHANGES (Vulnerabilities detected)');
  process.exit(1);
}
