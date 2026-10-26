import { Router } from "express";
import { protect, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
import validate from "../../middleware/validate.js";
import {
  createServiceValidation,
  updateServiceValidation,
  updateServiceStatusValidation,
} from "./service.validation.js";
import {
  createServiceController,
  getServicesController,
  getServiceByIdController,
  updateServiceController,
  updateServiceStatusController,
} from "./service.controller.js";

const router = Router();

// GET /api/services - Read all services (Admin: SERVICES:VIEW, Vendor: scoped)
router.get(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.SERVICES, "VIEW", { allowRoles: ["VENDOR"] }),
  getServicesController
);

// GET /api/services/:id - Read single service details (Admin: SERVICES:VIEW, Vendor: scoped)
router.get(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.SERVICES, "VIEW", { allowRoles: ["VENDOR"] }),
  getServiceByIdController
);

// POST /api/services - Create a new service (Admin: SERVICES:CREATE)
router.post(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.SERVICES, "CREATE"),
  createServiceValidation,
  validate,
  createServiceController
);

// PUT /api/services/:id - Update service configuration (Admin: SERVICES:EDIT)
router.put(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.SERVICES, "EDIT"),
  updateServiceValidation,
  validate,
  updateServiceController
);

// PATCH /api/services/:id/status - Update service status (Admin: SERVICES:STATUS)
router.patch(
  "/:id/status",
  protect,
  requirePermission(PERMISSION_MODULES.SERVICES, "STATUS"),
  updateServiceStatusValidation,
  validate,
  updateServiceStatusController
);

export default router;
