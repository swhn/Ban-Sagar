import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Clock, User, CheckCircle, XCircle, Edit, Eye, Share2, Quote, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface SlangData {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  meaningBurmese?: string;
  examples?: string[];
  authorId: string;
  authorName?: string;
  status: 'pending' | 'approved' | 'rejected';
  upvotes: number;
  downvotes: number;
  views?: number;
  viewHistory?: Record<string, number>;
  createdAt: any;
  updatedAt: any;
}

interface SlangCardProps {
  slang: SlangData;
  isModeratorView?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const SlangCard: React.FC<SlangCardProps> = ({ slang, isModeratorView, onApprove, onReject, onEdit }) => {
  const { user } = useAuth();
  
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(slang.upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(slang.downvotes);

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
        const voteRef = doc(db, 'votes', `${user.uid}_${slang.id}`);
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          setUserVote(voteDoc.data().voteType);
        } else {
          setUserVote(null);
        }
      } catch (error) {
        console.error("Error fetching vote:", error);
      }
    };
    fetchVote();
  }, [user, slang.id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const handleVote = async (type: 'up' | 'down') => {
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

    try {
      const slangRef = doc(db, 'slangs', slang.id);
      const voteRef = doc(db, 'votes', `${user.uid}_${slang.id}`);
      
      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);
        
        if (voteDoc.exists()) {
          const currentVote = voteDoc.data().voteType;
          if (currentVote === type) {
            // Remove vote
            transaction.delete(voteRef);
            transaction.update(slangRef, {
              [type === 'up' ? 'upvotes' : 'downvotes']: increment(-1),
              updatedAt: serverTimestamp()
            });
          } else {
            // Change vote
            transaction.update(voteRef, { voteType: type });
            transaction.update(slangRef, {
              upvotes: increment(type === 'up' ? 1 : -1),
              downvotes: increment(type === 'down' ? 1 : -1),
              updatedAt: serverTimestamp()
            });
          }
        } else {
          // New vote
          transaction.set(voteRef, {
            userId: user.uid,
            slangId: slang.id,
            voteType: type,
            createdAt: serverTimestamp()
          });
          transaction.update(slangRef, {
            [type === 'up' ? 'upvotes' : 'downvotes']: increment(1),
            updatedAt: serverTimestamp()
          });
        }
      });
    } catch (error) {
      // Revert on error
      setUserVote(previousVote);
      setOptimisticUpvotes(slang.upvotes);
      setOptimisticDownvotes(slang.downvotes);
      handleFirestoreError(error, OperationType.UPDATE, `slangs/${slang.id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl",
        slang.status === 'pending' && "border-amber-200 bg-amber-50/30",
        slang.status === 'rejected' && "border-red-200 bg-red-50/30"
      )}
    >
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight mb-1">
              {slang.word}
            </h3>
            {slang.pronunciation && (
              <p className="text-lg text-slate-500 font-medium mb-3">{slang.pronunciation}</p>
            )}
            <div className="flex items-center gap-3">
              {isModeratorView && (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                  slang.status === 'approved' ? "bg-emerald-100 text-emerald-800" :
                  slang.status === 'pending' ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {slang.status}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
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
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              )}
              {slang.status !== 'rejected' && (
                <button 
                  onClick={() => onReject?.(slang.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              )}
              <button 
                onClick={() => onEdit?.(slang.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Meaning (English)</h4>
            <p className="text-slate-800 text-lg leading-relaxed">{slang.meaning}</p>
          </div>
          
          {slang.meaningBurmese && (
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Meaning (Burmese)</h4>
              <p className="text-slate-800 text-lg leading-relaxed font-medium">{slang.meaningBurmese}</p>
            </div>
          )}

          {slang.examples && slang.examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Examples</h4>
              <ul className="space-y-3">
                {slang.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                    <Quote className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                    <span className="italic leading-relaxed">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 inline-flex w-fit">
            <button 
              onClick={() => handleVote('up')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold",
                userVote === 'up' ? "text-indigo-600 bg-indigo-100/50" : "text-slate-600 hover:bg-slate-200/50"
              )}
            >
              <ThumbsUp className={cn("w-5 h-5", userVote === 'up' && "fill-indigo-600")} />
              <span>{optimisticUpvotes}</span>
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button 
              onClick={() => handleVote('down')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold",
                userVote === 'down' ? "text-red-600 bg-red-100/50" : "text-slate-600 hover:bg-slate-200/50"
              )}
            >
              <ThumbsDown className={cn("w-5 h-5", userVote === 'down' && "fill-red-600")} />
              <span>{optimisticDownvotes}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-5 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              <span>{slang.authorName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formatDate(slang.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
