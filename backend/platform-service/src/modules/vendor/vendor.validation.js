import { body, param } from "express-validator";

const ALLOWED_STATUSES = ["Active", "Suspended", "Inactive"];

export const createVendorValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
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
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];
