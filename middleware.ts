export const config = {
  matcher: ['/((?!api|_next|assets|fonts|favicon|robots|sitemap|manifest).*)'],
};

const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'discordbot',
];

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|json|xml|txt|webp|mp4|webm)$/i;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (STATIC_EXTENSIONS.test(pathname)) {
    return;
  }

  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_AGENTS.some(bot => ua.includes(bot));

  if (!isBot) {
    return;
  }

  const renderUrl = new URL('/api/render', request.url);
  renderUrl.searchParams.set('path', pathname);

  return fetch(renderUrl);
}
