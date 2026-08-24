import React from 'react';

function SettingsView() {
  return (
    <>
      <div className="page-header">
        <h1>System Settings</h1>
        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="grid-2">
        {/* User Profile */}
        <div className="card">
          <h2>User Profile</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" defaultValue="Washim" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" defaultValue="washim@hotel.com" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" className="form-control" defaultValue="Inventory Manager" disabled style={{ backgroundColor: '#f9fafb' }} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" className="form-control" defaultValue="+971 50 123 4567" />
          </div>
        </div>

        {/* System Config */}
        <div className="card">
          <h2>System Configuration</h2>
          <div className="form-group">
            <label>Default Currency</label>
            <select className="form-control">
              <option>AED (د.إ)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Low Stock Alert Threshold (%)</label>
            <input type="number" className="form-control" defaultValue="20" />
          </div>
          <div className="form-group">
            <label>Auto-generate POs on Low Stock</label>
            <div style={{ marginTop: '8px' }}>
              <input type="checkbox" id="autoPo" defaultChecked style={{ marginRight: '8px' }} />
              <label htmlFor="autoPo" style={{ display: 'inline', fontWeight: 500 }}>Enable automatic PO creation</label>
            </div>
          </div>
          <div className="form-group">
            <label>Default Warehouse</label>
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
          <h2>Notification Preferences</h2>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Email alerts for low stock</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Email alerts for PO delivery</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Daily inventory summary</span>
              <input type="checkbox" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Weekly audit report</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>

        {/* Storage Locations */}
        <div className="card">
          <h2>Storage Locations</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Main Warehouse</td><td>Dry</td><td><span className="status in-stock">Active</span></td></tr>
                <tr><td>Kitchen Store</td><td>Cold/Dry</td><td><span className="status in-stock">Active</span></td></tr>
                <tr><td>Floor 1 Storage</td><td>Dry</td><td><span className="status in-stock">Active</span></td></tr>
                <tr><td>Floor 2 Storage</td><td>Dry</td><td><span className="status in-stock">Active</span></td></tr>
                <tr><td>Maintenance Room</td><td>Secure</td><td><span className="status in-stock">Active</span></td></tr>
                <tr><td>Laundry Room</td><td>Secure</td><td><span className="status in-stock">Active</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsView;
