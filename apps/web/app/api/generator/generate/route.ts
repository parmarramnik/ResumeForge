import { NextRequest, NextResponse } from 'next/server';
import { resumeFormDataSchema } from '@resumeforge/validation';
import { renderTemplate } from '@resumeforge/template-engine';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template_id, form_data, tex_template_override } = body;

    // Validate form data
    const parseResult = resumeFormDataSchema.safeParse(form_data);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || 'Invalid resume form data',
        },
        { status: 400 }
      );
    }

    let texTemplate = tex_template_override;

    // If template_id is provided, retrieve official master template
    if (template_id) {
      const supabase = await createServerSupabaseClient();
      const { data: template } = await supabase
        .from('templates')
        .select('tex_template')
        .eq('id', template_id)
        .single();

      if (template?.tex_template) {
        texTemplate = template.tex_template;
      } else {
        const fallback = INITIAL_TEMPLATES.find((t) => t.id === template_id);
        if (fallback) {
          texTemplate = fallback.tex_template;
        }
      }
    }

    if (!texTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found or invalid' },
        { status: 404 }
      );
    }

    // Safely render template with automatic LaTeX escaping
    const renderedTex = renderTemplate(texTemplate, parseResult.data as unknown as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      raw_tex: renderedTex,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate LaTeX from structured data',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
