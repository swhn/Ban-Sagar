import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const BASE_URL = 'https://bansagar.com';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Server configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Slang detail pages
  const slangMatch = path.match(/^\/slang\/(.+)$/);
  if (slangMatch) {
    return renderSlangPage(supabase, slangMatch[1]);
  }

  // Home page
  if (path === '/') {
    return renderHomePage(supabase);
  }

  // Static pages
  const staticPages: Record<string, { title: string; description: string; h1: string }> = {
    '/about': {
      title: 'About',
      description: 'Learn about Ban Sagar, Myanmar\'s community-driven slang dictionary.',
      h1: 'About Ban Sagar — Myanmar Slang Dictionary',
    },
    '/contact': {
      title: 'Contact',
      description: 'Get in touch with the Ban Sagar team. Report issues, share feedback, or suggest improvements.',
      h1: 'Contact Ban Sagar',
    },
    '/privacy': {
      title: 'Privacy Policy',
      description: "Ban Sagar's privacy policy. Learn how we collect, use, and protect your data.",
      h1: 'Privacy Policy',
    },
    '/contribute': {
      title: 'Contribute',
      description: "Contribute to Myanmar's largest slang dictionary. Add words, vote, earn badges, and climb the leaderboard.",
      h1: 'Contribute to Myanmar Slang Dictionary',
    },
    '/leaderboard': {
      title: 'Leaderboard',
      description: 'Top contributors to the Myanmar slang dictionary. See rankings, badges, and achievements.',
      h1: 'Contributor Leaderboard',
    },
  };

  if (staticPages[path]) {
    const page = staticPages[path];
    const body = `
      <header><h1>${escapeHtml(page.h1)}</h1></header>
      <main><p>${escapeHtml(page.description)}</p></main>
      <nav>
        <a href="/">Home</a> |
        <a href="/contribute">Contribute</a> |
        <a href="/leaderboard">Leaderboard</a> |
        <a href="/about">About</a> |
        <a href="/contact">Contact</a>
      </nav>
    `;
    return renderPage(
      `${page.title} | Ban Sagar ဗန်းစကား`,
      page.description,
      body,
      path
    );
  }

  return new Response('Not found', { status: 404 });
}

async function renderSlangPage(supabase: any, slug: string) {
  let { data: slang } = await supabase
    .from('slangs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!slang) {
    ({ data: slang } = await supabase
      .from('slangs')
      .select('*')
      .eq('id', slug)
      .eq('status', 'approved')
      .single());
  }

  if (!slang) {
    return new Response('Not found', { status: 404 });
  }

  const pageSlug = slang.slug || slang.id;
  const title = `${slang.word}${slang.pronunciation ? ` (${slang.pronunciation})` : ''} — Meaning | Ban Sagar ဗန်းစကား`;
  const description = `${slang.word}: ${slang.meaning || slang.meaning_burmese || ''}`.slice(0, 160);
  const pageUrl = `/slang/${pageSlug}`;

  const examplesHtml = slang.examples?.length
    ? `<section><h2>Examples</h2><ul>${slang.examples.map((ex: string) => `<li>"${escapeHtml(ex)}"</li>`).join('')}</ul></section>`
    : '';

  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: slang.word, item: `${BASE_URL}${pageUrl}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      name: slang.word,
      description: slang.meaning,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: 'Ban Sagar - Myanmar Slang Words Dictionary',
        url: BASE_URL,
      },
      url: `${BASE_URL}${pageUrl}`,
      ...(slang.pronunciation ? { termCode: slang.pronunciation } : {}),
      ...(slang.meaning_burmese ? { alternateName: slang.meaning_burmese } : {}),
    },
  ]);

  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>${escapeHtml(slang.word)}</span></nav>
    <article itemscope itemtype="https://schema.org/DefinedTerm">
      <header>
        <h1 itemprop="name">${escapeHtml(slang.word)} — Myanmar Slang Word</h1>
        ${slang.pronunciation ? `<p>Pronunciation: <span itemprop="termCode">/${escapeHtml(slang.pronunciation)}/</span></p>` : ''}
      </header>
      <section>
        <h2>English Meaning</h2>
        <p itemprop="description">${escapeHtml(slang.meaning || '')}</p>
      </section>
      ${slang.meaning_burmese ? `<section><h2>Burmese Meaning (အဓိပ္ပါယ်)</h2><p>${escapeHtml(slang.meaning_burmese)}</p></section>` : ''}
      ${examplesHtml}
      <footer>
        <p>Views: ${slang.views || 0} | Upvotes: ${slang.upvotes || 0}</p>
        ${slang.author_name ? `<p>Contributed by ${escapeHtml(slang.author_name)}</p>` : ''}
      </footer>
    </article>
    <nav>
      <h2>Explore More</h2>
      <ul>
        <li><a href="/">Browse all Myanmar slang words</a></li>
        <li><a href="/contribute">Contribute a new word</a></li>
        <li><a href="/about">About Ban Sagar</a></li>
      </ul>
    </nav>
    <script type="application/ld+json">${jsonLd}</script>
  `;

  const keywords = `${slang.word}, ${slang.word} meaning, ${slang.word} in English, ${slang.word} ဗန်းစကား, ${slang.word} definition, myanmar slang`;

  const ogParams = new URLSearchParams({ word: slang.word });
  if (slang.meaning) ogParams.set('meaning', slang.meaning.slice(0, 150));
  if (slang.pronunciation) ogParams.set('pronunciation', slang.pronunciation);
  const ogImage = `${BASE_URL}/api/og?${ogParams.toString()}`;

  return renderPage(title, description, body, pageUrl, keywords, ogImage);
}

