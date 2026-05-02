import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const BASE_URL = 'https://bansagar.madebysai.com';

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
  const staticPages: Record<string, { title: string; description: string }> = {
    '/about': { title: 'About', description: 'Learn about Ban Sagar, Myanmar\'s community-driven slang dictionary.' },
    '/contact': { title: 'Contact', description: 'Get in touch with the Ban Sagar team.' },
    '/privacy': { title: 'Privacy Policy', description: 'Ban Sagar\'s privacy policy.' },
    '/contribute': { title: 'Contribute', description: 'Contribute to Myanmar\'s largest slang dictionary. Add words, vote, and earn badges.' },
  };

  if (staticPages[path]) {
    const page = staticPages[path];
    return renderPage(
      `${page.title} | Ban Sagar ဗန်းစကား`,
      page.description,
      `<h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p>`,
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
  const title = `${slang.word}${slang.pronunciation ? ` (${slang.pronunciation})` : ''} | Ban Sagar ဗန်းစကား`;
  const description = `${slang.word}: ${slang.meaning || slang.meaning_burmese || ''}`.slice(0, 160);
  const pageUrl = `/slang/${pageSlug}`;

  const examplesHtml = slang.examples?.length
    ? `<h2>Examples</h2><ul>${slang.examples.map((ex: string) => `<li>${escapeHtml(ex)}</li>`).join('')}</ul>`
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
      ...(slang.meaning_burmese ? { alternateName: slang.meaning_burmese } : {}),
    },
  ]);

  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>${escapeHtml(slang.word)}</span></nav>
    <article>
      <h1>${escapeHtml(slang.word)}</h1>
      ${slang.pronunciation ? `<p><strong>Pronunciation:</strong> /${escapeHtml(slang.pronunciation)}/</p>` : ''}
      <section>
        <h2>Meaning</h2>
        <p>${escapeHtml(slang.meaning || '')}</p>
        ${slang.meaning_burmese ? `<p>${escapeHtml(slang.meaning_burmese)}</p>` : ''}
      </section>
      ${examplesHtml}
      <footer>
        <p>Views: ${slang.views || 0} | Upvotes: ${slang.upvotes || 0}</p>
        ${slang.author_name ? `<p>Contributed by ${escapeHtml(slang.author_name)}</p>` : ''}
      </footer>
    </article>
    <script type="application/ld+json">${jsonLd}</script>
  `;

  return renderPage(title, description, body, pageUrl);
}

async function renderHomePage(supabase: any) {
  const { data: slangs } = await supabase
    .from('slangs')
    .select('word, slug, id, meaning, pronunciation')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  const title = 'Ban Sagar (ဗန်းစကား) - Myanmar Slang Words Dictionary';
  const description = 'ဗန်းစကား အဘိဓာန် — The largest Myanmar slang words dictionary. Discover, learn, and contribute to Burmese street language, colloquial expressions, and trending slang.';

  const wordListHtml = (slangs || []).map((s: any) => {
    const href = `/slang/${s.slug || s.id}`;
    return `<li><a href="${href}"><strong>${escapeHtml(s.word)}</strong>${s.pronunciation ? ` /${escapeHtml(s.pronunciation)}/` : ''} — ${escapeHtml((s.meaning || '').slice(0, 100))}</a></li>`;
  }).join('\n');

  const body = `
    <h1>Ban Sagar (ဗန်းစကား) — Myanmar Slang Words Dictionary</h1>
    <p>${escapeHtml(description)}</p>
    <h2>Myanmar Slang Words (ဗန်းစကား စာရင်း)</h2>
    <ul>${wordListHtml}</ul>
    <p><a href="/contribute">Contribute</a> | <a href="/about">About</a> | <a href="/contact">Contact</a></p>
  `;

  return renderPage(title, description, body, '/');
}

function renderPage(title: string, description: string, bodyContent: string, path: string) {
  const canonicalUrl = `${BASE_URL}${path}`;

  const html = `<!DOCTYPE html>
<html lang="my">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:site_name" content="Ban Sagar">
  <meta property="og:locale" content="my_MM">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
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
