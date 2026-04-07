import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { SlangData } from '../lib/database.types';
import { Search, TrendingUp, Clock, ThumbsUp, Shuffle, Sparkles, BookOpen, ArrowRight, Eye, AlertTriangle, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GradientBackground } from '../components/GradientBackground';
import { LoadingGrid } from '../components/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

type SortTab = 'trending' | 'latest' | 'most_upvote' | 'random';
type TrendingPeriod = 'day' | 'week' | 'month' | 'year';

const getTrendingScore = (slang: SlangData, period: TrendingPeriod) => {
  if (!slang.view_history) return 0;
  const today = new Date();
  let days = 1;
  if (period === 'week') days = 7;
  if (period === 'month') days = 30;
  if (period === 'year') days = 365;

  let score = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    score += slang.view_history[dateStr] || 0;
  }
  return score;
};

export function Home() {
  const { appUser } = useAuth();
  const [slangs, setSlangs] = useState<SlangData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<SortTab>('trending');
  const [trendingPeriod, setTrendingPeriod] = useState<TrendingPeriod>('day');
  const [randomSeed, setRandomSeed] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSlangs = async () => {
      const { data, error } = await supabase
        .from('slangs')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching slangs:', error);
      } else {
        setSlangs(data as SlangData[]);
      }
      setLoading(false);
    };

    fetchSlangs();

    const channel = supabase
      .channel('slangs-home')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'slangs',
      }, (payload) => {
        if (payload.eventType === 'INSERT' && (payload.new as SlangData).status === 'approved') {
          setSlangs(prev => [...prev, payload.new as SlangData]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as SlangData;
          setSlangs(prev => {
            if (updated.status === 'approved') {
              const exists = prev.find(s => s.id === updated.id);
              if (exists) return prev.map(s => s.id === updated.id ? updated : s);
              return [...prev, updated];
            }
            return prev.filter(s => s.id !== updated.id);
          });
        } else if (payload.eventType === 'DELETE') {
          setSlangs(prev => prev.filter(s => s.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  let sortedSlangs = [...slangs];

  if (activeTab === 'latest') {
    sortedSlangs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (activeTab === 'most_upvote') {
    sortedSlangs.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (activeTab === 'trending') {
    sortedSlangs.sort((a, b) => getTrendingScore(b, trendingPeriod) - getTrendingScore(a, trendingPeriod));
  } else if (activeTab === 'random') {
    let m = sortedSlangs.length, t, i;
    let seed = randomSeed;
    while (m) {
      seed = (seed * 9301 + 49297) % 233280;
      i = Math.floor((seed / 233280) * m--);
      t = sortedSlangs[m];
      sortedSlangs[m] = sortedSlangs[i];
      sortedSlangs[i] = t;
    }
  }

  const filteredSlangs = sortedSlangs.filter(slang =>
    slang && slang.word &&
    (slang.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (slang.meaning && slang.meaning.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const exactMatches = slangs
    .filter(slang => slang.word.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 py-8 sm:py-16 relative"
      >
        <GradientBackground />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-indigo-300/80 text-xs sm:text-sm font-medium mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slangs.length} Myanmar street slangs and counting</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
            Myanmar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Slang
            </span>
            {' '}Dictionary
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed mt-4 px-4">
            Discover and learn the living language of Myanmar streets.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative max-w-xl mx-auto z-20 px-2"
        ref={searchRef}
      >
        <div className="absolute inset-y-0 left-2 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/25" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-surface-raised/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/20 text-base transition-all"
          placeholder="Search word or meaning..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        <AnimatePresence>
          {isFocused && searchTerm && exactMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-2 right-2 mt-2 bg-surface-overlay/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
            >
              <ul className="py-1">
                {exactMatches.map(match => (
                  <li key={match.id}>
                    <Link
                      to={`/slang/${match.slug || match.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
                      onClick={() => setIsFocused(false)}
                    >
                      <span className="font-bold text-white">{match.word}</span>
                      <ArrowRight className="w-4 h-4 text-white/20" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sort Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main tabs - scrollable on mobile */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {([
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'latest', label: 'Latest', icon: Clock },
              { key: 'most_upvote', label: 'Top', icon: ThumbsUp },
              { key: 'random', label: 'Random', icon: Shuffle },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (key === 'random') setRandomSeed(Math.random());
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
                  activeTab === key
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Trending period */}
          <AnimatePresence>
            {activeTab === 'trending' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-0.5 bg-white/[0.03] p-1 rounded-lg border border-white/[0.04] shrink-0 self-start"
              >
                {(['day', 'week', 'month', 'year'] as TrendingPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrendingPeriod(period)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all",
                      trendingPeriod === period
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/30 hover:text-white/60'
                    )}
                  >
                    {period === 'day' ? '24h' : `1${period[0]}`}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="max-w-6xl mx-auto">
          <LoadingGrid />
        </div>
      ) : filteredSlangs.length > 0 ? (
        <motion.div
          key={activeTab + trendingPeriod + randomSeed + searchTerm}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.03 }
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto"
        >
          {filteredSlangs.map(slang => (
            <motion.div
              key={slang.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="h-full"
            >
              <Link
                to={`/slang/${slang.slug || slang.id}`}
                className={cn(
                  "group block h-full bg-surface-raised/80 p-5 sm:p-6 rounded-2xl border hover:bg-surface-raised transition-all duration-200 relative overflow-hidden active:scale-[0.98]",
                  slang.is_nsfw ? "border-red-500/10 hover:border-red-500/20" : "border-white/[0.04] hover:border-indigo-500/20"
                )}
              >
                {/* Top gradient line */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
                  slang.is_nsfw ? "via-red-500/40" : "via-indigo-500/40"
                )} />

                {slang.is_nsfw && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/15">
                      <AlertTriangle className="w-2.5 h-2.5" /> NSFW
                    </span>
                  </div>
                )}

                <div className={cn(
                  "flex flex-col items-center justify-center text-center min-h-[80px] sm:min-h-[100px] transition-all duration-300",
                  slang.is_nsfw && !appUser?.show_nsfw && "blur-sm"
                )}>
                  <h2 className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-display font-bold transition-colors leading-tight",
                    slang.is_nsfw ? "text-white group-hover:text-red-300" : "text-white group-hover:text-indigo-300"
                  )}>
                    {slang.word}
                  </h2>
                  {slang.pronunciation && (
                    <p className="text-xs sm:text-sm text-text-secondary mt-1.5 font-medium">/{slang.pronunciation}/</p>
                  )}
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-white/[0.04]">
                  <span className="flex items-center gap-1 text-[11px] text-white/25 font-medium">
                    <ThumbsUp className="w-3 h-3" /> {slang.upvotes || 0}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/25 font-medium">
                    <Eye className="w-3 h-3" /> {slang.views || 0}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 sm:py-20 bg-surface-raised/50 rounded-2xl border border-white/[0.04] max-w-2xl mx-auto"
        >
          <div className="bg-white/[0.03] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-white/15" />
          </div>
          <p className="text-white/60 text-lg font-medium">No results for "{searchTerm}"</p>
          <p className="text-text-secondary mt-1.5 text-sm">Try a different search or contribute a new word!</p>
        </motion.div>
      )}

      {/* Contribute CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <Link
          to="/contribute"
          className="group flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-indigo-500/[0.06] to-purple-500/[0.06] rounded-2xl border border-indigo-500/10 hover:border-indigo-500/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/15">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Contribute to the Dictionary</h3>
              <p className="text-text-secondary text-sm mt-0.5">Add words, earn badges, climb the leaderboard</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </motion.div>
    </div>
  );
}
