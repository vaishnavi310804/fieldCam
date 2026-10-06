import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import {
  getAdminDashboardStatsController,
  getSuperAdminDashboardStatsController,
} from "./dashboard.controller.js";

const router = Router();

// GET /api/dashboard/stats - Aggregate Admin Dashboard metrics (SUPER_ADMIN, ADMIN)
router.get(
  "/stats",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAdminDashboardStatsController
);

// GET /api/dashboard/super-admin/stats - Aggregate Super Admin Telemetry (SUPER_ADMIN)
router.get(
  "/super-admin/stats",
  protect,
  authorize("SUPER_ADMIN"),
  getSuperAdminDashboardStatsController
);

export default router;
