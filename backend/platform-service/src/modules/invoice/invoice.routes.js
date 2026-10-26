import { Router } from "express";
import { protect, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
import validate from "../../middleware/validate.js";
import {
  createInvoiceValidation,
  updateInvoiceValidation,
  submitInvoiceValidation,
  reviewInvoiceValidation,
  sendInvoiceValidation,
  recordPaymentValidation,
  updateInvoiceStatusValidation,
} from "./invoice.validation.js";
import {
  createInvoiceController,
  getInvoicePreviewController,
  getInvoicesController,
  getInvoiceByIdController,
  updateInvoiceController,
  submitInvoiceController,
  reviewInvoiceController,
  sendInvoiceController,
  recordPaymentController,
  downloadInvoicePdfController,
  updateInvoiceStatusController,
  getInvoiceStatsController,
  getInvoiceOverviewController,
} from "./invoice.controller.js";

const router = Router();

// GET /api/invoices - List invoices (Admin: INVOICES:VIEW, Vendor/Staff: scoped)
router.get(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "VIEW", { allowRoles: ["VENDOR", "STAFF"] }),
  getInvoicesController
);

// GET /api/invoices/stats - Aggregate invoice statistics (Admin: INVOICES:VIEW, Vendor: scoped)
router.get(
  "/stats",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "VIEW", { allowRoles: ["VENDOR"] }),
  getInvoiceStatsController
);

// GET /api/invoices/overview - Monthly payment overview breakdown (Admin: INVOICES:VIEW, Vendor: scoped)
router.get(
  "/overview",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "VIEW", { allowRoles: ["VENDOR"] }),
  getInvoiceOverviewController
);

// GET /api/invoices/preview/:projectId - Preview invoice data (Admin: INVOICES:VIEW, Vendor: scoped)
router.get(
  "/preview/:projectId",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "VIEW", { allowRoles: ["VENDOR"] }),
  getInvoicePreviewController
);

// GET /api/invoices/:id - Read single invoice details (Admin: INVOICES:VIEW, Vendor: scoped)
router.get(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "VIEW", { allowRoles: ["VENDOR"] }),
  getInvoiceByIdController
);

// GET /api/invoices/:id/pdf - Download invoice PDF (Admin: INVOICES:VIEW, Vendor: scoped)
router.get(
  "/:id/pdf",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "VIEW", { allowRoles: ["VENDOR"] }),
  downloadInvoicePdfController
);

// POST /api/invoices - Create new invoice (Admin: INVOICES:CREATE, Vendor: create draft)
router.post(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "CREATE", { allowRoles: ["VENDOR"] }),
  createInvoiceValidation,
  validate,
  createInvoiceController
);

// PUT /api/invoices/:id - Update draft / rejected invoice (Admin: INVOICES:EDIT, Vendor: scoped)
router.put(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "EDIT", { allowRoles: ["VENDOR"] }),
  updateInvoiceValidation,
  validate,
  updateInvoiceController
);

// POST /api/invoices/:id/submit - Vendor submits draft or resubmits rejected invoice (Admin: INVOICES:EDIT, Vendor: scoped)
router.post(
  "/:id/submit",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "EDIT", { allowRoles: ["VENDOR"] }),
  submitInvoiceValidation,
  validate,
  submitInvoiceController
);

// POST /api/invoices/:id/review - Admin approves or rejects submitted invoice (Admin: INVOICES:REVIEW)
router.post(
  "/:id/review",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "REVIEW"),
  reviewInvoiceValidation,
  validate,
  reviewInvoiceController
);

// POST /api/invoices/:id/send - Admin sends approved invoice to client (Admin: INVOICES:SEND)
router.post(
  "/:id/send",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "SEND"),
  sendInvoiceValidation,
  validate,
  sendInvoiceController
);

// POST /api/invoices/:id/payment - Admin records actual payment (Admin: INVOICES:RECORD_PAYMENT)
router.post(
  "/:id/payment",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "RECORD_PAYMENT"),
  recordPaymentValidation,
  validate,
  recordPaymentController
);

// PATCH /api/invoices/:id/status - Legacy status transition endpoint (Admin: INVOICES:REVIEW)
router.patch(
  "/:id/status",
  protect,
  requirePermission(PERMISSION_MODULES.INVOICES, "REVIEW"),
  updateInvoiceStatusValidation,
  validate,
  updateInvoiceStatusController
);

export default router;
