import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { full_name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Use Supabase Admin API to create user with auto-confirmed email (bypasses SMTP rate limits)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || email.split('@')[0],
        role: 'USER',
      },
    });

    if (createError) {
      if (
        createError.message.toLowerCase().includes('already registered') ||
        createError.message.toLowerCase().includes('already exists')
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    // Insert or ensure profile exists in database
    if (userData?.user) {
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: full_name || email.split('@')[0],
          role: 'USER',
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Continue if profile trigger already created it
      }
    }

    return NextResponse.json({
      success: true,
      user: userData.user,
      message: 'Account created successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal registration error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
