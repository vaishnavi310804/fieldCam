import { body, param, query } from "express-validator";

export const createAdminValidation = [
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
    .withMessage("Please enter a valid email address"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),

  body("roleId")
    .notEmpty()
    .withMessage("Role ID is required")
    .isMongoId()
    .withMessage("Invalid role ID format"),
];

export const reassignRoleValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("roleId")
    .notEmpty()
    .withMessage("Role ID is required")
    .isMongoId()
    .withMessage("Invalid role ID format"),
];

export const updateStatusValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
];

export const userIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];
