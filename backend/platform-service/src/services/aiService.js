/**
 * Service client for standalone ai-service (/validate-photo).
 */

/**
 * Validates a photo with the standalone AI microservice.
 * @param {string} imageUrl - Short-lived presigned GET URL for the image stored in S3
 * @param {string} expectedCategory - Expected category / checklist item label
 * @returns {Promise<Object>} Formatted aiValidation object for photo record
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Status codes that indicate transient infrastructure/upstream failures
const TRANSIENT_HTTP_STATUSES = new Set([502, 503, 504]);

/**
 * Validates a photo with the standalone AI microservice.
 * Includes bounded retries with backoff for transient network and 502/503/504 gateway failures.
 * Does NOT retry permanent client errors (e.g. 400 Bad Request, 401 Unauthorized, 404, 422).
 *
 * @param {string} imageUrl - Short-lived presigned GET URL for the image stored in S3
 * @param {string} expectedCategory - Expected category / checklist item label
 * @param {Object} [options]
 * @param {number} [options.maxAttempts=3] - Maximum retry attempts for transient failures
 * @param {number} [options.timeoutMs=25000] - Request timeout per attempt in ms
 * @returns {Promise<Object>} Formatted aiValidation object for photo record
 */
export const validatePhotoWithAI = async (
  imageUrl,
  expectedCategory,
  options = {}
) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
  const aiServiceSecret = process.env.AI_SERVICE_SECRET || "";

  const endpoint = `${aiServiceUrl.replace(/\/+$/, "")}/validate-photo`;
  const maxAttempts = options.maxAttempts || 2;
  const timeoutMs = options.timeoutMs || 12000;

  let lastStatus = null;
  let lastErrorText = "";
  let lastExceptionMsg = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Service-Key": aiServiceSecret,
        },
        body: JSON.stringify({
          imageUrl,
          expectedCategory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        lastStatus = response.status;
        lastErrorText = await response.text().catch(() => "");
        console.warn(
          `ai-service returned non-200 status ${response.status} (attempt ${attempt}/${maxAttempts}): ${lastErrorText}`
        );

        // Only retry transient 502/503/504 gateway/service errors
        if (TRANSIENT_HTTP_STATUSES.has(response.status) && attempt < maxAttempts) {
          const backoffMs = attempt * 1500;
          await sleep(backoffMs);
          continue;
        }

        return {
          status: "PENDING",
          reason: `AI service returned HTTP ${response.status}`,
          validatedAt: new Date(),
        };
      }

      const data = await response.json();

      // Determine overall validation status:
      // PASSED: data.passed === true (clarity, lighting, and subject all passed)
      // FAILED: clarity failed OR lighting failed OR subject explicitly failed validation
      // PENDING: subject was NOT_CONFIGURED or ERROR, or request/response incomplete
      let status = "PENDING";
      if (data.passed === true) {
        status = "PASSED";
      } else if (
        data.clarity?.passed === false ||
        data.lighting?.passed === false ||
        (data.subject?.passed === false && data.subject?.status === "FAILED")
      ) {
        status = "FAILED";
      } else {
        status = "PENDING";
      }

      return {
        status,
        clarity: data.clarity
          ? {
              passed: Boolean(data.clarity.passed),
              score: typeof data.clarity.score === "number" ? data.clarity.score : 0,
            }
          : undefined,
        lighting: data.lighting
          ? {
              passed: Boolean(data.lighting.passed),
              score: typeof data.lighting.score === "number" ? data.lighting.score : 0,
            }
          : undefined,
        subject: data.subject
          ? {
              passed: typeof data.subject.passed === "boolean" ? data.subject.passed : undefined,
              confidence: typeof data.subject.confidence === "number" ? data.subject.confidence : undefined,
              expectedCategory: data.subject.expectedCategory || expectedCategory,
              detectedDescription: data.subject.detectedDescription || undefined,
              reason: data.subject.reason || undefined,
            }
          : undefined,
        reason: data.subject?.reason || (status === "FAILED" ? "AI photo validation failed" : undefined),
        validatedAt: new Date(),
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      lastExceptionMsg = isTimeout ? "AI service request timed out" : err.message;
      console.warn(
        `ai-service call failed (attempt ${attempt}/${maxAttempts}):`,
        lastExceptionMsg
      );

      if (attempt < maxAttempts) {
        const backoffMs = attempt * 1500;
        await sleep(backoffMs);
        continue;
      }

      return {
        status: "PENDING",
        reason: `AI service unavailable: ${lastExceptionMsg}`,
        validatedAt: new Date(),
      };
    }
  }

  return {
    status: "PENDING",
    reason: lastStatus
      ? `AI service returned HTTP ${lastStatus}`
      : `AI service unavailable: ${lastExceptionMsg || "unknown error"}`,
    validatedAt: new Date(),
  };
};
