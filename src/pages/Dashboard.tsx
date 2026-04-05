import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SlangCard } from '../components/SlangCard';
import { SlangData, SlangStatus } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldAlert, Database, CheckCircle, Clock, XCircle, ClipboardList, Copy, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { seedSlangs } from '../data/seedSlangs';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState<'review' | 'duplicates' | 'database'>('review');
  const [slangs, setSlangs] = useState<SlangData[]>([]);
  const [activeTab, setActiveTab] = useState<SlangStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const [duplicates, setDuplicates] = useState<{word: string, items: SlangData[]}[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user || (appUser?.role !== 'moderator' && appUser?.role !== 'admin')) {
      navigate('/');
      return;
    }

    if (activeMenu === 'review') {
      setLoading(true);

      const fetchSlangs = async () => {
        const { data, error } = await supabase
          .from('slangs')
          .select('*')
          .eq('status', activeTab)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching slangs:', error);
        } else {
          setSlangs(data as SlangData[]);
        }
        setLoading(false);
      };

      fetchSlangs();

      // Realtime subscription for dashboard
      const channel = supabase
        .channel('slangs-dashboard')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'slangs',
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSlang = payload.new as SlangData;
            if (newSlang.status === activeTab) {
              setSlangs(prev => [newSlang, ...prev]);
            }
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

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, appUser, isAuthReady, navigate, activeTab, activeMenu]);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('slangs')
        .update({ status: 'approved' as SlangStatus })
        .eq('id', id);

      if (error) throw error;
      setMessage({ text: 'Submission approved.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error approving:', error);
      setMessage({ text: 'Failed to approve.', type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('slangs')
        .update({ status: 'rejected' as SlangStatus })
        .eq('id', id);

      if (error) throw error;
      setMessage({ text: 'Submission rejected.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error rejecting:', error);
      setMessage({ text: 'Failed to reject.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('slangs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ text: 'Slang deleted successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      if (activeMenu === 'duplicates') {
        scanDuplicates();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ text: 'Failed to delete.', type: 'error' });
    }
  };

  const scanDuplicates = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.from('slangs').select('*');

      if (error) throw error;

      const wordMap = new Map<string, SlangData[]>();
      (data as SlangData[]).forEach(item => {
        const normalizedWord = item.word.toLowerCase().trim();
        if (!wordMap.has(normalizedWord)) {
          wordMap.set(normalizedWord, []);
        }
        wordMap.get(normalizedWord)!.push(item);
      });

      const dupes: {word: string, items: SlangData[]}[] = [];
      wordMap.forEach((items, word) => {
        if (items.length > 1) {
          dupes.push({ word, items });
        }
      });

      setDuplicates(dupes);
      if (dupes.length === 0) {
        setMessage({ text: 'No duplicates found!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error scanning duplicates:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSeed = async () => {
    if (!user || !appUser) return;

    setIsSeeding(true);
    setMessage({ text: 'Checking for existing slangs...', type: 'success' });
    try {
      const { data: existing } = await supabase.from('slangs').select('word');
      const existingWords = new Set((existing || []).map((s: any) => s.word.toLowerCase().trim()));

      const newSlangs = seedSlangs.filter(slang => !existingWords.has(slang.word.toLowerCase().trim()));

      if (newSlangs.length === 0) {
        setMessage({ text: 'All seed words are already in the database!', type: 'success' });
        setIsSeeding(false);
        return;
      }

      setMessage({ text: `Seeding ${newSlangs.length} new slangs...`, type: 'success' });

      const rows = newSlangs.map(slang => ({
        word: slang.word,
        pronunciation: slang.pronunciation || null,
        meaning: slang.meaning,
        meaning_burmese: slang.meaningBurmese,
        examples: slang.examples,
        author_id: user.id,
        author_name: appUser.display_name || 'System Admin',
        status: 'approved' as SlangStatus,
      }));

      const { error } = await supabase.from('slangs').insert(rows);
      if (error) throw error;

      setMessage({ text: `Successfully seeded ${newSlangs.length} slangs!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error seeding data:', error);
      setMessage({ text: `Error seeding data: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAuthReady) {
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
      className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8"
    >
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{appUser?.role}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveMenu('review')}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
              activeMenu === 'review' ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-white/50 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <ClipboardList className="w-5 h-5" /> Review Submissions
          </button>

          <button
            onClick={() => { setActiveMenu('duplicates'); scanDuplicates(); }}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
              activeMenu === 'duplicates' ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-white/50 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <Copy className="w-5 h-5" /> Scan Duplicates
          </button>

          {appUser?.role === 'admin' && (
            <button
              onClick={() => setActiveMenu('database')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
                activeMenu === 'database' ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Database className="w-5 h-5" /> Database
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 space-y-6">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "p-4 rounded-xl text-sm font-medium flex items-center gap-3 border",
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
              )}
            >
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {activeMenu === 'review' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-xl w-fit border border-white/5">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <Clock className="w-4 h-4" /> Pending
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'approved' ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <CheckCircle className="w-4 h-4" /> Approved
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'rejected' ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <XCircle className="w-4 h-4" /> Rejected
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : slangs.length > 0 ? (
              <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                  {slangs.map((slang, index) => (
                    <motion.div
                      key={slang.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SlangCard
                        slang={slang}
                        isModeratorView={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onEdit={(id) => navigate(`/edit/${id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-surface-raised rounded-2xl border border-dashed border-white/10"
              >
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">All caught up!</h3>
                <p className="text-text-secondary text-lg">There are no {activeTab} submissions to review.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeMenu === 'duplicates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-raised p-6 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-2xl font-bold text-white">Duplicate Words</h2>
                <p className="text-text-secondary mt-1">Find and resolve multiple entries for the same slang word.</p>
              </div>
              <button
                onClick={scanDuplicates}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 text-sm font-semibold transition-all w-full sm:w-auto border border-indigo-500/20"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Rescan Database
              </button>
            </div>

            {isScanning ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : duplicates.length > 0 ? (
              <div className="space-y-6">
                {duplicates.map(group => (
                  <div key={group.word} className="bg-surface-raised p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">
                      "{group.word}"
                      <span className="text-sm font-medium text-text-secondary ml-3 bg-white/5 px-2.5 py-1 rounded-lg">
                        {group.items.length} entries
                      </span>
                    </h3>
                    <div className="grid gap-4">
                      {group.items.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/[0.02] rounded-xl border border-white/5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn(
                                "text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider",
                                item.status === 'approved' ? "bg-emerald-500/15 text-emerald-400" :
                                item.status === 'pending' ? "bg-amber-500/15 text-amber-400" :
                                "bg-red-500/15 text-red-400"
                              )}>
                                {item.status}
                              </span>
                              <span className="text-sm font-medium text-text-secondary">by {item.author_name}</span>
                              <span className="text-sm font-medium text-white/30 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/80 font-medium line-clamp-2">{item.meaning}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              to={`/slang/${item.id}`}
                              target="_blank"
                              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-indigo-400 hover:border-indigo-500/30 rounded-xl text-sm font-semibold transition-all"
                            >
                              <ExternalLink className="w-4 h-4" /> View
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all border border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-raised rounded-2xl border border-dashed border-white/10">
                <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500/50" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">No duplicates found</h3>
                <p className="text-text-secondary text-lg">Your dictionary is clean and organized.</p>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'database' && appUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-surface-raised p-8 rounded-2xl border border-white/5">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">Seed Initial Data</h3>
                  <p className="text-text-secondary mt-2 mb-6 text-lg">
                    Populate the database with common Myanmar slangs. This will skip any words that already exist to prevent duplicates.
                  </p>
                  <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-70"
                  >
                    {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                    Seed Slangs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
