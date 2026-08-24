'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UserProfile, UserRole } from '@resumeforge/shared-types';
import { DEMO_USER, DEMO_ADMIN } from '@/lib/supabase/mock-data';

interface DashboardLayoutProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export function DashboardLayout({ children, initialUser }: DashboardLayoutProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUser || DEMO_USER);

  // Sync state from localStorage for persistence across routes during demo
  useEffect(() => {
    const savedRole = localStorage.getItem('resumeforge_role') as UserRole;
    if (savedRole) {
      setCurrentUser(savedRole === 'ADMIN' ? DEMO_ADMIN : DEMO_USER);
    }
  }, []);

  const handleRoleToggle = (newRole: UserRole) => {
    const user = newRole === 'ADMIN' ? DEMO_ADMIN : DEMO_USER;
    setCurrentUser(user);
    localStorage.setItem('resumeforge_role', newRole);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar userRole={currentUser.role} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header user={currentUser} onRoleToggle={handleRoleToggle} />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
