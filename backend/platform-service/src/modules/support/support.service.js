import Support from "./support.model.js";
import Vendor from "../vendor/vendor.model.js";
import Project from "../project/project.model.js";
import mongoose from "mongoose";

/**
 * Creates a new Support ticket document.
 * @param {Object} ticketData 
 * @param {Object} user 
 * @returns {Promise<Object>}
 */
export const createTicket = async (ticketData, user = {}) => {
  let { vendorId, projectId, ticketId } = ticketData;

  // 1. Resolve vendor based on user role
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) {
      throw new Error("Vendor profile not found for authenticated user");
    }
    vendorId = vendor._id.toString();
    ticketData.vendorId = vendor._id;
    ticketData.vendorName = vendor.companyName;
    ticketData.initials = vendor.initials || "";
    ticketData.avatarBg = vendor.avatarBg || "#C87A65";
  } else {
    if (!vendorId) {
      throw new Error("Vendor ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      throw new Error("Invalid vendor ID format");
    }
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    if (!ticketData.vendorName || !ticketData.vendorName.trim()) {
      ticketData.vendorName = vendor.companyName;
    }
    if (!ticketData.initials || !ticketData.initials.trim()) {
      ticketData.initials = vendor.initials || "";
    }
    if (!ticketData.avatarBg || !ticketData.avatarBg.trim()) {
      ticketData.avatarBg = vendor.avatarBg || "#C87A65";
    }
  }

  // 2. Handle ticketId generation or uniqueness check
  if (user.role === "VENDOR" || !ticketId || !ticketId.trim()) {
    let uniqueId = false;
    let candidate = "";
    while (!uniqueId) {
      candidate = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = await Support.findOne({ ticketId: candidate });
      if (!existing) {
        uniqueId = true;
      }
    }
    ticketData.ticketId = candidate;
  } else {
    ticketData.ticketId = ticketId.trim();
    const existingTicket = await Support.findOne({ ticketId: ticketData.ticketId });
    if (existingTicket) {
      throw new Error("Ticket ID already exists");
    }
  }

  // 3. If projectId is supplied, verify Project exists
  let project = null;
  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID format");
    }
    project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // 4. Verify Project/Vendor assignment match if Project has a vendorId
    if (project.vendorId && project.vendorId.toString() !== vendorId.toString()) {
      throw new Error("Vendor ID does not match project assigned vendor");
    }
  }

  if (!ticketData.status) {
    ticketData.status = "Open";
  }
  if (!ticketData.priority) {
    ticketData.priority = "Medium";
  }

  ticketData.lastUpdate = new Date();

  const ticket = await Support.create(ticketData);
  return ticket;
};

/**
 * Retrieves support tickets with filtering, search, and vendor scoping.
 * @param {Object} query 
 * @param {Object} user 
 * @returns {Promise<Array>}
 */
export const getTickets = async (query = {}, user = {}) => {
  const filter = {};

  // VENDOR SCOPING
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) {
      return [];
    }
    filter.vendorId = vendor._id;
  } else if (query.vendorId && mongoose.Types.ObjectId.isValid(query.vendorId)) {
    filter.vendorId = query.vendorId;
  }

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.priority && query.priority !== "All") {
    filter.priority = query.priority;
  }

  if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
    filter.projectId = query.projectId;
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { ticketId: searchRegex },
      { vendorName: searchRegex },
      { subject: searchRegex },
      { description: searchRegex },
    ];
  }

  const tickets = await Support.find(filter)
    .populate("vendorId", "companyName contactName initials avatarBg location status")
    .populate("projectId", "projectId projectName client status")
    .sort({ createdAt: -1 });

  return tickets;
};

/**
 * Retrieves a single support ticket by Mongo _id or ticketId.
 * @param {String} id 
 * @param {Object} user 
 * @returns {Promise<Object>}
 */
