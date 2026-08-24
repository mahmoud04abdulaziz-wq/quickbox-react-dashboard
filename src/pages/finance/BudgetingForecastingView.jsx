import React, { useState } from 'react';
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Budgeting &amp; Multi-Period Forecasting</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / budgeting &amp; cost control
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> FY2026 Jordanian Fiscal Standard
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsNewBudgetModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Plus size={14} weight="bold" />
            <span>New Budget Center</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="metrics-5" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Annual Budget (FY26)</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Buildings size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD {totalAnnualBudget.toLocaleString()}</div>
          <div className="metric-delta">{budgets.length} Active Cost Centers</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Actual Spend YTD</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD {totalYtdActual.toLocaleString()}</div>
          <div className="metric-delta up" style={{ color: '#2563eb' }}>{overallConsumedPercent.toFixed(1)}% Consumed</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Budget Variance</span>
            <div className="metric-icon" style={{ background: totalVariance <= 0 ? '#f0fdf4' : '#fef2f2', color: totalVariance <= 0 ? '#15803d' : '#b91c1c' }}>
              <Percent size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" style={{ color: totalVariance <= 0 ? 'var(--primary-green)' : '#ef4444' }}>
            {totalVariance <= 0 ? `+JOD ${Math.abs(totalVariance).toLocaleString()}` : `-JOD ${Math.abs(totalVariance).toLocaleString()}`}
          </div>
          <div className="metric-delta" style={{ color: totalVariance <= 0 ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
            {totalVariance <= 0 ? 'Favorable (Under Budget)' : 'Unfavorable Variance'}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Projected EOY EBITDA</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <TrendUp size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD {activeModel.projected_ebitda.toLocaleString()}</div>
          <div className="metric-delta">{activeModel.projected_net_margin}% Net Margin ({activeModel.type})</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Monthly Break-Even</span>
            <div className="metric-icon" style={{ background: '#fdf2f8', color: '#be185d' }}>
              <ChartPie size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD {breakEvenRevenueMonthly.toLocaleString()}</div>
          <div className="metric-delta">{breakEvenUnitsMonthly.toLocaleString()} Units / Month</div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departmental Cost Centers ({budgets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          Rolling Forecast &amp; Scenario Modeling
        </button>
        <button
          className={`tab-btn ${activeTab === 'fixed-expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixed-expenses')}
        >
          Fixed Recurring Schedule
        </button>
        <button
          className={`tab-btn ${activeTab === 'break-even' ? 'active' : ''}`}
          onClick={() => setActiveTab('break-even')}
        >
          Break-Even &amp; Sensitivity Simulator
        </button>
      </div>

      {/* SUB-TAB 1: DEPARTMENTAL COST CENTERS */}
      {activeTab === 'departments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Master Departmental Budgets (FY2026)</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cost Center Allocations vs YTD Operating Expenditure
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> Live GL Expense Linkage</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Cost Center</th>
                    <th>Department Name</th>
                    <th>Manager</th>
                    <th style={{ textAlign: 'right' }}>Annual Budget (JOD)</th>
                    <th style={{ textAlign: 'right' }}>Q1-Q4 Allocation</th>
                    <th style={{ textAlign: 'right' }}>YTD Actual (JOD)</th>
                    <th style={{ width: '140px' }}>Budget Burn</th>
                    <th style={{ textAlign: 'right' }}>Variance</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const burnPercent = b.annual_budget > 0 ? (b.ytd_actual / b.annual_budget) * 100 : 0;
                    return (
                      <tr key={b.budget_id} style={{ cursor: 'pointer' }}>
                        <td className="mono" style={{ fontWeight: 600 }}>{b.cost_center_code}</td>
                        <td style={{ fontWeight: 600 }}>{b.cost_center_name}</td>
                        <td>{b.manager}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className="mono">
                          JOD {b.annual_budget.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '11px' }} className="mono">
                          Q1: {(b.quarterly_allocation?.Q1 || 0).toLocaleString()} | Q2: {(b.quarterly_allocation?.Q2 || 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className="mono">
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
                            <span style={{ fontSize: '10.5px', minWidth: '32px' }} className="mono">{burnPercent.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', color: b.ytd_variance <= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
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
                            Details &amp; Lines
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
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--primary-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                    Detailed Line Items: {selectedBudget.cost_center_code} — {selectedBudget.cost_center_name}
                  </h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Ledger Account Mapping and Line-by-Line Spend Control
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => setIsAddLineModalOpen(true)}
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={12} weight="bold" />
                    <span>Add Line Item</span>
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedBudget(null)}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>Account Code</th>
                      <th>Account Name</th>
                      <th style={{ textAlign: 'right' }}>Annual Budget (JOD)</th>
                      <th style={{ textAlign: 'right' }}>YTD Actual (JOD)</th>
                      <th style={{ textAlign: 'right' }}>EOY Forecast (JOD)</th>
                      <th style={{ textAlign: 'right' }}>Variance (JOD)</th>
                      <th style={{ textAlign: 'center' }}>Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedBudget.line_items || []).map((line) => (
                      <tr key={line.line_id}>
                        <td className="mono" style={{ fontWeight: 600 }}>{line.account_code}</td>
                        <td>{line.account_name}</td>
                        <td style={{ textAlign: 'right' }} className="mono">JOD {line.annual_budget.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className="mono">JOD {line.ytd_actual.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }} className="mono">JOD {line.ytd_forecast.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: line.variance <= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
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
                      <span className="d"></span> {model.type} Scenario
                    </span>
                    <h4 style={{ margin: '6px 0 0 0', fontSize: '13px', fontWeight: 700 }}>{model.name}</h4>
                  </div>
                  {model.is_active && (
                    <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 700 }}>ACTIVE MODEL</span>
                  )}
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Key Driver: {model.driver}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Projected Revenue:</span>
                    <span className="mono" style={{ fontWeight: 600 }}>JOD {model.annual_projected_revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Projected COGS:</span>
                    <span className="mono">JOD {model.annual_projected_cogs.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Projected OPEX:</span>
                    <span className="mono">JOD {model.annual_projected_opex.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Projected EBITDA:</span>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                      JOD {model.projected_ebitda.toLocaleString()} ({model.projected_net_margin}%)
                    </span>
                  </div>
                </div>

                <button
                  className={model.is_active ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setActiveForecastModel(model.model_id)}
                  style={{ width: '100%', fontSize: '11.5px', padding: '6px' }}
                >
                  {model.is_active ? 'Currently Active Simulation' : 'Set as Active Model'}
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>Multi-Period Trajectory Comparison</h4>
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Growth Factor</th>
                    <th>Inflation Assumption</th>
                    <th style={{ textAlign: 'right' }}>Revenue (JOD)</th>
                    <th style={{ textAlign: 'right' }}>Gross Margin</th>
                    <th style={{ textAlign: 'right' }}>OPEX (JOD)</th>
                    <th style={{ textAlign: 'right' }}>Net Operating Income</th>
                    <th style={{ textAlign: 'center' }}>Tax Provision (20% + 1%)</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastModels.map((m) => {
                    const grossProf = m.annual_projected_revenue - m.annual_projected_cogs;
                    const taxProvision = (m.projected_ebitda * 0.21); // Jordan 20% CIT + 1% National Contribution
                    return (
                      <tr key={m.model_id} style={{ background: m.is_active ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td className="mono">+{m.revenue_growth_rate}%</td>
                        <td className="mono">{m.inflation_rate}%</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className="mono">JOD {m.annual_projected_revenue.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }} className="mono">{((grossProf / m.annual_projected_revenue) * 100).toFixed(1)}%</td>
                        <td style={{ textAlign: 'right' }} className="mono">JOD {m.annual_projected_opex.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-green)' }} className="mono">
                          JOD {m.projected_ebitda.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center' }} className="mono">JOD {taxProvision.toLocaleString()}</td>
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
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Jordanian Fixed Operating Obligations</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Statutory, Lease, SLA, and Debt Service Fixed Commitments
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span className="badge ok">
                  Monthly Total: JOD {totalMonthlyFixedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="badge ok">
                  Annualized: JOD {totalAnnualFixedExpenses.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Payee / Authority</th>
                    <th>Expense Category</th>
                    <th style={{ textAlign: 'right' }}>Monthly Commitment (JOD)</th>
                    <th style={{ textAlign: 'right' }}>Annual Budget (JOD)</th>
                    <th>Payment Due Day</th>
                    <th style={{ textAlign: 'center' }}>Contract Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedExpensesSchedule.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.item}</td>
                      <td>{item.vendor}</td>
                      <td><span className="tag-pill solid">{item.category}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }} className="mono">
                        JOD {item.monthlyJod.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right' }} className="mono">
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
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>Simulation Parameters</h4>
            
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Average Selling Price per Transaction / Unit (JOD):
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
                Average Variable Cost per Unit (JOD):
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
                Monthly Fixed Overheads (JOD):
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
              Formula: Break-Even Volume = Fixed Overhead / (Selling Price - Variable Cost).
              Includes 16% ISTD sales tax neutrality.
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 600 }}>Break-Even Sensitivity Results</h4>

            <div className="metrics-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>Monthly Break-Even Units</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-green)', marginTop: '4px' }} className="mono">
                  {breakEvenUnitsMonthly.toLocaleString()} Units
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Unit Contribution Margin: JOD {unitContribution.toFixed(2)}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 600 }}>Monthly Break-Even Revenue</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }} className="mono">
                  JOD {breakEvenRevenueMonthly.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Contribution Margin Ratio: {contributionMarginRatio.toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Sensitivity at Different Occupancy / Volume Levels</div>
            <table className="table" style={{ width: '100%', fontSize: '11.5px' }}>
              <thead>
                <tr>
                  <th>Monthly Unit Volume</th>
                  <th style={{ textAlign: 'right' }}>Total Revenue (JOD)</th>
                  <th style={{ textAlign: 'right' }}>Total Variable Cost</th>
                  <th style={{ textAlign: 'right' }}>Total Fixed Cost</th>
                  <th style={{ textAlign: 'right' }}>Net Operating Profit</th>
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
                      <td style={{ fontWeight: 600 }}>{testUnits.toLocaleString()} units ({multiplier * 100}%)</td>
                      <td style={{ textAlign: 'right' }} className="mono">JOD {testRev.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }} className="mono">JOD {testVar.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }} className="mono">JOD {simMonthlyFixed.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: testNet >= 0 ? 'var(--primary-green)' : '#ef4444' }} className="mono">
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
              <h3 className="modal-title">Create Departmental Budget Allocation</h3>
              <button className="modal-close-btn" onClick={() => setIsNewBudgetModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateBudgetSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Cost Center Code</label>
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
                  <label>Department Head / Manager</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Annual Budget Allocation (JOD)</label>
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
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Budget
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
              <h3 className="modal-title">Add Line Item to {selectedBudget.cost_center_code}</h3>
              <button className="modal-close-btn" onClick={() => setIsAddLineModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddLineSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>GL Account Code</label>
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
                  <label>Line Item Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lineAccountName}
                    onChange={(e) => setLineAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Line Budget Cap (JOD)</label>
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
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Append Line Item
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
