import React from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from '@phosphor-icons/react';

/**
 * Filters Component
 * =================
 * Renders the interactive search bar and dropdown filters for Category (including 'Maintenance'),
 * Status, Supplier, and SKU search.
 */
function Filters({
  categoryFilter = 'All',
  setCategoryFilter,
  statusFilter = 'All',
  setStatusFilter,
  supplierFilter = 'All',
  setSupplierFilter,
  searchQuery = '',
  setSearchQuery,
  categoriesList = ['Linens', 'Toiletries', 'Paper Goods', 'Cleaning', 'F&B', 'Maintenance', 'Equipment'],
  suppliersList = ['Coastal Linen Supply Co.', 'Amman Hospitality Goods', 'Prime Paper & Packaging', 'Sunrise Beverage Distributors', 'Amman Hardware', 'Ecolab Hospitality']
}) {
  const { t } = useTranslation('common');

  return (
    <div className="filters-container">
      {/* Item Search / Filter by SKU */}
      <div className="search-filter">
        <MagnifyingGlass />
        <input 
          type="text" 
          placeholder={t('filters.search_placeholder')} 
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
        />
      </div>

      {/* Dropdown Filters */}
      <div className="dropdown-filters" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {/* Category dropdown including Maintenance */}
        <select
          className="dropdown-btn"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter && setCategoryFilter(e.target.value)}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <option value="All">{t('filters.category_all')}</option>
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status dropdown */}
        <select
          className="dropdown-btn"
          value={statusFilter}
          onChange={(e) => setStatusFilter && setStatusFilter(e.target.value)}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <option value="All">{t('filters.status_all')}</option>
          <option value="In Stock">{t('status.in_stock')}</option>
          <option value="Low Stock">{t('status.low_stock')}</option>
          <option value="Out of Stock">{t('status.out_of_stock')}</option>
        </select>

        {/* Supplier dropdown */}
        <select
          className="dropdown-btn"
          value={supplierFilter}
          onChange={(e) => setSupplierFilter && setSupplierFilter(e.target.value)}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <option value="All">{t('filters.supplier_all')}</option>
          {suppliersList.map(sup => (
            <option key={sup} value={sup}>{sup}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Filters;
