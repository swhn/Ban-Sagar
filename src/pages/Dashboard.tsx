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

  // User management state
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

        if (error) {
          console.error('Error fetching slangs:', error);
        } else {
          setSlangs(data as SlangData[]);
        }
        setLoading(false);
      };

      fetchSlangs();

      const channel = supabase
        .channel('slangs-dashboard')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'slangs',
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSlang = payload.new as SlangData;
            if (newSlang.status === activeTab) {
              setSlangs(prev => [newSlang, ...prev]);
            }
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

      return () => {
        supabase.removeChannel(channel);
      };
    }

    if (activeMenu === 'users' && appUser?.role === 'admin') {
      fetchUsers();
    }
  }, [user, appUser, isAuthReady, navigate, activeTab, activeMenu]);

  // Close role dropdown when clicking outside
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

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
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setRoleDropdownOpen(null);
      setMessage({ text: `Role updated to ${newRole}.`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating role:', error);
      setMessage({ text: `Failed to update role: ${error.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('slangs')
        .update({ status: 'approved' as SlangStatus })
        .eq('id', id);

      if (error) throw error;
      setMessage({ text: 'Submission approved.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error approving:', error);
      setMessage({ text: 'Failed to approve.', type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('slangs')
        .update({ status: 'rejected' as SlangStatus })
        .eq('id', id);

      if (error) throw error;
      setMessage({ text: 'Submission rejected.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error rejecting:', error);
      setMessage({ text: 'Failed to reject.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('slangs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ text: 'Slang deleted successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      if (activeMenu === 'duplicates') {
        scanDuplicates();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ text: 'Failed to delete.', type: 'error' });
    }
  };

  const scanDuplicates = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.from('slangs').select('*');

      if (error) throw error;

      const wordMap = new Map<string, SlangData[]>();
      (data as SlangData[]).forEach(item => {
        const normalizedWord = item.word.toLowerCase().trim();
        if (!wordMap.has(normalizedWord)) {
          wordMap.set(normalizedWord, []);
        }
        wordMap.get(normalizedWord)!.push(item);
      });

      const dupes: {word: string, items: SlangData[]}[] = [];
      wordMap.forEach((items, word) => {
        if (items.length > 1) {
          dupes.push({ word, items });
        }
      });

      setDuplicates(dupes);
      if (dupes.length === 0) {
        setMessage({ text: 'No duplicates found!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error scanning duplicates:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="w-4 h-4" />;
      case 'moderator': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'text-rose-400 bg-rose-500/15 border-rose-500/20';
      case 'moderator': return 'text-amber-400 bg-amber-500/15 border-amber-500/20';
      default: return 'text-sky-400 bg-sky-500/15 border-sky-500/20';
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8"
    >
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{appUser?.role}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveMenu('review')}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
              activeMenu === 'review' ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-white/50 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <ClipboardList className="w-5 h-5" /> Review Submissions
          </button>

          <button
            onClick={() => { setActiveMenu('duplicates'); scanDuplicates(); }}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
              activeMenu === 'duplicates' ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-white/50 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <Copy className="w-5 h-5" /> Scan Duplicates
          </button>

          {appUser?.role === 'admin' && (
            <button
              onClick={() => setActiveMenu('users')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
                activeMenu === 'users' ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Users className="w-5 h-5" /> Manage Users
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 space-y-6">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "p-4 rounded-xl text-sm font-medium flex items-center gap-3 border",
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
              )}
            >
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {activeMenu === 'review' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-xl w-fit border border-white/5">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <Clock className="w-4 h-4" /> Pending
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'approved' ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <CheckCircle className="w-4 h-4" /> Approved
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'rejected' ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <XCircle className="w-4 h-4" /> Rejected
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : slangs.length > 0 ? (
              <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                  {slangs.map((slang, index) => (
                    <motion.div
                      key={slang.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SlangCard
                        slang={slang}
                        isModeratorView={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onEdit={(id) => navigate(`/edit/${id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-surface-raised rounded-2xl border border-dashed border-white/10"
              >
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">All caught up!</h3>
                <p className="text-text-secondary text-lg">There are no {activeTab} submissions to review.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeMenu === 'duplicates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-raised p-6 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-2xl font-bold text-white">Duplicate Words</h2>
                <p className="text-text-secondary mt-1">Find and resolve multiple entries for the same slang word.</p>
              </div>
              <button
                onClick={scanDuplicates}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 text-sm font-semibold transition-all w-full sm:w-auto border border-indigo-500/20"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Rescan Database
              </button>
            </div>

            {isScanning ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : duplicates.length > 0 ? (
              <div className="space-y-6">
                {duplicates.map(group => (
                  <div key={group.word} className="bg-surface-raised p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">
                      "{group.word}"
                      <span className="text-sm font-medium text-text-secondary ml-3 bg-white/5 px-2.5 py-1 rounded-lg">
                        {group.items.length} entries
                      </span>
                    </h3>
                    <div className="grid gap-4">
                      {group.items.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/[0.02] rounded-xl border border-white/5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn(
                                "text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider",
                                item.status === 'approved' ? "bg-emerald-500/15 text-emerald-400" :
                                item.status === 'pending' ? "bg-amber-500/15 text-amber-400" :
                                "bg-red-500/15 text-red-400"
                              )}>
                                {item.status}
                              </span>
                              <span className="text-sm font-medium text-text-secondary">by {item.author_name}</span>
                              <span className="text-sm font-medium text-white/30 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/80 font-medium line-clamp-2">{item.meaning}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              to={`/slang/${item.id}`}
                              target="_blank"
                              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-indigo-400 hover:border-indigo-500/30 rounded-xl text-sm font-semibold transition-all"
                            >
                              <ExternalLink className="w-4 h-4" /> View
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all border border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-raised rounded-2xl border border-dashed border-white/10">
                <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500/50" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">No duplicates found</h3>
                <p className="text-text-secondary text-lg">Your dictionary is clean and organized.</p>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'users' && appUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-raised p-6 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-text-secondary mt-1">
                  {allUsers.length} registered user{allUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={fetchUsers}
                disabled={usersLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 text-sm font-semibold transition-all w-full sm:w-auto border border-indigo-500/20"
              >
                {usersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                Refresh
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : allUsers.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {allUsers.map((u, index) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-surface-raised rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Avatar + Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-full ring-2 ring-white/10 shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-white/10 shrink-0">
                            {(u.display_name || u.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{u.display_name || 'Unnamed'}</p>
                          <p className="text-sm text-text-secondary truncate">{u.email}</p>
                          <p className="text-xs text-white/20 mt-0.5">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Role badge + dropdown */}
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Don't allow changing own role
                            if (u.id === user?.id) return;
                            setRoleDropdownOpen(roleDropdownOpen === u.id ? null : u.id);
                          }}
                          disabled={u.id === user?.id}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                            getRoleColor(u.role),
                            u.id === user?.id ? "opacity-60 cursor-not-allowed" : "hover:brightness-125 cursor-pointer"
                          )}
                        >
                          {getRoleIcon(u.role)}
                          {u.role}
                          {u.id !== user?.id && <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <AnimatePresence>
                          {roleDropdownOpen === u.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute right-0 top-full mt-2 z-50 bg-surface-overlay border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[160px]"
                            >
                              {(['user', 'moderator', 'admin'] as UserRole[]).map(role => (
                                <button
                                  key={role}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRoleChange(u.id, role);
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold transition-all hover:bg-white/5",
                                    u.role === role ? "text-indigo-400 bg-indigo-500/10" : "text-white/70"
                                  )}
                                >
                                  {getRoleIcon(role)}
                                  <span className="capitalize">{role}</span>
                                  {u.role === role && <CheckCircle className="w-4 h-4 ml-auto" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-raised rounded-2xl border border-dashed border-white/10">
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">No users yet</h3>
                <p className="text-text-secondary text-lg">Users will appear here after they sign in.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </motion.div>
  );
}
