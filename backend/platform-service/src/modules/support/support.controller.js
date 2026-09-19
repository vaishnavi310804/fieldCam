import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  getTicketStats,
} from "./support.service.js";

/**
 * Controller to handle Support ticket creation.
 * POST /api/support/tickets
 */
export const createTicketController = async (req, res) => {
  try {
    const result = await createTicket(req.body);
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

/**
 * Controller to handle fetching all support tickets with filters & search.
 * GET /api/support/tickets
 */
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

/**
 * Controller to handle fetching a single support ticket by Mongo _id or ticketId.
 * GET /api/support/tickets/:id
 */
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

/**
 * Controller to handle updating an existing support ticket.
 * PUT /api/support/tickets/:id
 */
export const updateTicketController = async (req, res) => {
  try {
    const result = await updateTicket(req.params.id, req.body);
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

/**
 * Controller to handle updating ticket status.
 * PATCH /api/support/tickets/:id/status
 */
export const updateTicketStatusController = async (req, res) => {
  try {
    const result = await updateTicketStatus(req.params.id, req.body.status);
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

/**
 * Controller to handle fetching support ticket statistics.
 * GET /api/support/stats
 */
export const getTicketStatsController = async (req, res) => {
  try {
    const result = await getTicketStats();
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
