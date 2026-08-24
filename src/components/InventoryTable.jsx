import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotsThree } from '@phosphor-icons/react';
import { useInventory } from '../context/InventoryContext';

function StockBadge({ status }) {
  if (status === 'In Stock') {
    return <span className="badge ok"><span className="d"></span>In Stock</span>;
  }
  if (status === 'Low Stock') {
    return <span className="badge warn"><span className="d"></span>Low Stock</span>;
  }
  return <span className="badge crit"><span className="d"></span>Critical</span>;
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
            <th>SKU</th>
            <th>Item Name</th>
            <th>Category</th>
            <th>Stock (Available)</th>
            <th>In Use</th>
            <th>Threshold</th>
            <th>Unit Cost</th>
            <th>Total Value</th>
            <th>Lead Time</th>
            <th>Status</th>
            <th>Supplier</th>
            <th>Actions</th>
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
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4b5563' }}>{item.sku}</td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.category}</td>
                <td style={{ fontWeight: 700, fontFamily: 'monospace', color: item.stock === 0 ? '#ef4444' : item.stock <= item.threshold ? '#ca8a04' : 'inherit' }}>
                  {item.stock} {item.uom || ''}
                </td>
                <td style={{ fontWeight: 700, fontFamily: 'monospace', color: (item.inUse || 0) > 0 ? '#3b82f6' : '#9ca3af' }}>
                  {item.inUse || 0}
                </td>
                <td style={{ fontFamily: 'monospace' }}>{item.threshold}</td>
                <td style={{ fontFamily: 'monospace' }}>${unitCost.toFixed(2)}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>${totalValue.toFixed(2)}</td>
                <td style={{ fontSize: '11px', color: '#6b7280' }}>{leadTime} day{leadTime > 1 ? 's' : ''}</td>
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
                      title="View transaction log for this item"
                    >
                      View Log
                    </span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      onClick={() => setActiveMenu(activeMenu === item.sku ? null : item.sku)}
                    >
                      <DotsThree weight="bold" size={18} color="#6b7280" />
                    </button>
                    {activeMenu === item.sku && (
                      <div style={{
                        position: 'absolute', right: '0', top: '24px', background: 'white',
                        border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 100, width: '160px', overflow: 'hidden'
                      }}>
                        <button className="menu-action-btn" onClick={() => navigate('/stock')}>Adjust Stock</button>
                        <button className="menu-action-btn" onClick={() => navigate('/audit')}>View History</button>
                        <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                        <button className="menu-action-btn" style={{ color: '#ef4444' }} onClick={() => navigate('/alerts')}>Reorder Item</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {displayInventory.length === 0 && (
            <tr>
              <td colSpan="12" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                No items match the selected filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
