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
    if (!user) {
      setUserVote(null);
      return;
    }
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

    // Optimistic update
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
      // Revert on error
      setUserVote(previousVote);
      setOptimisticUpvotes(slang.upvotes);
      setOptimisticDownvotes(slang.downvotes);
      console.error('Vote error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface-raised rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10",
        slang.status === 'pending' && "border-amber-500/20 bg-amber-500/5",
        slang.status === 'rejected' && "border-red-500/20 bg-red-500/5"
      )}
    >
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-1">
              {slang.word}
            </h3>
            {slang.pronunciation && (
              <p className="text-lg text-text-secondary font-medium mb-3">/{slang.pronunciation}/</p>
            )}
            <div className="flex items-center gap-3">
              {isModeratorView && (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                  slang.status === 'approved' ? "bg-emerald-500/15 text-emerald-400" :
                  slang.status === 'pending' ? "bg-amber-500/15 text-amber-400" :
                  "bg-red-500/15 text-red-400"
                )}>
                  {slang.status}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-text-secondary text-sm font-medium">
                <Eye className="w-4 h-4" />
                <span>{slang.views || 0} views</span>
              </div>
            </div>
          </div>

          {isModeratorView && (
            <div className="flex flex-col gap-2 shrink-0">
              {slang.status !== 'approved' && (
                <button
                  onClick={() => onApprove?.(slang.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 text-sm font-semibold transition-all hover:scale-105 active:scale-95 border border-emerald-500/20"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              )}
              {slang.status !== 'rejected' && (
                <button
                  onClick={() => onReject?.(slang.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 text-sm font-semibold transition-all hover:scale-105 active:scale-95 border border-red-500/20"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              )}
              <button
                onClick={() => onEdit?.(slang.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 text-sm font-semibold transition-all hover:scale-105 active:scale-95 border border-indigo-500/20"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Meaning (English)</h4>
            <p className="text-white/90 text-lg leading-relaxed">{slang.meaning}</p>
          </div>

          {slang.meaning_burmese && (
            <div className="bg-indigo-500/5 rounded-2xl p-5 border border-indigo-500/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400/70 mb-2">Meaning (Burmese)</h4>
              <p className="text-white/90 text-lg leading-relaxed font-medium">{slang.meaning_burmese}</p>
            </div>
          )}

          {slang.examples && slang.examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Examples</h4>
              <ul className="space-y-2">
                {slang.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-3 text-white/70 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <Quote className="w-5 h-5 text-indigo-500/50 shrink-0 mt-0.5" />
                    <span className="italic leading-relaxed">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 w-fit">
            <motion.button
              onClick={() => handleVote('up')}
              animate={voteAnimating === 'up' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold",
                userVote === 'up' ? "text-indigo-400 bg-indigo-500/15" : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <ThumbsUp className={cn("w-5 h-5", userVote === 'up' && "fill-indigo-400")} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={optimisticUpvotes}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {optimisticUpvotes}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <motion.button
              onClick={() => handleVote('down')}
              animate={voteAnimating === 'down' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold",
                userVote === 'down' ? "text-red-400 bg-red-500/15" : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <ThumbsDown className={cn("w-5 h-5", userVote === 'down' && "fill-red-400")} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={optimisticDownvotes}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {optimisticDownvotes}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
            <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
              <User className="w-4 h-4 text-white/30" />
              <span>{slang.author_name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/30" />
              <span>{formatDate(slang.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
