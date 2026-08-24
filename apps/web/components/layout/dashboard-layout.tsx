'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UserProfile } from '@resumeforge/shared-types';
import { createClient } from '@/lib/supabase/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export function DashboardLayout({ children, initialUser }: DashboardLayoutProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(initialUser || null);

  useEffect(() => {
    const supabase = createClient();

    // Get current user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setCurrentUser({
              id: user.id,
              email: user.email || null,
              full_name: profile?.full_name || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'),
              role: 'USER',
              avatar_url: profile?.avatar_url || null,
              created_at: profile?.created_at || user.created_at,
              updated_at: profile?.updated_at || user.updated_at || user.created_at,
            });
          });
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || null,
          full_name: session.user.user_metadata?.full_name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
          role: 'USER',
          avatar_url: null,
          created_at: session.user.created_at,
          updated_at: session.user.created_at,
        });
      } else {
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
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
