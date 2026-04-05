import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, LogOut, Shield, PlusCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { user, appUser, login, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface font-sans text-text-primary flex flex-col">
      <header className="bg-surface/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Ban Sagar
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/add"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-white/60 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all"
                >
                  <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Slang</span>
                </Link>

                {(appUser?.role === 'moderator' || appUser?.role === 'admin') && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-amber-400/80 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Shield className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-1">
                  <div className="flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold leading-none text-white/90">{appUser?.display_name || 'User'}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mt-1">{appUser?.role}</span>
                  </div>
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 shadow-lg" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-indigo-500/30">
                      {(appUser?.display_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                    title="Log out"
                  >
                    <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/30">
            <Sparkles className="w-4 h-4 text-indigo-500/50" />
            <span className="text-sm font-medium">Ban Sagar - Myanmar Slang Dictionary</span>
          </div>
          <p className="text-sm text-white/20">
            &copy; {new Date().getFullYear()} Community Driven.
          </p>
        </div>
      </footer>
    </div>
  );
}
