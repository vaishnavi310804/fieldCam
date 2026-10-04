import logging
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import ValidationError

from app.config import settings
from app.schemas import HealthResponse, ValidationRequest, ValidationResponse
from app.vision_service import download_image_bytes, process_image

logger = logging.getLogger("ai_service")
router = APIRouter()


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
def get_health():
    """Unauthenticated healthcheck endpoint."""
    return HealthResponse(status="ok")


@router.post(
    "/validate-photo",
    response_model=ValidationResponse,
    status_code=status.HTTP_200_OK,
)
def validate_photo(
    payload: ValidationRequest,
    x_internal_service_key: str = Header(None, alias="X-Internal-Service-Key"),
):
    """Analyzes photo clarity and lighting quality from a presigned image URL."""
    # 1. Service-to-Service Security Check
    if not x_internal_service_key or x_internal_service_key != settings.AI_SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service key",
        )

    # 2. Download Image
    try:
        image_bytes = download_image_bytes(payload.imageUrl)
    except ValueError as val_err:
        logger.warning("Image download/fetch error: %s", str(val_err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process image URL: {str(val_err)}",
        )
    except Exception as exc:
        logger.error("Unexpected error during image download: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image download failed",
        )

    # 3. Analyze Image
    try:
        result = process_image(image_bytes, payload.expectedCategory)
        return result
    except ValueError as val_err:
        logger.warning("Image decoding/analysis error: %s", str(val_err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image: {str(val_err)}",
        )
    except Exception as exc:
        logger.error("Unexpected error during vision analysis: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Image analysis processing error",
        )
