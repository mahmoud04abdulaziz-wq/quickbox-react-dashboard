import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DotsThree } from '@phosphor-icons/react';
import { useInventory } from '../context/InventoryContext';

function StockBadge({ status }) {
  const { t } = useTranslation('common');
  if (status === 'In Stock') {
    return <span className="badge ok"><span className="d"></span>{t('status.in_stock')}</span>;
  }
  if (status === 'Low Stock') {
    return <span className="badge warn"><span className="d"></span>{t('status.low_stock')}</span>;
  }
  return <span className="badge crit"><span className="d"></span>{t('status.critical')}</span>;
}

function SupplierLogo({ supplier, logo }) {
  if (logo && logo.length <= 4) {
    return (
      <span className="swatch" title={supplier} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '9px' }}>
        {logo}
      </span>
    );
  }
  const initials = supplier ? supplier.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'SUP';
  return (
    <span className="swatch" title={supplier} style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '9px' }}>
      {initials}
    </span>
  );
}

function InventoryTable({ items, categories }) {
  const { t } = useTranslation(['inventory', 'common']);
  const { inventory } = useInventory();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);

  const displayInventory = items || (categories 
    ? inventory.filter(item => categories.includes(item.category))
    : inventory);

  return (
    <div className="table-container" style={{ paddingBottom: '100px' }}>
      <table>
        <thead>
          <tr>
            <th style={{ width: '30px' }}><input type="checkbox" /></th>
            <th>{t('table.th_sku')}</th>
            <th>{t('table.th_item_name')}</th>
            <th>{t('table.th_category')}</th>
            <th>{t('table.th_stock_available')}</th>
            <th>{t('table.th_in_use')}</th>
            <th>{t('table.th_threshold')}</th>
            <th>{t('table.th_unit_cost')}</th>
            <th>{t('table.th_total_value')}</th>
            <th>{t('table.th_lead_time')}</th>
            <th>{t('table.th_status')}</th>
            <th>{t('table.th_supplier')}</th>
            <th>{t('table.th_actions')}</th>
          </tr>
        </thead>
        <tbody>
          {displayInventory.map((item) => {
            const unitCost = item.unitCost || 25.50;
            const totalValue = item.stock * unitCost;
            const leadTime = item.leadTimeDays || 3;
            const supplierName = item.supplier || 'Standard Supply Co.';

            return (
              <tr key={item.sku} style={{ position: 'relative' }}>
                <td><input type="checkbox" /></td>
                <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4b5563' }}>{item.sku}</td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.category}</td>
                <td dir="ltr" className="bidi-ltr" style={{ fontWeight: 700, fontFamily: 'monospace', color: item.stock === 0 ? '#ef4444' : item.stock <= item.threshold ? '#ca8a04' : 'inherit' }}>
                  {item.stock} {item.uom || ''}
                </td>
                <td dir="ltr" className="bidi-ltr" style={{ fontWeight: 700, fontFamily: 'monospace', color: (item.inUse || 0) > 0 ? '#3b82f6' : '#9ca3af' }}>
                  {item.inUse || 0}
                </td>
                <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace' }}>{item.threshold}</td>
                <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace' }}>${unitCost.toFixed(2)}</td>
                <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace', fontWeight: 600 }}>${totalValue.toFixed(2)}</td>
                <td dir="ltr" className="bidi-ltr" style={{ fontSize: '11px', color: '#6b7280' }}>
                  {leadTime} {leadTime > 1 ? t('table.days_other', { count: leadTime, defaultValue: 'days' }) : t('table.days_one', { count: leadTime, defaultValue: 'day' })}
                </td>
                <td>
                  <StockBadge status={item.status} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SupplierLogo supplier={supplierName} logo={item.supplierLogo} />
                    <span style={{ fontSize: '11px', color: '#374151' }}>{supplierName}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                    <span 
                      className="link-action"
                      onClick={() => navigate('/audit')}
                      title={t('table.action_view_log', { defaultValue: 'View Log' })}
                    >
                      {t('table.action_view_log', { defaultValue: 'View Log' })}
                    </span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      onClick={() => setActiveMenu(activeMenu === item.sku ? null : item.sku)}
                    >
                      <DotsThree weight="bold" size={18} color="#6b7280" />
                    </button>
                    {activeMenu === item.sku && (
                      <div style={{
                        position: 'absolute', insetInlineEnd: '0', top: '24px', background: 'white',
                        border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 100, width: '160px', overflow: 'hidden'
                      }}>
                        <button className="menu-action-btn" onClick={() => navigate('/stock')}>{t('table.action_adjust_stock', { defaultValue: 'Adjust Stock' })}</button>
                        <button className="menu-action-btn" onClick={() => navigate('/audit')}>{t('table.action_view_history', { defaultValue: 'View History' })}</button>
                        <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                        <button className="menu-action-btn" style={{ color: '#ef4444' }} onClick={() => navigate('/alerts')}>{t('table.action_reorder_item', { defaultValue: 'Reorder Item' })}</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {displayInventory.length === 0 && (
            <tr>
              <td colSpan="13" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                {t('table.empty_filter')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
