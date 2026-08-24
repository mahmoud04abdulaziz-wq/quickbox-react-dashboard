import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  UsersThree,
  ArrowsLeftRight,
  Receipt,
  CreditCard,
  Plus,
  MagnifyingGlass,
  X,
  Buildings,
  Phone,
  Envelope
} from '@phosphor-icons/react';

function PartyDirectoryView() {
  const { parties, createParty, metrics, invoices, bills } = useFinance();

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartyProfile, setSelectedPartyProfile] = useState(null);

  // Form State for Add Party
  const [newPartyName, setNewPartyName] = useState('');
  const [newLegalName, setNewLegalName] = useState('');
  const [newRoleCustomer, setNewRoleCustomer] = useState(true);
  const [newRoleVendor, setNewRoleVendor] = useState(false);
  const [newCategory, setNewCategory] = useState('General');
  const [newTaxNumber, setNewTaxNumber] = useState('TRN-');
  const [newTerms, setNewTerms] = useState('Net 30');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Filtered Parties
  const filteredParties = useMemo(() => {
    return (parties || []).filter(p => {
      // Role filter
      if (roleFilter === 'CUSTOMER' && !(p.roles || []).includes('Customer')) return false;
      if (roleFilter === 'VENDOR' && !(p.roles || []).includes('Vendor')) return false;
      if (roleFilter === 'DUAL' && !(p.roles || []).includes('Customer') || !(p.roles || []).includes('Vendor')) {
        if (roleFilter === 'DUAL' && !((p.roles || []).includes('Customer') && (p.roles || []).includes('Vendor'))) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchLegal = (p.legal_name || '').toLowerCase().includes(q);
        const matchCode = (p.party_code || p.party_id || '').toLowerCase().includes(q);
        const matchTrn = (p.tax_number || '').toLowerCase().includes(q);
        return matchName || matchLegal || matchCode || matchTrn;
      }
      return true;
    });
  }, [parties, roleFilter, searchQuery]);

  const handleAddParty = (e) => {
    e.preventDefault();
    const roles = [];
    if (newRoleCustomer) roles.push('Customer');
    if (newRoleVendor) roles.push('Vendor');
    if (roles.length === 0) roles.push('Customer');

    createParty({
      name: newPartyName,
      legal_name: newLegalName || newPartyName,
      roles,
      category: newCategory,
      tax_number: newTaxNumber,
      payment_terms: newTerms,
      contact_email: newEmail,
      phone: newPhone
    });

    setIsAddModalOpen(false);
    setNewPartyName('');
    setNewLegalName('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Master Party Directory</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / shared counter-parties (customers &amp; vendors)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> Single Master Entity Store
          </span>
          <span className="badge ok">
            <span className="d"></span> Dual-Role AR/AP Offsetting Active
          </span>
        </div>
      </div>

      {/* F6. 4 KPI Summary Cards */}
      <div className="metrics-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Master Parties</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <UsersThree size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">128</div>
          <div className="metric-delta">Zero duplicate records</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Dual-Role</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ArrowsLeftRight size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">14</div>
          <div className="metric-delta up" style={{ color: '#2563eb', fontWeight: 600 }}>Customer &amp; Vendor</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Open AR</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.totalAR || 84120).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="metric-delta">68 active customers</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Open AP</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CreditCard size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.totalAP || 36890).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="metric-delta">46 active vendors</div>
        </div>
      </div>

      {/* Row Actions & Filter Controls */}
      <div className="row-actions">
        <div className="filters">
          <select
            className="select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Parties ({(parties || []).length})</option>
            <option value="CUSTOMER">Customers ({(parties || []).filter(p => (p.roles || []).includes('Customer')).length})</option>
            <option value="VENDOR">Vendors ({(parties || []).filter(p => (p.roles || []).includes('Vendor')).length})</option>
            <option value="DUAL">Dual-Role ({(parties || []).filter(p => (p.roles || []).includes('Customer') && (p.roles || []).includes('Vendor')).length})</option>
          </select>

          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="Search parties by name, code, TRN…"
              style={{ width: '260px', paddingLeft: '30px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlass
              size={14}
              style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} weight="bold" />
          <span>+ Add Master Party</span>
        </button>
      </div>

      {/* Unified Master Parties Table */}
      <div className="card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Party Code</th>
              <th>Legal Name</th>
              <th>Roles</th>
              <th>Payment Terms</th>
              <th>AR Balance</th>
              <th>AP Balance</th>
              <th>Net Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.map((party) => {
              const isCust = (party.roles || []).includes('Customer');
              const isVend = (party.roles || []).includes('Vendor');
              const netPos = (party.ar_balance || 0) - (party.ap_balance || 0);

              return (
                <tr key={party.party_id || party.id}>
                  <td className="mono cell-strong">{party.party_code || party.party_id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{party.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{party.legal_name}</div>
                  </td>
                  <td>
                    <div className="badge-row">
                      {isCust && <span className="tag-pill solid">Customer</span>}
                      {isVend && <span className="tag-pill">Vendor</span>}
                    </div>
                  </td>
                  <td>
                    <span className="tag-pill">{party.payment_terms || 'Net 30'}</span>
                  </td>
                  <td className="mono" style={{ color: (party.ar_balance || 0) > 0 ? '#15803d' : 'var(--text-muted)' }}>
                    ${(party.ar_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="mono" style={{ color: (party.ap_balance || 0) > 0 ? '#b91c1c' : 'var(--text-muted)' }}>
                    ${(party.ap_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="mono cell-strong" style={{ color: netPos > 0 ? '#15803d' : netPos < 0 ? '#b91c1c' : 'var(--text-muted)' }}>
                    {netPos > 0 ? `+$${netPos.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : netPos < 0 ? `-$${Math.abs(netPos).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
                  </td>
                  <td>
                    <span
                      className="link-action"
                      onClick={() => setSelectedPartyProfile(party)}
                    >
                      Profile
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 360-Degree Party Profile Drawer / Modal */}
      {selectedPartyProfile && (
        <div className="modal-overlay" onClick={() => setSelectedPartyProfile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Buildings size={18} weight="bold" />
                <span>360° Party Statement — {selectedPartyProfile.name}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPartyProfile(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              {/* Top Overview Box */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div>Legal Entity: <b>{selectedPartyProfile.legal_name}</b></div>
                  <div>Tax TRN: <b className="mono">{selectedPartyProfile.tax_number || 'TRN-100293849'}</b></div>
                  <div>Contact: {selectedPartyProfile.contact_email || 'accounts@party.example'}</div>
                  <div>Phone: {selectedPartyProfile.phone || '+1 (555) 0100'}</div>
                  <div>Default Terms: <b>{selectedPartyProfile.payment_terms}</b></div>
                  <div>Status: <span className="badge ok"><span className="d"></span>Active Master</span></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '13px' }}>
                  <div>AR Exposure: <b className="mono" style={{ color: '#15803d' }}>${(selectedPartyProfile.ar_balance || 0).toFixed(2)}</b></div>
                  <div>AP Exposure: <b className="mono" style={{ color: '#b91c1c' }}>${(selectedPartyProfile.ap_balance || 0).toFixed(2)}</b></div>
                  <div>Net Liquidity: <b className="mono">${((selectedPartyProfile.ar_balance || 0) - (selectedPartyProfile.ap_balance || 0)).toFixed(2)}</b></div>
                </div>
              </div>

              {/* Transactions Section */}
              <div className="section-label" style={{ marginBottom: '8px' }}>Active Open Ledger Items</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Doc Type</th>
                      <th>Reference #</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoices || []).filter(i => i.customer_name === selectedPartyProfile.name).map(inv => (
                      <tr key={inv.invoice_id || inv.id}>
                        <td><span className="tag-pill solid">AR Invoice</span></td>
                        <td className="mono">{inv.invoice_number || inv.invoice_id}</td>
                        <td className="mono">{inv.due_date}</td>
                        <td className="mono">${(inv.total_amount || 0).toFixed(2)}</td>
                        <td><span className="badge ok"><span className="d"></span>{inv.status}</span></td>
                      </tr>
                    ))}
                    {(bills || []).filter(b => b.vendor_name === selectedPartyProfile.name).map(b => (
                      <tr key={b.bill_id || b.id}>
                        <td><span className="tag-pill">AP Bill</span></td>
                        <td className="mono">{b.bill_number || b.bill_id}</td>
                        <td className="mono">{b.due_date}</td>
                        <td className="mono">${(b.total_amount || 0).toFixed(2)}</td>
                        <td><span className="badge ok"><span className="d"></span>{b.payment_status}</span></td>
                      </tr>
                    ))}
                    {(invoices || []).filter(i => i.customer_name === selectedPartyProfile.name).length === 0 &&
                     (bills || []).filter(b => b.vendor_name === selectedPartyProfile.name).length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                          No active open documents. All accounts settled.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedPartyProfile(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Master Party Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title">Register Master Counter-Party</div>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddParty}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Operating Trade Name</label>
                  <input
                    className="input input-full"
                    placeholder="e.g. Apex Technologies"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Legal Registered Entity</label>
                  <input
                    className="input input-full"
                    placeholder="e.g. Apex Tech LLC"
                    value={newLegalName}
                    onChange={(e) => setNewLegalName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Entity Master Roles</label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newRoleCustomer}
                      onChange={(e) => setNewRoleCustomer(e.target.checked)}
                    />
                    Customer (AR)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newRoleVendor}
                      onChange={(e) => setNewRoleVendor(e.target.checked)}
                    />
                    Vendor / Supplier (AP)
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">TRN / Tax Registration Number</label>
                  <input
                    className="input input-full mono"
                    placeholder="TRN-100485920"
                    value={newTaxNumber}
                    onChange={(e) => setNewTaxNumber(e.target.value)}
                  />
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
                    <option value="COD">COD (Cash on Delivery)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="input input-full"
                    placeholder="finance@party.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    className="input input-full"
                    placeholder="+1 (555) 0199"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Master Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartyDirectoryView;