export const getTicketById = async (id, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { ticketId: id }] }
    : { ticketId: id };

  const ticket = await Support.findOne(query)
    .populate("vendorId", "companyName contactName initials avatarBg location status")
    .populate("projectId", "projectId projectName client status");

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // VENDOR SCOPING
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    const ticketVendorId = ticket.vendorId._id
      ? ticket.vendorId._id.toString()
      : ticket.vendorId.toString();

    if (!vendor || ticketVendorId !== vendor._id.toString()) {
      const error = new Error("Forbidden: You do not have permission to view this ticket");
      error.statusCode = 403;
      throw error;
    }
  }

  return ticket;
};

/**
 * Updates a support ticket (Admin/Super Admin only).
 * @param {String} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateTicket = async (id, updateData) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { ticketId: id }] }
    : { ticketId: id };

  const ticket = await Support.findOne(query);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Prevent duplicate ticketId if changed
  if (updateData.ticketId && updateData.ticketId.trim() !== ticket.ticketId) {
    const existing = await Support.findOne({ ticketId: updateData.ticketId.trim() });
    if (existing) {
      throw new Error("Ticket ID already exists");
    }
  }

  let targetVendorId = ticket.vendorId;
  let targetProjectId = ticket.projectId;

  if (updateData.vendorId) {
    if (!mongoose.Types.ObjectId.isValid(updateData.vendorId)) {
      throw new Error("Invalid vendor ID format");
    }
    const vendor = await Vendor.findById(updateData.vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    targetVendorId = vendor._id;
    if (!updateData.vendorName) {
      updateData.vendorName = vendor.companyName;
    }
    if (!updateData.initials) {
      updateData.initials = vendor.initials || "";
    }
    if (!updateData.avatarBg) {
      updateData.avatarBg = vendor.avatarBg || "#C87A65";
    }
  }

  if (updateData.projectId) {
    if (!mongoose.Types.ObjectId.isValid(updateData.projectId)) {
      throw new Error("Invalid project ID format");
    }
    const project = await Project.findById(updateData.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    targetProjectId = project._id;
  }

  if (targetProjectId) {
    const projectToCheck = await Project.findById(targetProjectId);
    if (projectToCheck && projectToCheck.vendorId) {
      if (projectToCheck.vendorId.toString() !== targetVendorId.toString()) {
        throw new Error("Vendor ID does not match project assigned vendor");
      }
    }
  }

  updateData.lastUpdate = new Date();

  Object.assign(ticket, updateData);
  await ticket.save();

  return await Support.findById(ticket._id)
    .populate("vendorId", "companyName contactName initials avatarBg location status")
    .populate("projectId", "projectId projectName client status");
};

/**
 * Updates support ticket status (Admin/Super Admin only).
 * @param {String} id 
 * @param {String} status 
 * @returns {Promise<Object>}
 */
export const updateTicketStatus = async (id, status) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { ticketId: id }] }
    : { ticketId: id };

  const ticket = await Support.findOne(query);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  ticket.status = status;
  ticket.lastUpdate = new Date();

  await ticket.save();

  return await Support.findById(ticket._id)
    .populate("vendorId", "companyName contactName initials avatarBg location status")
    .populate("projectId", "projectId projectName client status");
};

/**
 * Calculates aggregate ticket statistics from database.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const getTicketStats = async (user = {}) => {
  const filter = {};

  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) {
      return {
        totalTickets: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        avgResponse: "N/A",
      };
    }
    filter.vendorId = vendor._id;
  }

  const totalTickets = await Support.countDocuments(filter);
  const open = await Support.countDocuments({ ...filter, status: "Open" });
  const inProgress = await Support.countDocuments({ ...filter, status: "In Progress" });
  const resolved = await Support.countDocuments({ ...filter, status: "Resolved" });
  const closed = await Support.countDocuments({ ...filter, status: "Closed" });

  const stats = {
    totalTickets,
    open,
    inProgress,
    resolved,
    closed,
  };

  if (user.role === "VENDOR") {
    stats.avgResponse = "N/A";
  }

  return stats;
};
