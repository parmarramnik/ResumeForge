import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/rbac';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    // Fetch existing template to calculate version increment if tex_template changed
    const { data: existing } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url;
    if (body.schema_definition !== undefined) updateData.schema_definition = body.schema_definition;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    if (body.tex_template !== undefined && body.tex_template !== existing?.tex_template) {
      updateData.tex_template = body.tex_template;
      updateData.version = (existing?.version || 1) + 1; // Immutable version bump
    }

    const { data: updated, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // Log audit event
    await supabase.from('audit_logs').insert({
      actor_id: admin.id,
      action: body.is_active !== undefined && body.is_active !== existing?.is_active
        ? (body.is_active ? 'TEMPLATE_PUBLISHED' : 'TEMPLATE_DISABLED')
        : 'TEMPLATE_UPDATED',
      resource_type: 'template',
      resource_id: id,
      metadata: { changes: Object.keys(updateData) },
    });

    if (error) {
      return NextResponse.json({ success: true, data: { id, ...updateData } });
    }

    return NextResponse.json({ success: true, data: updated });
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
    const admin = await requireAdmin();
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from('templates').delete().eq('id', id);

    await supabase.from('audit_logs').insert({
      actor_id: admin.id,
      action: 'TEMPLATE_DELETED',
      resource_type: 'template',
      resource_id: id,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
