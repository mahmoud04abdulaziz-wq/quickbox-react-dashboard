import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

console.log('======================================================================');
console.log('  CHALLENGER STRESS HARNESS: Table BiDi Isolation Verification');
console.log('======================================================================\n');

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
console.log(`Total JSX Files Found across src/: ${allJsxFiles.length}`);

// Patterns that identify financial/isolated data requiring LTR isolation in tables:
// 1. Currency amounts (+JOD, -JOD, JOD, USD, $)
// 2. Dates (YYYY-MM-DD or date variables)
// 3. Percentages (%, percent variables)
// 4. Reference codes (JV-, PO-, CC-, SKU-, code, ref, tag, account_code)

const moneyPattern = /(?:[+\-]?JOD|USD|\$)\s*\{?[0-9]|\$\{[^}]*(?:balance|amount|budget|actual|variance|cost|spend|ebitda|price|total|credit|debit)[^}]*\}|[+\-]JOD|\bJOD\s+[0-9]/i;
const datePattern = /\b\d{4}-\d{2}-\d{2}\b|\.(?:posting_date|date|created_at|due_date|effective_date|as_of|timestamp)/;
const percentPattern = /%|\b(?:burnPercent|variance|pct|percent|util|margin|rate)\b/;
const refCodePattern = /\.(?:account_code|voucher_number|journal_id|reference_number|ref|code|sku|asset_tag|asset_id|line_id|tender_id|policy_id|contract_id)\b|\b(?:JV-|PO-|CC-|FA-|INV-|GRN-|BILL-|POL-|TND-|RFQ-)[0-9A-Z]/;

let totalTablesFound = 0;
let totalCellsAudited = 0;
let violations = [];
let passCount = 0;

for (const filePath of allJsxFiles) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('<table')) continue;

  // Extract each table block
  const tableRegex = /<table[\s\S]*?<\/table>/g;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(content)) !== null) {
    totalTablesFound++;
    const tableHtml = tableMatch[0];
    const tableOffset = tableMatch.index;

    // Extract all <td> cells within this table
    const tdRegex = /<td([\s\S]*?)>([\s\S]*?)<\/td>/g;
    let tdMatch;

    while ((tdMatch = tdRegex.exec(tableHtml)) !== null) {
      totalCellsAudited++;
      const tdAttrs = tdMatch[1];
      const tdInner = tdMatch[2];

      const fullTdCell = `<td${tdAttrs}>${tdInner}</td>`;

      // Check if this cell contains monetary, date, percentage, or ref code content
      const hasMoney = moneyPattern.test(tdInner);
      const hasDate = datePattern.test(tdInner);
      const hasPercent = percentPattern.test(tdInner);
      const hasRefCode = refCodePattern.test(tdInner);

      if (!hasMoney && !hasDate && !hasPercent && !hasRefCode) {
        continue; // Cell does not contain sensitive bidi fields
      }

      // Check if protected:
      // Either <td> has dir="ltr" or bidi-ltr, or an inner element has dir="ltr" or bidi-ltr
      const tdHasDirLtr = /dir=['"]ltr['"]/.test(tdAttrs);
      const tdHasBidiClass = /className=['"][^'"]*\bbidi-ltr\b/.test(tdAttrs);
      const innerHasDirLtr = /dir=['"]ltr['"]/.test(tdInner);
      const innerHasBidiClass = /className=['"][^'"]*\bbidi-ltr\b/.test(tdInner);

      const isProtected = (tdHasDirLtr || innerHasDirLtr) && (tdHasBidiClass || innerHasBidiClass);

      // Determine categories
      const categories = [];
      if (hasMoney) categories.push('Money');
      if (hasDate) categories.push('Date');
      if (hasPercent) categories.push('Percentage');
      if (hasRefCode) categories.push('RefCode');

      // Calculate approximate line number in file
      const upToCell = content.substring(0, tableOffset + tdMatch.index);
      const lineNum = upToCell.split('\n').length;

      if (!isProtected) {
        violations.push({
          file: relPath,
          line: lineNum,
          categories: categories.join(', '),
          snippet: fullTdCell.replace(/\s+/g, ' ').slice(0, 140),
          missing: [
            !tdHasDirLtr && !innerHasDirLtr ? 'dir="ltr"' : null,
            !tdHasBidiClass && !innerHasBidiClass ? 'bidi-ltr' : null
          ].filter(Boolean).join(' and ')
        });
      } else {
        passCount++;
      }
    }
  }
}

console.log(`Audited: ${totalTablesFound} tables across all JSX files`);
console.log(`Total Sensitive Table Cells Evaluated: ${passCount + violations.length}`);
console.log(`Protected Cells with dir="ltr" and bidi-ltr: ${passCount}`);
console.log(`Unprotected or Partially Protected Cells: ${violations.length}\n`);

if (violations.length > 0) {
  console.log(`[FAIL] Found ${violations.length} table cell violations:`);
  violations.forEach((v, i) => {
    console.log(`\nViolation #${i + 1}:`);
    console.log(`  File: ${v.file}:${v.line}`);
    console.log(`  Data Category: ${v.categories}`);
    console.log(`  Missing: ${v.missing}`);
    console.log(`  Snippet: ${v.snippet}`);
  });
} else {
  console.log('[PASS] 100% of sensitive table cells (amounts with +JOD/-JOD/JOD, dates, percentages, reference codes) are fully isolated with dir="ltr" and bidi-ltr across all tables!');
}

console.log('\n======================================================================');
if (violations.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
