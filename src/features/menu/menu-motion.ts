import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const motionPreference = '(prefers-reduced-motion: reduce)';

export function useMenuMotion() {
  const engine = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ lerp: 0.085, syncTouch: false });
      engine.current = lenis;
      const update = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', update);
      gsap.ticker.add(tick);

      const heroLetters = gsap.utils.toArray<HTMLElement>('.hero .reveal-letter');
      gsap.from(heroLetters, { yPercent: 85, opacity: 0.25, duration: 1, ease: 'power4.out', stagger: 0.025 });
      gsap.from('.hero-intro, .hero .button-primary', { y: 12, opacity: 0.55, duration: 0.8, delay: 0.18, stagger: 0.08 });
      gsap.from('.hero-figure', { y: 14, duration: 1.1, ease: 'power3.out' });

      for (const title of gsap.utils.toArray<HTMLElement>('[data-scroll-title]')) {
        const letters = title.querySelectorAll('.reveal-letter');
        gsap.from(letters, {
          yPercent: 92, opacity: 0.2, duration: 0.92, stagger: 0.03, ease: 'power4.out',
          scrollTrigger: { trigger: title, start: 'top 92%', once: true },
        });
      }

      return () => {
        gsap.ticker.remove(tick);
        lenis.off('scroll', update);
        lenis.destroy();
        engine.current = null;
      };
    });
    return () => media.revert();
  }, []);

  return (target: HTMLElement, offset = 0) => {
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top + offset);
    if (engine.current) engine.current.scrollTo(top, { duration: 0.95 });
    else window.scrollTo({ top, behavior: matchMedia(motionPreference).matches ? 'instant' : 'smooth' });
  };
}

export function animateDishDialog(dialog: HTMLDialogElement) {
  if (matchMedia(motionPreference).matches) return;
  gsap.fromTo(dialog, { opacity: 0, y: 12 }, {
    opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,transform', overwrite: true,
  });
}

