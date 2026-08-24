import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  Clock,
  Play,
  SlidersHorizontal,
  MagnifyingGlass,
  X,
  FileText,
  Package,
  Receipt,
  ArrowsLeftRight
} from '@phosphor-icons/react';

function ThreeWayMatchingView() {
  const { threeWayMatches, runAutoMatch, runThreeWayMatch, postJournalEntry } = useFinance();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overridePo, setOverridePo] = useState('PO-2026-001');
  const [overrideGrn, setOverrideGrn] = useState('GRN-2026-004');
  const [overrideBill, setOverrideBill] = useState('BILL-2026-089');

  // Filter matches
  const filteredMatches = useMemo(() => {
    return (threeWayMatches || []).filter(m => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'MATCHED') return m.status === 'MATCHED' || m.status === 'PERFECT';
      if (filterStatus === 'PPV_HOLD') return m.status === 'PPV_HOLD' || m.status === 'PPV';
      if (filterStatus === 'QTY_HOLD') return m.status === 'QTY_HOLD';
      if (filterStatus === 'UNBILLED') return m.status === 'UNBILLED_GRN' || !m.bill_ref || m.bill_ref === '—';
      return true;
    });
  }, [threeWayMatches, filterStatus]);

  // Handle Manual Override
  const handleManualOverride = (e) => {
    e.preventDefault();
    runThreeWayMatch(overridePo, overrideGrn, overrideBill);
    setIsOverrideModalOpen(false);
  };

  // Handle Approve PPV & Release Hold
  const handleApprovePpv = (match) => {
    if (!match) return;
    // Generate PPV GL Entry if variance > 0
    if (match.ppv_amount && match.ppv_amount > 0) {
      postJournalEntry({
        memo: `PPV Variance Approval — ${match.po_ref} / ${match.bill_ref} (${match.vendor_name})`,
        voucher_type: 'AP',
        reference_number: match.bill_ref,
        lines: [
          { account_code: '51200', account_name: 'Purchase Price Variance (PPV)', debit_amount: match.ppv_amount, credit_amount: 0, description: `PPV variance for ${match.sku}` },
          { account_code: '21010', account_name: 'Trade Accounts Payable Control', debit_amount: 0, credit_amount: match.ppv_amount, description: `AP adjustment for ${match.bill_ref}` }
        ]
      });
    }
    match.status = 'MATCHED';
    match.action_required = 'Approved by Manager';
    setSelectedMatch(null);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Page Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>3-Way Matching Engine</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / procurement & matching
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Tolerance: ±2.0% ($50 Cap)
          </span>
          <span className="badge ok">
            <span className="d"></span> Automated Clearing Active
          </span>
        </div>
      </div>

      {/* F3. 4 KPI Metric Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Fully Matched</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$184,250</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>42 POs cleared</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Price Variance (PPV)</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <WarningCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$8,420</div>
          <div className="metric-delta" style={{ color: '#ca8a04', fontWeight: 600 }}>5 bills &gt; 2.0%</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Qty Discrepancy</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <XCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$12,100</div>
          <div className="metric-delta" style={{ color: '#dc2626', fontWeight: 600 }}>3 bills on hold</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">GR/IR Clearing</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$18,000</div>
          <div className="metric-delta">8 unbilled receipts</div>
        </div>
      </div>

      {/* Row Actions & Filter Controls */}
      <div className="row-actions">
        <div className="filters">
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Matches ({(threeWayMatches || []).length})</option>
            <option value="MATCHED">Perfect Match ({(threeWayMatches || []).filter(m => m.status === 'MATCHED' || m.status === 'PERFECT').length})</option>
            <option value="PPV_HOLD">PPV Hold ({(threeWayMatches || []).filter(m => m.status === 'PPV_HOLD' || m.status === 'PPV').length})</option>
            <option value="QTY_HOLD">Qty Discrepancy ({(threeWayMatches || []).filter(m => m.status === 'QTY_HOLD').length})</option>
            <option value="UNBILLED">Unbilled GRN ({(threeWayMatches || []).filter(m => m.status === 'UNBILLED_GRN' || !m.bill_ref || m.bill_ref === '—').length})</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            onClick={runAutoMatch}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} weight="fill" />
            <span>Run Auto-Match</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsOverrideModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowsLeftRight size={14} weight="bold" />
            <span>+ Manual Match Link</span>
          </button>
        </div>
      </div>

      {/* 3-Way Matching Table */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>PO Ref</th>
              <th>GRN Ref</th>
              <th>Bill Ref</th>
              <th>Vendor</th>
              <th>SKU / Item</th>
              <th>PPV Variance</th>
              <th>Tolerance Rule</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((m) => {
              const isOk = m.status === 'MATCHED' || m.status === 'PERFECT';
              const isPpv = m.status === 'PPV_HOLD' || m.status === 'PPV';
              const isQty = m.status === 'QTY_HOLD';
              const badgeClass = isOk ? 'ok' : isPpv ? 'warn' : 'crit';
              const badgeLabel = isOk ? 'Perfect' : isPpv ? 'PPV' : isQty ? 'Qty Hold' : 'Unbilled';

              return (
                <tr key={m.match_id || m.id}>
                  <td>
                    <span className={`badge ${badgeClass}`}>
                      <span className="d"></span>
                      {badgeLabel}
                    </span>
                  </td>
                  <td className="mono cell-strong">{m.po_ref}</td>
                  <td className="mono">{m.grn_ref}</td>
                  <td className="mono">{m.bill_ref || '—'}</td>
                  <td>{m.vendor_name}</td>
                  <td>{m.sku || 'General Supply'}</td>
                  <td className="mono cell-strong">
                    {m.ppv_amount > 0 ? `+$${m.ppv_amount.toFixed(2)}` : '$0.00'}
                  </td>
                  <td>
                    <span className={`badge ${badgeClass}`}>
                      <span className="d"></span>
                      {m.tolerance_percent ? `Within ${m.tolerance_percent}%` : m.action_required || 'Standard'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="link-action"
                      onClick={() => setSelectedMatch(m)}
                    >
                      Inspect
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Side-by-Side 3-Document Inspection Modal / Drawer */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowsLeftRight size={18} weight="bold" />
                <span>3-Way Matching Inspection Audit — {selectedMatch.po_ref}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMatch(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Vendor / Supplier</div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedMatch.vendor_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Item SKU</div>
                  <div className="mono" style={{ fontSize: '13px', fontWeight: 700 }}>{selectedMatch.sku}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Match Status</div>
                  <span className={`badge ${selectedMatch.status === 'MATCHED' ? 'ok' : 'warn'}`}>
                    <span className="d"></span>{selectedMatch.status}
                  </span>
                </div>
              </div>

              {/* 3 Side-by-Side Comparison Panels: PO vs GRN vs Vendor Bill */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                {/* 1. Purchase Order */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-main)' }}>
                    <FileText size={16} weight="bold" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>1. Purchase Order</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Ref: <b className="mono">{selectedMatch.po_ref}</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                    <span>Ordered Qty:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{selectedMatch.po_qty || 100}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                    <span>Unit Price:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>${(selectedMatch.po_unit_price || 12.50).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', fontSize: '12px', fontWeight: 700 }}>
                    <span>PO Total:</span>
                    <span className="mono">${((selectedMatch.po_qty || 100) * (selectedMatch.po_unit_price || 12.50)).toFixed(2)}</span>
                  </div>
                </div>

                {/* 2. Goods Receipt Note */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#15803d' }}>
                    <Package size={16} weight="bold" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>2. Goods Receipt (GRN)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Ref: <b className="mono">{selectedMatch.grn_ref}</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                    <span>Received Qty:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{selectedMatch.grn_qty || 100}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                    <span>Valuation Rate:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>${(selectedMatch.po_unit_price || 12.50).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', fontSize: '12px', fontWeight: 700 }}>
                    <span>GRN Asset:</span>
                    <span className="mono">${((selectedMatch.grn_qty || 100) * (selectedMatch.po_unit_price || 12.50)).toFixed(2)}</span>
                  </div>
                </div>

                {/* 3. Vendor Bill */}
                <div style={{ border: `1px solid ${selectedMatch.ppv_amount > 0 ? '#f59e0b' : 'var(--border-color)'}`, borderRadius: '8px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: selectedMatch.ppv_amount > 0 ? '#ca8a04' : '#2563eb' }}>
                    <Receipt size={16} weight="bold" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>3. Vendor Invoice</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Ref: <b className="mono">{selectedMatch.bill_ref || '—'}</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                    <span>Billed Qty:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{selectedMatch.bill_qty || 100}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                    <span>Billed Unit Price:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>${(selectedMatch.bill_unit_price || 13.00).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', fontSize: '12px', fontWeight: 700 }}>
                    <span>Billed Total:</span>
                    <span className="mono">${((selectedMatch.bill_qty || 100) * (selectedMatch.bill_unit_price || 13.00)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Variance & Automated PPV Allocation breakdown */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Variance Audit & Automated GL Account Allocation
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                  <span>Price Variance (PPV Amount):</span>
                  <span className="mono" style={{ fontWeight: 700, color: selectedMatch.ppv_amount > 0 ? '#b91c1c' : '#15803d' }}>
                    ${(selectedMatch.ppv_amount || 0).toFixed(2)} ({selectedMatch.ppv_variance_percent || 0}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                  <span>Automated GL Variance Account:</span>
                  <span className="mono"><b>51200</b> (Purchase Price Variance)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                  <span>Audit Verdict:</span>
                  <span style={{ fontWeight: 600 }}>{selectedMatch.action_required || 'Audit cleared'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedMatch(null)}>
                Close Audit
              </button>
              {selectedMatch.status !== 'MATCHED' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleApprovePpv(selectedMatch)}
                >
                  Approve PPV & Release Payment Hold
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Link Modal */}
      {isOverrideModalOpen && (
        <div className="modal-overlay" onClick={() => setIsOverrideModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title">Manual 3-Way Reconciliation Link</div>
              <button className="modal-close-btn" onClick={() => setIsOverrideModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleManualOverride}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Purchase Order (PO)</label>
                <input
                  className="input input-full"
                  value={overridePo}
                  onChange={(e) => setOverridePo(e.target.value)}
                  placeholder="PO-2026-001"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Goods Receipt Note (GRN)</label>
                <input
                  className="input input-full"
                  value={overrideGrn}
                  onChange={(e) => setOverrideGrn(e.target.value)}
                  placeholder="GRN-2026-004"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Vendor Bill (Invoice)</label>
                <input
                  className="input input-full"
                  value={overrideBill}
                  onChange={(e) => setOverrideBill(e.target.value)}
                  placeholder="BILL-2026-089"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsOverrideModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Execute 3-Way Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreeWayMatchingView;
