import React, { useState, useMemo } from 'react';
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Accounts Receivable (AR)</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / sales invoicing & collections
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Sales Order Linked
          </span>
          <span className="badge ok">
            <span className="d"></span> 5% Statutory VAT Auto-Calculated
          </span>
        </div>
      </div>

      {/* F5. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Outstanding AR</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.totalAR || 84120).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="metric-delta">{(invoices || []).filter(i => i.status !== 'PAID').length || 18} unpaid invoices</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Collected (MTD)</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$112,450</div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>+14.8% MoM</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Overdue</span>
            <div className="metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <WarningCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$12,400</div>
          <div className="metric-delta" style={{ color: '#dc2626', fontWeight: 600 }}>4 invoices &gt; 30 days</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Uninvoiced Orders</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">$24,800</div>
          <div className="metric-delta">6 dispatched SOs</div>
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
            <option value="ALL">All Invoices ({(invoices || []).length})</option>
            <option value="READY">Ready from SO</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Sent / Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            onClick={handleGenerateDeliveredOrders}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={14} weight="bold" />
            <span>Generate from Delivered Orders</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} weight="bold" />
            <span>+ Create Invoice</span>
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
              <th>Invoice #</th>
              <th>SO / Booking Ref</th>
              <th>Customer</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Action</th>
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
                  <td className="mono cell-strong">{inv.invoice_number || inv.invoice_id}</td>
                  <td className="mono">{inv.so_reference || 'Booking #2319'}</td>
                  <td>{inv.customer_name}</td>
                  <td className="mono">{inv.due_date}</td>
                  <td className="mono cell-strong">
                    ${(inv.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="mono" style={{ color: isPaid ? 'var(--text-muted)' : '#b91c1c', fontWeight: 600 }}>
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
                        Receive Pay
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>Collected</span>
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
              <div className="modal-title">Record AR Customer Collection</div>
              <button className="modal-close-btn" onClick={() => setIsRecordPayModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px' }}>Customer: <b>{activeInvoice.customer_name}</b></div>
                <div style={{ fontSize: '12px' }}>Invoice Ref: <b className="mono">{activeInvoice.invoice_number || activeInvoice.invoice_id}</b></div>
                <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600, marginTop: '4px' }}>
                  Balance Due: ${(activeInvoice.balance_due || activeInvoice.total_amount).toFixed(2)}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Receipt Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeInvoice.balance_due || activeInvoice.total_amount}
                  className="input input-full mono"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Deposit To Bank Account</label>
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
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Receipt &amp; Post to Cash GL
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
              <div className="modal-title">Generate Customer Sales Invoice</div>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Customer</label>
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
                  <label className="form-label">Payment Terms</label>
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
                <label className="form-label">Sales Order / Room Booking Ref</label>
                <input
                  className="input input-full"
                  value={newSoRef}
                  onChange={(e) => setNewSoRef(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Taxable Subtotal ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
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
                  <label className="form-label">Output 5% VAT ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-full mono"
                    value={newTax}
                    onChange={(e) => setNewTax(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px' }}>
                <span>Invoice Gross Total:</span>
                <span className="mono">${((parseFloat(newSubtotal) || 0) + (parseFloat(newTax) || 0)).toFixed(2)}</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Sales Invoice &amp; Recognize Revenue
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
