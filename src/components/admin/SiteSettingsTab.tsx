import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Loader2, CheckCircle, AlertCircle, Save, Shield, Eye, EyeOff,
  MessageSquare, UserPlus, Globe, Bell, Trophy, ChevronDown,
  BookOpen, Mail, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface SiteSettings {
  // General
  allow_registrations: boolean;
  require_approval: boolean;
  max_submissions_per_day: number;
  // Content & Display
  allow_nsfw: boolean;
  allow_suggestions: boolean;
  show_ranking: boolean;
  // Notifications
  notify_admin_login: boolean;
  notify_contribution_approved: boolean;
  notify_badge_unlocked: boolean;
  // Announcement
  site_announcement: string;
  // About Page
  about_what_is: string;
  about_community: string;
  about_why_it_matters: string;
  // Contact Page
  contact_email: string;
  contact_get_in_touch: string;
  contact_report_issues: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  allow_registrations: true,
  require_approval: true,
  max_submissions_per_day: 20,
  allow_nsfw: true,
  allow_suggestions: true,
  show_ranking: true,
  notify_admin_login: false,
  notify_contribution_approved: true,
  notify_badge_unlocked: true,
  site_announcement: '',
  about_what_is: '',
  about_community: '',
  about_why_it_matters: '',
  contact_email: '',
  contact_get_in_touch: '',
  contact_report_issues: '',
};

export function SiteSettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    content: true,
    notifications: false,
    announcement: false,
    about: false,
    contact: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
    <div className="space-y-4">
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

      {/* General */}
      <SettingsSection
        id="general"
        icon={<Globe className="w-4 h-4 text-indigo-400" />}
        title="General"
        expanded={expandedSections.general}
        onToggle={() => toggleSection('general')}
      >
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
        <NumberSetting
          icon={<MessageSquare className="w-4 h-4" />}
          label="Max Submissions Per Day"
          description="Limit per user (0 = unlimited)"
          value={settings.max_submissions_per_day}
          onChange={(v) => updateSetting('max_submissions_per_day', v)}
        />
      </SettingsSection>

      {/* Content & Display */}
      <SettingsSection
        id="content"
        icon={<Eye className="w-4 h-4 text-emerald-400" />}
        title="Content & Display"
        expanded={expandedSections.content}
        onToggle={() => toggleSection('content')}
      >
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
        <ToggleSetting
          icon={<Trophy className="w-4 h-4" />}
          label="Show Rankings"
          description="Show the rankings/leaderboard tab on the Contribute page"
          value={settings.show_ranking}
          onChange={(v) => updateSetting('show_ranking', v)}
        />
      </SettingsSection>

      {/* Email Notifications */}
      <SettingsSection
        id="notifications"
        icon={<Mail className="w-4 h-4 text-rose-400" />}
        title="Email Notifications"
        expanded={expandedSections.notifications}
        onToggle={() => toggleSection('notifications')}
      >
        <ToggleSetting
          icon={<UserPlus className="w-4 h-4" />}
          label="Admin: Login Alerts"
          description="Email admins when any user logs in"
          value={settings.notify_admin_login}
          onChange={(v) => updateSetting('notify_admin_login', v)}
        />
        <ToggleSetting
          icon={<CheckCircle className="w-4 h-4" />}
          label="User: Approval Notices"
          description="Notify users when their slang is approved"
          value={settings.notify_contribution_approved}
          onChange={(v) => updateSetting('notify_contribution_approved', v)}
        />
        <ToggleSetting
          icon={<Trophy className="w-4 h-4" />}
          label="User: Badge Unlocked"
          description="Notify users when they earn a new badge"
          value={settings.notify_badge_unlocked}
          onChange={(v) => updateSetting('notify_badge_unlocked', v)}
        />
      </SettingsSection>

      {/* Announcement */}
      <SettingsSection
        id="announcement"
        icon={<Bell className="w-4 h-4 text-amber-400" />}
        title="Announcement Banner"
        expanded={expandedSections.announcement}
        onToggle={() => toggleSection('announcement')}
      >
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
      </SettingsSection>

      {/* About Page */}
      <SettingsSection
        id="about"
        icon={<BookOpen className="w-4 h-4 text-purple-400" />}
        title="About Page"
        badge="Page"
        expanded={expandedSections.about}
        onToggle={() => toggleSection('about')}
      >
        <p className="text-[11px] text-white/30 -mt-1 mb-1">Customize the content shown on the About page. Leave empty to use defaults.</p>

        <TextAreaSetting
          label="What is Ban Sagar?"
          placeholder="Ban Sagar (ဗန်းစကား) is a community-driven online dictionary..."
          value={settings.about_what_is}
          onChange={(v) => updateSetting('about_what_is', v)}
          rows={4}
        />
        <TextAreaSetting
          label="Community Powered"
          placeholder="Every word in our dictionary is contributed by real people..."
          value={settings.about_community}
          onChange={(v) => updateSetting('about_community', v)}
          rows={4}
        />
        <TextAreaSetting
          label="Why It Matters"
          placeholder="Slang and informal language are an important part of any culture..."
          value={settings.about_why_it_matters}
          onChange={(v) => updateSetting('about_why_it_matters', v)}
          rows={4}
        />
      </SettingsSection>

      {/* Contact Page */}
      <SettingsSection
        id="contact"
        icon={<Mail className="w-4 h-4 text-teal-400" />}
        title="Contact Page"
        badge="Page"
        expanded={expandedSections.contact}
        onToggle={() => toggleSection('contact')}
      >
        <p className="text-[11px] text-white/30 -mt-1 mb-1">Customize the content shown on the Contact page. Leave empty to use defaults.</p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Contact Email</label>
          <input
            type="email"
            value={settings.contact_email}
            onChange={(e) => updateSetting('contact_email', e.target.value)}
            placeholder="saiwailyanhtun@gmail.com"
            className="w-full px-4 py-2.5 bg-surface/80 border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30"
          />
        </div>
        <TextAreaSetting
          label="Get in Touch"
          placeholder="Have questions, feedback, or suggestions? We're always happy to hear from our community..."
          value={settings.contact_get_in_touch}
          onChange={(v) => updateSetting('contact_get_in_touch', v)}
          rows={3}
        />
        <TextAreaSetting
          label="Report Issues"
          placeholder="Found a bug or have a feature request? Found inaccurate or inappropriate content?..."
          value={settings.contact_report_issues}
          onChange={(v) => updateSetting('contact_report_issues', v)}
          rows={3}
        />
      </SettingsSection>

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

function SettingsSection({
  id, icon, title, badge, expanded, onToggle, children,
}: {
  id: string; icon: React.ReactNode; title: string; badge?: string;
  expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        {icon}
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex-1">{title}</h3>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            {badge}
          </span>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 text-white/30 transition-transform",
          expanded && "rotate-180"
        )} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

function NumberSetting({
  icon, label, description, value, onChange,
}: {
  icon: React.ReactNode; label: string; description: string;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-3">
        <span className="text-white/30">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-white/70">{label}</p>
          <p className="text-[11px] text-white/30">{description}</p>
        </div>
      </div>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-20 px-3 py-2 bg-surface/80 border border-white/[0.06] rounded-lg text-sm text-white text-center outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30"
      />
    </div>
  );
}

function TextAreaSetting({
  label, placeholder, value, onChange, rows = 3,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-surface/80 border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/30 resize-none"
      />
    </div>
  );
}
