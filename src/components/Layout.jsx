import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastNotification from './ToastNotification';

/**
 * Layout Component
 * Wraps the Sidebar, Topbar, and the dynamically routed page content (<Outlet />).
 */
function Layout() {
  const { t } = useTranslation('common');

  return (
    <div className="app-container">
      {/* Toast Notification Floating System */}
      <ToastNotification />

      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content Area on the right */}
      <main className="main-content">
        <Topbar />

        <div className="page-container">
            <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
