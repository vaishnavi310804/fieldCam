import { body, param } from "express-validator";

export const sendMessageValidation = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Message text cannot be empty")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message text cannot exceed 2000 characters"),
];

export const conversationIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid conversation ID format"),
];
