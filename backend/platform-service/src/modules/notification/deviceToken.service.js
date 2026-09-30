import DeviceToken from "./deviceToken.model.js";

/**
 * Register or update a device registration token.
 * Idempotent: Handles initial registration, repeated logins, token refreshes, and multi-device ownership.
 */
export const registerOrUpdateDeviceTokenService = async ({
  userId,
  deviceToken,
  platform = "android",
}) => {
  const cleanToken = deviceToken.trim();
  const cleanPlatform = platform.toLowerCase() === "ios" ? "ios" : "android";

  // Check if this token is already registered in the database
  const existingRecord = await DeviceToken.findOne({ deviceToken: cleanToken });

  if (!existingRecord) {
    // Case A: First registration of this device token
    const newRecord = await DeviceToken.create({
      userId,
      deviceToken: cleanToken,
      platform: cleanPlatform,
      isActive: true,
      lastSeenAt: new Date(),
    });

    return { status: "created", data: newRecord };
  }

  // Case B: Token already registered to the SAME user
  if (existingRecord.userId.toString() === userId.toString()) {
    existingRecord.isActive = true;
    existingRecord.platform = cleanPlatform;
    existingRecord.lastSeenAt = new Date();
    await existingRecord.save();

    return { status: "updated", data: existingRecord };
  }

  // Case C: Token was previously registered to another user (Device handover / Reassignment)
  // Reassign ownership to current authenticated user securely
  existingRecord.userId = userId;
  existingRecord.platform = cleanPlatform;
  existingRecord.isActive = true;
  existingRecord.lastSeenAt = new Date();
  await existingRecord.save();

  return { status: "reassigned", data: existingRecord };
};

/**
 * Deactivate a device registration token for an authenticated user.
 */
export const deactivateDeviceTokenService = async ({ userId, deviceToken }) => {
  const cleanToken = deviceToken.trim();

  const record = await DeviceToken.findOne({
    userId,
    deviceToken: cleanToken,
  });

  if (!record) {
    return false;
  }

  record.isActive = false;
  record.lastSeenAt = new Date();
  await record.save();

  return true;
};

/**
 * Retrieve active device registration tokens for a given user (Internal Service Method).
 */
export const getActiveDeviceTokensService = async (userId) => {
  const activeTokens = await DeviceToken.find({
    userId,
    isActive: true,
  }).select("deviceToken platform -_id");

  return activeTokens;
};
