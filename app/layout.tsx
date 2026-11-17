import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import './globals.css';

const bodyFont = localFont({
  src: '../public/fonts/dm-sans.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-body',
});

const displayFont = localFont({
  src: [
    { path: '../public/fonts/instrument-serif.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Parichayam Café — The Table Menu',
  description: 'Browse the Parichayam Café menu, from coffee and matcha to pizzas, rice bowls and dessert.',
  icons: { icon: '/media/favicon.png' },
};

export const viewport: Viewport = { themeColor: '#f6f1e7' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={bodyFont.variable + ' ' + displayFont.variable}>
      <body id="top">{children}</body>
    </html>
  );
}
