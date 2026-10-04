import json
import logging
import io
import cv2
import httpx
import numpy as np
from PIL import Image

from app.config import settings
from app.schemas import (
    ClarityResult,
    LightingResult,
    SubjectResult,
    ValidationResponse,
)

logger = logging.getLogger("ai_service")

# Threshold Configuration
LAPLACIAN_THRESHOLD = 100.0  # Standard OpenCV threshold for blur detection
LUMINANCE_UNDEREXPOSED = 40.0
LUMINANCE_OVEREXPOSED = 215.0


def download_image_bytes(image_url: str) -> bytes:
    """Downloads image bytes from a short-lived HTTP/HTTPS presigned URL."""
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            response = client.get(image_url)
            if response.status_code != 200:
                raise ValueError(
                    f"HTTP GET failed with status code {response.status_code}"
                )
            if not response.content:
                raise ValueError("Downloaded image content is empty")
            return response.content
    except httpx.RequestError as exc:
        raise ValueError(f"Network error while fetching image: {str(exc)}")
    except Exception as exc:
        raise ValueError(f"Failed to download image: {str(exc)}")


def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decodes raw image bytes into a BGR OpenCV NumPy matrix."""
    if not image_bytes:
        raise ValueError("Image bytes cannot be empty")

    # Try decoding with OpenCV
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None or img.size == 0:
        # Fallback to Pillow if OpenCV imdecode fails (e.g. for certain PNG/JPEG formats)
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            raise ValueError("Invalid or corrupted image data")

    if img is None or img.size == 0:
        raise ValueError("Decoded image is empty or corrupted")

    return img


def analyze_clarity(img_gray: np.ndarray) -> ClarityResult:
    """Calculates image sharpness/blur using Laplacian variance."""
    laplacian_var = float(cv2.Laplacian(img_gray, cv2.CV_64F).var())
    passed = laplacian_var >= LAPLACIAN_THRESHOLD

    # Normalize laplacian variance to a [0.0, 1.0] scale (500.0 = full sharpness score)
    score = round(min(1.0, max(0.0, laplacian_var / 500.0)), 2)

    return ClarityResult(
        passed=passed,
        score=score,
        metric="laplacian_variance",
        laplacianVariance=round(laplacian_var, 2),
    )


def analyze_lighting(img_gray: np.ndarray) -> LightingResult:
    """Calculates image lighting quality using mean luminance statistics."""
    mean_lum = float(np.mean(img_gray))
    issues = []

    if mean_lum < LUMINANCE_UNDEREXPOSED:
        issues.append("underexposed")
    if mean_lum > LUMINANCE_OVEREXPOSED:
        issues.append("overexposed")

    passed = len(issues) == 0

    # Calculate normalized lighting score
    if 50.0 <= mean_lum <= 200.0:
        score = 1.0
    elif mean_lum < 50.0:
        score = max(0.0, mean_lum / 50.0)
    else:  # mean_lum > 200.0
        score = max(0.0, (255.0 - mean_lum) / 55.0)

    return LightingResult(
        passed=passed,
        score=round(score, 2),
        meanLuminance=round(mean_lum, 1),
        issues=issues,
    )


def analyze_subject(image_bytes: bytes, expected_category: str) -> SubjectResult:
    """Evaluates if image content matches expected category using Google Gemini Vision API."""
    if not settings.VISION_API_KEY:
        return SubjectResult(
            passed=False,
            confidence=None,
            expectedCategory=expected_category,
            detectedDescription=None,
            reason="Vision API key not configured",
            status="NOT_CONFIGURED",
        )

    mime_type = "image/jpeg"
    if image_bytes.startswith(b"\x89PNG"):
        mime_type = "image/png"
    elif image_bytes.startswith(b"GIF8"):
        mime_type = "image/gif"
    elif image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP":
        mime_type = "image/webp"

    prompt = (
        f"You are an AI photo verification assistant for field inspection compliance.\n"
        f'The user expected photo category is: "{expected_category}".\n\n'
        f"Analyze the image and determine whether it visually matches the expected category.\n"
        f"Respond STRICTLY in JSON format with no markdown syntax wrapping or codeblocks:\n"
        f'{{\n'
        f'  "passed": true/false,\n'
        f'  "confidence": float between 0.0 and 1.0,\n'
        f'  "detectedDescription": "concise description of what is actually present in the photo",\n'
        f'  "reason": "explanation of why it matches or does not match"\n'
        f'}}\n'
    )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.VISION_API_KEY)
        response = client.models.generate_content(
            model=settings.VISION_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text.strip() if response.text else ""
        if not raw_text:
            return SubjectResult(
                passed=False,
                confidence=None,
                expectedCategory=expected_category,
                detectedDescription=None,
                reason="Empty response from vision provider",
                status="ERROR",
            )

        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        data = json.loads(raw_text)

        passed = bool(data.get("passed", False))
        conf_val = data.get("confidence")
        confidence = float(conf_val) if conf_val is not None else None
        if confidence is not None:
            confidence = round(min(1.0, max(0.0, confidence)), 2)

        detected_desc = data.get("detectedDescription")
        reason = data.get("reason")

        return SubjectResult(
            passed=passed,
            confidence=confidence,
            expectedCategory=expected_category,
            detectedDescription=detected_desc,
            reason=reason,
            status="SUCCESS" if passed else "FAILED",
        )
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse vision model response as JSON: %s", str(exc))
        return SubjectResult(
            passed=False,
            confidence=None,
            expectedCategory=expected_category,
            detectedDescription=None,
            reason="Malformed response from vision provider",
            status="ERROR",
        )
    except Exception as exc:
        logger.error("Vision provider request failed: %s", str(exc))
        return SubjectResult(
            passed=False,
            confidence=None,
            expectedCategory=expected_category,
            detectedDescription=None,
            reason=f"Vision API request failed: {str(exc)}",
            status="ERROR",
        )


def process_image(image_bytes: bytes, expected_category: str) -> ValidationResponse:
    """Decodes image bytes and evaluates clarity, lighting, and subject readiness."""
    img_bgr = decode_image(image_bytes)
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    clarity_res = analyze_clarity(img_gray)
    lighting_res = analyze_lighting(img_gray)
    subject_res = analyze_subject(image_bytes, expected_category)

    # Overall passed represents clarity.passed AND lighting.passed AND (subject_res.passed is True)
    overall_passed = (
        clarity_res.passed
        and lighting_res.passed
        and (subject_res.passed is True)
    )

    return ValidationResponse(
        success=True,
        passed=overall_passed,
        clarity=clarity_res,
        lighting=lighting_res,
        subject=subject_res,
    )
