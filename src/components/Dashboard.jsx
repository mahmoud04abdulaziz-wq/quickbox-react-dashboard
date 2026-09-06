import React from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Filters from './Filters';
import ReservationsTable from './ReservationsTable';
import Pagination from './Pagination';

/**
 * Dashboard Component
 * This is the main layout component that wraps the Sidebar and the main content area,
 * assembling all the sub-components to build the complete view.
 */
function Dashboard() {
  const { t } = useTranslation(['inventory', 'common']);

  return (
    <div className="app-container">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content Area on the right */}
      <main className="main-content">
        <Topbar />

        <div className="page-container">
          {/* Page Header */}
          <div className="page-header">
            <h1>{t('reservations.title', { defaultValue: 'Reservations' })}</h1>
            <button className="btn-primary">{t('reservations.btn_add_booking', { defaultValue: 'Add Booking' })}</button>
          </div>

          <Filters />
          <ReservationsTable />
          <Pagination />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
