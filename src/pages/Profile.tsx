import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Profile() {
  const { user, appUser, logout, toggleNsfw, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(appUser?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async () => {
    if (!appUser || !displayName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName.trim() })
      .eq('id', appUser.id);

    if (error) {
      setMessage({ text: 'Failed to update profile.', type: 'error' });
    } else {
      setMessage({ text: 'Profile updated!', type: 'success' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthReady) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (!user || !appUser) {
    navigate('/');
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/15">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Profile Settings</h1>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn("p-3 rounded-xl text-sm font-medium flex items-center gap-2.5 border",
              message.type === 'success' ? 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15' : 'bg-red-500/[0.06] text-red-400 border-red-500/15'
            )}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar + Info */}
      <div className="bg-surface-raised/80 p-6 rounded-2xl border border-white/[0.04]">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.04]">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-16 h-16 rounded-full ring-2 ring-white/10" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl ring-2 ring-white/10">
              {(appUser.display_name || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">{appUser.display_name || 'User'}</h2>
            <p className="text-sm text-text-secondary">{appUser.email}</p>
            <span className={cn("inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
              appUser.role === 'admin' ? 'text-rose-400 bg-rose-500/10 border-rose-500/15' :
              appUser.role === 'moderator' ? 'text-amber-400 bg-amber-500/10 border-amber-500/15' :
              'text-sky-400 bg-sky-500/10 border-sky-500/15'
            )}>
              {appUser.role}
            </span>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={50}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 outline-none transition-all text-base font-medium text-white placeholder-white/20"
                placeholder="Your display name"
              />
              <button
                onClick={handleSave}
                disabled={saving || displayName.trim() === appUser.display_name}
                className="flex items-center gap-1.5 px-4 py-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 rounded-xl font-semibold text-sm transition-all border border-indigo-500/15 disabled:opacity-40 shrink-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>

          {/* NSFW Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              Content Preferences
            </label>
            <button
              onClick={toggleNsfw}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all text-left",
                appUser.show_nsfw
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              )}
            >
              <div className={cn(
                "w-10 h-6 rounded-full relative transition-all shrink-0",
                appUser.show_nsfw ? "bg-red-500/40" : "bg-white/10"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full transition-all",
                  appUser.show_nsfw ? "left-5 bg-red-400" : "left-1 bg-white/40"
                )} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  {appUser.show_nsfw ? <Eye className="w-4 h-4 text-red-400" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                  <span className={cn("text-sm font-semibold", appUser.show_nsfw ? "text-red-300" : "text-white/60")}>
                    Show NSFW Content
                  </span>
                </div>
                <p className="text-[11px] text-white/30 mt-0.5">Reveal blurred explicit slang words</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/[0.06] border border-red-500/15 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold text-sm transition-all"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </motion.div>
  );
}
