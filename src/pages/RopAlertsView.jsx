import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { WarningCircle, Prohibit, Package, PaperPlaneTilt, PencilSimple } from '@phosphor-icons/react';

function RopAlertsView() {
  const { inventory } = useInventory();
  const [requestSent, setRequestSent] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  
  const alerts = inventory.filter(item => 
    item.status === 'Low Stock' || item.status === 'Out of Stock'
  );

  const criticalCount = alerts.filter(i => i.status === 'Out of Stock').length;
  const warningCount = alerts.filter(i => i.status === 'Low Stock').length;

  const handleSendRequest = () => {
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
    }, 4000);
  };

  return (
    <>
      <div className="page-header">
        <h1>Reorder Point (ROP) Alerts</h1>
      </div>

      {/* Alert summary */}
      <div className="metric-grid metric-grid-3">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <Prohibit size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Critical (Out of Stock)</div>
            <div className="metric-value" style={{ color: '#ef4444' }}>{criticalCount}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <WarningCircle size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Warning (Low Stock)</div>
            <div className="metric-value" style={{ color: '#f59e0b' }}>{warningCount}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#eef2f0', color: '#22c55e' }}>
            <Package size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Total Alerts</div>
            <div className="metric-value">{alerts.length}</div>
          </div>
        </div>
      </div>

      {/* Auto-Drafted Reorder Request Email Frame */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Auto-drafted from {alerts.length} low-stock items
        </div>

        <div className="card email-frame">
          <div className="email-head">
            <div className="email-field">
              <label>To</label>
              <div className="val">Coastal Linen Supply Co. &mdash; orders@coastallinen.example</div>
            </div>
            <div className="email-field">
              <label>Subject</label>
              <div className="val">Reorder Request &mdash; Harborline Hotel &mdash; 30 Jul 2026</div>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Current Stock</th>
                    <th>Threshold</th>
                    <th>Qty Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((item) => {
                    const requestedQty = Math.max(item.threshold * 2 - item.stock, 40);
                    return (
                      <tr key={item.sku}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ fontFamily: 'monospace', color: item.stock === 0 ? '#ef4444' : '#ca8a04', fontWeight: 700 }}>
                          {item.stock} {item.uom || ''}
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{item.threshold} {item.uom || ''}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                          {requestedQty} {item.uom || ''}
                        </td>
                      </tr>
                    );
                  })}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                        No items currently require reordering.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleSendRequest}
              >
                <PaperPlaneTilt weight="bold" size={14} /> 
                {requestSent ? 'Request Sent!' : 'Send Request'}
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsEditingDraft(!isEditingDraft)}
              >
                <PencilSimple weight="bold" size={14} /> 
                {isEditingDraft ? 'Done Editing' : 'Edit Draft'}
              </button>
              {requestSent && (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginLeft: '8px' }}>
                  ✓ Reorder request successfully transmitted to supplier.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Item Alert Cards */}
      <h2 style={{ fontSize: '14px', marginBottom: '14px', fontWeight: 600, color: '#374151' }}>
        Low Stock Item Breakdown
      </h2>
      <div className="grid-2">
        {alerts.length === 0 ? (
          <div className="card empty-state">
            <Package size={40} color="#d1d5db" />
            <p>All stock levels are optimal. No alerts.</p>
          </div>
        ) : (
          alerts.map(item => {
            const isCritical = item.status === 'Out of Stock';
            const pct = item.threshold > 0 ? Math.round((item.stock / item.threshold) * 100) : 0;
            const shortfall = Math.max(0, item.threshold - item.stock);
            return (
              <div key={item.sku} className={`alert-card ${isCritical ? 'urgency-critical' : 'urgency-warning'}`}>
                <div className="alert-card-header">
                  {isCritical 
                    ? <Prohibit size={22} color="#ef4444" weight="bold" />
                    : <WarningCircle size={22} color="#f59e0b" weight="bold" />
                  }
                  <h3>{item.name}</h3>
                  <span className={`status ${item.statusClass}`} style={{ marginLeft: 'auto' }}>{item.status}</span>
                </div>
                <div className="alert-card-meta">
                  SKU: {item.sku} &bull; Location: {item.location} &bull; Category: {item.category}
                </div>
                
                <div className="alert-stats">
                  <div className="alert-stat">
                    <span className="alert-stat-label">Current Stock</span>
                    <span className="alert-stat-value" style={{ color: isCritical ? '#ef4444' : '#ca8a04' }}>
                      {item.stock} {item.uom}
                    </span>
                  </div>
                  <div className="alert-stat">
                    <span className="alert-stat-label">ROP Threshold</span>
                    <span className="alert-stat-value">{item.threshold} {item.uom}</span>
                  </div>
                  <div className="alert-stat">
                    <span className="alert-stat-label">Shortfall</span>
                    <span className="alert-stat-value" style={{ color: '#ef4444' }}>{shortfall} {item.uom}</span>
                  </div>
                </div>

                {/* Stock level bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>Stock Level</span>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="stock-bar-track" style={{ height: '6px' }}>
                    <div className={`stock-bar-fill ${isCritical ? 'fill-red' : 'fill-yellow'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                
                <div className="form-actions" style={{ marginTop: 0, gap: '8px' }}>
                  <button className="btn-secondary">Dismiss</button>
                  <button className="btn-primary">Acknowledge</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default RopAlertsView;
