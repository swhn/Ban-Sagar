import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { SlangData } from '../lib/database.types';
import { Search, TrendingUp, Clock, ThumbsUp, Shuffle, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { GradientBackground } from '../components/GradientBackground';
import { LoadingGrid } from '../components/LoadingSkeleton';

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
    // Initial fetch
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

    // Realtime subscription
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
              if (exists) {
                return prev.map(s => s.id === updated.id ? updated : s);
              }
              return [...prev, updated];
            }
            return prev.filter(s => s.id !== updated.id);
          });
        } else if (payload.eventType === 'DELETE') {
          setSlangs(prev => prev.filter(s => s.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 py-12 sm:py-20 relative"
      >
        <GradientBackground />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>The largest collection of Myanmar street slang</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-extrabold text-white tracking-tight">
            Myanmar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Slang</span> Dictionary
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mt-6">
            Discover, learn, and contribute to the living language of Myanmar. From street talk to internet culture.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative max-w-2xl mx-auto z-20" ref={searchRef}
      >
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-white/30" />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-4 py-5 bg-surface-raised border border-white/5 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-2xl shadow-black/20 text-lg transition-all"
          placeholder="Search for a word or meaning (e.g., ဂေါ်, လန်း)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {isFocused && searchTerm && exactMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-3 bg-surface-overlay border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <ul className="py-2">
              {exactMatches.map(match => (
                <li
                  key={match.id}
                  className="px-5 py-4 hover:bg-white/5 cursor-pointer text-white flex items-center justify-between border-b border-white/5 last:border-0 transition-colors"
                  onClick={() => {
                    setSearchTerm(match.word);
                    setIsFocused(false);
                  }}
                >
                  <span className="font-bold text-lg">{match.word}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
            {([
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'latest', label: 'Latest', icon: Clock },
              { key: 'most_upvote', label: 'Most Upvoted', icon: ThumbsUp },
              { key: 'random', label: 'Random', icon: Shuffle },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (key === 'random') setRandomSeed(Math.random());
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {activeTab === 'trending' && (
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
              {(['day', 'week', 'month', 'year'] as TrendingPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendingPeriod(period)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                    trendingPeriod === period
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  1 {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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
              transition: { staggerChildren: 0.04 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
        >
          {filteredSlangs.map(slang => (
            <motion.div
              key={slang.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="h-full"
            >
              <Link
                to={`/slang/${slang.id}`}
                className="block h-full bg-surface-raised p-8 rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
                  <h2 className="text-3xl font-display font-bold text-white group-hover:text-indigo-300 transition-colors">{slang.word}</h2>
                  {slang.pronunciation && (
                    <p className="text-sm text-text-secondary mt-2">/{slang.pronunciation}/</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-surface-raised rounded-2xl border border-white/5 max-w-3xl mx-auto"
        >
          <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-white/70 text-xl font-medium">No slangs found matching "{searchTerm}"</p>
          <p className="text-text-secondary mt-2">Try a different search term or add a new slang!</p>
        </motion.div>
      )}
    </div>
  );
}
