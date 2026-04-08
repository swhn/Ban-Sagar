import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PenLine, LogIn } from 'lucide-react';
import { ContributorStats } from '../../lib/achievements';

interface AddWordTabProps {
  currentUserStats: ContributorStats | undefined;
}

export function AddWordTab({ currentUserStats }: AddWordTabProps) {
  const { user, appUser, login } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-white/[0.04]">
        <div className="bg-white/[0.03] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <LogIn className="w-8 h-8 text-white/15" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to contribute</h2>
        <p className="text-text-secondary text-sm mb-5">Add slang words and earn badges.</p>
        <button onClick={login} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
          <LogIn className="w-4 h-4" /> Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-500/15">
        <PenLine className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Add a new slang word</h2>
      <p className="text-text-secondary text-sm mb-5 max-w-sm mx-auto">
        {appUser?.role === 'admin' || appUser?.role === 'moderator'
          ? 'Your submissions are auto-approved.'
          : 'Your submission will be reviewed by moderators.'}
      </p>
      <Link
        to="/add"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
      >
        <PenLine className="w-4 h-4" /> Add New Slang
      </Link>

      {currentUserStats && (
        <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-white/[0.04]">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-white">{currentUserStats.approved_count}</p>
            <p className="text-[11px] text-text-secondary font-medium mt-0.5">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-white">{currentUserStats.total_count}</p>
            <p className="text-[11px] text-text-secondary font-medium mt-0.5">Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-white">{currentUserStats.total_upvotes}</p>
            <p className="text-[11px] text-text-secondary font-medium mt-0.5">Upvotes</p>
          </div>
        </div>
      )}
    </div>
  );
}
