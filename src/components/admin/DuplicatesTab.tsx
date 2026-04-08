import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { SlangData } from '../../lib/database.types';
import { Loader2, CheckCircle, Copy, Trash2, ExternalLink, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function DuplicatesTab() {
  const [duplicates, setDuplicates] = useState<{ word: string; items: SlangData[] }[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    scanDuplicates();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const scanDuplicates = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.from('slangs').select('*');
      if (error) throw error;

      const wordMap = new Map<string, SlangData[]>();
      (data as SlangData[]).forEach(item => {
        const key = item.word.toLowerCase().trim();
        if (!wordMap.has(key)) wordMap.set(key, []);
        wordMap.get(key)!.push(item);
      });

      const dupes: { word: string; items: SlangData[] }[] = [];
      wordMap.forEach((items, word) => { if (items.length > 1) dupes.push({ word, items }); });
      setDuplicates(dupes);
      if (dupes.length === 0) showMessage('No duplicates found!', 'success');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('slangs').delete().eq('id', id);
    if (!error) scanDuplicates();
    showMessage(error ? 'Failed to delete.' : 'Deleted.', error ? 'error' : 'success');
  };

  return (
    <div className="space-y-5">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Duplicate Scanner</h3>
          <p className="text-text-secondary text-sm mt-0.5">Find and resolve duplicate entries.</p>
        </div>
        <button
          onClick={scanDuplicates}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.04] text-white/60 rounded-xl hover:bg-white/[0.06] text-sm font-semibold transition-all border border-white/[0.06] shrink-0"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
          Rescan
        </button>
      </div>

      {isScanning ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : duplicates.length > 0 ? (
        <div className="space-y-4">
          {duplicates.map(group => (
            <div key={group.word} className="bg-surface-raised/80 p-5 rounded-2xl border border-white/[0.04] space-y-3">
              <h3 className="text-lg font-bold text-white pb-3 border-b border-white/[0.04]">
                "{group.word}"
                <span className="text-xs font-medium text-text-secondary ml-2 bg-white/[0.04] px-2 py-0.5 rounded-md">{group.items.length}</span>
              </h3>
              {group.items.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/[0.015] rounded-xl border border-white/[0.03]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                        item.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" :
                        item.status === 'pending' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      )}>{item.status}</span>
                      <span className="text-xs text-text-secondary">by {item.author_name}</span>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-1">{item.meaning}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/slang/${item.slug || item.id}`} target="_blank"
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-indigo-400 rounded-lg text-xs font-semibold transition-all">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </Link>
                    <button onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/[0.06] text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-semibold transition-all border border-red-500/15">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
          <div className="bg-white/[0.03] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500/30" />
          </div>
          <h3 className="text-lg font-display font-bold text-white mb-1">No duplicates</h3>
          <p className="text-text-secondary text-sm">Dictionary is clean.</p>
        </div>
      )}
    </div>
  );
}
