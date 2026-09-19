import { Router } from "express";

import {
  createUserByAdminController,
  verifyRegistrationOTPController,
  completeProfileController,
  webLoginController,
  mobileLoginController,
  forgotPasswordController,
  verifyResetOTPController,
  resetPasswordController,
} from "./auth.controller.js";

import {
  createUserByAdminValidation,
  verifyRegistrationOtpValidation,
  completeProfileValidation,
  webLoginValidation,
  mobileLoginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
} from "./auth.validation.js";

import validate from "../../middleware/validate.js";

const router = Router();

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