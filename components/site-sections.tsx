import { orderUrl, featuredDishes, type Dish } from '../lib/menu';
import DishCard from './dish-card';

function Brand({ home = false }: { home?: boolean }) {
  return (
    <a className="brand" href="#top" aria-label={home ? 'Parichayam Café home' : undefined}>
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>Parichayam <em>Café</em></span>
    </a>
  );
}

export function SiteHeader() {
  return (
    <>
      <a className="skip" href="#menu">Skip to menu</a>
      <header className="site-header shell">
        <Brand home />
        <nav aria-label="Main navigation">
          <a className="nav-link" href="#highlights">Highlights</a>
          <a className="nav-link" href="#menu">Menu</a>
          <a className="button button-outline" href={orderUrl}>Order at table <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
    </>
  );
}

export function Hero({ onSelect }: { onSelect: (dish: Dish) => void }) {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="rule" aria-hidden="true" /> THE TABLE MENU</p>
        <h1 id="hero-title">Good things<br /> <em>at the table.</em></h1>
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
  return (
    <section className="highlights shell" id="highlights" aria-labelledby="highlights-title">
      <header className="section-head">
        <div>
          <p className="eyebrow"><span className="rule" aria-hidden="true" /> A FEW TO TRY</p>
          <h2 id="highlights-title">From <em>our table.</em></h2>
        </div>
        <a className="text-link" href="#menu">See full menu <span aria-hidden="true">↗</span></a>
      </header>
      <div className="feature-rail" aria-label="Featured dishes">
        {featuredDishes.map(dish => <DishCard key={dish.id} dish={dish} showCategory onSelect={onSelect} />)}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="shell footer-inner">
        <div><Brand /><p>Menu images are illustrative.</p></div>
        <div className="footer-links">
          <a href={orderUrl}>Order at table ↗</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
