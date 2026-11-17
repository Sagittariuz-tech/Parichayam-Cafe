import { categories, categoryLabel, dishes, type Category } from '../lib/menu';

export function CategoryButtons({ selected, onSelect, options = categories, compact = false }: {
  selected: number;
  onSelect: (id: number) => void;
  options?: Category[];
  compact?: boolean;
}) {
  return [null, ...options].map(category => {
    const id = category?.id ?? 0;
    const name = category ? categoryLabel(category.name) : 'All dishes';
    return (
      <button key={id} type="button" className={compact ? 'pill' : 'category-row'}
        aria-pressed={id === selected} onClick={() => onSelect(id)}>
        {compact ? name : <><span>{name}</span><span aria-hidden="true">{category?.items.length ?? dishes.length}</span></>}
      </button>
    );
  });
}
