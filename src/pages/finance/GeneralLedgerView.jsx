import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  BookOpen,
  Lightning,
  CheckCircle,
  WarningCircle,
  CaretDown,
  CaretRight,
  Plus,
  MagnifyingGlass,
  X,
  PlusCircle,
  Trash
} from '@phosphor-icons/react';

function GeneralLedgerView() {
  const { t } = useTranslation(['finance', 'common']);
  const { journalEntries, accounts, postJournalEntry, metrics } = useFinance();

  const [selectedModule, setSelectedModule] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({ 0: true });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Journal Voucher Form State
  const [newVoucherDate, setNewVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVoucherMemo, setNewVoucherMemo] = useState('');
  const [newVoucherModule, setNewVoucherModule] = useState('MANUAL');
  const [newVoucherRef, setNewVoucherRef] = useState('');
  const [newVoucherLines, setNewVoucherLines] = useState([
    { account_code: '10100', debit_amount: 0, credit_amount: 0, description: '' },
    { account_code: '40100', debit_amount: 0, credit_amount: 0, description: '' }
  ]);

  // Toggle accordion row
  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return (journalEntries || []).filter(jv => {
      // Module filter
      if (selectedModule !== 'ALL' && jv.voucher_type !== selectedModule) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = (jv.voucher_number || '').toLowerCase().includes(q);
        const matchMemo = (jv.memo || '').toLowerCase().includes(q);
        const matchRef = (jv.reference_number || '').toLowerCase().includes(q);
        const matchSource = (jv.voucher_type || '').toLowerCase().includes(q);
        const matchLines = (jv.lines || []).some(l =>
          (l.account_code || '').toLowerCase().includes(q) ||
          (l.account_name || '').toLowerCase().includes(q)
        );
        return matchNum || matchMemo || matchRef || matchSource || matchLines;
      }
      return true;
    });
  }, [journalEntries, selectedModule, searchQuery]);

  // Modal Line Handlers
  const addLine = () => {
    setNewVoucherLines(prev => [
      ...prev,
      { account_code: '10100', debit_amount: 0, credit_amount: 0, description: '' }
    ]);
  };

  const removeLine = (idx) => {
    if (newVoucherLines.length > 2) {
      setNewVoucherLines(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const updateLine = (idx, field, value) => {
    setNewVoucherLines(prev => prev.map((l, i) => {
      if (i === idx) {
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  // Modal Balancing Checks
  const modalTotalDebit = newVoucherLines.reduce((s, l) => s + (parseFloat(l.debit_amount) || 0), 0);
  const modalTotalCredit = newVoucherLines.reduce((s, l) => s + (parseFloat(l.credit_amount) || 0), 0);
  const modalDelta = Math.abs(modalTotalDebit - modalTotalCredit);
  const isModalBalanced = modalDelta < 0.01 && modalTotalDebit > 0;

  const handleCreateVoucher = (e) => {
    e.preventDefault();
    if (!isModalBalanced) return;

    const linesFormatted = newVoucherLines.map(l => {
      const acc = accounts.find(a => a.account_code === l.account_code);
      return {
        account_code: l.account_code,
        account_name: acc ? acc.account_name : '',
        debit_amount: parseFloat(l.debit_amount) || 0,
        credit_amount: parseFloat(l.credit_amount) || 0,
        description: l.description || newVoucherMemo
      };
    });

    postJournalEntry({
      posting_date: newVoucherDate,
      memo: newVoucherMemo || 'Manual General Journal Entry',
      voucher_type: newVoucherModule,
      reference_number: newVoucherRef || 'MAN-JV',
      lines: linesFormatted,
      posted_by: 'Controller'
    });

    // Reset and close
    setIsModalOpen(false);
    setNewVoucherMemo('');
    setNewVoucherRef('');
    setNewVoucherLines([
      { account_code: '10100', debit_amount: 0, credit_amount: 0, description: '' },
      { account_code: '40100', debit_amount: 0, credit_amount: 0, description: '' }
    ]);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Top Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('finance:general_ledger.title', 'General Ledger')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }} dir="ltr">
            {t('finance:general_ledger.breadcrumb', '/ finance / general ledger')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('finance:general_ledger.badge_multi_currency', 'Multi-Currency Ledger')}
          </span>
          <span className="badge ok">
            <span className="d"></span> {t('finance:general_ledger.badge_double_entry', 'Real-Time Double-Entry')}
          </span>
        </div>
      </div>

      {/* F2. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:general_ledger.kpi_posted_volume', 'Posted Volume')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <BookOpen size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">$1.42M</div>
          <div className="metric-delta">{t('finance:general_ledger.kpi_posted_volume_delta', { count: (journalEntries || []).length || 142, defaultValue: '{{count}} vouchers MTD' })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:general_ledger.kpi_auto_postings', 'Auto-Postings')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Lightning size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">
            {((journalEntries || []).filter(j => j.voucher_type === 'INVENTORY').length || 84)} · 59%
          </div>
          <div className="metric-delta">{t('finance:general_ledger.kpi_auto_postings_delta', 'Zero human touch')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:general_ledger.kpi_equilibrium', 'Equilibrium')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{t('common:status.balanced', 'Balanced')}</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }} dir="ltr">Δ $0.00</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:general_ledger.kpi_pending_review', 'Pending Review')}</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <WarningCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">4</div>
          <div className="metric-delta">{t('finance:general_ledger.kpi_pending_review_delta', { amount: '18,200', defaultValue: 'Totaling $18,200' })}</div>
        </div>
      </div>

      {/* Row Actions & Filter Controls */}
      <div className="row-actions">
        <div className="filters">
          <select
            className="select"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="ALL">{t('finance:general_ledger.filter_all_modules', { count: (journalEntries || []).length, defaultValue: `All Modules (${(journalEntries || []).length})` })}</option>
            <option value="INVENTORY">{t('finance:general_ledger.filter_inventory_auto', { count: (journalEntries || []).filter(j => j.voucher_type === 'INVENTORY').length, defaultValue: `Inventory Automated (${(journalEntries || []).filter(j => j.voucher_type === 'INVENTORY').length})` })}</option>
            <option value="AP">{t('finance:general_ledger.filter_ap', { count: (journalEntries || []).filter(j => j.voucher_type === 'AP').length, defaultValue: `Accounts Payable (${(journalEntries || []).filter(j => j.voucher_type === 'AP').length})` })}</option>
            <option value="AR">{t('finance:general_ledger.filter_ar', { count: (journalEntries || []).filter(j => j.voucher_type === 'AR').length, defaultValue: `Accounts Receivable (${(journalEntries || []).filter(j => j.voucher_type === 'AR').length})` })}</option>
            <option value="PAYROLL">{t('finance:general_ledger.filter_payroll', { count: (journalEntries || []).filter(j => j.voucher_type === 'PAYROLL').length, defaultValue: `Payroll (${(journalEntries || []).filter(j => j.voucher_type === 'PAYROLL').length})` })}</option>
            <option value="MANUAL">{t('finance:general_ledger.filter_manual', { count: (journalEntries || []).filter(j => j.voucher_type === 'MANUAL').length, defaultValue: `Manual Entries (${(journalEntries || []).filter(j => j.voucher_type === 'MANUAL').length})` })}</option>
          </select>

          <div style={{ position: 'relative' }}>
            <input
              className="input"
              dir="ltr"
              placeholder={t('finance:general_ledger.search_placeholder', 'Search voucher #, account, doc ref…')}
              style={{ width: '260px', paddingInlineStart: '30px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlass
              size={14}
              style={{ position: 'absolute', insetInlineStart: '10px', top: '10px', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ background: 'var(--text-main)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={14} weight="bold" />
          <span>{t('finance:general_ledger.btn_new_voucher', 'New Journal Voucher')}</span>
        </button>
      </div>

      {/* Master Journal Vouchers Table with Accordion Rows */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '32px' }}></th>
              <th>{t('finance:general_ledger.th_voucher', 'Voucher')}</th>
              <th>{t('finance:general_ledger.th_date', 'Date')}</th>
              <th>{t('finance:general_ledger.th_source', 'Source')}</th>
              <th>{t('finance:general_ledger.th_doc_ref', 'Doc Ref')}</th>
              <th>{t('finance:general_ledger.th_memo', 'Memo')}</th>
              <th>{t('finance:general_ledger.th_debit', 'Debit')}</th>
              <th>{t('finance:general_ledger.th_credit', 'Credit')}</th>
              <th>{t('finance:general_ledger.th_status', 'Status')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry, idx) => {
              const isExpanded = !!expandedRows[idx];
              const isBalanced = Math.abs((entry.total_debit || 0) - (entry.total_credit || 0)) < 0.01;

              return (
                <React.Fragment key={entry.voucher_number || entry.journal_id || idx}>
                  {/* Parent Master Voucher Row */}
                  <tr
                    className="accordion-toggle"
                    onClick={() => toggleRow(idx)}
                    style={{ backgroundColor: isExpanded ? '#f0fdf4' : undefined }}
                  >
                    <td>
                      <span className="link-action" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" className="icon-rtl-flip" />}
                      </span>
                    </td>
                    <td className="mono cell-strong bidi-ltr" dir="ltr">{entry.voucher_number}</td>
                    <td className="mono bidi-ltr" dir="ltr">{entry.posting_date}</td>
                    <td>
                      <span className={`tag-pill ${entry.voucher_type === 'INVENTORY' ? 'solid' : ''}`}>
                        {entry.voucher_type}
                      </span>
                    </td>
                    <td className="mono bidi-ltr" dir="ltr">{entry.reference_number || '—'}</td>
                    <td>{entry.memo}</td>
                    <td className="mono cell-strong bidi-ltr" dir="ltr">${(entry.total_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="mono cell-strong bidi-ltr" dir="ltr">${(entry.total_credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${isBalanced ? 'ok' : 'crit'}`}>
                        <span className="d"></span>
                        {isBalanced ? t('common:status.balanced', 'Balanced') : t('common:status.unbalanced', 'Unbalanced')}
                      </span>
                    </td>
                  </tr>

                  {/* Accordion Line Items Sub-Table */}
                  {isExpanded && (
                    <tr className="sub-table">
                      <td colSpan={9} style={{ padding: 0 }}>
                        <div className="sub-inner">
                          <table>
                            <thead>
                              <tr>
                                <th>{t('finance:general_ledger.th_account', 'Account')}</th>
                                <th>{t('finance:general_ledger.th_account_title', 'Account Title')}</th>
                                <th>{t('finance:general_ledger.th_description', 'Description / Memo')}</th>
                                <th>{t('finance:general_ledger.th_debit', 'Debit')}</th>
                                <th>{t('finance:general_ledger.th_credit', 'Credit')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(entry.lines || []).map((line, lIdx) => (
                                <tr key={line.line_id || lIdx}>
                                  <td className="mono cell-strong bidi-ltr" dir="ltr">{line.account_code}</td>
                                  <td>{line.account_name}</td>
                                  <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                    {line.description || entry.memo}
                                  </td>
                                  <td className="mono bidi-ltr" dir="ltr" style={{ color: line.debit_amount > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    ${(line.debit_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="mono bidi-ltr" dir="ltr" style={{ color: line.credit_amount > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    ${(line.credit_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="sub-foot">
                            <span>{t('finance:general_ledger.posted_by', { user: entry.posted_by || 'System (Auto-GL)', defaultValue: `Posted by: ${entry.posted_by || 'System (Auto-GL)'}` })}</span>
                            <span>{t('finance:general_ledger.fiscal_period', { period: entry.fiscal_period || '2026-08', defaultValue: `Fiscal Period: ${entry.fiscal_period || '2026-08'}` })}</span>
                            <span dir="ltr">{t('finance:general_ledger.total_debits_equal_credits', { debit: (entry.total_debit || 0).toFixed(2), credit: (entry.total_credit || 0).toFixed(2), defaultValue: `Total Debits: $${(entry.total_debit || 0).toFixed(2)} ≡ Total Credits: $${(entry.total_credit || 0).toFixed(2)}` })}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Journal Voucher Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('finance:general_ledger.modal_title', 'Post New General Journal Voucher')}</div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('finance:general_ledger.form_posting_date', 'Posting Date')}</label>
                  <input
                    type="date"
                    dir="ltr"
                    className="input input-full"
                    value={newVoucherDate}
                    onChange={(e) => setNewVoucherDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('finance:general_ledger.form_source_module', 'Source Module')}</label>
                  <select
                    className="select"
                    style={{ width: '100%', height: '36px' }}
                    value={newVoucherModule}
                    onChange={(e) => setNewVoucherModule(e.target.value)}
                  >
                    <option value="MANUAL">{t('general_ledger.mod_manual', 'MANUAL')}</option>
                    <option value="AP">{t('general_ledger.mod_ap', 'ACCOUNTS PAYABLE')}</option>
                    <option value="AR">{t('general_ledger.mod_ar', 'ACCOUNTS RECEIVABLE')}</option>
                    <option value="PAYROLL">{t('general_ledger.mod_payroll', 'PAYROLL')}</option>
                    <option value="INVENTORY">{t('general_ledger.mod_inventory', 'INVENTORY')}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('finance:general_ledger.form_doc_ref', 'Document Ref')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    className="input input-full"
                    placeholder={t('general_ledger.placeholder_doc_ref')}
                    value={newVoucherRef}
                    onChange={(e) => setNewVoucherRef(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('finance:general_ledger.form_memo', 'Journal Description / Memo')}</label>
                <input
                  type="text"
                  className="input input-full"
                  placeholder={t('general_ledger.placeholder_memo')}
                  value={newVoucherMemo}
                  onChange={(e) => setNewVoucherMemo(e.target.value)}
                  required
                />
              </div>

              {/* Multi-line Debit/Credit Table */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="section-label" style={{ margin: 0 }}>{t('finance:general_ledger.form_lines_title', 'Voucher Line Items')}</span>
                  <button
                    type="button"
                    onClick={addLine}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <PlusCircle size={14} /> {t('finance:general_ledger.btn_add_line', 'Add Line')}
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>{t('finance:general_ledger.th_account', 'Account')}</th>
                        <th style={{ width: '25%' }}>{t('general_ledger.th_debit_curr', 'Debit (JOD)')}</th>
                        <th style={{ width: '25%' }}>{t('general_ledger.th_credit_curr', 'Credit (JOD)')}</th>
                        <th style={{ width: '10%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newVoucherLines.map((line, idx) => (
                        <tr key={idx}>
                          <td>
                            <select
                              className="select"
                              style={{ width: '100%', fontSize: '11px' }}
                              value={line.account_code}
                              onChange={(e) => updateLine(idx, 'account_code', e.target.value)}
                            >
                              {accounts.map(acc => (
                                <option key={acc.account_id} value={acc.account_code}>
                                  {acc.account_code} — {acc.account_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              dir="ltr"
                              className="input"
                              style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                              value={line.debit_amount || ''}
                              onChange={(e) => updateLine(idx, 'debit_amount', e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              dir="ltr"
                              className="input"
                              style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                              value={line.credit_amount || ''}
                              onChange={(e) => updateLine(idx, 'credit_amount', e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {newVoucherLines.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total & Equilibrium Warning */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: isModalBalanced ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isModalBalanced ? '#bbf7d0' : '#fecaca'}`, borderRadius: '6px', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 600, color: isModalBalanced ? '#15803d' : '#b91c1c' }}>
                  {isModalBalanced ? t('finance:general_ledger.balanced_entry', '✓ Balanced Entry') : t('finance:general_ledger.unbalanced_entry', { delta: modalDelta.toFixed(2), defaultValue: `⚠ Unbalanced: Δ JOD ${modalDelta.toFixed(2)}` })}
                </span>
                <span className="mono" style={{ color: 'var(--text-main)' }}>
                  {t('general_ledger.lbl_total_debits', 'Total Debits:')} <b className="bidi-ltr" dir="ltr">{t('general_ledger.currency_prefix', 'JOD')} {modalTotalDebit.toFixed(2)}</b> | {t('general_ledger.lbl_total_credits', 'Total Credits:')} <b className="bidi-ltr" dir="ltr">{t('general_ledger.currency_prefix', 'JOD')} {modalTotalCredit.toFixed(2)}</b>
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('common:actions.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isModalBalanced}
                  style={{ opacity: isModalBalanced ? 1 : 0.5, cursor: isModalBalanced ? 'pointer' : 'not-allowed' }}
                >
                  {t('finance:general_ledger.btn_post_voucher', 'Post Voucher to GL')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneralLedgerView;
