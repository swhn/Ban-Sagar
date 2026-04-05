import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SlangCard } from '../components/SlangCard';
import { SlangData } from '../lib/database.types';
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
        const { data, error } = await supabase
          .from('slangs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setSlang(data as SlangData);

          if (!viewedRef.current) {
            viewedRef.current = true;
            supabase.rpc('increment_view', { p_slang_id: id }).then(({ error }) => {
              if (error) console.error('View increment error:', error);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching slang:', error);
        setSlang(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlang();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!slang) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-surface-raised rounded-2xl border border-white/5 max-w-3xl mx-auto"
      >
        <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-3">Slang not found</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">The slang you are looking for does not exist or has been removed by moderators.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center gap-2 mx-auto"
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
        className="flex items-center gap-2 px-4 py-2 bg-surface-raised border border-white/5 text-white/60 hover:text-indigo-400 hover:border-indigo-500/30 font-medium rounded-xl transition-all w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <SlangCard slang={slang} />
    </motion.div>
  );
}
