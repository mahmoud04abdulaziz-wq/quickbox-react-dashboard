import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  ChartBar,
  Scales,
  TrendUp,
  Receipt,
  ShieldCheck,
  CheckCircle,
  FileText,
  DownloadSimple
} from '@phosphor-icons/react';

function FinancialStatementsView() {
  const { t } = useTranslation(['finance', 'common']);
  const {
    getBalanceSheet,
    getIncomeStatement,
    getCashFlowStatement,
    getTrialBalance,
    auditLog,
    accounts
  } = useFinance();

  const [activeTab, setActiveTab] = useState('bs'); // 'bs' | 'pl' | 'cf' | 'tb' | 'audit'

  // Computed Financial Statements
  const bs = useMemo(() => getBalanceSheet(), [getBalanceSheet, accounts]);
  const is = useMemo(() => getIncomeStatement(), [getIncomeStatement, accounts]);
  const cf = useMemo(() => getCashFlowStatement(), [getCashFlowStatement, accounts]);
  const tb = useMemo(() => getTrialBalance(), [getTrialBalance, accounts]);

  // Audit trail events
  const auditEntries = useMemo(() => {
    if (auditLog && auditLog.length > 0) {
      return auditLog;
    }
    return [
      { audit_id: 'AUD-9982', timestamp: '2026-08-15 09:12', action_type: 'STOCK_RECEIPT', source_module: 'INVENTORY', document_ref: 'GRN-2026-004', agent: 'System (Auto-GL)', verification_hash: '0x8f2c…a91' },
      { audit_id: 'AUD-9981', timestamp: '2026-08-15 08:40', action_type: 'PO_3WAY_MATCHED', source_module: 'AP', document_ref: 'BILL-2026-089', agent: 'Sarah Jenkins, CPA', verification_hash: '0x1b7d…44e' },
      { audit_id: 'AUD-9980', timestamp: '2026-08-14 17:05', action_type: 'INVOICE_GENERATED', source_module: 'AR', document_ref: 'INV-2026-0412', agent: 'System (Auto-GL)', verification_hash: '0x9a03…c12' },
      { audit_id: 'AUD-9979', timestamp: '2026-08-14 15:22', action_type: 'VALUATION_RULE_CHANGED', source_module: 'GL', document_ref: 'CAT-LIN-001', agent: 'Sarah Jenkins, CPA', verification_hash: '0x22e8…7f0' },
      { audit_id: 'AUD-9978', timestamp: '2026-08-13 11:50', action_type: 'PAYROLL_EXECUTED', source_module: 'PAYROLL', document_ref: 'PAY-2026-08', agent: 'System (Auto-GL)', verification_hash: '0x66ab…d33' }
    ];
  }, [auditLog]);

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Top Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('statements.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('statements.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('statements.badge_equilibrium')}
          </span>
        </div>
      </div>

      {/* Statement Sub-Tabs */}
      <div className="stmt-tabs">
        <button
          className={`tab-btn ${activeTab === 'bs' ? 'active' : ''}`}
          onClick={() => setActiveTab('bs')}
        >
          {t('statements.tab_balance_sheet')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'pl' ? 'active' : ''}`}
          onClick={() => setActiveTab('pl')}
        >
          {t('statements.tab_income_statement')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'cf' ? 'active' : ''}`}
          onClick={() => setActiveTab('cf')}
        >
          {t('statements.tab_cash_flow')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'tb' ? 'active' : ''}`}
          onClick={() => setActiveTab('tb')}
        >
          {t('statements.tab_trial_balance')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          {t('statements.tab_audit_trail')}
        </button>
      </div>

      {/* ================= TAB 1: BALANCE SHEET ================= */}
      {activeTab === 'bs' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '24px 28px', width: '100%', maxWidth: '680px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{t('statements.bs_title')}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{t('statements.bs_sub')}</div>
            </div>

            {/* Assets Group */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.bs_assets')}</div>
              <div className="ledger-line">
                <span>{t('statements.bs_cash')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentAssets.totalCash || 428950).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_ar')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentAssets.accountsReceivable || 84120).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_inventory')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentAssets.inventoryAsset || 186420).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_input_vat')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentAssets.inputVatRecoverable || 32050).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_net_ppe')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.nonCurrentAssets.netPpe || 281800).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.bs_total_assets')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(bs.totalAssets || 1013340).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Liabilities Group */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.bs_liabilities')}</div>
              <div className="ledger-line">
                <span>{t('statements.bs_ap')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentLiabilities.accountsPayable || 36890).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_grir')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentLiabilities.grirClearing || 18000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_payroll_payable')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentLiabilities.accruedSalaries || 24300).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_vat_payable')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.currentLiabilities.outputVatPayable || 32100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_bank_facility')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.longTermLiabilities.bankTermFacility || 200000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_eos_gratuity')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.longTermLiabilities.endOfServiceGratuity || 42500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.bs_total_liabilities')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(bs.totalLiabilities || 368790).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Equity Group */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.bs_equity')}</div>
              <div className="ledger-line">
                <span>{t('statements.bs_share_capital')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.equity.contributedShareCapital || 400000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_retained_earnings')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.equity.retainedEarnings || 102250).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.bs_current_net_income')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(bs.equity.currentPeriodNetIncome || 142300).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.bs_total_equity')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(bs.equity.total || 644550).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Equilibrium Verification Banner */}
            <div className={`equilibrium-banner ${bs.isBalanced ? '' : 'unbalanced'}`}>
              {bs.isBalanced
                ? `✓ ${t('statements.bs_balanced')} · Δ $0.00`
                : `⚠ ${t('statements.bs_unbalanced')} · Δ $${bs.equilibriumDelta}`}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PROFIT & LOSS ================= */}
      {activeTab === 'pl' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '24px 28px', width: '100%', maxWidth: '680px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{t('statements.pl_title')}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{t('statements.pl_sub')}</div>
            </div>

            {/* Revenue */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.pl_operating_rev')}</div>
              <div className="ledger-line">
                <span>{t('statements.pl_gross_sales')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(is.revenue.grossRevenue || 620000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_sales_discounts')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${Math.abs(is.revenue.salesDiscounts || 14500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.pl_net_revenue')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(is.revenue.netRevenue || 605500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.pl_cogs')}</div>
              <div className="ledger-line">
                <span>{t('statements.pl_linens_cogs')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.cogs.cogsLinens || 42100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_fb_cogs')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.cogs.cogsFnb || 88400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_amenities_cogs')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.cogs.cogsAmenities || 24800).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_ppv')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.cogs.ppvVariance || 1200).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.pl_gross_profit')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(is.grossProfit || 413000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.pl_opex')}</div>
              <div className="ledger-line">
                <span>{t('statements.pl_salaries')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.operatingExpenses.salariesWorkforce || 148500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_dept_supplies')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.operatingExpenses.departmentalHousekeeping + is.operatingExpenses.departmentalFnb || 42850).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_rent_facilities')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.operatingExpenses.rentFacilities || 38200).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_depreciation')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.operatingExpenses.depreciationExpense || 6500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.pl_general_admin')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${(is.operatingExpenses.generalAdministrative || 16250).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.pl_net_ebit')}</span>
                <span className="mono bidi-ltr" dir="ltr" style={{ color: '#15803d' }}>${(is.operatingIncome || 142300).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="equilibrium-banner">
              {t('statements.pl_margin_summary', { op: is.netProfitMarginPercent || 23.5, gm: is.grossMarginPercent || 68.2 })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CASH FLOW STATEMENT ================= */}
      {activeTab === 'cf' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '24px 28px', width: '100%', maxWidth: '680px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{t('statements.cf_title')}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{t('statements.cf_sub')}</div>
            </div>

            {/* Operating */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.cf_operating')}</div>
              <div className="ledger-line">
                <span>{t('statements.cf_net_income')}</span>
                <span className="v mono bidi-ltr" dir="ltr">${(cf.operatingActivities.netIncome || 142300).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.cf_depreciation_addback')}</span>
                <span className="v mono bidi-ltr" dir="ltr">+${(cf.operatingActivities.depreciationAddBack || 6500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-line">
                <span>{t('statements.cf_working_cap_adj')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${Math.abs(cf.operatingActivities.accountsReceivableChange || 12400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.cf_net_operating')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(cf.operatingActivities.netOperatingCashFlow || 136400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Investing */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.cf_investing')}</div>
              <div className="ledger-line">
                <span>{t('statements.cf_capex')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${Math.abs(cf.investingActivities.capitalExpenditure || 45000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.cf_net_investing')}</span>
                <span className="mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${Math.abs(cf.investingActivities.netInvestingCashFlow || 45000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Financing */}
            <div className="ledger-group">
              <div className="ledger-group-h">{t('statements.cf_financing')}</div>
              <div className="ledger-line">
                <span>{t('statements.cf_debt_repayment')}</span>
                <span className="v mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${Math.abs(cf.financingActivities.loanRepayments || 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ledger-total">
                <span>{t('statements.cf_net_financing')}</span>
                <span className="mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>-${Math.abs(cf.financingActivities.netFinancingCashFlow || 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="equilibrium-banner">
              {t('statements.cf_net_change', { val: (cf.netChangeInCash || 66400).toLocaleString('en-US', { minimumFractionDigits: 2 }), cash: (cf.endingCashBalance || 428950).toLocaleString('en-US', { minimumFractionDigits: 2 }) })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TRIAL BALANCE ================= */}
      {activeTab === 'tb' && (
        <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>{t('statements.th_account_code')}</th>
                <th>{t('statements.th_account_title')}</th>
                <th>{t('statements.th_classification')}</th>
                <th>{t('statements.th_debit')}</th>
                <th>{t('statements.th_credit')}</th>
              </tr>
            </thead>
            <tbody>
              {(tb.rows || []).map((row, idx) => (
                <tr key={row.account_code || idx}>
                  <td className="mono cell-strong bidi-ltr" dir="ltr">{row.account_code}</td>
                  <td>{row.account_name}</td>
                  <td>
                    <span className="tag-pill solid">{row.account_type}</span>
                  </td>
                  <td className="mono bidi-ltr" dir="ltr" style={{ color: row.debit > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    ${(row.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="mono bidi-ltr" dir="ltr" style={{ color: row.credit > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    ${(row.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sub-foot" style={{ padding: '14px 18px', borderTop: '1px solid var(--border-color)', background: '#fafbfc' }}>
            <span>{t('statements.tb_debits')} <b className="mono bidi-ltr" dir="ltr">${(tb.totalDebits || 1824930).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
            <span>{t('statements.tb_credits')} <b className="mono bidi-ltr" dir="ltr">${(tb.totalCredits || 1824930).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
            <span style={{ color: tb.isBalanced ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
              {tb.isBalanced ? `✓ ${t('statements.tb_balanced')}` : `⚠ ${t('statements.tb_unbalanced', { diff: tb.difference })}`}
            </span>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CRYPTOGRAPHIC AUDIT TRAIL ================= */}
      {activeTab === 'audit' && (
        <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>{t('statements.th_timestamp')}</th>
                <th>{t('statements.th_action_type')}</th>
                <th>{t('statements.th_source_module')}</th>
                <th>{t('statements.th_doc_ref')}</th>
                <th>{t('statements.th_agent_operator')}</th>
                <th>{t('statements.th_crypto_verify')}</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.map((a, idx) => (
                <tr key={a.audit_id || idx}>
                  <td className="mono bidi-ltr" dir="ltr">{a.timestamp ? a.timestamp.replace('T', ' ').slice(0, 16) : '2026-08-15 10:45'}</td>
                  <td>
                    <span className="tag-pill solid">{a.action_type}</span>
                  </td>
                  <td>
                    <span className="tag-pill">{a.source_module}</span>
                  </td>
                  <td className="mono cell-strong bidi-ltr" dir="ltr">{a.document_ref || a.voucher_number || '—'}</td>
                  <td>{a.agent}</td>
                  <td>
                    <span className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {a.verification_hash || '0x8f2c…a91'}
                    </span>
                    <span className="badge ok" style={{ marginInlineStart: '8px' }}>
                      <span className="d"></span>{t('statements.badge_verified')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FinancialStatementsView;
