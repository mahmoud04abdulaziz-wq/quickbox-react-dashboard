import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ArrowsClockwise,
  Bank,
  CheckCircle,
  Warning,
  Plus,
  X,
  FileText,
  Lock,
  ArrowRight,
  Receipt,
  Scales,
  ShieldCheck,
  TrendUp
} from '@phosphor-icons/react';

function AccountReconciliationView() {
  const {
    bankAccounts,
    bankTransactions,
    reconciliations,
    unmatchedBankTransactions,
    reconciliationLogs,
    reconcileAccount,
    addReconciliationAdjustment,
    matchTransaction,
    journalEntries
  } = useFinance();

  const [activeTab, setActiveTab] = useState('bank-reconciliation'); // 'bank-reconciliation' | 'unmatched-items' | 'reconciliation-history'
  const [selectedBankId, setSelectedBankId] = useState('BANK-01');
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [adjSuccess, setAdjSuccess] = useState(null);

  // Form State for Adjustment Voucher
  const [adjAmount, setAdjAmount] = useState(-54.00);
  const [adjGlAccount, setAdjGlAccount] = useState('66100');
  const [adjMemo, setAdjMemo] = useState('POS Merchant settlement discount fee (1.2%)');
  const [adjRef, setAdjRef] = useState('POS-ARB-4412');
  const [adjItemId, setAdjItemId] = useState('UNM-003');

  // Form State for Period Sign-off
  const [signOffReviewer, setSignOffReviewer] = useState('Layla Salem (Certified Auditor)');
  const [signOffNotes, setSignOffNotes] = useState('Monthly account reconciliation verified with Jordan Central Bank JoPACC statement feed. Equilibrium confirmed.');

  // Current selected reconciliation object
  const currentRecon = reconciliations.find(r => r.bank_account_id === selectedBankId) || reconciliations[0];
  const currentBankAccount = bankAccounts.find(b => b.bank_account_id === selectedBankId) || bankAccounts[0];

  // Calculated Metrics
  const totalReconciledCash = reconciliations.reduce((sum, r) => sum + r.adjusted_book_balance, 0);
  const totalUnreconciledDiff = reconciliations.reduce((sum, r) => sum + Math.abs(r.unreconciled_difference), 0);
  const pendingUnmatchedCount = unmatchedBankTransactions.filter(u => u.status === 'Unmatched' || u.status === 'Deposit_In_Transit').length;
  const matchRate = 98.6;

  // Filter book transactions vs bank statement
  const bookTxns = journalEntries.filter(jv =>
    jv.lines.some(l => l.account_code === currentRecon?.gl_account_code)
  ).slice(0, 8);

  const handlePostAdjustment = (e) => {
    e.preventDefault();
    const res = addReconciliationAdjustment({
      bank_account_id: selectedBankId,
      gl_account_code: adjGlAccount,
      amount: adjAmount,
      description: adjMemo,
      reference: adjRef,
      item_id: adjItemId
    });
    setAdjSuccess(`Posted Adjustment Voucher ${res.voucherNum} (JOD ${res.adjAmount.toFixed(2)})`);
    setIsAdjModalOpen(false);
    setTimeout(() => setAdjSuccess(null), 5000);
  };

  const handleSignOffSubmit = (e) => {
    e.preventDefault();
    if (currentRecon) {
      reconcileAccount(currentRecon.reconciliation_id, {
        reviewer: signOffReviewer,
        notes: signOffNotes
      });
    }
    setIsSignOffModalOpen(false);
  };

  const handleQuickAdjustItem = (item) => {
    setAdjAmount(item.amount);
    setAdjGlAccount(item.suggested_gl_account || '66100');
    setAdjMemo(item.description);
    setAdjRef(item.reference);
    setAdjItemId(item.item_id);
    setIsAdjModalOpen(true);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Account &amp; Bank Reconciliation</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / account reconciliation &amp; audit balance
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> CBJ JoPACC / ECC Feed Connected
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsSignOffModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <ShieldCheck size={14} weight="bold" />
            <span>Sign-Off Period</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {adjSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '12px' }}>
          <CheckCircle size={16} weight="bold" />
          <span>{adjSuccess}</span>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="metrics-4" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Reconciled Cash Balance</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Bank size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD {totalReconciledCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="metric-delta">Across {reconciliations.length} Commercial Bank Accounts</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Unreconciled Variance</span>
            <div className="metric-icon" style={{ background: totalUnreconciledDiff === 0 ? '#f0fdf4' : '#fef2f2', color: totalUnreconciledDiff === 0 ? '#15803d' : '#ef4444' }}>
              <Scales size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: totalUnreconciledDiff === 0 ? 'var(--primary-green)' : '#ef4444' }}>
            JOD {totalUnreconciledDiff.toFixed(2)}
          </div>
          <div className="metric-delta up" style={{ color: '#15803d' }}>Perfect Ledger Equilibrium</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Unmatched Bank Items</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Warning size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{pendingUnmatchedCount} Items</div>
          <div className="metric-delta" style={{ color: '#a16207', fontWeight: 600 }}>Transit Timing &amp; Bank Fees</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Auto-Match Clearance Rate</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ArrowsClockwise size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{matchRate}%</div>
          <div className="metric-delta">Electronic JoPACC Rules</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'bank-reconciliation' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank-reconciliation')}
        >
          Dual-Panel Bank Workspace
        </button>
        <button
          className={`tab-btn ${activeTab === 'unmatched-items' ? 'active' : ''}`}
          onClick={() => setActiveTab('unmatched-items')}
        >
          Unmatched Items &amp; GL Adjustments ({unmatchedBankTransactions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'reconciliation-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('reconciliation-history')}
        >
          Period-End Sign-Off Archive ({reconciliationLogs.length})
        </button>
      </div>

      {/* SUB-TAB 1: DUAL-PANEL BANK WORKSPACE */}
      {activeTab === 'bank-reconciliation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Account Selector Bar */}
          <div className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Select Bank Account:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {reconciliations.map((r) => (
                  <button
                    key={r.bank_account_id}
                    onClick={() => setSelectedBankId(r.bank_account_id)}
                    className={selectedBankId === r.bank_account_id ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '11.5px', padding: '6px 12px' }}
                  >
                    {r.bank_name.split(' (')[0]} ({r.gl_account_code})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Statement Ending Balance: </span>
                <span className="mono" style={{ fontWeight: 700 }}>JOD {currentRecon?.statement_ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Book Balance: </span>
                <span className="mono" style={{ fontWeight: 700 }}>JOD {currentRecon?.book_ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Difference: </span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>JOD {currentRecon?.unreconciled_difference.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Dual Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Left: General Ledger Book Transactions */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>General Ledger Book Records (GL {currentRecon?.gl_account_code})</h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ERP Double-Entry Journal Vouchers</div>
                </div>
                <span className="badge ok"><span className="d"></span> GL Linked</span>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>JV Ref</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Debit (In)</th>
                      <th style={{ textAlign: 'right' }}>Credit (Out)</th>
                      <th style={{ textAlign: 'center' }}>Cleared</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookTxns.map((jv) => {
                      const line = jv.lines.find(l => l.account_code === currentRecon?.gl_account_code);
                      return (
                        <tr key={jv.journal_id}>
                          <td className="mono">{jv.posting_date}</td>
                          <td className="mono" style={{ fontWeight: 600 }}>{jv.voucher_number}</td>
                          <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {jv.memo}
                          </td>
                          <td style={{ textAlign: 'right', color: line?.debit_amount > 0 ? 'var(--primary-green)' : 'inherit' }} className="mono">
                            {line?.debit_amount > 0 ? `JOD ${line.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: line?.credit_amount > 0 ? '#ef4444' : 'inherit' }} className="mono">
                            {line?.credit_amount > 0 ? `JOD ${line.credit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <CheckCircle size={14} weight="bold" color="var(--primary-green)" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Electronic Bank Statement Feed */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>Electronic Bank Feed ({currentRecon?.bank_name.split(' (')[0]})</h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>JoPACC / SWIFT Direct Bank Statement</div>
                </div>
                <span className="badge ok"><span className="d"></span> MT940 Synced</span>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>Txn Date</th>
                      <th>Bank Ref</th>
                      <th>Transaction Narrative</th>
                      <th style={{ textAlign: 'right' }}>Amount (JOD)</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankTransactions.map((tx) => (
                      <tr key={tx.txn_id}>
                        <td className="mono">{tx.date}</td>
                        <td className="mono" style={{ fontWeight: 600 }}>{tx.reference}</td>
                        <td>{tx.description}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: tx.amount >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
                          {tx.amount >= 0 ? `+JOD ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-JOD ${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge ok"><span className="d"></span> {tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: UNMATCHED ITEMS & GL ADJUSTMENTS */}
      {activeTab === 'unmatched-items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Discrepancy Investigation &amp; Adjustment Queue</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Bank Service Charges, Exchange Rate Differences, Deposits in Transit &amp; Unrecorded Items
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setAdjAmount(-50.00);
                  setAdjGlAccount('66100');
                  setAdjMemo('Bank routine maintenance charge');
                  setAdjRef(`ADJ-${Date.now().toString().slice(-4)}`);
                  setAdjItemId(null);
                  setIsAdjModalOpen(true);
                }}
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} weight="bold" />
                <span>Manual GL Adjustment</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Date</th>
                    <th>Source Feed</th>
                    <th>Discrepancy Description</th>
                    <th>Bank Reference</th>
                    <th style={{ textAlign: 'right' }}>Amount (JOD)</th>
                    <th>Suggested GL Account</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unmatchedBankTransactions.map((item) => (
                    <tr key={item.item_id}>
                      <td className="mono" style={{ fontWeight: 600 }}>{item.item_id}</td>
                      <td className="mono">{item.date}</td>
                      <td>
                        <span className="tag-pill solid">{item.source}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td className="mono">{item.reference}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.amount >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
                        {item.amount >= 0 ? `+JOD ${item.amount.toFixed(2)}` : `-JOD ${Math.abs(item.amount).toFixed(2)}`}
                      </td>
                      <td className="mono">{item.suggested_gl_account}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${item.status === 'Adjusted_Via_GL' || item.status === 'Matched' ? 'ok' : item.status === 'Deposit_In_Transit' ? 'warn' : 'crit'}`}>
                          <span className="d"></span> {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.status === 'Adjusted_Via_GL' ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">{item.adjustment_jv_ref}</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              className="btn-primary"
                              onClick={() => handleQuickAdjustItem(item)}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              Post GL Voucher
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => matchTransaction(item.item_id)}
                              style={{ fontSize: '11px', padding: '3px 6px' }}
                            >
                              Match
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PERIOD-END SIGN-OFF ARCHIVE */}
      {activeTab === 'reconciliation-history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Period-End Certified Reconciliation Logs</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cryptographically Signed Monthly Closing Audits (IFRS &amp; Jordan Audit Bureau Standard)
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> Tamper-Proof Audit Hashes</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Fiscal Period</th>
                    <th>Bank Institution</th>
                    <th style={{ textAlign: 'right' }}>Certified Ending Balance</th>
                    <th>Auditor / Signatory</th>
                    <th>SHA-256 Audit Verification Hash</th>
                    <th style={{ textAlign: 'center' }}>Period Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationLogs.map((log) => (
                    <tr key={log.log_id}>
                      <td className="mono" style={{ fontWeight: 600 }}>{log.log_id}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{log.period}</td>
                      <td>{log.bank_name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="mono">
                        JOD {log.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>{log.verified_by}</td>
                      <td className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.hash}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} weight="bold" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POST RECONCILIATION ADJUSTMENT VOUCHER */}
      {isAdjModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Post Bank Reconciliation Adjustment Voucher</h3>
              <button className="modal-close-btn" onClick={() => setIsAdjModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handlePostAdjustment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Adjustment Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={adjMemo}
                    onChange={(e) => setAdjMemo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reference Code / Bank Ref</label>
                  <input
                    type="text"
                    className="form-control"
                    value={adjRef}
                    onChange={(e) => setAdjRef(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Amount in JOD (+ Inflow / - Fee)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Offsetting GL Account</label>
                    <select
                      className="form-control"
                      value={adjGlAccount}
                      onChange={(e) => setAdjGlAccount(e.target.value)}
                    >
                      <option value="66100">66100 — Bank Fees &amp; Admin</option>
                      <option value="40100">40100 — Interest &amp; Yield Revenue</option>
                      <option value="51200">51200 — FX Exchange Gain/Loss</option>
                      <option value="11100">11100 — Accounts Receivable Settlement</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  This creates an automatic double-entry balanced General Ledger Journal Entry (Debit Expense / Credit Cash) and logs it to the immutable audit trail.
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAdjModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Post Voucher to GL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SIGN OFF PERIOD */}
      {isSignOffModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Certify &amp; Lock Monthly Reconciliation</h3>
              <button className="modal-close-btn" onClick={() => setIsSignOffModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSignOffSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Auditor / Certified Signatory Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={signOffReviewer}
                    onChange={(e) => setSignOffReviewer(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Audit Certification Memo</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={signOffNotes}
                    onChange={(e) => setSignOffNotes(e.target.value)}
                    required
                  />
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#15803d' }}>
                  Signing off will finalize the period ending balances for all bank accounts and generate an audit certificate with SHA-256 security hash.
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsSignOffModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Certify &amp; Lock Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountReconciliationView;
