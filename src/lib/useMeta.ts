import { useEffect } from 'react';

const BASE_URL = 'https://bansagar.madebysai.com';
const DEFAULT_TITLE = 'Ban Sagar (ဗန်းစကား) - Myanmar Slang Words Dictionary';
const DEFAULT_DESCRIPTION =
  "ဗန်းစကား အဘိဓာန် — The largest Myanmar slang words dictionary. Discover, learn, and contribute to Burmese street language, colloquial expressions, and trending slang.";

const JSON_LD_ID = 'dynamic-json-ld';

interface MetaOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMetaTag(property: string, content: string) {
  const isOg = property.startsWith('og:') || property.startsWith('twitter:');
  const attr = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = JSON_LD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(Array.isArray(data) ? data : data);
}

export function useMeta({ title, description, url, image, jsonLd }: MetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Ban Sagar ဗန်းစကား` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const ogImage = image || `${BASE_URL}/og-image.png`;

    document.title = fullTitle;

    setMetaTag('description', desc);
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', desc);
    setMetaTag('og:url', pageUrl);
    setMetaTag('og:image', ogImage);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', desc);
    setMetaTag('twitter:image', ogImage);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;

    // Update JSON-LD structured data
    setJsonLd(jsonLd);

    return () => {
      document.title = DEFAULT_TITLE;
      setJsonLd(undefined);
    };
  }, [title, description, url, image, jsonLd]);
}

/**
 * Build the dynamic OG image URL for a slang word.
 * Points to Vercel's /api/og edge function.
 */
export function getOgImageUrl(word: string, meaning?: string, pronunciation?: string): string {
  const params = new URLSearchParams({ word });
  if (meaning) params.set('meaning', meaning.slice(0, 150));
  if (pronunciation) params.set('pronunciation', pronunciation);
  return `${BASE_URL}/api/og?${params.toString()}`;
}
