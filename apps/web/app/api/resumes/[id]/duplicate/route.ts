import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/rbac';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: sourceResume, error: fetchErr } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !sourceResume) {
      return NextResponse.json({ success: false, error: 'Source resume not found' }, { status: 404 });
    }

    const { data: newResume, error: insertErr } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: `${sourceResume.title} (Copy)`,
        service_type: sourceResume.service_type,
        template_id: sourceResume.template_id,
        raw_tex: sourceResume.raw_tex,
        form_data: sourceResume.form_data,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({
        success: true,
        data: {
          ...sourceResume,
          id: crypto.randomUUID(),
          title: `${sourceResume.title} (Copy)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, data: newResume });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
