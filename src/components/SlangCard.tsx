import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Clock, User, CheckCircle, XCircle, Edit, Eye, Quote, AlertTriangle, MessageSquarePlus, Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SlangData, VoteType } from '../lib/database.types';
import { useSiteSettings } from '../lib/useSiteSettings';
import { useI18n } from '../lib/i18n';

interface SlangCardProps {
  slang: SlangData;
  headingLevel?: 'h1' | 'h2' | 'h3';
  isModeratorView?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const SlangCard: React.FC<SlangCardProps> = ({ slang, headingLevel = 'h3', isModeratorView, onApprove, onReject, onEdit }) => {
  const Heading = headingLevel;
  const { user, appUser } = useAuth();
  const siteSettings = useSiteSettings();
  const { t } = useI18n();
  const navigate = useNavigate();
  const isNsfwBlurred = slang.is_nsfw && !appUser?.show_nsfw;

  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(slang.upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(slang.downvotes);
  const [voteAnimating, setVoteAnimating] = useState<'up' | 'down' | null>(null);

  // Suggest state
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestField, setSuggestField] = useState<string>('general');
  const [suggestValue, setSuggestValue] = useState('');
  const [suggestSending, setSuggestSending] = useState(false);
  const [suggestSent, setSuggestSent] = useState(false);

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

  const handleSuggest = async () => {
    if (!user || !suggestValue.trim()) return;
    setSuggestSending(true);
    try {
      await supabase.from('suggestions').insert({
        slang_id: slang.id,
        user_id: user.id,
        user_name: appUser?.display_name || null,
        field: suggestField,
        value: suggestValue.trim(),
      });
      setSuggestSent(true);
      setTimeout(() => {
        setShowSuggest(false);
        setSuggestSent(false);
        setSuggestValue('');
        setSuggestField('general');
      }, 1500);
    } catch (error) {
      console.error('Suggestion error:', error);
    } finally {
      setSuggestSending(false);
    }
  };

  const handleNsfwClick = () => {
    if (user) {
      navigate('/profile');
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
            <div className="flex items-center gap-2.5">
              <Heading className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight font-burmese">
                {slang.word}
              </Heading>
              {slang.is_nsfw && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/15 shrink-0">
                  <AlertTriangle className="w-3 h-3" /> NSFW
                </span>
              )}
            </div>
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
        <div className="relative">
          <div className={cn("space-y-3 transition-all duration-300", isNsfwBlurred && "blur-md select-none pointer-events-none")}>
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.03]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">English</h4>
              <p className="text-white/85 text-[15px] leading-relaxed">{slang.meaning}</p>
            </div>

            {slang.meaning_burmese && (
              <div className="bg-indigo-500/[0.03] rounded-xl p-4 border border-indigo-500/[0.06]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/60 mb-1.5">Burmese</h4>
                <p className="text-white/85 text-[15px] leading-relaxed font-burmese">{slang.meaning_burmese}</p>
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

          {isNsfwBlurred && (
            <div
              className={cn("absolute inset-0 flex items-center justify-center", user && "cursor-pointer")}
              onClick={handleNsfwClick}
            >
              <div className="text-center px-4">
                <AlertTriangle className="w-8 h-8 text-red-400/60 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white/70">NSFW Content</p>
                {user ? (
                  <p className="text-xs text-indigo-400/70 mt-1 hover:text-indigo-400 transition-colors">
                    Tap to go to NSFW settings
                  </p>
                ) : (
                  <p className="text-xs text-white/40 mt-1">Sign in to enable NSFW content</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Vote buttons + Suggest */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04] w-fit">
              <motion.button
                onClick={() => handleVote('up')}
                animate={voteAnimating === 'up' ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
                aria-label={t('slang.upvote', { word: slang.word, count: optimisticUpvotes })}
                aria-pressed={userVote === 'up'}
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
                aria-label={t('slang.downvote', { word: slang.word, count: optimisticDownvotes })}
                aria-pressed={userVote === 'down'}
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

            {/* Suggest button - only when suggestions are enabled */}
            {user && slang.status === 'approved' && !isModeratorView && siteSettings.allow_suggestions && (
              <button
                onClick={() => setShowSuggest(!showSuggest)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95",
                  showSuggest
                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/15"
                    : "text-white/35 hover:text-amber-400 hover:bg-amber-500/10"
                )}
                title="Suggest an improvement"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>{t('slang.suggest')}</span>
              </button>
            )}
          </div>

          {/* Date */}
          <span className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
            <Clock className="w-3.5 h-3.5 text-white/20" />
            {formatDate(slang.created_at)}
          </span>
        </div>

        {/* Suggest Form */}
        <AnimatePresence>
          {showSuggest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-amber-500/[0.04] rounded-xl border border-amber-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquarePlus className="w-3.5 h-3.5" /> Suggest Improvement
                  </h4>
                  <button onClick={() => setShowSuggest(false)} className="text-white/30 hover:text-white/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {suggestSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm font-medium py-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Suggestion sent! Moderators will review it.
                  </motion.div>
                ) : (
                  <>
                    <select
                      value={suggestField}
                      onChange={(e) => setSuggestField(e.target.value)}
                      className="w-full px-3 py-2 bg-surface/80 border border-white/[0.06] rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/20"
                    >
                      <option value="general">General improvement</option>
                      <option value="meaning">English meaning</option>
                      <option value="meaning_burmese">Burmese meaning</option>
                      <option value="examples">Examples</option>
                      <option value="pronunciation">Pronunciation</option>
                    </select>
                    <textarea
                      value={suggestValue}
                      onChange={(e) => setSuggestValue(e.target.value)}
                      placeholder="Describe your suggestion..."
                      maxLength={2000}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-surface/80 border border-white/[0.06] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/20 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/20">{suggestValue.length}/2000</span>
                      <button
                        onClick={handleSuggest}
                        disabled={suggestSending || !suggestValue.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 border border-amber-500/15"
                      >
                        {suggestSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Send
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
