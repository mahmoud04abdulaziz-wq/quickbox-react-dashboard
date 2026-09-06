import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- QuickBox i18n Milestone 1 Empirical Verification Suite ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Dependencies in package.json
console.log('\n[Group 1: Package Dependencies]');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
assert(Boolean(pkg.dependencies['i18next']), 'i18next is installed in dependencies');
assert(Boolean(pkg.dependencies['react-i18next']), 'react-i18next is installed in dependencies');
assert(Boolean(pkg.dependencies['i18next-resources-to-backend']), 'i18next-resources-to-backend is installed in dependencies');

// Test 2: File Structure & Valid JSON
console.log('\n[Group 2: Locale Dictionaries Validation]');
const locales = ['en', 'ar'];
const namespaces = ['common', 'inventory', 'finance'];
const dictionaries = {};

for (const lang of locales) {
  dictionaries[lang] = {};
  for (const ns of namespaces) {
    const filePath = path.join(rootDir, 'src', 'i18n', 'locales', lang, `${ns}.json`);
    assert(fs.existsSync(filePath), `Dictionary exists: src/i18n/locales/${lang}/${ns}.json`);
    
    let content;
    try {
      content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      assert(typeof content === 'object' && content !== null, `${lang}/${ns}.json parses as valid JSON object`);
      dictionaries[lang][ns] = content;
    } catch (err) {
      assert(false, `${lang}/${ns}.json failed JSON parse: ${err.message}`);
    }
  }
}

// Test 3: Key Symmetry & Non-Empty Values
console.log('\n[Group 3: Key Symmetry & Completeness]');
function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, currentKey));
    } else {
      keys.push(currentKey);
    }
  }
  return keys;
}

for (const ns of namespaces) {
  const enKeys = getKeys(dictionaries.en[ns] || {});
  const arKeys = getKeys(dictionaries.ar[ns] || {});

  assert(enKeys.length > 0, `Namespace '${ns}' has ${enKeys.length} English translation keys`);
  assert(arKeys.length > 0, `Namespace '${ns}' has ${arKeys.length} Arabic translation keys`);

  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));

  assert(missingInAr.length === 0, `No English keys missing in Arabic dictionary for '${ns}' (missing: ${missingInAr.length})`);
  assert(missingInEn.length === 0, `No Arabic keys missing in English dictionary for '${ns}' (missing: ${missingInEn.length})`);
}

// Test 4: fontLoader.js Exports and Logic
console.log('\n[Group 4: Font Loader & DOM Sync]');
const fontLoaderPath = path.join(rootDir, 'src', 'i18n', 'fontLoader.js');
assert(fs.existsSync(fontLoaderPath), 'src/i18n/fontLoader.js exists');

// Mock DOM for fontLoader verification
const headChildren = [];
const docElement = { dir: 'ltr', lang: 'en' };
globalThis.document = {
  head: {
    appendChild: (el) => headChildren.push(el),
  },
  getElementById: (id) => headChildren.find(el => el.id === id) || null,
  querySelector: (sel) => {
    const hrefMatch = sel.match(/href="([^"]+)"/);
    if (hrefMatch) {
      return headChildren.find(el => el.href === hrefMatch[1]) || null;
    }
    return null;
  },
  createElement: (tag) => ({ tagName: tag.toUpperCase(), id: '', rel: '', href: '', remove: function() {
    const idx = headChildren.indexOf(this);
    if (idx !== -1) headChildren.splice(idx, 1);
  }}),
  documentElement: docElement,
};

const fontLoader = await import(`file://${fontLoaderPath.replace(/\\/g, '/')}`);
assert(typeof fontLoader.syncLanguageDirectionAndFont === 'function', 'syncLanguageDirectionAndFont is exported');
assert(typeof fontLoader.injectArabicFont === 'function', 'injectArabicFont is exported');

// Test switching to Arabic
fontLoader.syncLanguageDirectionAndFont('ar');
assert(docElement.dir === 'rtl', 'Setting language to ar updates documentElement.dir to rtl');
assert(docElement.lang === 'ar', 'Setting language to ar updates documentElement.lang to ar');
const fontLink = headChildren.find(el => el.id === 'quickbox-arabic-font');
assert(Boolean(fontLink), 'Arabic font stylesheet link was injected into head');
assert(fontLink.href.includes('Cairo'), 'Font stylesheet link includes Cairo font family');

// Test switching back to English
fontLoader.syncLanguageDirectionAndFont('en');
assert(docElement.dir === 'ltr', 'Setting language to en updates documentElement.dir to ltr');
assert(docElement.lang === 'en', 'Setting language to en updates documentElement.lang to en');

// Test 5: i18n.js Module & main.jsx Mount
console.log('\n[Group 5: i18n.js & main.jsx Mount]');
const i18nPath = path.join(rootDir, 'src', 'i18n', 'i18n.js');
assert(fs.existsSync(i18nPath), 'src/i18n/i18n.js exists');
const i18nContent = fs.readFileSync(i18nPath, 'utf-8');
assert(i18nContent.includes("STORAGE_KEY = 'quickbox_lang'"), 'STORAGE_KEY is defined as quickbox_lang');
assert(i18nContent.includes("numberingSystem: 'latn'"), 'Western numberingSystem: latn is configured');
assert(i18nContent.includes("resourcesToBackend"), 'i18next-resources-to-backend dynamic import is configured');

const mainPath = path.join(rootDir, 'src', 'main.jsx');
const mainContent = fs.readFileSync(mainPath, 'utf-8');
assert(mainContent.includes("import './i18n/i18n'") || mainContent.includes('import "./i18n/i18n"'), 'main.jsx imports ./i18n/i18n');

// Test 6: Western Arabic Numerals Formatting Check
console.log('\n[Group 6: Western Arabic Numerals latn Verification]');
const jordanianNumber = new Intl.NumberFormat('ar-JO', { numberingSystem: 'latn' }).format(1250.75);
assert(jordanianNumber === '1,250.75' || jordanianNumber.includes('1,250.75'), `ar-JO format with latn produces Western numerals: ${jordanianNumber}`);

console.log('\n-------------------------------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('-------------------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
