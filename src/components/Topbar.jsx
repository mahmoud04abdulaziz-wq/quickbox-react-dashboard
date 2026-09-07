import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, ClockCounterClockwise, Bell, CaretDown } from '@phosphor-icons/react';
import { useInventory } from '../context/InventoryContext';

/**
 * Topbar Component
 * ================
 * The top navigation header. Contains:
 *   - A global search bar (left side)
 *   - A clock/history icon button (green-tinted in the mockup)
 *   - A notification bell icon button with pulsing counter badge
 *   - Language toggle button (EN / عربي)
 *   - A user profile dropdown (right side)
 */
function Topbar() {
  const { t, i18n } = useTranslation('common');
  const { inventory } = useInventory();
  const navigate = useNavigate();

  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const alertCount = inventory.filter(
    item => item.status === 'Low Stock' || item.status === 'Out of Stock'
  ).length;

  return (
    <header className="topbar">
      {/* Global Search */}
      <div className="search-container">
        <MagnifyingGlass />
        <input type="text" placeholder={t('topbar.search_placeholder')} aria-label={t('topbar.search_placeholder')} />
      </div>

      {/* Right side actions */}
      <div className="topbar-actions">
        {/* Clock/history icon - appears green-tinted in mockup */}
        <button 
          className="icon-btn topbar-icon-green" 
          title={t('topbar.audit_history')}
          aria-label={t('topbar.audit_history')}
          onClick={() => navigate('/audit')}
        >
          <ClockCounterClockwise />
        </button>
        {/* Notification bell - with pulsing alert badge */}
        <button 
          className="icon-btn topbar-icon-green" 
          title={t('topbar.alerts_tooltip', { count: alertCount })}
          aria-label={t('topbar.alerts_tooltip', { count: alertCount })}
          onClick={() => navigate('/alerts')}
          style={{ position: 'relative' }}
        >
          <Bell />
          {alertCount > 0 && (
            <span className="pulse-badge bidi-ltr" dir="ltr">
              {alertCount}
            </span>
          )}
        </button>

        {/* Language Toggle Button */}
        <button
          type="button"
          className="lang-toggle-btn"
          onClick={toggleLanguage}
          title={currentLang === 'ar' ? t('topbar.switch_to_en') : t('topbar.switch_to_ar')}
          aria-label={currentLang === 'ar' ? t('topbar.switch_to_en') : t('topbar.switch_to_ar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid #d1d5db',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#374151',
            transition: 'all 0.15s',
            marginInlineStart: '4px'
          }}
        >
          <span style={{ color: currentLang === 'en' ? 'var(--primary-green, #10b981)' : '#9ca3af' }}>EN</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ color: currentLang === 'ar' ? 'var(--primary-green, #10b981)' : '#9ca3af' }}>عربي</span>
        </button>
        
        {/* User Dropdown */}
        <div className="user-dropdown">
          <img src="https://i.pravatar.cc/150?img=11" alt={t('topbar.user_name')} />
          <span>{t('topbar.user_name')}</span>
          <CaretDown />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
