import { Router } from "express";

import {
  createUserByAdminController,
  sendRegistrationOTPController,
  verifyRegistrationOTPController,
  completeProfileController,
  webLoginController,
  mobileLoginController,
  forgotPasswordController,
  verifyResetOTPController,
  resetPasswordController,
  getProfileController,
  updateProfileController,
} from "./auth.controller.js";

import {
  createUserByAdminValidation,
  sendRegistrationOtpEmailValidation,
  verifyRegistrationOtpValidation,
  completeProfileValidation,
  webLoginValidation,
  mobileLoginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from "./auth.validation.js";

import validate from "../../middleware/validate.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", protect, getProfileController);
router.put(
  "/me",
  protect,
  updateProfileValidation,
  validate,
  updateProfileController
);

router.post(
  "/send-registration-otp",
  sendRegistrationOtpEmailValidation,
  validate,
  sendRegistrationOTPController
);

router.post(
  "/users",
  createUserByAdminValidation,
  validate,
  createUserByAdminController
);

router.post(
  "/verify-registration-otp",
  verifyRegistrationOtpValidation,
  validate,
  verifyRegistrationOTPController
);

router.post(
  "/complete-profile",
  completeProfileValidation,
  validate,
  completeProfileController
);

router.post(
  "/login",
  webLoginValidation,
  validate,
  webLoginController
);

router.post(
  "/mobile/login",
  mobileLoginValidation,
  validate,
  mobileLoginController
);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPasswordController
);

router.post(
  "/verify-reset-otp",
  verifyResetOTPValidation,
  validate,
  verifyResetOTPController
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPasswordController
);

export default router;