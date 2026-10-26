import { body, param, query } from "express-validator";

export const createRoleValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Role name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("permissions")
    .isArray({ min: 1 })
    .withMessage("Permissions must be a non-empty array"),
];

export const updateRoleValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Role name cannot be empty")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("permissions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Permissions must be a non-empty array"),
];

export const roleIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid role ID format"),
];
