import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SlangCard } from '../components/SlangCard';
import { SlangData, SlangStatus, AppUser, UserRole } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldAlert, CheckCircle, Clock, XCircle, ClipboardList, Copy, Trash2, ExternalLink, Users, Shield, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState<'review' | 'duplicates' | 'users'>('review');
  const [slangs, setSlangs] = useState<SlangData[]>([]);
  const [activeTab, setActiveTab] = useState<SlangStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const [duplicates, setDuplicates] = useState<{word: string, items: SlangData[]}[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user || (appUser?.role !== 'moderator' && appUser?.role !== 'admin')) {
      navigate('/');
      return;
    }

    if (activeMenu === 'review') {
      setLoading(true);

      const fetchSlangs = async () => {
        const { data, error } = await supabase
          .from('slangs')
          .select('*')
          .eq('status', activeTab)
          .order('created_at', { ascending: false });

        if (error) console.error('Error fetching slangs:', error);
        else setSlangs(data as SlangData[]);
        setLoading(false);
      };

      fetchSlangs();

      const channel = supabase
        .channel('slangs-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'slangs' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSlang = payload.new as SlangData;
            if (newSlang.status === activeTab) setSlangs(prev => [newSlang, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as SlangData;
            setSlangs(prev => {
              if (updated.status === activeTab) {
                const exists = prev.find(s => s.id === updated.id);
                if (exists) return prev.map(s => s.id === updated.id ? updated : s);
                return [updated, ...prev];
              }
              return prev.filter(s => s.id !== updated.id);
            });
          } else if (payload.eventType === 'DELETE') {
            setSlangs(prev => prev.filter(s => s.id !== (payload.old as any).id));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }

    if (activeMenu === 'users' && appUser?.role === 'admin') fetchUsers();
  }, [user, appUser, isAuthReady, navigate, activeTab, activeMenu]);

  useEffect(() => {
    const handleClickOutside = () => setRoleDropdownOpen(null);
    if (roleDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [roleDropdownOpen]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAllUsers(data as AppUser[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setRoleDropdownOpen(null);
      showMessage(`Role updated to ${newRole}.`, 'success');
    } catch (error: any) {
      showMessage(`Failed: ${error.message}`, 'error');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('slangs').update({ status: 'approved' as SlangStatus }).eq('id', id);
    showMessage(error ? 'Failed to approve.' : 'Approved.', error ? 'error' : 'success');
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('slangs').update({ status: 'rejected' as SlangStatus }).eq('id', id);
    showMessage(error ? 'Failed to reject.' : 'Rejected.', error ? 'error' : 'success');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('slangs').delete().eq('id', id);
    if (!error && activeMenu === 'duplicates') scanDuplicates();
    showMessage(error ? 'Failed to delete.' : 'Deleted.', error ? 'error' : 'success');
  };

  const scanDuplicates = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.from('slangs').select('*');
      if (error) throw error;

      const wordMap = new Map<string, SlangData[]>();
      (data as SlangData[]).forEach(item => {
        const key = item.word.toLowerCase().trim();
        if (!wordMap.has(key)) wordMap.set(key, []);
        wordMap.get(key)!.push(item);
      });

      const dupes: {word: string, items: SlangData[]}[] = [];
      wordMap.forEach((items, word) => { if (items.length > 1) dupes.push({ word, items }); });
      setDuplicates(dupes);
      if (dupes.length === 0) showMessage('No duplicates found!', 'success');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === 'admin') return <ShieldCheck className="w-3.5 h-3.5" />;
    if (role === 'moderator') return <Shield className="w-3.5 h-3.5" />;
    return <User className="w-3.5 h-3.5" />;
  };

  const getRoleColor = (role: UserRole) => {
    if (role === 'admin') return 'text-rose-400 bg-rose-500/10 border-rose-500/15';
    if (role === 'moderator') return 'text-amber-400 bg-amber-500/10 border-amber-500/15';
    return 'text-sky-400 bg-sky-500/10 border-sky-500/15';
  };

  if (!isAuthReady) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6"
    >
      {/* Sidebar - horizontal on mobile, vertical on desktop */}
      <aside className="w-full lg:w-56 shrink-0 space-y-4">
        <div className="p-4 bg-indigo-500/[0.06] rounded-xl border border-indigo-500/15 flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-lg font-display font-bold text-white">Dashboard</h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{appUser?.role}</p>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMenu('review')}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0",
              activeMenu === 'review' ? "bg-white/[0.06] text-white" : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
            )}
          >
            <ClipboardList className="w-4.5 h-4.5" /> Review
          </button>
          <button
            onClick={() => { setActiveMenu('duplicates'); scanDuplicates(); }}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0",
              activeMenu === 'duplicates' ? "bg-white/[0.06] text-white" : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
            )}
          >
            <Copy className="w-4.5 h-4.5" /> Duplicates
          </button>
          {appUser?.role === 'admin' && (
            <button
              onClick={() => setActiveMenu('users')}
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                activeMenu === 'users' ? "bg-white/[0.06] text-white" : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
              )}
            >
              <Users className="w-4.5 h-4.5" /> Users
            </button>
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 space-y-5">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "p-3 rounded-xl text-sm font-medium flex items-center gap-2.5 border",
                message.type === 'success' ? 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15' : 'bg-red-500/[0.06] text-red-400 border-red-500/15'
              )}
            >
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review */}
        {activeMenu === 'review' && (
          <div className="space-y-5">
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {([
                { key: 'pending' as const, label: 'Pending', icon: Clock, color: 'amber' },
                { key: 'approved' as const, label: 'Approved', icon: CheckCircle, color: 'emerald' },
                { key: 'rejected' as const, label: 'Rejected', icon: XCircle, color: 'red' },
              ]).map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                    activeTab === key
                      ? `bg-${color}-500/10 text-${color}-300`
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : slangs.length > 0 ? (
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {slangs.map((slang, i) => (
                    <motion.div key={slang.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.03 }}>
                      <SlangCard slang={slang} isModeratorView onApprove={handleApprove} onReject={handleReject} onEdit={(id) => navigate(`/edit/${id}`)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState icon={<ShieldAlert className="w-8 h-8 text-white/15" />} title="All caught up!" subtitle={`No ${activeTab} submissions.`} />
            )}
          </div>
        )}

        {/* Duplicates */}
        {activeMenu === 'duplicates' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-raised/80 p-5 rounded-2xl border border-white/[0.04]">
              <div>
                <h2 className="text-xl font-bold text-white">Duplicates</h2>
                <p className="text-text-secondary text-sm mt-0.5">Find and resolve duplicate entries.</p>
              </div>
              <button
                onClick={scanDuplicates}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.04] text-white/60 rounded-xl hover:bg-white/[0.06] text-sm font-semibold transition-all border border-white/[0.06] shrink-0"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Rescan
              </button>
            </div>

            {isScanning ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : duplicates.length > 0 ? (
              <div className="space-y-4">
                {duplicates.map(group => (
                  <div key={group.word} className="bg-surface-raised/80 p-5 rounded-2xl border border-white/[0.04] space-y-3">
                    <h3 className="text-lg font-bold text-white pb-3 border-b border-white/[0.04]">
                      "{group.word}"
                      <span className="text-xs font-medium text-text-secondary ml-2 bg-white/[0.04] px-2 py-0.5 rounded-md">{group.items.length}</span>
                    </h3>
                    {group.items.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/[0.015] rounded-xl border border-white/[0.03]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                              item.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" :
                              item.status === 'pending' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                            )}>{item.status}</span>
                            <span className="text-xs text-text-secondary">by {item.author_name}</span>
                          </div>
                          <p className="text-white/70 text-sm line-clamp-1">{item.meaning}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/slang/${item.slug || item.id}`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-indigo-400 rounded-lg text-xs font-semibold transition-all">
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/[0.06] text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-semibold transition-all border border-red-500/15">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<CheckCircle className="w-8 h-8 text-emerald-500/30" />} title="No duplicates" subtitle="Dictionary is clean." />
            )}
          </div>
        )}

        {/* Users */}
        {activeMenu === 'users' && appUser?.role === 'admin' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-raised/80 p-5 rounded-2xl border border-white/[0.04]">
              <div>
                <h2 className="text-xl font-bold text-white">Users</h2>
                <p className="text-text-secondary text-sm mt-0.5">{allUsers.length} registered</p>
              </div>
              <button onClick={fetchUsers} disabled={usersLoading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.04] text-white/60 rounded-xl hover:bg-white/[0.06] text-sm font-semibold transition-all border border-white/[0.06] shrink-0">
                {usersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />} Refresh
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : allUsers.length > 0 ? (
              <div className="space-y-2">
                {allUsers.map((u, i) => (
                  <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-surface-raised/80 rounded-xl border border-white/[0.04] hover:border-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full ring-2 ring-white/[0.06] shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/[0.06] shrink-0">
                          {(u.display_name || u.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{u.display_name || 'Unnamed'}</p>
                        <p className="text-xs text-text-secondary truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (u.id !== user?.id) setRoleDropdownOpen(roleDropdownOpen === u.id ? null : u.id); }}
                        disabled={u.id === user?.id}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all",
                          getRoleColor(u.role),
                          u.id === user?.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110"
                        )}
                      >
                        {getRoleIcon(u.role)} {u.role}
                        {u.id !== user?.id && <ChevronDown className="w-3 h-3" />}
                      </button>

                      <AnimatePresence>
                        {roleDropdownOpen === u.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1.5 z-50 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[140px]"
                          >
                            {(['user', 'moderator', 'admin'] as UserRole[]).map(role => (
                              <button key={role} onClick={(e) => { e.stopPropagation(); handleRoleChange(u.id, role); }}
                                className={cn("flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold transition-all hover:bg-white/[0.04]", u.role === role ? "text-indigo-400 bg-indigo-500/[0.06]" : "text-white/60")}
                              >
                                {getRoleIcon(role)}
                                <span className="capitalize">{role}</span>
                                {u.role === role && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Users className="w-8 h-8 text-white/15" />} title="No users yet" subtitle="Users appear after signing in." />
            )}
          </div>
        )}
      </main>
    </motion.div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
      <div className="bg-white/[0.03] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-display font-bold text-white mb-1">{title}</h3>
      <p className="text-text-secondary text-sm">{subtitle}</p>
    </div>
  );
}
