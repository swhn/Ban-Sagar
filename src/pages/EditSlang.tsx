import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SlangData, SlangStatus } from '../lib/database.types';
import { Plus, X, Loader2, ArrowLeft, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

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

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    if (examples.length < 5) {
      setExamples([...examples, '']);
    }
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
    if (!user || !appUser || !id) return;

    if (!word.trim() || !meaning.trim() || !meaningBurmese.trim()) {
      setErrorMsg('Word, English meaning, and Burmese meaning are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const validExamples = examples.filter(ex => ex.trim() !== '');

      const { error } = await supabase
        .from('slangs')
        .update({
          word: word.trim(),
          pronunciation: pronunciation.trim() || null,
          meaning: meaning.trim(),
          meaning_burmese: meaningBurmese.trim(),
          examples: validExamples,
          status: status,
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
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user || (appUser?.role !== 'moderator' && appUser?.role !== 'admin')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-text-secondary">Only moderators and admins can edit slangs.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-surface-raised border border-white/5 text-white/60 hover:text-indigo-400 hover:border-indigo-500/30 font-medium rounded-xl transition-all w-fit mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8 text-center">
        <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
          <Edit3 className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Edit Slang</h1>
        <p className="text-text-secondary mt-3 text-lg max-w-lg mx-auto">
          Update the details of this slang entry.
        </p>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm font-medium flex items-center gap-3"
        >
          <X className="w-5 h-5 shrink-0" />
          {errorMsg}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-raised p-6 sm:p-10 rounded-2xl border border-white/5 space-y-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="word" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
              Slang Word <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="word"
              required
              maxLength={100}
              className="w-full px-5 py-3 bg-surface border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 focus:bg-surface-raised outline-none transition-all text-lg font-medium text-white"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pronunciation" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
              Pronunciation (English)
            </label>
            <input
              type="text"
              id="pronunciation"
              maxLength={100}
              className="w-full px-5 py-3 bg-surface border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 focus:bg-surface-raised outline-none transition-all text-lg font-medium text-white"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="meaning" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
              Meaning / Definition (English) <span className="text-red-400">*</span>
            </label>
            <textarea
              id="meaning"
              required
              maxLength={1000}
              rows={4}
              className="w-full px-5 py-3 bg-surface border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 focus:bg-surface-raised outline-none transition-all resize-none text-base text-white"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="meaningBurmese" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
              Meaning / Definition (Burmese) <span className="text-red-400">*</span>
            </label>
            <textarea
              id="meaningBurmese"
              required
              maxLength={1000}
              rows={4}
              className="w-full px-5 py-3 bg-surface border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 focus:bg-surface-raised outline-none transition-all resize-none text-base text-white"
              value={meaningBurmese}
              onChange={(e) => setMeaningBurmese(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
              Status
            </label>
            <select
              id="status"
              className="w-full px-5 py-3 bg-surface border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 focus:bg-surface-raised outline-none transition-all text-base font-medium appearance-none text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value as SlangStatus)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                Examples (Optional)
              </label>
              {examples.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors border border-indigo-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Example
                </button>
              )}
            </div>

            <div className="space-y-3">
              {examples.map((example, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className="flex items-start gap-2"
                >
                  <input
                    type="text"
                    className="flex-1 px-5 py-3 bg-surface border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 focus:bg-surface-raised outline-none transition-all text-base text-white placeholder-white/20"
                    placeholder={`Example sentence ${index + 1}...`}
                    value={example}
                    onChange={(e) => handleExampleChange(index, e.target.value)}
                  />
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className="p-3 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 border border-transparent hover:border-red-500/20"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-white/60 font-semibold hover:bg-white/5 rounded-xl transition-colors w-full sm:w-auto text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
}
