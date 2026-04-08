import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AppUser } from '../lib/database.types';
import {
  Loader2, ShieldAlert, Users, Settings as SettingsIcon, Copy, CheckCircle, Trash2,
  ExternalLink, Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { UsersTab } from '../components/contribute/UsersTab';
import { SiteSettingsTab } from '../components/admin/SiteSettingsTab';
import { DuplicatesTab } from '../components/admin/DuplicatesTab';

type DashboardTab = 'users' | 'settings' | 'duplicates';

export function Dashboard() {
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('users');

  useEffect(() => {
    if (isAuthReady && (!user || appUser?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, appUser, isAuthReady, navigate]);

  if (!isAuthReady) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (!user || appUser?.role !== 'admin') return null;

  const tabs: { key: DashboardTab; label: string; icon: React.ElementType }[] = [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'duplicates', label: 'Duplicates', icon: Copy },
    { key: 'settings', label: 'Site Settings', icon: SettingsIcon },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl shadow-lg shadow-rose-500/15">
          <ShieldAlert className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Admin Dashboard</h1>
        <p className="text-text-secondary text-sm">Manage users, settings, and site content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === key ? 'bg-white/[0.07] text-white' : 'text-white/35 hover:text-white/60'
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'duplicates' && <DuplicatesTab />}
      {activeTab === 'settings' && <SiteSettingsTab />}
    </motion.div>
  );
}
