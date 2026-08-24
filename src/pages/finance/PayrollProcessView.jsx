import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  UsersThree,
  Wallet,
  Receipt,
  CheckCircle,
  DownloadSimple,
  Play,
  X,
  IdentificationCard,
  FileText
} from '@phosphor-icons/react';

function PayrollProcessView() {
  const {
    payrollRecords,
    processPayroll,
    exportWpsSifFile,
    vatFiling,
    fileVatReturn
  } = useFinance();

  const [activeTab, setActiveTab] = useState('wps'); // 'wps' | 'vat'
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [wpsExportSuccess, setWpsExportSuccess] = useState(false);
  const [payrollSuccess, setPayrollSuccess] = useState(false);
  const [vatSuccess, setVatSuccess] = useState(false);

  // Workforce sample rows
  const workforceRows = [
    { empId: 'EMP-0104', name: 'Chef Alex Morgan', role: 'Executive Chef', dept: 'Kitchen (CC-200)', basic: 7200, allowances: 800, gross: 8000, deductions: 1240, net: 6760, wpsStatus: 'ok' },
    { empId: 'EMP-0055', name: 'Aisha Tariq', role: 'Housekeeping Lead', dept: 'Housekeeping (CC-100)', basic: 4500, allowances: 700, gross: 5200, deductions: 780, net: 4420, wpsStatus: 'ok' },
    { empId: 'EMP-0089', name: 'Lina Salem', role: 'Front Desk Agent', dept: 'Front Office (CC-400)', basic: 3200, allowances: 400, gross: 3600, deductions: 540, net: 3060, wpsStatus: 'warn' },
    { empId: 'EMP-0031', name: 'Omar Sayed', role: 'Maintenance Tech', dept: 'Facilities (CC-300)', basic: 3600, allowances: 500, gross: 4100, deductions: 615, net: 3485, wpsStatus: 'ok' },
    { empId: 'EMP-0112', name: 'Tariq Khalil', role: 'Security Supervisor', dept: 'Administration (CC-600)', basic: 4000, allowances: 600, gross: 4600, deductions: 690, net: 3910, wpsStatus: 'ok' }
  ];

  // Tax audit log rows
  const vatAuditLog = [
    { date: '12 Aug 2026', docRef: 'INV-2026-0410', party: 'Al-Madina Trading LLC', taxType: '5% Output', base: 16000.00, amount: 800.00 },
    { date: '10 Aug 2026', docRef: 'BILL-2026-089', party: 'Global Linens Co.', taxType: '5% Input', base: 1250.00, amount: -62.50 },
    { date: '08 Aug 2026', docRef: 'INV-2026-0408', party: 'Apex Technologies', taxType: '5% Output', base: 8000.00, amount: 400.00 },
    { date: '05 Aug 2026', docRef: 'BILL-2026-085', party: 'CleanPro Solutions', taxType: '5% Input', base: 980.00, amount: -49.00 },
    { date: '01 Aug 2026', docRef: 'INV-2026-0399', party: 'Crescent Hospitality Group', taxType: '5% Output', base: 24000.00, amount: 1200.00 }
  ];

  // Execute Payroll
  const handleExecutePayroll = () => {
    processPayroll('August 2026');
    setPayrollSuccess(true);
    setTimeout(() => setPayrollSuccess(false), 4000);
  };

  // Export WPS SIF
  const handleExportWps = () => {
    exportWpsSifFile('PAY-2026-08');
    setWpsExportSuccess(true);
    setTimeout(() => setWpsExportSuccess(false), 4000);
  };

  // Submit VAT Return
  const handleSubmitVatReturn = () => {
    fileVatReturn('VAT-2026-Q3');
    setVatSuccess(true);
    setTimeout(() => setVatSuccess(false), 4000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Page Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Workforce Payroll &amp; Statutory VAT Filing</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / payroll &amp; tax compliance
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> WPS SIF v3.0 Compliant
          </span>
          <span className="badge ok">
            <span className="d"></span> 5% Statutory Tax Return
          </span>
        </div>
      </div>

      {/* F10. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Monthly Payroll</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <UsersThree size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$148,500</div>
          <div className="metric-delta">42 staff · Aug 2026</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Net Disbursement</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Wallet size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$124,200</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>100% WPS compliant</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Net VAT Due</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$18,450</div>
          <div className="metric-delta" style={{ color: '#ca8a04', fontWeight: 600 }}>Due in 14 days</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Remittances</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$42,750</div>
          <div className="metric-delta">0 compliance penalties</div>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'wps' ? 'active' : ''}`}
          onClick={() => setActiveTab('wps')}
        >
          Workforce Payroll &amp; WPS SIF
        </button>
        <button
          className={`tab-btn ${activeTab === 'vat' ? 'active' : ''}`}
          onClick={() => setActiveTab('vat')}
        >
          VAT Filing &amp; 5% Tax Audit
        </button>
      </div>

      {/* ================= Tab 1: Workforce Payroll & WPS ================= */}
      {activeTab === 'wps' && (
        <div>
          <div className="row-actions">
            <div>
              {wpsExportSuccess && (
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} weight="bold" /> WPS SIF file exported successfully!
                </span>
              )}
              {payrollSuccess && (
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} weight="bold" /> Payroll executed &amp; GL Voucher posted!
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-ghost"
                onClick={handleExportWps}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <DownloadSimple size={14} weight="bold" />
                <span>Export WPS SIF File</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleExecutePayroll}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={14} weight="fill" />
                <span>Execute Payroll Run</span>
              </button>
            </div>
          </div>

          <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name &amp; Role</th>
                  <th>Department</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Payout</th>
                  <th>WPS Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workforceRows.map((emp) => (
                  <tr key={emp.empId}>
                    <td className="mono">{emp.empId}</td>
                    <td>
                      <div className="cell-strong">{emp.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.role}</div>
                    </td>
                    <td>
                      <span className="tag-pill solid">{emp.dept}</span>
                    </td>
                    <td className="mono">${emp.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="mono" style={{ color: '#b91c1c' }}>
                      -${emp.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="mono cell-strong" style={{ color: '#15803d' }}>
                      ${emp.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${emp.wpsStatus}`}>
                        <span className="d"></span>
                        {emp.wpsStatus === 'ok' ? 'WPS Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="link-action"
                        onClick={() => setSelectedPayslip(emp)}
                      >
                        Payslip
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= Tab 2: VAT Filing & Tax Audit ================= */}
      {activeTab === 'vat' && (
        <div>
          {/* Statutory VAT Box Summary */}
          <div className="vat-box">
            <div className="vat-row">
              <span className="l">Taxable Gross Sales Revenue</span>
              <span className="v">$642,000.00</span>
            </div>
            <div className="vat-row">
              <span className="l">Output VAT Collected (5%)</span>
              <span className="v" style={{ color: '#15803d' }}>+$32,100.00</span>
            </div>
            <div className="vat-row">
              <span className="l">Taxable Inbound Purchases &amp; Expenses</span>
              <span className="v">$273,000.00</span>
            </div>
            <div className="vat-row">
              <span className="l">Input VAT Recoverable (5%)</span>
              <span className="v" style={{ color: '#b91c1c' }}>-$13,650.00</span>
            </div>
            <div className="vat-row">
              <span className="l">Net VAT Tax Liability Due</span>
              <span className="v" style={{ fontSize: '16px', color: '#111827' }}>$18,450.00</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmitVatReturn}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle size={14} weight="bold" />
              <span>Submit VAT Return &amp; Post Settlement</span>
            </button>

            {vatSuccess && (
              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                ✓ Q3 VAT Return submitted and posted to General Ledger!
              </span>
            )}
          </div>

          {/* Tax Audit Breakdown Table */}
          <div className="section-label" style={{ marginBottom: '8px' }}>
            Detailed VAT Transaction Audit Log
          </div>

          <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doc Ref</th>
                  <th>Counter-Party</th>
                  <th>Tax Type</th>
                  <th>Taxable Base</th>
                  <th>Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {vatAuditLog.map((row, idx) => (
                  <tr key={idx}>
                    <td className="mono">{row.date}</td>
                    <td className="mono cell-strong">{row.docRef}</td>
                    <td>{row.party}</td>
                    <td>
                      <span className={`tag-pill ${row.amount > 0 ? 'solid' : ''}`}>
                        {row.taxType}
                      </span>
                    </td>
                    <td className="mono">${row.base.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="mono cell-strong" style={{ color: row.amount > 0 ? '#15803d' : '#b91c1c' }}>
                      {row.amount > 0 ? `+$${row.amount.toFixed(2)}` : `-$${Math.abs(row.amount).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslip Inspection Modal */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IdentificationCard size={18} weight="bold" />
                <span>Employee Payslip — {selectedPayslip.name}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPayslip(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>Emp ID: <b className="mono">{selectedPayslip.empId}</b></div>
                  <div>Department: <b>{selectedPayslip.dept}</b></div>
                  <div>Designation: <b>{selectedPayslip.role}</b></div>
                  <div>Period: <b>August 2026</b></div>
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: '6px' }}>Earnings &amp; Allowances</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>Basic Wage:</span>
                  <span className="mono">${selectedPayslip.basic.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>Housing &amp; Transport Allowance:</span>
                  <span className="mono">${selectedPayslip.allowances.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', borderTop: '1px solid #f3f4f6', fontWeight: 700 }}>
                  <span>Gross Earnings:</span>
                  <span className="mono">${selectedPayslip.gross.toFixed(2)}</span>
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: '6px' }}>Statutory Withholdings &amp; Deductions</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>Statutory Social Security / Pension:</span>
                  <span className="mono" style={{ color: '#b91c1c' }}>-${(selectedPayslip.deductions * 0.6).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>Health Insurance &amp; Taxes:</span>
                  <span className="mono" style={{ color: '#b91c1c' }}>-${(selectedPayslip.deductions * 0.4).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', borderTop: '1px solid #f3f4f6', fontWeight: 700 }}>
                  <span>Total Deductions:</span>
                  <span className="mono" style={{ color: '#b91c1c' }}>-${selectedPayslip.deductions.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontWeight: 800, fontSize: '14px', color: '#15803d' }}>
                <span>Net Payout (WPS Transfer):</span>
                <span className="mono">${selectedPayslip.net.toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedPayslip(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollProcessView;
