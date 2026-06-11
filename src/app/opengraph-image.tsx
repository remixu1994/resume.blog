import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: 'linear-gradient(135deg, #f7fbfa 0%, #ecf5f2 55%, #dff0eb 100%)',
          color: '#043d35',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: '72px',
          width: '100%',
        }}
      >
        <div
          style={{
            border: '2px solid rgba(4, 61, 53, 0.12)',
            borderRadius: '999px',
            color: '#075f52',
            fontSize: 26,
            padding: '12px 24px',
            alignSelf: 'flex-start',
          }}
        >
          Remi Resume
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 920 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
            Full-stack engineering, architecture, self-hosting, and AI product work
          </div>
          <div style={{ color: '#35524a', fontSize: 30, lineHeight: 1.4 }}>
            Resume, architecture cases, technical writing, and delivery evidence in one modern Next.js site.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
