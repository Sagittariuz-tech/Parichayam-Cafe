import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { CloseDialog, closeOnBackdrop } from '@/components/modal-controls';
import { animateDishDialog } from './menu-motion';
import { categoryLabel, dietaryLabels, dishLabel, photoPath, priceLabel, type Dish } from './menu';
import { nextCharacter, OrderCharacter } from '@/features/hospitality/characters';
import { useServiceSubmission } from '@/features/hospitality/client';
import type { OrderReceipt } from '@/features/hospitality/types';

function storedTable() {
  try {
    const table = new URLSearchParams(window.location.search).get('table') || sessionStorage.getItem('parichayam-table') || '';
    return /^[1-9]\d{0,2}$/.test(table) ? table : '';
  } catch { return ''; }
}

export default function DishDialog({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const receiptTitle = useRef<HTMLDivElement>(null);
  const { busy, error, submit, reset } = useServiceSubmission<OrderReceipt>();
  const [confirmation, setConfirmation] = useState<{ receipt: OrderReceipt; character: number } | null>(null);

  useLayoutEffect(() => {
    const node = dialog.current;
    if (!node || !dish || node.open) return;
    node.showModal();
    animateDishDialog(node);
  }, [dish]);

  useLayoutEffect(() => {
    if (confirmation) {
      receiptTitle.current?.querySelector('h2')?.focus();
      dialog.current?.scrollTo({ top: 0 });
      if (dialog.current) animateDishDialog(dialog.current);
    }
  }, [confirmation]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dish) return;
    const fields = new FormData(event.currentTarget);
    const table = Number(fields.get('table'));
    const receipt = await submit('/api/orders', {
      dishId: dish.id, table, quantity: Number(fields.get('quantity')), note: fields.get('note'),
    });
    if (!receipt) return;
    try { sessionStorage.setItem('parichayam-table', String(table)); } catch {}
    setConfirmation({ receipt, character: nextCharacter() });
  }

  return (
    <dialog ref={dialog} id="dish-dialog" className="dialog dish-dialog" aria-labelledby="dish-title"
      aria-busy={busy} data-lenis-prevent onClick={closeOnBackdrop}
      onCancel={event => { if (busy) event.preventDefault(); }}
      onClose={() => { setConfirmation(null); reset(); onClose(); }}>
      <CloseDialog label="Close dish details" floating disabled={busy} />
      {confirmation ? <div className="receipt-pane" ref={receiptTitle}>
        <OrderCharacter character={confirmation.character} dish={confirmation.receipt.dish} />
        <p className="receipt-meta">Table {confirmation.receipt.table_number} · Qty {confirmation.receipt.quantity} · Order {confirmation.receipt.id.slice(0, 8).toUpperCase()}</p>
        <form method="dialog"><button className="button button-primary" type="submit">Back to the menu</button></form>
      </div> : dish && <>
        <Image className="detail-photo" src={photoPath(dish.id)} alt="" width={480} height={480} unoptimized loading="eager" />
        <div className="detail-copy">
          <p className="eyebrow">{categoryLabel(dish.category)}</p>
          <h2 id="dish-title">{dishLabel(dish.name)}</h2>
          <div className="detail-meta">
            <strong>{priceLabel(dish.price)}</strong>
            <span id="detail-diet">{dish.diet && dietaryLabels[dish.diet]}</span>
          </div>
          {dish.description && <p>{dish.description}</p>}
          <form className="service-form" onSubmit={placeOrder} onChange={reset}>
            <fieldset disabled={busy}>
              <div className="field-pair">
                <label>Table number<input name="table" type="number" required min="1" max="999" inputMode="numeric" defaultValue={storedTable()} /></label>
                <label>Quantity<input name="quantity" type="number" required min="1" max="20" inputMode="numeric" defaultValue="1" /></label>
              </div>
              <label>Note for the kitchen <span>(optional)</span><textarea name="note" rows={2} maxLength={240} /></label>
              {dish.price.startsWith('from') && <p className="service-note">Staff can confirm the options and final price at your table.</p>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary" type="submit">{busy ? 'Sending order…' : 'Order it'} <span aria-hidden="true">↗</span></button>
            </fieldset>
          </form>
          <p className="image-note">Illustrative image</p>
        </div>
      </>}
    </dialog>
  );
}

