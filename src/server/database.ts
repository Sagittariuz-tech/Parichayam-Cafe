import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setTimeout as wait } from 'node:timers/promises';
import { RequestError } from './http';

let database: DatabaseSync | undefined;

function isDatabaseBusy(error: unknown) {
  if (!(error instanceof Error) || !('errcode' in error) || typeof error.errcode !== 'number') return false;
  const result = error.errcode & 0xff;
  return result === 5 || result === 6; // SQLITE_BUSY and SQLITE_LOCKED, including extended codes.
}

export async function retryOrderWrite<T>(write: () => T) {
  try {
    return write();
  } catch (error) {
    if (!isDatabaseBusy(error)) throw error;
  }

  // SQLite waits five seconds per attempt. Leave time to return a response
  // before the browser's twelve-second request deadline.
  await wait(250);
  try {
    return write();
  } catch (error) {
    if (!isDatabaseBusy(error)) throw error;
    throw new RequestError('The kitchen queue is busy. Please try sending your order again.', 503);
  }
}

export function getDatabase() {
  if (database) return database;
  const path = resolve(/* turbopackIgnore: true */ process.env.CAFE_DB_PATH || '.cafe-data/hospitality.sqlite');
  mkdirSync(dirname(path), { recursive: true });
  const connection = new DatabaseSync(path);
  try {
    connection.exec('PRAGMA busy_timeout = 5000;');
    if (connection.prepare('PRAGMA journal_mode').get()?.journal_mode !== 'wal') {
      connection.exec('PRAGMA journal_mode = WAL;');
    }
    connection.exec(
      'CREATE TABLE IF NOT EXISTS orders (' +
        'id TEXT PRIMARY KEY, dish_id INTEGER NOT NULL, dish TEXT NOT NULL, table_number INTEGER NOT NULL, ' +
        'unit_price INTEGER NOT NULL, starting_price INTEGER NOT NULL, quantity INTEGER NOT NULL, note TEXT NOT NULL, ' +
        "status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','preparing','served','cancelled')), " +
        'created_at TEXT NOT NULL' +
      ');' +
      'CREATE TABLE IF NOT EXISTS reservations (' +
        'id TEXT PRIMARY KEY, guest_name TEXT NOT NULL, phone TEXT NOT NULL, party_size INTEGER NOT NULL, ' +
        'starts_at INTEGER NOT NULL, note TEXT NOT NULL, table_number INTEGER, ends_at INTEGER, ' +
        "status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined')), " +
        'created_at TEXT NOT NULL' +
      ');' +
      "CREATE INDEX IF NOT EXISTS confirmed_reservation_tables ON reservations(table_number, starts_at, ends_at) WHERE status = 'confirmed';"
    );
  } catch (error) {
    connection.close();
    throw error;
  }
  database = connection;
  return connection;
}

