'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserProfile, UserRole } from '@resumeforge/shared-types';
import { DEMO_ADMIN, DEMO_USER } from '@/lib/supabase/mock-data';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([DEMO_ADMIN, DEMO_USER]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleRoleChange = async (userId: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {}
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">User Role Management</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            View registered user profiles, account creation timestamps, and assign RBAC roles.
          </p>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-lg border border-border flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-9 h-8 text-xs bg-muted/30"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {filteredUsers.length} total user accounts
          </span>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.full_name || 'Anonymous User'}</span>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{u.email}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={u.role === 'ADMIN' ? 'default' : 'outline'}
                        className="font-mono text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-muted-foreground font-mono">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleChange(u.id, u.role)}
                        className="h-7 text-xs font-mono"
                      >
                        Set to {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
