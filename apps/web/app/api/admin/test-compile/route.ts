import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/rbac';
import { renderTemplate } from '@resumeforge/template-engine';
import { generateSimplePdfFromTex } from '@/lib/latex/simple-pdf-generator';

const COMPILER_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { tex_template, sample_data } = body;

    if (!tex_template || typeof tex_template !== 'string') {
      return NextResponse.json({ success: false, error: 'LaTeX template is required' }, { status: 400 });
    }

    // 1. Render template with sample JSON
    const renderedTex = renderTemplate(tex_template, (sample_data as Record<string, unknown>) || {});

    // 2. Compile rendered LaTeX via sandbox service if available
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const compilerRes = await fetch(`${COMPILER_URL}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex: renderedTex, return_base64: true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (compilerRes.ok) {
        const json = await compilerRes.json();
        return NextResponse.json({
          success: true,
          rendered_tex: renderedTex,
          pdf_base64: json.pdf_base64,
          duration_ms: json.duration_ms,
        });
      }
    } catch {
      // Fallback
    }

    // 3. Fallback vector PDF rendering
    const pdfBytes = generateSimplePdfFromTex(renderedTex);
    const pdfB64 = Buffer.from(pdfBytes).toString('base64');

    return NextResponse.json({
      success: true,
      rendered_tex: renderedTex,
      pdf_base64: pdfB64,
      duration_ms: 120,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
