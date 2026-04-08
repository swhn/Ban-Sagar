import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Loader2, CheckCircle, AlertCircle, Save, Shield, Eye, EyeOff,
  MessageSquare, UserPlus, Globe, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface SiteSettings {
  allow_registrations: boolean;
  require_approval: boolean;
  allow_nsfw: boolean;
  allow_suggestions: boolean;
  site_announcement: string;
  max_submissions_per_day: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  allow_registrations: true,
  require_approval: true,
  allow_nsfw: true,
  allow_suggestions: true,
  site_announcement: '',
  max_submissions_per_day: 20,
};

export function SiteSettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .order('key');

      if (error) throw error;

      if (data && data.length > 0) {
        const loaded: any = { ...DEFAULT_SETTINGS };
        data.forEach((row: any) => {
          if (row.key in loaded) {
            const val = row.value;
            if (typeof loaded[row.key] === 'boolean') loaded[row.key] = val === 'true';
            else if (typeof loaded[row.key] === 'number') loaded[row.key] = parseInt(val, 10) || loaded[row.key];
            else loaded[row.key] = val;
          }
        });
        setSettings(loaded);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      for (const entry of entries) {
        await supabase
          .from('site_settings')
          .upsert(entry, { onConflict: 'key' });
      }

      setMessage({ text: 'Settings saved successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: `Failed to save: ${error.message}`, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={cn("p-3 rounded-xl text-sm font-medium flex items-center gap-2.5 border",
              message.type === 'success' ? 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15' : 'bg-red-500/[0.06] text-red-400 border-red-500/15'
            )}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration & Submissions */}
      <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" /> General
        </h3>

        <ToggleSetting
          icon={<UserPlus className="w-4 h-4" />}
          label="Allow New Registrations"
          description="Allow new users to sign up via Google OAuth"
          value={settings.allow_registrations}
          onChange={(v) => updateSetting('allow_registrations', v)}
        />

        <ToggleSetting
          icon={<Shield className="w-4 h-4" />}
          label="Require Approval for Submissions"
          description="New slang submissions require moderator approval"
          value={settings.require_approval}
          onChange={(v) => updateSetting('require_approval', v)}
        />

        <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-white/30" />
            <div>
              <p className="text-sm font-semibold text-white/70">Max Submissions Per Day</p>
              <p className="text-[11px] text-white/30">Limit per user (0 = unlimited)</p>
            </div>
          </div>
          <input
            type="number"
            min={0}
            max={100}
            value={settings.max_submissions_per_day}
            onChange={(e) => updateSetting('max_submissions_per_day', parseInt(e.target.value, 10) || 0)}
            className="w-20 px-3 py-2 bg-surface/80 border border-white/[0.06] rounded-lg text-sm text-white text-center outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" /> Content
        </h3>

        <ToggleSetting
          icon={<EyeOff className="w-4 h-4" />}
          label="Allow NSFW Content"
          description="Allow NSFW slang words to be submitted and viewed"
          value={settings.allow_nsfw}
          onChange={(v) => updateSetting('allow_nsfw', v)}
        />

        <ToggleSetting
          icon={<MessageSquare className="w-4 h-4" />}
          label="Allow Suggestions"
          description="Allow users to suggest improvements on approved slangs"
          value={settings.allow_suggestions}
          onChange={(v) => updateSetting('allow_suggestions', v)}
        />
      </div>

      {/* Announcement */}
      <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Announcement
        </h3>
        <div>
          <p className="text-[11px] text-white/30 mb-2">Displayed as a banner on the home page (leave empty to hide)</p>
          <textarea
            value={settings.site_announcement}
            onChange={(e) => updateSetting('site_announcement', e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="e.g., Welcome to Ban Sagar! We're in beta..."
            className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 resize-none"
          />
          <p className="text-[10px] text-white/15 mt-1 text-right">{settings.site_announcement.length}/500</p>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </div>
  );
}

function ToggleSetting({
  icon, label, description, value, onChange,
}: {
  icon: React.ReactNode; label: string; description: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all text-left",
        value
          ? "bg-indigo-500/[0.06] border-indigo-500/15"
          : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
      )}
    >
      <div className={cn(
        "w-10 h-6 rounded-full relative transition-all shrink-0",
        value ? "bg-indigo-500/40" : "bg-white/10"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full transition-all",
          value ? "left-5 bg-indigo-400" : "left-1 bg-white/40"
        )} />
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className={cn("text-white/30", value && "text-indigo-400/60")}>{icon}</span>
        <div>
          <p className={cn("text-sm font-semibold", value ? "text-white/80" : "text-white/50")}>{label}</p>
          <p className="text-[11px] text-white/25">{description}</p>
        </div>
      </div>
    </button>
  );
}
