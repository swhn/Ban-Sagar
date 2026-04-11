import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Suggestion, SlangData } from '../../lib/database.types';
import {
  Loader2, CheckCircle, XCircle, Clock, Search, ExternalLink,
  MessageSquare, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

type SuggestionWithSlang = Suggestion & { slang_word?: string; slang_slug?: string };
type FilterStatus = 'pending' | 'approved' | 'rejected';

const FIELD_LABELS: Record<string, string> = {
  meaning: 'Meaning (EN)',
  meaning_burmese: 'Meaning (MM)',
  examples: 'Examples',
  pronunciation: 'Pronunciation',
  general: 'General',
};

export function SuggestionsTab() {
  const [suggestions, setSuggestions] = useState<SuggestionWithSlang[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSuggestions();

    const channel = supabase
      .channel('suggestions-review')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, () => {
        fetchSuggestions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeFilter]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('status', activeFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const slangIds = [...new Set((data || []).map((s: Suggestion) => s.slang_id))];
      let slangMap = new Map<string, { word: string; slug: string }>();

      if (slangIds.length > 0) {
        const { data: slangs } = await supabase
          .from('slangs')
          .select('id, word, slug')
          .in('id', slangIds);

        (slangs || []).forEach((s: any) => {
          slangMap.set(s.id, { word: s.word, slug: s.slug });
        });
      }

      const enriched: SuggestionWithSlang[] = (data || []).map((s: Suggestion) => ({
        ...s,
        slang_word: slangMap.get(s.slang_id)?.word || 'Unknown',
        slang_slug: slangMap.get(s.slang_id)?.slug,
      }));

      setSuggestions(enriched);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('suggestions').update({ status: 'approved' }).eq('id', id);
    showMessage(error ? 'Failed to approve.' : 'Suggestion approved.', error ? 'error' : 'success');
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('suggestions').update({ status: 'rejected' }).eq('id', id);
    showMessage(error ? 'Failed to reject.' : 'Suggestion rejected.', error ? 'error' : 'success');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (!error) setSuggestions(prev => prev.filter(s => s.id !== id));
    showMessage(error ? 'Failed to delete.' : 'Deleted.', error ? 'error' : 'success');
  };

  const filtered = suggestions.filter(s =>
    !searchQuery ||
    (s.slang_word && s.slang_word.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.user_name && s.user_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={cn("p-3 rounded-xl text-sm font-medium flex items-center gap-2.5 border",
              message.type === 'success' ? 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15' : 'bg-red-500/[0.06] text-red-400 border-red-500/15'
            )}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0">
          {([
            { key: 'pending' as const, label: 'Pending', icon: Clock, color: 'amber' },
            { key: 'approved' as const, label: 'Approved', icon: CheckCircle, color: 'emerald' },
            { key: 'rejected' as const, label: 'Rejected', icon: XCircle, color: 'red' },
          ]).map(({ key, label, icon: Icon, color }) => (
            <button key={key}
              onClick={() => { setActiveFilter(key); setSearchQuery(''); }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                activeFilter === key ? `bg-${color}-500/10 text-${color}-300` : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              )}>
              <Icon className="w-3.5 h-3.5" /> {label}
              {activeFilter === key && <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded-md ml-0.5">{filtered.length}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input type="text" placeholder="Search word, suggestion, or user..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Suggestions list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((suggestion, i) => (
              <motion.div key={suggestion.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.02 }}
                className="p-4 bg-surface-raised/80 rounded-xl border border-white/[0.04] hover:border-white/[0.07] transition-colors space-y-3"
              >
                {/* Header: slang word + field + time */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/slang/${suggestion.slang_slug || suggestion.slang_id}`}
                    className="font-display font-bold text-white text-base hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    {suggestion.slang_word}
                    <ExternalLink className="w-3 h-3 text-white/20" />
                  </Link>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    <Tag className="w-2.5 h-2.5" />
                    {FIELD_LABELS[suggestion.field] || suggestion.field}
                  </span>
                  <span className="text-[11px] text-white/20 ml-auto">{timeAgo(suggestion.created_at)}</span>
                </div>

                {/* Suggestion value */}
                <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                  <p className="text-sm text-white/70 whitespace-pre-wrap break-words">{suggestion.value}</p>
                </div>

                {/* Footer: user + actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-text-secondary">
                    by <span className="text-white/50 font-medium">{suggestion.user_name || 'Anonymous'}</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {suggestion.status !== 'approved' && (
                      <button onClick={() => handleApprove(suggestion.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/15 text-xs font-semibold transition-all border border-emerald-500/15">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {suggestion.status !== 'rejected' && (
                      <button onClick={() => handleReject(suggestion.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/15 text-xs font-semibold transition-all border border-red-500/15">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    <button onClick={() => handleDelete(suggestion.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/15 rounded-lg text-xs font-semibold transition-all">
                      <XCircle className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : searchQuery ? (
        <EmptyState icon={<Search className="w-8 h-8 text-white/15" />} title="No results" subtitle={`No matches for "${searchQuery}".`} />
      ) : (
        <EmptyState icon={<MessageSquare className="w-8 h-8 text-white/15" />} title="No suggestions" subtitle={`No ${activeFilter} suggestions yet.`} />
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
      <div className="bg-white/[0.03] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-display font-bold text-white mb-1">{title}</h3>
      <p className="text-text-secondary text-sm">{subtitle}</p>
    </div>
  );
}
