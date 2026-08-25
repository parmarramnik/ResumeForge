import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { current_password, new_password } = await request.json();

    if (!new_password || new_password.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: 'You must be signed in to change your password.' },
        { status: 401 }
      );
    }

    // If current_password was provided, verify it first
    if (current_password) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current_password,
      });

      if (verifyError) {
        return NextResponse.json(
          { error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }
    }

    // Update password using Supabase Admin Client for reliability
    const supabaseAdmin = createAdminClient();
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: new_password }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to change password';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
