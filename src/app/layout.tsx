import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';
import { getSiteOrigin } from '@/lib/seo';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansSc = Noto_Sans_SC({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${getSiteOrigin()}/`),
  title: {
    default: 'Remi Resume',
    template: '%s | Remi Resume',
  },
  description: 'Full-stack engineering, architecture, self-hosting, fitness, recipes, and AI product work.',
  applicationName: 'Remi Resume',
  authors: [{ name: 'Remi' }],
  creator: 'Remi',
  publisher: 'Remi',
  keywords: ['full-stack engineer', 'architecture', 'resume', 'blog', 'self-hosting', 'AI engineering'],
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'Remi Resume (All)' },
        { url: '/zh/feed.xml', title: 'Remi Resume (中文)' },
        { url: '/en/feed.xml', title: 'Remi Resume (English)' },
      ],
    },
  },
  openGraph: {
    type: 'website',
    title: 'Remi Resume',
    description: 'Full-stack engineering, architecture, self-hosting, fitness, recipes, and AI product work.',
    siteName: 'Remi Resume',
    images: [
      {
        url: '/opengraph-image',
        alt: 'Remi Resume',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remi Resume',
    description: 'Full-stack engineering, architecture, self-hosting, fitness, recipes, and AI product work.',
    images: ['/twitter-image'],
  },
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
      <body className={`${inter.variable} ${notoSansSc.variable}`}>{children}</body>
    </html>
  );
}
