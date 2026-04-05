import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SlangData, SlangStatus } from '../lib/database.types';
import { Plus, X, Loader2, ArrowLeft, Edit3, CheckCircle, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, generateSlug } from '../lib/utils';
import { generateSlangDetails } from '../lib/gemini';

export function EditSlang() {
  const { id } = useParams<{ id: string }>();
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [meaningBurmese, setMeaningBurmese] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [status, setStatus] = useState<SlangStatus>('pending');
  const [isNsfw, setIsNsfw] = useState(false);
  const [existingSlug, setExistingSlug] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = appUser?.role === 'admin';

  useEffect(() => {
    const fetchSlang = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('slangs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const s = data as SlangData;
          setWord(s.word);
          setPronunciation(s.pronunciation || '');
          setMeaning(s.meaning);
          setMeaningBurmese(s.meaning_burmese || '');
          setExamples(s.examples && s.examples.length > 0 ? s.examples : ['']);
          setStatus(s.status);
          setIsNsfw(s.is_nsfw || false);
          setExistingSlug(s.slug || '');
        }
      } catch (error) {
        console.error('Error fetching slang:', error);
        setErrorMsg('Slang not found');
      } finally {
        setLoading(false);
      }
    };

    fetchSlang();
  }, [id]);

  const handleAddExample = () => {
    if (examples.length < 5) setExamples([...examples, '']);
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = [...examples];
    newExamples.splice(index, 1);
    setExamples(newExamples);
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const handleGenerate = async () => {
    if (!word.trim()) {
      setErrorMsg('Enter a slang word first.');
      return;
    }
    setErrorMsg('');
    setIsGenerating(true);
    try {
      const result = await generateSlangDetails(word.trim());
      setPronunciation(result.pronunciation || '');
      setMeaning(result.meaning || '');
      setMeaningBurmese(result.meaning_burmese || '');
      setIsNsfw(result.is_nsfw || false);
      if (result.examples && result.examples.length > 0) {
        setExamples(result.examples.slice(0, 5));
      }
    } catch (error: any) {
      console.error('Gemini error:', error);
      setErrorMsg(error?.message || 'AI generation failed. Fill in manually or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user || !appUser || !id) return;

    if (!word.trim() || !meaning.trim() || !meaningBurmese.trim()) {
      setErrorMsg('Word, English meaning, and Burmese meaning are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const validExamples = examples.filter(ex => ex.trim() !== '');

      // Regenerate slug if word changed or slug is empty
      let slug = existingSlug;
      const newSlug = generateSlug(word.trim(), pronunciation.trim() || null);
      if (!slug || slug !== newSlug) {
        const { data: slugExists } = await supabase
          .from('slangs')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id)
          .maybeSingle();
        slug = slugExists ? `${newSlug}-${Date.now().toString(36).slice(-4)}` : newSlug;
      }

      const { error } = await supabase
        .from('slangs')
        .update({
          word: word.trim(),
          slug,
          pronunciation: pronunciation.trim() || null,
          meaning: meaning.trim(),
          meaning_burmese: meaningBurmese.trim(),
          examples: validExamples,
          status: status,
          is_nsfw: isNsfw,
        })
        .eq('id', id);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating slang:', error);
      setErrorMsg('Failed to update slang. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isAuthReady || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user || (appUser?.role !== 'moderator' && appUser?.role !== 'admin')) {
    return (
      <div className="text-center py-16 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-text-secondary text-sm">Only moderators and admins can edit slangs.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white text-sm font-medium rounded-xl transition-all active:scale-95 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6 text-center">
        <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-500/15">
          <Edit3 className="w-7 h-7 text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Edit Slang</h1>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-3.5 bg-red-500/10 border border-red-500/15 text-red-300 rounded-xl text-sm font-medium flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-surface-raised/80 p-5 sm:p-7 rounded-2xl border border-white/[0.04] space-y-5">
        <div>
          <label htmlFor="word" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Slang Word <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text" id="word" required maxLength={100}
              className="flex-1 px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-base font-medium text-white"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
            {isAdmin && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !word.trim()}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/20 text-purple-300 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-sm whitespace-nowrap shrink-0"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'AI Fill'}
              </button>
            )}
          </div>
        </div>

        {/* AI generating indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3.5 bg-purple-500/10 border border-purple-500/15 rounded-xl"
            >
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
              <span className="text-sm text-purple-300 font-medium">Gemini AI is generating details for "{word}"...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label htmlFor="pronunciation" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Pronunciation
          </label>
          <input
            type="text" id="pronunciation" maxLength={100}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-base font-medium text-white"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="meaning" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Meaning (English) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="meaning" required maxLength={1000} rows={3}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all resize-none text-sm text-white"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="meaningBurmese" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Meaning (Burmese) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="meaningBurmese" required maxLength={1000} rows={3}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all resize-none text-sm text-white"
            value={meaningBurmese}
            onChange={(e) => setMeaningBurmese(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Status
          </label>
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected'] as SlangStatus[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                  status === s
                    ? s === 'approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : s === 'rejected' ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* NSFW Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setIsNsfw(!isNsfw)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left",
              isNsfw
                ? "bg-red-500/10 border-red-500/20"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
            )}
          >
            <div className={cn(
              "w-10 h-6 rounded-full relative transition-all shrink-0",
              isNsfw ? "bg-red-500/40" : "bg-white/10"
            )}>
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full transition-all",
                isNsfw ? "left-5 bg-red-400" : "left-1 bg-white/40"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className={cn("w-3.5 h-3.5", isNsfw ? "text-red-400" : "text-white/30")} />
                <span className={cn("text-sm font-semibold", isNsfw ? "text-red-300" : "text-white/60")}>
                  NSFW Content
                </span>
              </div>
              <p className="text-[11px] text-white/30 mt-0.5">Mark if this slang contains explicit or sensitive content</p>
            </div>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">Examples</label>
            {examples.length < 5 && (
              <button
                type="button"
                onClick={handleAddExample}
                className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors border border-indigo-500/15"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-sm text-white placeholder-white/20"
                  placeholder={`Example ${index + 1}...`}
                  value={example}
                  onChange={(e) => handleExampleChange(index, e.target.value)}
                />
                {examples.length > 1 && (
                  <button type="button" onClick={() => handleRemoveExample(index)} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-5 border-t border-white/[0.04] flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-white/50 font-semibold hover:bg-white/[0.03] rounded-xl transition-colors text-sm text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
}
