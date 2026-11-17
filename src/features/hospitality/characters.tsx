import { useEffect, useState } from 'react';
import Image from 'next/image';
import { greetingPeriod } from '@/lib/cafe-time';

const portraits = [
  { image: 'waiter', role: 'Your waiter', title: 'You’ve got good taste!', line: (dish: string) => 'I’ve put ' + dish + ' in our kitchen queue for you.' },
  { image: 'chef', role: 'The café chef', title: 'That’s a lovely pick.', line: (dish: string) => dish + ' is on the kitchen list. Thanks for letting us cook for you.' },
  { image: 'barista', role: 'Behind the coffee bar', title: 'Excellent choice!', line: (dish: string) => 'Your ' + dish + ' is on the team’s list. Make yourself comfortable.' },
  { image: 'baker', role: 'From the café kitchen', title: 'You know the good stuff.', line: (dish: string) => 'We’ve got your order for ' + dish + '. Hope it makes your day a little sweeter.' },
  { image: 'head-chef', role: 'The head chef', title: 'Now that’s an order I like.', line: (dish: string) => 'The kitchen has ' + dish + ' in its queue. Take a moment to enjoy the company at your table.' },
  { image: 'host', role: 'Your café host', title: 'A wonderful choice.', line: (dish: string) => 'I’ve sent ' + dish + ' to our café team’s queue. I’m glad you’re here.' },
];

let lastCharacter = -1;

export function nextCharacter() {
  lastCharacter = lastCharacter < 0
    ? Math.floor(Math.random() * portraits.length)
    : (lastCharacter + 1) % portraits.length;
  return lastCharacter;
}

export function OrderCharacter({ character, dish }: { character: number; dish: string }) {
  const person = portraits[character];
  return (
    <>
      <Image className="receipt-portrait" src={'/staff/' + person.image + '.webp'} alt="" width={190} height={190} unoptimized />
      <p className="eyebrow">{person.role}</p>
      <h2 id="dish-title" tabIndex={-1}>{person.title}</h2>
      <p>{person.line(dish)} Have a wonderful {greetingPeriod()}.</p>
    </>
  );
}

export function CafeWelcome() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('parichayam-welcome') === 'shown'; } catch {}
    if (seen) return;
    const timer = window.setTimeout(() => {
      setMessage('Good ' + (greetingPeriod() === 'night' ? 'evening' : greetingPeriod()) + '! Welcome to Parichayam. We’re glad you’re here.');
      try { sessionStorage.setItem('parichayam-welcome', 'shown'); } catch {}
    }, 1450);
    return () => window.clearTimeout(timer);
  }, []);

  if (!message) return null;
  return (
    <aside className="welcome-toast" aria-label="Café welcome">
      <Image src="/staff/host.webp" alt="" width={76} height={76} unoptimized />
      <p role="status">{message}</p>
      <button type="button" className="icon-button" aria-label="Dismiss welcome" onClick={() => setMessage('')}>×</button>
    </aside>
  );
}

