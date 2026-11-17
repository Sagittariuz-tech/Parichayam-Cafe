'use client';

import { useState, type MouseEvent } from 'react';
import type { Dish } from '../lib/menu';
import DishDialog from './dish-dialog';
import MenuCatalog from './menu-catalog';
import { useMenuMotion } from './menu-motion';
import { Hero, Highlights, SiteFooter, SiteHeader } from './site-sections';

export default function CafeMenu() {
  const [dish, setDish] = useState<Dish | null>(null);
  const scrollTo = useMenuMotion();

  function followAnchor(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element) || event.defaultPrevented || event.metaKey ||
      event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]:not(.skip)');
    if (!anchor) return;
    const target = document.getElementById(anchor.hash.slice(1));
    if (!target) return;

    event.preventDefault();
    history.replaceState(null, '', anchor.hash);
    scrollTo(target, target.id === 'top' ? 0 : -12);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  return (
    <div onClick={followAnchor}>
      <SiteHeader />
      <main>
        <Hero onSelect={setDish} />
        <Highlights onSelect={setDish} />
        <MenuCatalog onSelectDish={setDish} scrollTo={scrollTo} />
      </main>
      <SiteFooter />
      <DishDialog dish={dish} onClose={() => setDish(null)} />
    </div>
  );
}
