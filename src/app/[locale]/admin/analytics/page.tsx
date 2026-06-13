import { notFound } from 'next/navigation';
import { getAnalyticsStats, type AnalyticsStats } from '@/lib/analytics/db';
import { requireLocale } from '@/lib/locale';

const PAGE_TITLES = {
  zh: { title: '流量统计', total: '总浏览量', pages: '热门页面', referrers: '来源', countries: '地区分布', daily: '每日趋势', noData: '暂无数据', views: '次浏览', days: '天' },
  en: { title: 'Analytics', total: 'Total Views', pages: 'Top Pages', referrers: 'Top Referrers', countries: 'Country Distribution', daily: 'Daily Trend', noData: 'No data yet', views: 'views', days: 'days' },
} as const;

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);

  // Access control: require ANALYTICS_SECRET to be configured
  const secret = process.env.ANALYTICS_SECRET;
  if (!secret) {
    notFound();
  }

  const stats = getAnalyticsStats(30);
  const t = PAGE_TITLES[locale];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t.title}</h1>

      {/* Total views */}
      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-500">{t.total} (30 {t.days})</h2>
        <p className="text-4xl font-bold">{stats.totalViews.toLocaleString()}</p>
      </section>

      {/* Daily trend bar chart */}
      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.daily}</h2>
        <DailyChart data={stats.dailyViews} />
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Top pages */}
        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.pages}</h2>
          <StatTable
            items={stats.topPages}
            labelKey="path"
            valueKey="views"
            emptyText={t.noData}
          />
        </section>

        {/* Top referrers */}
        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.referrers}</h2>
          <StatTable
            items={stats.topReferrers}
            labelKey="referrer"
            valueKey="views"
            emptyText={t.noData}
          />
        </section>
      </div>

      {/* Country stats */}
      <section className="mt-8 rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.countries}</h2>
        <StatTable
          items={stats.countryStats}
          labelKey="country"
          valueKey="views"
          emptyText={t.noData}
        />
      </section>
    </div>
  );
}

function DailyChart({ data }: { data: AnalyticsStats['dailyViews'] }) {
  if (data.length === 0) {
    return <p className="text-gray-400">No data</p>;
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: 160 }}>
      {data.map((day) => {
        const height = Math.max((day.views / maxViews) * 140, 2);
        return (
          <div key={day.date} className="group relative flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t bg-blue-500 transition-colors group-hover:bg-blue-600"
              style={{ height }}
            />
            <span className="mt-1 text-[10px] text-gray-400">
              {day.date.slice(5)}
            </span>
            <span className="pointer-events-none absolute -top-6 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              {day.date}: {day.views}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatTable<T>({
  items,
  labelKey,
  valueKey,
  emptyText,
}: {
  items: T[];
  labelKey: keyof T & string;
  valueKey: keyof T & string;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{emptyText}</p>;
  }

  return (
    <table className="w-full text-sm">
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b last:border-0">
            <td className="py-2 pr-4 font-mono text-gray-700 truncate max-w-[200px]">
              {String(item[labelKey] || '(direct)')}
            </td>
            <td className="py-2 text-right font-semibold">
              {Number(item[valueKey]).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
