import { body, param } from "express-validator";

const ALLOWED_STATUSES = ["Pending", "Approved", "Paid"];

export const createInvoiceValidation = [
  body("invoiceId")
    .trim()
    .notEmpty()
    .withMessage("Invoice ID is required"),

  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Project ID must be a valid MongoDB ObjectId"),

  body("vendorId")
    .notEmpty()
    .withMessage("Vendor ID is required")
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number"),

  body("tax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax must be a non-negative number"),

  body("totalAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total amount must be a non-negative number"),

  body("projectTitle")
    .optional()
    .trim()
    .isString()
    .withMessage("Project title must be a string"),

  body("vendorName")
    .optional()
    .trim()
    .isString()
    .withMessage("Vendor name must be a string"),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("paymentDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Payment date must be a valid ISO8601 date string"),
];

export const updateInvoiceValidation = [
  body("invoiceId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Invoice ID cannot be empty"),

  body("projectId")
    .optional()
    .isMongoId()
    .withMessage("Project ID must be a valid MongoDB ObjectId"),

  body("vendorId")
    .optional()
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("projectTitle")
    .optional()
    .trim()
    .isString()
    .withMessage("Project title must be a string"),

  body("vendorName")
    .optional()
    .trim()
    .isString()
    .withMessage("Vendor name must be a string"),

  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number"),

  body("tax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax must be a non-negative number"),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("paymentDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Payment date must be a valid ISO8601 date string"),
];

export const updateInvoiceStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];
