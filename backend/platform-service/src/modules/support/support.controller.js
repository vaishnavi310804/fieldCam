import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  getTicketStats,
} from "./support.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

export const createTicketController = async (req, res) => {
  try {
    const result = await createTicket(req.body, req.user);

    await logAuditEvent({
      actor: req.user,
      action: "SUPPORT_TICKET_CREATED",
      entityType: "Support",
      entityId: result.ticketId || result._id?.toString() || "",
      description: `Created support ticket ${result.ticketId || ""} - ${result.subject || ""}`.trim(),
      metadata: { ticketId: result.ticketId, subject: result.subject },
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create support ticket",
    });
  }
};

export const getTicketsController = async (req, res) => {
  try {
    const result = await getTickets(req.query, req.user);
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch support tickets",
    });
  }
};

export const getTicketByIdController = async (req, res) => {
  try {
    const result = await getTicketById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.statusCode ||
      (error.message === "Ticket not found" ? 404 : 400);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Support ticket not found",
    });
  }
};

export const updateTicketController = async (req, res) => {
  try {
    const result = await updateTicket(req.params.id, req.body);

    await logAuditEvent({
      actor: req.user,
      action: "SUPPORT_TICKET_UPDATED",
      entityType: "Support",
      entityId: result.ticketId || result._id?.toString() || req.params.id,
      description: `Updated support ticket ${result.ticketId || ""}`.trim(),
      metadata: { ticketId: result.ticketId },
    });

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.statusCode ||
      (error.message.includes("not found") ? 404 : 400);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update support ticket",
    });
  }
};

export const updateTicketStatusController = async (req, res) => {
  try {
    const result = await updateTicketStatus(req.params.id, req.body.status);

    await logAuditEvent({
      actor: req.user,
      action: "SUPPORT_TICKET_STATUS_CHANGED",
      entityType: "Support",
      entityId: result.ticketId || result._id?.toString() || req.params.id,
      description: `Changed status of support ticket ${result.ticketId || ""} to ${result.status}`.trim(),
      metadata: { ticketId: result.ticketId, newStatus: result.status },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.statusCode ||
      (error.message === "Ticket not found" ? 404 : 400);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update ticket status",
    });
  }
};

export const getTicketStatsController = async (req, res) => {
  try {
    const result = await getTicketStats(req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch support ticket statistics",
    });
  }
};
