import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Crown, Medal, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ContributorStats, ACHIEVEMENTS } from '../../lib/achievements';

interface LeaderboardTabProps {
  contributors: ContributorStats[];
  loading: boolean;
  currentUserStats: ContributorStats | undefined;
  currentUserRank: number;
  onSelectUser: (user: ContributorStats) => void;
}

export function LeaderboardTab({ contributors, loading, currentUserStats, currentUserRank, onSelectUser }: LeaderboardTabProps) {
  const { user } = useAuth();

  return (
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
              onClick={() => onSelectUser(c)}
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
  );
}
