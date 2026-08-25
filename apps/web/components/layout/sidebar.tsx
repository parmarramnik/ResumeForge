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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

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
    <aside
      className={cn(
        'border-r border-border bg-card flex flex-col justify-between h-screen shrink-0 transition-all duration-200 ease-in-out select-none',
        isCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Header & Toggle */}
        <div className={cn(
          'h-14 flex items-center border-b border-border transition-all duration-200',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-4'
        )}>
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
              <FileCode2 className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold tracking-tight text-sm truncate">
                ResumeForge
              </span>
            )}
          </Link>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="px-2 py-4 space-y-6">
          {/* Workspace Section */}
          <div>
            {!isCollapsed && (
              <div className="px-2.5 mb-2 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                Workspace
              </div>
            )}
            <nav className="space-y-1">
              {workspaceLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    title={isCollapsed ? link.name : undefined}
                    className={cn(
                      'flex items-center gap-2.5 py-2 text-xs font-medium rounded-md transition-colors',
                      isCollapsed ? 'justify-center px-0 h-9 w-full' : 'px-3',
                      active
                        ? 'bg-foreground text-background font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="truncate">{link.name}</span>
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
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account Section */}
          <div>
            {!isCollapsed && (
              <div className="px-2.5 mb-2 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                Account
              </div>
            )}
            <nav className="space-y-1">
              {accountLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    title={isCollapsed ? link.name : undefined}
                    className={cn(
                      'flex items-center gap-2.5 py-2 text-xs font-medium rounded-md transition-colors',
                      isCollapsed ? 'justify-center px-0 h-9 w-full' : 'px-3',
                      active
                        ? 'bg-foreground text-background font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Collapsed Bottom Expand Button */}
      {isCollapsed && (
        <div className="p-2 border-t border-border flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
