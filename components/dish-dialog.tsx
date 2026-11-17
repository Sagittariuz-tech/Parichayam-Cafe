import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import Image from 'next/image';
import { categoryLabel, dietaryLabels, dishLabel, orderUrl, photoPath, priceLabel, type Dish } from '../lib/menu';
import { animateDishDialog } from './menu-motion';

export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  if (event.target !== dialog) return;
  const { top, bottom, left, right } = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
}

export function CloseDialog({ label, floating = false }: { label: string; floating?: boolean }) {
  return (
    <form method="dialog" className={floating ? 'dish-close' : undefined}>
      <button type="submit" className="icon-button" aria-label={label}>×</button>
    </form>
  );
}

export default function DishDialog({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const node = dialog.current;
    if (!node || !dish || node.open) return;
    node.showModal();
    animateDishDialog(node);
  }, [dish]);

  return (
    <dialog ref={dialog} id="dish-dialog" className="dialog dish-dialog" aria-labelledby="dish-title"
      data-lenis-prevent onClick={closeOnBackdrop} onClose={onClose}>
      <CloseDialog label="Close dish details" floating />
      {dish && <>
        <Image src={photoPath(dish.id)} alt="" width={480} height={480} unoptimized loading="eager" />
        <div className="detail-copy">
          <p className="eyebrow" id="detail-category">{categoryLabel(dish.category)}</p>
          <h2 id="dish-title">{dishLabel(dish.name)}</h2>
          <div className="detail-meta">
            <span id="detail-price">{priceLabel(dish.price)}</span>
            <span id="detail-diet">{dish.diet && dietaryLabels[dish.diet]}</span>
          </div>
          {dish.description && <p id="detail-description">{dish.description}</p>}
          <a className="button button-primary" href={orderUrl}>Open table ordering <span aria-hidden="true">↗</span></a>
          <p className="image-note">Illustrative image</p>
        </div>
      </>}
    </dialog>
  );
}
