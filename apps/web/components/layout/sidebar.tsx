'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code,
  FileEdit,
  Files,
  LayoutDashboard,
  User,
  Settings,
  FileCode2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const workspaceLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Maker', href: '/maker', icon: Code, badge: 'IDE' },
    { name: 'Resume Generator', href: '/generator', icon: FileEdit, badge: 'Form' },
    { name: 'My Resumes', href: '/resumes', icon: Files },
  ];

  const accountLinks = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn('w-60 border-r border-border bg-card flex flex-col justify-between h-screen shrink-0', className)}>
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center gap-2.5 border-b border-border">
          <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-sm">
            <FileCode2 className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight text-sm">ResumeForge</span>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6">
          {/* Workspace */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
              Workspace
            </div>
            <nav className="space-y-1">
              {workspaceLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                      active
                        ? 'bg-foreground text-background font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span
                        className={cn(
                          'ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono',
                          active
                            ? 'bg-background/20 text-background'
                            : 'bg-muted text-muted-foreground border border-border'
                        )}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
              Account
            </div>
            <nav className="space-y-1">
              {accountLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                      active
                        ? 'bg-foreground text-background font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
