import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
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

// GET /api/invoices - List invoices with vendor scoping & filters
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"),
  getInvoicesController
);

// GET /api/invoices/stats - Aggregate invoice statistics (Admin & Vendor scoped)
router.get(
  "/stats",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getInvoiceStatsController
);

// GET /api/invoices/overview - Monthly payment overview breakdown
router.get(
  "/overview",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getInvoiceOverviewController
);

// GET /api/invoices/preview/:projectId - Preview invoice data for an approved project
router.get(
  "/preview/:projectId",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getInvoicePreviewController
);

// GET /api/invoices/:id - Read single invoice details
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getInvoiceByIdController
);

// GET /api/invoices/:id/pdf - Download invoice PDF
router.get(
  "/:id/pdf",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  downloadInvoicePdfController
);

// POST /api/invoices - Create new invoice (Vendor Draft / Submission or Admin)
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  createInvoiceValidation,
  validate,
  createInvoiceController
);

// PUT /api/invoices/:id - Update draft / rejected invoice
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  updateInvoiceValidation,
  validate,
  updateInvoiceController
);

// POST /api/invoices/:id/submit - Vendor submits draft or resubmits rejected invoice
router.post(
  "/:id/submit",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  submitInvoiceValidation,
  validate,
  submitInvoiceController
);

// POST /api/invoices/:id/review - Admin approves or rejects submitted invoice
router.post(
  "/:id/review",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  reviewInvoiceValidation,
  validate,
  reviewInvoiceController
);

// POST /api/invoices/:id/send - Admin sends approved invoice to client
router.post(
  "/:id/send",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  sendInvoiceValidation,
  validate,
  sendInvoiceController
);

// POST /api/invoices/:id/payment - Admin records actual payment
router.post(
  "/:id/payment",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  recordPaymentValidation,
  validate,
  recordPaymentController
);

// PATCH /api/invoices/:id/status - Legacy status transition endpoint
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateInvoiceStatusValidation,
  validate,
  updateInvoiceStatusController
);

export default router;
