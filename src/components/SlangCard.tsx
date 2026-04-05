import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Clock, User, CheckCircle, XCircle, Edit, Eye, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SlangData, VoteType } from '../lib/database.types';

interface SlangCardProps {
  slang: SlangData;
  isModeratorView?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const SlangCard: React.FC<SlangCardProps> = ({ slang, isModeratorView, onApprove, onReject, onEdit }) => {
  const { user } = useAuth();

  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(slang.upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(slang.downvotes);
  const [voteAnimating, setVoteAnimating] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setOptimisticUpvotes(slang.upvotes);
    setOptimisticDownvotes(slang.downvotes);
  }, [slang.upvotes, slang.downvotes]);

  useEffect(() => {
    if (!user) { setUserVote(null); return; }
    const fetchVote = async () => {
      try {
        const { data } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('slang_id', slang.id)
          .maybeSingle();
        setUserVote(data?.vote_type as VoteType | null);
      } catch (error) {
        console.error('Error fetching vote:', error);
      }
    };
    fetchVote();
  }, [user, slang.id]);

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
  };

  const handleVote = async (type: VoteType) => {
    if (!user) return;
    const previousVote = userVote;

    if (previousVote === type) {
      setUserVote(null);
      if (type === 'up') setOptimisticUpvotes(prev => Math.max(0, prev - 1));
      else setOptimisticDownvotes(prev => Math.max(0, prev - 1));
    } else {
      setUserVote(type);
      if (type === 'up') {
        setOptimisticUpvotes(prev => prev + 1);
        if (previousVote === 'down') setOptimisticDownvotes(prev => Math.max(0, prev - 1));
      } else {
        setOptimisticDownvotes(prev => prev + 1);
        if (previousVote === 'up') setOptimisticUpvotes(prev => Math.max(0, prev - 1));
      }
    }

    setVoteAnimating(type);
    setTimeout(() => setVoteAnimating(null), 400);

    try {
      await supabase.rpc('handle_vote', {
        p_user_id: user.id,
        p_slang_id: slang.id,
        p_vote_type: type,
      });
    } catch (error) {
      setUserVote(previousVote);
      setOptimisticUpvotes(slang.upvotes);
      setOptimisticDownvotes(slang.downvotes);
      console.error('Vote error:', error);
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "bg-surface-raised rounded-2xl border overflow-hidden transition-all",
        slang.status === 'pending' ? "border-amber-500/15" :
        slang.status === 'rejected' ? "border-red-500/15" :
        "border-white/[0.04] hover:border-white/[0.08]"
      )}
    >
      <div className="p-5 sm:p-7">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-5">
          <div className="min-w-0">
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {slang.word}
            </h3>
            {slang.pronunciation && (
              <p className="text-base text-text-secondary font-medium mt-0.5">/{slang.pronunciation}/</p>
            )}
            <div className="flex items-center gap-2.5 mt-2.5">
              {isModeratorView && (
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  slang.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" :
                  slang.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                )}>
                  {slang.status}
                </span>
              )}
              <span className="flex items-center gap-1 text-text-secondary text-xs font-medium">
                <Eye className="w-3.5 h-3.5" /> {slang.views || 0}
              </span>
            </div>
          </div>

          {isModeratorView && (
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {slang.status !== 'approved' && (
                <button
                  onClick={() => onApprove?.(slang.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/15 text-xs font-semibold transition-all active:scale-95 border border-emerald-500/15"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {slang.status !== 'rejected' && (
                <button
                  onClick={() => onReject?.(slang.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/15 text-xs font-semibold transition-all active:scale-95 border border-red-500/15"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              <button
                onClick={() => onEdit?.(slang.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/15 text-xs font-semibold transition-all active:scale-95 border border-indigo-500/15"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.03]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">English</h4>
            <p className="text-white/85 text-[15px] leading-relaxed">{slang.meaning}</p>
          </div>

          {slang.meaning_burmese && (
            <div className="bg-indigo-500/[0.03] rounded-xl p-4 border border-indigo-500/[0.06]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/60 mb-1.5">Burmese</h4>
              <p className="text-white/85 text-[15px] leading-relaxed">{slang.meaning_burmese}</p>
            </div>
          )}

          {slang.examples && slang.examples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Examples</h4>
              {slang.examples.map((example, index) => (
                <div key={index} className="flex items-start gap-2.5 text-white/60 bg-white/[0.015] border border-white/[0.03] p-3.5 rounded-xl">
                  <Quote className="w-4 h-4 text-indigo-500/30 shrink-0 mt-0.5" />
                  <span className="italic text-sm leading-relaxed">{example}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Vote buttons */}
          <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04] w-fit">
            <motion.button
              onClick={() => handleVote('up')}
              animate={voteAnimating === 'up' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold",
                userVote === 'up' ? "text-indigo-400 bg-indigo-500/10" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", userVote === 'up' && "fill-indigo-400")} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={optimisticUpvotes}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {optimisticUpvotes}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <div className="w-px h-5 bg-white/[0.06]" />
            <motion.button
              onClick={() => handleVote('down')}
              animate={voteAnimating === 'down' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold",
                userVote === 'down' ? "text-red-400 bg-red-500/10" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              )}
            >
              <ThumbsDown className={cn("w-4 h-4", userVote === 'down' && "fill-red-400")} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={optimisticDownvotes}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {optimisticDownvotes}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Author + date */}
          <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-white/20" />
              {slang.author_name || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/20" />
              {formatDate(slang.created_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
