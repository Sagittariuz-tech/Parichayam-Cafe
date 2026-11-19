import { redirect } from 'next/navigation';
import { ownerSession } from '@/server/owner-session';
import OwnerLogin from '@/features/owner/login';
import '@/features/owner/owner.css';
export const metadata = { title: 'Owner Sign In | Parichayam Café', robots: { index: false, follow: false } };
export default async function Page() {
  if (await ownerSession()) redirect('/dashboard');
  return <OwnerLogin />;
}
