import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export function AddSlang() {
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();
  
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [meaningBurmese, setMeaningBurmese] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    if (!user || !appUser) return;
    
    if (!word.trim() || !meaning.trim() || !meaningBurmese.trim()) {
      setErrorMsg('Word, English meaning, and Burmese meaning are required.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for duplicates
      const slangsRef = collection(db, 'slangs');
      const q = query(slangsRef, where('word', '==', word.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // We found an exact match
        setErrorMsg('This slang word already exists in the dictionary.');
        setIsSubmitting(false);
        return;
      }

      // Also do a quick client-side case-insensitive check just to be safe
      const allDocs = await getDocs(slangsRef);
      const exists = allDocs.docs.some(doc => doc.data().word.toLowerCase() === word.trim().toLowerCase());
      if (exists) {
        setErrorMsg('This slang word already exists in the dictionary.');
        setIsSubmitting(false);
        return;
      }

      const validExamples = examples.filter(ex => ex.trim() !== '');
      
      await addDoc(collection(db, 'slangs'), {
        word: word.trim(),
        pronunciation: pronunciation.trim(),
        meaning: meaning.trim(),
        meaningBurmese: meaningBurmese.trim(),
        examples: validExamples,
        authorId: user.uid,
        authorName: appUser.displayName || 'Anonymous',
        status: appUser.role === 'moderator' || appUser.role === 'admin' ? 'approved' : 'pending',
        upvotes: 0,
        downvotes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'slangs');
      setIsSubmitting(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h2>
        <p className="text-gray-600">You need to be signed in to contribute a new slang.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8 text-center">
        <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Add New Slang</h1>
        <p className="text-slate-600 mt-3 text-lg max-w-lg mx-auto">
          Contribute to the dictionary. Your submission will be reviewed by moderators before appearing publicly.
        </p>
      </div>

      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3"
        >
          <X className="w-5 h-5 shrink-0" />
          {errorMsg}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="word" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Slang Word <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="word"
              required
              maxLength={100}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg font-medium"
              placeholder="e.g., ကြွေ"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pronunciation" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Pronunciation (English)
            </label>
            <input
              type="text"
              id="pronunciation"
              maxLength={100}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg font-medium"
              placeholder="e.g., Kyway"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="meaning" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Meaning / Definition (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="meaning"
              required
              maxLength={1000}
              rows={4}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none text-base"
              placeholder="Explain what it means and how it's used..."
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="meaningBurmese" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Meaning / Definition (Burmese) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="meaningBurmese"
              required
              maxLength={1000}
              rows={4}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none text-base"
              placeholder="မြန်မာလို အဓိပ္ပါယ် ရှင်းပြပါ..."
              value={meaningBurmese}
              onChange={(e) => setMeaningBurmese(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                Examples (Optional)
              </label>
              {examples.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="text-sm text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
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
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all text-base"
                    placeholder={`Example sentence ${index + 1}...`}
                    value={example}
                    onChange={(e) => handleExampleChange(index, e.target.value)}
                  />
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 border border-transparent hover:border-red-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors w-full sm:w-auto text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Submit Slang
          </button>
        </div>
      </form>
    </motion.div>
  );
}
