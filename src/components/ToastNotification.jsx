import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WarningCircle, X } from '@phosphor-icons/react';
import { useInventory } from '../context/InventoryContext';

/**
 * ToastNotification Component
 * ===========================
 * Top-right floating toast notification overlay system for low-stock items.
 * Renders warning alert, details on items below threshold, and direct navigation to ROP Alerts.
 */
function ToastNotification() {
  const { t } = useTranslation('common');
  const { inventory } = useInventory();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const lowStockItems = inventory.filter(
    item => item.status === 'Low Stock' || item.status === 'Out of Stock'
  );

  if (dismissed || lowStockItems.length === 0) {
    return null;
  }

  const criticalCount = lowStockItems.filter(i => i.status === 'Out of Stock').length;

  return (
    <div className="floating-toast-overlay">
      <div className="floating-toast-card" role="alert" aria-live="polite">
        <div style={{ color: '#f59e0b', marginTop: '2px', position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
          <WarningCircle size={20} weight="fill" />
          <span className="pulse-badge bidi-ltr" dir="ltr">
            {lowStockItems.length}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '12px', color: '#111827' }}>
              {t('toast.low_stock_title', { count: lowStockItems.length })}
            </span>
            <button
              onClick={() => setDismissed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
              aria-label={t('toast.close')}
            >
              <X size={14} weight="bold" />
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#4b5563', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            {criticalCount > 0 
              ? t('toast.critical_description', { criticalCount, lowCount: lowStockItems.length - criticalCount })
              : t('toast.threshold_description', { count: lowStockItems.length })}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-primary"
              style={{ padding: '4px 12px', fontSize: '10px' }}
              onClick={() => {
                setDismissed(true);
                navigate('/alerts');
              }}
            >
              {t('toast.view_items')}
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '10px' }}
              onClick={() => setDismissed(true)}
            >
              {t('toast.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToastNotification;
