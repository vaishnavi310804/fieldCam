import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { getAdminDashboardStatsController } from "./dashboard.controller.js";

const router = Router();

// GET /api/dashboard/stats - Aggregate Admin Dashboard metrics (SUPER_ADMIN, ADMIN)
router.get(
  "/stats",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAdminDashboardStatsController
);

export default router;
