import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  getInvoiceStats,
  getInvoiceOverview,
} from "./invoice.service.js";

/**
 * Controller to handle Invoice creation.
 * POST /api/invoices
 */
export const createInvoiceController = async (req, res) => {
  try {
    const result = await createInvoice(req.body);
    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create invoice",
    });
  }
};

/**
 * Controller to handle fetching all invoices with filters & search.
 * GET /api/invoices
 */
export const getInvoicesController = async (req, res) => {
  try {
    const result = await getInvoices(req.query, req.user);
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch invoices",
    });
  }
};

/**
 * Controller to handle fetching a single invoice by Mongo _id or invoiceId.
 * GET /api/invoices/:id
 */
export const getInvoiceByIdController = async (req, res) => {
  try {
    const result = await getInvoiceById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.statusCode ||
      (error.message === "Invoice not found" ? 404 : 400);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Invoice not found",
    });
  }
};

/**
 * Controller to handle updating an existing invoice.
 * PUT /api/invoices/:id
 */
export const updateInvoiceController = async (req, res) => {
  try {
    const result = await updateInvoice(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.statusCode ||
      (error.message.includes("not found") ? 404 : 400);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update invoice",
    });
  }
};

/**
 * Controller to handle updating invoice status.
 * PATCH /api/invoices/:id/status
 */
export const updateInvoiceStatusController = async (req, res) => {
  try {
    const result = await updateInvoiceStatus(req.params.id, req.body.status);
    return res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.statusCode ||
      (error.message === "Invoice not found" ? 404 : 400);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update invoice status",
    });
  }
};

/**
 * Controller to handle fetching aggregate invoice statistics.
 * GET /api/invoices/stats
 */
export const getInvoiceStatsController = async (req, res) => {
  try {
    const result = await getInvoiceStats();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch invoice statistics",
    });
  }
};

/**
 * Controller to handle fetching monthly payment overview statistics.
 * GET /api/invoices/overview
 */
export const getInvoiceOverviewController = async (req, res) => {
  try {
    const result = await getInvoiceOverview();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch invoice payment overview",
    });
  }
};
