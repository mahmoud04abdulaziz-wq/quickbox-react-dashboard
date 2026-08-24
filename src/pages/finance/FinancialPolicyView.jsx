import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Scroll,
  BookBookmark,
  ShieldCheck,
  CheckCircle,
  Warning,
  Plus,
  X,
  FileText,
  Scales,
  Receipt,
  DownloadSimple,
  QrCode,
  Lock,
  Percent
} from '@phosphor-icons/react';

function FinancialPolicyView() {
  const {
    policies,
    regulatoryReferences,
    updatePolicyStatus,
    addPolicyRevision,
    updateRegulatoryRule
  } = useFinance();

  const [activeTab, setActiveTab] = useState('company-policies'); // 'company-policies' | 'jordan-regulations' | 'e-invoicing-standards' | 'compliance-audit-logs'
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(null);

  // Form State for Policy Revision
  const [revVersion, setRevVersion] = useState('v3.0');
  const [revDate, setRevDate] = useState(new Date().toISOString().split('T')[0]);
  const [revSummary, setRevSummary] = useState('');

  // Fawateer Standards Checklist State
  const fawateerRequirements = [
    { code: 'FAW-01', title: 'Jordanian Tax Identification Number (الرقم الضريبي)', rule: 'Mandatory 8-digit unique ISTD corporate registration tax identifier on all issued invoices.', status: 'Verified Compliant' },
    { code: 'FAW-02', title: 'National Facility Establishment Number (الرقم الوطني للمنشأة)', rule: 'Mandatory 9-digit Ministry of Industry establishment number.', status: 'Verified Compliant' },
    { code: 'FAW-03', title: 'Sequential Cryptographic Invoice Numbering', rule: 'Gapless chronological sequential numbering format without deletions or reuse.', status: 'Verified Compliant' },
    { code: 'FAW-04', title: 'Base64 Encoded QR Code & Digital Signature Hash', rule: 'Embedded TLV/Base64 cryptographic QR code for instant consumer and ISTD verification.', status: 'Verified Compliant' },
    { code: 'FAW-05', title: '24-Hour Real-Time API Transmission Window', rule: 'Direct B2B/B2C automated synchronization with Jordan ISTD Fawateer gateway.', status: 'Active Sync' }
  ];

  // Calculated Metrics
  const totalPolicies = policies.length;
  const avgComplianceScore = totalPolicies > 0 ? (policies.reduce((s, p) => s + p.compliance_score, 0) / totalPolicies).toFixed(1) : 100;
  const statutoryCount = regulatoryReferences.length;

  const handleOpenDetailModal = (pol) => {
    setSelectedPolicy(pol);
    setIsDetailModalOpen(true);
  };

  const handleOpenRevisionModal = (pol) => {
    setSelectedPolicy(pol);
    setRevVersion(`v${(parseFloat(pol.version.replace('v', '')) + 0.1).toFixed(1)}`);
    setRevSummary(pol.policy_summary);
    setIsRevisionModalOpen(true);
  };

  const handleRevisionSubmit = (e) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    addPolicyRevision(selectedPolicy.policy_id, {
      version: revVersion,
      effective_date: revDate,
      summary: revSummary
    });

    setPolicySuccess(`Policy ${selectedPolicy.code} updated to version ${revVersion}`);
    setIsRevisionModalOpen(false);
    setTimeout(() => setPolicySuccess(null), 5000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Corporate Financial Policies &amp; Statutory Governance</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / financial policies &amp; jordanian regulatory baseline
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Jordan Statutory Baseline 2026
          </span>
          <button
            className="btn-primary"
            onClick={() => {
              setPolicySuccess('Generating corporate policy handbook export dossier...');
              setTimeout(() => setPolicySuccess('Corporate Financial Policy Manual v2026.2 exported successfully.'), 1500);
              setTimeout(() => setPolicySuccess(null), 5000);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export Policy Handbook</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {policySuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '12px' }}>
          <CheckCircle size={16} weight="bold" />
          <span>{policySuccess}</span>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="metrics-4" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Active Policy Manuals</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Scroll size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{totalPolicies} Manuals</div>
          <div className="metric-delta">v2026.2 Corporate Edition</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Statutory Rules Enforced</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Scales size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{statutoryCount} Directives</div>
          <div className="metric-delta">ISTD, SSC &amp; GTD Standard</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Average Compliance Score</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <ShieldCheck size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{avgComplianceScore}%</div>
          <div className="metric-delta up" style={{ color: '#15803d' }}>IFRS &amp; Jordanian Law Aligned</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">E-Invoicing Fawateer Status</span>
            <div className="metric-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}>
              <QrCode size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">100% Validated</div>
          <div className="metric-delta">By-Law No. 13/2023 Compliant</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'company-policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('company-policies')}
        >
          Corporate Financial SOPs ({policies.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'jordan-regulations' ? 'active' : ''}`}
          onClick={() => setActiveTab('jordan-regulations')}
        >
          Jordanian Statutory Fiscal Baseline ({regulatoryReferences.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'e-invoicing-standards' ? 'active' : ''}`}
          onClick={() => setActiveTab('e-invoicing-standards')}
        >
          Fawateer E-Invoicing Standards (5 Requirements)
        </button>
        <button
          className={`tab-btn ${activeTab === 'compliance-audit-logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance-audit-logs')}
        >
          Policy Review &amp; Version History
        </button>
      </div>

      {/* SUB-TAB 1: CORPORATE FINANCIAL SOPS */}
      {activeTab === 'company-policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Standard Financial Operating Procedures (SOPs)</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Enforced Automated System Rules and Governance Thresholds
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> Version Controlled</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Policy Code</th>
                    <th>Policy Title</th>
                    <th>Governance Category</th>
                    <th style={{ textAlign: 'center' }}>Version</th>
                    <th style={{ textAlign: 'center' }}>Compliance Score</th>
                    <th>Legal / Statutory Baseline</th>
                    <th>IFRS Reference</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((pol) => (
                    <tr key={pol.policy_id}>
                      <td className="mono" style={{ fontWeight: 700 }}>{pol.code}</td>
                      <td style={{ fontWeight: 600 }}>{pol.title}</td>
                      <td><span className="tag-pill solid">{pol.category}</span></td>
                      <td style={{ textAlign: 'center' }} className="mono">{pol.version}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-green)' }} className="mono">
                        {pol.compliance_score}%
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{pol.statutory_law_ref}</td>
                      <td className="mono" style={{ fontSize: '11px' }}>{pol.ifrs_standard_ref}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> {pol.compliance_status}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleOpenDetailModal(pol)}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            Inspect Rules
                          </button>
                          <button
                            className="btn-primary"
                            onClick={() => handleOpenRevisionModal(pol)}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            Amend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: JORDANIAN STATUTORY FISCAL BASELINE */}
      {activeTab === 'jordan-regulations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Jordanian Regulatory Fiscal Baseline (2026)</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Income &amp; Sales Tax Law No. 34/2014, SSC Law No. 1/2014 &amp; Procurement Law No. 28/2019
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> Statutory Compliance</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Rule Code</th>
                    <th>Regulatory Authority</th>
                    <th>Statutory Provision</th>
                    <th style={{ textAlign: 'center' }}>Official Rate / Requirement</th>
                    <th>Legal Source / Article Reference</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Application</th>
                  </tr>
                </thead>
                <tbody>
                  {regulatoryReferences.map((reg) => (
                    <tr key={reg.rule_id}>
                      <td className="mono" style={{ fontWeight: 700 }}>{reg.rule_id}</td>
                      <td style={{ fontWeight: 600 }}>{reg.authority}</td>
                      <td>{reg.regulation}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-green)' }} className="mono">
                        {reg.rate}
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{reg.law_ref}</td>
                      <td><span className="tag-pill solid">{reg.category}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FAWATEER E-INVOICING STANDARDS */}
      {activeTab === 'e-invoicing-standards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>National E-Invoicing System (Fawateer / نظام الفوترة الوطني)</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Technical Architecture and Schema Standards under Executive By-Law No. 13/2023
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> ISTD Gateway Verified</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Standard Code</th>
                    <th>Compliance Requirement</th>
                    <th>Statutory Rule &amp; Technical Specification</th>
                    <th style={{ textAlign: 'center' }}>Integration Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fawateerRequirements.map((req) => (
                    <tr key={req.code}>
                      <td className="mono" style={{ fontWeight: 700 }}>{req.code}</td>
                      <td style={{ fontWeight: 600 }}>{req.title}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.rule}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> {req.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: POLICY REVIEW & VERSION HISTORY */}
      {activeTab === 'compliance-audit-logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Policy Revision History &amp; Annual Review Audit Trail</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Version Control Archive and Compliance Committee Sign-Off
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> Annual Review Current</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Revision Tag</th>
                    <th>Policy Code</th>
                    <th>Effective Date</th>
                    <th>Review Cycle</th>
                    <th>Authorized Approvers</th>
                    <th>Summary of Enforcement Modifications</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p) => (
                    <tr key={p.policy_id}>
                      <td className="mono" style={{ fontWeight: 700 }}>{p.version}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{p.code}</td>
                      <td className="mono">{p.effective_date}</td>
                      <td><span className="tag-pill solid">{p.review_cycle}</span></td>
                      <td style={{ fontSize: '11.5px' }}>{p.mandatory_approvers.join(', ')}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.policy_summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT FULL POLICY RULES */}
      {isDetailModalOpen && selectedPolicy && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedPolicy.code} — {selectedPolicy.title}</h3>
              <button className="modal-close-btn" onClick={() => setIsDetailModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Policy Scope &amp; Purpose:</div>
                <div style={{ fontSize: '12.5px', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedPolicy.policy_summary}
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700 }}>Automated System Enforcement Checks:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedPolicy.enforcement_rules || []).map((rule, idx) => (
                  <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: '#15803d' }}>
                      {rule.rule_code}: {rule.rule_name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Mechanism: {rule.system_check} (Automated: {rule.automated ? 'Yes' : 'No'})
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11.5px', marginTop: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Statutory Reference: </span>
                  <div style={{ fontWeight: 600 }}>{selectedPolicy.statutory_law_ref}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>IFRS Standard: </span>
                  <div style={{ fontWeight: 600 }}>{selectedPolicy.ifrs_standard_ref}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="btn-primary" onClick={() => setIsDetailModalOpen(false)}>
                Close Policy Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DRAFT POLICY AMENDMENT */}
      {isRevisionModalOpen && selectedPolicy && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Draft Policy Amendment: {selectedPolicy.code}</h3>
              <button className="modal-close-btn" onClick={() => setIsRevisionModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRevisionSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>New Version Tag</label>
                    <input
                      type="text"
                      className="form-control"
                      value={revVersion}
                      onChange={(e) => setRevVersion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Effective Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={revDate}
                      onChange={(e) => setRevDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Updated Policy Summary &amp; Directives</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={revSummary}
                    onChange={(e) => setRevSummary(e.target.value)}
                    required
                  />
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Amending this policy will log an audit entry and update version tracking for annual compliance reporting.
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsRevisionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Version Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialPolicyView;
