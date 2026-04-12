import { useEffect } from 'react';

const BASE_URL = 'https://bansagar.madebysai.com';
const DEFAULT_TITLE = 'Ban Sagar - ဗန်းစကား | Myanmar Slang Dictionary';
const DEFAULT_DESCRIPTION =
  "Myanmar's community-driven slang dictionary. Discover, learn, and contribute to the largest collection of Burmese street language and colloquial expressions.";

interface MetaOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
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

export function useMeta({ title, description, url, image }: MetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Ban Sagar` : DEFAULT_TITLE;
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

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, url, image]);
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
