import React from 'react';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import { DotsThree, Phone, Envelope } from '@phosphor-icons/react';

function SuppliersView() {
  const suppliers = [
    { id: 'SUP-001', name: 'Global Linens Co.', category: 'Linens', contact: 'sarah@globallinens.com', phone: '+1 555-0101', lead: '3 days', terms: 'Net 30', status: 'Active' },
    { id: 'SUP-002', name: 'CleanPro Solutions', category: 'Cleaning', contact: 'sales@cleanpro.com', phone: '+1 555-0102', lead: '5 days', terms: 'Net 15', status: 'Active' },
    { id: 'SUP-003', name: 'Premium Roasters', category: 'F&B', contact: 'orders@premiumroasters.com', phone: '+1 555-0103', lead: '2 days', terms: 'COD', status: 'Active' },
    { id: 'SUP-004', name: 'Hotel Amenities Inc.', category: 'Toiletries', contact: 'support@hotelamenities.com', phone: '+1 555-0104', lead: '7 days', terms: 'Net 30', status: 'Active' },
    { id: 'SUP-005', name: 'Fresh Dairy Farms', category: 'F&B', contact: 'dispatch@freshdairy.com', phone: '+1 555-0105', lead: '1 day', terms: 'COD', status: 'Inactive' },
    { id: 'SUP-006', name: 'Elite Equipment Ltd.', category: 'Equipment', contact: 'info@eliteequip.com', phone: '+1 555-0106', lead: '14 days', terms: 'Net 60', status: 'Active' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Suppliers Directory</h1>
        <button className="btn-primary">Add Supplier</button>
      </div>

      <Filters />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /> ID</th>
              <th>Supplier Name</th>
              <th>Category</th>
              <th>Contact</th>
              <th>Lead Time</th>
              <th>Payment Terms</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((sup) => (
              <tr key={sup.id}>
                <td><input type="checkbox" /> {sup.id}</td>
                <td style={{ fontWeight: 600 }}>{sup.name}</td>
                <td>{sup.category}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Envelope size={12} color="#9ca3af" /> {sup.contact}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                      <Phone size={10} color="#9ca3af" /> {sup.phone}
                    </span>
                  </div>
                </td>
                <td>{sup.lead}</td>
                <td>{sup.terms}</td>
                <td>
                  <span className={`status ${sup.status === 'Active' ? 'in-stock' : 'out-stock'}`}>
                    {sup.status}
                  </span>
                </td>
                <td className="dots-cell">
                  <DotsThree weight="bold" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination />
    </>
  );
}

export default SuppliersView;
