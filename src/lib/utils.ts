import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(word: string, pronunciation: string | null): string {
  // Prefer pronunciation for the slug (romanized, URL-friendly)
  const source = pronunciation?.trim() || word.trim();
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\u1000-\u109f\s-]/g, '') // keep latin, myanmar, digits, spaces, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || word.trim().replace(/\s+/g, '-'); // fallback to raw word
}
