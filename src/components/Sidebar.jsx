import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
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
        <span>{t('nav.home')}</span>
      </NavLink>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {/* Inventory Control Section */}
        <div className="nav-section">
          <span className="section-title">{t('nav.inventory_control')}</span>
          <NavLink to="/dashboard" className={getNavClass("/dashboard")}>
            <ChartLineUp />
            <span>{t('nav.dashboard')}</span>
          </NavLink>
          <NavLink to="/inventory" className={getNavClass("/inventory")}>
            <Package />
            <span>{t('nav.inventory_master')}</span>
          </NavLink>
          <NavLink to="/stock" className={getNavClass("/stock")}>
            <ArrowsLeftRight />
            <span>{t('nav.stock_operations')}</span>
          </NavLink>
          
          <NavLink to="/audit" className={getNavClass("/audit")}>
            <ClipboardText />
            <span>{t('nav.audit_logs')}</span>
          </NavLink>
          <NavLink to="/alerts" className={getNavClass("/alerts")}>
            <BellRinging />
            <span style={{ flex: 1 }}>{t('nav.rop_alerts')}</span>
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
            <span>{t('nav.reports')}</span>
          </NavLink>
        </div>

        {/* Financial Management Section */}
        <div className="nav-section">
          <span className="section-title sidebar-section-header">{t('nav.financial_management')}</span>
          
          <NavLink to="/finance/budgeting" className={getNavClass('/finance/budgeting')}>
            <TrendUp />
            <span>{t('nav.business_plan')}</span>
          </NavLink>
          
          <NavLink to="/finance/reconciliation" className={getNavClass('/finance/reconciliation')}>
            <ArrowsClockwise />
            <span>{t('nav.account_reconcile')}</span>
          </NavLink>
          
          <NavLink to="/finance/general-ledger" className={getNavClass('/finance/general-ledger')}>
            <BookOpen />
            <span>{t('nav.account_mgmt')}</span>
          </NavLink>
          
          <NavLink to="/finance/internal-controls" className={getNavClass('/finance/internal-controls')}>
            <ShieldCheck />
            <span>{t('nav.internal_controls')}</span>
          </NavLink>
          
          <NavLink to="/finance/tenders" className={getNavClass('/finance/tenders')}>
            <Gavel />
            <span>{t('nav.tender_auditing')}</span>
          </NavLink>
          
          <NavLink to="/finance/cash-flow" className={getNavClass('/finance/cash-flow')}>
            <Wallet />
            <span>{t('nav.cash_flow')}</span>
          </NavLink>
          
          <NavLink to="/finance/payroll-vat" className={getNavClass('/finance/payroll-vat')}>
            <Money />
            <span>{t('nav.payroll_taxes')}</span>
          </NavLink>
          
          <NavLink to="/finance/fixed-assets" className={getNavClass('/finance/fixed-assets')}>
            <Vault />
            <span>{t('nav.fixed_assets')}</span>
          </NavLink>
          
          <NavLink to="/finance/accounts-payable" className={getNavClass('/finance/accounts-payable')}>
            <FileText />
            <span>{t('nav.accounts_payable')}</span>
          </NavLink>
          
          <NavLink to="/finance/financial-statements" className={getNavClass('/finance/financial-statements')}>
            <PresentationChart />
            <span>{t('nav.reporting_concepts')}</span>
          </NavLink>
          
          <NavLink to="/finance/policies" className={getNavClass('/finance/policies')}>
            <Scroll />
            <span>{t('nav.corporate_policies')}</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={( {isActive} ) => isActive ? 'nav-item active' : 'nav-item'}>
          <Gear />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
