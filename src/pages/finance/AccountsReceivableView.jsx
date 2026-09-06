import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinance } from '../../context/FinanceContext';
import {
  Receipt,
  CheckCircle,
  WarningCircle,
  Clock,
  Plus,
  ArrowDownLeft,
  X,
  FileText
} from '@phosphor-icons/react';

function AccountsReceivableView() {
  const { t } = useTranslation(['finance', 'common']);
  const { invoices, createInvoice, receivePayment, bankAccounts, parties, metrics } = useFinance();

  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecordPayModalOpen, setIsRecordPayModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Form State for New Invoice
  const [newCustomer, setNewCustomer] = useState(parties && parties.find(p => p.roles.includes('Customer')) ? parties.find(p => p.roles.includes('Customer')).name : 'Al-Madina Trading LLC');
  const [newSoRef, setNewSoRef] = useState('SO-2026-049');
  const [newSubtotal, setNewSubtotal] = useState(12000.00);
  const [newTax, setNewTax] = useState(600.00);
  const [newTerms, setNewTerms] = useState('Net 30');

  // Form State for Payment Receipt
  const [receiptAmount, setReceiptAmount] = useState(0);
  const [receiptBank, setReceiptBank] = useState('BANK-01');

  // Filter Invoices
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter(inv => {
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'READY') return inv.status === 'READY_SO' || inv.status === 'DRAFT';
      if (selectedFilter === 'DRAFT') return inv.status === 'DRAFT';
      if (selectedFilter === 'PENDING') return inv.status === 'ISSUED' || inv.status === 'PENDING' || inv.status === 'SENT';
      if (selectedFilter === 'PAID') return inv.status === 'PAID' || inv.balance_due === 0;
      if (selectedFilter === 'OVERDUE') return inv.status === 'OVERDUE' || (new Date(inv.due_date) < new Date() && inv.status !== 'PAID');
      return true;
    });
  }, [invoices, selectedFilter]);

  const toggleSelect = (id) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(iId => iId !== id) : [...prev, id]
    );
  };

  const handleOpenReceivePayment = (invoice) => {
    setActiveInvoice(invoice);
    setReceiptAmount(invoice.balance_due || invoice.total_amount);
    setIsRecordPayModalOpen(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!activeInvoice) return;
    receivePayment(activeInvoice.invoice_id || activeInvoice.id, {
      amount: parseFloat(receiptAmount),
      bank_account_id: receiptBank
    });
    setIsRecordPayModalOpen(false);
    setActiveInvoice(null);
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const customerObj = (parties || []).find(p => p.name === newCustomer);
    createInvoice({
      customer_id: customerObj ? customerObj.party_id : 'PTY-00101',
      customer_name: newCustomer,
      so_reference: newSoRef,
      subtotal_amount: parseFloat(newSubtotal),
      tax_amount: parseFloat(newTax),
      payment_terms: newTerms
    });
    setIsCreateModalOpen(false);
  };

  const handleGenerateDeliveredOrders = () => {
    createInvoice({
      customer_id: 'PTY-00102',
      customer_name: 'Crescent Hospitality Group',
      so_reference: 'SO-DEL-901',
      subtotal_amount: 14000.00,
      tax_amount: 700.00,
      payment_terms: 'Net 30'
    });
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('finance:accounts_receivable.title', 'Accounts Receivable (AR)')}</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }} dir="ltr">
            {t('finance:accounts_receivable.breadcrumb', '/ finance / sales invoicing & collections')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> {t('finance:accounts_receivable.badge_so_linked', 'Sales Order Linked')}
          </span>
          <span className="badge ok">
            <span className="d"></span> {t('finance:accounts_receivable.badge_vat_calc', '5% Statutory VAT Auto-Calculated')}
          </span>
        </div>
      </div>

      {/* F5. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_receivable.kpi_outstanding_ar', 'Outstanding AR')}</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">
            ${(metrics?.totalAR || 84120).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="metric-delta">{t('finance:accounts_receivable.kpi_outstanding_ar_delta', { count: (invoices || []).filter(i => i.status !== 'PAID').length || 18, defaultValue: `${(invoices || []).filter(i => i.status !== 'PAID').length || 18} unpaid invoices` })}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_receivable.kpi_collected', 'Collected (MTD)')}</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">$112,450</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>{t('finance:accounts_receivable.kpi_collected_delta', '+14.8% MoM')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_receivable.kpi_overdue', 'Overdue')}</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <WarningCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">$12,400</div>
          <div className="metric-delta" style={{ color: '#dc2626', fontWeight: 600 }}>{t('finance:accounts_receivable.kpi_overdue_delta', '4 invoices > 30 days')}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">{t('finance:accounts_receivable.kpi_dso', 'Avg Collection Period (DSO)')}</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value" dir="ltr">28d</div>
          <div className="metric-delta">{t('finance:accounts_receivable.kpi_dso_delta', 'Target < 35 days')}</div>
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
            <option value="ALL">{t('finance:accounts_receivable.filter_all', { count: (invoices || []).length, defaultValue: `All Invoices (${(invoices || []).length})` })}</option>
            <option value="READY">{t('finance:accounts_receivable.filter_ready', 'Ready from SO')}</option>
            <option value="DRAFT">{t('finance:accounts_receivable.filter_drafts', 'Drafts')}</option>
            <option value="PENDING">{t('finance:accounts_receivable.filter_pending', 'Pending Payment')}</option>
            <option value="PAID">{t('finance:accounts_receivable.filter_paid', 'Paid Invoices')}</option>
            <option value="OVERDUE">{t('finance:accounts_receivable.filter_overdue', 'Overdue Invoices')}</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            onClick={handleGenerateDeliveredOrders}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={14} weight="bold" />
            <span>{t('finance:accounts_receivable.btn_generate_so_invoices', 'Generate Invoices from Delivered Orders')}</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} weight="bold" />
            <span>{t('finance:accounts_receivable.btn_new_invoice', '+ New Tax Invoice')}</span>
          </button>
        </div>
      </div>

      {/* Accounts Receivable Table */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '32px' }}>
                <input
                  type="checkbox"
                  checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={() => setSelectedInvoices(selectedInvoices.length === filteredInvoices.length ? [] : filteredInvoices.map(i => i.invoice_id || i.id))}
                />
              </th>
              <th>{t('finance:accounts_receivable.th_invoice_number', 'Invoice #')}</th>
              <th>{t('finance:accounts_receivable.th_so_ref', 'SO / Booking Ref')}</th>
              <th>{t('finance:accounts_receivable.th_customer', 'Customer')}</th>
              <th>{t('finance:accounts_receivable.th_due_date', 'Due Date')}</th>
              <th>{t('finance:accounts_receivable.th_total_amount', 'Total Amount')}</th>
              <th>{t('finance:accounts_receivable.th_balance_due', 'Balance Due')}</th>
              <th>{t('finance:accounts_receivable.th_status', 'Status')}</th>
              <th>{t('common:actions.action', 'Action')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              const isSelected = selectedInvoices.includes(inv.invoice_id || inv.id);
              const isPaid = inv.status === 'PAID' || inv.balance_due === 0;
              const isOverdue = inv.status === 'OVERDUE';
              const isReady = inv.status === 'READY_SO';
              const badgeClass = isPaid ? 'ok' : isOverdue ? 'crit' : isReady ? 'info' : 'warn';
              const badgeText = isPaid ? 'Paid' : isOverdue ? 'Overdue' : isReady ? 'Ready from SO' : 'Pending';

              return (
                <tr key={inv.invoice_id || inv.id} style={{ backgroundColor: isSelected ? '#f0fdf4' : undefined }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(inv.invoice_id || inv.id)}
                    />
                  </td>
                  <td className="mono cell-strong" dir="ltr">{inv.invoice_number || inv.invoice_id}</td>
                  <td className="mono" dir="ltr">{inv.so_reference || 'Booking #2319'}</td>
                  <td>{inv.customer_name}</td>
                  <td className="mono" dir="ltr">{inv.due_date}</td>
                  <td className="mono cell-strong" dir="ltr">
                    ${(inv.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="mono" dir="ltr" style={{ color: isPaid ? 'var(--text-muted)' : '#b91c1c', fontWeight: 600 }}>
                    ${(inv.balance_due !== undefined ? inv.balance_due : inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`badge ${badgeClass}`}>
                      <span className="d"></span>
                      {badgeText}
                    </span>
                  </td>
                  <td>
                    {!isPaid ? (
                      <span
                        className="link-action"
                        onClick={() => handleOpenReceivePayment(inv)}
                      >
                        {t('finance:accounts_receivable.btn_record_payment', 'Record Payment')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>{t('finance:accounts_receivable.kpi_collected', 'Collected')}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Payment Collection Modal */}
      {isRecordPayModalOpen && activeInvoice && (
        <div className="modal-overlay" onClick={() => setIsRecordPayModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('finance:accounts_receivable.modal_record_payment_title', 'Record Customer Payment Receipt')}</div>
              <button className="modal-close-btn" onClick={() => setIsRecordPayModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px' }}>{t('finance:accounts_receivable.th_customer', 'Customer')}: <b>{activeInvoice.customer_name}</b></div>
                <div style={{ fontSize: '12px' }}>{t('finance:accounts_receivable.th_invoice_number', 'Invoice Ref')}: <b className="mono" dir="ltr">{activeInvoice.invoice_number || activeInvoice.invoice_id}</b></div>
                <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600, marginTop: '4px' }}>
                  {t('finance:accounts_receivable.th_balance_due', 'Balance Due')}: <span dir="ltr">${(activeInvoice.balance_due || activeInvoice.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('finance:accounts_receivable.form_receipt_amount', 'Receipt Amount ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeInvoice.balance_due || activeInvoice.total_amount}
                  className="input input-full mono"
                  dir="ltr"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('finance:accounts_receivable.form_deposit_to', 'Deposit To Bank Account')}</label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={receiptBank}
                  onChange={(e) => setReceiptBank(e.target.value)}
                >
                  {(bankAccounts || []).map(b => (
                    <option key={b.bank_account_id} value={b.bank_account_id}>
                      {b.bank_name} ({b.account_number}) — Balance: ${b.current_book_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsRecordPayModalOpen(false)}>
                  {t('common:actions.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('finance:accounts_receivable.btn_record_payment', 'Record Receipt & Post to Cash GL')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sales Invoice Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title">{t('finance:accounts_receivable.modal_new_invoice_title', 'Create New Tax Invoice')}</div>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">{t('finance:accounts_receivable.form_customer', 'Customer Name')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                  >
                    {(parties || []).filter(p => (p.roles || []).includes('Customer')).map(p => (
                      <option key={p.party_id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_terms', 'Payment Terms')}</label>
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={newTerms}
                    onChange={(e) => setNewTerms(e.target.value)}
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('finance:accounts_receivable.form_so_ref', 'Sales Order Ref')}</label>
                <input
                  className="input input-full"
                  dir="ltr"
                  value={newSoRef}
                  onChange={(e) => setNewSoRef(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_subtotal', 'Taxable Subtotal ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
                    dir="ltr"
                    value={newSubtotal}
                    onChange={(e) => {
                      const sub = parseFloat(e.target.value) || 0;
                      setNewSubtotal(sub);
                      setNewTax(parseFloat((sub * 0.05).toFixed(2)));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{t('finance:accounts_payable.form_tax', 'Output 5% VAT ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
                    dir="ltr"
                    value={newTax}
                    onChange={(e) => setNewTax(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px' }}>
                <span>{t('finance:accounts_payable.th_total_amount', 'Invoice Gross Total')}:</span>
                <span className="mono" dir="ltr">${((parseFloat(newSubtotal) || 0) + (parseFloat(newTax) || 0)).toFixed(2)}</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                  {t('common:actions.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('finance:accounts_receivable.btn_new_invoice', '+ New Tax Invoice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsReceivableView;
