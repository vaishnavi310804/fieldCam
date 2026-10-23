import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  submitRegistrationValidation,
  approveRegistrationValidation,
  rejectRegistrationValidation,
} from "./vendorRegistration.validation.js";
import {
  submitRegistrationController,
  getRegistrationsController,
  getRegistrationByIdController,
  approveRegistrationController,
  rejectRegistrationController,
} from "./vendorRegistration.controller.js";

const router = Router();

// POST /api/vendor-registrations - Public submission of vendor registration request
router.post(
  "/",
  submitRegistrationValidation,
  validate,
  submitRegistrationController
);

// GET /api/vendor-registrations - List all registration requests (ADMIN only)
router.get(
  "/",
  protect,
  authorize("ADMIN"),
  getRegistrationsController
);

// GET /api/vendor-registrations/:id - Read single registration request (ADMIN only)
router.get(
  "/:id",
  protect,
  authorize("ADMIN"),
  getRegistrationByIdController
);

// POST /api/vendor-registrations/:id/approve - Approve request and provision vendor (ADMIN only)
router.post(
  "/:id/approve",
  protect,
  authorize("ADMIN"),
  approveRegistrationValidation,
  validate,
  approveRegistrationController
);

// POST /api/vendor-registrations/:id/reject - Reject request and notify applicant (ADMIN only)
router.post(
  "/:id/reject",
  protect,
  authorize("ADMIN"),
  rejectRegistrationValidation,
  validate,
  rejectRegistrationController
);

export default router;
