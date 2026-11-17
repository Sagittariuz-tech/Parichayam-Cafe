import { timingSafeEqual, createHash } from 'node:crypto';
import { dishes, dishLabel } from '@/features/menu/menu';
import type { OrderReceipt, ReservationReceipt, StaffOrder, StaffReservation } from '@/features/hospitality/types';
import { orderNoteLimit, orderQuantityLimit, tableCount } from '@/lib/table-service';
import { getDatabase } from './database';
import { count, reference, RequestError, textField } from './http';

type OrderRow = StaffOrder & { dish_id: number };
type ReservationRow = StaffReservation & { ends_at: number | null };

function orderReceipt(row: OrderRow): OrderReceipt {
  const { id, dish, table_number, quantity, status } = row;
  return { id, dish, table_number, quantity, status };
}

function reservationReceipt(row: ReservationRow): ReservationReceipt {
  const { id, starts_at, party_size, status, table_number } = row;
  return { id, starts_at, party_size, status, table_number };
}

export function submitOrder(input: Record<string, unknown>) {
  const id = reference(input.reference);
  const dish = dishes.find(item => item.id === input.dishId);
  if (!dish) throw new RequestError('This dish is unavailable.');
  const table = count(input.table, tableCount, 'Table number');
  const quantity = count(input.quantity, orderQuantityLimit, 'Quantity');
  const note = textField(input.note, orderNoteLimit, 'Order note');
  const db = getDatabase();

  db.prepare(
    'INSERT INTO orders (id, dish_id, dish, table_number, unit_price, starting_price, quantity, note, created_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING'
  ).run(id, dish.id, dishLabel(dish.name), table, Number(dish.price.replace(/^from/, '')), Number(dish.price.startsWith('from')), quantity, note, new Date().toISOString());

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
  if (!row) throw new Error('Order could not be read after writing.');
  if (row.dish_id !== dish.id || row.table_number !== table || row.quantity !== quantity || row.note !== note) {
    throw new RequestError('This order reference belongs to another order.', 409);
  }
  return orderReceipt(row);
}

function bookingTime(date: unknown, time: unknown) {
  if (typeof date !== 'string' || typeof time !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new RequestError('Choose a valid reservation date and time.');
  }
  const dateOnly = new Date(date + 'T00:00:00Z');
  if (Number.isNaN(dateOnly.getTime()) || dateOnly.toISOString().slice(0, 10) !== date) {
    throw new RequestError('Choose a valid reservation date.');
  }
  return Date.parse(date + 'T' + time + ':00+05:30');
}

export function submitReservation(input: Record<string, unknown>) {
  const id = reference(input.reference);
  const name = textField(input.name, 80, 'Name', true);
  const phone = textField(input.phone, 30, 'Phone number', true);
  if (!/^\+?[\d\s()-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
    throw new RequestError('Enter a valid phone number.');
  }
  const party = count(input.partySize, 99, 'Party size');
  const starts = bookingTime(input.date, input.time);
  const note = textField(input.note, 240, 'Reservation note');
  const db = getDatabase();
  const select = db.prepare('SELECT * FROM reservations WHERE id = ?');
  let row = select.get(id) as ReservationRow | undefined;
  if (!row) {
    if (starts <= Date.now()) throw new RequestError('Choose a time in the future.');
    db.prepare(
      'INSERT INTO reservations (id, guest_name, phone, party_size, starts_at, note, created_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING'
    ).run(id, name, phone, party, starts, note, new Date().toISOString());
    row = select.get(id) as ReservationRow | undefined;
  }
  if (!row) throw new Error('Reservation could not be read after writing.');
  if (row.guest_name !== name || row.phone !== phone || row.party_size !== party || row.starts_at !== starts || row.note !== note) {
    throw new RequestError('This reference belongs to another reservation.', 409);
  }
  return reservationReceipt(row);
}

export function checkReservation(id: unknown) {
  const row = getDatabase().prepare('SELECT * FROM reservations WHERE id = ?').get(reference(id)) as ReservationRow | undefined;
  if (!row) throw new RequestError('Reservation reference not found.', 404);
  return reservationReceipt(row);
}

export function authorizeStaff(request: Request) {
  const password = process.env.CAFE_STAFF_PASSWORD;
  if (!password) throw new RequestError('Staff access is not configured. Set CAFE_STAFF_PASSWORD on the server.', 503);

  const authorization = request.headers.get('authorization');
  const presented = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  const digest = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(digest(presented), digest(encodeURIComponent(password)))) {
    throw new RequestError('Enter the staff access password.', 401);
  }
}

export function staffQueue() {
  const db = getDatabase();
  return {
    orders: db.prepare("SELECT * FROM orders ORDER BY status IN ('queued','preparing') DESC, created_at DESC LIMIT 100").all(),
    reservations: db.prepare("SELECT * FROM reservations ORDER BY status = 'pending' DESC, starts_at DESC LIMIT 100").all(),
  };
}

function confirmReservation(id: string, table: number) {
  const duration = Number(process.env.CAFE_RESERVATION_MINUTES || 90);
  if (!Number.isSafeInteger(duration) || duration < 1) throw new Error('Invalid CAFE_RESERVATION_MINUTES.');
  const db = getDatabase();
  db.exec('BEGIN IMMEDIATE;');
  try {
    const current = db.prepare("SELECT * FROM reservations WHERE id = ? AND status = 'pending'").get(id) as ReservationRow | undefined;
    if (!current) throw new RequestError('This reservation is no longer pending.', 409);
    if (current.starts_at <= Date.now()) throw new RequestError('This reservation time has already passed.', 409);
    const end = current.starts_at + duration * 60_000;
    const conflict = db.prepare(
      "SELECT id FROM reservations WHERE status = 'confirmed' AND table_number = ? AND starts_at < ? AND ends_at > ?"
    ).get(table, end, current.starts_at);
    if (conflict) throw new RequestError('That table already has a booking during this seating.', 409);
    db.prepare("UPDATE reservations SET status = 'confirmed', table_number = ?, ends_at = ? WHERE id = ?").run(table, end, id);
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

export function updateStaffQueue(input: Record<string, unknown>) {
  const id = reference(input.id);
  const db = getDatabase();
  if (input.type === 'order') {
    const status = input.status;
    if (status !== 'preparing' && status !== 'served' && status !== 'cancelled') {
      throw new RequestError('Choose a valid order status.');
    }
    const result = db.prepare(
      "UPDATE orders SET status = ? WHERE id = ? AND ((status = 'queued' AND ? IN ('preparing','cancelled')) " +
      "OR (status = 'preparing' AND ? IN ('served','cancelled')))"
    ).run(status, id, status, status);
    if (!result.changes) throw new RequestError('The order was already updated.', 409);
  } else if (input.type === 'reservation') {
    if (input.status === 'confirmed') confirmReservation(id, count(input.table, tableCount, 'Table number'));
    else if (input.status === 'declined') {
      const result = db.prepare("UPDATE reservations SET status = 'declined' WHERE id = ? AND status = 'pending'").run(id);
      if (!result.changes) throw new RequestError('The reservation was already updated.', 409);
    } else throw new RequestError('Choose a valid reservation status.');
  } else throw new RequestError('Choose an order or a reservation.');
  return { updated: true };
}

