import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadSimple, ArrowUp, ArrowDown, ArrowsLeftRight, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useInventory } from '../context/InventoryContext';

function ActionBadge({ type }) {
  const { t } = useTranslation(['inventory', 'common']);
  let badgeClass = 'status';
  if (type === 'Receive' || type === 'Return') badgeClass += ' in-stock';
  else if (type === 'Issue' || type === 'Checkout') badgeClass += ' out-stock';
  else if (type === 'Transfer') badgeClass += ' low-stock';

  return <span className={badgeClass}>{t(`stock_ops.movement_${type.toLowerCase()}`, { defaultValue: type })}</span>;
}

function ActionIcon({ type }) {
  const iconMap = {
    Receive: { Icon: ArrowDown, bg: '#dcfce7', color: '#16a34a' },
    Return: { Icon: ArrowDown, bg: '#dbeafe', color: '#2563eb' },
    Issue: { Icon: ArrowUp, bg: '#ffedd5', color: '#ea580c' },
    Checkout: { Icon: ArrowUp, bg: '#fef3c7', color: '#d97706' },
    Transfer: { Icon: ArrowsLeftRight, bg: '#e0e7ff', color: '#4f46e5' },
  };
  const { Icon, bg, color } = iconMap[type] || iconMap.Receive;
  return (
    <div className="activity-icon" style={{ backgroundColor: bg, color, width: '24px', height: '24px' }}>
      <Icon size={12} weight="bold" />
    </div>
  );
}

