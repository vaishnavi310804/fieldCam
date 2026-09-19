import { body } from "express-validator";

const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const ALLOWED_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export const createTicketValidation = [
  body("ticketId")
    .trim()
    .notEmpty()
    .withMessage("Ticket ID is required"),

  body("vendorId")
    .notEmpty()
    .withMessage("Vendor ID is required")
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),

  body("vendorName")
    .optional()
    .trim()
    .isString()
    .withMessage("Vendor name must be a string"),

  body("initials")
    .optional()
    .trim()
    .isString()
    .withMessage("Initials must be a string"),

  body("avatarBg")
    .optional()
    .trim()
    .isString()
    .withMessage("Avatar background must be a string"),

  body("projectId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Project ID must be a valid MongoDB ObjectId"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a string"),

  body("priority")
    .optional()
    .isIn(ALLOWED_PRIORITIES)
    .withMessage(`Priority must be one of: ${ALLOWED_PRIORITIES.join(", ")}`),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];

export const updateTicketValidation = [
  body("ticketId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Ticket ID cannot be empty"),

  body("vendorId")
    .optional()
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  body("vendorName")
    .optional()
    .trim()
    .isString()
    .withMessage("Vendor name must be a string"),

  body("initials")
    .optional()
    .trim()
    .isString()
    .withMessage("Initials must be a string"),

  body("avatarBg")
    .optional()
    .trim()
    .isString()
    .withMessage("Avatar background must be a string"),

  body("projectId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Project ID must be a valid MongoDB ObjectId"),

  body("subject")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Subject cannot be empty"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a string"),

  body("priority")
    .optional()
    .isIn(ALLOWED_PRIORITIES)
    .withMessage(`Priority must be one of: ${ALLOWED_PRIORITIES.join(", ")}`),

  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];

export const updateTicketStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`),
];
