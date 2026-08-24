import { UserProfile, UserRole } from '@resumeforge/shared-types';
import { createServerSupabaseClient } from '../supabase/server';
import { CURRENT_USER_MOCK } from '../supabase/mock-data';

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Return mock user if demo mode enabled / local dev fallback
      if (process.env.ENABLE_DEMO_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        return CURRENT_USER_MOCK;
      }
      return CURRENT_USER_MOCK;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || null,
      full_name: profile?.full_name || user.user_metadata?.full_name || 'Arjun Mehta',
      role: 'USER',
      avatar_url: profile?.avatar_url || null,
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || user.updated_at || user.created_at,
    };
  } catch {
    return CURRENT_USER_MOCK;
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
