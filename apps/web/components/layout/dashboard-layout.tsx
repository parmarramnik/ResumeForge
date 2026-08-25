'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UserProfile } from '@resumeforge/shared-types';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
  noPadding?: boolean;
}

// In-memory user cache
let cachedUserProfile: UserProfile | null = null;

export function clearCachedUserProfile() {
  cachedUserProfile = null;
}

export function DashboardLayout({ children, initialUser, noPadding = false }: DashboardLayoutProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    initialUser || cachedUserProfile || null
  );

  useEffect(() => {
    const supabase = createClient();

    // Fetch current user if not in memory
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const profile: UserProfile = {
          id: user.id,
          email: user.email || null,
          full_name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'),
          role: 'USER',
          avatar_url: null,
          created_at: user.created_at,
          updated_at: user.created_at,
        };
        cachedUserProfile = profile;
        setCurrentUser(profile);
      } else {
        cachedUserProfile = null;
        setCurrentUser(null);
      }
    });

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email || null,
          full_name: session.user.user_metadata?.full_name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
          role: 'USER',
          avatar_url: null,
          created_at: session.user.created_at,
          updated_at: session.user.created_at,
        };
        cachedUserProfile = profile;
        setCurrentUser(profile);
      } else {
        cachedUserProfile = null;
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header user={currentUser} />
        <main
          className={cn(
            'flex-1 overflow-hidden',
            noPadding
              ? 'p-0 bg-background flex flex-col'
              : 'overflow-y-auto bg-muted/10 p-6 md:p-8'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
