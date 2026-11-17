'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { cafeTimeZone } from '@/lib/cafe-time';
import { requestJson } from './client';
import type { StaffQueue } from './types';

const timeLabel = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: cafeTimeZone });

export default function StaffDashboard() {
  const [password, setPassword] = useState('');
  const [queue, setQueue] = useState<StaffQueue>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const latestFetch = useRef(0);
  const ready = !!queue;

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const timer = window.setInterval(async () => {
      const sequence = ++latestFetch.current;
      try {
        const data = await requestJson<StaffQueue>('/api/staff', {
          headers: { Authorization: 'Bearer ' + encodeURIComponent(password) }, signal: controller.signal,
        });
        if (!controller.signal.aborted && sequence === latestFetch.current) setQueue(data);
      } catch (reason) {
        if (!controller.signal.aborted && sequence === latestFetch.current) {
          setError(reason instanceof Error ? reason.message : 'Could not refresh the queue.');
        }
      }
    }, 4500);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [password, ready]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      setQueue(await requestJson<StaffQueue>('/api/staff', { headers: { Authorization: 'Bearer ' + encodeURIComponent(password) } }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the queue.');
    } finally { setBusy(false); }
  }

  async function update(payload: object) {
    setBusy(true);
    setError('');
    const headers = { Authorization: 'Bearer ' + encodeURIComponent(password) };
    try {
      await requestJson('/api/staff', {
        method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const sequence = ++latestFetch.current;
      const data = await requestJson<StaffQueue>('/api/staff', { headers });
      if (sequence === latestFetch.current) setQueue(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update this entry.');
    } finally { setBusy(false); }
  }

  return (
    <main className="shell staff-page">
      <header className="staff-header">
        <div><p className="eyebrow">Parichayam Café</p><h1>Staff desk</h1></div>
        <a href="/" className="text-link">Back to the menu ↗</a>
      </header>
      {error && <p role="alert" className="form-error">{error}</p>}
      {!queue ? <form className="service-form staff-login" onSubmit={signIn}>
        <fieldset disabled={busy}>
          <label>Staff password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
          <button type="submit" className="button button-primary">{busy ? 'Opening…' : 'Open staff desk'}</button>
        </fieldset>
      </form> : <>
        <button type="button" className="button button-outline staff-lock" disabled={busy} onClick={() => { setQueue(undefined); setPassword(''); setError(''); }}>Lock desk</button>
        <div className="staff-queue">
          <section aria-labelledby="staff-orders">
            <h2 id="staff-orders">Kitchen orders</h2>
            {!queue.orders.length && <p>No orders yet.</p>}
            {queue.orders.map(order => <article key={order.id} className="queue-entry">
              <p className="eyebrow">{order.status} · Order {order.id.slice(0, 8).toUpperCase()}</p>
              <h3>{order.quantity} × {order.dish}</h3>
              <p>Table {order.table_number} · {order.starting_price ? 'From ' : ''}₹{order.unit_price} each</p>
              {order.note && <p>{order.note}</p>}
              {(order.status === 'queued' || order.status === 'preparing') && <div className="staff-actions">
                <button type="button" className="button button-primary" disabled={busy} onClick={() => void update({
                  type: 'order', id: order.id, status: order.status === 'queued' ? 'preparing' : 'served',
                })}>{order.status === 'queued' ? 'Start preparing' : 'Mark served'}</button>
                <button type="button" className="plain-action" disabled={busy} onClick={() => void update({
                  type: 'order', id: order.id, status: 'cancelled',
                })}>Cancel order</button>
              </div>}
            </article>)}
          </section>
          <section aria-labelledby="staff-reservations">
            <h2 id="staff-reservations">Reservations</h2>
            {!queue.reservations.length && <p>No reservations yet.</p>}
            {queue.reservations.map(reservation => <article key={reservation.id} className="queue-entry">
              <p className="eyebrow">{reservation.status}{reservation.table_number ? ' · Table ' + reservation.table_number : ''}</p>
              <h3>{reservation.guest_name}</h3>
              <p>{timeLabel.format(reservation.starts_at)} · Party of {reservation.party_size}</p>
              <a className="text-link" href={'tel:' + reservation.phone.replace(/[^+\d]/g, '')}>{reservation.phone}</a>
              {reservation.note && <p>{reservation.note}</p>}
              {reservation.status === 'pending' && <form className="service-form" onSubmit={event => {
                event.preventDefault();
                const table = Number(new FormData(event.currentTarget).get('table'));
                void update({ type: 'reservation', id: reservation.id, status: 'confirmed', table });
              }}>
                <fieldset disabled={busy}>
                  <label>Assign table<input name="table" type="number" min="1" max="999" required /></label>
                  <div className="staff-actions">
                    <button type="submit" className="button button-primary">Confirm table</button>
                    <button type="button" className="plain-action" onClick={() => void update({
                      type: 'reservation', id: reservation.id, status: 'declined',
                    })}>Decline</button>
                  </div>
                </fieldset>
              </form>}
            </article>)}
          </section>
        </div>
      </>}
    </main>
  );
}
