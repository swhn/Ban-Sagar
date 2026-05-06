import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { SlangData, SlangStatus } from '../../lib/database.types';
import {
  Loader2, CheckCircle, Clock, XCircle, Search, Edit, ThumbsUp, Eye,
  AlertTriangle, ExternalLink, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { sendNotification } from '../../lib/notifications';

export function ReviewTab() {
  const navigate = useNavigate();
  const [slangs, setSlangs] = useState<SlangData[]>([]);
  const [activeTab, setActiveTab] = useState<SlangStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchSlangs = async () => {
      const { data, error } = await supabase
        .from('slangs')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching slangs:', error);
      else setSlangs(data as SlangData[]);
      setLoading(false);
    };

    fetchSlangs();

    const channel = supabase
      .channel('slangs-review')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slangs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newSlang = payload.new as SlangData;
          if (newSlang.status === activeTab) setSlangs(prev => [newSlang, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as SlangData;
          setSlangs(prev => {
            if (updated.status === activeTab) {
              const exists = prev.find(s => s.id === updated.id);
              if (exists) return prev.map(s => s.id === updated.id ? updated : s);
              return [updated, ...prev];
            }
            return prev.filter(s => s.id !== updated.id);
          });
        } else if (payload.eventType === 'DELETE') {
          setSlangs(prev => prev.filter(s => s.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (id: string) => {
    const slang = slangs.find(s => s.id === id);
    const { error } = await supabase.from('slangs').update({ status: 'approved' as SlangStatus }).eq('id', id);

    if (!error && slang) {
      try {
        const { data: setting } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'notify_contribution_approved')
          .single();

        if (setting?.value === 'true') {
          const { data: author } = await supabase
            .from('users')
            .select('email, notify_approved')
            .eq('id', slang.author_id)
            .single();

          if (author?.email && author.notify_approved !== false) {
            sendNotification('contribution_approved', author.email, {
              word: slang.word,
              slug: slang.slug || slang.id,
            });
          }
        }
      } catch {}
    }

    showMessage(error ? 'Failed to approve.' : 'Approved.', error ? 'error' : 'success');
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('slangs').update({ status: 'rejected' as SlangStatus }).eq('id', id);
    showMessage(error ? 'Failed to reject.' : 'Rejected.', error ? 'error' : 'success');
  };

  const filtered = slangs.filter(s =>
    !searchQuery || s.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.meaning && s.meaning.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.author_name && s.author_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              onClick={() => { setActiveTab(key); setSearchQuery(''); }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                activeTab === key ? `bg-${color}-500/10 text-${color}-300` : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              )}>
              <Icon className="w-3.5 h-3.5" /> {label}
              {activeTab === key && <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded-md ml-0.5">{filtered.length}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input type="text" placeholder="Search word, meaning, or author..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Slang list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((slang, i) => (
              <motion.div key={slang.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.02 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-surface-raised/80 rounded-xl border border-white/[0.04] hover:border-white/[0.07] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-white text-base">{slang.word}</span>
                    {slang.pronunciation && <span className="text-xs text-text-secondary font-medium">/{slang.pronunciation}/</span>}
                    {slang.is_nsfw && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/15">
                        <AlertTriangle className="w-2.5 h-2.5" /> NSFW
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm line-clamp-1">{slang.meaning}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-text-secondary">by {slang.author_name || 'Anonymous'}</span>
                    <span className="flex items-center gap-1 text-[11px] text-white/20"><ThumbsUp className="w-3 h-3" /> {slang.upvotes || 0}</span>
                    <span className="flex items-center gap-1 text-[11px] text-white/20"><Eye className="w-3 h-3" /> {slang.views || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {slang.status !== 'approved' && (
                    <button onClick={() => handleApprove(slang.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/15 text-xs font-semibold transition-all border border-emerald-500/15">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {slang.status !== 'rejected' && (
                    <button onClick={() => handleReject(slang.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/15 text-xs font-semibold transition-all border border-red-500/15">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                  <button onClick={() => navigate(`/edit/${slang.id}`)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/15 text-xs font-semibold transition-all border border-indigo-500/15">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <Link to={`/slang/${slang.slug || slang.id}`} target="_blank"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 rounded-lg text-xs font-semibold transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : searchQuery ? (
        <EmptyState icon={<Search className="w-8 h-8 text-white/15" />} title="No results" subtitle={`No matches for "${searchQuery}".`} />
      ) : (
        <EmptyState icon={<ShieldAlert className="w-8 h-8 text-white/15" />} title="All caught up!" subtitle={`No ${activeTab} submissions.`} />
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
