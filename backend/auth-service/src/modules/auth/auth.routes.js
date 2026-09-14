import { Router } from "express";

import {
  createUserByAdminController,
  verifyRegistrationOTPController,
  completeProfileController,
  loginController,
  forgotPasswordController,
  verifyResetOTPController,
  resetPasswordController,
} from "./auth.controller.js";

import {
  createUserByAdminValidation,
  verifyRegistrationOtpValidation,
  completeProfileValidation,
  loginValidation,
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
  loginValidation,
  validate,
  loginController
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