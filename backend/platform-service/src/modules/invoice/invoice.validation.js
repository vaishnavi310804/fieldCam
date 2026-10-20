import { body, param } from "express-validator";

const ALLOWED_STATUSES = [
  "Draft",
  "Submitted",
  "Pending",
  "Approved",
  "Sent",
  "Paid",
  "Rejected",
];

export const createInvoiceValidation = [
  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isString()
    .withMessage("Project ID must be a valid string"),

  body("invoiceId")
    .optional()
    .trim()
    .isString()
    .withMessage("Invoice ID must be a string"),

  body("vendorId")
    .optional()
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("items")
    .optional()
    .isArray()
    .withMessage("Items must be an array of line items"),

  body("items.*.description")
    .if(body("items").isArray({ min: 1 }))
    .trim()
    .notEmpty()
    .withMessage("Line item description is required"),

  body("items.*.quantity")
    .if(body("items").isArray({ min: 1 }))
    .custom((val) => {
      const num = Number(val);
      if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
        throw new Error("Line item quantity must be a positive whole number");
      }
      return true;
    }),

  body("items.*.rate")
    .if(body("items").isArray({ min: 1 }))
    .custom((val) => {
      const num = Number(val);
      if (!Number.isFinite(num) || num < 0) {
        throw new Error("Line item rate must be a non-negative number");
      }
      const str = String(val).trim();
      const dotIndex = str.indexOf(".");
      if (dotIndex !== -1 && str.length - dotIndex - 1 > 2) {
        throw new Error("Line item rate cannot have more than 2 decimal places");
      }
      return true;
    }),

  body("invoiceDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invoice date must be a valid ISO8601 date string"),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Due date must be a valid ISO8601 date string"),

  body("notes")
    .optional()
    .trim()
    .isString(),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  // Legacy fields accepted for backward compatibility
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number"),

  body("tax")
    .optional()
    .isFloat({ min: 0 }),
];

export const updateInvoiceValidation = [
  body("items")
    .optional()
    .isArray()
    .withMessage("Items must be an array of line items"),

  body("items.*.description")
    .if(body("items").isArray({ min: 1 }))
    .trim()
    .notEmpty()
    .withMessage("Line item description is required"),

  body("items.*.quantity")
    .if(body("items").isArray({ min: 1 }))
    .custom((val) => {
      const num = Number(val);
      if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
        throw new Error("Line item quantity must be a positive whole number");
      }
      return true;
    }),

  body("items.*.rate")
    .if(body("items").isArray({ min: 1 }))
    .custom((val) => {
      const num = Number(val);
      if (!Number.isFinite(num) || num < 0) {
        throw new Error("Line item rate must be a non-negative number");
      }
      const str = String(val).trim();
      const dotIndex = str.indexOf(".");
      if (dotIndex !== -1 && str.length - dotIndex - 1 > 2) {
        throw new Error("Line item rate cannot have more than 2 decimal places");
      }
      return true;
    }),

  body("invoiceDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invoice date must be a valid ISO8601 date string"),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Due date must be a valid ISO8601 date string"),

  body("notes")
    .optional()
    .trim()
    .isString(),

  body("submit")
    .optional()
    .isBoolean()
    .withMessage("Submit flag must be a boolean"),

  body("amount")
    .optional()
    .isFloat({ min: 0 }),
];

export const submitInvoiceValidation = [
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO8601 date string"),
];

export const reviewInvoiceValidation = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("Review action is required")
    .isIn(["APPROVE", "REJECT", "approve", "reject"])
    .withMessage('Action must be either "APPROVE" or "REJECT"'),

  body("rejectionReason")
    .if((value, { req }) => (req.body.action || "").toUpperCase() === "REJECT")
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required when rejecting an invoice"),
];

export const sendInvoiceValidation = [
  body("recipientEmail")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Recipient must be a valid email address"),
];

export const recordPaymentValidation = [
  body("paymentDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Payment date must be a valid ISO8601 date string"),

  body("paymentMethod")
    .optional()
    .trim()
    .isString(),

  body("paymentNotes")
    .optional()
    .trim()
    .isString(),
];

export const updateInvoiceStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),

  body("rejectionReason")
    .if(body("status").equals("Rejected"))
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required when setting status to Rejected"),

  body("paymentDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Payment date must be a valid ISO8601 date string"),
];
