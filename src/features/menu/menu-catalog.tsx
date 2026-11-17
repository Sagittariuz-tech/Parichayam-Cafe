import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { categories, categoryLabel, dietaryLabels, dishes, dishLabel, filterDishes, quickCategories, type Diet, type Dish } from './menu';
import { CategoryButtons } from './category-buttons';
import DishCard from './dish-card';
import DishSearch from './dish-search';
import { RevealWords } from './reveal-words';
import CategoryDrawer from './category-drawer';

const pageSize = 18;

export default function MenuCatalog({ onSelectDish, scrollTo }: {
  onSelectDish: (dish: Dish) => void;
  scrollTo: (target: HTMLElement, offset?: number) => void;
}) {
  const [categoryId, setCategoryId] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [diet, setDiet] = useState<Diet>('');
  const [search, setSearch] = useState('');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [limit, setLimit] = useState(pageSize);
  const toolbar = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const categoryDialog = useRef<HTMLDialogElement>(null);
  const resultsStart = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const focusIndex = useRef<number | null>(null);

  const category = categories.find(item => item.id === categoryId);
  const matching = useMemo(() => selectedDish ? [selectedDish] : filterDishes(categoryId, diet, search), [categoryId, diet, search, selectedDish]);
  const visible = matching.slice(0, limit);
  const countLabel = visible.length === matching.length
    ? matching.length + (matching.length === 1 ? ' result' : ' results')
    : 'Showing ' + visible.length + ' of ' + matching.length + ' results';

  useLayoutEffect(() => {
    if (focusIndex.current === null) return;
    grid.current?.children[focusIndex.current]?.querySelector('button')?.focus();
    focusIndex.current = null;
  }, [limit]);

  function changeCategory(id: number) {
    categoryDialog.current?.close();
    if (selectedDish) setSearch('');
    setSelectedDish(null);
    setCategoryId(id);
    setLimit(pageSize);
    scrollToResults();
  }

  function scrollToResults() {
    if (!toolbar.current || !resultsStart.current) return;
    const pinned = getComputedStyle(toolbar.current).position === 'sticky' ? toolbar.current.offsetHeight : 0;
    scrollTo(resultsStart.current, -14 - pinned);
  }

  function selectDish(dish: Dish) {
    setSelectedDish(dish);
    setSearch(dishLabel(dish.name));
    setCategoryId(0);
    setDiet('');
    setLimit(pageSize);
    resultsStart.current?.querySelector('h3')?.focus({ preventScroll: true });
    scrollToResults();
  }

  function clearFilters() {
    setSearch('');
    setSelectedDish(null);
    setDiet('');
    setCategoryId(0);
    setLimit(pageSize);
    searchInput.current?.focus({ preventScroll: true });
  }

  return (
    <section className="catalog" id="menu" aria-labelledby="menu-title">
      <div className="shell catalog-inner">
        <header className="section-head catalog-head">
          <div>
            <p className="eyebrow">FOOD &amp; DRINK</p>
            <h2 id="menu-title" data-scroll-title><RevealWords text="The" /> <em><RevealWords text="menu." /></em></h2>
          </div>
          <p>{categories.length} categories · {dishes.length} items</p>
        </header>
        <div className="catalog-toolbar" ref={toolbar}>
          <div className="controls">
            <DishSearch inputRef={searchInput} value={search} onSelect={selectDish} onChange={value => {
              setSelectedDish(null);
              setSearch(value);
              setLimit(pageSize);
            }} />
            <button type="button" className="button button-outline category-toggle" aria-haspopup="dialog"
              aria-controls="category-dialog" onClick={() => setDrawerOpen(true)}>
              Categories <span aria-hidden="true">≡</span>
            </button>
          </div>
          <div className="quick-rail" aria-label="Quick categories">
            <CategoryButtons selected={categoryId} onSelect={changeCategory} options={quickCategories} compact />
          </div>
        </div>
        <div className="catalog-layout">
          <nav className="sidebar" aria-label="All categories" data-lenis-prevent>
            <CategoryButtons selected={categoryId} onSelect={changeCategory} />
          </nav>
          <div className="catalog-result" ref={resultsStart}>
            <div className="results-heading">
              <h3 tabIndex={-1}>{selectedDish ? 'Selected dish' : category ? categoryLabel(category.name) : 'All dishes'}</h3>
              <div className="diet-control">
                {selectedDish ? <button type="button" className="plain-action" onClick={clearFilters}>Clear selection</button> : <>
                <label className="sr-only" htmlFor="diet">Dietary filter</label>
                <select id="diet" value={diet} onChange={event => { setDiet(event.target.value as Diet); setLimit(pageSize); }}>
                  <option value="">All diets</option>
                  {Object.entries(dietaryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                </>}
              </div>
            </div>
            <p className="results-count" role="status">{countLabel}</p>
            <div className="dish-grid" ref={grid} id="dish-grid">
              {visible.map(dish => <DishCard key={dish.id} dish={dish} showCategory={!category} onSelect={onSelectDish} />)}
            </div>
            {!matching.length && <div className="empty">
              <h3>No dishes found</h3>
              <p>Try a different search or clear the filters.</p>
              <button type="button" className="button button-outline" onClick={clearFilters}>Clear filters</button>
            </div>}
            {limit < matching.length && <div className="pagination">
              <button type="button" className="button button-outline" onClick={() => {
                focusIndex.current = limit;
                setLimit(limit + pageSize);
              }}>
                Show more dishes <span aria-hidden="true">↓</span>
              </button>
            </div>}
            <noscript><p>Enable JavaScript to search, order, and reserve a table.</p></noscript>
          </div>
        </div>
      </div>
      <CategoryDrawer dialogRef={categoryDialog} open={drawerOpen} selected={categoryId}
        onSelect={changeCategory} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
