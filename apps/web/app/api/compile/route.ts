import { NextRequest, NextResponse } from 'next/server';
import { compileRequestSchema } from '@resumeforge/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { generateSimplePdfFromTex } from '@/lib/latex/simple-pdf-generator';

const COMPILER_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting per IP / User
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 60, 60 * 1000); // 60 compiles per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a moment before compiling again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // 2. Validate Request Body
    const body = await req.json();
    const parseResult = compileRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || 'Invalid compilation payload',
        },
        { status: 400 }
      );
    }

    const { tex, engine } = parseResult.data;

    // 3. Attempt Proxy to Isolated Compiler Service
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const compilerRes = await fetch(`${COMPILER_URL}/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tex,
          engine: engine || 'tectonic',
          return_base64: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (compilerRes.ok) {
        const pdfArrayBuffer = await compilerRes.arrayBuffer();
        return new NextResponse(pdfArrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=resume.pdf',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Compiler-Engine': 'tectonic-sandbox',
          },
        });
      }

      if (compilerRes.status === 422 || compilerRes.status === 400) {
        const errJson = await compilerRes.json().catch(() => ({}));
        if (errJson.error && errJson.error.includes('No native TeX compiler')) {
          // Native compiler not found -> fall through to built-in vector PDF engine
        } else {
          return NextResponse.json(
            {
              success: false,
              error: errJson.error || 'LaTeX compilation failed.',
              line: errJson.line,
              errors: errJson.errors || [],
            },
            { status: 422 }
          );
        }
      }
    } catch {
      // External compiler container is offline or starting -> Seamlessly use built-in vector PDF engine
    }

    // 4. Built-in High-Speed Vector PDF Rendering Engine
    try {
      const pdfBytes = generateSimplePdfFromTex(tex);
      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename=resume.pdf',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Compiler-Engine': 'vector-latex-renderer',
        },
      });
    } catch (fallbackErr: unknown) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to render PDF document.',
          detail: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
        },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected server error occurred during compilation.',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
