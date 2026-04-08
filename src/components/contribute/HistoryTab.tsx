import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SlangData } from '../../lib/database.types';
import { BookOpen, ThumbsUp, Eye, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function HistoryTab() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SlangData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('slangs')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setSubmissions(data as SlangData[]);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-white/[0.04]">
        <BookOpen className="w-8 h-8 text-white/15 mx-auto mb-3" />
        <p className="text-white/60 font-medium">Sign in to see your contributions</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
        <BookOpen className="w-8 h-8 text-white/15 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No submissions yet</h3>
        <p className="text-text-secondary text-sm">Start contributing to the dictionary!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((slang, i) => (
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
      ))}
    </div>
  );
}
