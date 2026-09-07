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
  const { t } = useTranslation(['finance', 'common']);
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('cost_centers.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('cost_centers.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('cost_centers.badge_auto_relieve')}
          </span>
        </div>
      </div>

      {/* F8. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cost_centers.kpi_consumption_mtd')}</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Buildings size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">$42,850</div>
          <div className="metric-delta">{t('cost_centers.kpi_consumption_mtd_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cost_centers.kpi_active_cc')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ChartPie size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">6</div>
          <div className="metric-delta">{t('cost_centers.kpi_active_cc_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cost_centers.kpi_budget_util')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Percent size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">74.2%</div>
          <div className="metric-delta" style={{ color: '#ca8a04', fontWeight: 600 }}>{t('cost_centers.kpi_budget_util_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cost_centers.kpi_avg_requisition')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">$738.80</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>{t('cost_centers.kpi_avg_requisition_delta')}</div>
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
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{cc.code}</span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${isOver ? 'over' : ''}`}
                  style={{ width: `${Math.min(util, 100)}%` }}
                ></div>
              </div>
              <div className="budget-meta">
                <span style={{ color: isOver ? '#b91c1c' : 'var(--text-main)', fontWeight: 600 }}>
                  {t('cost_centers.lbl_used', { percent: util.toFixed(1) })}
                </span>
                <span className="mono bidi-ltr" dir="ltr">
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
          {t('cost_centers.section_recent_reqs')}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsNewReqModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} weight="bold" />
          <span>{t('cost_centers.btn_new_requisition')}</span>
        </button>
      </div>

      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>{t('cost_centers.th_req_id')}</th>
              <th>{t('common:th_date', { defaultValue: 'Date' })}</th>
              <th>{t('cost_centers.th_cost_center')}</th>
              <th>{t('cost_centers.th_requester')}</th>
              <th>{t('cost_centers.th_total_cost')}</th>
              <th>{t('cost_centers.th_gl_voucher')}</th>
              <th>{t('common:status.status', { defaultValue: 'Status' })}</th>
              <th>{t('common:table.action', { defaultValue: 'Action' })}</th>
            </tr>
          </thead>
          <tbody>
            {(requisitions || []).map((req) => (
              <tr key={req.requisition_id || req.id}>
                <td className="mono cell-strong bidi-ltr" dir="ltr">{req.requisition_id || req.id}</td>
                <td className="mono bidi-ltr" dir="ltr">{req.date}</td>
                <td>
                  <span className="tag-pill solid">{req.cost_center_name || req.cost_center_code}</span>
                </td>
                <td>{req.staff_name}</td>
                <td className="mono cell-strong bidi-ltr" dir="ltr">
                  ${(req.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="mono bidi-ltr" dir="ltr">{req.journal_entry_id || 'JV-2026-00409'}</td>
                <td>
                  <span className="badge ok">
                    <span className="d"></span> {t('common:status.approved', { defaultValue: 'Approved' })}
                  </span>
                </td>
                <td>
                  <span
                    className="link-action"
                    onClick={() => setSelectedReq(req)}
                  >
                    {t('common:actions.view', { defaultValue: 'View' })}
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
              <div className="modal-title">{t('cost_centers.modal_details_title', { id: selectedReq.requisition_id || selectedReq.id })}</div>
              <button className="modal-close-btn" onClick={() => setSelectedReq(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', fontSize: '12px' }}>
                <div>{t('cost_centers.lbl_dept')} <b>{selectedReq.cost_center_name || selectedReq.cost_center_code}</b></div>
                <div>{t('cost_centers.lbl_staff')} <b>{selectedReq.staff_name}</b> | {t('common:th_date', { defaultValue: 'Date' })}: <b className="mono bidi-ltr" dir="ltr">{selectedReq.date}</b></div>
                <div>{t('cost_centers.lbl_auto_gl')} <b className="mono bidi-ltr" dir="ltr">{selectedReq.journal_entry_id || 'JV-2026-00409'}</b></div>
              </div>

              <div className="section-label" style={{ marginBottom: '8px' }}>{t('cost_centers.h_dispatched_items')}</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th>{t('cost_centers.th_sku')}</th>
                      <th>{t('cost_centers.th_item_desc')}</th>
                      <th>{t('cost_centers.th_qty')}</th>
                      <th>{t('cost_centers.th_unit_cost')}</th>
                      <th>{t('cost_centers.th_total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedReq.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="mono bidi-ltr" dir="ltr">{it.sku}</td>
                        <td>{it.name}</td>
                        <td className="mono bidi-ltr" dir="ltr">{it.qty}</td>
                        <td className="mono bidi-ltr" dir="ltr">${(it.unitCost || 0).toFixed(2)}</td>
                        <td className="mono cell-strong bidi-ltr" dir="ltr">${(it.total || it.qty * it.unitCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: '13px' }}>
                <span>{t('cost_centers.lbl_total_expense')}</span>
                <span className="mono bidi-ltr" dir="ltr">${(selectedReq.total_cost || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedReq(null)}>
                {t('common:actions.close', { defaultValue: 'Close' })}
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
              <div className="modal-title">{t('cost_centers.modal_new_req_title')}</div>
              <button className="modal-close-btn" onClick={() => setIsNewReqModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('cost_centers.lbl_cc_dept')}</label>
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
                  <label className="form-label">{t('cost_centers.lbl_staff_name')}</label>
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
                  <span className="section-label" style={{ margin: 0 }}>{t('cost_centers.lbl_req_items')}</span>
                  <button
                    type="button"
                    onClick={addReqLine}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}
                  >
                    {t('cost_centers.btn_add_item')}
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t('cost_centers.th_item_desc')}</th>
                        <th style={{ width: '80px' }}>{t('cost_centers.th_qty')}</th>
                        <th style={{ width: '90px' }}>{t('cost_centers.th_unit_cost')}</th>
                        <th style={{ width: '90px' }}>{t('cost_centers.th_total')}</th>
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
                              className="input mono bidi-ltr"
                              dir="ltr"
                              style={{ width: '100%', fontSize: '11.5px' }}
                              value={item.qty}
                              onChange={(e) => updateReqQty(idx, e.target.value)}
                              required
                            />
                          </td>
                          <td className="mono bidi-ltr" dir="ltr">${(item.unitCost || 0).toFixed(2)}</td>
                          <td className="mono cell-strong bidi-ltr" dir="ltr">${(item.qty * item.unitCost).toFixed(2)}</td>
                          <td style={{ textAlign: 'end' }}>
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
                <span>{t('cost_centers.lbl_total_req_val')}</span>
                <span className="mono bidi-ltr" dir="ltr">${totalReqCost.toFixed(2)}</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsNewReqModalOpen(false)}>
                  {t('common:actions.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('cost_centers.btn_approve_post')}
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
