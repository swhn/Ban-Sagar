import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, LogOut, PlusCircle, Sparkles, Home, Menu, X, Users, Settings, ShieldAlert, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/useTheme';

export function Layout() {
  const { user, appUser, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface font-sans text-text-primary flex flex-col">
      {/* Desktop & Tablet Header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-white/[0.04] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-hover:scale-105 active:scale-95">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white">
              Ban Sagar
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                isActive('/') ? "text-white bg-white/5" : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
              )}
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              to="/contribute"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                isActive('/contribute') ? "text-emerald-300 bg-emerald-500/10" : "text-white/50 hover:text-emerald-300 hover:bg-white/[0.03]"
              )}
            >
              <Users className="w-4 h-4" /> Contribute
            </Link>

            {user && appUser?.role === 'admin' && (
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                  isActive('/dashboard') ? "text-rose-300 bg-rose-500/10" : "text-white/50 hover:text-rose-300 hover:bg-white/[0.03]"
                )}
              >
                <ShieldAlert className="w-4 h-4" /> Admin
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.03] transition-all active:scale-90"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-6 w-px bg-white/[0.06] mx-2" />

            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold leading-none text-white/90">{appUser?.display_name || 'User'}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mt-0.5">{appUser?.role}</span>
                </div>
                <Link to="/profile" className="group relative" title="Profile Settings">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-white/10 group-hover:ring-indigo-500/40 transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/10 group-hover:ring-indigo-500/40 transition-all">
                      {(appUser?.display_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile: avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {user && user.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2 ring-white/10" referrerPolicy="no-referrer" />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-16 left-0 right-0 z-50 md:hidden bg-surface-raised/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/40"
            >
              <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
                <Link to="/" className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all", isActive('/') ? "bg-white/5 text-white" : "text-white/60")}>
                  <Home className="w-5 h-5" /> Home
                </Link>
                <Link to="/contribute" className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all", isActive('/contribute') ? "bg-emerald-500/10 text-emerald-300" : "text-white/60")}>
                  <Users className="w-5 h-5" /> Contribute
                </Link>
                {user && appUser?.role === 'admin' && (
                  <Link to="/dashboard" className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all", isActive('/dashboard') ? "bg-rose-500/10 text-rose-300" : "text-rose-400/60")}>
                    <ShieldAlert className="w-5 h-5" /> Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-white/60 hover:bg-white/[0.03] w-full text-left"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className="h-px bg-white/[0.06] my-2" />

                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center gap-3">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full ring-2 ring-white/10" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                            {(appUser?.display_name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{appUser?.display_name || 'User'}</p>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">{appUser?.role}</p>
                        </div>
                      </div>
                      <Settings className="w-4 h-4 text-white/30" />
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-white/40 hover:text-red-400 hover:bg-red-500/10 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={login}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white mx-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    <LogIn className="w-4 h-4" /> Sign In with Google
                  </button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500/40" />
              <span className="text-xs font-medium">Ban Sagar - Myanmar Slang Dictionary</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-xs text-white/20 hover:text-white/50 transition-colors font-medium">About</Link>
              <Link to="/contact" className="text-xs text-white/20 hover:text-white/50 transition-colors font-medium">Contact</Link>
              <Link to="/privacy" className="text-xs text-white/20 hover:text-white/50 transition-colors font-medium">Privacy</Link>
            </div>
          </div>
          <p className="text-xs text-white/15 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Community Driven.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
        <div className="flex items-center justify-around h-14 max-w-md mx-auto">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px]",
              isActive('/') ? "text-white" : "text-white/35"
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link
            to="/contribute"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px]",
              isActive('/contribute') ? "text-emerald-300" : "text-white/35"
            )}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Contribute</span>
          </Link>
          {user && (
            <Link
              to="/add"
              className="flex items-center justify-center w-12 h-12 -mt-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white active:scale-90 transition-transform"
            >
              <PlusCircle className="w-6 h-6" />
            </Link>
          )}
          {user ? (
            <Link
              to="/profile"
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px]",
                isActive('/profile') ? "text-indigo-300" : "text-white/35"
              )}
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <Settings className="w-5 h-5" />
              )}
              <span className="text-[10px] font-semibold">Profile</span>
            </Link>
          ) : (
            <button
              onClick={login}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] text-white/35"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Bottom nav spacer on mobile */}
      <div className="md:hidden h-16" />
    </div>
  );
}
