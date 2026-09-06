import React from 'react';
import { useTranslation } from 'react-i18next';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import { DotsThree } from '@phosphor-icons/react';

function PurchaseOrdersView() {
  const { t } = useTranslation(['inventory', 'common']);
  const purchaseOrders = [
    { po: 'PO-2026-001', supplier: 'Global Linens Co.', date: '2026-08-01', items: 3, total: '$1,250.00', delivery: '2026-08-04', status: 'Delivered' },
    { po: 'PO-2026-002', supplier: 'CleanPro Solutions', date: '2026-08-04', items: 2, total: '$340.00', delivery: '2026-08-09', status: 'Pending' },
    { po: 'PO-2026-003', supplier: 'Hotel Amenities Inc.', date: '2026-08-05', items: 5, total: '$890.00', delivery: '2026-08-12', status: 'Approved' },
    { po: 'PO-2026-004', supplier: 'Premium Roasters', date: '2026-08-05', items: 1, total: '$175.00', delivery: '2026-08-07', status: 'Pending' },
    { po: 'PO-2026-005', supplier: 'Elite Equipment Ltd.', date: '2026-07-20', items: 1, total: '$2,400.00', delivery: '2026-08-03', status: 'Delivered' },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'in-stock';
      case 'Pending': return 'low-stock';
      case 'Approved': return 'checked-in';
      default: return '';
    }
  };

  // Summary cards
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Pending').length;
  const deliveredPOs = purchaseOrders.filter(p => p.status === 'Delivered').length;

  return (
    <>
      <div className="page-header">
        <h1>{t('purchase_orders.title')}</h1>
        <button className="btn-primary">{t('purchase_orders.btn_create_po')}</button>
      </div>

      {/* Quick summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{t('purchase_orders.total_pos')}</div>
          <div dir="ltr" className="bidi-ltr" style={{ fontSize: '20px', fontWeight: 700 }}>{totalPOs}</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{t('purchase_orders.pending')}</div>
          <div dir="ltr" className="bidi-ltr" style={{ fontSize: '20px', fontWeight: 700, color: '#ca8a04' }}>{pendingPOs}</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{t('purchase_orders.delivered')}</div>
          <div dir="ltr" className="bidi-ltr" style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{deliveredPOs}</div>
        </div>
      </div>

      <Filters />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /> {t('purchase_orders.th_po_number')}</th>
              <th>{t('purchase_orders.th_supplier')}</th>
              <th>{t('purchase_orders.th_order_date')}</th>
              <th>{t('purchase_orders.th_line_items')}</th>
              <th>{t('purchase_orders.th_total_amount')}</th>
              <th>{t('purchase_orders.th_expected_delivery')}</th>
              <th>{t('purchase_orders.th_status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((order) => (
              <tr key={order.po}>
                <td><input type="checkbox" /> <span dir="ltr" className="bidi-ltr">{order.po}</span></td>
                <td style={{ fontWeight: 600 }}>{order.supplier}</td>
                <td dir="ltr" className="bidi-ltr">{order.date}</td>
                <td dir="ltr" className="bidi-ltr">{order.items}</td>
                <td dir="ltr" className="bidi-ltr" style={{ fontWeight: 700 }}>{order.total}</td>
                <td dir="ltr" className="bidi-ltr">{order.delivery}</td>
                <td>
                  <span className={`status ${getStatusClass(order.status)}`}>
                    {t(`common:status.${order.status.toLowerCase()}`, { defaultValue: order.status })}
                  </span>
                </td>
                <td className="dots-cell">
                  <DotsThree weight="bold" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination />
    </>
  );
}

export default PurchaseOrdersView;
