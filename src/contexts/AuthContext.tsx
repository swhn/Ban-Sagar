import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppUser } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  toggleNsfw: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSession(session: Session | null) {
    if (session?.user) {
      setUser(session.user);
      await loadOrCreateProfile(session.user);
    } else {
      setUser(null);
      setAppUser(null);
    }
    setIsAuthReady(true);
  }

  async function loadOrCreateProfile(authUser: User) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingUser) {
        setAppUser(existingUser as AppUser);
      } else {
        const newUser = {
          id: authUser.id,
          email: authUser.email || '',
          display_name: authUser.user_metadata.full_name || authUser.user_metadata.name || null,
          avatar_url: authUser.user_metadata.avatar_url || null,
        };

        const { data, error } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          return;
        }
        setAppUser(data as AppUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error('Login error:', error);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    setUser(null);
    setAppUser(null);
  }

  async function toggleNsfw() {
    if (!appUser) return;
    const newValue = !appUser.show_nsfw;
    setAppUser({ ...appUser, show_nsfw: newValue });
    const { error } = await supabase
      .from('users')
      .update({ show_nsfw: newValue })
      .eq('id', appUser.id);
    if (error) {
      console.error('Error toggling NSFW:', error);
      setAppUser({ ...appUser, show_nsfw: !newValue });
    }
  }

  return (
    <AuthContext.Provider value={{ user, appUser, isAuthReady, login, logout, toggleNsfw }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
