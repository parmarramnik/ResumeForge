'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code,
  Sparkles,
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
    { name: 'Resume Generator', href: '/generator', icon: Sparkles, badge: 'AI-Free' },
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
    <aside className={cn('w-64 border-r border-border bg-card/60 backdrop-blur flex flex-col justify-between h-screen shrink-0', className)}>
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center gap-2.5 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
            <FileCode2 className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight text-base">ResumeForge</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto border border-border/60">
            v1.0
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6">
          {/* Workspace */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
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
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
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
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground border border-border/50'
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
            <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
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
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
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

      {/* Compiler Sandbox Status Footer */}
      <div className="p-3 border-t border-border bg-muted/20 text-xs">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 border border-border/50 text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono">Tectonic Engine Sandbox</span>
        </div>
      </div>
    </aside>
  );
}
