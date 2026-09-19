import { body, param } from "express-validator";

const ALLOWED_CATEGORIES = [
  "Maintenance",
  "Inspection",
  "Survey",
  "Mapping",
  "Documentation",
];

const ALLOWED_REQUIREMENT_TYPES = ["REQUIRED", "OPTIONAL"];
const ALLOWED_PHOTO_TYPES = ["WIDE ANGLE", "CLOSE UP", "HIGH DETAIL", "GENERAL"];
const ALLOWED_PROCESSING_MODES = ["AUTOMATIC", "MANUAL"];
const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE"];

export const createServiceValidation = [
  body("serviceCategory")
    .notEmpty()
    .withMessage("Service category is required")
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Service category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`),

  body("serviceTypeName")
    .trim()
    .notEmpty()
    .withMessage("Service type name is required"),

  body("defaultPrice")
    .notEmpty()
    .withMessage("Default price is required")
    .isFloat({ min: 0 })
    .withMessage("Default price must be a non-negative number"),

  body("photoChecklistRequirements")
    .optional()
    .isArray()
    .withMessage("Photo checklist requirements must be an array"),

  body("photoChecklistRequirements.*.title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Checklist item title is required"),

  body("photoChecklistRequirements.*.requirementType")
    .optional()
    .isIn(ALLOWED_REQUIREMENT_TYPES)
    .withMessage(`Requirement type must be one of: ${ALLOWED_REQUIREMENT_TYPES.join(", ")}`),

  body("photoChecklistRequirements.*.photoType")
    .optional()
    .isIn(ALLOWED_PHOTO_TYPES)
    .withMessage(`Photo type must be one of: ${ALLOWED_PHOTO_TYPES.join(", ")}`),

  body("serviceLogic")
    .optional()
    .isString()
    .withMessage("Service logic must be a string"),

  body("requireSignature")
    .optional()
    .isBoolean()
    .withMessage("requireSignature must be a boolean"),

  body("autoApprove")
    .optional()
    .isBoolean()
    .withMessage("autoApprove must be a boolean"),

  body("notifyClient")
    .optional()
    .isBoolean()
    .withMessage("notifyClient must be a boolean"),

  body("processingMode")
    .optional()
    .isIn(ALLOWED_PROCESSING_MODES)
    .withMessage(`Processing mode must be one of: ${ALLOWED_PROCESSING_MODES.join(", ")}`),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];

export const updateServiceValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid service ID format"),

  body("serviceCategory")
    .optional()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Service category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`),

  body("serviceTypeName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Service type name cannot be empty"),

  body("defaultPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Default price must be a non-negative number"),

  body("photoChecklistRequirements")
    .optional()
    .isArray()
    .withMessage("Photo checklist requirements must be an array"),

  body("photoChecklistRequirements.*.title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Checklist item title is required"),

  body("photoChecklistRequirements.*.requirementType")
    .optional()
    .isIn(ALLOWED_REQUIREMENT_TYPES)
    .withMessage(`Requirement type must be one of: ${ALLOWED_REQUIREMENT_TYPES.join(", ")}`),

  body("photoChecklistRequirements.*.photoType")
    .optional()
    .isIn(ALLOWED_PHOTO_TYPES)
    .withMessage(`Photo type must be one of: ${ALLOWED_PHOTO_TYPES.join(", ")}`),

  body("serviceLogic")
    .optional()
    .isString()
    .withMessage("Service logic must be a string"),

  body("requireSignature")
    .optional()
    .isBoolean()
    .withMessage("requireSignature must be a boolean"),

  body("autoApprove")
    .optional()
    .isBoolean()
    .withMessage("autoApprove must be a boolean"),

  body("notifyClient")
    .optional()
    .isBoolean()
    .withMessage("notifyClient must be a boolean"),

  body("processingMode")
    .optional()
    .isIn(ALLOWED_PROCESSING_MODES)
    .withMessage(`Processing mode must be one of: ${ALLOWED_PROCESSING_MODES.join(", ")}`),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];

export const updateServiceStatusValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid service ID format"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];
