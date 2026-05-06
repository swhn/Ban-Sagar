import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface SiteSettings {
  allow_registrations: boolean;
  require_approval: boolean;
  max_submissions_per_day: number;
  allow_nsfw: boolean;
  allow_suggestions: boolean;
  show_ranking: boolean;
  site_announcement: string;
  notify_admin_login: boolean;
  notify_contribution_approved: boolean;
  notify_badge_unlocked: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  allow_registrations: true,
  require_approval: true,
  max_submissions_per_day: 20,
  allow_nsfw: true,
  allow_suggestions: true,
  show_ranking: true,
  site_announcement: '',
  notify_admin_login: false,
  notify_contribution_approved: true,
  notify_badge_unlocked: true,
};

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', Object.keys(DEFAULT_SETTINGS));

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
      } catch (err) {
        // Use defaults on error
      }
    };
    load();
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
