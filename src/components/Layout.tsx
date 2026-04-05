import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, LogOut, Shield, PlusCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Layout() {
  const { user, appUser, login, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-indigo-200">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg text-white shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Myanmar Slang
            </span>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link 
                  to="/add" 
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Slang</span>
                </Link>
                
                {(appUser?.role === 'moderator' || appUser?.role === 'admin') && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                  >
                    <Shield className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                
                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                
                <div className="flex items-center gap-3 pl-1">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold leading-none text-slate-800">{appUser?.displayName || 'User'}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 mt-1">{appUser?.role}</span>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                      {(appUser?.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title="Log out"
                  >
                    <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95"
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
            className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">Myanmar Slang Dictionary</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Community Driven.
          </p>
        </div>
      </footer>
    </div>
  );
}
