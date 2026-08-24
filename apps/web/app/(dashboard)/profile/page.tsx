'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Check, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          setFullName(profile?.full_name || user.user_metadata?.full_name || '');
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          });
        
        await supabase.auth.updateUser({
          data: { full_name: fullName },
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      // Handled
    } finally {
      setIsSaving(false);
    }
  };

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
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading account profile...</span>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={email} disabled />
                  <p className="text-[11px] text-muted-foreground">Managed via Supabase Auth</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-xs gap-1.5 font-medium"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Changes Saved!</span>
                    </>
                  ) : (
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
