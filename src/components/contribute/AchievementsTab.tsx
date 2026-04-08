import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ContributorStats, ACHIEVEMENTS, TIER_STYLES } from '../../lib/achievements';

interface AchievementsTabProps {
  viewTarget: ContributorStats | undefined;
  selectedUser: ContributorStats | null;
  currentUserStats: ContributorStats | undefined;
  onClearSelection: () => void;
}

export function AchievementsTab({ viewTarget, selectedUser, currentUserStats, onClearSelection }: AchievementsTabProps) {
  if (!viewTarget) {
    return (
      <div className="text-center py-12 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
        <Sparkles className="w-8 h-8 text-white/15 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Sign in to track</h3>
        <p className="text-text-secondary text-sm">Contribute and unlock badges!</p>
      </div>
    );
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(viewTarget)).length;

  return (
    <div className="space-y-5">
      {/* User info */}
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
          <p className="text-text-secondary text-xs">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</p>
        </div>
        {selectedUser && (
          <button onClick={onClearSelection} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            {currentUserStats ? 'View mine' : 'Back'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-surface-raised/80 rounded-xl p-4 border border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Progress</span>
          <span className="text-xs font-bold text-indigo-400">{unlockedCount}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }} transition={{ duration: 0.6 }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = a.check(viewTarget);
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
    </div>
  );
}
