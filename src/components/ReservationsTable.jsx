import React from 'react';
import { CheckCircle, ArrowCircleRight, DotsThree } from '@phosphor-icons/react';

/**
 * ReservationsTable Component
 * ============================
 * SOURCE BRAND LOGOS:
 *   - Booking.com = styled text only ("Booking" dark navy + ".com" light blue)
 *   - Expedia = real logo image from /logos/expedia.jpg
 *   - airbnb = real logo image from /logos/airbnb.png
 *   - gozayaan = real logo image from /logos/gozayaan.png
 *
 * SELF CHECK IN / OUT:
 *   - "Due In" → no icons
 *   - "Confirmed" / "Checked In" → green filled check circle
 *   - "Checked Out" → green check + red/coral circle
 *
 * LAST COLUMN: Three horizontal dots menu (DotsThree)
 */

const mockReservations = [
  { id: '2319', room: '118', guest: 'David Smith',      checkIn: '01.10.23', checkOut: '02.10.23', orders: 0, amount: '$70.00',  balance: '$70.00',    source: 'booking',  status: 'Confirmed',   statusClass: 'confirmed' },
  { id: '2318', room: '117', guest: 'Dianne Rusel',     checkIn: '01.10.23', checkOut: '05.10.23', orders: 1, amount: '$200.00', balance: '-$200.00',  source: 'expedia',  status: 'Checked In',  statusClass: 'checked-in' },
  { id: '2317', room: '116', guest: 'Marvin McKiney',   checkIn: '02.10.23', checkOut: '04.10.23', orders: 0, amount: '$110.00', balance: '$110.00',   source: 'airbnb',   status: 'Due In',      statusClass: 'due-in' },
  { id: '2316', room: '115', guest: 'Brooklyn Simons',  checkIn: '03.10.23', checkOut: '06.10.23', orders: 0, amount: '$130.00', balance: '$130.00',   source: 'gozayaan', status: 'Checked Out', statusClass: 'checked-out' },
  { id: '2315', room: '114', guest: 'Jerome Bell',      checkIn: '04.10.23', checkOut: '05.10.23', orders: 1, amount: '$90.00',  balance: '-$90.00',   source: 'expedia',  status: 'Confirmed',   statusClass: 'confirmed' },
  { id: '2314', room: '113', guest: 'Marvin McKiney',   checkIn: '05.10.23', checkOut: '09.10.23', orders: 0, amount: '$220.00', balance: '-$220.00',  source: 'booking',  status: 'Checked In',  statusClass: 'checked-in' },
  { id: '2312', room: '112', guest: 'Robertson',        checkIn: '07.10.23', checkOut: '12.10.23', orders: 0, amount: '$250.00', balance: '$250.00',   source: 'gozayaan', status: 'Checked Out', statusClass: 'checked-out' },
  { id: '2311', room: '111', guest: 'Floyd Miles',      checkIn: '06.10.23', checkOut: '08.10.23', orders: 1, amount: '$80.00',  balance: '-$80.00',   source: 'expedia',  status: 'Due In',      statusClass: 'due-in' },
  { id: '2310', room: '110', guest: 'Ronald Richard',   checkIn: '09.10.23', checkOut: '11.10.23', orders: 1, amount: '$70.00',  balance: '-$70.00',   source: 'airbnb',   status: 'Confirmed',   statusClass: 'confirmed' },
  { id: '2309', room: '109', guest: 'Alfred Reid',      checkIn: '10.10.23', checkOut: '15.10.23', orders: 0, amount: '$250.00', balance: '$250.00',   source: 'gozayaan', status: 'Checked Out', statusClass: 'checked-out' },
  { id: '2308', room: '108', guest: 'Roger Parks',      checkIn: '12.10.23', checkOut: '14.10.23', orders: 1, amount: '$180.00', balance: '-$180.00',  source: 'booking',  status: 'Confirmed',   statusClass: 'confirmed' },
  { id: '2307', room: '107', guest: 'Frank Gray',       checkIn: '13.10.23', checkOut: '18.10.23', orders: 0, amount: '$230.00', balance: '-$230.00',  source: 'expedia',  status: 'Checked In',  statusClass: 'checked-in' },
  { id: '2306', room: '106', guest: 'Roger Parks',      checkIn: '12.10.23', checkOut: '16.10.23', orders: 1, amount: '$300.00', balance: '$300.00',   source: 'gozayaan', status: 'Confirmed',   statusClass: 'confirmed' },
  { id: '2305', room: '105', guest: 'Joy Borma',        checkIn: '14.10.23', checkOut: '17.10.23', orders: 0, amount: '$320.00', balance: '-$320.00',  source: 'booking',  status: 'Due In',      statusClass: 'due-in' },
  { id: '2304', room: '104', guest: 'Mical Jordan',     checkIn: '15.10.23', checkOut: '19.10.23', orders: 0, amount: '$200.00', balance: '$200.00',   source: 'booking',  status: 'Checked Out', statusClass: 'checked-out' },
  { id: '2303', room: '103', guest: 'John Wick',        checkIn: '15.10.23', checkOut: '17.10.23', orders: 1, amount: '$120.00', balance: '-$120.00',  source: 'booking',  status: 'Due In',      statusClass: 'due-in' },
];

