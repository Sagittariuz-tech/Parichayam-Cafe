import { useRef, useState } from 'react';
import { cafeTimeZone } from '@/lib/cafe-time';
import type { ReservationReceipt } from './types';

const dateLabel = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: cafeTimeZone });
const csvDate = new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeZone: cafeTimeZone });
const csvTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: cafeTimeZone });

export function reservationCode(id: string) {
  return 'PC' + id.replaceAll('-', '').toUpperCase();
}

function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[\s]*[=+@-]|^[\r\n\t]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

function csvReceipt(receipt: ReservationReceipt, name: string) {
  const fields = [
    ['Reservation ID', 'Guest name', 'Table number', 'Guests', 'Date', 'Time (IST)'],
    [reservationCode(receipt.id), name, receipt.table_number ?? '', receipt.party_size, csvDate.format(receipt.starts_at), csvTime.format(receipt.starts_at)],
  ];
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + fields.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n');
}

export default function ReservationCard({ receipt, guestName }: { receipt: ReservationReceipt; guestName: string }) {
  const referenceField = useRef<HTMLInputElement>(null);
  const [copyMessage, setCopyMessage] = useState('');
  const code = reservationCode(receipt.id);
  const confirmed = receipt.status === 'confirmed';

  async function copyId() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyMessage('Reservation ID copied.');
    } catch {
      referenceField.current?.focus();
      referenceField.current?.select();
      setCopyMessage('The ID is selected and ready for you to copy.');
    }
  }

  return (
    <section className="reservation-ticket" aria-label="Reservation details">
      <p className="reservation-ticket-status" role="status">
        <span aria-hidden="true">{confirmed ? '✓' : '•'}</span>
        {confirmed ? 'Your table is reserved' : receipt.status === 'declined' ? 'The café couldn’t confirm this request' : 'Awaiting café confirmation'}
      </p>
      {confirmed && <p className="reservation-welcome">We’ll have your table ready at the time you booked. See you at Parichayam{guestName ? ', ' + guestName : ''}.</p>}
      <dl className="reservation-facts">
        {guestName && <div><dt>Guest</dt><dd>{guestName}</dd></div>}
        {confirmed && <div><dt>Table</dt><dd>{receipt.table_number}</dd></div>}
        <div><dt>Guests</dt><dd>{receipt.party_size}</dd></div>
        <div className="reservation-when"><dt>When</dt><dd>{dateLabel.format(receipt.starts_at)} IST</dd></div>
      </dl>
      <div className="reservation-reference">
        <label htmlFor="reservation-receipt-id">Reservation ID</label>
        <input className="reference-field" id="reservation-receipt-id" ref={referenceField} value={code} readOnly onFocus={event => event.target.select()} />
      </div>
      <div className="reservation-actions">
        <button type="button" className="button button-outline" onClick={() => void copyId()}>Copy ID</button>
        {confirmed && guestName && <a className="button button-primary" href={csvReceipt(receipt, guestName)} download={'Parichayam-' + code + '.csv'}>Download CSV <span aria-hidden="true">↓</span></a>}
      </div>
      {copyMessage && <p className="service-note" role="status">{copyMessage}</p>}
    </section>
  );
}
