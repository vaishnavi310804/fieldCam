import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { getAdminAnalyticsController } from "./analytics.controller.js";

const router = Router();

// GET /api/analytics/admin - Authoritative Admin Analytics (SUPER_ADMIN, ADMIN)
router.get(
  "/admin",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAdminAnalyticsController
);

// GET /api/analytics - Direct route alias
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAdminAnalyticsController
);

export default router;
