import { NextRequest, NextResponse } from 'next/server';
import { updateResumeSchema } from '@resumeforge/validation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/rbac';

export async function GET(
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
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*, template:templates(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: resume });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = updateResumeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0]?.message || 'Invalid update payload' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parseResult.data.title !== undefined) updateData.title = parseResult.data.title;
    if (parseResult.data.raw_tex !== undefined) updateData.raw_tex = parseResult.data.raw_tex;
    if (parseResult.data.form_data !== undefined) updateData.form_data = parseResult.data.form_data;
    if (parseResult.data.template_id !== undefined) updateData.template_id = parseResult.data.template_id;

    const { data: updatedResume, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: true, data: { id, ...updateData } });
    }

    // Versioning snapshot
    if (parseResult.data.raw_tex) {
      const { count } = await supabase
        .from('resume_versions')
        .select('*', { count: 'exact', head: true })
        .eq('resume_id', id);

      await supabase.from('resume_versions').insert({
        resume_id: id,
        version_number: (count || 1) + 1,
        raw_tex: parseResult.data.raw_tex,
        form_data: parseResult.data.form_data,
      });
    }

    return NextResponse.json({ success: true, data: updatedResume });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
