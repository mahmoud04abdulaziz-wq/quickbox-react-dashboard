import React from 'react';
import { useTranslation } from 'react-i18next';

function SettingsView() {
  const { t } = useTranslation(['inventory', 'common']);
  return (
    <>
      <div className="page-header">
        <h1>{t('common:settings.title')}</h1>
        <button className="btn-primary">{t('common:actions.save_changes')}</button>
      </div>

      <div className="grid-2">
        {/* User Profile */}
        <div className="card">
          <h2>{t('common:settings.user_profile')}</h2>
          <div className="form-group">
            <label>{t('common:settings.full_name')}</label>
            <input type="text" className="form-control" defaultValue="Washim" />
          </div>
          <div className="form-group">
            <label>{t('common:settings.email_address')}</label>
            <input type="email" className="form-control bidi-ltr" defaultValue="washim@hotel.com" dir="ltr" />
          </div>
          <div className="form-group">
            <label>{t('common:settings.role')}</label>
            <input type="text" className="form-control" defaultValue="Inventory Manager" disabled style={{ backgroundColor: '#f9fafb' }} />
          </div>
          <div className="form-group">
            <label>{t('common:settings.phone')}</label>
            <input type="tel" className="form-control bidi-ltr" defaultValue="+962 79 123 4567" dir="ltr" />
          </div>
        </div>

        {/* System Config */}
        <div className="card">
          <h2>{t('common:settings.system_config')}</h2>
          <div className="form-group">
            <label>{t('common:settings.default_currency')}</label>
            <select className="form-control">
              <option>JOD (د.أ)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('common:settings.low_stock_threshold')}</label>
            <input type="number" className="form-control bidi-ltr" defaultValue="20" dir="ltr" />
          </div>
          <div className="form-group">
            <label>{t('common:settings.auto_generate_pos')}</label>
            <div style={{ marginTop: '8px' }}>
              <input type="checkbox" id="autoPo" defaultChecked style={{ marginInlineEnd: '8px' }} />
              <label htmlFor="autoPo" style={{ display: 'inline', fontWeight: 500 }}>{t('common:settings.enable_auto_po')}</label>
            </div>
          </div>
          <div className="form-group">
            <label>{t('common:settings.default_warehouse')}</label>
            <select className="form-control">
              <option>Main Warehouse</option>
              <option>Kitchen Store</option>
              <option>Floor 1 Storage</option>
              <option>Floor 2 Storage</option>
            </select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <h2>{t('common:settings.notification_preferences')}</h2>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('common:settings.email_low_stock')}</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('common:settings.email_po_delivery')}</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('common:settings.daily_summary')}</span>
              <input type="checkbox" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('common:settings.weekly_audit')}</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>

        {/* Storage Locations */}
        <div className="card">
          <h2>{t('common:settings.storage_locations')}</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('common:settings.location_name')}</th>
                  <th>{t('common:settings.location_type')}</th>
                  <th>{t('common:settings.location_status')}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Main Warehouse</td><td>Dry</td><td><span className="status in-stock">{t('common:status.active')}</span></td></tr>
                <tr><td>Kitchen Store</td><td>Cold/Dry</td><td><span className="status in-stock">{t('common:status.active')}</span></td></tr>
                <tr><td>Floor 1 Storage</td><td>Dry</td><td><span className="status in-stock">{t('common:status.active')}</span></td></tr>
                <tr><td>Floor 2 Storage</td><td>Dry</td><td><span className="status in-stock">{t('common:status.active')}</span></td></tr>
                <tr><td>Maintenance Room</td><td>Secure</td><td><span className="status in-stock">{t('common:status.active')}</span></td></tr>
                <tr><td>Laundry Room</td><td>Secure</td><td><span className="status in-stock">{t('common:status.active')}</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsView;
