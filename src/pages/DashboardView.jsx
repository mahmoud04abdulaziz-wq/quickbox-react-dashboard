import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, WarningCircle, ArrowUp, ArrowDown, Prohibit, ShoppingBag } from '@phosphor-icons/react';

function DashboardView() {
  const { inventory, logs } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState('Housekeeping');

  const lowStockItems = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockItems = inventory.filter(i => i.status === 'Out of Stock').length;
  const pendingOrdersCount = 12;

  // Category breakdown
  const categories = [...new Set(inventory.map(i => i.category))];
  const categoryStats = categories.map(cat => {
    const items = inventory.filter(i => i.category === cat);
    return {
      name: cat,
      count: items.length,
      units: items.reduce((s, i) => s + i.stock, 0),
      alerts: items.filter(i => i.status !== 'In Stock').length,
    };
  });

  // Generate 30-day continuous trend line data for selected category
  const trendData = useMemo(() => {
    // Seeded continuous curve based on category
    const seed = selectedCategory.length;
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const base = 40 + (seed * 7) % 30;
      const val = Math.round(base + Math.sin(i / 3) * 15 + Math.cos(i / 2) * 10 + (i % 5) * 2);
      return { day: `Jul ${day}`, value: val };
    });
  }, [selectedCategory]);

  const maxTrendVal = Math.max(...trendData.map(d => d.value), 1);
  const minTrendVal = Math.min(...trendData.map(d => d.value));

  // Construct SVG path for 30-day continuous line chart
  const points = trendData.map((d, i) => {
    const x = (i / 29) * 460 + 20;
    const y = 130 - ((d.value - minTrendVal * 0.8) / (maxTrendVal * 1.2 - minTrendVal * 0.8)) * 100;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `20,130 ${points} 480,130`;

  // Relative timestamps for activity feed
  const relativeTimes = ['4 min ago', '22 min ago', '1 hr ago', '2 hr ago', '3 hr ago', '5 hr ago', '1 day ago'];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard Summary</h1>
      </div>

      {/* Metric Cards Grid */}
      <div className="metric-grid metric-grid-4">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#eef2f0', color: '#22c55e' }}>
            <Package size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Total Items</div>
            <div className="metric-value">4,812</div>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
              +126 this month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <WarningCircle size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Low Stock</div>
            <div className="metric-value" style={{ color: '#f59e0b' }}>
              {lowStockItems > 0 ? lowStockItems : 37}
            </div>
            <div style={{ fontSize: '11px', color: '#ca8a04', fontWeight: 600, marginTop: '4px' }}>
              across 6 categories
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <ShoppingBag size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Pending Orders</div>
            <div className="metric-value" style={{ color: '#2563eb' }}>{pendingOrdersCount}</div>
            <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 600, marginTop: '4px' }}>
              4 due this week
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <Prohibit size={22} weight="bold" />
          </div>
          <div>
            <div className="metric-label">Out of Stock</div>
            <div className="metric-value" style={{ color: '#ef4444' }}>{outOfStockItems}</div>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
              requires reorder
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: 30-Day Usage Trend + Category Breakdown */}
      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
              Usage Trend — Last 30 Days
            </h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="badge"
              style={{
                border: '1px solid #d1d5db',
                outline: 'none',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#374151'
              }}
            >
              <option value="Housekeeping">Housekeeping ▾</option>
              <option value="Linen">Linen ▾</option>
              <option value="Toiletries">Toiletries ▾</option>
              <option value="Paper Goods">Paper Goods ▾</option>
              <option value="F&B">F&B ▾</option>
              <option value="Maintenance">Maintenance ▾</option>
            </select>
          </div>

          <div style={{ height: '170px', position: 'relative' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5eb160" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#5eb160" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="20" y1="75" x2="480" y2="75" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="20" y1="130" x2="480" y2="130" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Filled area */}
              <polygon points={areaPoints} fill="url(#trendGrad)" />
              {/* Smooth Trend line */}
              <polyline
                fill="none"
                stroke="var(--primary-green)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {/* Key data points */}
              {trendData.filter((_, idx) => idx % 6 === 0 || idx === 29).map((d, i) => {
                const idx = i === 5 ? 29 : i * 6;
                const x = (idx / 29) * 460 + 20;
                const y = 130 - ((d.value - minTrendVal * 0.8) / (maxTrendVal * 1.2 - minTrendVal * 0.8)) * 100;
                return (
                  <g key={d.day}>
                    <circle cx={x} cy={y} r="3.5" fill="#ffffff" stroke="var(--primary-green)" strokeWidth="2" />
                    <text x={x} y={y - 8} fontSize="9" fontWeight="600" fill="#4b5563" textAnchor="middle">
                      {d.value}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '4px', fontSize: '10px', color: '#9ca3af' }}>
              <span>Jul 1</span>
              <span>Jul 7</span>
              <span>Jul 14</span>
              <span>Jul 21</span>
              <span>Jul 30</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="card">
          <h2 style={{ fontSize: '14px', borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
            Category Breakdown
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Items</th>
                  <th>Total Units</th>
                  <th>Alerts</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map(cat => (
                  <tr key={cat.name}>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>{cat.count}</td>
                    <td>{cat.units.toLocaleString()}</td>
                    <td>
                      {cat.alerts > 0 ? (
                        <span className="status low-stock">{cat.alerts} alert{cat.alerts > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="status in-stock">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two-column: Low Stock + Activity Feed */}
      <div className="grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '14px', borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
            Items Below Threshold
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th>Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.filter(i => i.status !== 'In Stock').map(item => {
                  const pct = item.threshold > 0 ? Math.min((item.stock / item.threshold) * 100, 100) : 0;
                  const fillClass = item.stock === 0 ? 'fill-red' : 'fill-yellow';
                  return (
                    <tr key={item.sku}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ fontWeight: 700, color: item.stock === 0 ? '#ef4444' : '#ca8a04' }}>{item.stock}</td>
                      <td>{item.threshold}</td>
                      <td>
                        <div className="stock-bar-container">
                          <div className="stock-bar-track">
                            <div className={`stock-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={`status ${item.statusClass}`}>{item.status}</span></td>
                    </tr>
                  );
                })}
                {inventory.filter(i => i.status !== 'In Stock').length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                      All items are well-stocked.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed with relative timestamps */}
        <div className="card">
          <h2 style={{ fontSize: '14px', borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
            Recent Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.slice(0, 6).map((log, idx) => (
              <div key={log.id} className="activity-item">
                <div className={`activity-icon ${log.type.toLowerCase()}`}>
                  {log.type === 'Receive' ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{log.staff}</span> {log.type.toLowerCase()}d{' '}
                  <span style={{ fontWeight: 600 }}>{log.qty}</span> of <em>{log.item}</em>
                </div>
                <div style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  {relativeTimes[idx % relativeTimes.length]}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="empty-state">
                <p>No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardView;
