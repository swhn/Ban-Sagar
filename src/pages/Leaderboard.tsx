import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Medal, Crown, Star, Flame, Zap, Heart, Eye, BookOpen, Sparkles, Award, Target, Rocket, TrendingUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
  // Contribution milestones
  {
    id: 'first_word',
    title: 'First Word',
    description: 'Submit your first slang word',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'from-sky-400 to-blue-500',
    check: (s) => s.total_count >= 1,
    tier: 'bronze',
  },
  {
    id: 'wordsmith',
    title: 'Wordsmith',
    description: 'Get 5 slangs approved',
    icon: <Star className="w-5 h-5" />,
    color: 'from-emerald-400 to-green-500',
    check: (s) => s.approved_count >= 5,
    tier: 'bronze',
  },
  {
    id: 'slang_scholar',
    title: 'Slang Scholar',
    description: 'Get 15 slangs approved',
    icon: <Award className="w-5 h-5" />,
    color: 'from-violet-400 to-purple-500',
    check: (s) => s.approved_count >= 15,
    tier: 'silver',
  },
  {
    id: 'dictionary_builder',
    title: 'Dictionary Builder',
    description: 'Get 30 slangs approved',
    icon: <Target className="w-5 h-5" />,
    color: 'from-amber-400 to-orange-500',
    check: (s) => s.approved_count >= 30,
    tier: 'gold',
  },
  {
    id: 'slang_master',
    title: 'Slang Master',
    description: 'Get 50 slangs approved',
    icon: <Crown className="w-5 h-5" />,
    color: 'from-rose-400 to-pink-500',
    check: (s) => s.approved_count >= 50,
    tier: 'gold',
  },
  {
    id: 'legendary_contributor',
    title: 'Legendary Contributor',
    description: 'Get 100 slangs approved',
    icon: <Rocket className="w-5 h-5" />,
    color: 'from-yellow-300 to-amber-500',
    check: (s) => s.approved_count >= 100,
    tier: 'legendary',
  },
  // Engagement milestones
  {
    id: 'crowd_favorite',
    title: 'Crowd Favorite',
    description: 'Receive 10 total upvotes',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-pink-400 to-rose-500',
    check: (s) => s.total_upvotes >= 10,
    tier: 'bronze',
  },
  {
    id: 'trending',
    title: 'Trending',
    description: 'Receive 50 total upvotes',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-fuchsia-400 to-purple-500',
    check: (s) => s.total_upvotes >= 50,
    tier: 'silver',
  },
  {
    id: 'viral',
    title: 'Viral',
    description: 'Your slangs viewed 100+ times',
    icon: <Eye className="w-5 h-5" />,
    color: 'from-cyan-400 to-blue-500',
    check: (s) => s.total_views >= 100,
    tier: 'silver',
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Receive 100 total upvotes',
    icon: <Flame className="w-5 h-5" />,
    color: 'from-orange-400 to-red-500',
    check: (s) => s.total_upvotes >= 100,
    tier: 'gold',
  },
  {
    id: 'hall_of_fame',
    title: 'Hall of Fame',
    description: 'Your slangs viewed 1000+ times',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-yellow-300 to-orange-500',
    check: (s) => s.total_views >= 1000,
    tier: 'legendary',
  },
];

const TIER_STYLES = {
  bronze: 'ring-amber-700/30 bg-amber-900/20',
  silver: 'ring-slate-400/30 bg-slate-500/10',
  gold: 'ring-yellow-500/40 bg-yellow-500/10',
  legendary: 'ring-purple-500/40 bg-gradient-to-br from-purple-500/10 to-amber-500/10',
};

function getRankIcon(index: number) {
  if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
  if (index === 1) return <Medal className="w-6 h-6 text-slate-300" />;
  if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-white/40">#{index + 1}</span>;
}

function getRankGlow(index: number) {
  if (index === 0) return 'ring-2 ring-yellow-500/30 shadow-lg shadow-yellow-500/10';
  if (index === 1) return 'ring-2 ring-slate-400/20';
  if (index === 2) return 'ring-2 ring-amber-700/20';
  return '';
}

