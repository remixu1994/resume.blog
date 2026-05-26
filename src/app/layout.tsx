import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Remi Resume',
  description: 'Full-stack engineering, architecture, self-hosting, fitness, recipes, and AI product work.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
