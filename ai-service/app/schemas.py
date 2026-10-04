from typing import List, Optional
from pydantic import BaseModel, Field


class ValidationRequest(BaseModel):
    imageUrl: str = Field(..., description="Short-lived HTTP/HTTPS image URL")
    expectedCategory: str = Field(
        ..., description="Expected category/label for photo subject"
    )


class ClarityResult(BaseModel):
    passed: bool
    score: float = Field(..., ge=0.0, le=1.0)
    metric: str = "laplacian_variance"
    laplacianVariance: float


class LightingResult(BaseModel):
    passed: bool
    score: float = Field(..., ge=0.0, le=1.0)
    meanLuminance: float
    issues: List[str] = Field(default_factory=list)


class SubjectResult(BaseModel):
    passed: Optional[bool] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    expectedCategory: str
    detectedDescription: Optional[str] = None
    reason: Optional[str] = None
    status: str = "NOT_IMPLEMENTED"


class ValidationResponse(BaseModel):
    success: bool = True
    passed: bool
    clarity: ClarityResult
    lighting: LightingResult
    subject: SubjectResult


class HealthResponse(BaseModel):
    status: str = "ok"
