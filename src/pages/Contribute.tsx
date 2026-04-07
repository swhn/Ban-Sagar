import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SlangData } from '../lib/database.types';
import {
  PenLine, BookOpen, Trophy, Sparkles, Loader2, LogIn, Clock, CheckCircle, XCircle,
  ThumbsUp, Eye, Star, Heart, Award, Target, Crown, Flame, Zap, Rocket, TrendingUp,
  Medal, Shield, MessageSquare, Users, Globe, Gem, Lightbulb, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type ContributeTab = 'add' | 'history' | 'leaderboard' | 'achievements';

interface ContributorStats {
  author_id: string;
  author_name: string;
  avatar_url: string | null;
  approved_count: number;
  total_count: number;
  total_upvotes: number;
  total_views: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  check: (stats: ContributorStats) => boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  // Bronze
  { id: 'first_word', title: 'First Word', description: 'Submit your first slang', icon: <BookOpen className="w-5 h-5" />, color: 'from-sky-400 to-blue-500', check: (s) => s.total_count >= 1, tier: 'bronze' },
  { id: 'wordsmith', title: 'Wordsmith', description: '5 slangs approved', icon: <Star className="w-5 h-5" />, color: 'from-emerald-400 to-green-500', check: (s) => s.approved_count >= 5, tier: 'bronze' },
  { id: 'crowd_favorite', title: 'Crowd Favorite', description: '10 total upvotes', icon: <Heart className="w-5 h-5" />, color: 'from-pink-400 to-rose-500', check: (s) => s.total_upvotes >= 10, tier: 'bronze' },
  { id: 'first_glance', title: 'First Glance', description: '50 total views', icon: <Eye className="w-5 h-5" />, color: 'from-teal-400 to-cyan-500', check: (s) => s.total_views >= 50, tier: 'bronze' },
  { id: 'getting_started', title: 'Getting Started', description: '3 slangs approved', icon: <Lightbulb className="w-5 h-5" />, color: 'from-yellow-400 to-amber-500', check: (s) => s.approved_count >= 3, tier: 'bronze' },
  // Silver
  { id: 'slang_scholar', title: 'Slang Scholar', description: '15 slangs approved', icon: <Award className="w-5 h-5" />, color: 'from-violet-400 to-purple-500', check: (s) => s.approved_count >= 15, tier: 'silver' },
  { id: 'trending', title: 'Trending', description: '50 total upvotes', icon: <TrendingUp className="w-5 h-5" />, color: 'from-fuchsia-400 to-purple-500', check: (s) => s.total_upvotes >= 50, tier: 'silver' },
  { id: 'viral', title: 'Viral', description: '100+ total views', icon: <Eye className="w-5 h-5" />, color: 'from-cyan-400 to-blue-500', check: (s) => s.total_views >= 100, tier: 'silver' },
  { id: 'contributor', title: 'Active Contributor', description: '10 slangs submitted', icon: <MessageSquare className="w-5 h-5" />, color: 'from-indigo-400 to-blue-500', check: (s) => s.total_count >= 10, tier: 'silver' },
  { id: 'community_voice', title: 'Community Voice', description: '25 total upvotes', icon: <Users className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', check: (s) => s.total_upvotes >= 25, tier: 'silver' },
  // Gold
  { id: 'dictionary_builder', title: 'Dictionary Builder', description: '30 slangs approved', icon: <Target className="w-5 h-5" />, color: 'from-amber-400 to-orange-500', check: (s) => s.approved_count >= 30, tier: 'gold' },
  { id: 'slang_master', title: 'Slang Master', description: '50 slangs approved', icon: <Crown className="w-5 h-5" />, color: 'from-rose-400 to-pink-500', check: (s) => s.approved_count >= 50, tier: 'gold' },
  { id: 'on_fire', title: 'On Fire', description: '100 total upvotes', icon: <Flame className="w-5 h-5" />, color: 'from-orange-400 to-red-500', check: (s) => s.total_upvotes >= 100, tier: 'gold' },
  { id: 'globe_trotter', title: 'Globe Trotter', description: '500+ total views', icon: <Globe className="w-5 h-5" />, color: 'from-blue-400 to-indigo-500', check: (s) => s.total_views >= 500, tier: 'gold' },
  { id: 'prolific', title: 'Prolific Writer', description: '25 slangs submitted', icon: <PenLine className="w-5 h-5" />, color: 'from-violet-400 to-fuchsia-500', check: (s) => s.total_count >= 25, tier: 'gold' },
  // Legendary
  { id: 'legendary', title: 'Legendary', description: '100 slangs approved', icon: <Rocket className="w-5 h-5" />, color: 'from-yellow-300 to-amber-500', check: (s) => s.approved_count >= 100, tier: 'legendary' },
  { id: 'hall_of_fame', title: 'Hall of Fame', description: '1000+ total views', icon: <Zap className="w-5 h-5" />, color: 'from-yellow-300 to-orange-500', check: (s) => s.total_views >= 1000, tier: 'legendary' },
  { id: 'diamond', title: 'Diamond Contributor', description: '200 total upvotes', icon: <Gem className="w-5 h-5" />, color: 'from-cyan-300 to-blue-500', check: (s) => s.total_upvotes >= 200, tier: 'legendary' },
  { id: 'verified_legend', title: 'Verified Legend', description: '50 slangs & 100 upvotes', icon: <BadgeCheck className="w-5 h-5" />, color: 'from-purple-300 to-pink-500', check: (s) => s.approved_count >= 50 && s.total_upvotes >= 100, tier: 'legendary' },
];

const TIER_STYLES = {
  bronze: 'ring-amber-700/20 bg-amber-900/10',
  silver: 'ring-slate-400/20 bg-slate-500/[0.06]',
  gold: 'ring-yellow-500/25 bg-yellow-500/[0.06]',
  legendary: 'ring-purple-500/25 bg-gradient-to-br from-purple-500/[0.06] to-amber-500/[0.06]',
};

export function Contribute() {
  const { user, appUser, login, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ContributeTab>('add');
  const [mySubmissions, setMySubmissions] = useState<SlangData[]>([]);
  const [contributors, setContributors] = useState<ContributorStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ContributorStats | null>(null);

  useEffect(() => {
    if (activeTab === 'history' && user) {
      setLoading(true);
      supabase
        .from('slangs')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setMySubmissions(data as SlangData[]);
          setLoading(false);
        });
    }
    if (activeTab === 'leaderboard' || activeTab === 'achievements') {
      fetchLeaderboard();
    }
  }, [activeTab, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: slangs } = await supabase.from('slangs').select('author_id, author_name, status, upvotes, views');
      const { data: users } = await supabase.from('users').select('id, avatar_url');
      const avatarMap = new Map((users || []).map((u: any) => [u.id, u.avatar_url]));

      const statsMap = new Map<string, ContributorStats>();
      (slangs || []).forEach((s: any) => {
        const existing = statsMap.get(s.author_id);
        if (existing) {
          existing.total_count += 1;
          if (s.status === 'approved') existing.approved_count += 1;
          existing.total_upvotes += s.upvotes || 0;
          existing.total_views += s.views || 0;
        } else {
          statsMap.set(s.author_id, {
            author_id: s.author_id,
            author_name: s.author_name || 'Anonymous',
            avatar_url: avatarMap.get(s.author_id) || null,
            approved_count: s.status === 'approved' ? 1 : 0,
            total_count: 1,
            total_upvotes: s.upvotes || 0,
            total_views: s.views || 0,
          });
        }
      });

      setContributors(Array.from(statsMap.values()).sort((a, b) => b.approved_count - a.approved_count || b.total_upvotes - a.total_upvotes));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentUserStats = contributors.find(c => c.author_id === user?.id);
  const currentUserRank = contributors.findIndex(c => c.author_id === user?.id) + 1;
  const viewTarget = selectedUser || currentUserStats;

  if (!isAuthReady) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/15">
          <PenLine className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Contribute</h1>
        <p className="text-text-secondary text-sm">Add words, track your progress, earn achievements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
        {([
          { key: 'add' as const, label: 'Add Word', icon: PenLine },
          { key: 'history' as const, label: 'My Words', icon: BookOpen },
          { key: 'leaderboard' as const, label: 'Rankings', icon: Trophy },
          { key: 'achievements' as const, label: 'Badges', icon: Sparkles },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSelectedUser(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === key ? 'bg-white/[0.07] text-white' : 'text-white/35 hover:text-white/60'
            )}
          >
            <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ').pop()}</span>
          </button>
        ))}
      </div>

      {/* Not logged in */}
      {!user && activeTab === 'add' && (
        <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-white/[0.04]">
          <div className="bg-white/[0.03] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-8 h-8 text-white/15" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sign in to contribute</h2>
          <p className="text-text-secondary text-sm mb-5">Add slang words and earn badges.</p>
          <button onClick={login} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            <LogIn className="w-4 h-4" /> Sign In with Google
          </button>
        </div>
      )}

      {/* Add Word - redirect to existing AddSlang page */}
      {user && activeTab === 'add' && (
        <div className="text-center py-10">
          <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-500/15">
            <PenLine className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Add a new slang word</h2>
          <p className="text-text-secondary text-sm mb-5 max-w-sm mx-auto">
            {appUser?.role === 'admin' || appUser?.role === 'moderator'
              ? 'Your submissions are auto-approved.'
              : 'Your submission will be reviewed by moderators.'}
          </p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <PenLine className="w-4 h-4" /> Add New Slang
          </Link>

          {/* Quick stats */}
          {currentUserStats && (
            <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-white/[0.04]">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">{currentUserStats.approved_count}</p>
                <p className="text-[11px] text-text-secondary font-medium mt-0.5">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">{currentUserStats.total_count}</p>
                <p className="text-[11px] text-text-secondary font-medium mt-0.5">Submitted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">{currentUserStats.total_upvotes}</p>
                <p className="text-[11px] text-text-secondary font-medium mt-0.5">Upvotes</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Words / History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {!user ? (
            <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-white/[0.04]">
              <BookOpen className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-white/60 font-medium">Sign in to see your contributions</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
          ) : mySubmissions.length > 0 ? (
            mySubmissions.map((slang, i) => (
              <motion.div key={slang.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 p-3.5 bg-surface-raised/80 rounded-xl border border-white/[0.04] hover:border-white/[0.07] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/slang/${slang.slug || slang.id}`} className="font-display font-bold text-white text-base hover:text-indigo-300 transition-colors">
                      {slang.word}
                    </Link>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                      slang.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" :
                      slang.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    )}>{slang.status}</span>
                  </div>
                  <p className="text-white/40 text-sm line-clamp-1">{slang.meaning}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px] text-white/25">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {slang.upvotes || 0}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {slang.views || 0}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
              <BookOpen className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No submissions yet</h3>
              <p className="text-text-secondary text-sm mb-4">Start contributing to the dictionary!</p>
              <button onClick={() => setActiveTab('add')} className="text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Add your first word
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {currentUserStats && (
            <div className="bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentUserStats.avatar_url ? (
                  <img src={currentUserStats.avatar_url} alt="" className="w-10 h-10 rounded-full ring-2 ring-indigo-500/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-indigo-500/20">
                    {currentUserStats.author_name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white text-sm">Your Rank</p>
                  <p className="text-indigo-400 text-xs font-medium">#{currentUserRank} of {contributors.length}</p>
                </div>
              </div>
              <div className="flex gap-5 text-center">
                <div><p className="text-xl font-display font-bold text-white">{currentUserStats.approved_count}</p><p className="text-[10px] text-indigo-400 font-medium">Approved</p></div>
                <div><p className="text-xl font-display font-bold text-white">{currentUserStats.total_upvotes}</p><p className="text-[10px] text-indigo-400 font-medium">Upvotes</p></div>
                <div><p className="text-xl font-display font-bold text-white">{currentUserStats.total_views}</p><p className="text-[10px] text-indigo-400 font-medium">Views</p></div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
          ) : contributors.length > 0 ? (
            <div className="space-y-2">
              {contributors.map((c, i) => (
                <motion.div key={c.author_id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-center gap-3 p-3.5 sm:p-4 bg-surface-raised/80 rounded-xl border transition-all cursor-pointer active:scale-[0.99]",
                    i === 0 ? "border-yellow-500/15 ring-1 ring-yellow-500/10" :
                    i === 1 ? "border-slate-400/10" :
                    i === 2 ? "border-amber-700/10" :
                    "border-white/[0.04]",
                    c.author_id === user?.id && 'border-indigo-500/15 bg-indigo-500/[0.03]'
                  )}
                  onClick={() => { setSelectedUser(c); setActiveTab('achievements'); }}
                >
                  <div className="w-7 shrink-0 text-center">
                    {i === 0 ? <Crown className="w-5 h-5 text-yellow-400 mx-auto" /> :
                     i === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" /> :
                     i === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> :
                     <span className="text-xs font-bold text-white/25">#{i + 1}</span>}
                  </div>
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full ring-2 ring-white/[0.06] shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/[0.06] shrink-0">
                      {c.author_name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{c.author_name}</p>
                    <p className="text-[10px] text-text-secondary">{ACHIEVEMENTS.filter(a => a.check(c)).length} badges</p>
                  </div>
                  <div className="flex gap-4 sm:gap-6 text-center shrink-0">
                    <div className="hidden sm:block"><p className="text-sm font-display font-bold text-white">{c.approved_count}</p><p className="text-[9px] text-text-secondary uppercase tracking-wider">Approved</p></div>
                    <div><p className="text-sm font-display font-bold text-white">{c.total_upvotes}</p><p className="text-[9px] text-text-secondary uppercase tracking-wider">Votes</p></div>
                    <div><p className="text-sm font-display font-bold text-white">{c.total_views}</p><p className="text-[9px] text-text-secondary uppercase tracking-wider">Views</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
              <Trophy className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No contributors yet</h3>
              <p className="text-text-secondary text-sm">Be the first!</p>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-5">
          {viewTarget && (
            <div className="bg-surface-raised/80 rounded-xl p-5 border border-white/[0.04] flex flex-col sm:flex-row items-center gap-3">
              {viewTarget.avatar_url ? (
                <img src={viewTarget.avatar_url} alt="" className="w-12 h-12 rounded-full ring-2 ring-white/[0.06]" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold ring-2 ring-white/[0.06]">
                  {viewTarget.author_name[0].toUpperCase()}
                </div>
              )}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg font-bold text-white">{viewTarget.author_name}</h2>
                <p className="text-text-secondary text-xs">{ACHIEVEMENTS.filter(a => a.check(viewTarget)).length}/{ACHIEVEMENTS.length} unlocked</p>
              </div>
              {selectedUser && (
                <button onClick={() => setSelectedUser(null)} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  {currentUserStats ? 'View mine' : 'Back'}
                </button>
              )}
            </div>
          )}

          {viewTarget && (
            <div className="bg-surface-raised/80 rounded-xl p-4 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Progress</span>
                <span className="text-xs font-bold text-indigo-400">{ACHIEVEMENTS.filter(a => a.check(viewTarget)).length}/{ACHIEVEMENTS.length}</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(ACHIEVEMENTS.filter(a => a.check(viewTarget)).length / ACHIEVEMENTS.length) * 100}%` }} transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const unlocked = viewTarget ? a.check(viewTarget) : false;
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className={cn("relative p-4 rounded-xl border transition-all overflow-hidden",
                    unlocked ? `ring-1 ${TIER_STYLES[a.tier]} border-white/[0.06]` : "bg-white/[0.01] border-white/[0.03] opacity-40"
                  )}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      unlocked ? `bg-gradient-to-br ${a.color} text-white shadow-lg` : "bg-white/[0.04] text-white/15"
                    )}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className={cn("font-bold text-xs", unlocked ? "text-white" : "text-white/30")}>{a.title}</h3>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          a.tier === 'legendary' ? 'text-yellow-400 bg-yellow-500/10' :
                          a.tier === 'gold' ? 'text-amber-400 bg-amber-500/10' :
                          a.tier === 'silver' ? 'text-slate-300 bg-slate-500/10' :
                          'text-amber-600 bg-amber-900/20'
                        )}>{a.tier}</span>
                      </div>
                      <p className={cn("text-[11px]", unlocked ? "text-text-secondary" : "text-white/15")}>{a.description}</p>
                    </div>
                    {unlocked && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {!viewTarget && (
            <div className="text-center py-12 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
              <Sparkles className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Sign in to track</h3>
              <p className="text-text-secondary text-sm">Contribute and unlock badges!</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
