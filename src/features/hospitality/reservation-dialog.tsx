import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { cafeDate, cafeTimeZone } from '@/lib/cafe-time';
import { CloseDialog, closeOnBackdrop } from '@/components/modal-controls';
import { requestJson, useServiceSubmission } from './client';
import type { ReservationReceipt } from './types';

const storageKey = 'parichayam-reservation';
const dateLabel = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: cafeTimeZone });

function lastReference() {
  try { return localStorage.getItem(storageKey) ?? ''; } catch { return ''; }
}

export default function ReservationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<'request' | 'status'>('request');
  const [receipt, setReceipt] = useState<ReservationReceipt>();
  const [statusMessage, setStatusMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const { busy, error, submit, reset } = useServiceSubmission<ReservationReceipt>();
  const blocked = busy || checking;

  useLayoutEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  useLayoutEffect(() => { if (receipt) title.current?.focus(); }, [receipt]);

  async function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const result = await submit('/api/reservations', {
      name: fields.get('name'), phone: fields.get('phone'), partySize: Number(fields.get('party')),
      date: fields.get('date'), time: fields.get('time'), note: fields.get('note'),
    });
    if (!result) return;
    try { localStorage.setItem(storageKey, result.id); } catch {}
    setReceipt(result);
  }

  async function check(id: string) {
    if (checking) return;
    setChecking(true);
    setStatusMessage('');
    try {
      const result = await requestJson<ReservationReceipt>('/api/reservations?id=' + encodeURIComponent(id));
      setReceipt(result);
    } catch (reason) {
      setStatusMessage(reason instanceof Error ? reason.message : 'Could not check this reservation.');
    } finally {
      setChecking(false);
    }
  }

  function switchMode(next: typeof mode) {
    setMode(next);
    setReceipt(undefined);
    setStatusMessage('');
    reset();
  }

  return (
    <dialog ref={dialog} className="dialog service-dialog" aria-labelledby="reservation-title" aria-busy={blocked}
      data-lenis-prevent onClick={closeOnBackdrop} onCancel={event => { if (blocked) event.preventDefault(); }}
      onClose={() => { switchMode('request'); onClose(); }}>
      <header className="dialog-header">
        <h2 ref={title} tabIndex={-1} id="reservation-title">{receipt ? 'Your reservation' : mode === 'status' ? 'Check a reservation' : 'Reserve a table'}</h2>
        <CloseDialog label="Close reservation" disabled={blocked} />
      </header>
      <div className="service-body">
        {receipt ? <>
          <p className="service-status" role="status">
            {receipt.status === 'confirmed' ? 'Confirmed · Table ' + receipt.table_number :
              receipt.status === 'declined' ? 'The café couldn’t confirm this request' : 'Awaiting café confirmation'}
          </p>
          <p>{dateLabel.format(receipt.starts_at)} · Party of {receipt.party_size}</p>
          <p className="service-note">Save this reference to check your reservation again.</p>
          <input className="reference-field" aria-label="Reservation reference" value={receipt.id} readOnly onFocus={event => event.target.select()} />
          {statusMessage && <p role="alert" className="form-error">{statusMessage}</p>}
          <button type="button" className="button button-outline" disabled={checking} onClick={() => void check(receipt.id)}>
            {checking ? 'Checking…' : 'Refresh status'}
          </button>
        </> : mode === 'status' ? <>
          <form key="status" className="service-form" onSubmit={event => {
            event.preventDefault();
            void check(String(new FormData(event.currentTarget).get('reference')).trim());
          }}>
            <fieldset disabled={checking}>
              <label>Reservation reference<input name="reference" required defaultValue={lastReference()} /></label>
              {statusMessage && <p className="form-error" role="alert">{statusMessage}</p>}
              <button className="button button-primary" type="submit">{checking ? 'Checking…' : 'Check status'}</button>
            </fieldset>
          </form>
          <button type="button" className="plain-action" disabled={checking} onClick={() => switchMode('request')}>Make a new reservation</button>
        </> : open && <>
          <p>Pick a date and time. The café team will confirm your request based on availability.</p>
          <form key="request" className="service-form" onSubmit={reserve} onChange={reset}>
            <fieldset disabled={busy}>
              <label>Your name<input name="name" autoComplete="name" maxLength={80} required /></label>
              <div className="field-pair">
                <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={30} required /></label>
                <label>Guests<input name="party" type="number" min="1" max="99" defaultValue={2} required /></label>
              </div>
              <div className="field-pair">
                <label>Date<input name="date" type="date" min={cafeDate()} required /></label>
                <label>Time, India Standard Time<input name="time" type="time" required /></label>
              </div>
              <label>Anything we should know? <span>(optional)</span><textarea name="note" rows={2} maxLength={240} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary" type="submit">{busy ? 'Sending request…' : 'Request a table'} <span aria-hidden="true">↗</span></button>
            </fieldset>
          </form>
          <button type="button" className="plain-action" disabled={busy} onClick={() => switchMode('status')}>Check an existing reservation</button>
        </>}
      </div>
    </dialog>
  );
}


