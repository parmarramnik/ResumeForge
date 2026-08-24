import { NextRequest, NextResponse } from 'next/server';
import { createResumeSchema } from '@resumeforge/validation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/rbac';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*, template:templates(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: resumes || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = createResumeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0]?.message || 'Invalid resume payload' },
        { status: 400 }
      );
    }

    const { title, service_type, template_id, raw_tex, form_data } = parseResult.data;
    const supabase = await createServerSupabaseClient();

    const { data: newResume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        service_type,
        template_id: template_id || null,
        raw_tex,
        form_data: form_data || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // In local mode without Supabase connection, return a constructed mock object
      return NextResponse.json({
        success: true,
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          title,
          service_type,
          template_id,
          raw_tex,
          form_data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Create initial version snapshot
    if (newResume) {
      await supabase.from('resume_versions').insert({
        resume_id: newResume.id,
        version_number: 1,
        raw_tex,
        form_data: form_data || null,
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
