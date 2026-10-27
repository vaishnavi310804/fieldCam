import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import {
  getMyAuditLogsController,
  getEntityAuditLogsController,
  getAllAuditLogsController,
  getAuditLogByIdController,
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

// GET /api/audit-logs - Super Admin query with pagination, search, filters & stable sorting
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN"),
  getAllAuditLogsController
);

// GET /api/audit-logs/:id - Super Admin read specific audit log entry
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  getAuditLogByIdController
);

export default router;
