import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Heart, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useMeta } from '../lib/useMeta';
import { useI18n } from '../lib/i18n';

const DEFAULTS = {
  about_what_is:
    "Ban Sagar (ဗန်းစကား) is a community-driven online dictionary dedicated to documenting and preserving Myanmar's rich collection of slang words, street language, and colloquial expressions. Our mission is to create a comprehensive, searchable resource that captures the living language of Myanmar streets.",
  about_community:
    "Every word in our dictionary is contributed by real people from Myanmar's diverse communities. Whether you're from Yangon, Mandalay, or anywhere else in Myanmar, your knowledge of local slang helps preserve our cultural heritage.\n\nContributors can add new words, suggest improvements, vote on definitions, and earn badges for their contributions. Our moderation team reviews all submissions to maintain quality and accuracy.",
  about_why_it_matters:
    "Slang and informal language are an important part of any culture. They reflect how people actually communicate in everyday life. By documenting these words, we help future generations understand the culture, humor, and creativity of Myanmar's people.\n\nWhether you're a Myanmar native curious about new slang, a language learner wanting to understand informal speech, or a researcher studying linguistic trends — Ban Sagar is here for you.",
};

export function About() {
  const { t } = useI18n();
  const [content, setContent] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useMeta({
    title: 'About',
    description: "Learn about Ban Sagar, Myanmar's community-driven slang dictionary dedicated to documenting and preserving Burmese street language.",
    url: '/about',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['about_what_is', 'about_community', 'about_why_it_matters']);

        if (data) {
          const loaded = { ...DEFAULTS };
          data.forEach((row: any) => {
            if (row.value && row.key in loaded) {
              (loaded as any)[row.key] = row.value;
            }
          });
          setContent(loaded);
        }
      } catch (err) {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white text-sm font-medium rounded-xl transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> {t('general.back')}
      </Link>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/15">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{t('about.title')}</h1>
        <p className="text-text-secondary text-sm">{t('home.hero.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <Section
          icon={<Globe className="w-5 h-5 text-indigo-400" />}
          title={t('about.whatIs')}
        >
          {content.about_what_is.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          title={t('about.community')}
        >
          {content.about_community.split('\n').filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section
          icon={<Heart className="w-5 h-5 text-pink-400" />}
          title={t('about.whyMatters')}
        >
          {content.about_why_it_matters.split('\n').filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/contribute"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          {t('home.startContributing')}
        </Link>
      </div>
    </motion.div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        {icon}
        <h2 className="text-lg font-display font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-white/60 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
