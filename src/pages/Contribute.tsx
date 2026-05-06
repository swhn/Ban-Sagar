import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PenLine, BookOpen, Trophy, Sparkles, Loader2, ClipboardList, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ContributorStats, ACHIEVEMENTS } from '../lib/achievements';
import { sendNotification } from '../lib/notifications';
import { useSiteSettings } from '../lib/useSiteSettings';
import { useI18n } from '../lib/i18n';

import { AddWordTab } from '../components/contribute/AddWordTab';
import { HistoryTab } from '../components/contribute/HistoryTab';
import { LeaderboardTab } from '../components/contribute/LeaderboardTab';
import { AchievementsTab } from '../components/contribute/AchievementsTab';
import { ReviewTab } from '../components/contribute/ReviewTab';
import { SuggestionsTab } from '../components/contribute/SuggestionsTab';

type ContributeTab = 'add' | 'history' | 'leaderboard' | 'achievements' | 'review' | 'suggestions';

export function Contribute() {
  const { user, appUser, isAuthReady } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ContributeTab>('add');
  const [contributors, setContributors] = useState<ContributorStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ContributorStats | null>(null);
  const siteSettings = useSiteSettings();

  const isMod = appUser?.role === 'moderator' || appUser?.role === 'admin';
  const showRanking = siteSettings.show_ranking;

  useEffect(() => {
    if (activeTab === 'leaderboard' || activeTab === 'achievements' || activeTab === 'add') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: slangs } = await supabase.from('slangs').select('author_id, author_name, status, upvotes, views');
      const { data: users } = await supabase.from('users').select('id, avatar_url');
      const avatarMap = new Map((users || []).map((u: any) => [u.id, u.avatar_url]));

      const statsMap = new Map<string, ContributorStats>();
      (slangs || []).forEach((s: any) => {
        const existing = statsMap.get(s.author_id);
        if (existing) {
          existing.total_count += 1;
          if (s.status === 'approved') existing.approved_count += 1;
          existing.total_upvotes += s.upvotes || 0;
          existing.total_views += s.views || 0;
        } else {
          statsMap.set(s.author_id, {
            author_id: s.author_id,
            author_name: s.author_name || 'Anonymous',
            avatar_url: avatarMap.get(s.author_id) || null,
            approved_count: s.status === 'approved' ? 1 : 0,
            total_count: 1,
            total_upvotes: s.upvotes || 0,
            total_views: s.views || 0,
          });
        }
      });

      setContributors(Array.from(statsMap.values()).sort((a, b) => b.approved_count - a.approved_count || b.total_upvotes - a.total_upvotes));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stats = contributors.find(c => c.author_id === user?.id);
    if (!stats || !user || !appUser) return;

    const STORAGE_KEY = `ban-sagar-notified-badges-${user.id}`;
    const stored = localStorage.getItem(STORAGE_KEY);
    const unlockedIds = ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id);

    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
      return;
    }

    const notifiedBadges: string[] = JSON.parse(stored);
    const newBadges = unlockedIds.filter(id => !notifiedBadges.includes(id));

    if (newBadges.length > 0 && appUser.notify_badges !== false) {
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'notify_badge_unlocked')
        .single()
        .then(({ data }) => {
          if (data?.value === 'true') {
            for (const badgeId of newBadges) {
              const badge = ACHIEVEMENTS.find(a => a.id === badgeId);
              if (badge) {
                sendNotification('badge_unlocked', appUser.email, {
                  badgeTitle: badge.title,
                  badgeDescription: badge.description,
                  badgeTier: badge.tier,
                });
              }
            }
          }
        });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
    }
  }, [contributors, user?.id]);

  const currentUserStats = contributors.find(c => c.author_id === user?.id);
  const currentUserRank = contributors.findIndex(c => c.author_id === user?.id) + 1;
  const viewTarget = selectedUser || currentUserStats;

  if (!isAuthReady) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  // Build tab list dynamically based on role and settings
  const tabs: { key: ContributeTab; label: string; shortLabel: string; icon: React.ElementType; modOnly?: boolean }[] = [
    { key: 'add', label: 'Add Word', shortLabel: 'Add', icon: PenLine },
    { key: 'history', label: 'My Words', shortLabel: 'Words', icon: BookOpen },
  ];

  if (showRanking || isMod) {
    tabs.push({ key: 'leaderboard', label: 'Rankings', shortLabel: 'Ranks', icon: Trophy });
  }

  tabs.push({ key: 'achievements', label: 'Badges', shortLabel: 'Badges', icon: Sparkles });

  if (isMod) {
    tabs.push({ key: 'review', label: 'Review', shortLabel: 'Review', icon: ClipboardList, modOnly: true });
    tabs.push({ key: 'suggestions', label: 'Suggestions', shortLabel: 'Suggest', icon: MessageSquare, modOnly: true });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/15">
          <PenLine className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{t('contribute.title')}</h1>
        <p className="text-text-secondary text-sm">{t('contribute.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
        {tabs.map(({ key, label, shortLabel, icon: Icon, modOnly }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSelectedUser(null); }}
            className={cn(
              "shrink-0 flex items-center justify-center gap-1.5 px-3 sm:px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              !modOnly && "flex-1",
              activeTab === key ? 'bg-white/[0.07] text-white' : 'text-white/35 hover:text-white/60',
              modOnly && activeTab === key && 'text-amber-300 bg-amber-500/10',
              modOnly && activeTab !== key && 'text-amber-400/40 hover:text-amber-300/70'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'add' && <AddWordTab currentUserStats={currentUserStats} />}
      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'leaderboard' && (
        <LeaderboardTab
          contributors={contributors}
          loading={loading}
          currentUserStats={currentUserStats}
          currentUserRank={currentUserRank}
          onSelectUser={(c) => { setSelectedUser(c); setActiveTab('achievements'); }}
        />
      )}
      {activeTab === 'achievements' && (
        <AchievementsTab
          viewTarget={viewTarget}
          selectedUser={selectedUser}
          currentUserStats={currentUserStats}
          onClearSelection={() => setSelectedUser(null)}
        />
      )}
      {activeTab === 'review' && isMod && <ReviewTab />}
      {activeTab === 'suggestions' && isMod && <SuggestionsTab />}
    </motion.div>
  );
}
