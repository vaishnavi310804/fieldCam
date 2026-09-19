import { body, param } from "express-validator";

const ALLOWED_STATUSES = [
  "New",
  "In Progress",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

export const createProjectValidation = [
  body("projectId")
    .trim()
    .notEmpty()
    .withMessage("Project ID is required"),

  body("projectName")
    .trim()
    .notEmpty()
    .withMessage("Project name is required"),

  body("client")
    .trim()
    .notEmpty()
    .withMessage("Client is required"),

  body("serviceId")
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Service ID must be a valid MongoDB ObjectId"),

  body("serviceTypeName")
    .trim()
    .notEmpty()
    .withMessage("Service type name is required"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),

  body("deadline")
    .notEmpty()
    .withMessage("Deadline date is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date"),

  body("companyId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Company ID must be a valid MongoDB ObjectId"),

  body("vendorId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("vendorName")
    .optional()
    .trim()
    .isString()
    .withMessage("Vendor name must be a string"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a string"),

  body("checklistItems")
    .optional()
    .isArray()
    .withMessage("Checklist items must be an array"),

  body("checklistItems.*.id")
    .optional()
    .notEmpty()
    .withMessage("Checklist item ID is required"),

  body("checklistItems.*.label")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Checklist item label is required"),

  body("checklistItems.*.checked")
    .optional()
    .isBoolean()
    .withMessage("Checklist item checked status must be a boolean"),

  body("photos")
    .optional()
    .isArray()
    .withMessage("Photos must be an array"),

  body("photos.*.url")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Photo URL is required"),

  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),

  body("attachments.*.url")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Attachment URL is required"),

  body("attachments.*.filename")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Attachment filename is required"),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("rejectionReason")
    .optional()
    .trim()
    .isString()
    .withMessage("Rejection reason must be a string"),
];

export const updateProjectValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid project ID format"),

  body("projectName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty"),

  body("client")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Client cannot be empty"),

  body("serviceId")
    .optional()
    .isMongoId()
    .withMessage("Service ID must be a valid MongoDB ObjectId"),

  body("serviceTypeName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Service type name cannot be empty"),

  body("vendorId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("companyId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Company ID must be a valid MongoDB ObjectId"),

  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty"),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be a valid date"),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("rejectionReason")
    .optional()
    .trim()
    .isString()
    .withMessage("Rejection reason must be a string"),
];

export const updateProjectStatusValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid project ID format"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("rejectionReason")
    .optional()
    .trim()
    .isString()
    .withMessage("Rejection reason must be a string"),
];
