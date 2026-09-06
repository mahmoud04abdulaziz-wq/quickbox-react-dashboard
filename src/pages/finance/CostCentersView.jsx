import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import { useInventory } from '../../context/InventoryContext';
import {
  Buildings,
  ChartPie,
  Percent,
  Receipt,
  Plus,
  X,
  Package,
  CheckCircle,
  Warning
} from '@phosphor-icons/react';

function CostCentersView() {
  const { t } = useTranslation('finance');
  const { costCenters, requisitions, createRequisition } = useFinance();
  const { inventory } = useInventory();

  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Form State for New Department Requisition
  const [reqCostCenter, setReqCostCenter] = useState('CC-100');
  const [reqStaff, setReqStaff] = useState('Aisha T.');
  const [reqItems, setReqItems] = useState([
    { sku: 'LIN-001', name: 'Bath Towel - White', qty: 20, unitCost: 12.50 }
  ]);

  const addReqLine = () => {
    const firstInv = inventory && inventory[0] ? inventory[0] : { sku: 'LIN-001', name: 'Bath Towel', unitCost: 12.50 };
    setReqItems(prev => [
      ...prev,
      { sku: firstInv.sku, name: firstInv.name, qty: 10, unitCost: firstInv.unitCost || 10.00 }
    ]);
  };

  const removeReqLine = (idx) => {
    if (reqItems.length > 1) {
      setReqItems(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const updateReqItem = (idx, sku) => {
    const invItem = (inventory || []).find(i => i.sku === sku);
    setReqItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          sku,
          name: invItem ? invItem.name : sku,
          unitCost: invItem ? invItem.unitCost : 10.00
        };
      }
      return item;
    }));
  };

  const updateReqQty = (idx, qty) => {
    setReqItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, qty: parseInt(qty) || 0 };
      }
      return item;
    }));
  };

  const totalReqCost = reqItems.reduce((s, i) => s + (i.qty * i.unitCost), 0);

  const handleSubmitRequisition = (e) => {
    e.preventDefault();
    createRequisition({
      cost_center_code: reqCostCenter,
      staff_name: reqStaff,
      items: reqItems.map(i => ({
        sku: i.sku,
        name: i.name,
        qty: i.qty,
        unitCost: i.unitCost,
        total: parseFloat((i.qty * i.unitCost).toFixed(2))
      }))
    });
    setIsNewReqModalOpen(false);
    setReqItems([{ sku: 'LIN-001', name: 'Bath Towel - White', qty: 20, unitCost: 12.50 }]);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Cost Centers &amp; Departmental Consumption</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / cost centers &amp; internal usage
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Automated Inventory Relieve &amp; Expense Posting
          </span>
        </div>
      </div>

      {/* F8. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Consumption (MTD)</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Buildings size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$42,850</div>
          <div className="metric-delta">58 requisitions</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Active Cost Centers</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ChartPie size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">6</div>
          <div className="metric-delta">CC-100 to CC-600</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Budget Utilization</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Percent size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">74.2%</div>
          <div className="metric-delta" style={{ color: '#ca8a04', fontWeight: 600 }}>1 dept over target</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Avg Requisition</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$738.80</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>1.2h avg turnaround</div>
        </div>
      </div>

      {/* Section 1: Departmental Budget Utilization Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' }}>
        {(costCenters || []).slice(0, 4).map((cc) => {
          const util = cc.utilization_percent || ((cc.actual_spent / cc.monthly_budget) * 100);
          const isOver = util > 100;

          return (
            <div className="card budget-card" key={cc.cost_center_id || cc.code}>
              <div className="budget-top">
                <span>{cc.name}</span>
                <span className="mono" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{cc.code}</span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${isOver ? 'over' : ''}`}
                  style={{ width: `${Math.min(util, 100)}%` }}
                ></div>
              </div>
              <div className="budget-meta">
                <span style={{ color: isOver ? '#b91c1c' : 'var(--text-main)', fontWeight: 600 }}>
                  {util.toFixed(1)}% used
                </span>
                <span>
                  ${(cc.actual_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${(cc.monthly_budget || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2: Departmental Requisitions Table */}
      <div className="row-actions">
        <div className="section-label" style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>
          Departmental Requisitions &amp; GL Expense Vouchers
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsNewReqModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} weight="bold" />
          <span>+ New Department Requisition</span>
        </button>
      </div>

      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Req ID</th>
              <th>Date</th>
              <th>Cost Center</th>
              <th>Staff Requester</th>
              <th>Total Cost</th>
              <th>GL Voucher Ref</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(requisitions || []).map((req) => (
              <tr key={req.requisition_id || req.id}>
                <td className="mono cell-strong">{req.requisition_id || req.id}</td>
                <td className="mono">{req.date}</td>
                <td>
                  <span className="tag-pill solid">{req.cost_center_name || req.cost_center_code}</span>
                </td>
                <td>{req.staff_name}</td>
                <td className="mono cell-strong">
                  ${(req.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="mono">{req.journal_entry_id || 'JV-2026-00409'}</td>
                <td>
                  <span className="badge ok">
                    <span className="d"></span> Approved
                  </span>
                </td>
                <td>
                  <span
                    className="link-action"
                    onClick={() => setSelectedReq(req)}
                  >
                    View
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Requisition Details Modal */}
      {selectedReq && (
        <div className="modal-overlay" onClick={() => setSelectedReq(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div className="modal-title">Requisition Details — {selectedReq.requisition_id || selectedReq.id}</div>
              <button className="modal-close-btn" onClick={() => setSelectedReq(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', fontSize: '12px' }}>
                <div>Department: <b>{selectedReq.cost_center_name || selectedReq.cost_center_code}</b></div>
                <div>Staff: <b>{selectedReq.staff_name}</b> | Date: <b>{selectedReq.date}</b></div>
                <div>Auto GL Voucher: <b className="mono">{selectedReq.journal_entry_id || 'JV-2026-00409'}</b></div>
              </div>

              <div className="section-label" style={{ marginBottom: '8px' }}>Dispatched Stock Items</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Item Description</th>
                      <th>Qty</th>
                      <th>Unit Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedReq.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="mono">{it.sku}</td>
                        <td>{it.name}</td>
                        <td className="mono">{it.qty}</td>
                        <td className="mono">${(it.unitCost || 0).toFixed(2)}</td>
                        <td className="mono cell-strong">${(it.total || it.qty * it.unitCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: '13px' }}>
                <span>Total Consumption Expense:</span>
                <span className="mono">${(selectedReq.total_cost || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedReq(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Requisition Modal */}
      {isNewReqModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewReqModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">New Department Stock Requisition</div>
              <button className="modal-close-btn" onClick={() => setIsNewReqModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Cost Center / Department</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={reqCostCenter}
                    onChange={(e) => setReqCostCenter(e.target.value)}
                  >
                    {(costCenters || []).map(cc => (
                      <option key={cc.cost_center_id || cc.code} value={cc.code}>
                        {cc.code} — {cc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Requester Staff Name</label>
                  <input
                    className="input input-full"
                    value={reqStaff}
                    onChange={(e) => setReqStaff(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Items Section */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="section-label" style={{ margin: 0 }}>Requisition Items</span>
                  <button
                    type="button"
                    onClick={addReqLine}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Inventory SKU / Item</th>
                        <th style={{ width: '80px' }}>Qty</th>
                        <th style={{ width: '90px' }}>Unit Cost</th>
                        <th style={{ width: '90px' }}>Total</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <select
                              className="select"
                              style={{ width: '100%', fontSize: '11.5px' }}
                              value={item.sku}
                              onChange={(e) => updateReqItem(idx, e.target.value)}
                            >
                              {(inventory || []).map(inv => (
                                <option key={inv.id || inv.sku} value={inv.sku}>
                                  {inv.sku} — {inv.name} (Stock: {inv.stock})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="input mono"
                              style={{ width: '100%', fontSize: '11.5px' }}
                              value={item.qty}
                              onChange={(e) => updateReqQty(idx, e.target.value)}
                              required
                            />
                          </td>
                          <td className="mono">${(item.unitCost || 0).toFixed(2)}</td>
                          <td className="mono cell-strong">${(item.qty * item.unitCost).toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            {reqItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeReqLine(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px' }}>
                <span>Total Requisition Value:</span>
                <span className="mono">${totalReqCost.toFixed(2)}</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsNewReqModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Approve Requisition &amp; Auto-Post Expense GL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CostCentersView;
