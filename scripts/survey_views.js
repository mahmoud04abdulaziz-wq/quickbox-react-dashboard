import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const localesDir = path.join(srcDir, 'i18n', 'locales');

// Load dictionaries
function loadJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(localesDir, relPath), 'utf-8'));
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

const dicts = {
  en: {
    common: flattenDict(loadJson('en/common.json')),
    inventory: flattenDict(loadJson('en/inventory.json')),
    finance: flattenDict(loadJson('en/finance.json')),
  },
  ar: {
    common: flattenDict(loadJson('ar/common.json')),
    inventory: flattenDict(loadJson('ar/inventory.json')),
    finance: flattenDict(loadJson('ar/finance.json')),
  }
};

console.log('=== DICTIONARY SUMMARY ===');
console.log(`EN: common=${Object.keys(dicts.en.common).length}, inventory=${Object.keys(dicts.en.inventory).length}, finance=${Object.keys(dicts.en.finance).length}`);
console.log(`AR: common=${Object.keys(dicts.ar.common).length}, inventory=${Object.keys(dicts.ar.inventory).length}, finance=${Object.keys(dicts.ar.finance).length}`);

// Check dictionary symmetry
for (const ns of ['common', 'inventory', 'finance']) {
  const enKeys = new Set(Object.keys(dicts.en[ns]));
  const arKeys = new Set(Object.keys(dicts.ar[ns]));
  const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
  const missingInEn = [...arKeys].filter(k => !enKeys.has(k));
  console.log(`Symmetry [${ns}]: Missing in AR: ${missingInAr.length}, Missing in EN: ${missingInEn.length}`);
  if (missingInAr.length > 0) console.log(`  Missing in AR sample:`, missingInAr.slice(0, 5));
  if (missingInEn.length > 0) console.log(`  Missing in EN sample:`, missingInEn.slice(0, 5));
}

