'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_USER } from '@/lib/supabase/mock-data';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal details, workspace preferences, and security settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Profile Information</CardTitle>
              <Badge variant="outline" className="font-mono text-xs">USER</Badge>
            </div>
            <CardDescription className="text-xs">
              Update your display name and contact email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input defaultValue={DEMO_USER.full_name || 'Alex Mercer'} />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input defaultValue={DEMO_USER.email || 'alex@example.com'} disabled />
              <p className="text-[11px] text-muted-foreground">Managed via Supabase Auth</p>
            </div>
            <Button size="sm" className="text-xs">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
