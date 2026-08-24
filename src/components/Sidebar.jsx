import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import {
  SlidersHorizontal,
  House,
  ChartLineUp,
  Package,
  ArrowsLeftRight,
  ClipboardText,
  BellRinging,
  ChartBar,
  Gear,
  BookOpen,
  Scales,
  Receipt,
  FileText,
  UsersThree,
  Calculator,
  Buildings,
  Vault,
  Money,
  PresentationChart,
  TrendUp,
  ArrowsClockwise,
  ShieldCheck,
  Gavel,
  Wallet,
  Scroll
} from '@phosphor-icons/react';

function Sidebar() {
  const { inventory } = useInventory();
  const location = useLocation();
  const alertCount = inventory ? inventory.filter(i => i.status !== 'In Stock').length : 0;

  const getNavClass = (to) => {
    const isActive = location.pathname + location.hash === to;
    return isActive ? 'nav-item active' : 'nav-item';
  };

  return (
    <aside className="sidebar">
      {/* App Logo */}
      <div className="sidebar-header">
        <div className="logo">
          <SlidersHorizontal weight="bold" />
          <span>fillo</span>
        </div>
      </div>

      <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item-top active' : 'nav-item-top')} end>
        <House />
        <span>Home</span>
      </NavLink>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {/* Inventory Control Section */}
        <div className="nav-section">
          <span className="section-title">Inventory Control</span>
          <NavLink to="/dashboard" className={getNavClass("/dashboard")}>
            <ChartLineUp />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/inventory" className={getNavClass("/inventory")}>
            <Package />
            <span>Inventory Master</span>
          </NavLink>
          <NavLink to="/stock" className={getNavClass("/stock")}>
            <ArrowsLeftRight />
            <span>Stock Operations</span>
          </NavLink>
          
          <NavLink to="/audit" className={getNavClass("/audit")}>
            <ClipboardText />
            <span>Audit Logs</span>
          </NavLink>
          <NavLink to="/alerts" className={getNavClass("/alerts")}>
            <BellRinging />
            <span style={{ flex: 1 }}>ROP Alerts</span>
            {alertCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '8px',
                lineHeight: '16px',
              }}>
                {alertCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/reports" className={( {isActive} ) => isActive ? 'nav-item active' : 'nav-item'}>
            <ChartBar />
            <span>Reports</span>
          </NavLink>
        </div>

        {/* Financial Management Section */}
        <div className="nav-section">
          <span className="section-title sidebar-section-header">Financial Management</span>
          
          <NavLink to="/finance/budgeting" className={getNavClass('/finance/budgeting')}>
            <TrendUp />
            <span>Business Plan</span>
          </NavLink>
          
          <NavLink to="/finance/reconciliation" className={getNavClass('/finance/reconciliation')}>
            <ArrowsClockwise />
            <span>Account Reconcile</span>
          </NavLink>
          
          <NavLink to="/finance/general-ledger" className={getNavClass('/finance/general-ledger')}>
            <BookOpen />
            <span>Account Mgmt</span>
          </NavLink>
          
          <NavLink to="/finance/internal-controls" className={getNavClass('/finance/internal-controls')}>
            <ShieldCheck />
            <span>Internal Controls</span>
          </NavLink>
          
          <NavLink to="/finance/tenders" className={getNavClass('/finance/tenders')}>
            <Gavel />
            <span>Tender Auditing</span>
          </NavLink>
          
          <NavLink to="/finance/cash-flow" className={getNavClass('/finance/cash-flow')}>
            <Wallet />
            <span>Cash Flow</span>
          </NavLink>
          
          <NavLink to="/finance/payroll-vat" className={getNavClass('/finance/payroll-vat')}>
            <Money />
            <span>Payroll &amp; Taxes</span>
          </NavLink>
          
          <NavLink to="/finance/fixed-assets" className={getNavClass('/finance/fixed-assets')}>
            <Vault />
            <span>Fixed Assets</span>
          </NavLink>
          
          <NavLink to="/finance/accounts-payable" className={getNavClass('/finance/accounts-payable')}>
            <FileText />
            <span>Accounts Payable</span>
          </NavLink>
          
          <NavLink to="/finance/financial-statements" className={getNavClass('/finance/financial-statements')}>
            <PresentationChart />
            <span>Reporting Concepts</span>
          </NavLink>
          
          <NavLink to="/finance/policies" className={getNavClass('/finance/policies')}>
            <Scroll />
            <span>Corporate Policies</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={( {isActive} ) => isActive ? 'nav-item active' : 'nav-item'}>
          <Gear />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
