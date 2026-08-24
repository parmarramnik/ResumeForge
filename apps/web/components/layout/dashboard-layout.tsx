'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UserProfile } from '@resumeforge/shared-types';
import { CURRENT_USER_MOCK } from '@/lib/supabase/mock-data';

interface DashboardLayoutProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export function DashboardLayout({ children, initialUser }: DashboardLayoutProps) {
  const [currentUser] = useState<UserProfile>(initialUser || CURRENT_USER_MOCK);

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
