import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Save, ShieldAlert, X, Bell, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useI18n } from '../lib/i18n';

export function Profile() {
  const { user, appUser, logout, toggleNsfw, isAuthReady } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(appUser?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showNsfwWarning, setShowNsfwWarning] = useState(false);
  const [notifyApproved, setNotifyApproved] = useState(appUser?.notify_approved ?? true);
  const [notifyBadges, setNotifyBadges] = useState(appUser?.notify_badges ?? true);

  const toggleNotification = async (key: 'notify_approved' | 'notify_badges', currentValue: boolean) => {
    const newValue = !currentValue;
    if (key === 'notify_approved') setNotifyApproved(newValue);
    else setNotifyBadges(newValue);

    const { error } = await supabase
      .from('users')
      .update({ [key]: newValue })
      .eq('id', appUser!.id);

    if (error) {
      if (key === 'notify_approved') setNotifyApproved(currentValue);
      else setNotifyBadges(currentValue);
    }
  };

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

  const handleNsfwToggle = () => {
    if (!appUser) return;
    // If turning ON, show warning first
    if (!appUser.show_nsfw) {
      setShowNsfwWarning(true);
    } else {
      // Turning OFF doesn't need confirmation
      toggleNsfw();
    }
  };

  const confirmNsfw = () => {
    toggleNsfw();
    setShowNsfwWarning(false);
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
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{t('profile.title')}</h1>
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
              {t('profile.displayName')}
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
                {t('profile.save')}
              </button>
            </div>
          </div>

          {/* NSFW Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              {t('profile.contentPrefs')}
            </label>
            <button
              onClick={handleNsfwToggle}
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
                    {t('profile.showNsfw')}
                  </span>
                </div>
                <p className="text-[11px] text-white/30 mt-0.5">Reveal blurred explicit slang words</p>
              </div>
            </button>
          </div>

          {/* Email Notifications */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              {t('profile.emailNotifications')}
            </label>
            <div className="space-y-2">
              <button
                onClick={() => toggleNotification('notify_approved', notifyApproved)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all text-left",
                  notifyApproved
                    ? "bg-indigo-500/[0.06] border-indigo-500/15"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                )}
              >
                <div className={cn(
                  "w-10 h-6 rounded-full relative transition-all shrink-0",
                  notifyApproved ? "bg-indigo-500/40" : "bg-white/10"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    notifyApproved ? "left-5 bg-indigo-400" : "left-1 bg-white/40"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Bell className={cn("w-4 h-4", notifyApproved ? "text-indigo-400" : "text-white/30")} />
                    <span className={cn("text-sm font-semibold", notifyApproved ? "text-white/80" : "text-white/60")}>
                      {t('profile.notifyApproved')}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5">{t('profile.notifyApprovedDesc')}</p>
                </div>
              </button>

              <button
                onClick={() => toggleNotification('notify_badges', notifyBadges)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all text-left",
                  notifyBadges
                    ? "bg-indigo-500/[0.06] border-indigo-500/15"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                )}
              >
                <div className={cn(
                  "w-10 h-6 rounded-full relative transition-all shrink-0",
                  notifyBadges ? "bg-indigo-500/40" : "bg-white/10"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    notifyBadges ? "left-5 bg-indigo-400" : "left-1 bg-white/40"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className={cn("w-4 h-4", notifyBadges ? "text-indigo-400" : "text-white/30")} />
                    <span className={cn("text-sm font-semibold", notifyBadges ? "text-white/80" : "text-white/60")}>
                      {t('profile.notifyBadges')}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5">{t('profile.notifyBadgesDesc')}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/[0.06] border border-red-500/15 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold text-sm transition-all"
      >
        <LogOut className="w-4 h-4" /> {t('profile.signOut')}
      </button>

      {/* NSFW Warning Modal */}
      <AnimatePresence>
        {showNsfwWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowNsfwWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface-raised border border-red-500/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl shadow-red-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-white">Content Warning</h3>
                  </div>
                  <button
                    onClick={() => setShowNsfwWarning(false)}
                    className="p-1.5 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm text-white/70 leading-relaxed">
                    You are about to enable <span className="font-semibold text-red-400">NSFW content</span>. This will reveal explicit slang words that are currently blurred.
                  </p>
                  <div className="bg-red-500/[0.06] border border-red-500/10 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-red-400/80 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Please note:
                    </p>
                    <ul className="text-xs text-white/50 space-y-1 ml-5 list-disc">
                      <li>Content may include vulgar or offensive language</li>
                      <li>This is for educational/reference purposes only</li>
                      <li>You can turn this off anytime from your profile</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNsfwWarning(false)}
                    className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl text-sm font-semibold transition-all"
                  >
                    {t('general.cancel')}
                  </button>
                  <button
                    onClick={confirmNsfw}
                    className="flex-1 px-4 py-2.5 bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all"
                  >
                    Enable NSFW
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
