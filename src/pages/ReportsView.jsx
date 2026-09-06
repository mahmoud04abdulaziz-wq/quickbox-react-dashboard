import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../context/InventoryContext';
import { FileText, Printer, DownloadSimple, CurrencyDollar, Package, ArrowUp, ArrowDown, ArrowsLeftRight } from '@phosphor-icons/react';

function ReportsView() {
  const { t } = useTranslation(['inventory', 'common']);
  const { inventory, logs } = useInventory();
  const [activeReport, setActiveReport] = useState('valuation');

  // ── Stock Valuation Report Data ──
  const categories = [...new Set(inventory.map(i => i.category))];
  const valuationData = useMemo(() => {
    return categories.map(cat => {
      const items = inventory.filter(i => i.category === cat);
      const totalUnits = items.reduce((s, i) => s + i.stock, 0);
      const totalInUse = items.reduce((s, i) => s + (i.inUse || 0), 0);
      const totalValue = items.reduce((s, i) => s + (i.stock * (i.unitCost || 0)), 0);
      return { category: cat, skuCount: items.length, totalUnits, totalInUse, totalValue };
    });
  }, [inventory]);

  const grandTotalValue = valuationData.reduce((s, v) => s + v.totalValue, 0);
  const grandTotalUnits = valuationData.reduce((s, v) => s + v.totalUnits, 0);
  const grandTotalInUse = valuationData.reduce((s, v) => s + v.totalInUse, 0);

  // ── Movement Summary Report Data ──
  const movementSummary = useMemo(() => {
    const typeMap = {};
    logs.forEach(log => {
      if (!typeMap[log.type]) {
        typeMap[log.type] = { count: 0, totalItems: 0 };
      }
      typeMap[log.type].count += 1;
      typeMap[log.type].totalItems += (log.items || []).reduce((s, i) => s + i.qty, 0);
    });
    return Object.entries(typeMap).map(([type, data]) => ({ type, ...data }));
  }, [logs]);

  // ── Low Stock / Reorder Report Data ──
  const reorderItems = useMemo(() => {
    return inventory
      .filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock')
      .map(item => ({
        ...item,
        deficit: Math.max(0, item.threshold - item.stock),
        reorderCost: Math.max(0, item.threshold - item.stock) * (item.unitCost || 0),
      }));
  }, [inventory]);

  const totalReorderCost = reorderItems.reduce((s, i) => s + i.reorderCost, 0);

  // ── In Use Tracker Data ──
  const inUseItems = useMemo(() => {
    return inventory.filter(i => (i.inUse || 0) > 0);
  }, [inventory]);

  // ── Print handler ──
  const handlePrint = () => window.print();

  // ── Shared styles ──
  const thStyle = { padding: '12px 16px', textAlign: 'start', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' };
  const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' };
  const tabBase = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' };

  const reports = [
    { id: 'valuation', label: t('reports.tab_valuation'), icon: <CurrencyDollar size={16} /> },
    { id: 'movement', label: t('reports.tab_movement'), icon: <ArrowsLeftRight size={16} /> },
    { id: 'reorder', label: t('reports.tab_reorder'), icon: <Package size={16} /> },
    { id: 'inuse', label: t('reports.tab_inuse'), icon: <FileText size={16} /> },
  ];

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('reports.title')}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#475569' }}
          >
            <Printer size={16} /> {t('common:actions.print')}
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
          >
            <DownloadSimple size={16} weight="bold" /> {t('common:actions.export_pdf')}
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {reports.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            style={{
              ...tabBase,
              backgroundColor: activeReport === r.id ? 'white' : 'transparent',
              color: activeReport === r.id ? '#0f172a' : '#64748b',
              boxShadow: activeReport === r.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {/* ════════════ STOCK VALUATION REPORT ════════════ */}
      {activeReport === 'valuation' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{t('reports.valuation_title')}</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('reports.valuation_sub')}</p>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.total_inventory_value')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>${grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.total_units_in_stock')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{grandTotalUnits.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.currently_in_use')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{grandTotalInUse}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={thStyle}>{t('common:labels.category')}</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>SKU Count</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.total_units_in_stock')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.currently_in_use')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.total_inventory_value')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.percent_of_total')}</th>
              </tr>
            </thead>
            <tbody>
              {valuationData.map(row => (
                <tr key={row.category}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>{row.category}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace' }}>{row.skuCount}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace' }}>{row.totalUnits.toLocaleString()}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', color: row.totalInUse > 0 ? '#3b82f6' : '#9ca3af' }}>{row.totalInUse}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', fontWeight: 600 }}>${row.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ ...tdStyle, textAlign: 'end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${grandTotalValue > 0 ? (row.totalValue / grandTotalValue * 100) : 0}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '3px' }} />
                      </div>
                      <span dir="ltr" className="bidi-ltr" style={{ fontSize: '12px', fontFamily: 'monospace', color: '#475569' }}>{grandTotalValue > 0 ? (row.totalValue / grandTotalValue * 100).toFixed(1) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{t('reports.grand_total')}</td>
                <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace' }}>{inventory.length}</td>
                <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace' }}>{grandTotalUnits.toLocaleString()}</td>
                <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', color: '#3b82f6' }}>{grandTotalInUse}</td>
                <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', fontSize: '15px' }}>${grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ════════════ MOVEMENT SUMMARY REPORT ════════════ */}
      {activeReport === 'movement' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{t('reports.movement_title')}</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('reports.movement_sub')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            {movementSummary.map(m => {
              const colorMap = { Receive: '#16a34a', Issue: '#ea580c', Transfer: '#4f46e5', Checkout: '#d97706', Return: '#2563eb' };
              return (
                <div key={m.type} style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colorMap[m.type] || '#64748b' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{t(`stock_ops.movement_${m.type.toLowerCase().replace(/ \(.+\)/,'')}`, { defaultValue: m.type })}</span>
                  </div>
                  <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{m.count}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{t('reports.transactions_count', { count: m.count, units: m.totalItems })}</div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '16px' }}>{t('reports.recent_transactions')}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Transaction ID</th>
                  <th style={thStyle}>{t('common:labels.date')}</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>{t('common:labels.staff')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Items</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map(log => (
                  <tr key={log.id}>
                    <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{log.id}</td>
                    <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>{log.date}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: log.type === 'Receive' ? '#dcfce7' : log.type === 'Issue' ? '#ffedd5' : '#e0e7ff',
                        color: log.type === 'Receive' ? '#16a34a' : log.type === 'Issue' ? '#ea580c' : '#4f46e5',
                      }}>{t(`stock_ops.movement_${log.type.toLowerCase().replace(/ \(.+\)/,'')}`, { defaultValue: log.type })}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px' }}>{log.staff}</td>
                    <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace' }}>{(log.items || []).length}</td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>{log.from}</td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>{log.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════ REORDER REPORT ════════════ */}
      {activeReport === 'reorder' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{t('reports.reorder_title')}</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('reports.reorder_sub')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.items_needing_reorder')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{reorderItems.length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.total_units_to_order')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{reorderItems.reduce((s, i) => s + i.deficit, 0).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.estimated_reorder_cost')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>${totalReorderCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={thStyle}>{t('common:labels.sku')}</th>
                <th style={thStyle}>{t('common:labels.item_name')}</th>
                <th style={thStyle}>{t('common:labels.supplier')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('rop_alerts.th_current_stock')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('rop_alerts.th_threshold')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.th_units_to_order')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.th_est_cost')}</th>
                <th style={thStyle}>{t('common:labels.status')}</th>
              </tr>
            </thead>
            <tbody>
              {reorderItems.map(item => (
                <tr key={item.sku}>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{item.sku}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{item.name}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>{item.supplier}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', fontWeight: 700, color: item.stock === 0 ? '#ef4444' : '#ca8a04' }}>{item.stock}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace' }}>{item.threshold}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{item.deficit}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace' }}>${item.reorderCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>
                    <span className={`badge ${item.stock === 0 ? 'crit' : 'warn'}`}>
                      <span className="d"></span>{item.stock === 0 ? t('common:status.critical') : t('common:status.low_stock')}
                    </span>
                  </td>
                </tr>
              ))}
              {reorderItems.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('reports.empty_reorder')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════ IN USE TRACKER ════════════ */}
      {activeReport === 'inuse' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{t('reports.inuse_title')}</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('reports.inuse_sub')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.items_currently_out')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{inUseItems.length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('reports.total_units_checked_out')}</div>
              <div dir="ltr" className="bidi-ltr" style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{inUseItems.reduce((s, i) => s + (i.inUse || 0), 0)}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={thStyle}>{t('common:labels.sku')}</th>
                <th style={thStyle}>{t('common:labels.item_name')}</th>
                <th style={thStyle}>{t('common:labels.category')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.th_available')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.th_in_use')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('reports.th_total_owned')}</th>
                <th style={thStyle}>{t('common:labels.location')}</th>
              </tr>
            </thead>
            <tbody>
              {inUseItems.map(item => (
                <tr key={item.sku}>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{item.sku}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{item.name}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>{item.category}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace' }}>{item.stock}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6' }}>{item.inUse}</td>
                  <td dir="ltr" className="bidi-ltr" style={{ ...tdStyle, textAlign: 'end', fontFamily: 'monospace', fontWeight: 600 }}>{item.stock + (item.inUse || 0)}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>{item.location}</td>
                </tr>
              ))}
              {inUseItems.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('reports.empty_inuse')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ height: '40px' }} />
    </>
  );
}

export default ReportsView;
