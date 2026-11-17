import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { CloseDialog, closeOnBackdrop } from '@/components/modal-controls';
import { nextCharacter, OrderCharacter } from '@/features/hospitality/characters';
import { useServiceSubmission } from '@/features/hospitality/client';
import type { OrderReceipt } from '@/features/hospitality/types';
import { orderNoteLimit, orderQuantityLimit, tableCount, tableNumber } from '@/lib/table-service';
import { dishEditorial } from './dish-editorial';
import { categoryLabel, dietaryLabels, dishLabel, photoPath, priceLabel, type Dish } from './menu';
import { animateDishDialog, prefersReducedMotion } from './menu-motion';

const tableOptions = Array.from({ length: tableCount }, (_, index) => index + 1);

function storedTable() {
  try {
    return tableNumber(new URLSearchParams(location.search).get('table'))
      || tableNumber(sessionStorage.getItem('parichayam-table'));
  } catch {
    return '';
  }
}

type Step = 'intro' | 'order';

function DishOrder({ dish, onReceipt, onBusy }: {
  dish: Dish;
  onReceipt: (receipt: OrderReceipt) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [step, setStep] = useState<Step>('intro');
  const [table, setTable] = useState(storedTable);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const transition = useRef<gsap.core.Tween | null>(null);
  const submitting = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const hasChangedStep = useRef(false);
  const { busy, error, submit, reset } = useServiceSubmission<OrderReceipt>();
  const editorial = dishEditorial(dish.name);
  const noteLines = note.split(/\r?\n/).map(line => line.trim());

  useLayoutEffect(() => {
    const node = panel.current;
    if (!node || !hasChangedStep.current) return;

    // Focus the new step without opening the mobile keyboard or select picker.
    node.querySelector<HTMLElement>('[data-step-focus]')?.focus({ preventScroll: true });
    if (step === 'intro') return;
    node.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  }, [step]);

  useLayoutEffect(() => () => { transition.current?.kill(); }, []);

  function showStep(next: Step) {
    const node = panel.current;
    if (!node || transition.current?.isActive()) return;
    hasChangedStep.current = true;
    if (prefersReducedMotion()) {
      setStep(next);
      return;
    }

    transition.current = gsap.to(node, {
      opacity: 0,
      y: -7,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setStep(next),
    });
  }

  function toggleSuggestion(suggestion: string) {
    const next = noteLines.includes(suggestion)
      ? note.split(/\r?\n/).filter(line => line.trim() !== suggestion).join('\n')
      : [note.trimEnd(), suggestion].filter(Boolean).join('\n');
    setNote(next);
    reset();
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    onBusy(true);
    try {
      const receipt = await submit('/api/orders', { dishId: dish.id, table: Number(table), quantity, note });
      if (!receipt) return;
      try { sessionStorage.setItem('parichayam-table', table); } catch {}
      onReceipt(receipt);
    } finally {
      submitting.current = false;
      onBusy(false);
    }
  }

  return (
    <div className="detail-layout">
      <figure className="detail-visual">
        <Image className="detail-photo" src={photoPath(dish.id)} alt="" width={480} height={480} unoptimized loading="eager" />
        <figcaption>Illustrative image</figcaption>
      </figure>
      <div className="detail-copy">
        <p className="eyebrow">{categoryLabel(dish.category)}</p>
        <h2 id="dish-title">{dishLabel(dish.name)}</h2>
        <div className="detail-meta">
          <strong>{priceLabel(dish.price)}</strong>
          {dish.diet && <span id="detail-diet">{dietaryLabels[dish.diet]}</span>}
        </div>

        {step === 'intro' ? (
          <div key="intro" ref={panel} className="detail-stage detail-intro" data-enter={hasChangedStep.current}>
            <p className="detail-description" tabIndex={-1} data-step-focus>{editorial.description}</p>
            {dish.description && <p className="detail-ingredients">{dish.description}</p>}
            <button className="button button-primary" type="button" onClick={() => showStep('order')}>
              Order it <span aria-hidden="true">↗</span>
            </button>
          </div>
        ) : (
          <div key="order" ref={panel} className="detail-stage detail-order" data-enter="true">
            <h3 tabIndex={-1} data-step-focus>Your order</h3>
            <form className="service-form" onSubmit={placeOrder}>
              <fieldset disabled={busy}>
                <div className="field-pair">
                  <label>Table number
                    <select name="table" value={table} required onChange={event => { setTable(event.target.value); reset(); }}>
                      <option disabled value="">Choose a table</option>
                      {tableOptions.map(number => <option key={number} value={number}>Table {number}</option>)}
                    </select>
                  </label>
                  <div className="quantity-control">
                    <p id="order-quantity-label">Quantity</p>
                    <div className="quantity-stepper" role="group" aria-labelledby="order-quantity-label">
                      <button type="button" aria-label="Decrease quantity" disabled={quantity === 1}
                        onClick={() => { setQuantity(value => Math.max(1, value - 1)); reset(); }}>‹</button>
                      <output aria-live="polite">{quantity}</output>
                      <button type="button" aria-label="Increase quantity" disabled={quantity === orderQuantityLimit}
                        onClick={() => { setQuantity(value => Math.min(orderQuantityLimit, value + 1)); reset(); }}>›</button>
                    </div>
                  </div>
                </div>
                <label>Note for the kitchen <span>(optional)</span>
                  <textarea name="note" rows={2} maxLength={orderNoteLimit} value={note}
                    onChange={event => { setNote(event.target.value); reset(); }} />
                </label>
                <div className="kitchen-suggestions" role="group" aria-label="Kitchen note suggestions">
                  {editorial.suggestions.map(suggestion => {
                    const selected = noteLines.includes(suggestion);
                    const required = suggestion.length + (note.trimEnd() ? 1 : 0);
                    return (
                      <button className="note-chip" type="button" key={suggestion} aria-pressed={selected}
                        disabled={!selected && note.trimEnd().length + required > orderNoteLimit}
                        onClick={() => toggleSuggestion(suggestion)}>
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
                <p className="service-note">The kitchen will confirm any changes{dish.price.startsWith('from') ? ' and the final price' : ''} at your table.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="order-actions">
                  <button className="button button-primary" type="submit">{busy ? 'Sending order…' : 'Send order'} <span aria-hidden="true">↗</span></button>
                  <button className="plain-action" type="button" onClick={() => showStep('intro')}>Back to dish</button>
                </div>
              </fieldset>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DishDialog({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const receiptTitle = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<{ receipt: OrderReceipt; character: number } | null>(null);

  useLayoutEffect(() => {
    const node = dialog.current;
    if (!node || !dish || node.open) return;
    node.showModal();
    animateDishDialog(node);
  }, [dish]);

  useLayoutEffect(() => {
    if (!confirmation) return;
    receiptTitle.current?.querySelector('h2')?.focus();
    dialog.current?.scrollTo({ top: 0 });
    if (dialog.current) animateDishDialog(dialog.current);
  }, [confirmation]);

  return (
    <dialog ref={dialog} id="dish-dialog" className="dialog dish-dialog" aria-labelledby="dish-title"
      aria-busy={busy} data-lenis-prevent onClick={closeOnBackdrop}
      onCancel={event => { if (busy) event.preventDefault(); }}
      onClose={() => { setConfirmation(null); onClose(); }}>
      <CloseDialog label="Close dish details" floating disabled={busy} />
      {confirmation ? <div className="receipt-pane" ref={receiptTitle}>
        <OrderCharacter character={confirmation.character} dish={confirmation.receipt.dish} />
        <p className="receipt-meta">Table {confirmation.receipt.table_number} · Qty {confirmation.receipt.quantity} · Order {confirmation.receipt.id.slice(0, 8).toUpperCase()}</p>
        <form method="dialog"><button className="button button-primary" type="submit">Back to the menu</button></form>
      </div> : dish && <DishOrder key={dish.id} dish={dish} onBusy={setBusy}
        onReceipt={receipt => setConfirmation({ receipt, character: nextCharacter() })} />}
    </dialog>
  );
}
