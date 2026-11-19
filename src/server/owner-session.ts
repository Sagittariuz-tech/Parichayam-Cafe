import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
const cookieName = 'parichayam-owner';
const secret = () => process.env.CAFE_OWNER_SESSION_SECRET || 'parichayam-demo-session-only-change-before-production';
export function validCredentials(email: unknown, password: unknown, role = 'owner') {
  const equal = (a: string, b: string) => {
    const digest = (s: string) => createHmac('sha256', secret()).update(s).digest();
    return timingSafeEqual(digest(a), digest(b));
  };
  return typeof email === 'string' && typeof password === 'string' &&
    equal(email.trim().toLowerCase(), role + '@parichayam.cafe') &&
    equal(password, (role === 'owner' ? 'Parichayam@2026' : role === 'staff' ? 'Staff@2026' : 'Developer@2026'));
}
export async function ownerSession(role = 'owner') {
  const token = (await cookies()).get(cookieName + role)?.value;
  if (!token) return false;
  const [expiry, signature] = token.split('.');
  if (!expiry || !signature || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;
  const expected = createHmac('sha256', secret()).update(expiry).digest('hex');
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export async function setOwnerSession(secure: boolean, role = 'owner') {
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  const signature = createHmac('sha256', secret()).update(expiry).digest('hex');
  (await cookies()).set(cookieName + role, expiry + '.' + signature, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge: 28800 });
}
export async function clearOwnerSession() { for(const role of ['owner','staff','developer']) (await cookies()).delete(cookieName + role); }
