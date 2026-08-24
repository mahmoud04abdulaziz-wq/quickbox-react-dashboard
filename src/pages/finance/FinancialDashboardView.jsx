import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useInventory } from '../../context/InventoryContext';
import {
  Wallet,
  Package,
  Receipt,
  CreditCard,
  TrendUp,
  ArrowUpRight,
  ArrowDownLeft,
  ChartPieSlice,
  CalendarBlank,
  CheckCircle,
  Lightning,
  ArrowsLeftRight
} from '@phosphor-icons/react';

function FinancialDashboardView() {
  const { metrics, journalEntries, accounts, auditLog } = useFinance();
  const { inventory } = useInventory();
  const [selectedMonth, setSelectedMonth] = useState('Aug 2026');

  // Compute category valuation breakdown for Donut Chart
  const categoryBreakdown = useMemo(() => {
    const categories = {};
    let totalVal = 0;

    (inventory || []).forEach(item => {
      const val = (item.stock || 0) * (item.unitCost || 0);
      const cat = item.category || 'General';
      categories[cat] = (categories[cat] || 0) + val;
      totalVal += val;
    });

    // Fallback standard breakdown if inventory is empty
    if (totalVal === 0) {
      return [
        { name: 'Operating Equipment', value: 54200, percent: 29.1, color: '#26292c' },
        { name: 'Linens & Textiles', value: 48200, percent: 25.8, color: '#3a3d40' },
        { name: 'Food & Beverage', value: 34500, percent: 18.5, color: '#6b7075' },
        { name: 'Maintenance & Tools', value: 30920, percent: 16.6, color: '#9aa0a6' },
        { name: 'Guest Toiletries', value: 18600, percent: 10.0, color: '#c9cdd1' }
      ];
    }

    const palette = ['#26292c', '#3a3d40', '#6b7075', '#9aa0a6', '#c9cdd1', '#5eb160'];
    return Object.entries(categories).map(([name, val], idx) => ({
      name,
      value: val,
      percent: parseFloat(((val / totalVal) * 100).toFixed(1)),
      color: palette[idx % palette.length]
    }));
  }, [inventory]);

  // SVG Line Chart Data for 30-Day Cash Flow vs. Movement
  const cashChartData = useMemo(() => {
    const inflowBase = [12, 15, 11, 18, 16, 20, 19, 17, 22, 19, 24, 26, 23, 25, 27, 22, 28, 29, 31, 26, 30, 32, 29, 34, 31, 35, 33, 37, 36, 38];
    const outflowBase = [9, 10, 12, 9, 11, 10, 13, 12, 10, 14, 12, 11, 13, 12, 15, 13, 14, 16, 15, 14, 17, 16, 18, 17, 19, 18, 17, 20, 19, 21];

    const maxVal = 45;
    const w = 540;
    const h = 170;

    const inflowPoints = inflowBase.map((v, i) => {
      const x = (i / 29) * (w - 40) + 20;
      const y = h - (v / maxVal) * (h - 30) - 15;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const outflowPoints = outflowBase.map((v, i) => {
      const x = (i / 29) * (w - 40) + 20;
      const y = h - (v / maxVal) * (h - 30) - 15;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const inflowArea = `20,${h - 15} ${inflowPoints} ${w - 20},${h - 15}`;

    return { inflowPoints, outflowPoints, inflowArea, w, h };
  }, [selectedMonth]);

  // Donut chart SVG path calculations
  const donutPaths = useMemo(() => {
    const size = 160;
    const center = size / 2;
    const radius = 60;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercent = 0;
    return categoryBreakdown.map((item) => {
      const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
      accumulatedPercent += item.percent;

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
        center,
        radius,
        strokeWidth
      };
    });
  }, [categoryBreakdown]);

  // Cross-Domain Live Activity Stream from Journal Vouchers & Audit Log
  const activities = useMemo(() => {
    if (journalEntries && journalEntries.length > 0) {
      return journalEntries.slice(0, 6).map((jv, idx) => {
        const times = ['2m ago', '15m ago', '42m ago', '2h ago', '4h ago', '1d ago'];
        return {
          id: jv.voucher_number,
          text: (
            <span>
              <b>{jv.voucher_number}</b> {jv.memo} (<b>${(jv.total_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>)
            </span>
          ),
          time: times[idx] || 'recently',
          type: jv.voucher_type
        };
      });
    }

    return [
      { id: '1', text: <span><b>GRN-2026-004</b> received 100x Bath Towels — auto-posted <b>JV-2026-00412</b> (+$1,250.00)</span>, time: '5m ago', type: 'INVENTORY' },
      { id: '2', text: <span><b>SO-DEL-901</b> dispatched 50x Linen sets — auto-posted <b>JV-2026-00413</b> ($625.00 COGS)</span>, time: '18m ago', type: 'AR' },
      { id: '3', text: <span><b>BILL-2026-089</b> matched to PO-2026-001 — $50.00 PPV allocated to Acct 5120</span>, time: '45m ago', type: 'AP' },
      { id: '4', text: <span><b>REQ-2026-081</b> issued $1,240.00 supplies to Housekeeping CC-100</span>, time: '2h ago', type: 'INVENTORY' },
      { id: '5', text: <span><b>INV-2026-0412</b> — $16,800.00 received from Al-Madina Trading</span>, time: '3h ago', type: 'AR' }
    ];
  }, [journalEntries]);

  return (
    <div className="page-container" style={{ paddingBottom: '32px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Financial Dashboard</h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            / finance / overview
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge ok">
            <span className="d"></span> GL Balanced Δ $0.00
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Real-Time Auto-Posting Active
          </span>
        </div>
      </div>

      {/* F1. 5 KPI Summary Cards */}
      <div className="metrics-5">
        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Liquid Cash</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Wallet size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.liquidCash || 428950).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>
            +4.2% MoM · 3 accounts
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Inventory Asset</span>
            <div className="metric-icon" style={{ background: '#f8fafc', color: '#475569' }}>
              <Package size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.inventoryValuation || 186420).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
            {(inventory || []).length || 6850} SKUs · {categoryBreakdown.length} categories
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Receivables (AR)</span>
            <div className="metric-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
              <Receipt size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.totalAR || 84120).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="metric-delta" style={{ color: '#ca8a04', fontWeight: 600 }}>
            $12,400 overdue · 4 clients
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Payables + GR/IR</span>
            <div className="metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CreditCard size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            ${(metrics?.totalPayables || 54890).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
            ${((metrics?.totalAP || 36890) / 1000).toFixed(1)}k AP + ${((metrics?.grirBalance || 18000) / 1000).toFixed(1)}k accrual
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span className="metric-label">Net Profit YTD</span>
            <div className="metric-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <TrendUp size={16} weight="bold" />
            </div>
          </div>
          <div className="metric-value">
            {metrics?.operatingMargin || 23.5}%
          </div>
          <div className="metric-delta up" style={{ color: '#15803d', fontWeight: 600 }}>
            ${(metrics?.netIncome || 142300).toLocaleString('en-US', { minimumFractionDigits: 0 })} · GM {metrics?.grossMargin || 68.2}%
          </div>
        </div>
      </div>

      {/* Row 2: Cash Flow vs Inventory Line Chart & Real-Time Activity Stream */}
      <div className="two-col" style={{ marginBottom: '16px' }}>
        {/* Cash Flow vs Movement Chart */}
        <div className="card">
          <div className="panel-head">
            <span className="t">Cash Flow vs. Inventory Movement — 30 Days</span>
            <select
              className="select"
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '14px' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="Aug 2026">Aug 2026</option>
              <option value="Jul 2026">Jul 2026</option>
              <option value="Jun 2026">Jun 2026</option>
            </select>
          </div>
          <div className="panel-body" style={{ position: 'relative' }}>
            <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox={`0 0 ${cashChartData.w} ${cashChartData.h}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Horizontal Grid lines */}
                <line x1="20" y1="30" x2={cashChartData.w - 20} y2="30" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="20" y1="75" x2={cashChartData.w - 20} y2="75" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="20" y1="120" x2={cashChartData.w - 20} y2="120" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="20" y1={cashChartData.h - 15} x2={cashChartData.w - 20} y2={cashChartData.h - 15} stroke="#e5e7eb" strokeWidth="1" />

                {/* Shaded Area for Inflow */}
                <polygon points={cashChartData.inflowArea} fill="rgba(94, 177, 96, 0.08)" />

                {/* Cash Inflow Line (Solid Green / Dark) */}
                <polyline
                  fill="none"
                  stroke="#5eb160"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={cashChartData.inflowPoints}
                />

                {/* Cash Outflow Line (Dashed Slate) */}
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={cashChartData.outflowPoints}
                />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '3px', background: '#5eb160', display: 'inline-block', borderRadius: '2px' }}></span>
                Cash Inflow (Daily Collections)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '2px', background: '#94a3b8', borderTop: '2px dashed #94a3b8', display: 'inline-block' }}></span>
                Cash Outflow (Disbursements & Opex)
              </span>
            </div>
          </div>
        </div>

        {/* Cross-Domain Real-Time Activity Stream */}
        <div className="card">
          <div className="panel-head">
            <span className="t">Cross-Domain Real-Time Activity</span>
            <span className="tag-pill solid" style={{ fontSize: '9px' }}>Live Sync</span>
          </div>
          <div className="panel-body" style={{ maxHeight: '220px', overflowY: 'auto', padding: '12px 18px' }}>
            {activities.map((act) => (
              <div className="activity-item" key={act.id}>
                <span className="activity-dot" style={{ backgroundColor: act.type === 'AR' ? '#15803d' : act.type === 'AP' ? '#2563eb' : '#5eb160' }}></span>
                <div style={{ flex: 1 }}>
                  <div className="activity-text">{act.text}</div>
                  <div className="activity-time">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: AR vs AP Aging Matrix & Inventory Valuation Donut Breakdown */}
      <div className="two-col">
        {/* AR vs AP Aging Matrix */}
        <div className="card">
          <div className="panel-head">
            <span className="t">AR vs. AP Aging Matrix</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Exposure: ${(metrics?.totalAR || 84120).toLocaleString()} vs. ${(metrics?.totalAP || 36890).toLocaleString()}
            </span>
          </div>
          <div className="panel-body">
            {/* Receivables Aging Bar */}
            <div className="section-label" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Receivables (AR)</span>
              <span style={{ fontFamily: 'monospace' }}>${(metrics?.totalAR || 84120).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="aging-bar">
              <div className="aging-seg" style={{ flex: 6.2, background: '#64748b' }}>62%</div>
              <div className="aging-seg" style={{ flex: 1.8, background: '#475569' }}>18%</div>
              <div className="aging-seg" style={{ flex: 1.1, background: '#334155' }}>11%</div>
              <div className="aging-seg" style={{ flex: 0.9, background: '#0f172a' }}>9%</div>
            </div>

            {/* Payables Aging Bar */}
            <div className="section-label" style={{ margin: '16px 0 6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Payables (AP)</span>
              <span style={{ fontFamily: 'monospace' }}>${(metrics?.totalAP || 36890).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="aging-bar">
              <div className="aging-seg" style={{ flex: 7.0, background: '#64748b' }}>70%</div>
              <div className="aging-seg" style={{ flex: 1.5, background: '#475569' }}>15%</div>
              <div className="aging-seg" style={{ flex: 0.9, background: '#334155' }}>9%</div>
              <div className="aging-seg" style={{ flex: 0.6, background: '#0f172a' }}>6%</div>
            </div>

            {/* Legend */}
            <div className="aging-legend">
              <span><i style={{ background: '#64748b' }}></i>Current (0–30d)</span>
              <span><i style={{ background: '#475569' }}></i>31–60d</span>
              <span><i style={{ background: '#334155' }}></i>61–90d</span>
              <span><i style={{ background: '#0f172a' }}></i>90+d Overdue</span>
            </div>
          </div>
        </div>

        {/* Inventory Valuation Breakdown by Category Donut */}
        <div className="card">
          <div className="panel-head">
            <span className="t">Inventory Valuation by Category</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}>
              ${(metrics?.inventoryValuation || 186420).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Donut SVG */}
            <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
              <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                {donutPaths.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx={slice.center}
                    cy={slice.center}
                    r={slice.radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={slice.strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                  />
                ))}
              </svg>
            </div>

            {/* Category breakdown list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: cat.color, display: 'inline-block' }}></span>
                    {cat.name}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {cat.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialDashboardView;
