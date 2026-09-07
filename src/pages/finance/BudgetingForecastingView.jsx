import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendUp,
  Buildings,
  ChartPie,
  Percent,
  Plus,
  X,
  CheckCircle,
  Warning,
  SlidersHorizontal,
  Calendar,
  CurrencyDollar,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from '@phosphor-icons/react';

function BudgetingForecastingView() {
  const { t } = useTranslation(['finance', 'common']);
  const {
    budgets,
    forecastModels,
    createBudget,
    updateBudget,
    addBudgetLineItem,
    setActiveForecastModel
  } = useFinance();

  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'forecast' | 'fixed-expenses' | 'break-even'
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);

  // Form State for New Budget
  const [formCostCenter, setFormCostCenter] = useState('CC-100');
  const [formCostCenterName, setFormCostCenterName] = useState('Housekeeping');
  const [formManager, setFormManager] = useState('Aisha Tariq');
  const [formFiscalYear, setFormFiscalYear] = useState(2026);
  const [formAnnualBudget, setFormAnnualBudget] = useState(150000);

  // Form State for New Line Item
  const [lineAccountCode, setLineAccountCode] = useState('61200');
  const [lineAccountName, setLineAccountName] = useState('Departmental Supplies');
  const [lineAnnualBudget, setLineAnnualBudget] = useState(40000);

  // Break-Even Simulation State
  const [simAvgPrice, setSimAvgPrice] = useState(85); // Average booking / transaction price in JOD
  const [simVarCost, setSimVarCost] = useState(32); // Variable cost per unit in JOD
  const [simMonthlyFixed, setSimMonthlyFixed] = useState(31250); // Monthly fixed cost in JOD

  // Calculated Metrics
  const totalAnnualBudget = budgets.reduce((sum, b) => sum + b.annual_budget, 0);
  const totalYtdActual = budgets.reduce((sum, b) => sum + b.ytd_actual, 0);
  const totalYtdBudget = budgets.reduce((sum, b) => sum + b.ytd_budget, 0);
  const totalVariance = totalYtdActual - totalYtdBudget;
  const overallConsumedPercent = totalAnnualBudget > 0 ? (totalYtdActual / totalAnnualBudget) * 100 : 0;

  const activeModel = forecastModels.find(m => m.is_active) || forecastModels[0];

  // Break-Even Calculations
  const unitContribution = Math.max(simAvgPrice - simVarCost, 1);
  const contributionMarginRatio = (unitContribution / simAvgPrice) * 100;
  const breakEvenUnitsMonthly = Math.ceil(simMonthlyFixed / unitContribution);
  const breakEvenRevenueMonthly = breakEvenUnitsMonthly * simAvgPrice;

  // Fixed Expense Schedule Data
  const fixedExpensesSchedule = [
    { id: 'FX-01', item: 'Head Office Commercial Lease (Amman)', vendor: 'Abdali Boulevard Development', category: 'Rent & Facilities', monthlyJod: 13333.33, annualJod: 160000.00, dueDay: '1st of month', status: 'Active Contract' },
    { id: 'FX-02', item: 'Social Security (SSC 14.25% Employer Liability)', vendor: 'Social Security Corporation (الضمان)', category: 'Payroll & Statutory', monthlyJod: 17700.00, annualJod: 212400.00, dueDay: '10th of month', status: 'Mandatory Statutory' },
    { id: 'FX-03', item: 'Cloud ERP & Fawateer E-Invoicing Gateway', vendor: 'Enterprise Solutions MENA', category: 'IT & Software', monthlyJod: 7083.33, annualJod: 85000.00, dueDay: '15th of month', status: 'Annual SaaS' },
    { id: 'FX-04', item: 'HVAC & Refrigeration Maintenance SLA', vendor: 'Amman Cold Engineering LLC', category: 'Maintenance', monthlyJod: 1540.00, annualJod: 18480.00, dueDay: '20th of month', status: 'Annual SLA' },
    { id: 'FX-05', item: 'Commercial Term Loan Interest (CBJ Benchmark)', vendor: 'Arab Bank Commercial Banking', category: 'Financing', monthlyJod: 1250.00, annualJod: 15000.00, dueDay: '28th of month', status: 'Debt Service' },
    { id: 'FX-06', item: 'Audit & IFRS Tax Advisory Retainer', vendor: 'Deloitte Jordan (Advisory)', category: 'Professional Fees', monthlyJod: 2500.00, annualJod: 30000.00, dueDay: 'End of Quarter', status: 'Retainer' }
  ];

  const totalMonthlyFixedExpenses = fixedExpensesSchedule.reduce((s, e) => s + e.monthlyJod, 0);
  const totalAnnualFixedExpenses = fixedExpensesSchedule.reduce((s, e) => s + e.annualJod, 0);

  const handleCreateBudgetSubmit = (e) => {
    e.preventDefault();
    const annualVal = parseFloat(formAnnualBudget) || 0;
    createBudget({
      cost_center_code: formCostCenter,
      cost_center_name: formCostCenterName,
      manager: formManager,
      fiscal_year: parseInt(formFiscalYear) || 2026,
      annual_budget: annualVal,
      quarterly_allocation: {
        Q1: annualVal * 0.25,
        Q2: annualVal * 0.25,
        Q3: annualVal * 0.25,
        Q4: annualVal * 0.25
      },
      ytd_actual: 0,
      line_items: [
        {
          line_id: `BL-${Date.now().toString().slice(-4)}`,
          account_code: '61100',
          account_name: 'Operational Expenses Base',
          annual_budget: annualVal,
          ytd_actual: 0,
          ytd_forecast: annualVal,
          variance: 0,
          status: 'Favorable'
        }
      ]
    });
    setIsNewBudgetModalOpen(false);
  };

  const handleAddLineSubmit = (e) => {
    e.preventDefault();
    if (!selectedBudget) return;
    const lineBudgetVal = parseFloat(lineAnnualBudget) || 0;
    addBudgetLineItem(selectedBudget.budget_id, {
      account_code: lineAccountCode,
      account_name: lineAccountName,
      annual_budget: lineBudgetVal,
      ytd_actual: 0,
      ytd_forecast: lineBudgetVal,
      variance: 0,
      status: 'Favorable'
    });
    setIsAddLineModalOpen(false);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('budgeting.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('budgeting.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('budgeting.badge_fiscal_standard')}
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsNewBudgetModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('budgeting.btn_new_budget_center')}</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="metrics-5" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('budgeting.kpi_annual_budget')}</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Buildings size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr">JOD {totalAnnualBudget.toLocaleString()}</div>
          <div className="metric-delta">{t('budgeting.kpi_active_cost_centers', { count: budgets.length })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('budgeting.kpi_ytd_actual')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr">JOD {totalYtdActual.toLocaleString()}</div>
          <div className="metric-delta up" style={{ color: '#2563eb' }}>{t('budgeting.kpi_consumed_percent', { percent: overallConsumedPercent.toFixed(1) })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('budgeting.kpi_budget_variance')}</span>
            <div className="metric-icon" style={{ background: totalVariance <= 0 ? '#f0fdf4' : '#fef2f2', color: totalVariance <= 0 ? '#15803d' : '#b91c1c' }}>
              <Percent size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr" style={{ color: totalVariance <= 0 ? 'var(--primary-green)' : '#ef4444' }}>
            {totalVariance <= 0 ? `+JOD ${Math.abs(totalVariance).toLocaleString()}` : `-JOD ${Math.abs(totalVariance).toLocaleString()}`}
          </div>
          <div className="metric-delta" style={{ color: totalVariance <= 0 ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
            {totalVariance <= 0 ? t('budgeting.status_favorable') : t('budgeting.status_unfavorable')}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('budgeting.kpi_projected_ebitda')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <TrendUp size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr">JOD {activeModel.projected_ebitda.toLocaleString()}</div>
          <div className="metric-delta">{t('budgeting.kpi_projected_net_margin', { margin: activeModel.projected_net_margin, type: activeModel.type })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('budgeting.kpi_monthly_break_even')}</span>
            <div className="metric-icon" style={{ background: '#fdf2f8', color: '#be185d' }}>
              <ChartPie size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value bidi-ltr" dir="ltr">JOD {breakEvenRevenueMonthly.toLocaleString()}</div>
          <div className="metric-delta">{t('budgeting.kpi_break_even_units', { count: breakEvenUnitsMonthly.toLocaleString() })}</div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          {t('budgeting.tab_departments_count', { count: budgets.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          {t('budgeting.tab_forecast_scenario')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'fixed-expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixed-expenses')}
        >
          {t('budgeting.tab_fixed_recurring')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'break-even' ? 'active' : ''}`}
          onClick={() => setActiveTab('break-even')}
        >
          {t('budgeting.tab_break_even_sim')}
        </button>
      </div>

      {/* SUB-TAB 1: DEPARTMENTAL COST CENTERS */}
      {activeTab === 'departments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('budgeting.h_master_budgets')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('budgeting.h_master_budgets_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('budgeting.badge_live_gl')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('budgeting.th_cost_center')}</th>
                    <th>{t('budgeting.th_dept_name')}</th>
                    <th>{t('budgeting.th_manager')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_annual_budget_jod')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_q1_q4_alloc')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_ytd_actual_jod')}</th>
                    <th style={{ width: '140px' }}>{t('budgeting.th_budget_burn')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_variance')}</th>
                    <th style={{ textAlign: 'center' }}>{t('budgeting.th_status')}</th>
                    <th style={{ textAlign: 'center' }}>{t('budgeting.th_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const burnPercent = b.annual_budget > 0 ? (b.ytd_actual / b.annual_budget) * 100 : 0;
                    return (
                      <tr key={b.budget_id} style={{ cursor: 'pointer' }}>
                        <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{b.cost_center_code}</td>
                        <td style={{ fontWeight: 600 }}>{b.cost_center_name}</td>
                        <td>{b.manager}</td>
                        <td style={{ textAlign: 'end', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">
                          JOD {b.annual_budget.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'end', color: 'var(--text-muted)', fontSize: '11px' }} className="mono bidi-ltr" dir="ltr">
                          Q1: {(b.quarterly_allocation?.Q1 || 0).toLocaleString()} | Q2: {(b.quarterly_allocation?.Q2 || 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'end', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">
                          JOD {b.ytd_actual.toLocaleString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-track" style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(burnPercent, 100)}%`,
                                  height: '100%',
                                  background: burnPercent > 80 ? '#f59e0b' : 'var(--primary-green)'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '10.5px', minWidth: '32px' }} className="mono bidi-ltr" dir="ltr">{burnPercent.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'end', color: b.ytd_variance <= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
                          {b.ytd_variance <= 0 ? `+JOD ${Math.abs(b.ytd_variance).toLocaleString()}` : `-JOD ${Math.abs(b.ytd_variance).toLocaleString()}`}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${b.status === 'OnTrack' ? 'ok' : 'warn'}`}>
                            <span className="d"></span> {b.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => setSelectedBudget(b)}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {t('budgeting.btn_details_lines')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Budget Line Items Accordion */}
          {selectedBudget && (
            <div className="card" style={{ padding: '16px', borderInlineStart: '4px solid var(--primary-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                    {t('budgeting.h_detailed_lines', { code: selectedBudget.cost_center_code, name: selectedBudget.cost_center_name })}
                  </h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {t('budgeting.h_detailed_lines_sub')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => setIsAddLineModalOpen(true)}
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={12} weight="bold" />
                    <span>{t('budgeting.btn_add_line')}</span>
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedBudget(null)}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    {t('common:actions.close', { defaultValue: 'Close' })}
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>{t('budgeting.th_account_code')}</th>
                      <th>{t('budgeting.th_account_name')}</th>
                      <th style={{ textAlign: 'end' }}>{t('budgeting.th_annual_budget_jod')}</th>
                      <th style={{ textAlign: 'end' }}>{t('budgeting.th_ytd_actual_jod')}</th>
                      <th style={{ textAlign: 'end' }}>{t('budgeting.th_eoy_forecast_jod')}</th>
                      <th style={{ textAlign: 'end' }}>{t('budgeting.th_variance_jod')}</th>
                      <th style={{ textAlign: 'center' }}>{t('budgeting.th_assessment')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedBudget.line_items || []).map((line) => (
                      <tr key={line.line_id}>
                        <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{line.account_code}</td>
                        <td>{line.account_name}</td>
                        <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {line.annual_budget.toLocaleString()}</td>
                        <td style={{ textAlign: 'end', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">JOD {line.ytd_actual.toLocaleString()}</td>
                        <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {line.ytd_forecast.toLocaleString()}</td>
                        <td style={{ textAlign: 'end', color: line.variance <= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
                          {line.variance <= 0 ? `+JOD ${Math.abs(line.variance).toLocaleString()}` : `-JOD ${Math.abs(line.variance).toLocaleString()}`}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${line.status === 'Favorable' ? 'ok' : 'warn'}`}>
                            <span className="d"></span> {line.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ROLLING FORECAST & SCENARIO MODELING */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-3">
            {forecastModels.map((model) => (
              <div
                key={model.model_id}
                className="card"
                style={{
                  padding: '16px',
                  border: model.is_active ? '2px solid var(--primary-green)' : '1px solid var(--border-color)',
                  background: model.is_active ? '#f0fdf4' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className={`badge ${model.type === 'Optimistic' ? 'ok' : model.type === 'Conservative' ? 'warn' : 'ok'}`}>
                      <span className="d"></span> {t('budgeting.badge_scenario', { type: model.type })}
                    </span>
                    <h4 style={{ margin: '6px 0 0 0', fontSize: '13px', fontWeight: 700 }}>{model.name}</h4>
                  </div>
                  {model.is_active && (
                    <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 700 }}>{t('budgeting.lbl_active_model')}</span>
                  )}
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {t('budgeting.lbl_key_driver', { driver: model.driver })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('budgeting.lbl_projected_rev')}</span>
                    <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>JOD {model.annual_projected_revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('budgeting.lbl_projected_cogs')}</span>
                    <span className="mono bidi-ltr" dir="ltr">JOD {model.annual_projected_cogs.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('budgeting.lbl_projected_opex')}</span>
                    <span className="mono bidi-ltr" dir="ltr">JOD {model.annual_projected_opex.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{t('budgeting.lbl_projected_ebitda')}</span>
                    <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                      JOD {model.projected_ebitda.toLocaleString()} ({model.projected_net_margin}%)
                    </span>
                  </div>
                </div>

                <button
                  className={model.is_active ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setActiveForecastModel(model.model_id)}
                  style={{ width: '100%', fontSize: '11.5px', padding: '6px' }}
                >
                  {model.is_active ? t('budgeting.btn_active_sim') : t('budgeting.btn_set_active')}
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>{t('budgeting.h_trajectory_comparison')}</h4>
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('budgeting.th_scenario')}</th>
                    <th>{t('budgeting.th_growth_factor')}</th>
                    <th>{t('budgeting.th_inflation')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_projected_rev')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_gross_margin')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_opex_jod')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_net_operating_income')}</th>
                    <th style={{ textAlign: 'center' }}>{t('budgeting.th_tax_provision')}</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastModels.map((m) => {
                    const grossProf = m.annual_projected_revenue - m.annual_projected_cogs;
                    const taxProvision = (m.projected_ebitda * 0.21); // Jordan 20% CIT + 1% National Contribution
                    return (
                      <tr key={m.model_id} style={{ background: m.is_active ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td className="mono bidi-ltr" dir="ltr">+{m.revenue_growth_rate}%</td>
                        <td className="mono bidi-ltr" dir="ltr">{m.inflation_rate}%</td>
                        <td style={{ textAlign: 'end', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">JOD {m.annual_projected_revenue.toLocaleString()}</td>
                        <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">{((grossProf / m.annual_projected_revenue) * 100).toFixed(1)}%</td>
                        <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {m.annual_projected_opex.toLocaleString()}</td>
                        <td style={{ textAlign: 'end', fontWeight: 700, color: 'var(--primary-green)' }} className="mono bidi-ltr" dir="ltr">
                          JOD {m.projected_ebitda.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center' }} className="mono bidi-ltr" dir="ltr">JOD {taxProvision.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FIXED RECURRING EXPENSES SCHEDULE */}
      {activeTab === 'fixed-expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('budgeting.h_fixed_obligations')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('budgeting.h_fixed_obligations_sub')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span className="badge ok bidi-ltr" dir="ltr">
                  {t('budgeting.badge_monthly_total', { amount: totalMonthlyFixedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                </span>
                <span className="badge ok bidi-ltr" dir="ltr">
                  {t('budgeting.badge_annualized', { amount: totalAnnualFixedExpenses.toLocaleString() })}
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('budgeting.th_item_desc')}</th>
                    <th>{t('budgeting.th_payee_authority')}</th>
                    <th>{t('budgeting.th_expense_category')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_monthly_comm')}</th>
                    <th style={{ textAlign: 'end' }}>{t('budgeting.th_annual_budget_comm')}</th>
                    <th>{t('budgeting.th_due_day')}</th>
                    <th style={{ textAlign: 'center' }}>{t('budgeting.th_contract_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedExpensesSchedule.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.item}</td>
                      <td>{item.vendor}</td>
                      <td><span className="tag-pill solid">{item.category}</span></td>
                      <td style={{ textAlign: 'end', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">
                        JOD {item.monthlyJod.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">
                        JOD {item.annualJod.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.dueDay}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> {item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BREAK-EVEN & SENSITIVITY SIMULATOR */}
      {activeTab === 'break-even' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>{t('budgeting.h_sim_params')}</h4>
            
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t('budgeting.lbl_avg_price')}
              </label>
              <input
                type="number"
                className="form-control"
                value={simAvgPrice}
                onChange={(e) => setSimAvgPrice(parseFloat(e.target.value) || 1)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t('budgeting.lbl_var_cost')}
              </label>
              <input
                type="number"
                className="form-control"
                value={simVarCost}
                onChange={(e) => setSimVarCost(parseFloat(e.target.value) || 0)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t('budgeting.lbl_fixed_overheads')}
              </label>
              <input
                type="number"
                className="form-control"
                value={simMonthlyFixed}
                onChange={(e) => setSimMonthlyFixed(parseFloat(e.target.value) || 0)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {t('budgeting.formula_desc')}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 600 }}>{t('budgeting.h_sensitivity_results')}</h4>

            <div className="metrics-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>{t('budgeting.lbl_be_monthly_units')}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-green)', marginTop: '4px' }} className="mono bidi-ltr" dir="ltr">
                  {breakEvenUnitsMonthly.toLocaleString()} {t('budgeting.lbl_units', 'Units')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('budgeting.lbl_unit_contrib')}: <span className="mono bidi-ltr" dir="ltr">JOD {unitContribution.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 600 }}>{t('budgeting.lbl_be_monthly_rev')}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }} className="mono bidi-ltr" dir="ltr">
                  JOD {breakEvenRevenueMonthly.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('budgeting.lbl_contrib_ratio')}: <span className="mono bidi-ltr" dir="ltr">{contributionMarginRatio.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{t('budgeting.h_volume_sensitivity')}</div>
            <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
              <thead>
                <tr>
                  <th>{t('budgeting.th_monthly_units')}</th>
                  <th style={{ textAlign: 'end' }}>{t('budgeting.th_total_revenue')}</th>
                  <th style={{ textAlign: 'end' }}>{t('budgeting.th_total_var_cost')}</th>
                  <th style={{ textAlign: 'end' }}>{t('budgeting.th_total_fixed_cost')}</th>
                  <th style={{ textAlign: 'end' }}>{t('budgeting.th_net_profit')}</th>
                </tr>
              </thead>
              <tbody>
                {[0.75, 1.0, 1.25, 1.5].map((multiplier) => {
                  const testUnits = Math.round(breakEvenUnitsMonthly * multiplier);
                  const testRev = testUnits * simAvgPrice;
                  const testVar = testUnits * simVarCost;
                  const testNet = testRev - testVar - simMonthlyFixed;
                  return (
                    <tr key={multiplier} style={{ background: multiplier === 1.0 ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ fontWeight: 600 }}>{testUnits.toLocaleString()} {t('budgeting.lbl_units', 'Units')} <span className="mono bidi-ltr" dir="ltr">({multiplier * 100}%)</span></td>
                      <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {testRev.toLocaleString()}</td>
                      <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {testVar.toLocaleString()}</td>
                      <td style={{ textAlign: 'end' }} className="mono bidi-ltr" dir="ltr">JOD {simMonthlyFixed.toLocaleString()}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700, color: testNet >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono bidi-ltr" dir="ltr">
                        {testNet >= 0 ? `+JOD ${testNet.toLocaleString()}` : `-JOD ${Math.abs(testNet).toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW BUDGET */}
      {isNewBudgetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{t('budgeting.modal_create_title')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewBudgetModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateBudgetSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>{t('budgeting.lbl_cost_center_code')}</label>
                  <select
                    className="form-control"
                    value={formCostCenter}
                    onChange={(e) => {
                      setFormCostCenter(e.target.value);
                      const nameMap = {
                        'CC-100': 'Housekeeping',
                        'CC-200': 'F&B Kitchen',
                        'CC-300': 'Facilities & Maintenance',
                        'CC-400': 'Front Office',
                        'CC-500': 'IT Systems',
                        'CC-600': 'Executive & Administration'
                      };
                      setFormCostCenterName(nameMap[e.target.value] || 'Operations');
                    }}
                  >
                    <option value="CC-100">CC-100 — Housekeeping</option>
                    <option value="CC-200">CC-200 — F&amp;B Kitchen</option>
                    <option value="CC-300">CC-300 — Facilities &amp; Maintenance</option>
                    <option value="CC-400">CC-400 — Front Office</option>
                    <option value="CC-500">CC-500 — IT &amp; Security Systems</option>
                    <option value="CC-600">CC-600 — Administration &amp; Executive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('budgeting.lbl_manager')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('budgeting.lbl_annual_alloc')}</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formAnnualBudget}
                    onChange={(e) => setFormAnnualBudget(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsNewBudgetModalOpen(false)}>
                  {t('common:actions.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="submit" className="btn-primary">
                  {t('budgeting.btn_save_budget')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LINE ITEM */}
      {isAddLineModalOpen && selectedBudget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{t('budgeting.modal_add_line_title', { code: selectedBudget.cost_center_code })}</h3>
              <button className="modal-close-btn" onClick={() => setIsAddLineModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddLineSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>{t('budgeting.lbl_gl_account_code')}</label>
                  <select
                    className="form-control"
                    value={lineAccountCode}
                    onChange={(e) => {
                      setLineAccountCode(e.target.value);
                      const accMap = {
                        '61100': 'Kitchen & Food Supplies',
                        '61200': 'Housekeeping Supplies',
                        '61300': 'Electromechanical Maintenance',
                        '62100': 'Cloud SaaS & ERP',
                        '65100': 'Rent & Facilities Overhead',
                        '66100': 'Legal & Audit Services'
                      };
                      setLineAccountName(accMap[e.target.value] || 'General OPEX');
                    }}
                  >
                    <option value="61100">61100 — Kitchen &amp; Food Supplies</option>
                    <option value="61200">61200 — Housekeeping Supplies</option>
                    <option value="61300">61300 — Electromechanical Maintenance</option>
                    <option value="62100">62100 — Cloud SaaS &amp; ERP</option>
                    <option value="65100">65100 — Rent &amp; Facilities Overhead</option>
                    <option value="66100">66100 — Legal &amp; Audit Services</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('budgeting.lbl_line_desc')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lineAccountName}
                    onChange={(e) => setLineAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('budgeting.lbl_line_cap')}</label>
                  <input
                    type="number"
                    className="form-control"
                    value={lineAnnualBudget}
                    onChange={(e) => setLineAnnualBudget(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddLineModalOpen(false)}>
                  {t('common:actions.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="submit" className="btn-primary">
                  {t('budgeting.btn_append_line')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetingForecastingView;
