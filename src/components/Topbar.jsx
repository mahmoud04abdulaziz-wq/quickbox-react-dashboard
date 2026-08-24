import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ClockCounterClockwise, Bell, CaretDown } from '@phosphor-icons/react';
import { useInventory } from '../context/InventoryContext';

/**
 * Topbar Component
 * ================
 * The top navigation header. Contains:
 *   - A global search bar (left side)
 *   - A clock/history icon button (green-tinted in the mockup)
 *   - A notification bell icon button with pulsing counter badge
 *   - A user profile dropdown (right side)
 */
function Topbar() {
  const { inventory } = useInventory();
  const navigate = useNavigate();

  const alertCount = inventory.filter(
    item => item.status === 'Low Stock' || item.status === 'Out of Stock'
  ).length;

  return (
    <header className="topbar">
      {/* Global Search */}
      <div className="search-container">
        <MagnifyingGlass />
        <input type="text" placeholder="Search inventory..." />
      </div>

      {/* Right side actions */}
      <div className="topbar-actions">
        {/* Clock/history icon - appears green-tinted in mockup */}
        <button 
          className="icon-btn topbar-icon-green" 
          title="Audit History"
          onClick={() => navigate('/audit')}
        >
          <ClockCounterClockwise />
        </button>
        {/* Notification bell - with pulsing alert badge */}
        <button 
          className="icon-btn topbar-icon-green" 
          title={`${alertCount} Low Stock Alerts`}
          onClick={() => navigate('/alerts')}
          style={{ position: 'relative' }}
        >
          <Bell />
          {alertCount > 0 && (
            <span className="pulse-badge">
              {alertCount}
            </span>
          )}
        </button>
        
        {/* User Dropdown */}
        <div className="user-dropdown">
          <img src="https://i.pravatar.cc/150?img=11" alt="Washim Chowdhury" />
          <span>Washim Chowdhury</span>
          <CaretDown />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
