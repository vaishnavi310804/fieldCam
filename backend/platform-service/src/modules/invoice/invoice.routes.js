import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createInvoiceValidation,
  updateInvoiceValidation,
  updateInvoiceStatusValidation,
} from "./invoice.validation.js";
import {
  createInvoiceController,
  getInvoicesController,
  getInvoiceByIdController,
  updateInvoiceController,
  updateInvoiceStatusController,
  getInvoiceStatsController,
  getInvoiceOverviewController,
} from "./invoice.controller.js";

const router = Router();

// GET /api/invoices - List invoices with filters, search, and vendor scoping (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getInvoicesController
);

// GET /api/invoices/stats - Aggregate invoice statistics (SUPER_ADMIN, ADMIN)
router.get(
  "/stats",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getInvoiceStatsController
);

// GET /api/invoices/overview - Monthly payment overview breakdown (SUPER_ADMIN, ADMIN)
router.get(
  "/overview",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  getInvoiceOverviewController
);

// GET /api/invoices/:id - Read single invoice details by Mongo _id or invoiceId (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getInvoiceByIdController
);

// POST /api/invoices - Create a new invoice (SUPER_ADMIN, ADMIN)
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  createInvoiceValidation,
  validate,
  createInvoiceController
);

// PUT /api/invoices/:id - Update existing invoice (SUPER_ADMIN, ADMIN)
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateInvoiceValidation,
  validate,
  updateInvoiceController
);

// PATCH /api/invoices/:id/status - Update invoice status (SUPER_ADMIN, ADMIN)
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateInvoiceStatusValidation,
  validate,
  updateInvoiceStatusController
);

export default router;
