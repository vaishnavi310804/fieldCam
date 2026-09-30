import { body } from "express-validator";

export const registerDeviceTokenValidation = [
  body("deviceToken")
    .trim()
    .notEmpty()
    .withMessage("Device token is required")
    .isString()
    .withMessage("Device token must be a string"),

  body("platform")
    .trim()
    .notEmpty()
    .withMessage("Platform is required")
    .isIn(["android", "ios"])
    .withMessage("Platform must be either android or ios"),

  body("userId")
    .not()
    .exists()
    .withMessage("userId cannot be passed in request body"),
];

export const unregisterDeviceTokenValidation = [
  body("deviceToken")
    .trim()
    .notEmpty()
    .withMessage("Device token is required")
    .isString()
    .withMessage("Device token must be a string"),

  body("userId")
    .not()
    .exists()
    .withMessage("userId cannot be passed in request body"),
];
