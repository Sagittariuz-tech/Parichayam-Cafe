import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from 'lenis';

const motionPreference = '(prefers-reduced-motion: reduce)';

export function useMenuMotion() {
  const engine = useRef<Lenis | null>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ autoRaf: true, syncTouch: false });
      engine.current = lenis;

      const entrance = gsap.timeline({ defaults: { duration: 0.72, ease: 'power3.out', clearProps: 'opacity,transform' } });
      entrance.from('.hero-copy > *', { opacity: 0.75, y: 12, stagger: 0.065 });
      entrance.from('.hero-figure', { y: 12 }, 0.07);

      return () => {
        lenis.destroy();
        engine.current = null;
      };
    });
    return () => media.revert();
  }, []);

  return (target: HTMLElement, offset = 0) => {
    if (engine.current) {
      engine.current.scrollTo(target, { offset });
    } else {
      window.scrollTo({
        top: window.scrollY + target.getBoundingClientRect().top + offset,
        behavior: matchMedia(motionPreference).matches ? 'instant' : 'smooth',
      });
    }
  };
}

export function animateDishDialog(dialog: HTMLDialogElement) {
  if (matchMedia(motionPreference).matches) return;
  gsap.fromTo(dialog, { opacity: 0, y: 12 }, {
    opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'opacity,transform',
  });
}
