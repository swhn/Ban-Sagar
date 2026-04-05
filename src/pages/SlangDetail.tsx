import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SlangCard, SlangData } from '../components/SlangCard';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function SlangDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [slang, setSlang] = useState<SlangData | null>(null);
  const [loading, setLoading] = useState(true);
  const viewedRef = React.useRef(false);

  useEffect(() => {
    const fetchSlang = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'slangs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const slangData = { id: docSnap.id, ...docSnap.data() } as SlangData;
          setSlang(slangData);
          
          if (!viewedRef.current) {
            viewedRef.current = true;
            const today = new Date().toISOString().split('T')[0];
            updateDoc(docRef, {
              views: increment(1),
              [`viewHistory.${today}`]: increment(1)
            }).catch(console.error);
          }
        } else {
          setSlang(null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `slangs/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSlang();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!slang) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-white rounded-3xl border border-slate-200 max-w-3xl mx-auto shadow-sm"
      >
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">Slang not found</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">The slang you are looking for does not exist or has been removed by moderators.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 font-medium rounded-xl transition-all w-fit shadow-sm hover:shadow"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      <SlangCard slang={slang} />
    </motion.div>
  );
}
