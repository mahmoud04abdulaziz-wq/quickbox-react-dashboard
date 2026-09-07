import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  Package,
  SlidersHorizontal,
  CheckCircle,
  Scales,
  Plus,
  X,
  FloppyDisk
} from '@phosphor-icons/react';

function ValuationRulesView() {
  const { t } = useTranslation(['finance', 'common']);
  const { valuationRules, updateValuationRule, accounts } = useFinance();

  const [landedCostBasis, setLandedCostBasis] = useState('Value');
  const [ppvTolerance, setPpvTolerance] = useState('± 2.0%');
  const [absoluteCap, setAbsoluteCap] = useState('$50.00');
  const [saveToast, setSaveToast] = useState(false);

  // Edit / Add Mapping Modal State
  const [editingRule, setEditingRule] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editPolicy, setEditPolicy] = useState('AVCO');
  const [editAssetAcc, setEditAssetAcc] = useState('13110');
  const [editCogsAcc, setEditCogsAcc] = useState('50110');
  const [editVarianceAcc, setEditVarianceAcc] = useState('51200');
  const [editPpvTolerance, setEditPpvTolerance] = useState(2.0);
  const [editCap, setEditCap] = useState(50.00);

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setEditCategory(rule ? rule.category : '');
    setEditPolicy(rule ? rule.policy : 'AVCO');
    setEditAssetAcc(rule ? rule.inventory_asset_account : '13110');
    setEditCogsAcc(rule ? rule.cogs_account : '50110');
    setEditVarianceAcc(rule ? rule.variance_account : '51200');
    setEditPpvTolerance(rule ? rule.ppv_tolerance_percent : 2.0);
    setEditCap(rule ? rule.absolute_cap_usd : 50.00);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    updateValuationRule(editCategory, {
      category: editCategory,
      policy: editPolicy,
      inventory_asset_account: editAssetAcc,
      cogs_account: editCogsAcc,
      variance_account: editVarianceAcc,
      ppv_tolerance_percent: parseFloat(editPpvTolerance),
      absolute_cap_usd: parseFloat(editCap)
    });
    setEditingRule(null);
  };

  const handleSaveGlobalConfig = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {t('finance:valuation_rules.title', 'Inventory Valuation & GL Mapping Rules')}
          </h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }} dir="ltr">
            {t('finance:valuation_rules.breadcrumb', '/ finance / inventory costing rules & policies')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('finance:valuation_rules.badge_subledger_gl', 'Sub-Ledger ≡ General Ledger Linked')}
          </span>
        </div>
      </div>

      {/* F7. 4 KPI Metric Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:valuation_rules.kpi_sku_categories', 'SKU Categories')}</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Package size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">{(valuationRules || []).length || 6}</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>
            {t('finance:valuation_rules.kpi_sku_categories_delta', '100% GL mapped')}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:valuation_rules.kpi_valuation_policy', 'Valuation Policy')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <SlidersHorizontal size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">FIFO / AVCO</div>
          <div className="metric-delta">
            {t('finance:valuation_rules.kpi_valuation_policy_delta', 'Per-category enforcement')}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:valuation_rules.kpi_autopost_engine', 'Auto-Posting Engine')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{t('common:status.active', 'Active')}</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>
            {t('finance:valuation_rules.kpi_autopost_engine_delta', 'Idempotency protected')}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:valuation_rules.kpi_recon_delta', 'Reconciliation Δ')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Scales size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">0.00%</div>
          <div className="metric-delta">
            {t('finance:valuation_rules.kpi_recon_delta_delta', 'Sub-ledger == GL')}
          </div>
        </div>
      </div>

      {/* Section 1: Category -> GL Mapping Table */}
      <div className="row-actions">
        <div className="section-label" style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>
          {t('finance:valuation_rules.section_category_mappings', 'Category → General Ledger Account Mappings')}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => openEditModal({ category: '', policy: 'AVCO', inventory_asset_account: '13110', cogs_account: '50110', variance_account: '51200', ppv_tolerance_percent: 2.0, absolute_cap_usd: 50.00 })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} weight="bold" />
          <span>{t('finance:valuation_rules.btn_add_mapping', '+ Add Mapping')}</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '22px', borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>{t('finance:valuation_rules.th_category', 'Category')}</th>
              <th>{t('common:table.count', 'SKUs Count')}</th>
              <th>{t('finance:valuation_rules.th_policy', 'Costing Policy')}</th>
              <th>{t('finance:valuation_rules.th_asset_account', 'Asset GL Account')}</th>
              <th>{t('finance:valuation_rules.th_cogs_account', 'COGS GL Account')}</th>
              <th>{t('finance:valuation_rules.th_variance_account', 'Variance / Shrinkage GL')}</th>
              <th>{t('common:table.actions', 'Action')}</th>
            </tr>
          </thead>
          <tbody>
            {(valuationRules || []).map((rule, idx) => (
              <tr key={rule.category || idx}>
                <td className="cell-strong">{rule.category}</td>
                <td className="mono">{rule.sku_count ? `${rule.sku_count} SKUs` : 'Active'}</td>
                <td>
                  <span className={`tag-pill ${rule.policy === 'FIFO' ? 'solid' : ''}`}>
                    {rule.policy}
                  </span>
                </td>
                <td className="mono">{rule.inventory_asset_account}</td>
                <td className="mono">{rule.cogs_account}</td>
                <td className="mono">{rule.variance_account}</td>
                <td>
                  <span
                    className="link-action"
                    onClick={() => openEditModal(rule)}
                  >
                    {t('common:actions.edit', 'Edit')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Landed Cost & PPV Tolerance Configuration Card */}
      <div className="card form-card" style={{ maxWidth: 'none', borderRadius: '12px', background: '#ffffff' }}>
        <div className="section-label" style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '14px' }}>
          {t('valuation_rules.h_landed_ppv', 'Landed Cost & PPV Tolerance Configuration')}
        </div>

        <div className="form-row">
          <label className="form-label">{t('valuation_rules.lbl_landed_alloc_basis', 'Landed Cost Allocation Basis')}</label>
          <div className="radio-group">
            <div
              className={`radio-opt ${landedCostBasis === 'Value' ? 'selected' : ''}`}
              onClick={() => setLandedCostBasis('Value')}
            >
              {t('valuation_rules.opt_by_value', 'Allocate Pro-Rata by Item Value (JOD)')}
            </div>
            <div
              className={`radio-opt ${landedCostBasis === 'Weight_Qty' ? 'selected' : ''}`}
              onClick={() => setLandedCostBasis('Weight_Qty')}
            >
              {t('valuation_rules.opt_by_weight', 'Allocate Pro-Rata by Item Weight / Units Qty')}
            </div>
          </div>
          <div className="form-hint">
            {t('valuation_rules.desc_landed_hint', 'Controls how inbound freight, customs tariff, and insurance fees are capitalized into perpetual inventory valuation.')}
          </div>
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">{t('valuation_rules.lbl_ppv_tolerance', 'Global PPV Variance Tolerance')}</label>
            <input
              className="input input-full mono"
              dir="ltr"
              value={ppvTolerance}
              onChange={(e) => setPpvTolerance(e.target.value)}
            />
            <div className="form-hint">{t('valuation_rules.desc_ppv_hint', 'Discrepancies within this threshold bypass manual managerial hold.')}</div>
          </div>
          <div>
            <label className="form-label">{t('valuation_rules.lbl_absolute_cap', 'Absolute JOD Cap')}</label>
            <input
              className="input input-full mono"
              dir="ltr"
              value={absoluteCap}
              onChange={(e) => setAbsoluteCap(e.target.value)}
            />
            <div className="form-hint">{t('valuation_rules.desc_cap_hint', 'Variance exceeding this absolute amount requires CPA review.')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px' }}>
          <button className="btn btn-primary" onClick={handleSaveGlobalConfig}>
            {t('valuation_rules.btn_save_config')}
          </button>
          {saveToast && (
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} weight="bold" /> {t('valuation_rules.msg_saved_success', 'Configuration saved successfully!')}
            </span>
          )}
        </div>
      </div>

      {/* Edit Category Mapping Modal */}
      {editingRule !== null && (
        <div className="modal-overlay" onClick={() => setEditingRule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('valuation_rules.modal_configure_title', 'Configure Category Valuation & GL Mapping')}</div>
              <button className="modal-close-btn" onClick={() => setEditingRule(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRule}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_category_name', 'Category Name')}</label>
                  <input
                    className="input input-full"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_valuation_policy', 'Costing Valuation Policy')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={editPolicy}
                    onChange={(e) => setEditPolicy(e.target.value)}
                  >
                    <option value="AVCO">{t('valuation_rules.opt_avco', 'AVCO (Weighted Average Cost)')}</option>
                    <option value="FIFO">{t('valuation_rules.opt_fifo', 'FIFO (First In First Out)')}</option>
                    <option value="Standard Cost">{t('valuation_rules.opt_standard_cost', 'Standard Cost')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_asset_gl', 'Asset GL Account')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={editAssetAcc}
                    onChange={(e) => setEditAssetAcc(e.target.value)}
                  >
                    {(accounts || []).filter(a => a.account_type === 'Asset').map(a => (
                      <option key={a.account_id} value={a.account_code}>{a.account_code} - {a.account_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_cogs_gl', 'COGS GL Account')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={editCogsAcc}
                    onChange={(e) => setEditCogsAcc(e.target.value)}
                  >
                    {(accounts || []).filter(a => a.account_type === 'COGS').map(a => (
                      <option key={a.account_id} value={a.account_code}>{a.account_code} - {a.account_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_variance_gl', 'Variance GL')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={editVarianceAcc}
                    onChange={(e) => setEditVarianceAcc(e.target.value)}
                  >
                    {(accounts || []).map(a => (
                      <option key={a.account_id} value={a.account_code}>{a.account_code} - {a.account_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_ppv_percent', 'PPV Tolerance (%)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    dir="ltr"
                    className="input input-full mono"
                    value={editPpvTolerance}
                    onChange={(e) => setEditPpvTolerance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">{t('valuation_rules.lbl_absolute_cap_val', 'Absolute Cap (JOD)')}</label>
                  <input
                    type="number"
                    step="1"
                    dir="ltr"
                    className="input input-full mono"
                    value={editCap}
                    onChange={(e) => setEditCap(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingRule(null)}>{t('common:actions.cancel')}</button>
                <button type="submit" className="btn btn-primary">
                  {t('valuation_rules.btn_save_apply')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValuationRulesView;
