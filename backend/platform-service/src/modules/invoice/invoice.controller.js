import {
  createInvoice,
  getInvoicePreview,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  submitInvoice,
  reviewInvoice,
  sendInvoice,
  recordPayment,
  updateInvoiceStatus,
  getInvoiceStats,
  getInvoiceOverview,
  downloadInvoicePdf,
} from "./invoice.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

const getErrorStatus = (error) => {
  if (error.statusCode) return error.statusCode;
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("not found")) return 404;
  if (msg.includes("already exists") || msg.includes("duplicate")) return 409;
  if (msg.includes("forbidden") || msg.includes("access denied")) return 403;
  return 400;
};

export const createInvoiceController = async (req, res) => {
  try {
    const result = await createInvoice(req.body, req.user);

    const auditAction =
      result.status === "Submitted" ? "INVOICE_SUBMITTED" : "INVOICE_CREATED";

    await logAuditEvent({
      actor: req.user,
      action: auditAction,
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || "",
      description: `Created invoice ${result.invoiceId} for ${result.projectTitle} (Status: ${result.status})`,
      metadata: {
        invoiceId: result.invoiceId,
        totalAmount: result.totalAmount,
        status: result.status,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        result.status === "Submitted"
          ? "Invoice submitted for admin review"
          : "Invoice draft created successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create invoice",
    });
  }
};

export const getInvoicePreviewController = async (req, res) => {
  try {
    const result = await getInvoicePreview(req.params.projectId, req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch invoice preview",
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
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Invoice not found",
    });
  }
};

export const updateInvoiceController = async (req, res) => {
  try {
    const result = await updateInvoice(req.params.id, req.body, req.user);

    const auditAction =
      result.status === "Submitted" ? "INVOICE_SUBMITTED" : "INVOICE_UPDATED";

    await logAuditEvent({
      actor: req.user,
      action: auditAction,
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Updated invoice ${result.invoiceId} (Status: ${result.status})`,
      metadata: { invoiceId: result.invoiceId, status: result.status },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update invoice",
    });
  }
};

export const submitInvoiceController = async (req, res) => {
  try {
    const result = await submitInvoice(req.params.id, req.user);

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_SUBMITTED",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Submitted invoice ${result.invoiceId} for admin review`,
      metadata: { invoiceId: result.invoiceId, totalAmount: result.totalAmount },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice submitted for review successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit invoice",
    });
  }
};

export const reviewInvoiceController = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const result = await reviewInvoice(
      req.params.id,
      { action, rejectionReason },
      req.user
    );

    const auditAction =
      result.status === "Approved" ? "INVOICE_APPROVED" : "INVOICE_REJECTED";

    await logAuditEvent({
      actor: req.user,
      action: auditAction,
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Admin ${result.status.toLowerCase()} invoice ${result.invoiceId}`,
      metadata: {
        invoiceId: result.invoiceId,
        status: result.status,
        rejectionReason: result.rejectionReason,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Invoice ${result.status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to review invoice",
    });
  }
};

export const sendInvoiceController = async (req, res) => {
  try {
    const result = await sendInvoice(req.params.id, req.body, req.user);

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_SENT",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Sent invoice ${result.invoiceId} to client (${result.sentTo || "recipient"})`,
      metadata: {
        invoiceId: result.invoiceId,
        sentTo: result.sentTo,
        sentAt: result.sentAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice sent successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to send invoice",
    });
  }
};

export const recordPaymentController = async (req, res) => {
  try {
    const result = await recordPayment(req.params.id, req.body, req.user);

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_PAID",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Recorded payment of $${result.totalAmount} for invoice ${result.invoiceId}`,
      metadata: {
        invoiceId: result.invoiceId,
        totalAmount: result.totalAmount,
        paymentDate: result.paymentDate,
        paymentMethod: result.paymentMethod,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to record payment",
    });
  }
};

export const downloadInvoicePdfController = async (req, res) => {
  try {
    const { pdfBuffer, filename } = await downloadInvoicePdf(req.params.id, req.user);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to generate invoice PDF",
    });
  }
};

export const updateInvoiceStatusController = async (req, res) => {
  try {
    const result = await updateInvoiceStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    await logAuditEvent({
      actor: req.user,
      action: "INVOICE_STATUS_CHANGED",
      entityType: "Invoice",
      entityId: result.invoiceId || result._id?.toString() || req.params.id,
      description: `Changed status of invoice ${result.invoiceId} to ${result.status}`,
      metadata: { invoiceId: result.invoiceId, newStatus: result.status },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update invoice status",
    });
  }
};

export const getInvoiceStatsController = async (req, res) => {
  try {
    const result = await getInvoiceStats(req.user, req.query);
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
    const result = await getInvoiceOverview(req.user, req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch invoice overview",
    });
  }
};
