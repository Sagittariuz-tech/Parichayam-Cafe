export const tableCount = 15;
export const orderQuantityLimit = 20;
export const orderNoteLimit = 240;

export function tableNumber(value: string | null) {
  if (!value || !/^[1-9]\d?$/.test(value)) return '';
  return Number(value) <= tableCount ? value : '';
}
