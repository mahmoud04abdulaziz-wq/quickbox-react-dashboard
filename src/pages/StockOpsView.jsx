import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../context/InventoryContext';
import { CheckCircle, MagnifyingGlass, Trash, ArrowRight, Plus, Minus } from '@phosphor-icons/react';

function StockOpsView() {
  const { t } = useTranslation(['inventory', 'common']);
  const { inventory, processBatchTransaction } = useInventory();
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Transaction State
  const [movementType, setMovementType] = useState('Receive');
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  const [referenceNo, setReferenceNo] = useState('');
  const [cart, setCart] = useState([]);

  // Item Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [addQty, setAddQty] = useState(1);

  // Find item based on typed SKU
  const matchedItem = inventory.find(i => i.sku.toLowerCase() === selectedSku.toLowerCase());

  // Handle Search Input (Auto-fill SKU if exact match, or just use as search)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // If the search exactly matches an SKU or Name, populate the SKU field
    const found = inventory.find(i => 
      i.sku.toLowerCase() === val.toLowerCase() || 
      i.name.toLowerCase() === val.toLowerCase()
    );
    if (found) {
      setSelectedSku(found.sku);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!matchedItem) return;
    const numQty = parseInt(addQty, 10) || 1;
    if (numQty <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.sku === matchedItem.sku);
      if (existing) {
        return prev.map(item => 
          item.sku === matchedItem.sku 
            ? { ...item, qty: item.qty + numQty } 
            : item
        );
      }
      return [...prev, { 
        sku: matchedItem.sku, 
        name: matchedItem.name, 
        unitCost: matchedItem.unitCost,
        qty: numQty 
      }];
    });

    // Reset selection form
    setSelectedSku('');
    setSearchQuery('');
    setAddQty(1);
  };

  const handleRemoveFromCart = (sku) => {
    setCart(prev => prev.filter(item => item.sku !== sku));
  };

  const handleUpdateQty = (sku, newQty) => {
    const qty = Math.max(1, parseInt(newQty, 10) || 1);
    setCart(prev => prev.map(item => item.sku === sku ? { ...item, qty } : item));
  };

  const handleProcessBatch = () => {
    if (cart.length === 0) return;
    
    const source = (movementType === 'Receive' || movementType === 'Return') ? referenceNo || 'Supplier/User' : warehouse;
    const destination = (movementType === 'Receive' || movementType === 'Return') ? warehouse : referenceNo || 'Consumed/User';

    processBatchTransaction(movementType, cart, source, destination);
    showToast(t('stock_ops.toast_processed', { type: movementType, count: cart.length }));
    
    // Reset transaction
    setCart([]);
    setReferenceNo('');
    setSearchQuery('');
    setSelectedSku('');
  };

  // Calculations for right panel header
  const totalItemsCount = cart.length;
  const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = cart.reduce((sum, item) => sum + (item.qty * (item.unitCost || 0)), 0);

  // Only show price columns for Receive and Issue
  const showPrice = movementType === 'Receive' || movementType === 'Issue';

  // Shared table header style
  const thStyle = { padding: '12px 16px', textAlign: 'start', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' };

  return (
    <>
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(tItem => (
            <div key={tItem.id} className="toast toast-success">
              <CheckCircle size={18} weight="bold" />
              {tItem.message}
            </div>
          ))}
        </div>
      )}

      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{t('stock_ops.title')}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Panel: Build Transaction */}
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>{t('stock_ops.create_transaction_title')}</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>{t('stock_ops.movement_type')}</label>
              <select 
                className="select input-full"
                value={movementType}
                onChange={e => setMovementType(e.target.value)}
                style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}
              >
                <option value="Receive">{t('stock_ops.movement_receive')}</option>
                <option value="Issue">{t('stock_ops.movement_issue')}</option>
                <option value="Transfer">{t('stock_ops.movement_transfer')}</option>
                <option value="Checkout">{t('stock_ops.movement_checkout')}</option>
                <option value="Return">{t('stock_ops.movement_return')}</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <select 
                  className="select input-full"
                  value={warehouse}
                  onChange={e => setWarehouse(e.target.value)}
                  style={{ fontSize: '13px' }}
                >
                  <option value="Warehouse A">Warehouse A</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Floor 1 Storage">Floor 1 Storage</option>
                </select>
              </div>
              <div>
                <input 
                  type="text" 
                  className="input input-full" 
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  placeholder={t('stock_ops.reference_no')}
                  dir="ltr"
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{t('stock_ops.add_items_title')}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{t('stock_ops.add_items_sub')}</p>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <MagnifyingGlass size={16} style={{ position: 'absolute', insetInlineStart: '12px', top: '10px', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="input input-full" 
                placeholder={t('stock_ops.search_sku_placeholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                dir="ltr"
                style={{ paddingInlineStart: '36px', paddingInlineEnd: '36px', fontSize: '13px' }}
              />
              <button 
                type="button" 
                style={{ position: 'absolute', insetInlineEnd: '12px', top: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => { setSearchQuery(''); setSelectedSku(''); }}
              >
                <Trash size={16} />
              </button>
            </div>

            <form onSubmit={handleAddToCart}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', gap: '16px', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>{t('stock_ops.label_sku')}</label>
                  <input 
                    type="text" 
                    className="input input-full" 
                    value={selectedSku}
                    onChange={e => setSelectedSku(e.target.value)}
                    placeholder={t('stock_ops.enter_sku_placeholder')}
                    dir="ltr"
                    style={{ fontSize: '13px', padding: '8px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>{t('stock_ops.label_product')}</label>
                  <div style={{ fontSize: '13px', color: matchedItem ? '#1e293b' : '#94a3b8', paddingTop: '8px', lineHeight: '1.4' }}>
                    {matchedItem ? matchedItem.name : '—'}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>{t('stock_ops.label_quantity')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'white' }}>
                    <div style={{ padding: '8px', fontSize: '12px', color: '#64748b', borderInlineEnd: '1px solid #cbd5e1' }}>{t('stock_ops.number_prefix', { defaultValue: 'Number:' })}</div>
                    <input 
                      type="number" 
                      value={addQty}
                      onChange={e => setAddQty(e.target.value)}
                      min="1"
                      dir="ltr"
                      style={{ width: '40px', border: 'none', outline: 'none', textAlign: 'center', fontSize: '13px', fontWeight: 500, padding: '0' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  style={{ 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: matchedItem ? 'pointer' : 'not-allowed',
                    opacity: matchedItem ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  disabled={!matchedItem}
                >
                  {t('stock_ops.btn_add_to_batch')} <Plus size={14} weight="bold" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel: Pending Batch */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
          
          {/* Right Panel Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                {t('stock_ops.pending_batch_title', { count: totalItemsCount })}
              </h2>
              <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                {t('stock_ops.total_qty', { count: totalUnits })}
              </div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{t('stock_ops.total_qty', { count: totalUnits })}</div>
              {showPrice && (
                <div style={{ fontSize: '13px', color: '#64748b' }}>{t('stock_ops.total_value', { amount: totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}</div>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>{t('stock_ops.th_sku')}</th>
                  <th style={thStyle}>{t('stock_ops.th_item')}</th>
                  <th style={thStyle}>{t('stock_ops.th_quantity')}</th>
                  {showPrice && (
                    <>
                      <th style={{ ...thStyle, textAlign: 'end' }}>{t('stock_ops.th_unit_price')}</th>
                      <th style={{ ...thStyle, textAlign: 'end' }}>{t('stock_ops.th_total')}</th>
                    </>
                  )}
                  {movementType === 'Return' && (
                    <th style={thStyle}>{t('stock_ops.th_condition')}</th>
                  )}
                  {movementType === 'Checkout' && (
                    <th style={thStyle}>{t('stock_ops.th_assigned_to')}</th>
                  )}
                  {movementType === 'Transfer' && (
                    <th style={thStyle}>{t('stock_ops.th_destination')}</th>
                  )}
                  <th style={{ padding: '12px 24px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={item.sku} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td dir="ltr" className="bidi-ltr" style={{ padding: '16px 24px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{idx + 1}.</span> {item.sku}
                    </td>
                    <td style={{ padding: '16px 16px', color: '#1e293b', fontWeight: 500 }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '16px 16px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQty(item.sku, item.qty - 1)}
                          style={{ padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                        >-</button>
                        <input 
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateQty(item.sku, e.target.value)}
                          dir="ltr"
                          style={{ width: '40px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px' }}
                          min="1"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQty(item.sku, item.qty + 1)}
                          style={{ padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                        >+</button>
                      </div>
                    </td>
                    {showPrice && (
                      <>
                        <td dir="ltr" className="bidi-ltr" style={{ padding: '16px 16px', textAlign: 'end', color: '#475569' }}>
                          ${(item.unitCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td dir="ltr" className="bidi-ltr" style={{ padding: '16px 16px', textAlign: 'end', color: '#1e293b', fontWeight: 600 }}>
                          ${(item.qty * (item.unitCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </>
                    )}
                    {movementType === 'Return' && (
                      <td style={{ padding: '16px 16px' }}>
                        <select 
                          value={item.condition || 'Good'}
                          onChange={(e) => setCart(prev => prev.map(c => c.sku === item.sku ? { ...c, condition: e.target.value } : c))}
                          style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }}
                        >
                          <option value="Good">{t('stock_ops.condition_good')}</option>
                          <option value="Needs Repair">{t('stock_ops.condition_needs_repair')}</option>
                          <option value="Damaged">{t('stock_ops.condition_damaged')}</option>
                        </select>
                      </td>
                    )}
                    {movementType === 'Checkout' && (
                      <td style={{ padding: '16px 16px' }}>
                        <input 
                          type="text"
                          placeholder={t('stock_ops.placeholder_staff')}
                          value={item.assignedTo || ''}
                          onChange={(e) => setCart(prev => prev.map(c => c.sku === item.sku ? { ...c, assignedTo: e.target.value } : c))}
                          style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '120px' }}
                        />
                      </td>
                    )}
                    {movementType === 'Transfer' && (
                      <td style={{ padding: '16px 16px' }}>
                        <select
                          value={item.destination || 'Floor 1 Storage'}
                          onChange={(e) => setCart(prev => prev.map(c => c.sku === item.sku ? { ...c, destination: e.target.value } : c))}
                          style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }}
                        >
                          <option value="Main Warehouse">Main Warehouse</option>
                          <option value="Floor 1 Storage">Floor 1 Storage</option>
                          <option value="Floor 2 Storage">Floor 2 Storage</option>
                          <option value="Kitchen Store">Kitchen Store</option>
                          <option value="Maintenance Room">Maintenance Room</option>
                        </select>
                      </td>
                    )}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        onClick={() => handleRemoveFromCart(item.sku)}
                        title="Remove Item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      {movementType === 'Return' 
                        ? t('stock_ops.empty_cart_return')
                        : t('stock_ops.empty_cart')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {movementType === 'Return' && (
            <div style={{ padding: '16px 24px', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
               <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>{t('stock_ops.quick_add_in_use')}</h4>
               <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {inventory.filter(i => (i.inUse || 0) > 0 && !cart.find(c => c.sku === i.sku)).map(item => (
                    <div key={item.sku} style={{ minWidth: '220px', backgroundColor: 'white', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }} title={item.name}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{t('stock_ops.in_use_label', { count: item.inUse })}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setCart(prev => [...prev, { sku: item.sku, name: item.name, unitCost: item.unitCost, qty: item.inUse, condition: 'Good' }])}
                          style={{ padding: '6px 10px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}
                          title="Add all to return batch"
                        >
                          {t('stock_ops.btn_return')}
                        </button>
                    </div>
                  ))}
                  {inventory.filter(i => (i.inUse || 0) > 0 && !cart.find(c => c.sku === i.sku)).length === 0 && (
                     <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>{t('stock_ops.no_items_in_use')}</div>
                  )}
               </div>
            </div>
          )}

          {/* Right Panel Footer */}
          <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <button 
              type="button" 
              style={{ 
                backgroundColor: cart.length > 0 ? '#0f172a' : '#cbd5e1', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={handleProcessBatch}
              disabled={cart.length === 0}
            >
              {t('stock_ops.btn_process_batch', { count: totalUnits })} <ArrowRight size={16} weight="bold" className="icon-rtl-flip" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default StockOpsView;
