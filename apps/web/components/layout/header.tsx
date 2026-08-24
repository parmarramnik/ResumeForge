'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile, UserRole } from '@resumeforge/shared-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Sparkles, LogOut, Shield, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  user?: UserProfile | null;
  onRoleToggle?: (newRole: UserRole) => void;
}

export function Header({ user, onRoleToggle }: HeaderProps) {
  const currentRole = user?.role || 'USER';

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Quick Action CTAs */}
      <div className="flex items-center gap-2">
        <Link href="/maker">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-medium">
            <Code className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">New in</span> Maker
          </Button>
        </Link>
        <Link href="/generator">
          <Button size="sm" className="h-8 text-xs gap-1.5 font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New in</span> Generator
          </Button>
        </Link>
      </div>

      {/* User Controls & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Interactive Role Switcher for Development / Demonstration */}
        {onRoleToggle && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px] font-mono gap-1 border-dashed"
            onClick={() => onRoleToggle(currentRole === 'ADMIN' ? 'USER' : 'ADMIN')}
            title="Toggle role for testing RBAC permissions"
          >
            {currentRole === 'ADMIN' ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Role: ADMIN</span>
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span>Role: USER</span>
              </>
            )}
          </Button>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground border border-border">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium leading-none truncate max-w-[120px]">
              {user?.full_name || user?.email || 'User'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-1 font-mono">
              {currentRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
