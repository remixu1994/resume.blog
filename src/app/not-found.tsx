import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404',
  description: 'The requested page could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

const quickLinks = [
  { href: '/zh', label: '中文首页' },
  { href: '/en', label: 'English home' },
  { href: '/zh/resume', label: '简历' },
  { href: '/en/resume', label: 'Resume' },
  { href: '/zh/blog', label: '技术博客' },
  { href: '/en/blog', label: 'Blog' },
];

export default function NotFound() {
  return (
    <main className="not-found">
      <section className="not-found-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="lede">The page may have moved during the migration. Use the quick links below to continue browsing.</p>
        <div className="not-found-actions">
          {quickLinks.map((item) => (
            <Link className={item.href.endsWith('/blog') ? 'button-muted' : 'button'} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
