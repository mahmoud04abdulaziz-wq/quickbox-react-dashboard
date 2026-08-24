import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { DownloadSimple, Package, WarningCircle, Prohibit, CurrencyDollar } from '@phosphor-icons/react';
import Filters from '../components/Filters';
import InventoryTable from '../components/InventoryTable';
import Pagination from '../components/Pagination';

function InventoryView() {
  const { inventory } = useInventory();
  const [activeTab, setActiveTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All', label: 'All Categories', categories: null },
    { id: 'Housekeeping', label: 'Housekeeping & Cleaning', categories: ['Linens', 'Cleaning', 'Toiletries', 'Equipment'] },
    { id: 'F&B', label: 'Food & Beverage', categories: ['F&B'] },
    { id: 'Maintenance', label: 'Maintenance & Tools', categories: ['Maintenance'] }
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

  return (
    <>
      <div className="page-header">
        <h1>Inventory Master Grid</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <DownloadSimple weight="bold" size={14} /> Export CSV
          </button>
          <button className="btn-primary">+ Add Item</button>
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
            {tab.label}
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
            <div className="metric-label">Total SKUs ({activeTab})</div>
            <div className="metric-value">{totalItems}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <WarningCircle size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Needs Attention</div>
            <div className="metric-value" style={{ color: (lowStock + outOfStock) > 0 ? '#f59e0b' : 'inherit' }}>
              {lowStock + outOfStock}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <Prohibit size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Out of Stock</div>
            <div className="metric-value" style={{ color: '#ef4444' }}>{outOfStock}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
            <CurrencyDollar size={20} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Total Inventory Value</div>
            <div className="metric-value">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