/**
 * SourceBrand — Renders the brand label with its REAL logo image.
 * Images are stored locally in /public/logos/ for offline use.
 */
function SourceBrand({ source }) {
  switch (source) {
    case 'booking':
      return (
        <span className="source-brand">
          <span className="booking-text">
            <span className="booking-dark">Booking</span>
            <span className="booking-light">.com</span>
          </span>
        </span>
      );

    case 'expedia':
      return (
        <span className="source-brand">
          <img src="/logos/expedia.jpg" alt="Expedia" className="brand-logo" />
          <span className="expedia-text">Expedia</span>
        </span>
      );

    case 'airbnb':
      return (
        <span className="source-brand">
          <img src="/logos/airbnb.png" alt="Airbnb" className="brand-logo" />
          <span className="airbnb-text">airbnb</span>
        </span>
      );

    case 'gozayaan':
      return (
        <span className="source-brand">
          <img src="/logos/gozayaan.png" alt="Gozayaan" className="brand-logo gozayaan-logo" />
          <span className="gozayaan-text">gozayaan</span>
        </span>
      );

    default:
      return <span className="source-brand">{source}</span>;
  }
}

/**
 * SelfCheckIcons — Green check for check-in, red circle for check-out.
 */
function SelfCheckIcons({ status }) {
  if (status === 'Due In') return null;
  const isCheckedOut = status === 'Checked Out';
  return (
    <>
      <CheckCircle weight="fill" className="icon-self-checkin" />
      {isCheckedOut && <ArrowCircleRight weight="fill" className="icon-self-checkout" />}
    </>
  );
}

function ReservationsTable() {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /> Booking</th>
            <th>Room</th>
            <th>Guests</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Orders</th>
            <th>Amount</th>
            <th>Balance</th>
            <th>Source</th>
            <th>Status</th>
            <th>Self Check In / Out</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {mockReservations.map((res) => (
            <tr key={res.id}>
              <td><input type="checkbox" /> {res.id}</td>
              <td>{res.room}</td>
              <td>{res.guest}</td>
              <td>{res.checkIn}</td>
              <td>{res.checkOut}</td>
              <td>{res.orders}</td>
              <td>{res.amount}</td>
              <td>{res.balance}</td>
              <td><SourceBrand source={res.source} /></td>
              <td>
                <span className={`status ${res.statusClass}`}>
                  {res.status}
                </span>
              </td>
              <td className="actions-cell">
                <SelfCheckIcons status={res.status} />
              </td>
              <td className="dots-cell">
                <DotsThree weight="bold" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationsTable;
