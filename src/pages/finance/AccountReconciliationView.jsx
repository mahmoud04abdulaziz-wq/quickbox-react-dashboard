import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  Scales,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Plus,
  X,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Bank,
  FileText
} from '@phosphor-icons/react';

function AccountReconciliationView() {
  const { t } = useTranslation(['finance', 'common']);
  const {
    reconciliations,
    bankTransactions,
    unmatchedBankTransactions,
    reconciliationLogs,
    postBankAdjustmentVoucher,
    certifyReconciliationPeriod,
    matchTransaction,
    journalEntries
  } = useFinance();

  const [activeTab, setActiveTab] = useState('bank-reconciliation'); // 'bank-reconciliation' | 'unmatched-items' | 'reconciliation-history'
  const [selectedBankId, setSelectedBankId] = useState('BANK-01');
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);

  // Adjustment Modal Form State
  const [adjMemo, setAdjMemo] = useState('Bank routine maintenance charge');
  const [adjRef, setAdjRef] = useState(`ADJ-${Date.now().toString().slice(-4)}`);
  const [adjAmount, setAdjAmount] = useState(-50.00);
  const [adjGlAccount, setAdjGlAccount] = useState('66100');
  const [adjItemId, setAdjItemId] = useState(null);

  // Sign-off Modal Form State
  const [signOffReviewer, setSignOffReviewer] = useState('Sarah Nasser (CFO)');
  const [signOffNotes, setSignOffNotes] = useState('Certified reconciliation without outstanding unexplained variances.');

  // Current selected bank reconciliation
  const currentRecon = reconciliations.find(r => r.bank_account_id === selectedBankId) || reconciliations[0];

  // Book transactions (from GL journalEntries linked to this account)
  const bookTxns = journalEntries.filter(jv =>
    (jv.lines || []).some(l => l.account_code === currentRecon?.gl_account_code)
  );

  // Calculated Metrics
  const totalUnreconciledDiff = reconciliations.reduce((sum, r) => sum + Math.abs(r.unreconciled_difference || 0), 0);
  const pendingUnmatchedCount = unmatchedBankTransactions.filter(u => u.status === 'Unmatched' || u.status === 'Deposit_In_Transit').length;
  const matchRate = 98.4;

  const handlePostAdjustment = (e) => {
    e.preventDefault();
    if (postBankAdjustmentVoucher) {
      postBankAdjustmentVoucher({
        memo: adjMemo,
        reference: adjRef,
        amount: parseFloat(adjAmount) || 0,
        gl_account_code: adjGlAccount,
        bank_account_id: selectedBankId,
        item_id: adjItemId
      });
    }
    setIsAdjModalOpen(false);
  };

  const handleSignOffSubmit = (e) => {
    e.preventDefault();
    if (certifyReconciliationPeriod) {
      certifyReconciliationPeriod(selectedBankId, signOffReviewer, signOffNotes);
    }
    setIsSignOffModalOpen(false);
  };

  const handleQuickAdjustItem = (item) => {
    setAdjItemId(item.item_id);
    setAdjMemo(`Reconciliation Adj: ${item.description}`);
    setAdjRef(item.reference || `ADJ-${item.item_id}`);
    setAdjAmount(item.amount);
    setAdjGlAccount(item.suggested_gl_account || '66100');
    setIsAdjModalOpen(true);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('reconciliation.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('reconciliation.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('reconciliation.badge_realtime_feed')}
          </span>
          <span className="badge ok">
            <span className="d"></span> {t('reconciliation.badge_hash_verified')}
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsSignOffModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Lock size={14} weight="bold" />
            <span>{t('reconciliation.btn_certify_lock')}</span>
          </button>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="metrics-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('reconciliation.kpi_variance')}</span>
            <div className="metric-icon" style={{ background: totalUnreconciledDiff === 0 ? '#f0fdf4' : '#fef2f2', color: totalUnreconciledDiff === 0 ? '#15803d' : '#ef4444' }}>
              <Scales size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr" style={{ color: totalUnreconciledDiff === 0 ? 'var(--primary-green)' : '#ef4444' }}>
            JOD {totalUnreconciledDiff.toFixed(2)}
          </div>
          <div className="metric-delta up" style={{ color: '#15803d' }}>{t('reconciliation.kpi_variance_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('reconciliation.kpi_statement_bal')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Warning size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr">{pendingUnmatchedCount} {t('common:status.Items', { defaultValue: 'Items' })}</div>
          <div className="metric-delta" style={{ color: '#a16207', fontWeight: 600 }}>{t('reconciliation.kpi_statement_bal_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('reconciliation.kpi_ledger_bal')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ArrowsClockwise size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr">{matchRate}%</div>
          <div className="metric-delta">{t('reconciliation.kpi_ledger_bal_delta')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'bank-reconciliation' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank-reconciliation')}
        >
          {t('reconciliation.tab_bank_recon')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'unmatched-items' ? 'active' : ''}`}
          onClick={() => setActiveTab('unmatched-items')}
        >
          {t('reconciliation.tab_unmatched')} ({unmatchedBankTransactions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'reconciliation-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('reconciliation-history')}
        >
          {t('reconciliation.tab_history')} ({reconciliationLogs.length})
        </button>
      </div>

      {/* SUB-TAB 1: DUAL-PANEL BANK WORKSPACE */}
      {activeTab === 'bank-reconciliation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Account Selector Bar */}
          <div className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('reconciliation.lbl_select_bank')}</span>
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
                <span style={{ color: 'var(--text-muted)' }}>{t('reconciliation.lbl_statement_ending_bal')} </span>
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>JOD {currentRecon?.statement_ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('reconciliation.lbl_book_bal')} </span>
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>JOD {currentRecon?.book_ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('reconciliation.lbl_diff')} </span>
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>JOD {currentRecon?.unreconciled_difference.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Dual Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Left: General Ledger Book Transactions */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>{t('reconciliation.h_gl_records', { code: currentRecon?.gl_account_code })}</h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{t('reconciliation.h_gl_records_sub')}</div>
                </div>
                <span className="badge ok"><span className="d"></span> {t('reconciliation.badge_gl_linked')}</span>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>{t('common:th_date', { defaultValue: 'Date' })}</th>
                      <th>{t('reconciliation.th_jv_ref')}</th>
                      <th>{t('common:th_description', { defaultValue: 'Description' })}</th>
                      <th style={{ textAlign: 'end' }}>{t('reconciliation.th_debit_in')}</th>
                      <th style={{ textAlign: 'end' }}>{t('reconciliation.th_credit_out')}</th>
                      <th style={{ textAlign: 'center' }}>{t('reconciliation.th_cleared')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookTxns.map((jv) => {
                      const line = jv.lines.find(l => l.account_code === currentRecon?.gl_account_code);
                      return (
                        <tr key={jv.journal_id}>
                          <td className="mono bidi-ltr" dir="ltr">{jv.posting_date}</td>
                          <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{jv.voucher_number}</td>
                          <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {jv.memo}
                          </td>
                          <td style={{ textAlign: 'end', color: line?.debit_amount > 0 ? 'var(--primary-green)' : 'inherit' }} className="mono bidi-ltr" dir="ltr">
                            {line?.debit_amount > 0 ? `JOD ${line.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td style={{ textAlign: 'end', color: line?.credit_amount > 0 ? '#ef4444' : 'inherit' }} className="mono bidi-ltr" dir="ltr">
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
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>{t('reconciliation.h_bank_feed', { name: currentRecon?.bank_name.split(' (')[0] })}</h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{t('reconciliation.h_bank_feed_sub')}</div>
                </div>
                <span className="badge ok"><span className="d"></span> {t('reconciliation.badge_mt940_synced')}</span>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>{t('reconciliation.th_txn_date')}</th>
                      <th>{t('reconciliation.th_bank_ref')}</th>
                      <th>{t('reconciliation.th_txn_narrative')}</th>
                      <th style={{ textAlign: 'end' }}>{t('reconciliation.th_amount_jod')}</th>
                      <th style={{ textAlign: 'center' }}>{t('common:th_status', { defaultValue: 'Status' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankTransactions.map((tx) => (
                      <tr key={tx.txn_id}>
                        <td className="mono bidi-ltr" dir="ltr">{tx.date}</td>
                        <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{tx.reference}</td>
                        <td>{tx.description}</td>
                        <td style={{ textAlign: 'end', fontWeight: 600, color: tx.amount >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
                          {tx.amount >= 0 ? `+JOD ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-JOD ${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge ok"><span className="d"></span> {t('reconciliation.status_' + tx.status.toLowerCase().replace(/ /g, '_'), { defaultValue: tx.status })}</span>
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
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('reconciliation.h_discrepancy_queue')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('reconciliation.h_discrepancy_queue_sub')}
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
                <span>{t('reconciliation.btn_manual_adj')}</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('reconciliation.th_item_id')}</th>
                    <th>{t('common:th_date', { defaultValue: 'Date' })}</th>
                    <th>{t('reconciliation.th_source_feed')}</th>
                    <th>{t('reconciliation.th_discrepancy_desc')}</th>
                    <th>{t('reconciliation.th_bank_reference')}</th>
                    <th style={{ textAlign: 'end' }}>{t('reconciliation.th_amount_jod')}</th>
                    <th>{t('reconciliation.th_suggested_gl')}</th>
                    <th style={{ textAlign: 'center' }}>{t('common:th_status', { defaultValue: 'Status' })}</th>
                    <th style={{ textAlign: 'center' }}>{t('common:th_action', { defaultValue: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {unmatchedBankTransactions.map((item) => (
                    <tr key={item.item_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{item.item_id}</td>
                      <td className="mono bidi-ltr" dir="ltr">{item.date}</td>
                      <td>
                        <span className="tag-pill solid">{item.source}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td className="mono bidi-ltr" dir="ltr">{item.reference}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700, color: item.amount >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
                        {item.amount >= 0 ? `+JOD ${item.amount.toFixed(2)}` : `-JOD ${Math.abs(item.amount).toFixed(2)}`}
                      </td>
                      <td className="mono bidi-ltr" dir="ltr">{item.suggested_gl_account}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${item.status === 'Adjusted_Via_GL' || item.status === 'Matched' ? 'ok' : item.status === 'Deposit_In_Transit' ? 'warn' : 'crit'}`}>
                          <span className="d"></span> {t('reconciliation.status_' + item.status.toLowerCase(), item.status.replace(/_/g, ' '))}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.status === 'Adjusted_Via_GL' ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono bidi-ltr" dir="ltr">{item.adjustment_jv_ref}</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              className="btn-primary"
                              onClick={() => handleQuickAdjustItem(item)}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              {t('reconciliation.btn_post_gl_voucher')}
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => matchTransaction(item.item_id)}
                              style={{ fontSize: '11px', padding: '3px 6px' }}
                            >
                              {t('reconciliation.btn_match')}
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
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('reconciliation.h_period_logs')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('reconciliation.h_period_logs_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('reconciliation.badge_audit_hashes')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('reconciliation.th_log_id')}</th>
                    <th>{t('reconciliation.th_fiscal_period')}</th>
                    <th>{t('reconciliation.th_bank_institution')}</th>
                    <th style={{ textAlign: 'end' }}>{t('reconciliation.th_certified_ending_bal')}</th>
                    <th>{t('reconciliation.th_signatory')}</th>
                    <th>{t('reconciliation.th_hash')}</th>
                    <th style={{ textAlign: 'center' }}>{t('reconciliation.th_period_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationLogs.map((log) => (
                    <tr key={log.log_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{log.log_id}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{log.period}</td>
                      <td>{log.bank_name}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        JOD {log.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>{log.verified_by}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.hash}</td>
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
              <h3 className="modal-title">{t('reconciliation.modal_adj_title')}</h3>
              <button className="modal-close-btn" onClick={() => setIsAdjModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handlePostAdjustment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>{t('reconciliation.lbl_adj_desc')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={adjMemo}
                    onChange={(e) => setAdjMemo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('reconciliation.lbl_adj_ref')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    className="form-control"
                    value={adjRef}
                    onChange={(e) => setAdjRef(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('reconciliation.lbl_adj_amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      dir="ltr"
                      className="form-control"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('reconciliation.lbl_offset_gl')}</label>
                    <select
                      className="form-control"
                      value={adjGlAccount}
                      onChange={(e) => setAdjGlAccount(e.target.value)}
                    >
                      <option value="66100">{t('reconciliation.opt_gl_bank_fees')}</option>
                      <option value="40100">{t('reconciliation.opt_gl_interest')}</option>
                      <option value="51200">{t('reconciliation.opt_gl_fx')}</option>
                      <option value="11100">{t('reconciliation.opt_gl_ar_settlement')}</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('reconciliation.note_auto_entry')}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAdjModalOpen(false)}>{t('common:actions.cancel')}</button>
                <button type="submit" className="btn-primary">
                  {t('reconciliation.btn_post_to_gl')}
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
              <h3 className="modal-title">{t('reconciliation.modal_signoff_title')}</h3>
              <button className="modal-close-btn" onClick={() => setIsSignOffModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSignOffSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>{t('reconciliation.lbl_signatory_name')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={signOffReviewer}
                    onChange={(e) => setSignOffReviewer(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('reconciliation.lbl_audit_memo')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={signOffNotes}
                    onChange={(e) => setSignOffNotes(e.target.value)}
                    required
                  />
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#15803d' }}>
                  {t('reconciliation.note_signoff')}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsSignOffModalOpen(false)}>{t('common:actions.cancel')}</button>
                <button type="submit" className="btn-primary">
                  {t('reconciliation.btn_certify_lock')}
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
