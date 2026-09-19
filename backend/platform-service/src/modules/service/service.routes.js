import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
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

// GET /api/services - Read all services (ADMIN, SUPER_ADMIN, VENDOR)
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getServicesController
);

// GET /api/services/:id - Read single service details (ADMIN, SUPER_ADMIN, VENDOR)
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getServiceByIdController
);

// POST /api/services - Create a new service (ADMIN, SUPER_ADMIN)
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  createServiceValidation,
  validate,
  createServiceController
);

// PUT /api/services/:id - Update service configuration (ADMIN, SUPER_ADMIN)
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateServiceValidation,
  validate,
  updateServiceController
);

// PATCH /api/services/:id/status - Update service status (ADMIN, SUPER_ADMIN)
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateServiceStatusValidation,
  validate,
  updateServiceStatusController
);

export default router;