async function renderHomePage(supabase: any) {
  const { data: slangs } = await supabase
    .from('slangs')
    .select('word, slug, id, meaning, pronunciation')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  const title = 'Ban Sagar (ဗန်းစကား) — Myanmar Slang Words Dictionary';
  const description = 'ဗန်းစကား အဘိဓာန် — The largest Myanmar slang words dictionary. Discover, learn, and contribute to Burmese street language, colloquial expressions, and trending slang.';

  const wordListHtml = (slangs || []).map((s: any) => {
    const href = `/slang/${s.slug || s.id}`;
    return `<li><a href="${href}"><strong>${escapeHtml(s.word)}</strong>${s.pronunciation ? ` /${escapeHtml(s.pronunciation)}/` : ''} — ${escapeHtml((s.meaning || '').slice(0, 100))}</a></li>`;
  }).join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ban Sagar (ဗန်းစကား)',
    alternateName: ['Myanmar Slang Words Dictionary', 'ဗန်းစကား အဘိဓာန်'],
    url: BASE_URL,
    description: description,
    inLanguage: ['my', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  const body = `
    <header>
      <h1>Ban Sagar (ဗန်းစကား) — Myanmar Slang Words Dictionary</h1>
      <p>${escapeHtml(description)}</p>
    </header>
    <main>
      <h2>Latest Myanmar Slang Words (ဗန်းစကား စာရင်း)</h2>
      <ul>${wordListHtml}</ul>
    </main>
    <nav>
      <h2>Quick Links</h2>
      <ul>
        <li><a href="/contribute">Contribute a new slang word</a></li>
        <li><a href="/leaderboard">Contributor Leaderboard</a></li>
        <li><a href="/about">About Ban Sagar</a></li>
        <li><a href="/contact">Contact Us</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
      </ul>
    </nav>
    <script type="application/ld+json">${jsonLd}</script>
  `;

  return renderPage(title, description, body, '/');
}

function renderPage(title: string, description: string, bodyContent: string, path: string, keywords?: string, ogImage?: string) {
  const canonicalUrl = `${BASE_URL}${path}`;
  const image = ogImage || `${BASE_URL}/og-image.png`;
  const defaultKeywords = 'ဗန်းစကား, myanmar slang, burmese slang, myanmar slang dictionary, myanmar dictionary, မြန်မာ ဗန်းစကား, burmese street language';
  const allKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  const html = `<!DOCTYPE html>
<html lang="my">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(allKeywords)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="author" content="Ban Sagar Community">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="${path.startsWith('/slang/') ? 'article' : 'website'}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Ban Sagar">
  <meta property="og:locale" content="my_MM">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
