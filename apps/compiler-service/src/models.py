from pydantic import BaseModel, Field
from typing import Optional, List

class CompileRequest(BaseModel):
    tex: str = Field(..., min_length=10, max_length=2000000, description="Raw LaTeX document")
    engine: Optional[str] = Field("tectonic", description="Compilation engine: tectonic or pdflatex")
    return_base64: Optional[bool] = Field(False, description="Return base64 encoded PDF instead of binary stream")

class CompileErrorItem(BaseModel):
    line: Optional[int] = None
    message: str
    raw: Optional[str] = None

class CompileErrorResponse(BaseModel):
    success: bool = False
    error: str
    line: Optional[int] = None
    errors: List[CompileErrorItem] = []
    duration_ms: Optional[float] = None

class HealthResponse(BaseModel):
    status: str
    engine: str
    tectonic_available: bool
    pdflatex_available: bool
    version: str
