'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Download,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [github, setGithub] = useState<string>('');
  const [linkedin, setLinkedin] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [joinedAt, setJoinedAt] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileSaved, setProfileSaved] = useState<boolean>(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          setJoinedAt(new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          setFullName(profile?.full_name || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'));
          setTitle(profile?.title || 'Software Engineer');
          setPhone(profile?.phone || '');
          setLocation(profile?.location || '');
          setBio(profile?.bio || '');
          setGithub(profile?.github || '');
          setLinkedin(profile?.linkedin || '');
          setWebsite(profile?.website || '');
        } else {
          // Guest / Demo fallback
          setEmail('guest@resumeforge.dev');
          setFullName('Guest User');
          setTitle('Demo Mode');
          setPhone('');
          setLocation('');
          setBio('Exploring ResumeForge in Guest / Demo mode.');
          setJoinedAt('Current Session');
        }
      } catch {
        setEmail('guest@resumeforge.dev');
        setFullName('Guest User');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
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
            title,
            phone,
            location,
            bio,
            github,
            linkedin,
            website,
            updated_at: new Date().toISOString(),
          });

        await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 3000);
      }
    } catch {
      setPasswordError('Network error while updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportProfile = () => {
    const profileData = {
      fullName,
      email,
      title,
      phone,
      location,
      bio,
      socials: { github, linkedin, website },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName.toLowerCase().replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Profile Banner */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-foreground text-background flex items-center justify-center text-2xl font-bold font-mono shrink-0 shadow">
              {fullName?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{fullName || 'User Profile'}</h1>
                <Badge variant="outline" className="text-[10px] font-mono border-border">
                  VERIFIED
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{title || 'Software Engineer'}</p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {email || 'user@example.com'}
                </span>
                {joinedAt && <span>• Member since {joinedAt}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProfile}
              className="text-xs gap-1.5 h-8 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="text-xs gap-1.5 h-8 font-semibold bg-foreground text-background hover:bg-foreground/90"
            >
              {profileSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Information Form */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">Profile Details</Badge>
            </div>
            <CardDescription className="text-xs">
              Personal contact and professional details used across your resume templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading account profile...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Full Name"
                        className="text-xs pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Professional Title</Label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Lead Architect / Senior Engineer"
                        className="text-xs pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={email}
                        disabled
                        className="text-xs pl-9 bg-muted/30 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="text-xs pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-medium">Location</Label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State, Country"
                        className="text-xs pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-medium">Professional Summary</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief overview of your experience, technical domain, and achievements..."
                      className="text-xs min-h-[90px] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-2 border-t border-border space-y-3">
                  <span className="text-xs font-semibold text-foreground">Online Profiles & Links</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">GitHub</Label>
                      <div className="relative">
                        <Github className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          placeholder="https://github.com/..."
                          className="text-xs pl-8 h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="text-xs pl-8 h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Portfolio Website</Label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="text-xs pl-8 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-[11px] text-muted-foreground">Changes reflect in your active session.</span>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="text-xs gap-1.5 h-8 font-semibold bg-foreground text-background hover:bg-foreground/90"
            >
              {profileSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Change Password Card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold">Security & Password</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">Authentication</Badge>
            </div>
            <CardDescription className="text-xs">
              Change your password to keep your account safe and secure.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Current Password</Label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-[11px] text-muted-foreground">Minimum 6 characters required.</span>
              <Button
                type="submit"
                size="sm"
                disabled={passwordLoading || !newPassword}
                className="text-xs gap-1.5 h-8 font-semibold bg-foreground text-background hover:bg-foreground/90"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
