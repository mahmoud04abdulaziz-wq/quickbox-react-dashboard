import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Warning,
  Plus,
  X,
  UserCheck,
  IdentificationBadge,
  LockKey,
  Scales,
  FileText,
  Buildings,
  Clock
} from '@phosphor-icons/react';

function InternalControlsView() {
  const { t } = useTranslation('finance');
  const {
    approvalRequests,
    controlMatrix,
    sodRules,
    approveRequest,
    rejectRequest,
    createApprovalRequest,
    updateControlMatrix
  } = useFinance();

  const [activeTab, setActiveTab] = useState('pending-queue'); // 'pending-queue' | 'control-matrix' | 'sod-rules' | 'signatories'
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
  const [actionComment, setActionComment] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // Form State for New Request
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('SUPPLIER_PAYMENT');
  const [formAmount, setFormAmount] = useState(2500);
  const [formCostCenter, setFormCostCenter] = useState('CC-100');
  const [formRequester, setFormRequester] = useState('Aisha Tariq');
  const [formUrgency, setFormUrgency] = useState('Normal');
  const [formJustification, setFormJustification] = useState('Operational stock replacement.');

  // Authorized Signatories Catalog (CCD Standard)
  const authorizedSignatories = [
    { id: 'SIG-01', name: 'Eng. Omar Farouq', title: 'Managing Director & CEO', class: 'Class A (First Degree)', maxLimit: 'Unlimited (> JOD 50,000)', ccrNumber: 'CCR-99410-A', status: 'Active Registered' },
    { id: 'SIG-02', name: 'Sarah Nasser, CPA', title: 'Chief Financial Officer (CFO)', class: 'Class A (First Degree)', maxLimit: 'Up to JOD 50,000', ccrNumber: 'CCR-99410-B', status: 'Active Registered' },
    { id: 'SIG-03', name: 'Tariq Khalil', title: 'Finance Manager', class: 'Class B (Second Degree)', maxLimit: 'Up to JOD 10,000', ccrNumber: 'CCR-99410-C', status: 'Active Registered' },
    { id: 'SIG-04', name: 'Layla Salem', title: 'Senior Financial Controller', class: 'Class B (Second Degree)', maxLimit: 'Up to JOD 5,000 (Maker-Checker)', ccrNumber: 'CCR-99410-D', status: 'Active Registered' }
  ];

  // Calculated Metrics
  const pendingRequests = approvalRequests.filter(r => r.status === 'PENDING');
  const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);
  const criticalCount = pendingRequests.filter(r => r.urgency === 'Critical').length;
  const approvedCount = approvalRequests.filter(r => r.status === 'APPROVED').length;

  const filteredRequests = approvalRequests.filter(r => {
    if (filterUrgency === 'ALL') return true;
    if (filterUrgency === 'PENDING') return r.status === 'PENDING';
    if (filterUrgency === 'APPROVED') return r.status === 'APPROVED';
    if (filterUrgency === 'CRITICAL') return r.urgency === 'Critical' && r.status === 'PENDING';
    return true;
  });

  const handleOpenActionModal = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setActionComment(type === 'APPROVE' ? t('internal_controls.msg_approved_cmt') : t('internal_controls.msg_rejected_cmt'));
    setIsActionModalOpen(true);
  };

  const handleExecuteAction = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (actionType === 'APPROVE') {
      approveRequest(selectedRequest.request_id, 'Sarah Nasser (CFO)', actionComment);
      setActionSuccess(t('internal_controls.msg_approved_req', { id: selectedRequest.request_id, amount: selectedRequest.amount.toLocaleString() }));
    } else {
      rejectRequest(selectedRequest.request_id, 'Sarah Nasser (CFO)', actionComment);
      setActionSuccess(t('internal_controls.msg_rejected_req', { id: selectedRequest.request_id }));
    }

    setIsActionModalOpen(false);
    setSelectedRequest(null);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleCreateRequestSubmit = (e) => {
    e.preventDefault();
    const ccMap = {
      'CC-100': 'Housekeeping',
      'CC-200': 'F&B Kitchen',
      'CC-300': 'Facilities & Maintenance',
      'CC-400': 'Front Office',
      'CC-500': 'IT & Security',
      'CC-600': 'Administration'
    };

    createApprovalRequest({
      title: formTitle || `${formType.replace(/_/g, ' ')} Request`,
      type: formType,
      amount: parseFloat(formAmount) || 0,
      currency: 'JOD',
      cost_center_code: formCostCenter,
      cost_center_name: ccMap[formCostCenter] || 'Operations',
      requester: formRequester,
      urgency: formUrgency,
      justification: formJustification
    });

    setActionSuccess(t('internal_controls.msg_created_req', { amount: parseFloat(formAmount).toLocaleString() }));
    setIsNewRequestModalOpen(false);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('internal_controls.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('internal_controls.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('internal_controls.badge_ccd')}
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsNewRequestModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('internal_controls.btn_new_request')}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '12px' }}>
          <CheckCircle size={16} weight="bold" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="metrics-4" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('internal_controls.kpi_pending')}</span>
            <div className="metric-icon" style={{ background: pendingRequests.length > 0 ? '#fef9c3' : '#f0fdf4', color: pendingRequests.length > 0 ? '#a16207' : '#15803d' }}>
              <Clock size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{pendingRequests.length} Requests</div>
          <div className="metric-delta" style={{ color: '#a16207', fontWeight: 600 }}>
            JOD <span className="bidi-ltr" dir="ltr">{totalPendingAmount.toLocaleString()}</span> (<span className="bidi-ltr" dir="ltr">{criticalCount}</span> {t('internal_controls.filter_critical', { count: '' }).trim()})
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('internal_controls.h_sod_title')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <ShieldCheck size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value"><span className="bidi-ltr" dir="ltr">100%</span> Clean</div>
          <div className="metric-delta up" style={{ color: '#15803d' }}>{t('internal_controls.badge_zero_viol')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('internal_controls.kpi_approved')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <UserCheck size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{approvedCount + 68} Actions</div>
          <div className="metric-delta">Avg Turnaround: <span className="bidi-ltr" dir="ltr">1.4</span> Hours</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('internal_controls.kpi_approved_delta')}</span>
            <div className="metric-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}>
              <Scales size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">4 Tiers Matrix</div>
          <div className="metric-delta">Dual Signatory &gt; JOD <span className="bidi-ltr" dir="ltr">10k</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'pending-queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending-queue')}
        >
          {t('internal_controls.tab_actionable_queue', { count: pendingRequests.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'control-matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('control-matrix')}
        >
          {t('internal_controls.tab_matrix_count', { count: controlMatrix.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'sod-rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('sod-rules')}
        >
          {t('internal_controls.tab_sod_count', { count: sodRules.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'signatories' ? 'active' : ''}`}
          onClick={() => setActiveTab('signatories')}
        >
          {t('internal_controls.tab_sig_count', { count: authorizedSignatories.length })}
        </button>
      </div>

      {/* SUB-TAB 1: ACTIONABLE APPROVALS INBOX */}
      {activeTab === 'pending-queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('internal_controls.lbl_filter_queue')}</span>
              <button
                className={filterUrgency === 'ALL' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterUrgency('ALL')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('internal_controls.filter_all_reqs', { count: approvalRequests.length })}
              </button>
              <button
                className={filterUrgency === 'PENDING' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterUrgency('PENDING')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('internal_controls.filter_pending_count', { count: pendingRequests.length })}
              </button>
              <button
                className={filterUrgency === 'CRITICAL' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterUrgency('CRITICAL')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('internal_controls.filter_critical', { count: criticalCount })}
              </button>
              <button
                className={filterUrgency === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFilterUrgency('APPROVED')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {t('internal_controls.filter_approved_count', { count: approvedCount })}
              </button>
            </div>
            <span className="badge ok"><span className="d"></span> {t('internal_controls.badge_maker_checker')}</span>
          </div>

          {/* Requests Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRequests.map((req) => (
              <div
                key={req.request_id}
                className="card"
                style={{
                  padding: '16px',
                  borderLeft: req.urgency === 'Critical' ? '4px solid #ef4444' : req.status === 'APPROVED' ? '4px solid var(--primary-green)' : '4px solid #f59e0b'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700, fontSize: '13px' }}>{req.request_id}</span>
                      <span className={`badge ${req.urgency === 'Critical' ? 'crit' : 'ok'}`}>
                        {t('internal_controls.lbl_urgency_val', { val: req.urgency })}
                      </span>
                      <span className="tag-pill solid">{req.type.replace(/_/g, ' ')}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{req.title}</h3>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <div className="mono bidi-ltr" dir="ltr" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                      JOD <span className="bidi-ltr" dir="ltr">{req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Ref: <span className="mono bidi-ltr" dir="ltr">{req.source_ref}</span>
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong>{t('internal_controls.lbl_justification')}</strong> {req.justification}
                </p>

                {/* Multi-Tier Approval Chain Visualizer */}
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {t('internal_controls.lbl_multi_tier', { current: req.current_tier, required: req.required_tiers })}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {req.approval_chain.map((step) => (
                      <div key={step.tier} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                        {step.status === 'APPROVED' ? (
                          <CheckCircle size={16} weight="bold" color="var(--primary-green)" />
                        ) : step.status === 'REJECTED' ? (
                          <XCircle size={16} weight="bold" color="#ef4444" />
                        ) : (
                          <Clock size={16} weight="bold" color="#f59e0b" />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{t('internal_controls.lbl_tier_role', { tier: step.tier, role: step.role })}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {step.approver_name} {step.timestamp ? `(${step.timestamp})` : '— Pending'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer & Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {t('internal_controls.lbl_submitted_by')} <strong>{req.requester}</strong> ({req.cost_center_name}) on {req.submission_date}
                  </div>

                  {req.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleOpenActionModal(req, 'REJECT')}
                        style={{ fontSize: '11.5px', padding: '5px 12px', color: '#b91c1c' }}
                      >
                        Reject
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleOpenActionModal(req, 'APPROVE')}
                        style={{ fontSize: '11.5px', padding: '5px 14px' }}
                      >
                        Approve Tier {req.current_tier}
                      </button>
                    </div>
                  ) : (
                    <span className={`badge ${req.status === 'APPROVED' ? 'ok' : 'crit'}`}>
                      <span className="d"></span> {t('internal_controls.lbl_status_val', { val: req.status })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MONETARY AUTHORIZATION MATRIX */}
      {activeTab === 'control-matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('internal_controls.h_matrix_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('internal_controls.h_matrix_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('internal_controls.badge_cr_aligned')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('internal_controls.th_control_id')}</th>
                    <th>{t('internal_controls.th_exp_category')}</th>
                    <th style={{ textAlign: 'end' }}>{t('internal_controls.th_monetary_range')}</th>
                    <th>{t('internal_controls.th_req_auth')}</th>
                    <th style={{ textAlign: 'center' }}>{t('internal_controls.th_req_tiers')}</th>
                    <th>{t('internal_controls.th_op_rule')}</th>
                    <th style={{ textAlign: 'center' }}>{t('internal_controls.th_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {controlMatrix.map((ctrl) => (
                    <tr key={ctrl.control_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{ctrl.control_id}</td>
                      <td style={{ fontWeight: 600 }}>{ctrl.category}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        JOD {ctrl.threshold_min.toLocaleString()} — {ctrl.threshold_max >= 999999 ? 'No Limit' : `JOD ${ctrl.threshold_max.toLocaleString()}`}
                      </td>
                      <td>
                        <span className="tag-pill solid">{ctrl.required_role}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">{ctrl.required_tiers} Tier(s)</td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{ctrl.description}</td>
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

      {/* SUB-TAB 3: SEGREGATION OF DUTIES (SOD) RULES */}
      {activeTab === 'sod-rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('internal_controls.h_sod_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('internal_controls.h_sod_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('internal_controls.badge_zero_viol')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Rule Code</th>
                    <th>{t('internal_controls.th_incompat_roles')}</th>
                    <th>{t('internal_controls.th_enforce_mech')}</th>
                    <th>{t('internal_controls.th_desc_fraud')}</th>
                    <th style={{ textAlign: 'center' }}>{t('internal_controls.th_active_viol')}</th>
                    <th style={{ textAlign: 'center' }}>{t('internal_controls.th_enforcement')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sodRules.map((sod) => (
                    <tr key={sod.rule_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{sod.rule_id}</td>
                      <td style={{ fontWeight: 600 }}>{sod.name}</td>
                      <td><span className="tag-pill solid">{t('internal_controls.badge_sys_block')}</span></td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{sod.description}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-green)' }} className="mono bidi-ltr" dir="ltr">
                        {sod.violations}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> {sod.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: COMMERCIAL REGISTER SIGNATORIES */}
      {activeTab === 'signatories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('internal_controls.h_sig_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('internal_controls.h_sig_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('internal_controls.badge_cr_verified')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('internal_controls.th_sig_code')}</th>
                    <th>{t('internal_controls.th_sig_name')}</th>
                    <th>{t('internal_controls.th_corp_title')}</th>
                    <th>{t('internal_controls.th_sig_class')}</th>
                    <th>{t('internal_controls.th_stat_ceiling')}</th>
                    <th>{t('internal_controls.th_ccd_ref')}</th>
                    <th style={{ textAlign: 'center' }}>{t('internal_controls.th_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {authorizedSignatories.map((sig) => (
                    <tr key={sig.id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{sig.id}</td>
                      <td style={{ fontWeight: 600 }}>{sig.name}</td>
                      <td>{sig.title}</td>
                      <td><span className="tag-pill solid">{sig.class}</span></td>
                      <td style={{ fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">{sig.maxLimit}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sig.ccrNumber}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="d"></span> {sig.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE / REJECT DIALOG */}
      {isActionModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'APPROVE' ? t('internal_controls.modal_approve_title') : t('internal_controls.modal_reject_title')}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsActionModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleExecuteAction}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{selectedRequest.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t('internal_controls.lbl_amount_ref')} <strong className="mono bidi-ltr" dir="ltr" style={{ color: 'var(--text-main)' }}>JOD {selectedRequest.amount.toLocaleString()}</strong> | {t('internal_controls.lbl_ref')} {selectedRequest.source_ref}
                  </div>
                </div>

                <div className="form-group">
                  <label>{actionType === 'APPROVE' ? t('internal_controls.lbl_approve_cmt') : t('internal_controls.lbl_reject_cmt')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    required
                  />
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('internal_controls.lbl_acting_sig')} <strong>Sarah Nasser, CPA (CFO / Class A Signatory)</strong>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsActionModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={actionType === 'APPROVE' ? 'btn-primary' : 'btn-secondary'}
                  style={{ background: actionType === 'REJECT' ? '#ef4444' : undefined, color: actionType === 'REJECT' ? 'white' : undefined }}
                >
                  {actionType === 'APPROVE' ? t('internal_controls.btn_confirm_approve') : t('internal_controls.btn_confirm_reject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT NEW AUTHORIZATION REQUEST */}
      {isNewRequestModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{t('internal_controls.modal_init_req')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewRequestModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateRequestSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>{t('internal_controls.lbl_req_title')}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Commercial Kitchen Freezer Replacement"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('internal_controls.lbl_exp_type')}</label>
                    <select
                      className="form-control"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="SUPPLIER_PAYMENT">Supplier Bill Payment</option>
                      <option value="CAPEX_ACQUISITION">Capital Expenditure (CAPEX)</option>
                      <option value="PAYROLL_OVERTIME">Payroll &amp; Overtime Accrual</option>
                      <option value="IT_SUBSCRIPTION">IT Software &amp; Cloud Subscription</option>
                      <option value="CONTRACT_DISBURSEMENT">Contractor Milestone Payment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('internal_controls.lbl_amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formAmount}
                      onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('internal_controls.lbl_cost_center')}</label>
                    <select
                      className="form-control"
                      value={formCostCenter}
                      onChange={(e) => setFormCostCenter(e.target.value)}
                    >
                      <option value="CC-100">CC-100 — Housekeeping</option>
                      <option value="CC-200">CC-200 — F&amp;B Kitchen</option>
                      <option value="CC-300">CC-300 — Facilities &amp; Maintenance</option>
                      <option value="CC-400">CC-400 — Front Office</option>
                      <option value="CC-500">CC-500 — IT &amp; Security</option>
                      <option value="CC-600">CC-600 — Administration &amp; Exec</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('internal_controls.lbl_urgency')}</label>
                    <select
                      className="form-control"
                      value={formUrgency}
                      onChange={(e) => setFormUrgency(e.target.value)}
                    >
                      <option value="Normal">{t('internal_controls.opt_normal')}</option>
                      <option value="High">{t('internal_controls.opt_high')}</option>
                      <option value="Critical">{t('internal_controls.opt_critical')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('internal_controls.lbl_req_name')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formRequester}
                    onChange={(e) => setFormRequester(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('internal_controls.lbl_business_just')}</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formJustification}
                    onChange={(e) => setFormJustification(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsNewRequestModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit for Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternalControlsView;
