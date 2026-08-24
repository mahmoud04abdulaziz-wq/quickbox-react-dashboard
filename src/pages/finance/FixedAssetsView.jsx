import React, { useState, useMemo } from 'react';
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Fixed Assets Register &amp; Depreciation</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / capital expenditure &amp; asset depreciation
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Straight-Line Depreciation Engine
          </span>
          <span className="badge ok">
            <span className="d"></span> GL Contra-Asset 15200 Sync
          </span>
        </div>
      </div>

      {/* F9. 4 KPI Metric Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Gross Capex</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Archive size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$450,000</div>
          <div className="metric-delta">{(fixedAssets || []).length || 24} registered assets</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Accum. Depreciation</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <TrendDown size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#b91c1c' }}>$168,200</div>
          <div className="metric-delta">Contra-asset 15200</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Net Book Value</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$281,800</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>Current B/S value</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Monthly Dep. Run</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CalendarBlank size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$6,500</div>
          <div className="metric-delta">Next: 31 Aug 2026</div>
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
            <option value="ALL">All Categories ({(fixedAssets || []).length})</option>
            <option value="Laundry">Laundry &amp; Equipment</option>
            <option value="Kitchen">Kitchen Equipment</option>
            <option value="HVAC">HVAC &amp; Mechanical</option>
            <option value="IT">IT &amp; Hardware</option>
            <option value="Furniture">Furniture &amp; Fixtures</option>
          </select>

          {depRunSuccessToast && (
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} weight="bold" /> Monthly Depreciation Run Completed &amp; JV Posted!
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
            <span>Run Monthly Depreciation</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsRegisterModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} weight="bold" />
            <span>+ Register Asset</span>
          </button>
        </div>
      </div>

      {/* Fixed Assets Data Table */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Acquired Date</th>
              <th>Useful Life</th>
              <th>Cost ($)</th>
              <th>Net Book Value ($)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.asset_id || asset.id}>
                <td className="mono cell-strong">{asset.asset_tag || asset.asset_id}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{asset.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Assigned: {asset.cost_center}</div>
                </td>
                <td>
                  <span className="tag-pill solid">{asset.category}</span>
                </td>
                <td className="mono">{asset.acquisition_date}</td>
                <td className="mono">{(asset.useful_life_months / 12).toFixed(0)} Years ({asset.useful_life_months}m)</td>
                <td className="mono cell-strong">
                  ${(asset.cost || asset.acquisition_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="mono cell-strong" style={{ color: '#15803d' }}>
                  ${(asset.net_book_value !== undefined ? asset.net_book_value : (asset.cost - asset.accumulated_depreciation)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span
                    className="link-action"
                    onClick={() => setSelectedAssetForSchedule(asset)}
                  >
                    Schedule
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
              <div className="modal-title">Depreciation Schedule — {selectedAssetForSchedule.name}</div>
              <button className="modal-close-btn" onClick={() => setSelectedAssetForSchedule(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>Asset Tag: <b className="mono">{selectedAssetForSchedule.asset_tag}</b></div>
                  <div>Category: <b>{selectedAssetForSchedule.category}</b></div>
                  <div>Historical Cost: <b className="mono">${selectedAssetForSchedule.cost.toLocaleString()}</b></div>
                  <div>Salvage Value: <b className="mono">${selectedAssetForSchedule.salvage_value.toLocaleString()}</b></div>
                  <div>Accumulated Dep: <b className="mono" style={{ color: '#b91c1c' }}>${selectedAssetForSchedule.accumulated_depreciation.toLocaleString()}</b></div>
                  <div>Current Net Book Value: <b className="mono" style={{ color: '#15803d' }}>${selectedAssetForSchedule.net_book_value.toLocaleString()}</b></div>
                  <div>Monthly Depreciation: <b className="mono">${selectedAssetForSchedule.monthly_depreciation_amount.toFixed(2)}/mo</b></div>
                  <div>GL Account: <b className="mono">15100 / Contra 15200</b></div>
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: '8px' }}>Projected 12-Month Straight-Line Amortization</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Depreciation Expense</th>
                      <th>Accum. Deprec</th>
                      <th>Ending NBV</th>
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
                          <td className="mono">Month +{monthNum} (2026-0{8 + i})</td>
                          <td className="mono">${monthDep.toFixed(2)}</td>
                          <td className="mono">${accum.toFixed(2)}</td>
                          <td className="mono cell-strong">${endingNbv.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedAssetForSchedule(null)}>
                Close
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
              <div className="modal-title">Register Fixed Capital Asset</div>
              <button className="modal-close-btn" onClick={() => setIsRegisterModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Asset Name / Description</label>
                <input
                  className="input input-full"
                  placeholder="e.g. Industrial Laundry Press 3000"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Asset Category</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                  >
                    <option value="Laundry Equipment">Laundry Equipment</option>
                    <option value="Kitchen Equipment">Kitchen Equipment</option>
                    <option value="HVAC & Mechanical">HVAC &amp; Mechanical</option>
                    <option value="IT Hardware">IT Hardware &amp; Servers</option>
                    <option value="Furniture">Furniture &amp; Fixtures</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Assigned Cost Center</label>
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
                  <label className="form-label">Acquisition Cost ($)</label>
                  <input
                    type="number"
                    step="100"
                    className="input input-full mono"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Salvage Value ($)</label>
                  <input
                    type="number"
                    step="50"
                    className="input input-full mono"
                    value={salvageValue}
                    onChange={(e) => setSalvageValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Useful Life (Months)</label>
                  <input
                    type="number"
                    step="12"
                    className="input input-full mono"
                    value={usefulLifeMonths}
                    onChange={(e) => setUsefulLifeMonths(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Acquisition Date</label>
                  <input
                    type="date"
                    className="input input-full"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Depreciation Method</label>
                  <select className="select" style={{ width: '100%' }}>
                    <option>Straight-Line (Monthly)</option>
                    <option>Double Declining Balance</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsRegisterModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Capitalize Asset &amp; Register
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
