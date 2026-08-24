import React, { createContext, useState, useContext } from 'react';

const InventoryContext = createContext();

const initialInventory = [
  // Linens
  { sku: 'LIN-001', name: 'Bath Towel - White', category: 'Linens', location: 'Main Warehouse', stock: 1250, inUse: 0, uom: 'Each', threshold: 500, storage: 'Dry', unitCost: 12.50, supplier: 'Global Linens Co.', leadTimeDays: 5, supplierLogo: '🧺' },
  { sku: 'LIN-002', name: 'Bed Sheet - Queen', category: 'Linens', location: 'Floor 2 Storage', stock: 45, inUse: 0, uom: 'Each', threshold: 100, storage: 'Dry', unitCost: 28.00, supplier: 'Global Linens Co.', leadTimeDays: 5, supplierLogo: '🧺' },
  { sku: 'LIN-003', name: 'Pillow Case - Standard', category: 'Linens', location: 'Main Warehouse', stock: 800, inUse: 0, uom: 'Each', threshold: 200, storage: 'Dry', unitCost: 6.50, supplier: 'Global Linens Co.', leadTimeDays: 5, supplierLogo: '🧺' },
  { sku: 'LIN-004', name: 'Bathrobe - Cotton', category: 'Linens', location: 'Floor 1 Storage', stock: 60, inUse: 0, uom: 'Each', threshold: 30, storage: 'Dry', unitCost: 45.00, supplier: 'Global Linens Co.', leadTimeDays: 7, supplierLogo: '🧺' },
  // Cleaning
  { sku: 'CLN-010', name: 'Bleach 5L', category: 'Cleaning', location: 'Maintenance Room', stock: 0, inUse: 0, uom: 'Liter', threshold: 50, storage: 'Secure', unitCost: 15.00, supplier: 'Ecolab Hospitality', leadTimeDays: 3, supplierLogo: '🧼' },
  { sku: 'CLN-011', name: 'Glass Cleaner 1L', category: 'Cleaning', location: 'Maintenance Room', stock: 24, inUse: 0, uom: 'Each', threshold: 20, storage: 'Dry', unitCost: 4.25, supplier: 'Ecolab Hospitality', leadTimeDays: 3, supplierLogo: '🧼' },
  { sku: 'CLN-012', name: 'Floor Polish 5L', category: 'Cleaning', location: 'Main Warehouse', stock: 10, inUse: 0, uom: 'Each', threshold: 15, storage: 'Secure', unitCost: 32.00, supplier: 'Ecolab Hospitality', leadTimeDays: 4, supplierLogo: '🧼' },
  // F&B
  { sku: 'FNB-100', name: 'Coffee Beans - Espresso', category: 'F&B', location: 'Kitchen Store', stock: 12, inUse: 0, uom: 'Kg', threshold: 15, storage: 'Dry', unitCost: 22.00, supplier: 'Fresh Dairy Farms', leadTimeDays: 2, supplierLogo: '🥛' },
  { sku: 'FNB-101', name: 'Milk - Whole', category: 'F&B', location: 'Kitchen Store', stock: 45, inUse: 0, uom: 'Liter', threshold: 20, storage: 'Cold', unitCost: 1.80, supplier: 'Fresh Dairy Farms', leadTimeDays: 1, supplierLogo: '🥛' },
  { sku: 'FNB-102', name: 'Sugar - White', category: 'F&B', location: 'Kitchen Store', stock: 30, inUse: 0, uom: 'Kg', threshold: 10, storage: 'Dry', unitCost: 2.50, supplier: 'Fresh Dairy Farms', leadTimeDays: 2, supplierLogo: '🥛' },
  { sku: 'FNB-103', name: 'Butter - Unsalted', category: 'F&B', location: 'Kitchen Store', stock: 8, inUse: 0, uom: 'Kg', threshold: 10, storage: 'Cold', unitCost: 8.00, supplier: 'Fresh Dairy Farms', leadTimeDays: 2, supplierLogo: '🥛' },
  // Toiletries
  { sku: 'AMN-005', name: 'Shampoo Mini 50ml', category: 'Toiletries', location: 'Floor 1 Storage', stock: 5000, inUse: 0, uom: 'Each', threshold: 1000, storage: 'Dry', unitCost: 0.45, supplier: 'Lux Amenities', leadTimeDays: 10, supplierLogo: '🧴' },
  { sku: 'AMN-006', name: 'Soap Bar', category: 'Toiletries', location: 'Floor 2 Storage', stock: 0, inUse: 0, uom: 'Each', threshold: 500, storage: 'Dry', unitCost: 0.30, supplier: 'Lux Amenities', leadTimeDays: 10, supplierLogo: '🧴' },
  { sku: 'AMN-007', name: 'Conditioner Mini 50ml', category: 'Toiletries', location: 'Floor 1 Storage', stock: 3200, inUse: 0, uom: 'Each', threshold: 800, storage: 'Dry', unitCost: 0.50, supplier: 'Lux Amenities', leadTimeDays: 10, supplierLogo: '🧴' },
  // Equipment
  { sku: 'EQP-001', name: 'Vacuum Cleaner', category: 'Equipment', location: 'Maintenance Room', stock: 4, inUse: 1, uom: 'Each', threshold: 2, storage: 'Secure', unitCost: 210.00, supplier: 'Amman Hardware', leadTimeDays: 14, supplierLogo: '🛠️' },
  { sku: 'EQP-002', name: 'Steam Iron - Industrial', category: 'Equipment', location: 'Laundry Room', stock: 3, inUse: 0, uom: 'Each', threshold: 2, storage: 'Secure', unitCost: 175.00, supplier: 'Amman Hardware', leadTimeDays: 14, supplierLogo: '🛠️' },
  // Maintenance & Tools
  { sku: 'MNT-001', name: 'Power Drill 18V', category: 'Maintenance', location: 'Main Store Room B', stock: 12, inUse: 2, uom: 'Each', threshold: 5, storage: 'Secure', unitCost: 89.99, supplier: 'Amman Hardware', leadTimeDays: 7, supplierLogo: '🛠️' },
  { sku: 'MNT-002', name: 'HVAC Air Filter 20x20', category: 'Maintenance', location: 'Floor 1 Mechanical', stock: 45, inUse: 0, uom: 'Each', threshold: 20, storage: 'Dry', unitCost: 8.50, supplier: 'Ecolab Hospitality', leadTimeDays: 3, supplierLogo: '🧼' },
  { sku: 'MNT-003', name: 'LED Bulb 10W Pack', category: 'Maintenance', location: 'Main Store Room B', stock: 8, inUse: 0, uom: 'Pack', threshold: 15, storage: 'Dry', unitCost: 14.00, supplier: 'Amman Hardware', leadTimeDays: 5, supplierLogo: '🛠️' },
  { sku: 'MNT-004', name: 'Pipe Wrench 14-inch', category: 'Maintenance', location: 'Main Store Room B', stock: 6, inUse: 1, uom: 'Each', threshold: 3, storage: 'Dry', unitCost: 24.50, supplier: 'Amman Hardware', leadTimeDays: 4, supplierLogo: '🛠️' },
];

