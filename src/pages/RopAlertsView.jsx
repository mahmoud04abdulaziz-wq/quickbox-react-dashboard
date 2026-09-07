import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../context/InventoryContext';
import { WarningCircle, Prohibit, Package, PaperPlaneTilt, PencilSimple } from '@phosphor-icons/react';

function RopAlertsView() {
  const { t } = useTranslation(['inventory', 'common']);
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
        <h1>{t('rop_alerts.title')}</h1>
      </div>

      {/* Alert summary */}
      <div className="metric-grid metric-grid-3">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <Prohibit size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('rop_alerts.metric_critical')}</div>
            <div dir="ltr" className="bidi-ltr metric-value" style={{ color: '#ef4444' }}>{criticalCount}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <WarningCircle size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('rop_alerts.metric_warning')}</div>
            <div dir="ltr" className="bidi-ltr metric-value" style={{ color: '#f59e0b' }}>{warningCount}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#eef2f0', color: '#22c55e' }}>
            <Package size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('rop_alerts.metric_total_alerts')}</div>
            <div dir="ltr" className="bidi-ltr metric-value">{alerts.length}</div>
          </div>
        </div>
      </div>

      {/* Auto-Drafted Reorder Request Email Frame */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          {t('rop_alerts.auto_drafted_from', { count: alerts.length })}
        </div>

        <div className="card email-frame">
          <div className="email-head">
            <div className="email-field">
              <label>{t('rop_alerts.email_to')}</label>
              <div className="val">Coastal Linen Supply Co. &mdash; orders@coastallinen.example</div>
            </div>
            <div className="email-field">
              <label>{t('rop_alerts.email_subject')}</label>
              <div className="val">{t('rop_alerts.reorder_subject_sample')}</div>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('rop_alerts.th_item')}</th>
                    <th>{t('rop_alerts.th_current_stock')}</th>
                    <th>{t('rop_alerts.th_threshold')}</th>
                    <th>{t('rop_alerts.th_qty_requested')}</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((item) => {
                    const requestedQty = Math.max(item.threshold * 2 - item.stock, 40);
                    return (
                      <tr key={item.sku}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace', color: item.stock === 0 ? '#ef4444' : '#ca8a04', fontWeight: 700 }}>
                          {item.stock} {item.uom || ''}
                        </td>
                        <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace' }}>{item.threshold} {item.uom || ''}</td>
                        <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                          {requestedQty} {item.uom || ''}
                        </td>
                      </tr>
                    );
                  })}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                        {t('rop_alerts.no_items_reorder')}
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
                {requestSent ? t('rop_alerts.btn_request_sent') : t('rop_alerts.btn_send_request')}
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsEditingDraft(!isEditingDraft)}
              >
                <PencilSimple weight="bold" size={14} /> 
                {isEditingDraft ? t('rop_alerts.btn_done_editing') : t('rop_alerts.btn_edit_draft')}
              </button>
              {requestSent && (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginInlineStart: '8px' }}>
                  {t('rop_alerts.toast_transmitted')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Item Alert Cards */}
      <h2 style={{ fontSize: '14px', marginBottom: '14px', fontWeight: 600, color: '#374151' }}>
        {t('rop_alerts.item_breakdown_title')}
      </h2>
      <div className="grid-2">
        {alerts.length === 0 ? (
          <div className="card empty-state">
            <Package size={40} color="#d1d5db" />
            <p>{t('rop_alerts.empty_alerts')}</p>
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
                  <span className={`status ${item.statusClass}`} style={{ marginInlineStart: 'auto' }}>
                    {t(`common:status.${item.status.toLowerCase().replace(/ /g, '_')}`, { defaultValue: item.status })}
                  </span>
                </div>
                <div className="alert-card-meta">
                  {t('common:labels.sku')}: <span dir="ltr" className="bidi-ltr">{item.sku}</span> &bull; {t('rop_alerts.lbl_location')}: {item.location} &bull; {t('rop_alerts.lbl_category')}: {item.category}
                </div>
                
                <div className="alert-stats">
                  <div className="alert-stat">
                    <span className="alert-stat-label">{t('rop_alerts.label_current_stock')}</span>
                    <span dir="ltr" className="bidi-ltr alert-stat-value" style={{ color: isCritical ? '#ef4444' : '#ca8a04' }}>
                      {item.stock} {item.uom}
                    </span>
                  </div>
                  <div className="alert-stat">
                    <span className="alert-stat-label">{t('rop_alerts.label_rop_threshold')}</span>
                    <span dir="ltr" className="bidi-ltr alert-stat-value">{item.threshold} {item.uom}</span>
                  </div>
                  <div className="alert-stat">
                    <span className="alert-stat-label">{t('rop_alerts.label_shortfall')}</span>
                    <span dir="ltr" className="bidi-ltr alert-stat-value" style={{ color: '#ef4444' }}>{shortfall} {item.uom}</span>
                  </div>
                </div>

                {/* Stock level bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{t('rop_alerts.label_stock_level')}</span>
                    <span dir="ltr" className="bidi-ltr" style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="stock-bar-track" style={{ height: '6px' }}>
                    <div className={`stock-bar-fill ${isCritical ? 'fill-red' : 'fill-yellow'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                
                <div className="form-actions" style={{ marginTop: 0, gap: '8px' }}>
                  <button className="btn-secondary">{t('rop_alerts.btn_dismiss')}</button>
                  <button className="btn-primary">{t('rop_alerts.btn_acknowledge')}</button>
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