// Find all JSX files in src/
function findJsxFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsxFiles(fullPath));
    } else if (entry.name.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allJsx = findJsxFiles(srcDir);
console.log(`\nFound ${allJsx.length} JSX files across src/`);

const results = [];

for (const filePath of allJsx) {
  const relPath = path.relative(srcDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const usesTranslation = /useTranslation/.test(content);
  const tCalls = [...content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]);

  // Tag scans
  const unwiredHeadings = [];
  const unwiredTh = [];
  const unwiredButtons = [];
  const unwiredLabels = [];
  const unwiredPlaceholders = [];
  const unwiredOptions = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Strip comments
    const cleanLine = line.replace(/\{\/\*.*?\*\/\}/g, '').replace(/\/\/.*/, '');

    // Check headings <h[1-6]
    const hMatch = cleanLine.match(/<h[1-6][^>]*>([^<{]+)<\/h[1-6]>/i);
    if (hMatch) {
      const text = hMatch[1].trim();
      if (text && !/^[\d\s.,\-–—:/()%]+$/.test(text)) {
        unwiredHeadings.push({ lineNum, text });
      }
    }

    // Check <th>
    const thMatch = cleanLine.match(/<th[^>]*>([^<{]+)<\/th>/i);
    if (thMatch) {
      const text = thMatch[1].trim();
      if (text && !/^[\d\s.,\-–—:/()%]+$/.test(text)) {
        unwiredTh.push({ lineNum, text });
      }
    }

    // Check <button> with literal text
    const btnMatch = cleanLine.match(/<button[^>]*>([^<{]+)<\/button>/i);
    if (btnMatch) {
      const text = btnMatch[1].trim();
      if (text && !/^[\d\s.,\-–—:/()%]+$/.test(text)) {
        unwiredButtons.push({ lineNum, text });
      }
    }

    // Check <label> with literal text
    const lblMatch = cleanLine.match(/<label[^>]*>([^<{]+)<\/label>/i);
    if (lblMatch) {
      const text = lblMatch[1].trim();
      if (text && !/^[\d\s.,\-–—:/()%]+$/.test(text)) {
        unwiredLabels.push({ lineNum, text });
      }
    }

    // Check placeholder="..."
    const phMatches = [...cleanLine.matchAll(/placeholder\s*=\s*["']([^"']+)["']/gi)];
    for (const ph of phMatches) {
      const text = ph[1].trim();
      if (text && !text.startsWith('{') && !/^[\d\s.,\-–—:/()%]+$/.test(text)) {
        unwiredPlaceholders.push({ lineNum, text });
      }
    }

    // Check <option>
    const optMatch = cleanLine.match(/<option[^>]*>([^<{]+)<\/option>/i);
    if (optMatch) {
      const text = optMatch[1].trim();
      if (text && !/^[\d\s.,\-–—:/()%]+$/.test(text)) {
        unwiredOptions.push({ lineNum, text });
      }
    }
  });

  results.push({
    relPath,
    usesTranslation,
    tCallsCount: tCalls.length,
    unwiredHeadings,
    unwiredTh,
    unwiredButtons,
    unwiredLabels,
    unwiredPlaceholders,
    unwiredOptions,
  });
}

// Print report
console.log('\n=== DETAILED SURVEY RESULTS ===');
let totalUnwiredHeadings = 0;
let totalUnwiredTh = 0;
let totalUnwiredButtons = 0;
let totalUnwiredLabels = 0;
let totalUnwiredPlaceholders = 0;
let totalUnwiredOptions = 0;

for (const r of results) {
  const issues = [];
  if (!r.usesTranslation && r.relPath !== 'App.jsx' && r.relPath !== 'main.jsx' && !r.relPath.startsWith('context/')) {
    issues.push('NO useTranslation()');
  }
  if (r.unwiredHeadings.length) {
    issues.push(`${r.unwiredHeadings.length} unwired <h*>: ${r.unwiredHeadings.map(h => `L${h.lineNum} "${h.text}"`).join(', ')}`);
    totalUnwiredHeadings += r.unwiredHeadings.length;
  }
  if (r.unwiredTh.length) {
    issues.push(`${r.unwiredTh.length} unwired <th>: ${r.unwiredTh.map(h => `L${h.lineNum} "${h.text}"`).join(', ')}`);
    totalUnwiredTh += r.unwiredTh.length;
  }
  if (r.unwiredButtons.length) {
    issues.push(`${r.unwiredButtons.length} unwired <button>: ${r.unwiredButtons.map(h => `L${h.lineNum} "${h.text}"`).join(', ')}`);
    totalUnwiredButtons += r.unwiredButtons.length;
  }
  if (r.unwiredLabels.length) {
    issues.push(`${r.unwiredLabels.length} unwired <label>: ${r.unwiredLabels.map(h => `L${h.lineNum} "${h.text}"`).join(', ')}`);
    totalUnwiredLabels += r.unwiredLabels.length;
  }
  if (r.unwiredPlaceholders.length) {
    issues.push(`${r.unwiredPlaceholders.length} unwired placeholder: ${r.unwiredPlaceholders.map(h => `L${h.lineNum} "${h.text}"`).join(', ')}`);
    totalUnwiredPlaceholders += r.unwiredPlaceholders.length;
  }
  if (r.unwiredOptions.length) {
    issues.push(`${r.unwiredOptions.length} unwired <option>: ${r.unwiredOptions.map(h => `L${h.lineNum} "${h.text}"`).join(', ')}`);
    totalUnwiredOptions += r.unwiredOptions.length;
  }

  if (issues.length > 0) {
    console.log(`\n[!] ${r.relPath} (t() calls: ${r.tCallsCount})`);
    issues.forEach(iss => console.log(`    - ${iss}`));
  } else {
    // console.log(`[OK] ${r.relPath} (t() calls: ${r.tCallsCount})`);
  }
}

console.log('\n=== TOTAL UNWIRED COUNTS ===');
console.log(`Headings: ${totalUnwiredHeadings}`);
console.log(`Table Headers <th>: ${totalUnwiredTh}`);
console.log(`Buttons: ${totalUnwiredButtons}`);
console.log(`Labels: ${totalUnwiredLabels}`);
console.log(`Placeholders: ${totalUnwiredPlaceholders}`);
console.log(`Options: ${totalUnwiredOptions}`);
