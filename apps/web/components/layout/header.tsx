'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@resumeforge/shared-types';
import { Button } from '@/components/ui/button';
import { Code, Sparkles, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user?: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

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

      {/* User Profile & Sign Out */}
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold border border-primary/20">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium leading-none truncate max-w-[140px]">
              {user?.full_name || user?.email || 'Arjun Mehta'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-1">
              {user?.email || 'arjun.mehta.dev@example.com'}
            </span>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
