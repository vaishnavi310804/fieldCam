import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import {
  getMyAuditLogsController,
  getEntityAuditLogsController,
} from "./audit.controller.js";

const router = Router();

// GET /api/audit-logs/me - Read audit logs for authenticated user
router.get(
  "/me",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"),
  getMyAuditLogsController
);

// GET /api/audit-logs/entity/:entityType/:entityId - Read audit logs for entity
router.get(
  "/entity/:entityType/:entityId",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"),
  getEntityAuditLogsController
);

export default router;
