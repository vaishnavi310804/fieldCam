import { body, param } from "express-validator";

const ALLOWED_STATUSES = ["Active", "Suspended", "Inactive"];

export const createVendorValidation = [
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ObjectId"),

  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),

  body("contactName")
    .trim()
    .notEmpty()
    .withMessage("Contact name is required"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required"),

  body("initials")
    .optional()
    .trim()
    .isString()
    .withMessage("Initials must be a string"),

  body("avatarBg")
    .optional()
    .isString()
    .withMessage("Avatar background color must be a valid string"),

  body("services")
    .optional()
    .isArray()
    .withMessage("Services must be an array of strings"),

  body("services.*")
    .optional()
    .isString()
    .withMessage("Each service name must be a string"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be a number between 0 and 5"),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("joinedDate")
    .optional()
    .isISO8601()
    .withMessage("Joined date must be a valid ISO date string"),

  body("planId")
    .notEmpty()
    .withMessage("Subscription plan is required")
    .isMongoId()
    .withMessage("Valid subscription plan ID is required"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date string"),

  body("durationMonths")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number of months (minimum 1)"),
];

export const updateVendorValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid vendor ID format"),

  body("companyName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be empty"),

  body("contactName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Contact name cannot be empty"),

  body("initials")
    .optional()
    .trim()
    .isString()
    .withMessage("Initials must be a string"),

  body("avatarBg")
    .optional()
    .isString()
    .withMessage("Avatar background color must be a valid string"),

  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty"),

  body("services")
    .optional()
    .isArray()
    .withMessage("Services must be an array of strings"),

  body("services.*")
    .optional()
    .isString()
    .withMessage("Each service name must be a string"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be a number between 0 and 5"),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];

export const updateVendorStatusValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid vendor ID format"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .customSanitizer((val) => {
      if (typeof val === "string") {
        const lower = val.toLowerCase();
        if (lower === "active") return "Active";
        if (lower === "suspended") return "Suspended";
        if (lower === "inactive") return "Inactive";
      }
      return val;
    })
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];

export const updateVendorStaffValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid staff ID format"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .optional()
    .trim(),

  body("title")
    .optional()
    .trim(),

  body("location")
    .optional()
    .trim(),

  body("department")
    .optional()
    .trim(),

  body("bio")
    .optional()
    .trim(),
];
