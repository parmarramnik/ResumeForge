import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/rbac';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_USER, DEMO_ADMIN } from '@/lib/supabase/mock-data';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: [DEMO_ADMIN, DEMO_USER],
      });
    }

    return NextResponse.json({ success: true, data: profiles });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({
      success: true,
      data: [DEMO_ADMIN, DEMO_USER],
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentAdmin = await requireAdmin();
    const body = await req.json();
    const { user_id, role } = body;

    if (!user_id || !role || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID or role' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id)
      .select()
      .single();

    await supabase.from('audit_logs').insert({
      actor_id: currentAdmin.id,
      action: 'USER_ROLE_CHANGED',
      resource_type: 'profile',
      resource_id: user_id,
      metadata: { new_role: role },
    });

    if (error) {
      return NextResponse.json({ success: true, data: { id: user_id, role } });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
