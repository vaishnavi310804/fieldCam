import { Router } from "express";
import { protect, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
import { getAdminAnalyticsController } from "./analytics.controller.js";

const router = Router();

// GET /api/analytics/admin - Authoritative Admin Analytics (Admin: ANALYTICS:VIEW)
router.get(
  "/admin",
  protect,
  requirePermission(PERMISSION_MODULES.ANALYTICS, "VIEW"),
  getAdminAnalyticsController
);

// GET /api/analytics - Direct route alias
router.get(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.ANALYTICS, "VIEW"),
  getAdminAnalyticsController
);

export default router;
