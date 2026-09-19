import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
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

// GET /api/support/tickets - Read support tickets (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/tickets",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getTicketsController
);

// GET /api/support/stats - Aggregate support ticket statistics (SUPER_ADMIN, ADMIN)
router.get(
  "/stats",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getTicketStatsController
);

// GET /api/support/tickets/:id - Read single support ticket details by Mongo _id or ticketId (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/tickets/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getTicketByIdController
);

// POST /api/support/tickets - Create a new support ticket (SUPER_ADMIN, ADMIN)
router.post(
  "/tickets",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  createTicketValidation,
  validate,
  createTicketController
);

// PUT /api/support/tickets/:id - Update existing support ticket (SUPER_ADMIN, ADMIN)
router.put(
  "/tickets/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateTicketValidation,
  validate,
  updateTicketController
);

// PATCH /api/support/tickets/:id/status - Update ticket status (SUPER_ADMIN, ADMIN)
router.patch(
  "/tickets/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateTicketStatusValidation,
  validate,
  updateTicketStatusController
);

export default router;
