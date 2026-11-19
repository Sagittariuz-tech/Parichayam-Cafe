import { redirect } from 'next/navigation';
import { ownerSession } from '@/server/owner-session';
import OwnerDashboard from '@/features/owner/dashboard';
import '@/features/owner/owner.css';
export const metadata = { title: 'Owner’s Desk | Parichayam Café', robots: { index: false, follow: false } };
export default async function Page() {
  if (!await ownerSession()) redirect('/owner-login');
  return <OwnerDashboard />;
}
