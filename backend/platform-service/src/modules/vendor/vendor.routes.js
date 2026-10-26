import { Router } from "express";
import { protect, authorize, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
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
  updateVendorController,
  updateVendorStatusController,
  getVendorStatsController,
  getVendorStaffController,
  updateVendorStaffStatusController,
  updateVendorStaffController,
} from "./vendor.controller.js";

const router = Router();

// GET /api/vendors - Read all vendors (Admin: VENDORS:VIEW, Vendor: scoped)
router.get(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "VIEW", { allowRoles: ["VENDOR"] }),
  getVendorsController
);

// GET /api/vendors/me - Read authenticated vendor profile & stats (VENDOR, SUPER_ADMIN, ADMIN)
router.get(
  "/me",
  protect,
  authorize("VENDOR", "SUPER_ADMIN", "ADMIN"),
  getMyVendorProfileController
);

// GET /api/vendors/me/staff - Read staff belonging to the authenticated vendor (VENDOR, SUPER_ADMIN, ADMIN)
router.get(
  "/me/staff",
  protect,
  authorize("VENDOR", "SUPER_ADMIN", "ADMIN"),
  getVendorStaffController
);

// PATCH /api/vendors/me/staff/:id/status - Update staff member status (VENDOR only)
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

// GET /api/vendors/stats - Vendor summary metrics (Admin: VENDORS:VIEW)
router.get(
  "/stats",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "VIEW"),
  getVendorStatsController
);

// GET /api/vendors/:id - Read single vendor details (Admin: VENDORS:VIEW, Vendor: scoped)
router.get(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "VIEW", { allowRoles: ["VENDOR"] }),
  getVendorByIdController
);

// POST /api/vendors - Create vendor profile (Admin: VENDORS:CREATE)
router.post(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "CREATE"),
  createVendorValidation,
  validate,
  createVendorController
);

// PUT /api/vendors/:id - Update vendor profile (Admin: VENDORS:EDIT)
router.put(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "EDIT"),
  updateVendorValidation,
  validate,
  updateVendorController
);

// PATCH /api/vendors/:id/status - Update vendor status (Admin: VENDORS:STATUS)
router.patch(
  "/:id/status",
  protect,
  requirePermission(PERMISSION_MODULES.VENDORS, "STATUS"),
  updateVendorStatusValidation,
  validate,
  updateVendorStatusController
);

export default router;
