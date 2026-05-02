import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
const API_OR_ASSET = /^\/(api|assets|fonts|favicon|og-image|robots|sitemap|manifest)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_EXTENSIONS.test(pathname) || API_OR_ASSET.test(pathname)) {
    return NextResponse.next();
  }

  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_AGENTS.some(bot => ua.includes(bot));

  if (!isBot) {
    return NextResponse.next();
  }

  const renderUrl = new URL('/api/render', request.url);
  renderUrl.searchParams.set('path', pathname);

  return NextResponse.rewrite(renderUrl);
}

export const config = {
  matcher: ['/((?!api|_next|assets|fonts|favicon|robots|sitemap|manifest).*)'],
};
