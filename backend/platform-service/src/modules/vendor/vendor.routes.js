import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createVendorValidation,
  updateVendorValidation,
  updateVendorStatusValidation,
  updateVendorStaffValidation,
} from "./vendor.validation.js";
import {
  createVendorController,
  getVendorsController,
  getVendorByIdController,
  getMyVendorProfileController,
  updateMyVendorProfileController,
  updateVendorController,
  updateVendorStatusController,
  getVendorStatsController,
  getVendorStaffController,
  updateVendorStaffStatusController,
  updateVendorStaffController,
} from "./vendor.controller.js";

const router = Router();

// GET /api/vendors - Read all vendors (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getVendorsController
);

// GET /api/vendors/me - Read authenticated vendor profile & stats (VENDOR, SUPER_ADMIN, ADMIN)
router.get(
  "/me",
  protect,
  authorize("VENDOR", "SUPER_ADMIN", "ADMIN"),
  getMyVendorProfileController
);

// PUT /api/vendors/me - Update authenticated vendor profile (VENDOR)
router.put(
  "/me",
  protect,
  authorize("VENDOR"),
  updateMyVendorProfileController
);

// GET /api/vendors/me/staff - Read staff belonging to the authenticated vendor (VENDOR, SUPER_ADMIN, ADMIN)
router.get(
  "/me/staff",
  protect,
  authorize("VENDOR", "SUPER_ADMIN", "ADMIN"),
  getVendorStaffController
);

// PATCH /api/vendors/me/staff/:id/status - Update staff member status (VENDOR)
router.patch(
  "/me/staff/:id/status",
  protect,
  authorize("VENDOR"),
  updateVendorStaffStatusController
);

// PUT /api/vendors/me/staff/:id - Update staff member details (VENDOR, ADMIN, SUPER_ADMIN)
router.put(
  "/me/staff/:id",
  protect,
  authorize("VENDOR", "ADMIN", "SUPER_ADMIN"),
  updateVendorStaffValidation,
  validate,
  updateVendorStaffController
);

// GET /api/vendors/stats - Vendor summary metrics (SUPER_ADMIN, ADMIN)
router.get(
  "/stats",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getVendorStatsController
);

// GET /api/vendors/:id - Read single vendor details (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getVendorByIdController
);

// POST /api/vendors - Create vendor profile (SUPER_ADMIN, ADMIN)
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  createVendorValidation,
  validate,
  createVendorController
);

// PUT /api/vendors/:id - Update vendor profile (SUPER_ADMIN, ADMIN)
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateVendorValidation,
  validate,
  updateVendorController
);

// PATCH /api/vendors/:id/status - Update vendor status (SUPER_ADMIN, ADMIN)
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateVendorStatusValidation,
  validate,
  updateVendorStatusController
);

export default router;
