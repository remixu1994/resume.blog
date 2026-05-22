import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moon Devfolio',
  description: 'Full-stack engineering, architecture, self-hosting, fitness, recipes, and AI product work.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
