import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SlangCard } from '../components/SlangCard';
import { SlangData } from '../lib/database.types';
import { Loader2, ArrowLeft, Sparkles, Share2, Home, Copy, Check, ChevronRight, ThumbsUp, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, generateSlug } from '../lib/utils';
import { useMeta, getOgImageUrl } from '../lib/useMeta';
import { useI18n } from '../lib/i18n';

interface RelatedWord {
  id: string;
  word: string;
  slug: string;
  meaning: string;
  pronunciation: string | null;
  upvotes: number;
  views: number;
}

const BASE_URL = 'https://bansagar.com';

export function SlangDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [slang, setSlang] = useState<SlangData | null>(null);
  const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const viewedRef = React.useRef(false);

  // Dynamic SEO meta tags + structured data for each word
  const slangUrl = slang ? `/slang/${slang.slug || slang.id}` : undefined;
  const slangDescription = slang
    ? `${slang.word}: ${slang.meaning || slang.meaning_burmese || ''}`.slice(0, 160)
    : undefined;
  const slangKeywords = slang
    ? `${slang.word}, ${slang.word} in English, ${slang.word} meaning, ${slang.word} ဗန်းစကား, myanmar slang, burmese slang`
    : undefined;

  useMeta({
    title: slang ? `${slang.word}${slang.pronunciation ? ` (${slang.pronunciation})` : ''}` : undefined,
    description: slangDescription,
    url: slangUrl,
    keywords: slangKeywords,
    image: slang
      ? getOgImageUrl(slang.word, slang.meaning || slang.meaning_burmese, slang.pronunciation)
      : undefined,
    jsonLd: slang ? [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: slang.word, item: `${BASE_URL}${slangUrl}` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: slang.word,
        description: slang.meaning,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Ban Sagar - Myanmar Slang Dictionary',
          url: BASE_URL,
        },
        url: `${BASE_URL}${slangUrl}`,
        ...(slang.meaning_burmese ? { alternateName: slang.meaning_burmese } : {}),
      },
    ] : undefined,
  });

  useEffect(() => {
    const fetchSlang = async () => {
      if (!slug) return;
      try {
        // Try by slug first, fall back to id for old links
        let { data, error } = await supabase
          .from('slangs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          ({ data, error } = await supabase
            .from('slangs')
            .select('*')
            .eq('id', slug)
            .single());
        }

        if (error) throw error;

        if (data) {
          const slangData = data as SlangData;

          // Auto-generate and save slug for old entries missing one
          if (!slangData.slug) {
            const newSlug = generateSlug(slangData.word, slangData.pronunciation);
            slangData.slug = newSlug;
            supabase
              .from('slangs')
              .update({ slug: newSlug })
              .eq('id', slangData.id)
              .then(({ error }) => {
                if (error) console.error('Slug update error:', error);
              });
          }

          setSlang(slangData);

          if (!viewedRef.current) {
            viewedRef.current = true;
            supabase.rpc('increment_view', { p_slang_id: slangData.id }).then(({ error }) => {
              if (error) console.error('View increment error:', error);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching slang:', error);
        setSlang(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlang();
  }, [slug]);

  useEffect(() => {
    if (!slang) return;

    const fetchRelated = async () => {
      const keywords = slang.meaning
        .toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 3 && /^[a-z]+$/.test(w))
        .slice(0, 5);

      let related: RelatedWord[] = [];

      for (const keyword of keywords) {
        if (related.length >= 6) break;
        const { data } = await supabase
          .from('slangs')
          .select('id, word, slug, meaning, pronunciation, upvotes, views')
          .eq('status', 'approved')
          .neq('id', slang.id)
          .ilike('meaning', `%${keyword}%`)
          .limit(6);

        if (data) {
          for (const item of data) {
            if (!related.find(r => r.id === item.id)) {
              related.push(item as RelatedWord);
            }
          }
        }
      }

      if (related.length < 4) {
        const { data } = await supabase
          .from('slangs')
          .select('id, word, slug, meaning, pronunciation, upvotes, views')
          .eq('status', 'approved')
          .neq('id', slang.id)
          .order('upvotes', { ascending: false })
          .limit(6);

        if (data) {
          for (const item of data) {
            if (!related.find(r => r.id === item.id)) {
              related.push(item as RelatedWord);
            }
          }
        }
      }

      setRelatedWords(related.slice(0, 6));
    };

    fetchRelated();
  }, [slang?.id]);

  const copyToClipboard = async (text: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* fall through */ }
    }
    // Fallback: hidden textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    document.body.removeChild(textarea);
    return ok;
  };

  const handleShare = async () => {
    const shareSlug = slang?.slug || slang?.id;
    const url = `${window.location.origin}/slang/${shareSlug}`;

    // Only use native share on mobile (touch devices)
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title: `${slang?.word} - Ban Sagar`, url });
        return;
      } catch { /* user cancelled */ }
    }

    // Desktop: always copy to clipboard
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!slang) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 sm:py-20 bg-surface-raised/50 rounded-2xl border border-white/[0.04] max-w-lg mx-auto"
      >
        <div className="bg-white/[0.03] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-white/15" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">{t('notFound.title')}</h2>
        <p className="text-text-secondary mb-6 text-sm px-6">{t('notFound.description')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" /> {t('notFound.goHome')}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/40 font-medium">
        <Link to="/" className="hover:text-white/70 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> {t('nav.home')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-white/20" />
        <span className="text-white/70 truncate max-w-[200px] font-burmese">{slang.word}</span>
      </nav>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/10 text-sm font-medium rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> {t('detail.back')}
        </button>

        <button
          onClick={handleShare}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all active:scale-95 border",
            copied
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
              : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:text-white hover:border-white/10"
          )}
        >
          <Share2 className="w-4 h-4" /> {copied ? t('detail.copied') : t('detail.share')}
        </button>
      </div>

      <SlangCard slang={slang} headingLevel="h1" />

      {/* Related Words */}
      {relatedWords.length > 0 && (
        <div className="pt-4 space-y-3">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400/60" />
            {t('detail.relatedWords')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {relatedWords.map(rw => (
              <Link
                key={rw.id}
                to={`/slang/${rw.slug || rw.id}`}
                className="group bg-surface-raised/80 rounded-xl border border-white/[0.04] hover:border-white/[0.08] p-3.5 transition-all hover:bg-surface-raised"
              >
                <p className="font-display font-bold text-white text-base group-hover:text-indigo-300 transition-colors truncate font-burmese">
                  {rw.word}
                </p>
                {rw.pronunciation && (
                  <p className="text-xs text-white/30 mt-0.5">/{rw.pronunciation}/</p>
                )}
                <p className="text-xs text-white/40 mt-1.5 line-clamp-2 leading-relaxed">
                  {rw.meaning}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-white/20">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {rw.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {rw.views}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
