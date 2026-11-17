import { useRef, useState } from 'react';
import Image from 'next/image';
import { featuredDishes, type Dish } from './menu';
import DishCard from './dish-card';
import { RevealWords } from './reveal-words';

function Brand({ home = false }: { home?: boolean }) {
  return (
    <a className="brand" href="#top" aria-label={home ? 'Parichayam Café home' : undefined}>
      <span className="brand-logo"><Image src="/brand/parichayam.svg" alt="" width={30} height={42} unoptimized /></span>
      <span>Parichayam <em>Café</em></span>
    </a>
  );
}

type ReserveProps = { onReserve: () => void };

export function SiteHeader({ onReserve }: ReserveProps) {
  return (
    <>
      <a className="skip" href="#menu">Skip to menu</a>
      <header className="site-header shell">
        <Brand home />
        <nav aria-label="Main navigation">
          <a className="nav-link" href="#highlights">Highlights</a>
          <a className="nav-link" href="#menu">Menu</a>
          <button className="button button-reserve" type="button" aria-haspopup="dialog" onClick={onReserve}>Reserve a table <span className="reserve-arrow" aria-hidden="true">↗</span></button>
        </nav>
      </header>
    </>
  );
}

export function Hero({ onSelect }: { onSelect: (dish: Dish) => void }) {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">THE TABLE MENU</p>
        <h1 id="hero-title"><RevealWords text="Good things" /><br />{' '}<em><RevealWords text="at the table." /></em></h1>
        <p className="hero-intro">Come for a coffee. Stay for a slice.</p>
        <a className="button button-primary" href="#menu">Explore the menu <span aria-hidden="true">↓</span></a>
      </div>
      <figure className="hero-figure">
        <div className="hero-picture">
          <img src="/media/hero.webp" srcSet="/media/hero-small.webp 700w, /media/hero.webp 1400w"
            sizes="(max-width: 700px) 92vw, 55vw"
            alt="A hand lifts a slice of chicken and prawn pizza beside a cappuccino" width={1400} height={933} fetchPriority="high" />
        </div>
        <figcaption>
          <span>FROM THE PARICHAYAM TABLE</span>
          <button type="button" aria-haspopup="dialog" onClick={() => onSelect(featuredDishes[0])}>
            Harbour Pizza <span aria-hidden="true">↗</span>
          </button>
        </figcaption>
      </figure>
    </section>
  );
}

export function Highlights({ onSelect }: { onSelect: (dish: Dish) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  function trackSlide() {
    const track = rail.current;
    if (!track || !track.children[1]) return;
    const step = (track.children[1] as HTMLElement).offsetLeft;
    if (step > 0) setSlide(Math.min(featuredDishes.length - 1, Math.max(0, Math.round(track.scrollLeft / step))));
  }

  function goTo(index: number) {
    const card = rail.current?.children[index] as HTMLElement | undefined;
    rail.current?.scrollTo({
      left: card?.offsetLeft,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  return (
    <section className="highlights shell" id="highlights" aria-labelledby="highlights-title">
      <header className="section-head">
        <div>
          <p className="eyebrow">A FEW TO TRY</p>
          <h2 id="highlights-title" data-scroll-title><RevealWords text="From" /> <em><RevealWords text="our table." /></em></h2>
        </div>
        <a className="text-link" href="#menu">See full menu <span aria-hidden="true">↗</span></a>
      </header>
      <div className="feature-rail" ref={rail} onScroll={trackSlide} aria-label="Featured dishes" id="featured-dishes">
        {featuredDishes.map(dish => <DishCard key={dish.id} dish={dish} showCategory onSelect={onSelect} />)}
      </div>
      <div className="feature-controls" aria-label="Featured dish navigation">
        <button type="button" className="icon-button" aria-label="Previous featured dish" aria-controls="featured-dishes" disabled={slide === 0} onClick={() => goTo(slide - 1)}>←</button>
        <span aria-live="polite">{slide + 1} / {featuredDishes.length}</span>
        <button type="button" className="icon-button" aria-label="Next featured dish" aria-controls="featured-dishes" disabled={slide === featuredDishes.length - 1} onClick={() => goTo(slide + 1)}>→</button>
      </div>
    </section>
  );
}

export function SiteFooter({ onReserve }: ReserveProps) {
  return (
    <footer>
      <div className="shell footer-inner">
        <div><Brand /><p>Menu images are illustrative.</p></div>
        <div className="footer-links">
          <button type="button" className="plain-action" aria-haspopup="dialog" onClick={onReserve}>Reserve a table ↗</button>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
