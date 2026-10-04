# FieldCam AI Service (`ai-service`)

A lightweight, standalone Python + FastAPI microservice responsible exclusively for **image quality analysis** (clarity/blur detection and lighting assessment) and **visual subject/category recognition** for the FieldCam platform.

---

## 🎯 1. What `ai-service` Does

- Downloads field photos from short-lived presigned HTTP/HTTPS URLs.
- Evaluates image **clarity / sharpness** using Laplacian variance metrics.
- Evaluates image **lighting quality** using mean luminance statistics (detecting underexposure and overexposure).
- Evaluates **visual subject / category match** using Google Gemini Vision AI (`gemini-1.5-flash`).
- Returns objective image quality assessment metrics and structured subject verification.
- Enforces service-to-service header security via `X-Internal-Service-Key`.

---

## 🚫 2. What `ai-service` Does NOT Do

- **NO** database interaction (MongoDB, SQL, etc.).
- **NO** user authentication (JWT, Firebase Admin, passwords).
- **NO** business logic or project state management.
- **NO** GPS or geofence calculation (handled by `platform-service`).
- **NO** capture timestamp age validation (handled by `platform-service`).
- **NO** submission gating or project authorization (handled by `platform-service`).
- **NO** fake AI probabilities or artificial confidence scores.

> [!IMPORTANT]
> `platform-service` remains the sole business authority for project state, ownership, GPS validation, timestamps, checklist prerequisites, and final submission gating.

---

## ⚙️ 3. Environment Variables

Create a `.env` file in `ai-service/`:

```env
PORT=8000
AI_SERVICE_SECRET=change-me
VISION_API_KEY=your-gemini-api-key-here
VISION_MODEL=gemini-1.5-flash
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Uvicorn server | `8000` |
| `AI_SERVICE_SECRET` | Secret key expected in `X-Internal-Service-Key` header | `change-me` |
| `VISION_API_KEY` | API Key for Google Gemini Vision AI | `""` |
| `VISION_MODEL` | Google Gemini Vision Model identifier | `gemini-1.5-flash` |

---

## 🛠️ 4. Local Setup & Running

### Prerequisites
- Python 3.10+ installed.

### Setup Steps
```bash
cd ai-service

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m app.main
# or
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📡 5. API Endpoints

### 1. Healthcheck: `GET /health`
- **Auth:** None (Unauthenticated)
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```

### 2. Validate Photo: `POST /validate-photo`
- **Auth:** Required Header: `X-Internal-Service-Key: <AI_SERVICE_SECRET>`
- **Request Body Example:**
  ```json
  {
    "imageUrl": "https://fieldcam-media.s3.amazonaws.com/images/sample.jpg?X-Amz-Algorithm=...",
    "expectedCategory": "Roof Inspection"
  }
  ```
- **Response Body Example:**
  ```json
  {
    "success": true,
    "passed": true,
    "clarity": {
      "passed": true,
      "score": 0.82,
      "metric": "laplacian_variance",
      "laplacianVariance": 412.5
    },
    "lighting": {
      "passed": true,
      "score": 1.0,
      "meanLuminance": 127.4,
      "issues": []
    },
    "subject": {
      "passed": true,
      "confidence": 0.95,
      "expectedCategory": "Roof Inspection",
      "detectedDescription": "A roof showing inspection tiles and drainage gutters",
      "reason": "Matches expected roof inspection category",
      "status": "SUCCESS"
    }
  }
  ```

---

## 🔬 6. Image Analysis & Subject Verification Methodology

1. **Clarity (Sharpness):**
   - Converts image matrix to grayscale.
   - Calculates Laplacian variance ($\text{Var}(\Delta I)$).
   - **Threshold:** $\ge 100.0$ passes blur test.
   - **Normalized Score:** $\min(1.0, \text{variance} / 500.0)$.
2. **Lighting Quality:**
   - Computes grayscale mean luminance ($\mu \in [0, 255]$).
   - **Underexposure Issue:** $\mu < 40.0$.
   - **Overexposure Issue:** $\mu > 215.0$.
   - **Ideal Luminance Range:** $50.0 \le \mu \le 200.0$ yields score $1.0$.
3. **Visual Subject Recognition:**
   - Sends image bytes and `expectedCategory` to Google Gemini Vision API (`gemini-1.5-flash`).
   - Receives structured JSON response with `passed`, `confidence`, `detectedDescription`, and `reason`.
   - Overall photo validation `passed = clarity.passed AND lighting.passed AND (subject.passed is True)`.
   - If `VISION_API_KEY` is not set, `analyze_subject` returns `passed=False` with `reason="Vision API key not configured"` without crashing.

---

## 🧪 7. Running Tests

Run pytest from `ai-service/` root:

```bash
python -m pytest -v
```

All unit tests use mocked Vision API responses (no external/paid network calls during unit testing).

---

## 🐳 8. Docker Usage

### Build Container
```bash
docker build -t fieldcam-ai-service .
```

### Run Container
```bash
docker run -p 8000:8000 -e AI_SERVICE_SECRET=change-me -e VISION_API_KEY=your-key fieldcam-ai-service
```
