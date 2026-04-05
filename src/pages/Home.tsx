import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { SlangCard, SlangData } from '../components/SlangCard';
import { Search, Loader2, TrendingUp, Clock, ThumbsUp, Shuffle, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

type SortTab = 'trending' | 'latest' | 'most_upvote' | 'random';
type TrendingPeriod = 'day' | 'week' | 'month' | 'year';

const getTrendingScore = (slang: SlangData, period: TrendingPeriod) => {
  if (!slang.viewHistory) return 0;
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
    score += slang.viewHistory[dateStr] || 0;
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
    const q = query(
      collection(db, 'slangs'),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slangData: SlangData[] = [];
      snapshot.forEach((doc) => {
        slangData.push({ id: doc.id, ...doc.data() } as SlangData);
      });
      setSlangs(slangData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'slangs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  let sortedSlangs = [...slangs];
  
  const getTime = (t: any) => {
    if (!t) return 0;
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (t.seconds) return t.seconds * 1000;
    const parsed = new Date(t).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  if (activeTab === 'latest') {
    sortedSlangs.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
  } else if (activeTab === 'most_upvote') {
    sortedSlangs.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (activeTab === 'trending') {
    sortedSlangs.sort((a, b) => getTrendingScore(b, trendingPeriod) - getTrendingScore(a, trendingPeriod));
  } else if (activeTab === 'random') {
    // Simple seeded shuffle based on randomSeed state
    // We use a deterministic shuffle so it doesn't jump around on every render
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50 opacity-70"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>The largest collection of Myanmar street slang</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-display font-extrabold text-slate-900 tracking-tight">
          Myanmar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Slang</span> Dictionary
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Discover, learn, and contribute to the living language of Myanmar. From street talk to internet culture.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative max-w-2xl mx-auto z-20" ref={searchRef}
      >
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xl shadow-slate-200/50 text-lg transition-all"
          placeholder="Search for a word or meaning (e.g., ဂေါ်, လန်း)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        
        {isFocused && searchTerm && exactMatches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <ul className="py-2">
              {exactMatches.map(match => (
                <li 
                  key={match.id}
                  className="px-5 py-4 hover:bg-indigo-50 cursor-pointer text-slate-800 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
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

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'trending' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              <TrendingUp className="w-4 h-4" /> Trending
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'latest' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              <Clock className="w-4 h-4" /> Latest
            </button>
            <button
              onClick={() => setActiveTab('most_upvote')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'most_upvote' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              <ThumbsUp className="w-4 h-4" /> Most Upvoted
            </button>
            <button
              onClick={() => {
                setActiveTab('random');
                setRandomSeed(Math.random());
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'random' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              <Shuffle className="w-4 h-4" /> Random
            </button>
          </div>

          {activeTab === 'trending' && (
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {(['day', 'week', 'month', 'year'] as TrendingPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendingPeriod(period)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${trendingPeriod === period ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  1 {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
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
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
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
                className="block h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
                  <h2 className="text-3xl font-display font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{slang.word}</h2>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl border border-slate-200 max-w-3xl mx-auto shadow-sm"
        >
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-600 text-xl font-medium">No slangs found matching "{searchTerm}"</p>
          <p className="text-slate-400 mt-2">Try a different search term or add a new slang!</p>
        </motion.div>
      )}
    </div>
  );
}
