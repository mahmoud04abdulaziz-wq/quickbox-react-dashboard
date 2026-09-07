import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  Archive,
  TrendDown,
  CheckCircle,
  CalendarBlank,
  Plus,
  Play,
  X,
  Clock,
  CurrencyDollar
} from '@phosphor-icons/react';

function FixedAssetsView() {
  const { t } = useTranslation(['finance', 'common']);
  const { fixedAssets, runMonthlyDepreciation, costCenters, accounts } = useFinance();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedAssetForSchedule, setSelectedAssetForSchedule] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [depRunSuccessToast, setDepRunSuccessToast] = useState(false);

  // New Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Laundry Equipment');
  const [assetCostCenter, setAssetCostCenter] = useState('CC-100');
  const [acquisitionCost, setAcquisitionCost] = useState(25000);
  const [salvageValue, setSalvageValue] = useState(2500);
  const [usefulLifeMonths, setUsefulLifeMonths] = useState(60);
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return (fixedAssets || []).filter(a => {
      if (categoryFilter === 'ALL') return true;
      return (a.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
    });
  }, [fixedAssets, categoryFilter]);

  // Run Depreciation Action
  const handleRunDepreciation = () => {
    runMonthlyDepreciation('2026-08');
    setDepRunSuccessToast(true);
    setTimeout(() => setDepRunSuccessToast(false), 4000);
  };

  const handleRegisterAsset = (e) => {
    e.preventDefault();
    const cost = parseFloat(acquisitionCost) || 0;
    const salvage = parseFloat(salvageValue) || 0;
    const months = parseInt(usefulLifeMonths) || 60;
    const monthlyDep = (cost - salvage) / months;

    const newAsset = {
      asset_id: `FA-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      asset_tag: `FA-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      name: assetName,
      category: assetCategory,
      cost_center: assetCostCenter,
      acquisition_date: acquisitionDate,
      acquisition_cost: cost,
      cost: cost,
      salvage_value: salvage,
      useful_life_months: months,
      depreciation_method: 'StraightLine',
      asset_gl_account: '15100',
      accum_deprec_gl_account: '15200',
      deprec_expense_gl_account: '64100',
      accumulated_depreciation: 0.00,
      net_book_value: cost,
      monthly_depreciation_amount: parseFloat(monthlyDep.toFixed(2)),
      status: 'Active'
    };

    fixedAssets.unshift(newAsset);
    setIsRegisterModalOpen(false);
    setAssetName('');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('fixed_assets.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('fixed_assets.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('fixed_assets.badge_straight_line')}
          </span>
          <span className="badge ok">
            <span className="d"></span> {t('fixed_assets.badge_contra_asset')}
          </span>
        </div>
      </div>

      {/* F9. 4 KPI Metric Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('fixed_assets.kpi_gross_capex')}</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Archive size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">$450,000</div>
          <div className="metric-delta"><span className="mono bidi-ltr" dir="ltr">{(fixedAssets || []).length || 24}</span> {t('fixed_assets.kpi_gross_capex_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('fixed_assets.kpi_accum_dep')}</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <TrendDown size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>$168,200</div>
          <div className="metric-delta">{t('fixed_assets.kpi_accum_dep_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('fixed_assets.kpi_net_book_value')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">$281,800</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>{t('fixed_assets.kpi_net_book_value_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('fixed_assets.kpi_monthly_dep_run')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CalendarBlank size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value mono bidi-ltr" dir="ltr">$6,500</div>
          <div className="metric-delta">{t('fixed_assets.kpi_monthly_dep_run_delta')}</div>
        </div>
      </div>

      {/* Row Actions & Filter Controls */}
      <div className="row-actions">
        <div className="filters">
          <select
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">{t('fixed_assets.opt_cat_all', { count: (fixedAssets || []).length, defaultValue: `All Categories (${(fixedAssets || []).length})` })}</option>
            <option value="Laundry">{t('fixed_assets.opt_cat_laundry', 'Laundry & Equipment')}</option>
            <option value="Kitchen">{t('fixed_assets.opt_cat_kitchen', 'Kitchen Equipment')}</option>
            <option value="HVAC">{t('fixed_assets.opt_cat_hvac', 'HVAC & Mechanical')}</option>
            <option value="IT">{t('fixed_assets.opt_cat_it', 'IT & Hardware')}</option>
            <option value="Furniture">{t('fixed_assets.opt_cat_furniture', 'Furniture & Fixtures')}</option>
          </select>

          {depRunSuccessToast && (
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} weight="bold" /> {t('fixed_assets.msg_dep_run_success')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            onClick={handleRunDepreciation}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} weight="fill" />
            <span>{t('fixed_assets.btn_run_depreciation')}</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsRegisterModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('fixed_assets.btn_register_asset')}</span>
          </button>
        </div>
      </div>

      {/* Fixed Assets Data Table */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>{t('fixed_assets.th_tag')}</th>
              <th>{t('fixed_assets.th_asset_name')}</th>
              <th>{t('fixed_assets.th_category')}</th>
              <th>{t('fixed_assets.th_acquisition_date')}</th>
              <th>{t('fixed_assets.th_useful_life')}</th>
              <th>{t('fixed_assets.th_cost')}</th>
              <th>{t('fixed_assets.th_book_value')}</th>
              <th>{t('common:table.action', { defaultValue: 'Action' })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.asset_id || asset.id}>
                <td className="mono cell-strong bidi-ltr" dir="ltr">{asset.asset_tag || asset.asset_id}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{asset.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{t('fixed_assets.lbl_assigned', { cc: asset.cost_center })}</div>
                </td>
                <td>
                  <span className="tag-pill solid">{asset.category}</span>
                </td>
                <td className="mono bidi-ltr" dir="ltr">{asset.acquisition_date}</td>
                <td className="mono bidi-ltr" dir="ltr">{(asset.useful_life_months / 12).toFixed(0)} {t('fixed_assets.lbl_years')} ({asset.useful_life_months}m)</td>
                <td className="mono cell-strong bidi-ltr" dir="ltr">
                  ${(asset.cost || asset.acquisition_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="mono cell-strong bidi-ltr" dir="ltr" style={{ color: '#15803d' }}>
                  ${(asset.net_book_value !== undefined ? asset.net_book_value : (asset.cost - asset.accumulated_depreciation)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span
                    className="link-action"
                    onClick={() => setSelectedAssetForSchedule(asset)}
                  >
                    {t('fixed_assets.th_schedule')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Depreciation Schedule Drawer / Modal */}
      {selectedAssetForSchedule && (
        <div className="modal-overlay" onClick={() => setSelectedAssetForSchedule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('fixed_assets.modal_sched_title', { name: selectedAssetForSchedule.name })}</div>
              <button className="modal-close-btn" onClick={() => setSelectedAssetForSchedule(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>{t('fixed_assets.lbl_tag')} <b className="mono bidi-ltr" dir="ltr">{selectedAssetForSchedule.asset_tag}</b></div>
                  <div>{t('fixed_assets.lbl_category')} <b>{selectedAssetForSchedule.category}</b></div>
                  <div>{t('fixed_assets.lbl_historical_cost')} <b className="mono bidi-ltr" dir="ltr">${selectedAssetForSchedule.cost.toLocaleString()}</b></div>
                  <div>{t('fixed_assets.lbl_salvage_val')} <b className="mono bidi-ltr" dir="ltr">${selectedAssetForSchedule.salvage_value.toLocaleString()}</b></div>
                  <div>{t('fixed_assets.lbl_accum_dep')} <b className="mono bidi-ltr" dir="ltr" style={{ color: '#b91c1c' }}>${selectedAssetForSchedule.accumulated_depreciation.toLocaleString()}</b></div>
                  <div>{t('fixed_assets.lbl_current_nbv')} <b className="mono bidi-ltr" dir="ltr" style={{ color: '#15803d' }}>${selectedAssetForSchedule.net_book_value.toLocaleString()}</b></div>
                  <div>{t('fixed_assets.lbl_monthly_dep')} <b className="mono bidi-ltr" dir="ltr">${selectedAssetForSchedule.monthly_depreciation_amount.toFixed(2)}/mo</b></div>
                  <div>{t('fixed_assets.lbl_gl_account')} <b className="mono bidi-ltr" dir="ltr">15100 / Contra 15200</b></div>
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: '8px' }}>{t('fixed_assets.h_projected_amortization')}</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>{t('fixed_assets.th_period')}</th>
                      <th>{t('fixed_assets.th_dep_expense')}</th>
                      <th>{t('fixed_assets.th_accum_deprec')}</th>
                      <th>{t('fixed_assets.th_ending_nbv')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }, (_, i) => {
                      const monthNum = i + 1;
                      const monthDep = selectedAssetForSchedule.monthly_depreciation_amount;
                      const accum = selectedAssetForSchedule.accumulated_depreciation + (monthNum * monthDep);
                      const endingNbv = Math.max(selectedAssetForSchedule.salvage_value, selectedAssetForSchedule.cost - accum);
                      return (
                        <tr key={i}>
                          <td className="mono bidi-ltr" dir="ltr">{t('fixed_assets.th_month_prefix', 'Month +')}{monthNum} (2026-0{8 + i})</td>
                          <td className="mono bidi-ltr" dir="ltr">${monthDep.toFixed(2)}</td>
                          <td className="mono bidi-ltr" dir="ltr">${accum.toFixed(2)}</td>
                          <td className="mono cell-strong bidi-ltr" dir="ltr">${endingNbv.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedAssetForSchedule(null)}>
                {t('common:actions.close', { defaultValue: 'Close' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      {isRegisterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('fixed_assets.modal_register_title')}</div>
              <button className="modal-close-btn" onClick={() => setIsRegisterModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('fixed_assets.form_asset_name')}</label>
                <input
                  className="input input-full"
                  placeholder={t('fixed_assets.placeholder_asset_name')}
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('fixed_assets.form_category')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                  >
                    <option value="Laundry Equipment">{t('fixed_assets.opt_cat_laundry_eq', 'Laundry Equipment')}</option>
                    <option value="Kitchen Equipment">{t('fixed_assets.opt_cat_kitchen_eq', 'Kitchen Equipment')}</option>
                    <option value="HVAC & Mechanical">{t('fixed_assets.opt_cat_hvac_mech', 'HVAC & Mechanical')}</option>
                    <option value="IT Hardware">{t('fixed_assets.opt_cat_it_servers', 'IT Hardware & Servers')}</option>
                    <option value="Furniture">{t('fixed_assets.opt_cat_furniture_fix', 'Furniture & Fixtures')}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('fixed_assets.form_cost_center')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={assetCostCenter}
                    onChange={(e) => setAssetCostCenter(e.target.value)}
                  >
                    {(costCenters || []).map(c => (
                      <option key={c.cost_center_id || c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('fixed_assets.form_acquisition_cost')}</label>
                  <input
                    type="number"
                    step="100"
                    className="input input-full mono bidi-ltr"
                    dir="ltr"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('fixed_assets.form_salvage_value')}</label>
                  <input
                    type="number"
                    step="50"
                    className="input input-full mono bidi-ltr"
                    dir="ltr"
                    value={salvageValue}
                    onChange={(e) => setSalvageValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">{t('fixed_assets.form_useful_life')}</label>
                  <input
                    type="number"
                    step="12"
                    className="input input-full mono bidi-ltr"
                    dir="ltr"
                    value={usefulLifeMonths}
                    onChange={(e) => setUsefulLifeMonths(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('fixed_assets.form_acquisition_date')}</label>
                  <input
                    type="date"
                    className="input input-full bidi-ltr"
                    dir="ltr"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('fixed_assets.form_dep_method')}</label>
                  <select className="select" style={{ width: '100%' }}>
                    <option value="Straight-Line">{t('fixed_assets.opt_dep_straight_line', 'Straight-Line (Monthly)')}</option>
                    <option value="Double-Declining">{t('fixed_assets.opt_dep_double_declining', 'Double Declining Balance')}</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsRegisterModalOpen(false)}>
                  {t('common:actions.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('fixed_assets.btn_submit_register')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FixedAssetsView;
