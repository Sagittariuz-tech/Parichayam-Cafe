import { useEffect, useState } from 'react';
import Image from 'next/image';
import { greetingPeriod } from '@/lib/cafe-time';

const portraits = [
  { image: 'waiter', role: 'Your waiter' },
  { image: 'chef', role: 'The café chef' },
  { image: 'barista', role: 'Behind the coffee bar' },
  { image: 'baker', role: 'From the café kitchen' },
  { image: 'head-chef', role: 'The head chef' },
  { image: 'host', role: 'Your café host' },
];

const welcomes = [
  'Welcome to Parichayam. Take a seat and make yourself at home.',
  'Come on in. There’s always room for a good bite and a long chat.',
  'Lovely to see you. Have a look around the menu and take your time.',
  'Glad you found us. What sounds good today?',
  'Pull up a chair. A little café time looks good on you.',
  'You picked a good moment to stop by. Take your time and find something you love.',
  'Hello from the Parichayam team. We’re glad you’re at our table.',
  'A warm welcome from all of us. We hope you find a new favourite today.',
  'Settle in. The coffee can be quick, but the conversation can take its time.',
  'Welcome! The menu is yours to explore, from the first sip to the last bite.',
  'Come in hungry or just curious. Either way, we’re happy to see you.',
  'It’s good to have you here. Take a look and see what catches your eye.',
];

const orderLines = [
  { title: 'You’ve got good taste!', line: (dish: string) => 'I’ve put ' + dish + ' in the kitchen queue for you.' },
  { title: 'That’s a lovely pick.', line: (dish: string) => dish + ' is on the kitchen list. Thanks for letting us cook for you.' },
  { title: 'Glad you chose that one.', line: (dish: string) => 'Your order for ' + dish + ' is in. Get comfortable while the team takes it from here.' },
  { title: 'A very good call.', line: (dish: string) => 'We’ve got your order for ' + dish + '. I hope the first bite makes you smile.' },
  { title: 'I like your style.', line: (dish: string) => 'We’ve added ' + dish + ' to the team’s queue. Take a moment to enjoy the table.' },
  { title: 'That’s a keeper.', line: (dish: string) => 'Your ' + dish + ' has joined the kitchen queue. Glad you’re here to try it.' },
  { title: 'Well chosen.', line: (dish: string) => 'I’ve sent ' + dish + ' to the café queue. There’s nothing more you need to do for now.' },
  { title: 'You knew what you wanted.', line: (dish: string) => 'We’ve received your order for ' + dish + '. Let the conversation carry on while we take it from here.' },
  { title: 'A fine choice for your table.', line: (dish: string) => dish + ' is on our list. It’s a pleasure to have you with us.' },
  { title: 'Excellent pick.', line: (dish: string) => 'The café queue has your ' + dish + '. I hope it turns out to be just what you were craving.' },
  { title: 'Good eye.', line: (dish: string) => 'We’ve saved your order for ' + dish + '. Thanks for spending a little time with us.' },
  { title: 'That sounds good already.', line: (dish: string) => 'I’ve sent ' + dish + ' to the kitchen queue. Make yourself at home while the team takes a look.' },
];

function randomIndex(key: string, length: number) {
  let previous = -1;
  try { previous = Number(sessionStorage.getItem(key) ?? '-1'); } catch {}
  const excludePrevious = Number.isInteger(previous) && previous >= 0 && previous < length;
  let index = Math.floor(Math.random() * (length - Number(excludePrevious)));
  if (excludePrevious && index >= previous) index++;
  try { sessionStorage.setItem(key, String(index)); } catch {}
  return index;
}

export function nextOrderGreeting() {
  return {
    portrait: randomIndex('parichayam-last-portrait', portraits.length),
    message: randomIndex('parichayam-last-order-message', orderLines.length),
  };
}

export function OrderCharacter({ greeting, dish }: { greeting: ReturnType<typeof nextOrderGreeting>; dish: string }) {
  const person = portraits[greeting.portrait];
  const message = orderLines[greeting.message];
  return (
    <>
      <Image className="receipt-portrait" src={'/staff/' + person.image + '.webp'} alt="" width={190} height={190} unoptimized />
      <p className="eyebrow">{person.role}</p>
      <h2 id="dish-title" tabIndex={-1}>{message.title}</h2>
      <p>{message.line(dish)} Have a wonderful {greetingPeriod()}.</p>
    </>
  );
}

export function CafeWelcome() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const period = greetingPeriod();
      const line = welcomes[randomIndex('parichayam-last-welcome', welcomes.length)];
      setMessage('Good ' + (period === 'night' ? 'evening' : period) + '! ' + line);
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
