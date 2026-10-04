import io
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw, ImageFilter

from app.config import settings
from app.main import app

client = TestClient(app)
VALID_KEY = settings.AI_SERVICE_SECRET


def create_synthetic_image(mode: str) -> bytes:
    """Generates synthetic JPEG image bytes in memory for deterministic testing."""
    if mode == "sharp":
        img = Image.new("RGB", (400, 400), color=(200, 200, 200))
        draw = ImageDraw.Draw(img)
        # Draw high-contrast sharp checkerboard grid & text
        for i in range(0, 400, 20):
            draw.line([(i, 0), (i, 400)], fill=(0, 0, 0), width=2)
            draw.line([(0, i), (400, i)], fill=(0, 0, 0), width=2)
        draw.text((50, 50), "FIELDCAM SHARP TEST IMAGE", fill=(0, 0, 0))
    elif mode == "blurred":
        img = Image.new("RGB", (400, 400), color=(128, 128, 128))
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 350, 350], fill=(255, 255, 255))
        img = img.filter(ImageFilter.GaussianBlur(radius=25))
    elif mode == "dark":
        img = Image.new("RGB", (400, 400), color=(10, 10, 10))
    elif mode == "bright":
        img = Image.new("RGB", (400, 400), color=(245, 245, 245))
    else:
        img = Image.new("RGB", (100, 100), color=(128, 128, 128))

    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


# 1. GET /health -> 200
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# 2. POST /validate-photo without service key -> 401
def test_validate_photo_missing_key():
    response = client.post(
        "/validate-photo",
        json={"imageUrl": "https://example.com/test.jpg", "expectedCategory": "Roof"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or missing internal service key"


# 3. POST /validate-photo with wrong service key -> 401
def test_validate_photo_wrong_key():
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": "wrong-secret-key"},
        json={"imageUrl": "https://example.com/test.jpg", "expectedCategory": "Roof"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or missing internal service key"


# 4. POST /validate-photo with valid key but missing imageUrl -> 422
def test_validate_photo_missing_image_url():
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={"expectedCategory": "Roof"},
    )
    assert response.status_code == 422


# 5. POST /validate-photo with valid key but missing expectedCategory -> 422
def test_validate_photo_missing_expected_category():
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={"imageUrl": "https://example.com/test.jpg"},
    )
    assert response.status_code == 422


# 6. Invalid image URL -> clean error
@patch("app.routes.download_image_bytes")
def test_invalid_image_url_download_failure(mock_download):
    mock_download.side_effect = ValueError("Network error while fetching image: 404 Not Found")
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/non-existent.jpg",
            "expectedCategory": "Roof",
        },
    )
    assert response.status_code == 400
    assert "Failed to process image URL" in response.json()["detail"]


# 7. Corrupted/invalid image -> clean error
@patch("app.routes.download_image_bytes")
def test_corrupted_image_failure(mock_download):
    mock_download.return_value = b"corrupted-non-image-binary-content"
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/corrupted.jpg",
            "expectedCategory": "Roof",
        },
    )
    assert response.status_code == 400
    assert "Invalid or corrupted image" in response.json()["detail"]


# 8. Real sharp synthetic image with missing API key -> clarity passes, subject unconfigured, overall fails
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "")
def test_sharp_image_missing_vision_key(mock_download):
    mock_download.return_value = create_synthetic_image("sharp")
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/sharp.jpg",
            "expectedCategory": "Roof Inspection",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["clarity"]["passed"] is True
    assert data["lighting"]["passed"] is True
    assert data["subject"]["passed"] is False
    assert data["subject"]["reason"] == "Vision API key not configured"
    assert data["subject"]["status"] == "NOT_CONFIGURED"
    assert data["passed"] is False


# 9. Blurred synthetic image -> clarity fails, overall fails
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "")
def test_blurred_image_clarity(mock_download):
    mock_download.return_value = create_synthetic_image("blurred")
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/blurred.jpg",
            "expectedCategory": "Roof Inspection",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["clarity"]["passed"] is False
    assert data["passed"] is False


# 10. Dark synthetic image -> lighting fails, overall fails
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "")
def test_dark_image_lighting(mock_download):
    mock_download.return_value = create_synthetic_image("dark")
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/dark.jpg",
            "expectedCategory": "Main Entrance",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["lighting"]["passed"] is False
    assert "underexposed" in data["lighting"]["issues"]
    assert data["passed"] is False


