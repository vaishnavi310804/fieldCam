import {
  registerOrUpdateDeviceTokenService,
  deactivateDeviceTokenService,
} from "./deviceToken.service.js";

export const registerDeviceTokenController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deviceToken, platform } = req.body;

    const result = await registerOrUpdateDeviceTokenService({
      userId,
      deviceToken,
      platform,
    });

    return res.status(200).json({
      success: true,
      message: "Device token registered successfully",
      data: {
        status: result.status,
        platform: result.data.platform,
        isActive: result.data.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const unregisterDeviceTokenController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deviceToken } = req.body;

    const success = await deactivateDeviceTokenService({
      userId,
      deviceToken,
    });

    return res.status(200).json({
      success: true,
      message: success
        ? "Device token deactivated successfully"
        : "Device token not found or already deactivated",
    });
  } catch (error) {
    next(error);
  }
};
