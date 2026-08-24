import { UserProfile, UserRole } from '@resumeforge/shared-types';
import { createServerSupabaseClient } from '../supabase/server';
import { DEMO_USER, DEMO_ADMIN } from '../supabase/mock-data';

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Return demo user if demo mode enabled / local dev fallback
      if (process.env.ENABLE_DEMO_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        return DEMO_USER;
      }
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || null,
      role: (profile?.role as UserRole) || (user.user_metadata?.role as UserRole) || 'USER',
      avatar_url: profile?.avatar_url || null,
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || user.updated_at || user.created_at,
    };
  } catch {
    return DEMO_USER;
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
