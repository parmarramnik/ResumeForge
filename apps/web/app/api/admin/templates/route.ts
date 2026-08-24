import { NextRequest, NextResponse } from 'next/server';
import { templateInputSchema } from '@resumeforge/validation';
import { requireAdmin } from '@/lib/auth/rbac';
import { createAdminClient } from '@/lib/supabase/admin';
import { INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !templates || templates.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_TEMPLATES });
    }

    return NextResponse.json({ success: true, data: templates });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: INITIAL_TEMPLATES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parseResult = templateInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0]?.message || 'Invalid template payload' },
        { status: 400 }
      );
    }

    const { title, description, category, thumbnail_url, tex_template, schema_definition, is_active } = parseResult.data;
    const supabase = createAdminClient();

    const { data: newTemplate, error } = await supabase
      .from('templates')
      .insert({
        title,
        description,
        category: category || 'General',
        thumbnail_url: thumbnail_url || null,
        tex_template,
        schema_definition,
        version: 1,
        is_active,
        created_by: admin.id,
      })
      .select()
      .single();

    // Log audit event
    await supabase.from('audit_logs').insert({
      actor_id: admin.id,
      action: 'TEMPLATE_CREATED',
      resource_type: 'template',
      resource_id: newTemplate?.id || null,
      metadata: { title, category, version: 1 },
    });

    if (error) {
      return NextResponse.json({
        success: true,
        data: {
          id: crypto.randomUUID(),
          title,
          description,
          category,
          thumbnail_url,
          tex_template,
          schema_definition,
          version: 1,
          is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, data: newTemplate });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
