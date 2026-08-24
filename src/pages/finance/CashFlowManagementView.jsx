import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  Coins,
  TrendUp,
  Receipt,
  CheckCircle,
  Warning,
  Plus,
  X,
  Calendar,
  Bank,
  ArrowsLeftRight,
  ShieldCheck,
  ChartBar,
  ChartPie
} from '@phosphor-icons/react';

function CashFlowManagementView() {
  const {
    cashFlowEntries,
    liquidityForecasts,
    workingCapitalMetrics,
    pdcPortfolio,
    addCashFlowEntry,
    updatePdcStatus,
    updateWorkingCapitalMetrics
  } = useFinance();

  const [activeTab, setActiveTab] = useState('liquidity-forecast'); // 'liquidity-forecast' | 'cash-events' | 'pdc-vault' | 'working-capital'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'INFLOW' | 'OUTFLOW'
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(null);

  // Form State for New Cash Event
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState('INFLOW');
  const [formCategory, setFormCategory] = useState('OPERATING');
  const [formSubCat, setFormSubCat] = useState('Customer AR Collection');
  const [formAmount, setFormAmount] = useState(15000);
  const [formParty, setFormParty] = useState('Al-Madina Trading LLC');
  const [formRef, setFormRef] = useState(`REF-${Date.now().toString().slice(-4)}`);

  // Working Capital Simulation State
  const [simDso, setSimDso] = useState(workingCapitalMetrics?.dso_days || 28.4);
  const [simDio, setSimDio] = useState(workingCapitalMetrics?.dio_days || 41.5);
  const [simDpo, setSimDpo] = useState(workingCapitalMetrics?.dpo_days || 34.2);

  const simCcc = parseFloat((simDso + simDio - simDpo).toFixed(1));

  // Calculated Metrics
  const currentAvailableCash = liquidityForecasts[0]?.projected_ending_cash || 428950.00;
  const nextMonthInflows = liquidityForecasts[1]?.expected_inflows || 185000.00;
  const nextMonthOutflows = liquidityForecasts[1]?.committed_outflows || 152000.00;
  const nextMonthNet = nextMonthInflows - nextMonthOutflows;

  const filteredEntries = cashFlowEntries.filter(e => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  const handleCreateEventSubmit = (e) => {
    e.preventDefault();
    const finalAmount = formType === 'OUTFLOW' ? -Math.abs(parseFloat(formAmount) || 0) : Math.abs(parseFloat(formAmount) || 0);

    addCashFlowEntry({
      date: formDate,
      type: formType,
      category: formCategory,
      sub_category: formSubCat,
      amount: finalAmount,
      party_name: formParty,
      reference: formRef,
      status: 'Projected'
    });

    setEventSuccess(`Logged ${formType} event for JOD ${Math.abs(finalAmount).toLocaleString()}`);
    setIsNewEventModalOpen(false);
    setTimeout(() => setEventSuccess(null), 5000);
  };

  const handleClearPdc = (pdcId) => {
    updatePdcStatus(pdcId, 'Cleared');
    setEventSuccess(`Post-Dated Check ${pdcId} marked as Cleared`);
    setTimeout(() => setEventSuccess(null), 4000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Cash Flow Management &amp; Liquidity Forecasting</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / treasury &amp; rolling liquidity runway
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Minimum Liquidity Reserve: JOD 150k
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsNewEventModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Plus size={14} weight="bold" />
            <span>Log Cash Event</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {eventSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '12px' }}>
          <CheckCircle size={16} weight="bold" />
          <span>{eventSuccess}</span>
        </div>
      )}

      {/* 5 KPI Cards */}
      <div className="metrics-5" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Net Available Cash</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Wallet size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD {currentAvailableCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="metric-delta">Unrestricted Liquid Funds</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">30-Day Inflows</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <TrendUp size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--primary-green)' }}>
            +JOD {nextMonthInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-delta">Collections &amp; PDCs</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">30-Day Outflows</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#ef4444' }}>
            -JOD {nextMonthOutflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-delta">Payroll + AP + Taxes + SSC</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Projected Net Trajectory</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Coins size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: nextMonthNet >= 0 ? 'var(--primary-green)' : '#ef4444' }}>
            +JOD {nextMonthNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-delta up" style={{ color: '#15803d' }}>Surplus Generation</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Cash Conversion (CCC)</span>
            <div className="metric-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}>
              <ArrowsLeftRight size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{workingCapitalMetrics?.cash_conversion_cycle_days || 35.7} Days</div>
          <div className="metric-delta">DSO 28d + DIO 41d - DPO 34d</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'liquidity-forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('liquidity-forecast')}
        >
          Rolling Liquidity Trajectory ({liquidityForecasts.length} Periods)
        </button>
        <button
          className={`tab-btn ${activeTab === 'cash-events' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash-events')}
        >
          Scheduled Cash Events ({cashFlowEntries.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'pdc-vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdc-vault')}
        >
          Post-Dated Checks (PDC) Vault ({(pdcPortfolio || []).length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'working-capital' ? 'active' : ''}`}
          onClick={() => setActiveTab('working-capital')}
        >
          Working Capital Optimization &amp; CCC
        </button>
      </div>

      {/* SUB-TAB 1: ROLLING LIQUIDITY TRAJECTORY */}
      {activeTab === 'liquidity-forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Multi-Period Rolling Liquidity Runway</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cash Inflow/Outflow Trajectory vs JOD 150,000 Safety Buffer Floor
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> 11.2+ Months Liquidity Runway</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Forecast Period</th>
                    <th style={{ textAlign: 'right' }}>Beginning Cash</th>
                    <th style={{ textAlign: 'right' }}>Expected Inflows (JOD)</th>
                    <th style={{ textAlign: 'right' }}>Committed Outflows (JOD)</th>
                    <th style={{ textAlign: 'right' }}>Net Cash Flow</th>
                    <th style={{ textAlign: 'right' }}>Ending Projected Cash</th>
                    <th style={{ textAlign: 'right' }}>Buffer Headroom</th>
                    <th style={{ textAlign: 'center' }}>Runway</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidityForecasts.map((fc, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{fc.period}</td>
                      <td style={{ textAlign: 'right' }} className="mono">JOD {fc.beginning_cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'right', color: 'var(--primary-green)', fontWeight: 600 }} className="mono">
                        +JOD {fc.expected_inflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }} className="mono">
                        -JOD {fc.committed_outflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: fc.net_cash_flow >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
                        {fc.net_cash_flow >= 0 ? `+JOD ${fc.net_cash_flow.toLocaleString()}` : `-JOD ${Math.abs(fc.net_cash_flow).toLocaleString()}`}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="mono">
                        JOD {fc.projected_ending_cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--primary-green)' }} className="mono">
                        +JOD {fc.headroom.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="mono">{fc.runway_months} Mo</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> {fc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SCHEDULED CASH EVENTS */}
      {activeTab === 'cash-events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Cash Events:</span>
              <button
                className={filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterType('ALL')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                All Events ({cashFlowEntries.length})
              </button>
              <button
                className={filterType === 'INFLOW' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterType('INFLOW')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Inflows Only
              </button>
              <button
                className={filterType === 'OUTFLOW' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterType('OUTFLOW')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Outflows Only
              </button>
            </div>
            <span className="badge ok"><span className="d"></span> Live Treasury Link</span>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Event Ref</th>
                    <th>Due Date</th>
                    <th>Direction</th>
                    <th>Category</th>
                    <th>Event Narrative</th>
                    <th>Commercial Partner / Authority</th>
                    <th>Document Reference</th>
                    <th style={{ textAlign: 'right' }}>Amount (JOD)</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((ev) => (
                    <tr key={ev.entry_id}>
                      <td className="mono" style={{ fontWeight: 600 }}>{ev.entry_id}</td>
                      <td className="mono">{ev.date}</td>
                      <td>
                        <span className={`badge ${ev.type === 'INFLOW' ? 'ok' : 'crit'}`}>
                          {ev.type}
                        </span>
                      </td>
                      <td><span className="tag-pill solid">{ev.category}</span></td>
                      <td style={{ fontWeight: 600 }}>{ev.sub_category}</td>
                      <td>{ev.party_name}</td>
                      <td className="mono" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{ev.reference}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: ev.amount >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
                        {ev.amount >= 0 ? `+JOD ${ev.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-JOD ${Math.abs(ev.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${ev.status === 'Cleared' ? 'ok' : 'warn'}`}>
                          <span className="d"></span> {ev.status}
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

      {/* SUB-TAB 3: POST-DATED CHECKS (PDC) VAULT */}
      {activeTab === 'pdc-vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Post-Dated Checks (PDC) Treasury Portfolio</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Inward Customer Checks in Safe Custody vs Outward Supplier Checks Issued
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> Custody Secured</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>PDC Ref</th>
                    <th>Direction</th>
                    <th>Check Number</th>
                    <th>Party / Drawer</th>
                    <th>Drawee Bank</th>
                    <th style={{ textAlign: 'right' }}>Check Value (JOD)</th>
                    <th>Issue Date</th>
                    <th>Maturity Due Date</th>
                    <th style={{ textAlign: 'center' }}>Vault Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(pdcPortfolio || []).map((pdc) => (
                    <tr key={pdc.pdc_id}>
                      <td className="mono" style={{ fontWeight: 600 }}>{pdc.pdc_id}</td>
                      <td>
                        <span className={`badge ${pdc.direction === 'INWARD' ? 'ok' : 'warn'}`}>
                          {pdc.direction}
                        </span>
                      </td>
                      <td className="mono" style={{ fontWeight: 700 }}>{pdc.check_number}</td>
                      <td style={{ fontWeight: 600 }}>{pdc.party_name}</td>
                      <td>{pdc.bank_name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="mono">
                        JOD {pdc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="mono" style={{ fontSize: '11.5px' }}>{pdc.issue_date}</td>
                      <td className="mono" style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pdc.due_date}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${pdc.status === 'Cleared' ? 'ok' : pdc.status === 'In Vault' ? 'ok' : 'warn'}`}>
                          <span className="d"></span> {pdc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {pdc.status === 'Cleared' ? (
                          <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 600 }}>Bank Cleared</span>
                        ) : (
                          <button
                            className="btn-secondary"
                            onClick={() => handleClearPdc(pdc.pdc_id)}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            Deposit / Clear
                          </button>
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

      {/* SUB-TAB 4: WORKING CAPITAL OPTIMIZATION */}
      {activeTab === 'working-capital' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>Cash Conversion Cycle Simulator</h4>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600 }}>Days Sales Outstanding (DSO):</label>
                <span className="mono" style={{ fontWeight: 700 }}>{simDso} Days</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="0.5"
                value={simDso}
                onChange={(e) => setSimDso(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600 }}>Days Inventory Outstanding (DIO):</label>
                <span className="mono" style={{ fontWeight: 700 }}>{simDio} Days</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="0.5"
                value={simDio}
                onChange={(e) => setSimDio(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600 }}>Days Payable Outstanding (DPO):</label>
                <span className="mono" style={{ fontWeight: 700 }}>{simDpo} Days</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="0.5"
                value={simDpo}
                onChange={(e) => setSimDpo(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Formula: Cash Conversion Cycle (CCC) = DSO + DIO - DPO. Lower CCC indicates superior working capital velocity and minimal external borrowing requirements.
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 600 }}>Working Capital Performance Metrics</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>Simulated CCC</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-green)', marginTop: '4px' }} className="mono">
                  {simCcc} Days
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Liquidity Efficiency Index: Optimal (&lt; 40d)
                </div>
              </div>

              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 600 }}>Net Working Capital</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }} className="mono">
                  JOD {(workingCapitalMetrics?.working_capital_amount || 395420).toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Current Ratio: {workingCapitalMetrics?.current_ratio || 2.45}x | Quick: {workingCapitalMetrics?.quick_ratio || 1.82}x
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Benchmark Optimization Levers</div>
            <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
              <thead>
                <tr>
                  <th>Optimization Lever</th>
                  <th>Target Metric</th>
                  <th>Estimated Working Capital Release</th>
                  <th style={{ textAlign: 'center' }}>Feasibility</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Accelerate Customer Invoicing via Fawateer QR</td>
                  <td className="mono">DSO -4.0 Days</td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>+JOD 24,500 Cash Release</td>
                  <td style={{ textAlign: 'center' }}><span className="badge ok">High</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Adopt Just-In-Time Linen &amp; Beverage Reorders</td>
                  <td className="mono">DIO -6.0 Days</td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>+JOD 18,200 Cash Release</td>
                  <td style={{ textAlign: 'center' }}><span className="badge ok">High</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Negotiate 45-Day Standard Terms with Key Vendors</td>
                  <td className="mono">DPO +8.0 Days</td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>+JOD 32,000 Cash Preservation</td>
                  <td style={{ textAlign: 'center' }}><span className="badge ok">Medium</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: LOG CASH EVENT */}
      {isNewEventModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Scheduled Cash Flow Event</h3>
              <button className="modal-close-btn" onClick={() => setIsNewEventModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateEventSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Cash Direction</label>
                    <select
                      className="form-control"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="INFLOW">INFLOW (+ Cash Receipt)</option>
                      <option value="OUTFLOW">OUTFLOW (- Cash Disbursement)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="OPERATING">Operating Activity</option>
                      <option value="INVESTING">Investing (Capex)</option>
                      <option value="FINANCING">Financing (Debt / Equity)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Event Description / Sub-Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formSubCat}
                    onChange={(e) => setFormSubCat(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Amount (JOD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formAmount}
                      onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Scheduled Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Counterparty Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formParty}
                      onChange={(e) => setFormParty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reference Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formRef}
                      onChange={(e) => setFormRef(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsNewEventModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Cash Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashFlowManagementView;