# 11. Bright synthetic image -> lighting fails, overall fails
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "")
def test_bright_image_lighting(mock_download):
    mock_download.return_value = create_synthetic_image("bright")
    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/bright.jpg",
            "expectedCategory": "Main Entrance",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["lighting"]["passed"] is False
    assert "overexposed" in data["lighting"]["issues"]
    assert data["passed"] is False


# 12. Mocked Vision Provider - Category Match -> passed=True, overall passed=True
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "mock-api-key")
@patch("google.genai.Client")
def test_subject_match(mock_genai_client, mock_download):
    mock_download.return_value = create_synthetic_image("sharp")

    mock_response = MagicMock()
    mock_response.text = '{"passed": true, "confidence": 0.95, "detectedDescription": "A roof showing inspection tiles", "reason": "Matches roof category"}'

    mock_client_instance = MagicMock()
    mock_client_instance.models.generate_content.return_value = mock_response
    mock_genai_client.return_value = mock_client_instance

    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/roof.jpg",
            "expectedCategory": "Roof Inspection",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["clarity"]["passed"] is True
    assert data["lighting"]["passed"] is True
    assert data["subject"]["passed"] is True
    assert data["subject"]["confidence"] == 0.95
    assert data["subject"]["detectedDescription"] == "A roof showing inspection tiles"
    assert data["subject"]["reason"] == "Matches roof category"
    assert data["subject"]["status"] == "SUCCESS"
    assert data["passed"] is True


# 13. Mocked Vision Provider - Category Mismatch -> passed=False, overall passed=False
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "mock-api-key")
@patch("google.genai.Client")
def test_subject_mismatch(mock_genai_client, mock_download):
    mock_download.return_value = create_synthetic_image("sharp")

    mock_response = MagicMock()
    mock_response.text = '{"passed": false, "confidence": 0.88, "detectedDescription": "A close up photo of a cat", "reason": "Expected roof but photo shows a cat"}'

    mock_client_instance = MagicMock()
    mock_client_instance.models.generate_content.return_value = mock_response
    mock_genai_client.return_value = mock_client_instance

    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/cat.jpg",
            "expectedCategory": "Roof Inspection",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["clarity"]["passed"] is True
    assert data["lighting"]["passed"] is True
    assert data["subject"]["passed"] is False
    assert data["subject"]["confidence"] == 0.88
    assert data["subject"]["detectedDescription"] == "A close up photo of a cat"
    assert data["subject"]["status"] == "FAILED"
    assert data["passed"] is False


# 14. Mocked Vision Provider - Provider API Exception Handling -> graceful error return
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "mock-api-key")
@patch("google.genai.Client")
def test_subject_provider_error(mock_genai_client, mock_download):
    mock_download.return_value = create_synthetic_image("sharp")

    mock_client_instance = MagicMock()
    mock_client_instance.models.generate_content.side_effect = Exception("API rate limit exceeded")
    mock_genai_client.return_value = mock_client_instance

    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/test.jpg",
            "expectedCategory": "Roof Inspection",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["subject"]["passed"] is False
    assert "Vision API request failed" in data["subject"]["reason"]
    assert data["subject"]["status"] == "ERROR"
    assert data["passed"] is False


# 15. Mocked Vision Provider - Malformed JSON Response -> graceful error return
@patch("app.routes.download_image_bytes")
@patch("app.vision_service.settings.VISION_API_KEY", "mock-api-key")
@patch("google.genai.Client")
def test_subject_malformed_json(mock_genai_client, mock_download):
    mock_download.return_value = create_synthetic_image("sharp")

    mock_response = MagicMock()
    mock_response.text = 'This is plain text and not JSON'

    mock_client_instance = MagicMock()
    mock_client_instance.models.generate_content.return_value = mock_response
    mock_genai_client.return_value = mock_client_instance

    response = client.post(
        "/validate-photo",
        headers={"X-Internal-Service-Key": VALID_KEY},
        json={
            "imageUrl": "https://example.com/test.jpg",
            "expectedCategory": "Roof Inspection",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["subject"]["passed"] is False
    assert data["subject"]["reason"] == "Malformed response from vision provider"
    assert data["subject"]["status"] == "ERROR"
    assert data["passed"] is False
