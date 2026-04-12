import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get('word') || 'Ban Sagar';
  const meaning = searchParams.get('meaning') || "Myanmar's Slang Dictionary";
  const pronunciation = searchParams.get('pronunciation') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a14 0%, #0f0f1e 50%, #0a0a14 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.08), transparent)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Logo */}
        <img
          src="https://bansagar.madebysai.com/favicon-192x192.png"
          width="80"
          height="80"
          style={{
            borderRadius: '16px',
            marginBottom: '32px',
          }}
        />

        {/* Word */}
        <div
          style={{
            fontSize: word.length > 20 ? '52px' : '64px',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.2,
            marginBottom: pronunciation ? '8px' : '16px',
          }}
        >
          {word}
        </div>

        {/* Pronunciation */}
        {pronunciation && (
          <div
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            /{pronunciation}/
          </div>
        )}

        {/* Meaning */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
            marginBottom: '40px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {meaning.length > 120 ? meaning.slice(0, 120) + '...' : meaning}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: '200px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            opacity: 0.6,
            marginBottom: '24px',
          }}
        />

        {/* Domain */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          bansagar.madebysai.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