export function Leaderboard() {
  const { user } = useAuth();
  const [contributors, setContributors] = useState<ContributorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'leaderboard' | 'achievements'>('leaderboard');
  const [selectedUser, setSelectedUser] = useState<ContributorStats | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all slangs with author info
      const { data: slangs, error } = await supabase
        .from('slangs')
        .select('author_id, author_name, status, upvotes, views');

      if (error) throw error;

      // Fetch user avatars
      const { data: users } = await supabase
        .from('users')
        .select('id, avatar_url');

      const avatarMap = new Map((users || []).map((u: any) => [u.id, u.avatar_url]));

      // Aggregate by author
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

      const sorted = Array.from(statsMap.values())
        .sort((a, b) => b.approved_count - a.approved_count || b.total_upvotes - a.total_upvotes);

      setContributors(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentUserStats = contributors.find(c => c.author_id === user?.id);
  const currentUserRank = contributors.findIndex(c => c.author_id === user?.id) + 1;

  const viewAchievements = selectedUser || currentUserStats;
  const unlockedAchievements = viewAchievements
    ? ACHIEVEMENTS.filter(a => a.check(viewAchievements))
    : [];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20"
        >
          <Trophy className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white">
          Leaderboard
        </h1>
        <p className="text-text-secondary text-lg">Top contributors to the Myanmar Slang Dictionary</p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center">
        <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => { setActiveView('leaderboard'); setSelectedUser(null); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
              activeView === 'leaderboard' ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            )}
          >
            <Trophy className="w-4 h-4" /> Rankings
          </button>
          <button
            onClick={() => setActiveView('achievements')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
              activeView === 'achievements' ? 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            )}
          >
            <Sparkles className="w-4 h-4" /> Achievements
          </button>
        </div>
      </div>

      {activeView === 'leaderboard' && (
        <div className="space-y-6">
          {/* Current user highlight */}
          {currentUserStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {currentUserStats.avatar_url ? (
                  <img src={currentUserStats.avatar_url} alt="" className="w-12 h-12 rounded-full ring-2 ring-indigo-500/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold ring-2 ring-indigo-500/30">
                    {currentUserStats.author_name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white">Your Rank</p>
                  <p className="text-indigo-400 text-sm font-medium">
                    #{currentUserRank} of {contributors.length} contributors
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-display font-bold text-white">{currentUserStats.approved_count}</p>
                  <p className="text-xs text-indigo-400 font-medium">Approved</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-white">{currentUserStats.total_upvotes}</p>
                  <p className="text-xs text-indigo-400 font-medium">Upvotes</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-white">{currentUserStats.total_views}</p>
                  <p className="text-xs text-indigo-400 font-medium">Views</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rankings list */}
          {contributors.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {contributors.map((c, index) => (
                  <motion.div
                    key={c.author_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      "flex flex-col sm:flex-row items-center gap-4 p-5 bg-surface-raised rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer",
                      getRankGlow(index),
                      c.author_id === user?.id && 'border-indigo-500/20 bg-indigo-500/5'
                    )}
                    onClick={() => {
                      setSelectedUser(c);
                      setActiveView('achievements');
                    }}
                  >
                    {/* Rank */}
                    <div className="shrink-0">
                      {getRankIcon(index)}
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-10 h-10 rounded-full ring-2 ring-white/10" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-white/10">
                          {c.author_name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{c.author_name}</p>
                        <p className="text-xs text-text-secondary">
                          {unlockedForUser(c).length} achievement{unlockedForUser(c).length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-5 sm:gap-8 text-center shrink-0">
                      <div>
                        <p className="text-lg font-display font-bold text-white">{c.approved_count}</p>
                        <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">Approved</p>
                      </div>
                      <div>
                        <p className="text-lg font-display font-bold text-white">{c.total_upvotes}</p>
                        <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">Upvotes</p>
                      </div>
                      <div>
                        <p className="text-lg font-display font-bold text-white">{c.total_views}</p>
                        <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">Views</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-surface-raised rounded-2xl border border-dashed border-white/10">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">No contributors yet</h3>
              <p className="text-text-secondary text-lg">Be the first to contribute a slang word!</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'achievements' && (
        <div className="space-y-6">
          {/* Selected user info */}
          {viewAchievements && (
            <div className="bg-surface-raised rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-center gap-4">
              {viewAchievements.avatar_url ? (
                <img src={viewAchievements.avatar_url} alt="" className="w-14 h-14 rounded-full ring-2 ring-white/10" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg ring-2 ring-white/10">
                  {viewAchievements.author_name[0].toUpperCase()}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white">{viewAchievements.author_name}</h2>
                <p className="text-text-secondary text-sm">
                  {unlockedAchievements.length} of {ACHIEVEMENTS.length} achievements unlocked
                </p>
              </div>
              {selectedUser && (
                <button
                  onClick={() => setSelectedUser(null)}
                  className="sm:ml-auto text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {currentUserStats ? 'View mine' : 'Back'}
                </button>
              )}
            </div>
          )}

          {/* Progress bar */}
          {viewAchievements && (
            <div className="bg-surface-raised rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Progress</span>
                <span className="text-sm font-bold text-indigo-400">
                  {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Achievement grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((achievement, index) => {
              const unlocked = viewAchievements ? achievement.check(viewAchievements) : false;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "relative p-5 rounded-2xl border transition-all overflow-hidden",
                    unlocked
                      ? `ring-1 ${TIER_STYLES[achievement.tier]} border-white/10`
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      unlocked
                        ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg`
                        : "bg-white/5 text-white/20"
                    )}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-bold text-sm", unlocked ? "text-white" : "text-white/40")}>
                          {achievement.title}
                        </h3>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          achievement.tier === 'legendary' ? 'text-yellow-400 bg-yellow-500/15' :
                          achievement.tier === 'gold' ? 'text-amber-400 bg-amber-500/15' :
                          achievement.tier === 'silver' ? 'text-slate-300 bg-slate-500/15' :
                          'text-amber-600 bg-amber-900/30'
                        )}>
                          {achievement.tier}
                        </span>
                      </div>
                      <p className={cn("text-xs", unlocked ? "text-text-secondary" : "text-white/20")}>
                        {achievement.description}
                      </p>
                    </div>
                    {unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {!viewAchievements && (
            <div className="text-center py-16 bg-surface-raised rounded-2xl border border-dashed border-white/10">
              <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-white mb-2">Sign in to track achievements</h3>
              <p className="text-text-secondary">Contribute slangs and unlock badges!</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function unlockedForUser(stats: ContributorStats): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.check(stats));
}
