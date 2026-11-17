import type { Metadata } from 'next';
import StaffDashboard from '@/features/hospitality/staff-dashboard';

export const metadata: Metadata = {
  title: 'Parichayam Café — Staff desk',
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return <StaffDashboard />;
}
