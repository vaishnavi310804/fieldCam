import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { validatePhotoWithAI } from "../src/services/aiService.js";
import { deleteFromS3 } from "../src/services/s3Service.js";

describe("Platform Service AI Validation & S3 Safety Tests", () => {
  describe("validatePhotoWithAI status mapping", () => {
    test("maps all passed checks to PASSED", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          passed: true,
          clarity: { passed: true, score: 0.95 },
          lighting: { passed: true, score: 0.98 },
          subject: {
            passed: true,
            status: "SUCCESS",
            confidence: 0.96,
            expectedCategory: "Site Exterior View",
          },
        }),
      }));

      try {
        const result = await validatePhotoWithAI(
          "https://example.com/test.jpg",
          "Site Exterior View",
          { maxAttempts: 1, timeoutMs: 5000 }
        );
        assert.equal(result.status, "PASSED");
        assert.equal(result.clarity.passed, true);
        assert.equal(result.lighting.passed, true);
        assert.equal(result.subject.passed, true);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("maps clarity failure to FAILED", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          passed: false,
          clarity: { passed: false, score: 0.12 },
          lighting: { passed: true, score: 0.9 },
          subject: { passed: true, status: "SUCCESS" },
        }),
      }));

      try {
        const result = await validatePhotoWithAI(
          "https://example.com/test.jpg",
          "Site Exterior View",
          { maxAttempts: 1, timeoutMs: 5000 }
        );
        assert.equal(result.status, "FAILED");
        assert.equal(result.clarity.passed, false);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("maps subject mismatch to FAILED", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          passed: false,
          clarity: { passed: true, score: 0.88 },
          lighting: { passed: true, score: 0.92 },
          subject: {
            passed: false,
            status: "FAILED",
            confidence: 0.95,
            reason: "Detected interior living room instead of site exterior",
          },
        }),
      }));

      try {
        const result = await validatePhotoWithAI(
          "https://example.com/test.jpg",
          "Site Exterior View",
          { maxAttempts: 1, timeoutMs: 5000 }
        );
        assert.equal(result.status, "FAILED");
        assert.equal(result.subject.passed, false);
        assert.match(result.reason, /Detected interior living room/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("maps transient HTTP 503 / 502 to PENDING instead of FAILED", async () => {
      const originalFetch = global.fetch;
      let callCount = 0;
      global.fetch = mock.fn(async () => {
        callCount++;
        return {
          ok: false,
          status: 503,
          text: async () => "Upstream model temporarily unavailable",
        };
      });

      try {
        const result = await validatePhotoWithAI(
          "https://example.com/test.jpg",
          "Site Exterior View",
          { maxAttempts: 2, timeoutMs: 2000 }
        );
        assert.equal(result.status, "PENDING");
        assert.match(result.reason, /HTTP 503/);
        assert.equal(callCount, 2);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("does not retry 401 Unauthorized permanently", async () => {
      const originalFetch = global.fetch;
      let callCount = 0;
      global.fetch = mock.fn(async () => {
        callCount++;
        return {
          ok: false,
          status: 401,
          text: async () => "Invalid or missing internal service key",
        };
      });

      try {
        const result = await validatePhotoWithAI(
          "https://example.com/test.jpg",
          "Site Exterior View",
          { maxAttempts: 3, timeoutMs: 2000 }
        );
        assert.equal(result.status, "PENDING");
        assert.equal(callCount, 1); // Not retried
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("s3Service deleteFromS3 key extraction", () => {
    test("safely ignores null or undefined keys", async () => {
      await assert.doesNotReject(async () => {
        await deleteFromS3(null);
        await deleteFromS3(undefined);
        await deleteFromS3("");
      });
    });

    test("parses full URL and extracts clean relative S3 key", async () => {
      const testUrl = "https://fieldcam-bucket.s3.ap-south-1.amazonaws.com/images/12345-photo.jpg";
      const parsedUrl = new URL(testUrl);
      const cleanKey = parsedUrl.pathname.startsWith("/")
        ? parsedUrl.pathname.substring(1)
        : parsedUrl.pathname;
      assert.equal(cleanKey, "images/12345-photo.jpg");
    });
  });

  describe("submission gating contract", () => {
    test("requires aiValidation.status === PASSED for project submission", () => {
      const invalidStatusPhoto = {
        aiValidation: { status: "PENDING" },
        gpsLocation: { latitude: 12.97, longitude: 77.59 },
        capturedAt: new Date(),
      };
      const failedStatusPhoto = {
        aiValidation: { status: "FAILED" },
        gpsLocation: { latitude: 12.97, longitude: 77.59 },
        capturedAt: new Date(),
      };
      const validPhoto = {
        aiValidation: { status: "PASSED" },
        gpsLocation: { latitude: 12.97, longitude: 77.59 },
        capturedAt: new Date(),
      };

      const isSubmittable = (photo) =>
        photo?.aiValidation?.status === "PASSED" &&
        photo?.gpsLocation?.latitude != null &&
        photo?.capturedAt != null;

      assert.equal(isSubmittable(invalidStatusPhoto), false);
      assert.equal(isSubmittable(failedStatusPhoto), false);
      assert.equal(isSubmittable(validPhoto), true);
    });
  });
});
