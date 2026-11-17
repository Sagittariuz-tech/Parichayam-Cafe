import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { categoryLabel, dishLabel, photoPath, priceLabel, suggestDishes, type Dish } from './menu';

export default function DishSearch({ inputRef, value, onChange, onSelect }: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSelect: (dish: Dish) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(-1);
  const searchPanel = useRef<HTMLDivElement>(null);
  const listId = useId();
  const suggestions = useMemo(() => suggestDishes(value), [value]);
  const visible = expanded && suggestions.length > 0;
  const optionId = (id: number) => listId + '-dish-' + id;

  useEffect(() => {
    if (!expanded) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !searchPanel.current?.contains(event.target)) {
        setExpanded(false);
        setActive(-1);
      }
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [expanded]);

  function select(dish: Dish) {
    setExpanded(false);
    setActive(-1);
    onSelect(dish);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape' && expanded) event.preventDefault();
      setExpanded(false);
      setActive(-1);
    } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && suggestions.length) {
      event.preventDefault();
      const last = suggestions.length - 1;
      const index = event.key === 'ArrowDown'
        ? active >= last ? 0 : active + 1
        : active <= 0 ? last : active - 1;
      setExpanded(true);
      setActive(index);
      requestAnimationFrame(() => document.getElementById(optionId(suggestions[index].id))?.scrollIntoView({ block: 'nearest' }));
    } else if (event.key === 'Enter' && visible && suggestions[active]) {
      event.preventDefault();
      select(suggestions[active]);
    }
  }

  return (
    <div ref={searchPanel} className="dish-search" onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
        setExpanded(false);
        setActive(-1);
      }
    }}>
      <div className="search">
        <span className="search-icon" aria-hidden="true" />
        <label className="sr-only" htmlFor="dish-search">Search dishes or categories</label>
        <input ref={inputRef} id="dish-search" role="combobox" type="search" aria-autocomplete="list"
          aria-expanded={visible} aria-controls={visible ? listId : undefined}
          aria-activedescendant={visible && suggestions[active] ? optionId(suggestions[active].id) : undefined}
          placeholder="Search dishes or categories" autoComplete="off" value={value}
          onFocus={() => setExpanded(true)} onClick={() => setExpanded(true)} onKeyDown={handleKey}
          onChange={event => {
            setActive(-1);
            setExpanded(true);
            onChange(event.target.value);
          }} />
      </div>
      {visible && <ul className="search-options" id={listId} role="listbox" aria-label="Suggested dishes" data-lenis-prevent>
        {suggestions.map((dish, index) => (
          <li className="search-option" key={dish.id} id={optionId(dish.id)} role="option"
            aria-selected={active === index} onMouseDown={event => event.preventDefault()} onClick={() => select(dish)}>
            <Image src={photoPath(dish.id)} alt="" width={35} height={35} unoptimized />
            <span className="search-option-text"><strong>{dishLabel(dish.name)}</strong><small>{categoryLabel(dish.category)}</small></span>
            <span className="search-option-price">{priceLabel(dish.price)}</span>
          </li>
        ))}
      </ul>}
    </div>
  );
}
