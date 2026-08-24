import base64
import os
from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from .models import CompileRequest, CompileErrorResponse, HealthResponse
from .validators import validate_latex_safety
from .compiler import compile_latex_document, detect_available_engines

app = FastAPI(
    title="ResumeForge Isolated LaTeX Compiler Service",
    version="1.0.0",
    docs_url="/docs" if os.environ.get("ENV") != "production" else None,
    redoc_url=None
)

# Enable CORS for Next.js backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def health_check():
    engines = detect_available_engines()
    active_engine = "tectonic" if engines["tectonic"] else ("pdflatex" if engines["pdflatex"] else "none")
    return HealthResponse(
        status="healthy" if active_engine != "none" else "degraded (no engine)",
        engine=active_engine,
        tectonic_available=engines["tectonic"],
        pdflatex_available=engines["pdflatex"],
        version="1.0.0"
    )

@app.post("/compile")
async def compile_endpoint(request: CompileRequest):
    # 1. Defense-in-depth safety check
    is_safe, safety_err = validate_latex_safety(request.tex)
    if not is_safe:
        return Response(
            content=CompileErrorResponse(
                success=False,
                error=safety_err or "Security validation failed.",
                line=1
            ).model_dump_json(),
            status_code=status.HTTP_400_BAD_REQUEST,
            media_type="application/json"
        )

    # 2. Compile document in sandbox
    result = compile_latex_document(
        tex_source=request.tex,
        engine=request.engine or "tectonic"
    )

    # 3. Handle compilation failure
    if not result.get("success"):
        return Response(
            content=CompileErrorResponse(
                success=False,
                error=result.get("error", "Compilation failed."),
                line=result.get("line"),
                errors=result.get("errors", []),
                duration_ms=result.get("duration_ms")
            ).model_dump_json(),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            media_type="application/json"
        )

    # 4. Handle success response
    pdf_bytes = result["pdf_bytes"]
    duration_ms = str(round(result.get("duration_ms", 0), 2))

    if request.return_base64:
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
        return {
            "success": True,
            "pdf_base64": pdf_b64,
            "duration_ms": result.get("duration_ms")
        }

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "X-Duration-Ms": duration_ms,
            "Content-Disposition": "inline; filename=resume.pdf",
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
