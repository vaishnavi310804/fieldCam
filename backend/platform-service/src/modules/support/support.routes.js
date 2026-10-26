import { Router } from "express";
import { protect, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
import validate from "../../middleware/validate.js";
import {
  createTicketValidation,
  updateTicketValidation,
  updateTicketStatusValidation,
} from "./support.validation.js";
import {
  createTicketController,
  getTicketsController,
  getTicketByIdController,
  updateTicketController,
  updateTicketStatusController,
  getTicketStatsController,
} from "./support.controller.js";

const router = Router();

// GET /api/support/tickets - Read support tickets (Admin: SUPPORT:VIEW, Vendor: scoped)
router.get(
  "/tickets",
  protect,
  requirePermission(PERMISSION_MODULES.SUPPORT, "VIEW", { allowRoles: ["VENDOR"] }),
  getTicketsController
);

// GET /api/support/stats - Aggregate support ticket statistics (Admin: SUPPORT:VIEW, Vendor: scoped)
router.get(
  "/stats",
  protect,
  requirePermission(PERMISSION_MODULES.SUPPORT, "VIEW", { allowRoles: ["VENDOR"] }),
  getTicketStatsController
);

// GET /api/support/tickets/:id - Read single support ticket details (Admin: SUPPORT:VIEW, Vendor: scoped)
router.get(
  "/tickets/:id",
  protect,
  requirePermission(PERMISSION_MODULES.SUPPORT, "VIEW", { allowRoles: ["VENDOR"] }),
  getTicketByIdController
);

// POST /api/support/tickets - Create a new support ticket (Admin: SUPPORT:CREATE, Vendor: create ticket)
router.post(
  "/tickets",
  protect,
  requirePermission(PERMISSION_MODULES.SUPPORT, "CREATE", { allowRoles: ["VENDOR"] }),
  createTicketValidation,
  validate,
  createTicketController
);

// PUT /api/support/tickets/:id - Update existing support ticket (Admin: SUPPORT:EDIT)
router.put(
  "/tickets/:id",
  protect,
  requirePermission(PERMISSION_MODULES.SUPPORT, "EDIT"),
  updateTicketValidation,
  validate,
  updateTicketController
);

// PATCH /api/support/tickets/:id/status - Update ticket status (Admin: SUPPORT:STATUS)
router.patch(
  "/tickets/:id/status",
  protect,
  requirePermission(PERMISSION_MODULES.SUPPORT, "STATUS"),
  updateTicketStatusValidation,
  validate,
  updateTicketStatusController
);

export default router;
