import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Loader2, BookOpen, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function AddSlang() {
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [meaningBurmese, setMeaningBurmese] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user || !appUser) return;

    if (!word.trim() || !meaning.trim() || !meaningBurmese.trim()) {
      setErrorMsg('Word, English meaning, and Burmese meaning are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: existing } = await supabase
        .from('slangs')
        .select('id')
        .ilike('word', word.trim());

      if (existing && existing.length > 0) {
        setErrorMsg('This slang word already exists in the dictionary.');
        setIsSubmitting(false);
        return;
      }

      const validExamples = examples.filter(ex => ex.trim() !== '');

      const { error } = await supabase.from('slangs').insert({
        word: word.trim(),
        pronunciation: pronunciation.trim() || null,
        meaning: meaning.trim(),
        meaning_burmese: meaningBurmese.trim(),
        examples: validExamples,
        is_nsfw: isNsfw,
        author_id: user.id,
        author_name: appUser.display_name || 'Anonymous',
        status: appUser.role === 'moderator' || appUser.role === 'admin' ? 'approved' : 'pending',
      });

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error adding slang:', error);
      setErrorMsg('Failed to add slang. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isAutoApprove = appUser?.role === 'moderator' || appUser?.role === 'admin';

  if (!isAuthReady) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 max-w-sm mx-auto">
        <div className="bg-white/[0.03] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <BookOpen className="w-8 h-8 text-white/15" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
        <p className="text-text-secondary text-sm">You need to sign in to contribute.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-500/15">
          <BookOpen className="w-7 h-7 text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Add New Slang</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-sm mx-auto">
          {isAutoApprove
            ? 'Your submission will be auto-approved.'
            : 'Your submission will be reviewed before appearing.'}
        </p>
      </div>

      {/* Error */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-raised/80 p-5 sm:p-7 rounded-2xl border border-white/[0.04] space-y-5">
        {/* Word */}
        <div>
          <label htmlFor="word" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Slang Word <span className="text-red-400">*</span>
          </label>
          <input
            type="text" id="word" required maxLength={100}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-base font-medium text-white placeholder-white/20"
            placeholder="e.g., ကြွေ"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </div>

        {/* Pronunciation */}
        <div>
          <label htmlFor="pronunciation" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Pronunciation
          </label>
          <input
            type="text" id="pronunciation" maxLength={100}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-base font-medium text-white placeholder-white/20"
            placeholder="e.g., Kyway"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
          />
        </div>

        {/* Meaning English */}
        <div>
          <label htmlFor="meaning" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Meaning (English) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="meaning" required maxLength={1000} rows={3}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all resize-none text-sm text-white placeholder-white/20"
            placeholder="Explain what it means..."
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
          />
          <p className="text-[10px] text-white/20 mt-1 text-right">{meaning.length}/1000</p>
        </div>

        {/* Meaning Burmese */}
        <div>
          <label htmlFor="meaningBurmese" className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
            Meaning (Burmese) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="meaningBurmese" required maxLength={1000} rows={3}
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all resize-none text-sm text-white placeholder-white/20"
            placeholder="မြန်မာလို အဓိပ္ပါယ် ရှင်းပြပါ..."
            value={meaningBurmese}
            onChange={(e) => setMeaningBurmese(e.target.value)}
          />
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

        {/* Examples */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Examples
            </label>
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
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={index}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-sm text-white placeholder-white/20"
                  placeholder={`Example ${index + 1}...`}
                  value={example}
                  onChange={(e) => handleExampleChange(index, e.target.value)}
                />
                {examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExample(index)}
                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-5 border-t border-white/[0.04] flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
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
            Submit
          </button>
        </div>
      </form>
    </motion.div>
  );
}
