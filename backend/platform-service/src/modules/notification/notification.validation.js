import { param } from "express-validator";

export const markReadValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid notification ID format"),
];
