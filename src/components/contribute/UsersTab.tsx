import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AppUser, UserRole } from '../../lib/database.types';
import {
  Loader2, CheckCircle, Users, Shield, ShieldCheck, User, ChevronDown,
  Search, Timer, X, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const COOLDOWN_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
  { label: '30 days', hours: 720 },
];

export function UsersTab() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [cooldownDropdownOpen, setCooldownDropdownOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const hasActiveCooldowns = allUsers.some(u => u.cooldown_until && new Date(u.cooldown_until) > new Date());
    if (!hasActiveCooldowns) return;
    const interval = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(interval);
  }, [allUsers]);

  useEffect(() => {
    const handleClickOutside = () => {
      setRoleDropdownOpen(null);
      setCooldownDropdownOpen(null);
    };
    if (roleDropdownOpen || cooldownDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [roleDropdownOpen, cooldownDropdownOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAllUsers(data as AppUser[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
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

  const handleSetCooldown = async (userId: string, hours: number) => {
    try {
      const cooldownUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('users').update({ cooldown_until: cooldownUntil }).eq('id', userId);
      if (error) throw error;
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, cooldown_until: cooldownUntil } : u));
      setCooldownDropdownOpen(null);
      showMessage(`Cooldown set for ${hours >= 24 ? `${Math.floor(hours / 24)} day(s)` : `${hours} hour(s)`}.`, 'success');
    } catch (error: any) {
      showMessage(`Failed: ${error.message}`, 'error');
    }
  };

  const handleRemoveCooldown = async (userId: string) => {
    try {
      const { error } = await supabase.from('users').update({ cooldown_until: null }).eq('id', userId);
      if (error) throw error;
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, cooldown_until: null } : u));
      showMessage('Cooldown removed.', 'success');
    } catch (error: any) {
      showMessage(`Failed: ${error.message}`, 'error');
    }
  };

  const isOnCooldown = (u: AppUser) => u.cooldown_until && new Date(u.cooldown_until) > new Date();

  const formatCooldown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h left`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
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

  const filtered = allUsers.filter(u =>
    !searchQuery ||
    (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{filtered.length} users</h3>
          <button onClick={fetchUsers} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] text-white/50 rounded-lg hover:bg-white/[0.06] text-xs font-semibold transition-all border border-white/[0.06]">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />} Refresh
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input type="text" placeholder="Search by name or email..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-surface-raised/80 rounded-xl border border-white/[0.04] hover:border-white/[0.07] transition-colors"
            >
              {/* Avatar + info */}
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

              {/* Actions: cooldown + role */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Cooldown indicator/control */}
                {isOnCooldown(u) ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/15 rounded-lg">
                    <Timer className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[11px] font-semibold text-orange-400">{formatCooldown(u.cooldown_until!)}</span>
                    <button onClick={() => handleRemoveCooldown(u.id)} className="ml-1 text-orange-400/50 hover:text-orange-300 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : u.id !== user?.id ? (
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setCooldownDropdownOpen(cooldownDropdownOpen === u.id ? null : u.id); setRoleDropdownOpen(null); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/15 rounded-lg text-[11px] font-semibold transition-all"
                    >
                      <Timer className="w-3.5 h-3.5" /> Cooldown
                    </button>
                    <AnimatePresence>
                      {cooldownDropdownOpen === u.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1.5 z-50 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[140px]">
                          {COOLDOWN_OPTIONS.map(opt => (
                            <button key={opt.hours} onClick={(e) => { e.stopPropagation(); handleSetCooldown(u.id, opt.hours); }}
                              className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-semibold text-white/60 hover:text-orange-400 hover:bg-white/[0.04] transition-all">
                              <Timer className="w-3 h-3" /> {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : null}

                {/* Role dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (u.id !== user?.id) { setRoleDropdownOpen(roleDropdownOpen === u.id ? null : u.id); setCooldownDropdownOpen(null); } }}
                    disabled={u.id === user?.id}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all",
                      getRoleColor(u.role),
                      u.id === user?.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110"
                    )}>
                    {getRoleIcon(u.role)} {u.role}
                    {u.id !== user?.id && <ChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {roleDropdownOpen === u.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1.5 z-50 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[140px]">
                        {(['user', 'moderator', 'admin'] as UserRole[]).map(role => (
                          <button key={role} onClick={(e) => { e.stopPropagation(); handleRoleChange(u.id, role); }}
                            className={cn("flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold transition-all hover:bg-white/[0.04]",
                              u.role === role ? "text-indigo-400 bg-indigo-500/[0.06]" : "text-white/60"
                            )}>
                            {getRoleIcon(role)}
                            <span className="capitalize">{role}</span>
                            {u.role === role && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-14 bg-surface-raised/50 rounded-2xl border border-dashed border-white/[0.06]">
          <Search className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No results</h3>
          <p className="text-text-secondary text-sm">No users match "{searchQuery}"</p>
        </div>
      ) : null}
    </div>
  );
}
