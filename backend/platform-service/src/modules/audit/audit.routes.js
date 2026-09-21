import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { getMyAuditLogsController } from "./audit.controller.js";

const router = Router();

// GET /api/audit-logs/me - Read audit logs for authenticated user
router.get(
  "/me",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"),
  getMyAuditLogsController
);

export default router;
