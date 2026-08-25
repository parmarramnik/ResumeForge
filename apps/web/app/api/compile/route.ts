import { NextRequest, NextResponse } from 'next/server';
import { compileRequestSchema } from '@resumeforge/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import crypto from 'crypto';

const COMPILER_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';

// High-speed in-memory compilation cache (up to 100 recent documents)
const pdfCache = new Map<string, { buffer: ArrayBuffer; duration: string; engine: string }>();

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting per IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 120, 60 * 1000); // 120 compiles per minute for fast interactive editing

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
    const requestedEngine = engine || 'pdflatex';

    // 3. Check High-Speed In-Memory Cache (0ms Instant Hit)
    const cacheKey = crypto.createHash('sha256').update(`${requestedEngine}:${tex}`).digest('hex');
    const cached = pdfCache.get(cacheKey);

    if (cached) {
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename=resume.pdf',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Duration-Ms': '0',
          'X-Compiler-Engine': cached.engine,
          'X-Cache-Hit': 'true',
        },
      });
    }

    // 4. Proxy to Isolated LaTeX Compiler Microservice
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const compilerRes = await fetch(`${COMPILER_URL}/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tex,
          engine: requestedEngine,
          return_base64: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (compilerRes.ok) {
        const pdfArrayBuffer = await compilerRes.arrayBuffer();
        const duration = compilerRes.headers.get('x-duration-ms') || '0';
        const usedEngine = compilerRes.headers.get('x-compiler-engine') || requestedEngine;

        // Store in cache (evict oldest if cache exceeds 100 items)
        if (pdfCache.size >= 100) {
          const firstKey = pdfCache.keys().next().value;
          if (firstKey) pdfCache.delete(firstKey);
        }
        pdfCache.set(cacheKey, { buffer: pdfArrayBuffer, duration, engine: usedEngine });

        return new NextResponse(pdfArrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=resume.pdf',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Duration-Ms': duration,
            'X-Compiler-Engine': usedEngine,
          },
        });
      }

      // Handle LaTeX syntax error response
      const errJson = await compilerRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errJson.error || 'LaTeX compilation failed.',
          line: errJson.line,
          errors: errJson.errors || [],
          raw_log: errJson.raw_log,
        },
        { status: compilerRes.status || 422 }
      );
    } catch (fetchErr: unknown) {
      return NextResponse.json(
        {
          success: false,
          error: 'LaTeX Compiler microservice is unreachable. Please make sure the compiler container is running on port 8000.',
          detail: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
        },
        { status: 503 }
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
