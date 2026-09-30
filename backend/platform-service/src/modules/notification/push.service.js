import { getMessaging } from "firebase-admin/messaging";
import firebaseAdminApp from "../../config/firebaseAdmin.js";
import {
  getActiveDeviceTokensService,
  deactivateDeviceTokenService,
} from "./deviceToken.service.js";

/**
 * Normalize data object values to Strings for FCM data payload compliance.
 * MongoDB notification.data retains its original structured types.
 */
const normalizeFcmDataPayload = (dataObj = {}) => {
  const normalized = {};
  if (!dataObj || typeof dataObj !== "object") return normalized;

  for (const [key, value] of Object.entries(dataObj)) {
    if (value !== null && value !== undefined) {
      if (typeof value === "object") {
        normalized[key] = JSON.stringify(value);
      } else {
        normalized[key] = String(value);
      }
    }
  }

  return normalized;
};

/**
 * Send FCM push notification to all active registered devices of a recipient user.
 * Isolated: Failures do NOT interrupt calling functions or business logic.
 */
export const sendPushNotificationForUser = async ({
  userId,
  title,
  body,
  type = "SYSTEM",
  data = {},
}) => {
  try {
    if (!firebaseAdminApp) {
      console.warn("[FCM Push] Firebase Admin app not initialized. Skipping push delivery.");
      return { attempted: 0, successCount: 0, failureCount: 0 };
    }

    const activeTokensRecords = await getActiveDeviceTokensService(userId);
    if (!activeTokensRecords || activeTokensRecords.length === 0) {
      console.log(`[FCM Push] No active device tokens found for user ${userId}. Skipping push.`);
      return { attempted: 0, successCount: 0, failureCount: 0 };
    }

    const tokens = activeTokensRecords.map((record) => record.deviceToken);
    console.log(
      `[FCM Push] Preparing push delivery to user ${userId} across ${tokens.length} active device(s)...`
    );

    const messaging = getMessaging(firebaseAdminApp);
    const normalizedData = normalizeFcmDataPayload({
      ...data,
      type,
    });

    const multicastPayload = {
      tokens,
      notification: {
        title,
        body,
      },
      data: normalizedData,
    };

    const batchResponse = await messaging.sendEachForMulticast(multicastPayload);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < batchResponse.responses.length; i++) {
      const response = batchResponse.responses[i];
      const targetToken = tokens[i];

      if (response.success) {
        successCount++;
      } else {
        failureCount++;
        const error = response.error;
        const errorCode = error ? error.code : "unknown";

        console.warn(
          `[FCM Push] Delivery failed for token ending in ...${targetToken.slice(-6)}: ${errorCode}`
        );

        // Deactivate token if Firebase reports it as invalid or unregistered
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          console.log(
            `[FCM Push] Deactivating invalid/unregistered token ...${targetToken.slice(-6)}`
          );
          await deactivateDeviceTokenService({
            userId,
            deviceToken: targetToken,
          }).catch((err) =>
            console.error("[FCM Push] Token deactivation error:", err.message)
          );
        }
      }
    }

    console.log(
      `[FCM Push] Result for user ${userId}: ${successCount} succeeded, ${failureCount} failed out of ${tokens.length} total.`
    );

    return {
      attempted: tokens.length,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error(`[FCM Push] Unexpected error during push delivery for user ${userId}:`, error.message);
    return { attempted: 0, successCount: 0, failureCount: 1, error: error.message };
  }
};
