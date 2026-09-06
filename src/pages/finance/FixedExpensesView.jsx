import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  CreditCard,
  CalendarBlank,
  Truck,
  CheckCircle,
  Plus,
  Play,
  MagnifyingGlass,
  X,
  Bank,
  Check
} from '@phosphor-icons/react';

function FixedExpensesView() {
  const { t } = useTranslation(['finance', 'common']);
  const { bills, createBill, payBill, executePaymentRun, bankAccounts, parties, metrics } = useFinance();

  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedBills, setSelectedBills] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentRunModalOpen, setIsPaymentRunModalOpen] = useState(false);
  const [isPaySingleModalOpen, setIsPaySingleModalOpen] = useState(false);
  const [activeBillToPay, setActiveBillToPay] = useState(null);

  // Create Bill Form State
  const [newBillVendor, setNewBillVendor] = useState(parties && parties[0] ? parties[0].name : 'Global Linens Co.');
  const [newBillPo, setNewBillPo] = useState('PO-2026-001');
  const [newBillGrn, setNewBillGrn] = useState('GRN-2026-004');
  const [newBillSubtotal, setNewBillSubtotal] = useState(4619.05);
  const [newBillTax, setNewBillTax] = useState(230.95);
  const [newBillLanded, setNewBillLanded] = useState(150.00);
  const [newBillTerms, setNewBillTerms] = useState('Net 15');

  // Single Pay State
  const [payAmount, setPayAmount] = useState(0);
  const [payBank, setPayBank] = useState('BANK-01');

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return (bills || []).filter(b => {
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'PO') return !!b.po_reference && b.po_reference !== '—';
      if (selectedFilter === 'OPEX') return !b.po_reference || b.po_reference === '—';
      if (selectedFilter === 'LANDED') return (b.landed_costs || 0) > 0;
      if (selectedFilter === 'OVERDUE') return b.payment_status === 'OVERDUE' || (new Date(b.due_date) < new Date() && b.payment_status !== 'PAID');
      return true;
    });
  }, [bills, selectedFilter]);

  // Batch Checkbox Selection
  const toggleSelectBill = (id) => {
    setSelectedBills(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const selectAllBills = () => {
    if (selectedBills.length === filteredBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(filteredBills.map(b => b.bill_id || b.id));
    }
  };

  // Open single pay modal
  const openPayModal = (bill) => {
    setActiveBillToPay(bill);
    setPayAmount(bill.balance_due || bill.total_amount);
    setIsPaySingleModalOpen(true);
  };

  const handlePaySingle = (e) => {
    e.preventDefault();
    if (!activeBillToPay) return;
    payBill(activeBillToPay.bill_id || activeBillToPay.id, {
      amount: parseFloat(payAmount),
      bank_account_id: payBank
    });
    setIsPaySingleModalOpen(false);
    setActiveBillToPay(null);
  };

  // Execute Batch Payment Run
  const handleExecutePaymentRun = (e) => {
    e.preventDefault();
    if (selectedBills.length === 0) return;
    executePaymentRun(selectedBills, payBank);
    setSelectedBills([]);
    setIsPaymentRunModalOpen(false);
  };

  // Create Bill
  const handleCreateBill = (e) => {
    e.preventDefault();
    const vendorObj = (parties || []).find(p => p.name === newBillVendor);
    createBill({
      vendor_id: vendorObj ? vendorObj.party_id : 'PTY-00042',
      vendor_name: newBillVendor,
      po_reference: newBillPo,
      grn_reference: newBillGrn,
      subtotal_amount: parseFloat(newBillSubtotal),
      tax_amount: parseFloat(newBillTax),
      landed_costs: parseFloat(newBillLanded),
      payment_terms: newBillTerms
    });
    setIsCreateModalOpen(false);
  };

  const selectedTotal = (bills || [])
    .filter(b => selectedBills.includes(b.bill_id || b.id))
    .reduce((sum, b) => sum + (b.balance_due || 0), 0);

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('finance:accounts_payable.title', 'Accounts Payable (AP)')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }} dir="ltr">
            {t('finance:accounts_payable.breadcrumb', '/ finance / vendor liabilities & disbursements')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('finance:accounts_payable.badge_match_check', 'Automated 3-Way Match Check')}
          </span>
        </div>
      </div>

      {/* F4. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_payable.kpi_total_payable', 'Total Payable')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CreditCard size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">
            ${(metrics?.totalAP || 36890).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="metric-delta">{t('finance:accounts_payable.kpi_total_payable_delta', { count: (bills || []).filter(b => b.payment_status !== 'PAID').length || 12, defaultValue: `${(bills || []).filter(b => b.payment_status !== 'PAID').length || 12} open bills` })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_payable.kpi_due_week', 'Due This Week')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <CalendarBlank size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">$14,200</div>
          <div className="metric-delta" style={{ color: '#ca8a04', fontWeight: 600 }}>{t('finance:accounts_payable.kpi_due_week_delta', '6 disbursements')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_payable.kpi_landed_costs', 'Landed Costs (MTD)')}</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Truck size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">$4,350</div>
          <div className="metric-delta">{t('finance:accounts_payable.kpi_landed_costs_delta', 'Freight & customs')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_payable.kpi_settled', 'Settled (MTD)')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">$92,100</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>{t('finance:accounts_payable.kpi_settled_delta', '18 payments · 0 late fees')}</div>
        </div>
      </div>

      {/* Row Actions & Filter Controls */}
      <div className="row-actions">
        <div className="filters">
          <select
            className="select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="ALL">{t('finance:accounts_payable.filter_all', { count: (bills || []).length, defaultValue: `All Payables (${(bills || []).length})` })}</option>
            <option value="PO">{t('finance:accounts_payable.filter_po', 'PO-Backed Bills')}</option>
            <option value="OPEX">{t('finance:accounts_payable.filter_opex', 'Direct Opex')}</option>
            <option value="LANDED">{t('finance:accounts_payable.filter_landed', 'Landed Costs')}</option>
            <option value="OVERDUE">{t('finance:accounts_payable.filter_overdue', 'Overdue Disbursements')}</option>
          </select>

          {selectedBills.length > 0 && (
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {t('finance:accounts_payable.selected_count', { count: selectedBills.length, amount: selectedTotal.toFixed(2), defaultValue: `Selected: ${selectedBills.length} bills ($${selectedTotal.toFixed(2)})` })}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('finance:accounts_payable.btn_create_bill', 'Create Bill from PO')}</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsPaymentRunModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} weight="fill" />
            <span>{t('finance:accounts_payable.btn_execute_payment_run', 'Execute Payment Run')} {selectedBills.length > 0 ? `(${selectedBills.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Vendor Bills Data Table */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '32px' }}>
                <input
                  type="checkbox"
                  checked={selectedBills.length === filteredBills.length && filteredBills.length > 0}
                  onChange={selectAllBills}
                />
              </th>
              <th>{t('finance:accounts_payable.th_bill_ref', 'Bill Ref')}</th>
              <th>{t('finance:accounts_payable.th_vendor', 'Vendor')}</th>
              <th>{t('finance:accounts_payable.th_category', 'Category')}</th>
              <th>{t('finance:accounts_payable.th_due_date', 'Due Date')}</th>
              <th>{t('finance:accounts_payable.th_total_amount', 'Total Amount')}</th>
              <th>{t('finance:accounts_payable.th_balance_due', 'Balance Due')}</th>
              <th>{t('finance:accounts_payable.th_match_status', 'Match Status')}</th>
              <th>{t('finance:accounts_payable.th_payment_status', 'Payment Status')}</th>
              <th>{t('common:actions.action', 'Action')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => {
              const isSelected = selectedBills.includes(bill.bill_id || bill.id);
              const isPaid = bill.payment_status === 'PAID' || bill.balance_due === 0;
              const isOverdue = bill.payment_status === 'OVERDUE';
              const matchOk = bill.match_status === 'MATCHED';
              const matchPpv = bill.match_status === 'PPV_HOLD';

              return (
                <tr key={bill.bill_id || bill.id} style={{ backgroundColor: isSelected ? '#f0fdf4' : undefined }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectBill(bill.bill_id || bill.id)}
                      disabled={isPaid}
                    />
                  </td>
                  <td className="mono cell-strong bidi-ltr" dir="ltr">{bill.bill_number || bill.bill_id}</td>
                  <td>{bill.vendor_name}</td>
                  <td>
                    <span className="tag-pill">
                      {bill.po_reference ? `Inventory (13110)` : `Opex (61300)`}
                    </span>
                  </td>
                  <td className="mono bidi-ltr" dir="ltr">{bill.due_date}</td>
                  <td className="mono cell-strong bidi-ltr" dir="ltr">
                    ${(bill.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="mono bidi-ltr" dir="ltr" style={{ color: isPaid ? 'var(--text-muted)' : '#b91c1c', fontWeight: 600 }}>
                    ${(bill.balance_due !== undefined ? bill.balance_due : bill.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`badge ${matchOk ? 'ok' : matchPpv ? 'warn' : 'crit'}`}>
                      <span className="d"></span>
                      {matchOk ? '3-Way Matched' : matchPpv ? 'PPV Approved' : 'Direct Opex'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isPaid ? 'ok' : isOverdue ? 'crit' : 'warn'}`}>
                      <span className="d"></span>
                      {bill.payment_status || 'Scheduled'}
                    </span>
                  </td>
                  <td>
                    {!isPaid ? (
                      <span className="link-action" onClick={() => openPayModal(bill)}>
                        {t('finance:accounts_payable.btn_pay', 'Pay')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>{t('common:status.paid', 'Settled')}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch Payment Run Modal */}
      {isPaymentRunModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentRunModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('finance:accounts_payable.modal_payment_run_title', 'Execute AP Batch Payment Run')}</div>
              <button className="modal-close-btn" onClick={() => setIsPaymentRunModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecutePaymentRun}>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                  <span>Disbursement Queue:</span>
                  <b>{selectedBills.length > 0 ? `${selectedBills.length} Bills Selected` : 'All Open Bills'}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                  <span>Total Disbursement Amount:</span>
                  <span className="mono" style={{ color: '#15803d' }} dir="ltr">
                    ${(selectedBills.length > 0 ? selectedTotal : (metrics?.totalAP || 36890)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('finance:accounts_payable.form_disburse_from', 'Disbursement Bank Account')}</label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={payBank}
                  onChange={(e) => setPayBank(e.target.value)}
                >
                  {(bankAccounts || []).map(b => (
                    <option key={b.bank_account_id} value={b.bank_account_id}>
                      {b.bank_name} ({b.account_number}) — Available: ${b.current_book_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Payment Method</label>
                <div className="radio-group">
                  <div className="radio-opt selected">Direct Bank Wire</div>
                  <div className="radio-opt">WPS Automated</div>
                  <div className="radio-opt">Corporate Cheque</div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsPaymentRunModalOpen(false)}>
                  {t('common:actions.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('finance:accounts_payable.btn_confirm_disbursement', 'Confirm & Disburse Payments')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Single Bill Modal */}
      {isPaySingleModalOpen && activeBillToPay && (
        <div className="modal-overlay" onClick={() => setIsPaySingleModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('finance:accounts_payable.btn_pay', 'Pay Vendor Bill')} — <span dir="ltr">{activeBillToPay.bill_number || activeBillToPay.bill_id}</span></div>
              <button className="modal-close-btn" onClick={() => setIsPaySingleModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePaySingle}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{t('finance:accounts_payable.th_vendor', 'Vendor')}: <b>{activeBillToPay.vendor_name}</b></div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{t('finance:accounts_payable.th_total_amount', 'Total Amount')}: <b dir="ltr">${(activeBillToPay.total_amount || 0).toFixed(2)}</b></div>
                <div style={{ fontSize: '11.5px', color: '#b91c1c', fontWeight: 600 }}>{t('finance:accounts_payable.th_balance_due', 'Balance Due')}: <b dir="ltr">${(activeBillToPay.balance_due !== undefined ? activeBillToPay.balance_due : activeBillToPay.total_amount).toFixed(2)}</b></div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('finance:accounts_payable.th_total_amount', 'Payment Amount')} ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeBillToPay.balance_due || activeBillToPay.total_amount}
                  className="input input-full mono"
                  dir="ltr"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('finance:accounts_payable.form_disburse_from', 'From Bank Account')}</label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={payBank}
                  onChange={(e) => setPayBank(e.target.value)}
                >
                  {(bankAccounts || []).map(b => (
                    <option key={b.bank_account_id} value={b.bank_account_id}>
                      {b.bank_name} ({b.account_number}) — Balance: ${b.current_book_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsPaySingleModalOpen(false)}>
                  {t('common:actions.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('finance:accounts_payable.btn_pay', 'Post Payment & Settle AP')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('finance:accounts_payable.modal_create_bill_title', 'Create Vendor Bill from PO / GRN')}</div>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBill}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_vendor', 'Vendor')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={newBillVendor}
                    onChange={(e) => setNewBillVendor(e.target.value)}
                  >
                    {(parties || []).map(p => (
                      <option key={p.party_id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_terms', 'Payment Terms')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={newBillTerms}
                    onChange={(e) => setNewBillTerms(e.target.value)}
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('finance:matching.th_po_ref', 'PO Reference')}</label>
                  <input
                    className="input input-full"
                    dir="ltr"
                    value={newBillPo}
                    onChange={(e) => setNewBillPo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('finance:matching.th_grn_ref', 'GRN Reference')}</label>
                  <input
                    className="input input-full"
                    dir="ltr"
                    value={newBillGrn}
                    onChange={(e) => setNewBillGrn(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_subtotal', 'Subtotal Amount')} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
                    dir="ltr"
                    value={newBillSubtotal}
                    onChange={(e) => {
                      const sub = parseFloat(e.target.value) || 0;
                      setNewBillSubtotal(sub);
                      setNewBillTax(parseFloat((sub * 0.05).toFixed(2)));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_tax', 'Input VAT (5%)')} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
                    dir="ltr"
                    value={newBillTax}
                    onChange={(e) => setNewBillTax(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_landed', 'Freight & Landed Costs')} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
                    dir="ltr"
                    value={newBillLanded}
                    onChange={(e) => setNewBillLanded(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px' }}>
                <span>{t('finance:accounts_payable.th_total_amount', 'Calculated Total Bill Amount')}:</span>
                <span className="mono bidi-ltr" dir="ltr">${((parseFloat(newBillSubtotal) || 0) + (parseFloat(newBillTax) || 0) + (parseFloat(newBillLanded) || 0)).toFixed(2)}</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                  {t('common:actions.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('finance:accounts_payable.btn_create_bill', 'Create Bill from PO')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FixedExpensesView;
