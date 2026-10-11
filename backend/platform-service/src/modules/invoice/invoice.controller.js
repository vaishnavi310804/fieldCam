import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  getInvoiceStats,
  getInvoiceOverview,
} from "./invoice.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

export const createInvoiceController = async (req, res) => {
  try {
    const result = await createInvoice(req.body);

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_CREATED",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || "",
      description: `Created invoice ${result.invoiceId || ""} for ${result.projectTitle || "project"}`.trim(),
      metadata: { invoiceId: result.invoiceId, totalAmount: result.totalAmount },
    });

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

export const updateInvoiceController = async (req, res) => {
  try {
    const result = await updateInvoice(req.params.id, req.body);

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_UPDATED",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Updated invoice ${result.invoiceId || ""}`.trim(),
      metadata: { invoiceId: result.invoiceId },
    });

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

export const updateInvoiceStatusController = async (req, res) => {
  try {
    const result = await updateInvoiceStatus(req.params.id, req.body.status);

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_STATUS_CHANGED",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Changed status of invoice ${result.invoiceId || ""} to ${result.status}`.trim(),
      metadata: { invoiceId: result.invoiceId, newStatus: result.status },
    });

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
