import { body, param } from "express-validator";

export const submitRegistrationValidation = [
  body("contactName")
    .trim()
    .notEmpty()
    .withMessage("Contact person's full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Contact name must be between 2 and 100 characters"),

  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company / business name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be between 2 and 150 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Business email is required")
    .isEmail()
    .withMessage("Please provide a valid business email address"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .custom((val) => {
      const cleaned = String(val).replace(/[\s\-\(\)\.]/g, "");
      if (cleaned.length < 7) {
        throw new Error("Please provide a valid phone number (at least 7 digits)");
      }
      return true;
    }),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Business address or operating location is required")
    .isLength({ min: 3 })
    .withMessage("Operating location must be at least 3 characters"),

  body("services")
    .custom((val) => {
      if (Array.isArray(val)) {
        if (val.length === 0) {
          throw new Error("At least one service offered must be specified");
        }
        const hasValid = val.some(
          (item) => typeof item === "string" && item.trim().length > 0
        );
        if (!hasValid) {
          throw new Error("Services offered cannot be empty");
        }
        return true;
      }
      if (typeof val === "string" && val.trim().length > 0) {
        return true;
      }
      throw new Error("Services offered are required");
    }),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Company description must be a string"),
];

export const approveRegistrationValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid registration request ID format"),

  body("planId")
    .optional()
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

export const rejectRegistrationValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid registration request ID format"),

  body("rejectionReason")
    .optional()
    .trim()
    .isString()
    .withMessage("Rejection reason must be a string"),
];
