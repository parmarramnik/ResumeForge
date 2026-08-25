'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '@resumeforge/shared-types';
import { Button } from '@/components/ui/button';
import { LogOut, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user?: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleConfirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      document.cookie = 'resumeforge_guest=; path=/; max-age=0';
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-end shrink-0">
        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-semibold border border-border">
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
            onClick={() => setShowLogoutModal(true)}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Confirmation Modal Popup */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="bg-card border border-border rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-foreground shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Confirm Logout
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to log out? You will need to sign in again to access your workspace.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs bg-foreground text-background hover:bg-foreground/90 font-semibold"
                onClick={handleConfirmSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