// Collapsible Row Component for Batch Items
function TransactionRow({ log }) {
  const { t } = useTranslation(['inventory', 'common']);
  const [expanded, setExpanded] = useState(false);
  const staffInitials = log.staff ? log.staff.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST';
  const locationDisplay = log.to ? log.to : log.from ? log.from : 'Main Warehouse';

  // Calculate total items in this batch
  const totalItemsCount = log.items ? log.items.reduce((sum, item) => sum + item.qty, 0) : 0;
  const uniqueSkus = log.items ? log.items.length : 0;

  return (
    <>
      <tr style={{ cursor: 'pointer', backgroundColor: expanded ? '#f9fafb' : 'transparent' }} onClick={() => setExpanded(!expanded)}>
        <td dir="ltr" className="bidi-ltr" style={{ fontFamily: 'monospace', color: '#4b5563' }}>
          <div>{log.id}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{log.date}</div>
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ActionIcon type={log.type} />
            <ActionBadge type={log.type} />
          </div>
        </td>
        <td style={{ color: '#374151' }}>{locationDisplay}</td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="avatar-sm">{staffInitials}</span>
            <span style={{ fontWeight: 500 }}>{log.staff}</span>
          </div>
        </td>
        <td dir="ltr" className="bidi-ltr" style={{ fontWeight: 600 }}>
          {t('audit.skus_count', { count: uniqueSkus })}
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal' }}>
            {t('audit.units_count', { count: totalItemsCount })}
          </div>
        </td>
        <td style={{ textAlign: 'end', color: '#9ca3af' }}>
          {expanded ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
        </td>
      </tr>
      
      {/* Expanded Sub-table */}
      {expanded && (
        <tr style={{ backgroundColor: '#f9fafb' }}>
          <td colSpan="6" style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('audit.items_involved', { id: log.id })}
              </div>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '4px 8px', borderBottom: '1px solid #e5e7eb', color: '#9ca3af', fontWeight: 500 }}>{t('stock_ops.th_sku')}</th>
                    <th style={{ padding: '4px 8px', borderBottom: '1px solid #e5e7eb', color: '#9ca3af', fontWeight: 500 }}>{t('stock_ops.th_item')}</th>
                    <th style={{ padding: '4px 8px', borderBottom: '1px solid #e5e7eb', color: '#9ca3af', fontWeight: 500, textAlign: 'end' }}>{t('audit.th_qty_changed')}</th>
                  </tr>
                </thead>
                <tbody>
                  {log.items && log.items.map((item, idx) => (
                    <tr key={idx}>
                      <td dir="ltr" className="bidi-ltr" style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#4b5563' }}>{item.sku}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 500 }}>{item.name}</td>
                      <td dir="ltr" className="bidi-ltr" style={{ 
                        padding: '6px 8px', 
                        textAlign: 'end', 
                        fontWeight: 600, 
                        fontFamily: 'monospace',
                        color: (log.type === 'Receive' || log.type === 'Return') ? '#16a34a' : ((log.type === 'Issue' || log.type === 'Checkout') ? '#ea580c' : '#4f46e5')
                      }}>
                        {(log.type === 'Receive' || log.type === 'Return') ? '+' : ((log.type === 'Issue' || log.type === 'Checkout') ? '-' : '')}{item.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function AuditLogsView() {
  const { t } = useTranslation(['inventory', 'common']);
  const { logs } = useInventory();
  const [filterAction, setFilterAction] = useState('All');
  const [filterStaff, setFilterStaff] = useState('All');
  const [filterDate, setFilterDate] = useState('Last 30 Days');
  const [searchTerm, setSearchTerm] = useState('');

  const staffList = [...new Set(logs.map(l => l.staff).filter(Boolean))];

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'All' || log.type === filterAction;
    const matchesStaff = filterStaff === 'All' || log.staff === filterStaff;
    const locationStr = `${log.from || ''} ${log.to || ''}`;
    
    // Search within batch items as well
    const itemsMatch = log.items ? log.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase())) : false;
    
    const matchesSearch = searchTerm === '' || 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locationStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemsMatch;
      
    return matchesAction && matchesStaff && matchesSearch;
  });

  const receiveCount = logs.filter(l => l.type === 'Receive').length;
  const issueCount = logs.filter(l => l.type === 'Issue').length;
  const transferCount = logs.filter(l => l.type === 'Transfer').length;

  const handleExportCSV = () => {
    // Export one row per ITEM in the transaction so it's parsable by excel easily
    const headers = ['Transaction ID', 'Timestamp', 'Action', 'Location/Department', 'Staff', 'SKU', 'Item Name', 'Qty'];
    let rows = [];
    
    filteredLogs.forEach(log => {
      if (log.items && log.items.length > 0) {
        log.items.forEach(item => {
          rows.push([
            `"${log.id}"`,
            `"${log.date}"`,
            `"${log.type}"`,
            `"${log.to || log.from || 'Main Store'}"`,
            `"${log.staff}"`,
            `"${item.sku}"`,
            `"${item.name}"`,
            `"${item.qty}"`
          ]);
        });
      }
    });

    const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="page-header">
        <h1>{t('audit.title')}</h1>
        <button 
          className="btn-primary" 
          onClick={handleExportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <DownloadSimple weight="bold" /> {t('audit.btn_export_csv')}
        </button>
      </div>

      <div className="metric-grid metric-grid-4">
        <div className="metric-card">
          <div>
            <div className="metric-label">{t('audit.total_batches')}</div>
            <div className="metric-value bidi-ltr" dir="ltr">{logs.length}</div>
          </div>
        </div>
        <div 
          className="metric-card" 
          style={{ cursor: 'pointer', opacity: filterAction === 'Receive' ? 1 : 0.7 }} 
          onClick={() => setFilterAction(filterAction === 'Receive' ? 'All' : 'Receive')}
        >
          <div className="activity-icon receive" style={{ width: '32px', height: '32px' }}>
            <ArrowDown size={16} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('audit.received')}</div>
            <div className="metric-value bidi-ltr" dir="ltr" style={{ color: '#16a34a' }}>{receiveCount}</div>
          </div>
        </div>
        <div 
          className="metric-card" 
          style={{ cursor: 'pointer', opacity: filterAction === 'Issue' ? 1 : 0.7 }} 
          onClick={() => setFilterAction(filterAction === 'Issue' ? 'All' : 'Issue')}
        >
          <div className="activity-icon issue" style={{ width: '32px', height: '32px' }}>
            <ArrowUp size={16} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('audit.issued')}</div>
            <div className="metric-value bidi-ltr" dir="ltr" style={{ color: '#ea580c' }}>{issueCount}</div>
          </div>
        </div>
        <div 
          className="metric-card" 
          style={{ cursor: 'pointer', opacity: filterAction === 'Transfer' ? 1 : 0.7 }} 
          onClick={() => setFilterAction(filterAction === 'Transfer' ? 'All' : 'Transfer')}
        >
          <div className="activity-icon transfer" style={{ width: '32px', height: '32px' }}>
            <ArrowsLeftRight size={16} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('audit.transferred')}</div>
            <div className="metric-value bidi-ltr" dir="ltr" style={{ color: '#4f46e5' }}>{transferCount}</div>
          </div>
        </div>
      </div>

      <div className="filters-container" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div className="search-filter">
          <input 
            type="text" 
            placeholder={t('audit.search_placeholder')} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="dropdown-btn" 
          style={{ height: '30px', cursor: 'pointer' }}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        >
          <option value="Last 7 Days">{t('common:filters.date_last_7')}</option>
          <option value="Last 30 Days">{t('common:filters.date_last_30')}</option>
          <option value="All Time">{t('common:filters.date_all_time')}</option>
        </select>

        <select 
          className="dropdown-btn" 
          style={{ height: '30px', cursor: 'pointer' }}
          value={filterStaff}
          onChange={e => setFilterStaff(e.target.value)}
        >
          <option value="All">{t('common:filters.staff_all')}</option>
          {staffList.map(staff => (
            <option key={staff} value={staff}>{staff}</option>
          ))}
        </select>

        <select 
          className="dropdown-btn" 
          style={{ height: '30px', cursor: 'pointer' }}
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
        >
          <option value="All">{t('common:filters.action_all')}</option>
          <option value="Receive">{t('stock_ops.movement_receive_short')}</option>
          <option value="Issue">{t('stock_ops.movement_issue_short')}</option>
          <option value="Transfer">{t('stock_ops.movement_transfer_short')}</option>
          <option value="Checkout">{t('stock_ops.movement_checkout_short')}</option>
          <option value="Return">{t('stock_ops.movement_return_short')}</option>
        </select>
      </div>

      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', paddingInlineStart: '2px' }}>
        {t('audit.showing_transactions', { filtered: filteredLogs.length, total: logs.length })}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('audit.th_tx_id_date')}</th>
              <th>{t('audit.th_action')}</th>
              <th>{t('audit.th_location_details')}</th>
              <th>{t('audit.th_staff')}</th>
              <th>{t('audit.th_batch_size')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <TransactionRow key={log.id} log={log} />
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                  {t('audit.empty_logs')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AuditLogsView;
