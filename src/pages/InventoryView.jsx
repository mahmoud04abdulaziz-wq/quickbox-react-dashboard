import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../context/InventoryContext';
import { DownloadSimple, Package, WarningCircle, Prohibit, CurrencyDollar } from '@phosphor-icons/react';
import Filters from '../components/Filters';
import InventoryTable from '../components/InventoryTable';
import Pagination from '../components/Pagination';

function InventoryView() {
  const { t } = useTranslation(['inventory', 'common']);
  const { inventory } = useInventory();
  const [activeTab, setActiveTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All', labelKey: 'master.tab_all', label: 'All Categories', categories: null },
    { id: 'Housekeeping', labelKey: 'master.tab_housekeeping', label: 'Housekeeping & Cleaning', categories: ['Linens', 'Cleaning', 'Toiletries', 'Equipment'] },
    { id: 'F&B', labelKey: 'master.tab_fnb', label: 'Food & Beverage', categories: ['F&B'] },
    { id: 'Maintenance', labelKey: 'master.tab_maintenance', label: 'Maintenance & Tools', categories: ['Maintenance'] }
  ];

  const activeCategories = tabs.find(t => t.id === activeTab)?.categories;
  
  // Dynamic lists for filter dropdowns
  const categoriesList = [...new Set(inventory.map(i => i.category))];
  const suppliersList = [...new Set(inventory.map(i => i.supplier).filter(Boolean))];

  // Multi-tier filtering
  const displayInventory = inventory.filter(item => {
    const matchesTab = !activeCategories || activeCategories.includes(item.category);
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSupplier = supplierFilter === 'All' || item.supplier === supplierFilter;
    const matchesSearch = searchQuery === '' || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCat && matchesStatus && matchesSupplier && matchesSearch;
  });

  // Calculate metrics for current filtered inventory
  const totalItems = displayInventory.length;
  const lowStock = displayInventory.filter(i => i.status === 'Low Stock').length;
  const outOfStock = displayInventory.filter(i => i.status === 'Out of Stock').length;
  
  // Total valuation
  const totalValue = displayInventory.reduce((sum, item) => sum + (item.stock * (item.unitCost || 25.50)), 0);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['SKU', 'Item Name', 'Category', 'Location', 'Current Stock', 'Threshold', 'Unit Cost ($)', 'Total Value ($)', 'Status', 'Supplier', 'Lead Time (Days)'];
    const rows = displayInventory.map(item => [
      `"${item.sku}"`,
      `"${item.name}"`,
      `"${item.category}"`,
      `"${item.location}"`,
      item.stock,
      item.threshold,
      (item.unitCost || 25.50).toFixed(2),
      (item.stock * (item.unitCost || 25.50)).toFixed(2),
      `"${item.status}"`,
      `"${item.supplier || 'Standard Supply Co.'}"`,
      item.leadTimeDays || 3
    ]);

    const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const currentTabLabel = currentTab ? t(currentTab.labelKey, { defaultValue: currentTab.label }) : activeTab;

  return (
    <>
      <div className="page-header">
        <h1>{t('master.title')}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <DownloadSimple weight="bold" size={14} /> {t('common:actions.export_csv', { defaultValue: t('master.btn_export_csv') })}
          </button>
          <button className="btn-primary">{t('master.btn_add_item')}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setCategoryFilter('All');
            }}
          >
            {t(tab.labelKey, { defaultValue: tab.label })}
          </button>
        ))}
      </div>

      {/* Dynamic Context Metrics */}
      <div className="metric-grid metric-grid-4">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#eef2f0', color: '#5eb160' }}>
            <Package size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('master.total_skus', { tab: currentTabLabel })}</div>
            <div className="metric-value" dir="ltr">{totalItems}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <WarningCircle size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('master.needs_attention')}</div>
            <div className="metric-value" dir="ltr" style={{ color: (lowStock + outOfStock) > 0 ? '#f59e0b' : 'inherit' }}>
              {lowStock + outOfStock}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <Prohibit size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('master.out_of_stock')}</div>
            <div className="metric-value" dir="ltr" style={{ color: '#ef4444' }}>{outOfStock}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
            <CurrencyDollar size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">{t('master.total_value')}</div>
            <div className="metric-value" dir="ltr">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <Filters 
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoriesList={categoriesList}
        suppliersList={suppliersList}
      />
      <InventoryTable items={displayInventory} />
      <Pagination />
    </>
  );
}

export default InventoryView;
