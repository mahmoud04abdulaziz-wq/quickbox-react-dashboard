import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  Gavel,
  FileText,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Warning,
  Plus,
  X,
  Bank,
  Scales,
  TrendUp,
  Buildings,
  Receipt,
  Medal,
  Percent
} from '@phosphor-icons/react';

function TenderBidAuditingView() {
  const { t } = useTranslation('finance');
  const {
    tenders,
    procurementThresholds,
    bankGuarantees,
    createTender,
    submitBid,
    awardTender
  } = useFinance();

  const [activeTab, setActiveTab] = useState('tenders-registry'); // 'tenders-registry' | 'bid-evaluation' | 'bank-bonds' | 'gtd-thresholds'
  const [selectedTenderId, setSelectedTenderId] = useState('TND-2026-001');
  const [isNewTenderModalOpen, setIsNewTenderModalOpen] = useState(false);
  const [isNewBidModalOpen, setIsNewBidModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedBidToAward, setSelectedBidToAward] = useState(null);
  const [awardJustification, setAwardJustification] = useState('Awarded to lowest evaluated compliant bidder conforming to Jordan Public Procurement Law No. 28/2019 specifications.');
  const [auditSuccess, setAuditSuccess] = useState(null);

  // Form State for New Tender
  const [formTenderTitle, setFormTenderTitle] = useState('');
  const [formTenderCategory, setFormTenderCategory] = useState('Supplies');
  const [formTenderMethod, setFormTenderMethod] = useState('Public Tender (GTD Standard)');
  const [formTenderBudget, setFormTenderBudget] = useState(60000);
  const [formTenderDeadline, setFormTenderDeadline] = useState('2026-09-30');

  // Form State for New Bid Submission
  const [bidVendorName, setBidVendorName] = useState('');
  const [bidVendorCrn, setBidVendorCrn] = useState('CRN-');
  const [bidPrice, setBidPrice] = useState(50000);
  const [bidTechScore, setBidTechScore] = useState(90);
  const [bidFinScore, setBidFinScore] = useState(95);
  const [bidBondAmount, setBidBondAmount] = useState(1500);
  const [bidBank, setBidBank] = useState('Arab Bank');
  const [bidDeliveryDays, setBidDeliveryDays] = useState(14);
  const [bidWarrantyMonths, setBidWarrantyMonths] = useState(12);

  const selectedTender = tenders.find(tndr => tndr.tender_id === selectedTenderId) || tenders[0];

  // Calculated Summary Metrics
  const totalTenderVolume = tenders.reduce((sum, tndr) => sum + tndr.budget_amount, 0);
  const totalBidsCount = tenders.reduce((sum, tndr) => sum + (tndr.bids?.length || 0), 0);
  const totalGuaranteesHeld = (bankGuarantees || []).reduce((sum, bg) => sum + bg.amount, 0);

  const handleCreateTenderSubmit = (e) => {
    e.preventDefault();
    const newTnd = createTender({
      title: formTenderTitle,
      category: formTenderCategory,
      procurement_method: formTenderMethod,
      budget_amount: parseFloat(formTenderBudget) || 0,
      submission_deadline: formTenderDeadline
    });
    setSelectedTenderId(newTnd.tender_id);
    setAuditSuccess(t('tenders.msg_created_tender', { ref: newTnd.reference_code, title: newTnd.title }));
    setIsNewTenderModalOpen(false);
    setTimeout(() => setAuditSuccess(null), 5000);
  };

  const handleSubmitBidSubmit = (e) => {
    e.preventDefault();
    if (!selectedTender) return;

    submitBid(selectedTender.tender_id, {
      vendor_name: bidVendorName,
      vendor_crn: bidVendorCrn,
      quoted_price: parseFloat(bidPrice) || 0,
      technical_score: parseFloat(bidTechScore) || 85,
      financial_score: parseFloat(bidFinScore) || 90,
      bid_bond_submitted: true,
      bid_bond_amount: parseFloat(bidBondAmount) || 0,
      issuing_bank: bidBank,
      tax_clearance_verified: true,
      ssc_compliance_verified: true,
      delivery_timeline_days: parseInt(bidDeliveryDays) || 14,
      warranty_months: parseInt(bidWarrantyMonths) || 12
    });

    setAuditSuccess(t('tenders.msg_logged_bid', { vendor: bidVendorName, amount: parseFloat(bidPrice).toLocaleString() }));
    setIsNewBidModalOpen(false);
    setTimeout(() => setAuditSuccess(null), 5000);
  };

  const handleAwardTenderSubmit = (e) => {
    e.preventDefault();
    if (!selectedTender || !selectedBidToAward) return;

    awardTender(selectedTender.tender_id, selectedBidToAward.bid_id, awardJustification);
    setAuditSuccess(t('tenders.msg_awarded_tender', { ref: selectedTender.reference_code, vendor: selectedBidToAward.vendor_name }));
    setIsAwardModalOpen(false);
    setSelectedBidToAward(null);
    setTimeout(() => setAuditSuccess(null), 5000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('tenders.title')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            {t('tenders.breadcrumb')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('tenders.badge_jordan_law')}
          </span>
          <button
            className="btn-primary"
            onClick={() => setIsNewTenderModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('tenders.btn_publish_rfp')}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {auditSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '12px' }}>
          <CheckCircle size={16} weight="bold" />
          <span>{auditSuccess}</span>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="metrics-4" style={{ marginBottom: '20px' }}>
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('tenders.kpi_active_tenders')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Gavel size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD <span className="bidi-ltr" dir="ltr">{totalTenderVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          <div className="metric-delta">{t('tenders.kpi_packages_count', { count: tenders.length })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('tenders.kpi_bids')}</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <FileText size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{t('tenders.kpi_submissions_count', { count: totalBidsCount })}</div>
          <div className="metric-delta">{t('tenders.kpi_ratio_desc')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('tenders.kpi_guarantees')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Bank size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">JOD <span className="bidi-ltr" dir="ltr">{totalGuaranteesHeld.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          <div className="metric-delta up" style={{ color: '#15803d' }}><span className="bidi-ltr" dir="ltr">100%</span> {t('tenders.kpi_bonds_verified', 'Bank Verified Bonds')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('tenders.kpi_compliance_title', 'Procurement Compliance')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <ShieldCheck size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">{t('tenders.kpi_compliance_rating', '96.5% Rating')}</div>
          <div className="metric-delta">{t('tenders.kpi_compliance_law', 'GTD By-Law 8/2022 Certified')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${activeTab === 'tenders-registry' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenders-registry')}
        >
          {t('tenders.tab_registry_count', { count: tenders.length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'bid-evaluation' ? 'active' : ''}`}
          onClick={() => setActiveTab('bid-evaluation')}
        >
          {t('tenders.tab_eval_count', { count: selectedTender?.bids?.length || 0 })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'bank-bonds' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank-bonds')}
        >
          {t('tenders.tab_bonds_count', { count: (bankGuarantees || []).length })}
        </button>
        <button
          className={`tab-btn ${activeTab === 'gtd-thresholds' ? 'active' : ''}`}
          onClick={() => setActiveTab('gtd-thresholds')}
        >
          {t('tenders.tab_thresh_count', { count: procurementThresholds.length })}
        </button>
      </div>

      {/* SUB-TAB 1: MASTER TENDERS REGISTRY */}
      {activeTab === 'tenders-registry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('tenders.h_registry_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('tenders.h_registry_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('tenders.badge_public_trans')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('tenders.th_tender_ref')}</th>
                    <th>{t('tenders.th_proc_title')}</th>
                    <th>{t('tenders.th_category')}</th>
                    <th>{t('tenders.th_method')}</th>
                    <th style={{ textAlign: 'end' }}>{t('tenders.th_est_budget')}</th>
                    <th>{t('tenders.th_deadline')}</th>
                    <th style={{ textAlign: 'center' }}>{t('tenders.th_bids_logged')}</th>
                    <th style={{ textAlign: 'center' }}>{t('tenders.th_comp_score')}</th>
                    <th style={{ textAlign: 'center' }}>{t('tenders.th_tender_status')}</th>
                    <th style={{ textAlign: 'center' }}>{t('tenders.th_audit_dossier')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tenders.map((tender) => (
                    <tr
                      key={tender.tender_id}
                      style={{ background: selectedTenderId === tender.tender_id ? '#f0fdf4' : 'transparent', cursor: 'pointer' }}
                      onClick={() => setSelectedTenderId(tender.tender_id)}
                    >
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 700 }}>{tender.reference_code}</td>
                      <td style={{ fontWeight: 600 }}>{tender.title}</td>
                      <td><span className="tag-pill solid">{tender.category}</span></td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{tender.procurement_method}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        JOD <span className="bidi-ltr" dir="ltr">{tender.budget_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11.5px' }}>{tender.submission_deadline}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="mono bidi-ltr" dir="ltr">{tender.bids?.length || 0}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge ok"><span className="bidi-ltr" dir="ltr">{tender.audit_compliance_score}%</span></span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${tender.status === 'Awarded' ? 'ok' : tender.status === 'Under_Evaluation' ? 'warn' : 'ok'}`}>
                          <span className="d"></span> {tender.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTenderId(tender.tender_id);
                            setActiveTab('bid-evaluation');
                          }}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          {t('tenders.btn_audit_bids')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BID AUDIT & COMPARISON MATRIX */}
      {activeTab === 'bid-evaluation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selected Tender Overview Banner */}
          <div className="card" style={{ padding: '16px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="tag-pill solid">{selectedTender?.reference_code}</span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '15px', fontWeight: 700 }}>{selectedTender?.title}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('tenders.lbl_proc_method')} <strong>{selectedTender?.procurement_method}</strong> | {t('tenders.lbl_budget_cap')} <strong className="mono bidi-ltr" dir="ltr">JOD <span className="bidi-ltr" dir="ltr">{selectedTender?.budget_amount.toLocaleString()}</span></strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-primary"
                  onClick={() => setIsNewBidModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '6px 12px' }}
                >
                  <Plus size={14} weight="bold" />
                  <span>{t('tenders.btn_submit_bid')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bids Evaluation Table */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                  {t('tenders.h_comp_eval')}
                </h4>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('tenders.h_eval_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('tenders.badge_sealed_env')}</span>
            </div>

            {(!selectedTender?.bids || selectedTender.bids.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {t('tenders.msg_no_bids')}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>{t('tenders.th_rank')}</th>
                      <th>{t('tenders.th_supplier')}</th>
                      <th>{t('tenders.th_crn')}</th>
                      <th style={{ textAlign: 'end' }}>{t('tenders.th_quoted_price')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_tech_score')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_fin_score')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_composite')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_bid_bond')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_istd_ssc')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_eval_result')}</th>
                      <th style={{ textAlign: 'center' }}>{t('tenders.th_award_action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTender.bids.map((bid) => (
                      <tr key={bid.bid_id} style={{ background: bid.audit_status === 'AWARDED' ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {bid.ranking === 1 ? <Medal size={16} color="#eab308" weight="fill" /> : `#${bid.ranking}`}
                        </td>
                        <td style={{ fontWeight: 600 }}>{bid.vendor_name}</td>
                        <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bid.vendor_crn}</td>
                        <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                          JOD <span className="bidi-ltr" dir="ltr">{bid.quoted_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td style={{ textAlign: 'center' }} className="mono bidi-ltr" dir="ltr"><span className="bidi-ltr" dir="ltr">{bid.technical_score}/100</span></td>
                        <td style={{ textAlign: 'center' }} className="mono bidi-ltr" dir="ltr"><span className="bidi-ltr" dir="ltr">{bid.financial_score}/100</span></td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-green)' }} className="mono bidi-ltr" dir="ltr">
                          <span className="bidi-ltr" dir="ltr">{bid.weighted_score}%</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {bid.bid_bond_submitted ? (
                            <span className="badge ok" style={{ fontSize: '10.5px' }}>
                              JOD <span className="bidi-ltr" dir="ltr">{bid.bid_bond_amount}</span> ({bid.issuing_bank.split(' ')[0]})
                            </span>
                          ) : (
                            <span className="badge crit" style={{ fontSize: '10.5px' }}>{t('tenders.lbl_missing')}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {bid.tax_clearance_verified && bid.ssc_compliance_verified ? (
                            <span className="badge ok">{t('tenders.lbl_verified')}</span>
                          ) : (
                            <span className="badge crit">{t('tenders.lbl_non_compliant')}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${bid.audit_status === 'AWARDED' ? 'ok' : bid.audit_status === 'DISQUALIFIED' ? 'crit' : 'ok'}`}>
                            <span className="d"></span> {bid.audit_status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {bid.audit_status === 'AWARDED' ? (
                            <span style={{ color: 'var(--primary-green)', fontWeight: 700, fontSize: '11px' }}>{t('tenders.lbl_awarded')}</span>
                          ) : bid.audit_status === 'DISQUALIFIED' ? (
                            <span style={{ color: '#ef4444', fontSize: '11px' }}>{t('tenders.lbl_disqualified')}</span>
                          ) : (
                            <button
                              className="btn-primary"
                              onClick={() => {
                                setSelectedBidToAward(bid);
                                setIsAwardModalOpen(true);
                              }}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              {t('tenders.btn_award_contract')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BANK GUARANTEES & BONDS VAULT */}
      {activeTab === 'bank-bonds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('tenders.h_bonds_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('tenders.h_bonds_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('tenders.badge_cb_validated')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('tenders.th_guar_ref')}</th>
                    <th>{t('tenders.th_tender_ref')}</th>
                    <th>{t('tenders.th_bond_class')}</th>
                    <th>{t('tenders.th_awarded_sup')}</th>
                    <th style={{ textAlign: 'end' }}>{t('tenders.th_guar_amount')}</th>
                    <th>{t('tenders.th_issuing_bank')}</th>
                    <th>{t('tenders.th_expiry_date')}</th>
                    <th style={{ textAlign: 'center' }}>{t('tenders.th_bond_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(bankGuarantees || []).map((bg) => (
                    <tr key={bg.guarantee_id}>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{bg.guarantee_id}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontWeight: 600 }}>{bg.tender_ref}</td>
                      <td><span className="tag-pill solid">{bg.type}</span></td>
                      <td style={{ fontWeight: 600 }}>{bg.vendor_name}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        JOD <span className="bidi-ltr" dir="ltr">{bg.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td>{bg.bank}</td>
                      <td className="mono bidi-ltr" dir="ltr" style={{ fontSize: '11.5px' }}>{bg.expiry_date}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${bg.status === 'Active' ? 'ok' : 'warn'}`}>
                          <span className="d"></span> {bg.status}
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

      {/* SUB-TAB 4: JORDAN GTD PROCUREMENT THRESHOLDS */}
      {activeTab === 'gtd-thresholds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('tenders.h_thresh_title')}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('tenders.h_thresh_sub')}
                </div>
              </div>
              <span className="badge ok"><span className="d"></span> {t('tenders.badge_gazette')}</span>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{t('tenders.th_proc_modality')}</th>
                    <th style={{ textAlign: 'end' }}>{t('tenders.th_monetary_ceiling')}</th>
                    <th>{t('tenders.th_auth_body')}</th>
                    <th>{t('tenders.th_audit_reqs')}</th>
                  </tr>
                </thead>
                <tbody>
                  {procurementThresholds.map((pt, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{pt.category}</td>
                      <td style={{ textAlign: 'end', fontWeight: 700 }} className="mono bidi-ltr" dir="ltr">
                        <span className="bidi-ltr" dir="ltr">{pt.threshold_limit_jod >= 9999999 ? 'Above JOD 30,000' : `Up to JOD ${pt.threshold_limit_jod.toLocaleString()}`}</span>
                      </td>
                      <td><span className="tag-pill solid">{pt.approval_authority}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pt.requirements}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH NEW TENDER */}
      {isNewTenderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{t('tenders.modal_publish_rfp')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewTenderModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateTenderSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>{t('tenders.lbl_tender_title')}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('tenders.placeholder_tender_title')}
                    value={formTenderTitle}
                    onChange={(e) => setFormTenderTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('tenders.th_category')}</label>
                    <select
                      className="form-control"
                      value={formTenderCategory}
                      onChange={(e) => setFormTenderCategory(e.target.value)}
                    >
                      <option value="Supplies">{t('tenders.opt_cat_supplies', 'Supplies & Materials')}</option>
                      <option value="Services">{t('tenders.opt_cat_services', 'Services & Maintenance')}</option>
                      <option value="Works &amp; Infrastructure">{t('tenders.opt_cat_works', 'Works & Construction')}</option>
                      <option value="Consulting">{t('tenders.opt_cat_consulting', 'Advisory & Consulting')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('tenders.lbl_proc_method_select', 'Procurement Method')}</label>
                    <select
                      className="form-control"
                      value={formTenderMethod}
                      onChange={(e) => setFormTenderMethod(e.target.value)}
                    >
                      <option value="Public Tender (GTD Standard)">{t('tenders.opt_method_public', 'Public Tender (GTD Standard)')}</option>
                      <option value="Solicited Quotations (RFQ)">{t('tenders.opt_method_rfq', 'Solicited Quotations (RFQ)')}</option>
                      <option value="Direct Purchase">{t('tenders.opt_method_direct', 'Direct Purchase')}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('tenders.th_est_budget')}</label>
                    <input
                      type="number"
                      dir="ltr"
                      className="form-control"
                      value={formTenderBudget}
                      onChange={(e) => setFormTenderBudget(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('tenders.lbl_sub_deadline')}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formTenderDeadline}
                      onChange={(e) => setFormTenderDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('tenders.msg_rfp_warn')}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsNewTenderModalOpen(false)}>{t('common:actions.cancel')}</button>
                <button type="submit" className="btn-primary">
                  {t('tenders.btn_publish_rfp_dossier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT SUPPLIER BID */}
      {isNewBidModalOpen && selectedTender && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{t('tenders.modal_log_bid')}</h3>
              <button className="modal-close-btn" onClick={() => setIsNewBidModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmitBidSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                  {t('tenders.lbl_tender')} <strong>{selectedTender.reference_code}</strong> — {selectedTender.title}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('tenders.lbl_sup_name')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bidVendorName}
                      onChange={(e) => setBidVendorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('tenders.lbl_crn')}</label>
                    <input
                      type="text"
                      dir="ltr"
                      className="form-control"
                      value={bidVendorCrn}
                      onChange={(e) => setBidVendorCrn(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('tenders.th_quoted_price')}</label>
                    <input
                      type="number"
                      dir="ltr"
                      className="form-control"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('tenders.lbl_bond_amount')}</label>
                    <input
                      type="number"
                      dir="ltr"
                      className="form-control"
                      value={bidBondAmount}
                      onChange={(e) => setBidBondAmount(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('tenders.lbl_tech_score')}</label>
                    <input
                      type="number"
                      dir="ltr"
                      max="100"
                      min="0"
                      className="form-control"
                      value={bidTechScore}
                      onChange={(e) => setBidTechScore(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('tenders.lbl_fin_score')}</label>
                    <input
                      type="number"
                      dir="ltr"
                      max="100"
                      min="0"
                      className="form-control"
                      value={bidFinScore}
                      onChange={(e) => setBidFinScore(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>{t('tenders.th_issuing_bank')}</label>
                    <select
                      className="form-control"
                      value={bidBank}
                      onChange={(e) => setBidBank(e.target.value)}
                    >
                      <option value="Arab Bank">{t('tenders.opt_bank_arab', 'Arab Bank (البنك العربي)')}</option>
                      <option value="Housing Bank for Trade &amp; Finance">{t('tenders.opt_bank_hbtf', 'Housing Bank (بنك الإسكان)')}</option>
                      <option value="Bank al Etihad">{t('tenders.opt_bank_etihad', 'Bank al Etihad (بنك الاتحاد)')}</option>
                      <option value="Jordan Islamic Bank">{t('tenders.opt_bank_jib', 'Jordan Islamic Bank')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('tenders.lbl_delivery_days')}</label>
                    <input
                      type="number"
                      dir="ltr"
                      className="form-control"
                      value={bidDeliveryDays}
                      onChange={(e) => setBidDeliveryDays(parseInt(e.target.value) || 14)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsNewBidModalOpen(false)}>{t('common:actions.cancel')}</button>
                <button type="submit" className="btn-primary">
                  {t('tenders.btn_record_bid')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AWARD TENDER */}
      {isAwardModalOpen && selectedBidToAward && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{t('tenders.modal_award')}</h3>
              <button className="modal-close-btn" onClick={() => setIsAwardModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAwardTenderSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#15803d' }}>
                    {t('tenders.lbl_winning_bidder')} {selectedBidToAward.vendor_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {t('tenders.lbl_contract_val')} <strong className="mono bidi-ltr" dir="ltr" style={{ color: 'var(--text-main)' }}>JOD <span className="bidi-ltr" dir="ltr">{selectedBidToAward.quoted_price.toLocaleString()}</span></strong> | {t('tenders.lbl_weighted_score')} <strong><span className="bidi-ltr" dir="ltr">{selectedBidToAward.weighted_score}%</span></strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('tenders.lbl_award_just')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={awardJustification}
                    onChange={(e) => setAwardJustification(e.target.value)}
                    required
                  />
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {t('tenders.msg_perf_bond_warn')}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAwardModalOpen(false)}>{t('common:actions.cancel')}</button>
                <button type="submit" className="btn-primary">
                  {t('tenders.btn_publish_award')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TenderBidAuditingView;
