import { body } from "express-validator";

// Admin creates a new user account
export const createUserByAdminValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"])
    .withMessage("Invalid role"),

  body("companyId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid company ID"),
];


// Web login
export const webLoginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];


// Mobile login
export const mobileLoginValidation = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];


// Verify registration OTP
export const verifyRegistrationOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits.")
    .isNumeric()
    .withMessage("OTP must contain only numbers."),
];


// Complete onboarding/profile
export const completeProfileValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("profileImage")
    .optional()
    .isString()
    .withMessage("Profile image must be a valid string"),
];


// Forgot password
export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email."),
];


// Verify password reset OTP
export const verifyResetOTPValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits.")
    .isNumeric()
    .withMessage("OTP must contain only numbers."),
];


// Reset password
export const resetPasswordValidation = [
  body("resetToken")
    .notEmpty()
    .withMessage("Reset token is required."),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];