import { Router } from "express";
import { protect, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
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

// GET /api/vendor-registrations - List all registration requests (Admin: VENDORS:REGISTRATIONS_REVIEW)
router.get(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "REGISTRATIONS_REVIEW"),
  getRegistrationsController
);

// GET /api/vendor-registrations/:id - Read single registration request (Admin: VENDORS:REGISTRATIONS_REVIEW)
router.get(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "REGISTRATIONS_REVIEW"),
  getRegistrationByIdController
);

// POST /api/vendor-registrations/:id/approve - Approve request and provision vendor (Admin: VENDORS:REGISTRATIONS_REVIEW)
router.post(
  "/:id/approve",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "REGISTRATIONS_REVIEW"),
  approveRegistrationValidation,
  validate,
  approveRegistrationController
);

// POST /api/vendor-registrations/:id/reject - Reject request and notify applicant (Admin: VENDORS:REGISTRATIONS_REVIEW)
router.post(
  "/:id/reject",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "REGISTRATIONS_REVIEW"),
  rejectRegistrationValidation,
  validate,
  rejectRegistrationController
);

export default router;