const initialLogs = [
  { 
    id: 'TXN-995', date: '2026-08-05 10:45', type: 'Receive', staff: 'Chef A.', from: 'Fresh Dairy Farms', to: 'Kitchen Store',
    items: [
      { sku: 'FNB-101', name: 'Milk - Whole', qty: 50 },
      { sku: 'FNB-102', name: 'Sugar - White', qty: 10 }
    ]
  },
  { 
    id: 'TXN-994', date: '2026-08-05 10:20', type: 'Issue', staff: 'Aisha T.', from: 'Floor 1 Storage', to: 'Housekeeping Cart',
    items: [
      { sku: 'AMN-005', name: 'Shampoo Mini 50ml', qty: 200 },
      { sku: 'AMN-007', name: 'Conditioner Mini 50ml', qty: 200 }
    ]
  },
  { 
    id: 'TXN-993', date: '2026-08-05 09:50', type: 'Receive', staff: 'Washim', from: 'Global Linens Co.', to: 'Main Warehouse',
    items: [
      { sku: 'LIN-001', name: 'Bath Towel - White', qty: 100 },
      { sku: 'LIN-003', name: 'Pillow Case - Standard', qty: 50 }
    ]
  }
];

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [logs, setLogs] = useState(initialLogs);

  // Helper to determine status based on stock and threshold
  const getStatus = (stock, threshold) => {
    if (stock === 0) return { status: 'Out of Stock', statusClass: 'out-stock' };
    if (stock <= threshold) return { status: 'Low Stock', statusClass: 'low-stock' };
    return { status: 'In Stock', statusClass: 'in-stock' };
  };

  /**
   * processBatchTransaction
   * Handles multi-item transactions in a single batch.
   * @param {string} type - 'Receive', 'Issue', or 'Transfer'
   * @param {Array} cart - Array of objects { sku, name, qty }
   * @param {string} source - Origin of the items
   * @param {string} destination - Destination or reason
   */
  const processBatchTransaction = (type, cart, source, destination) => {
    if (!cart || cart.length === 0) return;

    // Update inventory stock levels
    setInventory(prev => prev.map(item => {
      const cartItem = cart.find(c => c.sku === item.sku);
      if (cartItem) {
        if (type === 'Receive') {
          return { ...item, stock: item.stock + cartItem.qty };
        } else if (type === 'Issue' || type === 'Transfer') {
          return { ...item, stock: Math.max(0, item.stock - cartItem.qty) };
        } else if (type === 'Checkout') {
          return { ...item, stock: Math.max(0, item.stock - cartItem.qty), inUse: (item.inUse || 0) + cartItem.qty };
        } else if (type === 'Return') {
          return { ...item, stock: item.stock + cartItem.qty, inUse: Math.max(0, (item.inUse || 0) - cartItem.qty) };
        }
      }
      return item;
    }));

    // Create a single unified transaction log
    const newTxn = {
      id: `TXN-${1000 + logs.length}`,
      date: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
      type,
      staff: 'Current User',
      from: source,
      to: destination,
      items: cart.map(c => ({ sku: c.sku, name: c.name, qty: c.qty }))
    };

    setLogs(prev => [newTxn, ...prev]);
  };

  const value = {
    inventory: inventory.map(item => ({ ...item, ...getStatus(item.stock, item.threshold) })),
    logs,
    processBatchTransaction
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
