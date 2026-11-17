import type { MouseEvent } from 'react';

export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  if (event.target !== dialog || dialog.getAttribute('aria-busy') === 'true') return;
  const { top, bottom, left, right } = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
}

export function CloseDialog({ label, floating = false, disabled = false }: { label: string; floating?: boolean; disabled?: boolean }) {
  return (
    <form method="dialog" className={floating ? 'dish-close' : undefined}>
      <button type="submit" className="icon-button" disabled={disabled} aria-label={label}>×</button>
    </form>
  );
}
