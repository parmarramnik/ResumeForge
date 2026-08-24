import { UserProfile } from '@resumeforge/shared-types';
import { createServerSupabaseClient } from '../supabase/server';

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch user profile from Supabase database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || null,
      full_name: profile?.full_name || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'),
      role: 'USER',
      avatar_url: profile?.avatar_url || null,
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || user.updated_at || user.created_at,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
