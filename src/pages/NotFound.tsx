import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useMeta } from '../lib/useMeta';

export function NotFound() {
  useMeta({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 sm:py-24 max-w-md mx-auto"
    >
      <p className="text-7xl sm:text-8xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
        404
      </p>
      <h1 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-text-secondary text-sm mb-8 px-4">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link
          to="/contribute"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.06] font-semibold rounded-xl text-sm transition-all active:scale-95"
        >
          <Search className="w-4 h-4" /> Browse Words
        </Link>
      </div>
    </motion.div>
  );
}
