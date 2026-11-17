export const cafeTimeZone = 'Asia/Kolkata';

export function cafeDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: cafeTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export function greetingPeriod() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: cafeTimeZone, hour: '2-digit', hourCycle: 'h23',
  }).format(new Date()));
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return hour < 21 ? 'evening' : 'night';
}

