import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['finance', 'common']);
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

    setEventSuccess(t('cash_flow.msg_event_logged', { type: formType, amount: Math.abs(finalAmount).toLocaleString() }));
    setIsNewEventModalOpen(false);
    setTimeout(() => setEventSuccess(null), 5000);
  };

  const handleClearPdc = (pdcId) => {
    updatePdcStatus(pdcId, 'Cleared');
    setEventSuccess(t('cash_flow.msg_pdc_cleared', { id: pdcId }));
    setTimeout(() => setEventSuccess(null), 4000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('cash_flow.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('cash_flow.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('cash_flow.badge_reserve')}
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsNewEventModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('cash_flow.btn_log_event')}</span>
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
            <span className="metric-label">{t('cash_flow.kpi_available_cash')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Wallet size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD <span className="mono bidi-ltr" dir="ltr">{currentAvailableCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          <div className="metric-delta">{t('cash_flow.kpi_available_cash_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cash_flow.kpi_inflows')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <TrendUp size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--primary-green)' }}>
            +JOD <span className="mono bidi-ltr" dir="ltr">{nextMonthInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="metric-delta">{t('cash_flow.kpi_collections_pdc')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cash_flow.kpi_outflows')}</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#ef4444' }}>
            -JOD <span className="mono bidi-ltr" dir="ltr">{nextMonthOutflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="metric-delta">{t('cash_flow.kpi_disbursements_delta')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cash_flow.kpi_projected_net')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Coins size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: nextMonthNet >= 0 ? 'var(--primary-green)' : '#ef4444' }}>
            <span className="mono bidi-ltr" dir="ltr">{nextMonthNet >= 0 ? `+JOD ${nextMonthNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-JOD ${Math.abs(nextMonthNet).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</span>
          </div>
          <div className="metric-delta up" style={{ color: '#15803d' }}>{t('cash_flow.kpi_surplus_gen')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('cash_flow.kpi_ccc')}</span>
            <div className="metric-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}>
              <ArrowsLeftRight size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value"><span className="mono bidi-ltr" dir="ltr">{workingCapitalMetrics?.cash_conversion_cycle_days || 35.7}</span> {t('cash_flow.unit_days')}</div>
          <div className="metric-delta">{t('cash_flow.kpi_ccc_formula')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'liquidity-forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('liquidity-forecast')}
        >
          {t('cash_flow.tab_trajectory_count', { count: liquidityForecasts.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'cash-events' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash-events')}
        >
          {t('cash_flow.tab_events_count', { count: cashFlowEntries.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'pdc-vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdc-vault')}
        >
          {t('cash_flow.tab_pdc_count', { count: (pdcPortfolio || []).length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'working-capital' ? 'active' : ''}`}
          onClick={() => setActiveTab('working-capital')}
        >
          {t('cash_flow.tab_working_cap_opt')}
        </button>
      </div>

      {/* SUB-TAB 1: ROLLING LIQUIDITY TRAJECTORY */}
      {activeTab === 'liquidity-forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('cash_flow.h_runway_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('cash_flow.h_runway_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('cash_flow.badge_runway_months')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('cash_flow.th_forecast_period')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_beginning_cash')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_expected_inflows')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_committed_outflows')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_net_cash_flow')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_ending_cash')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_buffer_headroom')}</th>
                    <th style={{ textAlign: 'center' }}>{t('cash_flow.th_runway')}</th>
                    <th style={{ textAlign: 'center' }}>{t('cash_flow.th_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidityForecasts.map((fc, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{fc.period}</td>
                      <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {fc.beginning_cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'end', color: 'var(--primary-green)', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">
                        +JOD {fc.expected_inflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'end', color: '#ef4444', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">
                        -JOD {fc.committed_outflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'end', fontWeight: 700, color: fc.net_cash_flow >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
                        {fc.net_cash_flow >= 0 ? `+JOD ${fc.net_cash_flow.toLocaleString()}` : `-JOD ${Math.abs(fc.net_cash_flow).toLocaleString()}`}
                      </td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        JOD {fc.projected_ending_cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'end', color: 'var(--primary-green)' }} className="mono bidi-ltr" dir="ltr">
                        +JOD {fc.headroom.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">{fc.runway_months} Mo</td>
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
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('cash_flow.lbl_filter_events')}</span>
              <button
                className={filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterType('ALL')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('cash_flow.filter_all_events', { count: cashFlowEntries.length })}
              </button>
              <button
                className={filterType === 'INFLOW' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterType('INFLOW')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('cash_flow.filter_inflows')}
              </button>
              <button
                className={filterType === 'OUTFLOW' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterType('OUTFLOW')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('cash_flow.filter_outflows')}
              </button>
            </div>
            <span className="badge ok"><span className="d"></span> {t('cash_flow.badge_live_treasury')}</span>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('cash_flow.th_event_ref')}</th>
                    <th>{t('cash_flow.th_due_date')}</th>
                    <th>{t('cash_flow.th_direction')}</th>
                    <th>{t('cash_flow.th_category')}</th>
                    <th>{t('cash_flow.th_event_narrative')}</th>
                    <th>{t('cash_flow.th_counterparty')}</th>
                    <th>{t('cash_flow.th_doc_reference')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_amount_jod')}</th>
                    <th style={{ textAlign: 'center' }}>{t('cash_flow.th_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((ev) => (
                    <tr key={ev.entry_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{ev.entry_id}</td>
                      <td className="mono bidi-ltr" dir="ltr">{ev.date}</td>
                      <td>
                        <span className={`badge ${ev.type === 'INFLOW' ? 'ok' : 'crit'}`}>
                          {ev.type}
                        </span>
                      </td>
                      <td><span className="tag-pill solid">{ev.category}</span></td>
                      <td style={{ fontWeight: 600 }}>{ev.sub_category}</td>
                      <td>{ev.party_name}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{ev.reference}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700, color: ev.amount >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
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
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('cash_flow.h_pdc_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('cash_flow.h_pdc_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('cash_flow.badge_custody_secured')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('cash_flow.th_pdc_ref')}</th>
                    <th>{t('cash_flow.th_direction')}</th>
                    <th>{t('cash_flow.th_check_number')}</th>
                    <th>{t('cash_flow.th_party_drawer')}</th>
                    <th>{t('cash_flow.th_drawee_bank')}</th>
                    <th style={{ textAlign: 'end' }}>{t('cash_flow.th_check_value')}</th>
                    <th>{t('cash_flow.th_issue_date')}</th>
                    <th>{t('cash_flow.th_maturity_due_date')}</th>
                    <th style={{ textAlign: 'center' }}>{t('cash_flow.th_vault_status')}</th>
                    <th style={{ textAlign: 'center' }}>{t('common:actions.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(pdcPortfolio || []).map((pdc) => (
                    <tr key={pdc.pdc_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{pdc.pdc_id}</td>
                      <td>
                        <span className={`badge ${pdc.direction === 'INWARD' ? 'ok' : 'warn'}`}>
                          {pdc.direction}
                        </span>
                      </td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>{pdc.check_number}</td>
                      <td style={{ fontWeight: 600 }}>{pdc.party_name}</td>
                      <td>{pdc.bank_name}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        JOD {pdc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11.5px' }}>{pdc.issue_date}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pdc.due_date}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${pdc.status === 'Cleared' ? 'ok' : pdc.status === 'In Vault' ? 'ok' : 'warn'}`}>
                          <span className="d"></span> {pdc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {pdc.status === 'Cleared' ? (
                          <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 600 }}>{t('cash_flow.status_bank_cleared')}</span>
                        ) : (
                          <button
                            className="btn-secondary"
                            onClick={() => handleClearPdc(pdc.pdc_id)}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            {t('cash_flow.btn_deposit_clear')}
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
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>{t('cash_flow.h_ccc_sim')}</h4>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600 }}>{t('cash_flow.lbl_dso')}:</label>
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>{simDso} {t('cash_flow.unit_days')}</span>
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
                <label style={{ fontSize: '11.5px', fontWeight: 600 }}>{t('cash_flow.lbl_dio')}:</label>
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>{simDio} {t('cash_flow.unit_days')}</span>
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
                <label style={{ fontSize: '11.5px', fontWeight: 600 }}>{t('cash_flow.lbl_dpo')}:</label>
                <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>{simDpo} {t('cash_flow.unit_days')}</span>
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
              {t('cash_flow.formula_ccc_desc')}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 600 }}>{t('cash_flow.h_wc_metrics')}</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>{t('cash_flow.lbl_sim_ccc')}</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-green)', marginTop: '4px' }} className="mono bidi-ltr" dir="ltr">
                  {simCcc} {t('cash_flow.unit_days')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('cash_flow.lbl_liquidity_efficiency')}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 600 }}>{t('cash_flow.lbl_net_working_capital')}</span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }} className="mono bidi-ltr" dir="ltr">
                  JOD {(workingCapitalMetrics?.working_capital_amount || 395420).toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('cash_flow.lbl_current_ratio', 'Current Ratio')}: <span className="mono bidi-ltr" dir="ltr">{workingCapitalMetrics?.current_ratio || 2.45}x</span> | {t('cash_flow.lbl_quick_ratio', 'Quick')}: <span className="mono bidi-ltr" dir="ltr">{workingCapitalMetrics?.quick_ratio || 1.82}x</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{t('cash_flow.h_opt_levers')}</div>
            <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
              <thead>
                <tr>
                  <th>{t('cash_flow.th_opt_lever')}</th>
                  <th>{t('cash_flow.th_target_metric')}</th>
                  <th>{t('cash_flow.th_wc_release')}</th>
                  <th style={{ textAlign: 'center' }}>{t('cash_flow.th_feasibility')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>{t('cash_flow.lever_fawateer', 'Accelerate Customer Invoicing via Fawateer QR')}</td>
                  <td className="mono bidi-ltr" dir="ltr">{t('cash_flow.lever_dso', 'DSO -4.0 Days')}</td>
                  <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>{t('cash_flow.lever_dso_impact', '+JOD 24,500 Cash Release')}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge ok">{t('cash_flow.feasibility_high', 'High')}</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>{t('cash_flow.lever_jit', 'Adopt Just-In-Time Linen & Beverage Reorders')}</td>
                  <td className="mono bidi-ltr" dir="ltr">{t('cash_flow.lever_dio', 'DIO -6.0 Days')}</td>
                  <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>{t('cash_flow.lever_dio_impact', '+JOD 18,200 Cash Release')}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge ok">{t('cash_flow.feasibility_high', 'High')}</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>{t('cash_flow.lever_vendor_terms', 'Negotiate 45-Day Standard Terms with Key Vendors')}</td>
                  <td className="mono bidi-ltr" dir="ltr">{t('cash_flow.lever_dpo', 'DPO +8.0 Days')}</td>
                  <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>{t('cash_flow.lever_dpo_impact', '+JOD 32,000 Cash Preservation')}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge ok">{t('cash_flow.feasibility_medium', 'Medium')}</span></td>
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
              <h3 className="modal-title">{t('cash_flow.modal_log_event_title')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewEventModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateEventSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('cash_flow.form_type')}</label>
                    <select
                      className="form-control"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="INFLOW">{t('cash_flow.opt_method_inflow', 'INFLOW (+ Cash Receipt)')}</option>
                      <option value="OUTFLOW">{t('cash_flow.opt_method_outflow', 'OUTFLOW (- Cash Disbursement)')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('cash_flow.form_category')}</label>
                    <select
                      className="form-control"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="OPERATING">{t('cash_flow.opt_category_operating', 'Operating Activity')}</option>
                      <option value="INVESTING">{t('cash_flow.opt_category_investing', 'Investing (Capex)')}</option>
                      <option value="FINANCING">{t('cash_flow.opt_category_financing', 'Financing (Debt / Equity)')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('cash_flow.form_sub_cat')}</label>
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
                    <label>{t('cash_flow.form_amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      dir="ltr"
                      className="form-control"
                      value={formAmount}
                      onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('cash_flow.form_date')}</label>
                    <input
                      type="date"
                      dir="ltr"
                      className="form-control"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('cash_flow.form_party')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formParty}
                      onChange={(e) => setFormParty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('cash_flow.form_ref')}</label>
                    <input
                      type="text"
                      dir="ltr"
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
                  {t('common:actions.cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('cash_flow.btn_save_event')}
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
