import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SlangCard } from '../components/SlangCard';
import { SlangData } from '../lib/database.types';
import { Loader2, ArrowLeft, Sparkles, Share2, Home, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, generateSlug } from '../lib/utils';
import { useMeta, getOgImageUrl } from '../lib/useMeta';

export function SlangDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [slang, setSlang] = useState<SlangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const viewedRef = React.useRef(false);

  // Dynamic SEO meta tags for each word
  useMeta({
    title: slang ? `${slang.word}${slang.pronunciation ? ` (${slang.pronunciation})` : ''}` : undefined,
    description: slang
      ? `${slang.word}: ${slang.meaning_english || slang.meaning_burmese || ''}`.slice(0, 160)
      : undefined,
    url: slang ? `/slang/${slang.slug || slang.id}` : undefined,
    image: slang
      ? getOgImageUrl(slang.word, slang.meaning_english || slang.meaning_burmese, slang.pronunciation)
      : undefined,
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
                else {
                  // Replace URL with the new slug without reloading
                  window.history.replaceState(null, '', `/slang/${newSlug}`);
                }
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
        <h2 className="text-2xl font-display font-bold text-white mb-2">Slang not found</h2>
        <p className="text-text-secondary mb-6 text-sm px-6">This slang doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" /> Back to Home
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/10 text-sm font-medium rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back
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
          <Share2 className="w-4 h-4" /> {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      <SlangCard slang={slang} />
    </motion.div>
  );
}
