import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { CloseDialog, closeOnBackdrop } from '@/components/modal-controls';
import { CategoryButtons } from './category-buttons';
import { prefersReducedMotion } from './menu-motion';
import { RevealWords } from './reveal-words';

export default function CategoryDrawer({ dialogRef, open, selected, onSelect, onClose }: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  open: boolean;
  selected: number;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const drawer = dialogRef.current;
    const wrapper = viewport.current;
    const content = list.current;
    if (!open || !drawer || !wrapper || !content) return;
    if (!drawer.open) drawer.showModal();
    if (prefersReducedMotion()) return;

    // Desktop wheel easing stays inside the drawer. Touch retains native momentum.
    const lenis = new Lenis({ wrapper, content, eventsTarget: wrapper, lerp: 0.115, syncTouch: false });
    const frame = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(frame);
    const titleLetters = drawer.querySelectorAll('h2 .reveal-letter');
    const rowNames = content.querySelectorAll('.category-name');

    const entrance = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'opacity,transform' } });
    entrance.fromTo(drawer, { y: 24, scale: 0.98, opacity: 0.2 }, { y: 0, scale: 1, opacity: 1, duration: 0.44 });
    entrance.from(titleLetters, { yPercent: 70, opacity: 0.3, duration: 0.48, stagger: 0.025 }, 0.1);

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        gsap.fromTo(entry.target, { x: -5, opacity: 0.45 }, {
          x: 0, opacity: 1, duration: 0.32, ease: 'power2.out', clearProps: 'opacity,transform',
        });
        observer.unobserve(entry.target);
      }
    }, { root: wrapper, threshold: 0.5 });
    rowNames.forEach(row => observer.observe(row));

    return () => {
      observer.disconnect();
      entrance.kill();
      gsap.killTweensOf(rowNames);
      gsap.set([drawer, ...titleLetters, ...rowNames], { clearProps: 'opacity,transform' });
      gsap.ticker.remove(frame);
      lenis.destroy();
    };
  }, [dialogRef, open]);

  return (
    <dialog ref={dialogRef} id="category-dialog" className="dialog categories-dialog"
      aria-labelledby="category-title" data-lenis-prevent onClick={closeOnBackdrop} onClose={onClose}>
      <header className="dialog-header">
        <h2 id="category-title"><RevealWords text="Categories" /></h2>
        <CloseDialog label="Close categories" />
      </header>
      <div className="category-scroll" ref={viewport}>
        <nav ref={list} aria-label="All menu categories">
          <CategoryButtons selected={selected} onSelect={onSelect} />
        </nav>
      </div>
    </dialog>
  );
}
