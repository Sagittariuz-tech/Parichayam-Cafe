(() => {
  'use strict';

  const categories = window.parichayamMenu;
  const query = selector => document.querySelector(selector);
  const flatMenu = categories.flatMap(category => category.items.map(item => ({
    ...item,
    categoryId: category.id,
    category: category.name,
  })));
  const dishesById = new Map(flatMenu.map(dish => [dish.id, dish]));
  const categoryById = new Map(categories.map(category => [category.id, category]));
  const categoryNames = new Map([
    ['hot coffees', 'Hot Coffees'],
    ['Choco Based Hot Drinks', 'Hot Chocolate'],
    ['COFFEE FLAVOURS', 'Coffee Flavours'],
    ["Maggie's", 'Maggi Noodles'],
    ['MEXICAN STATERS', 'Mexican Starters'],
  ]);
  const labels = { V: 'Vegetarian', N: 'Non-vegetarian', E: 'Contains egg' };
  const spelling = new Map([
    ['CHACO LAVA WITH ICE CREAM', 'Choco Lava with Ice Cream'],
    ['VENNILA ICE CREAM', 'Vanilla Ice Cream'],
    ['mixed berry thickshek', 'Mixed Berry Thick Shake'],
    ['SCHEZWAN EGG FIREDRICE', 'Schezwan Egg Fried Rice'],
    ['veg friedrice', 'Veg Fried Rice'],
    ['PANNER WITH STEAMED VEGGIES', 'Paneer with Steamed Veggies'],
    ['TAKE AWAY', 'Takeaway'],
    ['takeawy', 'Takeaway'],
  ]);
  const featuredNames = [
    'Parichayam Harbour Pizza', 'Silky Cappuccino', 'Strawberry Matcha',
    'Chicken Crunchy Burger', 'Tropical Sunrise Mojito', 'Brownie with Ice Cream',
  ];
  const quickCategoryNames = [
    'Parichayam Specials', 'Pizza', 'hot coffees', 'Burgers', 'Iced Matcha Bloom',
    'Pasta', 'Rice Bowls', 'Desserts', 'Sandwiches', 'Chinese Starters',
  ];
  const pageSize = 18;
  const state = { category: 0, diet: '', search: '', limit: pageSize };
  const searchInput = query('#dish-search');
  const dietSelect = query('#diet');
  const grid = query('#dish-grid');
  const categoryDialog = query('#category-dialog');
  const dishDialog = query('#dish-dialog');
  const loadMore = query('#load-more');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let scrollEngine;

  function element(tag, cssClass, value) {
    const node = document.createElement(tag);
    if (cssClass) node.className = cssClass;
    if (value) node.textContent = value;
    return node;
  }

  function labelFor(name) {
    return categoryNames.get(name) ?? name;
  }

  function displayName(name) {
    if (spelling.has(name)) return spelling.get(name);
    if (name === 'DIET COKE') return 'Diet Coke';
    if (name === 'Rr chicken') return 'RR Chicken';
    if (name === 'PANNER 65') return 'Paneer 65';
    return name.replace(/\s+/g, ' ').replace(/(^|\s)\p{L}[\p{L}-]*/gu, word =>
      word[0] === ' ' ? ' ' + word[1].toUpperCase() + word.slice(2).toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()
    ).replace(/\bKfc\b/g, 'KFC').replace(/\bBbq\b/g, 'BBQ').replace(/\bNon-veg\b/gi, 'Non-Veg');
  }

  function imagePath(id) {
    return './media/' + id + '.webp';
  }

  function formatPrice(price) {
    return price.startsWith('from') ? 'From ₹' + price.slice(4) : '₹' + price;
  }

  function matchText(value) {
    return value.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  const searchable = flatMenu.map(dish => ({
    dish,
    text: matchText([dish.name, displayName(dish.name), dish.category, labelFor(dish.category), dish.description].join(' ')),
  }));

  function card(dish, showCategory) {
    const article = element('article', 'card');
    const button = element('button');
    button.type = 'button';
    button.dataset.dish = dish.id;
    button.setAttribute('aria-haspopup', 'dialog');
    const imageFrame = element('span', 'card-image');
    const image = element('img');
    image.alt = '';
    image.width = 380;
    image.height = 380;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = imagePath(dish.id);
    imageFrame.append(image);
    const copy = element('span', 'card-copy');
    if (showCategory) copy.append(element('span', 'card-category', labelFor(dish.category)));
    copy.append(element('span', 'card-name', displayName(dish.name)));
    const meta = element('span', 'card-meta');
    const price = element('span', 'card-price', formatPrice(dish.price));
    if (dish.diet) {
      const mark = element('span', 'diet-mark');
      mark.dataset.diet = dish.diet;
      mark.title = labels[dish.diet];
      mark.setAttribute('role', 'img');
      mark.setAttribute('aria-label', labels[dish.diet]);
      price.append(mark);
    }
    const arrow = element('span', 'card-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    meta.append(price, arrow);
    copy.append(meta);
    button.append(imageFrame, copy);
    article.append(button);
    return article;
  }

  function categoryButton(category, compact = false) {
    const button = element('button', compact ? 'pill' : 'category-row');
    button.type = 'button';
    button.dataset.category = category?.id ?? 0;
    const name = category ? labelFor(category.name) : 'All dishes';
    if (compact) button.textContent = name;
    else {
      const count = element('span', '', String(category?.items.length ?? flatMenu.length));
      count.setAttribute('aria-hidden', 'true');
      button.append(element('span', '', name), count);
    }
    button.setAttribute('aria-pressed', String(!category));
    return button;
  }

  function renderResults({ append = false, previousLimit = 0 } = {}) {
    const terms = matchText(state.search).split(' ').filter(Boolean);
    const matched = searchable.filter(({ dish, text }) =>
      (!state.category || dish.categoryId === state.category) &&
      (!state.diet || dish.diet === state.diet) &&
      terms.every(term => text.includes(term))
    ).map(({ dish }) => dish);

    const cards = matched.slice(append ? previousLimit : 0, state.limit)
      .map(dish => card(dish, !state.category));
    if (append) grid.append(...cards);
    else grid.replaceChildren(...cards);

    const category = categoryById.get(state.category);
    query('#results-title').textContent = category ? labelFor(category.name) : 'All dishes';
    const count = Math.min(state.limit, matched.length);
    query('#results-count').textContent = count === matched.length
      ? matched.length + (matched.length === 1 ? ' result' : ' results')
      : 'Showing ' + count + ' of ' + matched.length + ' results';
    query('#empty-state').hidden = matched.length > 0;
    loadMore.hidden = matched.length <= state.limit;
    if (append) cards[0]?.querySelector('button').focus();
  }

  function scrollTo(target, offset = 0) {
    if (scrollEngine) scrollEngine.scrollTo(target, { offset });
    else window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top + offset, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }

  function selectCategory(categoryId, jump) {
    state.category = categoryId;
    state.limit = pageSize;
    document.querySelectorAll('[data-category]').forEach(control => {
      control.setAttribute('aria-pressed', String(Number(control.dataset.category) === categoryId));
    });
    renderResults();
    if (jump) {
      const toolbar = query('.catalog-toolbar');
      const pinned = getComputedStyle(toolbar).position === 'sticky' ? toolbar.offsetHeight : 0;
      scrollTo(query('#results-start'), -14 - pinned);
    }
  }

  function showDetails(dish) {
    query('#detail-category').textContent = labelFor(dish.category);
    query('#dish-title').textContent = displayName(dish.name);
    query('#detail-price').textContent = formatPrice(dish.price);
    query('#detail-diet').textContent = labels[dish.diet] ?? '';
    const description = query('#detail-description');
    description.textContent = dish.description;
    description.hidden = !dish.description;
    query('#detail-image').src = imagePath(dish.id);
    dishDialog.showModal();
    if (!reduceMotion.matches && window.gsap) {
      window.gsap.fromTo(dishDialog, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'opacity,transform',
      });
    }
  }

  function configureMotion() {
    scrollEngine?.destroy();
    scrollEngine = undefined;
    if (!reduceMotion.matches && window.Lenis) {
      scrollEngine = new window.Lenis({ autoRaf: true, syncTouch: false });
    }
  }

  function animateEntrance() {
    if (reduceMotion.matches || !window.gsap) return;
    const timeline = window.gsap.timeline({ defaults: { duration: 0.72, ease: 'power3.out', clearProps: 'opacity,transform' } });
    timeline.from('.hero-copy > *', { opacity: 0.75, y: 12, stagger: 0.065 });
    timeline.from('.hero-figure', { y: 12 }, 0.07);
  }

  query('#featured').append(...featuredNames.map(name => card(flatMenu.find(dish => dish.name === name), true)));
  query('#hero-dish').dataset.dish = flatMenu.find(dish => dish.name === featuredNames[0]).id;
  for (const selector of ['#desktop-categories', '#drawer-categories']) {
    query(selector).append(categoryButton(null), ...categories.map(category => categoryButton(category)));
  }
  query('#quick-categories').append(categoryButton(null, true), ...quickCategoryNames.map(name =>
    categoryButton(categories.find(category => category.name === name), true)
  ));
  query('#menu-size').textContent = categories.length + ' categories · ' + flatMenu.length + ' items';

  document.addEventListener('click', event => {
    const dish = event.target.closest('[data-dish]');
    if (dish) showDetails(dishesById.get(Number(dish.dataset.dish)));

    const category = event.target.closest('[data-category]');
    if (category) {
      if (categoryDialog.open) categoryDialog.close();
      selectCategory(Number(category.dataset.category), true);
    }

    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !anchor.classList.contains('skip') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const target = document.getElementById(anchor.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      history.replaceState(null, '', anchor.hash);
      scrollTo(target, target.id === 'top' ? 0 : -12);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });

  for (const dialog of [categoryDialog, dishDialog]) {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }
  query('#category-toggle').addEventListener('click', () => categoryDialog.showModal());
  searchInput.addEventListener('input', () => {
    state.search = searchInput.value;
    state.limit = pageSize;
    renderResults();
  });
  dietSelect.addEventListener('change', () => {
    state.diet = dietSelect.value;
    state.limit = pageSize;
    renderResults();
  });
  query('#clear-filters').addEventListener('click', () => {
    state.search = searchInput.value = '';
    state.diet = dietSelect.value = '';
    searchInput.focus({ preventScroll: true });
    selectCategory(0, false);
  });
  loadMore.addEventListener('click', () => {
    const previousLimit = state.limit;
    state.limit += pageSize;
    renderResults({ append: true, previousLimit });
  });

  reduceMotion.addEventListener('change', configureMotion);
  renderResults();
  configureMotion();
  animateEntrance();
})();
