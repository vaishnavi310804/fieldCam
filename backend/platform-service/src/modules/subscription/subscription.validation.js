import { body } from "express-validator";

export const createPlanValidation = [
  body("name").trim().notEmpty().withMessage("Plan name is required"),
  body("monthlyPrice")
    .isNumeric()
    .withMessage("Monthly price must be a number")
    .custom((val) => val >= 0)
    .withMessage("Price cannot be negative"),
  body("userLimit").optional().isNumeric(),
  body("storageLimitGb").optional().isNumeric(),
  body("features").optional().isArray(),
  body("status").optional().isIn(["DRAFT", "PUBLISHED", "ARCHIVED"]),
];

export const updatePlanValidation = [
  body("name").optional().trim().notEmpty().withMessage("Plan name cannot be empty"),
  body("monthlyPrice")
    .optional()
    .isNumeric()
    .withMessage("Monthly price must be a number")
    .custom((val) => val >= 0)
    .withMessage("Price cannot be negative"),
  body("userLimit").optional().isNumeric(),
  body("storageLimitGb").optional().isNumeric(),
  body("features").optional().isArray(),
  body("status").optional().isIn(["DRAFT", "PUBLISHED", "ARCHIVED"]),
];

export const assignSubscriptionValidation = [
  body("vendorId").isMongoId().withMessage("Valid Vendor ID is required"),
  body("planId").isMongoId().withMessage("Valid Plan ID is required"),
  body("status")
    .optional()
    .isIn(["Active", "Past Due", "Cancelled", "Trial"])
    .withMessage("Invalid subscription status"),
];

export const updateSubscriptionStatusValidation = [
  body("status")
    .isIn(["Active", "Past Due", "Cancelled", "Trial"])
    .withMessage("Invalid subscription status"),
];
