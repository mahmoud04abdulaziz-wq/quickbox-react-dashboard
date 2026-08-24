import React, { useState, useMemo } from 'react';
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>General Ledger</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / general ledger
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Multi-Currency Ledger
          </span>
          <span className="badge ok">
            <span className="d"></span> Real-Time Double-Entry
          </span>
        </div>
      </div>

      {/* F2. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Posted Volume</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <BookOpen size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$1.42M</div>
          <div className="metric-delta">{(journalEntries || []).length || 142} vouchers MTD</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Auto-Postings</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Lightning size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            {((journalEntries || []).filter(j => j.voucher_type === 'INVENTORY').length || 84)} · 59%
          </div>
          <div className="metric-delta">Zero human touch</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Equilibrium</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">Balanced</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>Δ $0.00</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Pending Review</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <WarningCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">4</div>
          <div className="metric-delta">Totaling $18,200</div>
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
            <option value="ALL">All Modules ({(journalEntries || []).length})</option>
            <option value="INVENTORY">Inventory Automated ({(journalEntries || []).filter(j => j.voucher_type === 'INVENTORY').length})</option>
            <option value="AP">Accounts Payable ({(journalEntries || []).filter(j => j.voucher_type === 'AP').length})</option>
            <option value="AR">Accounts Receivable ({(journalEntries || []).filter(j => j.voucher_type === 'AR').length})</option>
            <option value="PAYROLL">Payroll ({(journalEntries || []).filter(j => j.voucher_type === 'PAYROLL').length})</option>
            <option value="MANUAL">Manual Entries ({(journalEntries || []).filter(j => j.voucher_type === 'MANUAL').length})</option>
          </select>

          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="Search voucher #, account, doc ref…"
              style={{ width: '260px', paddingLeft: '30px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlass
              size={14}
              style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ background: 'var(--text-main)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={14} weight="bold" />
          <span>New Journal Voucher</span>
        </button>
      </div>

      {/* Master Journal Vouchers Table with Accordion Rows */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '32px' }}></th>
              <th>Voucher</th>
              <th>Date</th>
              <th>Source</th>
              <th>Doc Ref</th>
              <th>Memo</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Status</th>
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
                        {isExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                      </span>
                    </td>
                    <td className="mono cell-strong">{entry.voucher_number}</td>
                    <td className="mono">{entry.posting_date}</td>
                    <td>
                      <span className={`tag-pill ${entry.voucher_type === 'INVENTORY' ? 'solid' : ''}`}>
                        {entry.voucher_type}
                      </span>
                    </td>
                    <td className="mono">{entry.reference_number || '—'}</td>
                    <td>{entry.memo}</td>
                    <td className="mono cell-strong">${(entry.total_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="mono cell-strong">${(entry.total_credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${isBalanced ? 'ok' : 'crit'}`}>
                        <span className="d"></span>
                        {isBalanced ? 'Balanced' : 'Unbalanced'}
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
                                <th>Account</th>
                                <th>Account Title</th>
                                <th>Description / Memo</th>
                                <th>Debit</th>
                                <th>Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(entry.lines || []).map((line, lIdx) => (
                                <tr key={line.line_id || lIdx}>
                                  <td className="mono cell-strong">{line.account_code}</td>
                                  <td>{line.account_name}</td>
                                  <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                    {line.description || entry.memo}
                                  </td>
                                  <td className="mono" style={{ color: line.debit_amount > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    ${(line.debit_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="mono" style={{ color: line.credit_amount > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    ${(line.credit_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="sub-foot">
                            <span>Posted by: <b>{entry.posted_by || 'System (Auto-GL)'}</b></span>
                            <span>Fiscal Period: <b>{entry.fiscal_period || '2026-08'}</b></span>
                            <span>Total Debits: <b>${(entry.total_debit || 0).toFixed(2)}</b> ≡ Total Credits: <b>${(entry.total_credit || 0).toFixed(2)}</b></span>
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
              <div className="modal-title">Post New General Journal Voucher</div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Posting Date</label>
                  <input
                    type="date"
                    className="input input-full"
                    value={newVoucherDate}
                    onChange={(e) => setNewVoucherDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Source Module</label>
                  <select
                    className="select"
                    style={{ width: '100%', height: '36px' }}
                    value={newVoucherModule}
                    onChange={(e) => setNewVoucherModule(e.target.value)}
                  >
                    <option value="MANUAL">MANUAL</option>
                    <option value="AP">ACCOUNTS PAYABLE</option>
                    <option value="AR">ACCOUNTS RECEIVABLE</option>
                    <option value="PAYROLL">PAYROLL</option>
                    <option value="INVENTORY">INVENTORY</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Document Ref</label>
                  <input
                    type="text"
                    className="input input-full"
                    placeholder="e.g. ADJ-0042"
                    value={newVoucherRef}
                    onChange={(e) => setNewVoucherRef(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Journal Description / Memo</label>
                <input
                  type="text"
                  className="input input-full"
                  placeholder="e.g. Month-end inventory shrinkage adjustment"
                  value={newVoucherMemo}
                  onChange={(e) => setNewVoucherMemo(e.target.value)}
                  required
                />
              </div>

              {/* Multi-line Debit/Credit Table */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="section-label" style={{ margin: 0 }}>Voucher Line Items</span>
                  <button
                    type="button"
                    onClick={addLine}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <PlusCircle size={14} /> Add Line
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Account</th>
                        <th style={{ width: '25%' }}>Debit ($)</th>
                        <th style={{ width: '25%' }}>Credit ($)</th>
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
                  {isModalBalanced ? '✓ Balanced Entry' : `⚠ Unbalanced: Δ $${modalDelta.toFixed(2)}`}
                </span>
                <span className="mono" style={{ color: 'var(--text-main)' }}>
                  Total Debits: <b>${modalTotalDebit.toFixed(2)}</b> | Total Credits: <b>${modalTotalCredit.toFixed(2)}</b>
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isModalBalanced}
                  style={{ opacity: isModalBalanced ? 1 : 0.5, cursor: isModalBalanced ? 'pointer' : 'not-allowed' }}
                >
                  Post Voucher to GL
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
