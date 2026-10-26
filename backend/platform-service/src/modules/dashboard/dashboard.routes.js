import { Router } from "express";
import { protect, authorize, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
import {
  getAdminDashboardStatsController,
  getSuperAdminDashboardStatsController,
} from "./dashboard.controller.js";

const router = Router();

// GET /api/dashboard/stats - Aggregate Admin Dashboard metrics (SUPER_ADMIN, ADMIN with DASHBOARD:VIEW)
router.get(
  "/stats",
  protect,
  requirePermission(PERMISSION_MODULES.DASHBOARD, "VIEW"),
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
