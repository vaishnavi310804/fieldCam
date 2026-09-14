import {
  createUserByAdmin,
  verifyRegistrationOTP,
  completeProfile,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "./auth.service.js";

export const createUserByAdminController = async (req, res) => {
  try {
    const result = await createUserByAdmin(req.body);
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const verifyRegistrationOTPController = async (req, res) => {
  try {
    const result = await verifyRegistrationOTP(req.body);
    return res.status(200).json({
      success: true,
      message: "Registration OTP verified successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const completeProfileController = async (req, res) => {
  try {
    const result = await completeProfile(req.body);
    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const result = await forgotPassword(req.body);
    return res.status(200).json({
      success: true,
      message: "Password reset OTP generated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const verifyResetOTPController = async (req, res) => {
  try {
    const result = await verifyResetOTP(req.body);
    return res.status(200).json({
      success: true,
      message: "Reset OTP verified successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const result = await resetPassword(req.body);
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
