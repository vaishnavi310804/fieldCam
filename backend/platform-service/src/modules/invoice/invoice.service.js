import Invoice from "./invoice.model.js";
import Project from "../project/project.model.js";
import Vendor from "../vendor/vendor.model.js";
import User from "../users/user.model.js";
import mongoose from "mongoose";
import { createNotification } from "../notification/notification.service.js";
import { logAuditEvent } from "../audit/audit.service.js";
import { sendInvoiceEmail } from "./invoice.email.js";
import { generateInvoicePdf } from "./invoice.pdf.js";

const getVendorUserId = async (vendorId) => {
  if (!vendorId) return null;
  const vendor = await Vendor.findById(vendorId);
  return vendor ? vendor.userId : null;
};


export const calculateLineItems = (rawItems = []) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      processedItems: [],
      subtotal: 0,
      tax: 0,
      totalAmount: 0,
      amount: 0,
    };
  }

  const processedItems = rawItems.map((item, idx) => {
    const description = (item.description || "").trim();
    if (!description) {
      const err = new Error(`Line item #${idx + 1} requires a valid description`);
      err.statusCode = 400;
      throw err;
    }

    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      const err = new Error(
        `Line item "${description}" must have a positive whole-number quantity`
      );
      err.statusCode = 400;
      throw err;
    }

    const rate = Number(item.rate);
    if (!Number.isFinite(rate) || rate < 0) {
      const err = new Error(
        `Line item "${description}" must have rate greater than or equal to 0`
      );
      err.statusCode = 400;
      throw err;
    }
    const rateStr = String(item.rate).trim();
    const dotIndex = rateStr.indexOf(".");
    if (dotIndex !== -1 && rateStr.length - dotIndex - 1 > 2) {
      const err = new Error(
        `Line item "${description}" rate cannot have more than 2 decimal places`
      );
      err.statusCode = 400;
      throw err;
    }

    const lineAmount = Math.round(qty * rate * 100) / 100;

    return {
      description,
      quantity: qty,
      rate,
      amount: lineAmount,
    };
  });

  const subtotal = Math.round(
    processedItems.reduce((sum, item) => sum + item.amount, 0) * 100
  ) / 100;

  // Phase 1 rule: Tax is strictly 0, Total must equal server subtotal
  const tax = 0;
  const totalAmount = subtotal;

  return {
    processedItems,
    subtotal,
    tax,
    totalAmount,
    amount: subtotal,
  };
};

export const generateInvoiceNumber = async (project) => {
  const baseCode = project.projectId || `PRJ-${project._id.toString().slice(-6).toUpperCase()}`;
  const candidate = `INV-${baseCode}`;

  const existing = await Invoice.findOne({ invoiceId: candidate });
  if (!existing) {
    return candidate;
  }

  // If collision with legacy, append suffix and ensure uniqueness
  let uniqueCandidate = `${candidate}-${Date.now().toString().slice(-4)}`;
  let collision = await Invoice.findOne({ invoiceId: uniqueCandidate });
  while (collision) {
    uniqueCandidate = `${candidate}-${Math.floor(1000 + Math.random() * 9000)}`;
    collision = await Invoice.findOne({ invoiceId: uniqueCandidate });
  }
  return uniqueCandidate;
};

export const createInvoice = async (invoiceData, user = {}) => {
  const { projectId, items = [], invoiceDate, dueDate, notes, status: requestedStatus } = invoiceData;

  // 1. Resolve Project (by ObjectId or projectId code)
  let project = null;
  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    project = await Project.findById(projectId);
  }
  if (!project && projectId) {
    project = await Project.findOne({ projectId: String(projectId).trim() });
  }

  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  // 2. Verify project approval eligibility (strictly Approved; Completed cannot be invoiced)
  const statusNormalized = (project.status || "").trim().toLowerCase();
  if (statusNormalized === "completed") {
    const err = new Error(
      "Project is completed and already paid. Invoices cannot be created for completed projects."
    );
    err.statusCode = 400;
    throw err;
  }
  if (statusNormalized !== "approved") {
    const err = new Error(
      `Project is not eligible for invoicing. Project status must be "Approved", currently "${project.status}"`
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Resolve Vendor Profile
  let vendor = null;
  if (user.role === "VENDOR") {
    vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) {
      const err = new Error("Vendor profile not found for authenticated user");
      err.statusCode = 403;
      throw err;
    }

    // Verify vendor ownership of project
    const projectVendorIdStr = project.vendorId?._id
      ? project.vendorId._id.toString()
      : project.vendorId
      ? project.vendorId.toString()
      : null;

    if (!projectVendorIdStr || projectVendorIdStr !== vendor._id.toString()) {
      const err = new Error("Access denied: You are not assigned to this project");
      err.statusCode = 403;
      throw err;
    }
  } else {
    // Admin / Super Admin creation
    const targetVendorId = invoiceData.vendorId || project.vendorId;
    if (!targetVendorId || !mongoose.Types.ObjectId.isValid(targetVendorId)) {
      const err = new Error("Vendor ID is required for invoice creation");
      err.statusCode = 400;
      throw err;
    }
    vendor = await Vendor.findById(targetVendorId);
    if (!vendor) {
      const err = new Error("Vendor not found");
      err.statusCode = 404;
      throw err;
    }

    if (project.vendorId && project.vendorId.toString() !== vendor._id.toString()) {
      const err = new Error("Vendor ID does not match project assigned vendor");
      err.statusCode = 400;
      throw err;
    }
  }

  // 4. Verify Company Boundary (if present)
  if (user.role === "VENDOR") {
    const vendorUser = await User.findById(user.id);
    if (vendorUser?.companyId && project.companyId) {
      if (vendorUser.companyId.toString() !== project.companyId.toString()) {
        const err = new Error("Access denied: Project does not belong to your company");
        err.statusCode = 403;
        throw err;
      }
    }
  }

  // 5. Allow ONLY ONE invoice per project
  const existingProjectInvoice = await Invoice.findOne({ projectId: project._id });
  if (existingProjectInvoice) {
    const err = new Error(
      `An invoice (${existingProjectInvoice.invoiceId}) already exists for project "${project.projectName}"`
    );
    err.statusCode = 409;
    throw err;
  }

  // 6. Calculate Line Items & Server Totals
  let calculation;
  if (Array.isArray(items) && items.length > 0) {
    calculation = calculateLineItems(items);
  } else if (invoiceData.amount !== undefined && !isNaN(Number(invoiceData.amount))) {
    // Backward compatibility for legacy admin creation
    const legacyAmount = Number(invoiceData.amount);
    calculation = calculateLineItems([
      {
        description: invoiceData.projectTitle || project.projectName || "Project Services",
        quantity: 1,
        rate: legacyAmount,
      },
    ]);
  } else {
    calculation = {
      processedItems: [],
      subtotal: 0,
      tax: 0,
      totalAmount: 0,
      amount: 0,
    };
  }

  // 7. Validate Status & Lifecycle Transitions
  let initialStatus = requestedStatus || (user.role === "VENDOR" ? "Draft" : "Pending");
  if (user.role === "VENDOR") {
    if (!["Draft", "Submitted"].includes(initialStatus)) {
      initialStatus = "Draft";
    }
  }

  // If submitting immediately, validate requirements
  if (initialStatus === "Submitted") {
    if (calculation.processedItems.length === 0) {
      const err = new Error("Cannot submit invoice without at least one line item");
      err.statusCode = 400;
      throw err;
    }
    if (calculation.totalAmount <= 0) {
      const err = new Error("Cannot submit invoice with total amount of zero");
      err.statusCode = 400;
      throw err;
    }
    if (!dueDate) {
      const err = new Error("Due date is required when submitting an invoice");
      err.statusCode = 400;
      throw err;
    }
  }

  // 8. Validate Dates
  const parsedInvoiceDate = invoiceDate ? new Date(invoiceDate) : new Date();
  if (isNaN(parsedInvoiceDate.getTime())) {
    const err = new Error("Invalid invoice date format");
    err.statusCode = 400;
    throw err;
  }

  let parsedDueDate = null;
  if (dueDate) {
    parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      const err = new Error("Invalid due date format");
      err.statusCode = 400;
      throw err;
    }
    if (parsedDueDate < parsedInvoiceDate) {
      const err = new Error("Due date cannot be earlier than invoice date");
      err.statusCode = 400;
      throw err;
    }
  }

  // 9. Generate Unique Invoice Number (Backend authoritative)
  const invoiceId = await generateInvoiceNumber(project);

  // 10. Build Review History Entry
  const initialAction = initialStatus === "Submitted" ? "SUBMITTED" : "DRAFT_SAVED";
  const initialHistory = [
    {
      action: initialAction,
      actorId: user.id || null,
      actorRole: user.role || "SYSTEM",
      actorEmail: user.email || null,
      reason: null,
      timestamp: new Date(),
    },
  ];

  // 11. Create Document
  let invoice;
  try {
    invoice = await Invoice.create({
      invoiceId,
      projectId: project._id,
      projectTitle: project.projectName,
      vendorId: vendor._id,
      vendorName: vendor.companyName,
      companyId: project.companyId || null,
      items: calculation.processedItems,
      subtotal: calculation.subtotal,
      amount: calculation.amount,
      tax: 0,
      totalAmount: calculation.totalAmount,
      status: initialStatus,
      invoiceDate: parsedInvoiceDate,
      dueDate: parsedDueDate,
      notes: notes || "",
      paymentDate: initialStatus === "Paid" ? new Date() : null,
      reviewHistory: initialHistory,
    });
  } catch (dbErr) {
    // Catch Mongo duplicate key errors (E11000) for concurrency protection
    if (dbErr.code === 11000) {
      const keyField = dbErr.keyPattern?.projectId ? "project" : "invoice ID";
      const err = new Error(`An invoice already exists for this ${keyField}`);
      err.statusCode = 409;
      throw err;
    }
    throw dbErr;
  }

  // 12. Notify Vendor or Admin if applicable
  if (invoice && invoice.vendorId) {
    try {
      const vendorUserId = await getVendorUserId(invoice.vendorId);
      if (vendorUserId && user.role !== "VENDOR") {
        await createNotification({
          userId: vendorUserId,
          title: "New Invoice Created",
          body: `Invoice ${invoice.invoiceId} for $${invoice.totalAmount} has been created.`,
          type: "INVOICE_UPDATED",
          data: {
            invoiceId: invoice._id.toString(),
            invoiceCode: invoice.invoiceId,
            projectId: invoice.projectId.toString(),
          },
        });
      }
    } catch (notifErr) {
      console.warn("Failed to dispatch invoice creation notification:", notifErr.message);
    }
  }

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client location status deadline companyId")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Previews invoice data for an approved project.
 */
export const getInvoicePreview = async (projectId, user = {}) => {
  if (!projectId) {
    const err = new Error("Project ID is required");
    err.statusCode = 400;
    throw err;
  }

  let project = null;
  if (mongoose.Types.ObjectId.isValid(projectId)) {
    project = await Project.findById(projectId)
      .populate("serviceId", "serviceCategory serviceTypeName defaultPrice")
      .populate("vendorId", "companyName contactName location rating status");
  }
  if (!project) {
    project = await Project.findOne({ projectId: String(projectId).trim() })
      .populate("serviceId", "serviceCategory serviceTypeName defaultPrice")
      .populate("vendorId", "companyName contactName location rating status");
  }

  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  // If vendor, check ownership
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    const projectVendorIdStr = project.vendorId?._id
      ? project.vendorId._id.toString()
      : project.vendorId
      ? project.vendorId.toString()
      : null;

    if (!vendor || !projectVendorIdStr || projectVendorIdStr !== vendor._id.toString()) {
      const err = new Error("Access denied: You are not assigned to this project");
      err.statusCode = 403;
      throw err;
    }
  }

  const statusNormalized = (project.status || "").trim().toLowerCase();
  const isApproved = statusNormalized === "approved";
  const isCompleted = statusNormalized === "completed";
  const existingInvoice = await Invoice.findOne({ projectId: project._id })
    .populate("projectId", "projectId projectName client location status deadline")
    .populate("vendorId", "companyName contactName location");

  const isEligible = isApproved && !existingInvoice;
  let eligibilityReason = "Project is approved and ready for invoicing";
  if (isCompleted) {
    eligibilityReason = "Project is completed and already paid. Invoices cannot be created for completed projects.";
  } else if (!isApproved) {
    eligibilityReason = `Project status must be "Approved", currently "${project.status}"`;
  } else if (existingInvoice) {
    eligibilityReason = `An invoice (${existingInvoice.invoiceId}) already exists for this project`;
  }

  const defaultPrice = project.serviceId?.defaultPrice || 0;
  const suggestedItems = defaultPrice > 0
    ? [
        {
          description: project.serviceTypeName || project.projectName || "Field Services",
          quantity: 1,
          rate: defaultPrice,
          amount: defaultPrice,
        },
      ]
    : [];

  return {
    eligible: isEligible,
    eligibilityReason,
    hasExistingInvoice: !!existingInvoice,
    existingInvoice: existingInvoice || null,
    previewData: {
      suggestedInvoiceId: `INV-${project.projectId || "PRJ"}`,
      invoiceDate: new Date(),
      suggestedDueDate: project.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      project: {
        id: project._id,
        projectId: project.projectId,
        projectName: project.projectName,
        client: project.client,
        location: project.location,
        status: project.status,
      },
      vendor: project.vendorId
        ? {
            id: project.vendorId._id,
            companyName: project.vendorId.companyName,
            contactName: project.vendorId.contactName,
            location: project.vendorId.location,
          }
        : null,
      items: suggestedItems,
      subtotal: defaultPrice,
      tax: 0,
      totalAmount: defaultPrice,
    },
  };
};

/**
 * Lists invoices with vendor-scoping and query filtering.
 */
export const getInvoices = async (query = {}, user = {}) => {
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

  // Company boundaries for Admin/Staff
  if (["ADMIN", "STAFF"].includes(user.role) && user.companyId) {
    filter.companyId = user.companyId;
  }

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
    filter.projectId = query.projectId;
  }

  if (query.isOverdue === "true" || query.isOverdue === true) {
    filter.dueDate = { $lt: new Date(), $ne: null };
    filter.status = { $in: ["Submitted", "Pending", "Approved", "Sent"] };
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { invoiceId: searchRegex },
      { vendorName: searchRegex },
      { projectTitle: searchRegex },
    ];
  }

  const invoices = await Invoice.find(filter)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status")
    .sort({ createdAt: -1 });

  return invoices;
};

/**
 * Reads single invoice details by Mongo _id or invoiceId.
 */
export const getInvoiceById = async (id, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status")
    .populate("paidBy", "name email");

  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  // Vendor Scoping Security Check
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    const invoiceVendorId = invoice.vendorId?._id
      ? invoice.vendorId._id.toString()
      : invoice.vendorId?.toString();

    if (!vendor || invoiceVendorId !== vendor._id.toString()) {
      const err = new Error("Forbidden: You do not have permission to view this invoice");
      err.statusCode = 403;
      throw err;
    }
  }

  return invoice;
};

/**
 * Updates an invoice (Vendor edits draft/rejected, or Admin updates).
 */
export const updateInvoice = async (id, updateData, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  // Vendor Permission & Lifecycle Guard
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor || invoice.vendorId.toString() !== vendor._id.toString()) {
      const err = new Error("Forbidden: You do not have permission to edit this invoice");
      err.statusCode = 403;
      throw err;
    }

    // Vendors can ONLY edit Drafts or Rejected invoices
    if (!["Draft", "Rejected"].includes(invoice.status)) {
      const err = new Error(
        `Cannot edit invoice in "${invoice.status}" status. Only Draft or Rejected invoices can be edited.`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  // If items updated, recalculate on server
  if (Array.isArray(updateData.items)) {
    const calculation = calculateLineItems(updateData.items);
    invoice.items = calculation.processedItems;
    invoice.subtotal = calculation.subtotal;
    invoice.amount = calculation.amount;
    invoice.tax = 0;
    invoice.totalAmount = calculation.totalAmount;
  } else if (updateData.amount !== undefined && user.role !== "VENDOR") {
    const numAmount = Number(updateData.amount);
    invoice.amount = numAmount;
    invoice.subtotal = numAmount;
    invoice.tax = 0;
    invoice.totalAmount = numAmount;
  }

  if (updateData.dueDate !== undefined) {
    if (updateData.dueDate) {
      const parsedDue = new Date(updateData.dueDate);
      if (isNaN(parsedDue.getTime())) {
        const err = new Error("Invalid due date format");
        err.statusCode = 400;
        throw err;
      }
      invoice.dueDate = parsedDue;
    } else {
      invoice.dueDate = null;
    }
  }

  if (updateData.invoiceDate) {
    const parsedInv = new Date(updateData.invoiceDate);
    if (!isNaN(parsedInv.getTime())) {
      invoice.invoiceDate = parsedInv;
    }
  }

  if (updateData.notes !== undefined) {
    invoice.notes = updateData.notes;
  }

  // If vendor requests submission or resubmission
  const isResubmission = invoice.status === "Rejected" && updateData.submit;
  const isDraftSubmit = invoice.status === "Draft" && updateData.submit;

  if (isDraftSubmit || isResubmission) {
    if (invoice.items.length === 0) {
      const err = new Error("Cannot submit invoice without at least one line item");
      err.statusCode = 400;
      throw err;
    }
    for (const item of invoice.items) {
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
        const err = new Error(
          `Cannot submit invoice: line item "${item.description}" has an invalid quantity (${item.quantity}). Quantity must be a positive whole number.`
        );
        err.statusCode = 400;
        throw err;
      }
      const rate = Number(item.rate);
      if (!Number.isFinite(rate) || rate < 0) {
        const err = new Error(
          `Cannot submit invoice: line item "${item.description}" has an invalid rate (${item.rate}). Rate must be a non-negative number.`
        );
        err.statusCode = 400;
        throw err;
      }
      const rateStr = String(item.rate).trim();
      const dotIdx = rateStr.indexOf(".");
      if (dotIdx !== -1 && rateStr.length - dotIdx - 1 > 2) {
        const err = new Error(
          `Cannot submit invoice: line item "${item.description}" has an invalid rate (${item.rate}). Rate cannot have more than 2 decimal places.`
        );
        err.statusCode = 400;
        throw err;
      }
    }
    if (!invoice.dueDate) {
      const err = new Error("Due date is required when submitting an invoice");
      err.statusCode = 400;
      throw err;
    }

    invoice.status = "Submitted";
    invoice.rejectionReason = null;
    invoice.reviewHistory.push({
      action: isResubmission ? "RESUBMITTED" : "SUBMITTED",
      actorId: user.id || null,
      actorRole: user.role || "VENDOR",
      actorEmail: user.email || null,
      reason: null,
      timestamp: new Date(),
    });
  } else {
    invoice.reviewHistory.push({
      action: "DRAFT_SAVED",
      actorId: user.id || null,
      actorRole: user.role || "SYSTEM",
      actorEmail: user.email || null,
      reason: null,
      timestamp: new Date(),
    });
  }

  await invoice.save();

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Submits a Draft or Rejected invoice for Admin review.
 */
export const submitInvoice = async (id, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor || invoice.vendorId.toString() !== vendor._id.toString()) {
      const err = new Error("Forbidden: You do not have permission to submit this invoice");
      err.statusCode = 403;
      throw err;
    }
  }

  if (!["Draft", "Rejected"].includes(invoice.status)) {
    const err = new Error(
      `Cannot submit invoice in "${invoice.status}" status. Only Draft or Rejected invoices can be submitted.`
    );
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
    const err = new Error("Cannot submit invoice without at least one line item");
    err.statusCode = 400;
    throw err;
  }

  for (const item of invoice.items) {
    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      const err = new Error(
        `Cannot submit invoice: line item "${item.description}" has an invalid quantity (${item.quantity}). Quantity must be a positive whole number.`
      );
      err.statusCode = 400;
      throw err;
    }
    const rate = Number(item.rate);
    if (!Number.isFinite(rate) || rate < 0) {
      const err = new Error(
        `Cannot submit invoice: line item "${item.description}" has an invalid rate (${item.rate}). Rate must be a non-negative number.`
      );
      err.statusCode = 400;
      throw err;
    }
    const rateStr = String(item.rate).trim();
    const dotIdx = rateStr.indexOf(".");
    if (dotIdx !== -1 && rateStr.length - dotIdx - 1 > 2) {
      const err = new Error(
        `Cannot submit invoice: line item "${item.description}" has an invalid rate (${item.rate}). Rate cannot have more than 2 decimal places.`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  if (!invoice.dueDate) {
    const err = new Error("Due date is required when submitting an invoice");
    err.statusCode = 400;
    throw err;
  }

  const isResubmission = invoice.status === "Rejected";
  invoice.status = "Submitted";
  invoice.rejectionReason = null;
  invoice.reviewHistory.push({
    action: isResubmission ? "RESUBMITTED" : "SUBMITTED",
    actorId: user.id || null,
    actorRole: user.role || "VENDOR",
    actorEmail: user.email || null,
    reason: null,
    timestamp: new Date(),
  });

  await invoice.save();

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Admin reviews (Approves or Rejects) a submitted invoice.
 */
export const reviewInvoice = async (id, { action, rejectionReason }, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  // Invoice must be in reviewable state
  if (!["Submitted", "Pending"].includes(invoice.status)) {
    const err = new Error(
      `Only invoices awaiting review can be reviewed. Current status: "${invoice.status}"`
    );
    err.statusCode = 400;
    throw err;
  }

  const normalizedAction = (action || "").trim().toUpperCase();

  if (normalizedAction === "APPROVE") {
    invoice.status = "Approved";
    invoice.rejectionReason = null;
    invoice.reviewHistory.push({
      action: "APPROVED",
      actorId: user.id || null,
      actorRole: user.role || "ADMIN",
      actorEmail: user.email || null,
      reason: null,
      timestamp: new Date(),
    });

    await invoice.save();

    // Notify vendor of approval
    try {
      const vendorUserId = await getVendorUserId(invoice.vendorId);
      if (vendorUserId) {
        await createNotification({
          userId: vendorUserId,
          title: "Invoice Approved",
          body: `Invoice ${invoice.invoiceId} for $${invoice.totalAmount} has been approved.`,
          type: "INVOICE_UPDATED",
          data: {
            invoiceId: invoice._id.toString(),
            invoiceCode: invoice.invoiceId,
            status: "Approved",
          },
        });
      }
    } catch (notifErr) {
      console.warn("Failed to notify vendor of invoice approval:", notifErr.message);
    }
  } else if (normalizedAction === "REJECT") {
    const reason = (rejectionReason || "").trim();
    if (!reason) {
      const err = new Error("Rejection reason is required when rejecting an invoice");
      err.statusCode = 400;
      throw err;
    }

    invoice.status = "Rejected";
    invoice.rejectionReason = reason;
    invoice.reviewHistory.push({
      action: "REJECTED",
      actorId: user.id || null,
      actorRole: user.role || "ADMIN",
      actorEmail: user.email || null,
      reason,
      timestamp: new Date(),
    });

    await invoice.save();

    // Notify vendor of rejection
    try {
      const vendorUserId = await getVendorUserId(invoice.vendorId);
      if (vendorUserId) {
        await createNotification({
          userId: vendorUserId,
          title: "Invoice Rejected",
          body: `Invoice ${invoice.invoiceId} was rejected: ${reason}`,
          type: "INVOICE_UPDATED",
          data: {
            invoiceId: invoice._id.toString(),
            invoiceCode: invoice.invoiceId,
            status: "Rejected",
            rejectionReason: reason,
          },
        });
      }
    } catch (notifErr) {
      console.warn("Failed to notify vendor of invoice rejection:", notifErr.message);
    }
  } else {
    const err = new Error('Review action must be either "APPROVE" or "REJECT"');
    err.statusCode = 400;
    throw err;
  }

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Sends an approved invoice to the client.
 * If sending fails, invoice remains Approved and retryable.
 */
export const sendInvoice = async (id, options = {}, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  if (invoice.status !== "Approved") {
    const err = new Error(
      `Only approved invoices can be sent. Current status: "${invoice.status}"`
    );
    err.statusCode = 400;
    throw err;
  }

  const project = await Project.findById(invoice.projectId?._id || invoice.projectId);
  const vendor = await Vendor.findById(invoice.vendorId?._id || invoice.vendorId);

  // Generate authoritative invoice PDF buffer
  let pdfBuffer;
  try {
    pdfBuffer = await generateInvoicePdf(invoice, project || {}, vendor || {});
  } catch (pdfErr) {
    const err = new Error(`Failed to generate invoice PDF: ${pdfErr.message}`);
    err.statusCode = 500;
    throw err;
  }

  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    const err = new Error("Failed to generate invoice PDF: generated buffer is empty");
    err.statusCode = 500;
    throw err;
  }

  // Attempt send via email service
  // If this throws, status remains Approved and retryable!
  const sendResult = await sendInvoiceEmail({
    to: options.recipientEmail,
    invoice,
    project,
    vendor,
    pdfBuffer,
    simulateFailure: options.simulateFailure === true,
  });

  // Only transition upon confirmed success
  invoice.status = "Sent";
invoice.sentAt = sendResult.sentAt || new Date();
invoice.sentTo = sendResult.recipient;

invoice.reviewHistory.push({
  action: "SENT",
  actorId: user.id || null,
  actorRole: user.role || "ADMIN",
  actorEmail: user.email || null,
  reason: `Delivered to ${sendResult.recipient}`,
  timestamp: new Date(),
});

  await invoice.save();

  // Notify vendor that invoice was sent
  try {
    const vendorUserId = await getVendorUserId(invoice.vendorId);
    if (vendorUserId) {
      await createNotification({
        userId: vendorUserId,
        title: "Invoice Sent",
        body: `Invoice ${invoice.invoiceId} has been sent to ${sendResult.recipient}.`,
        type: "INVOICE_UPDATED",
        data: {
          invoiceId: invoice._id.toString(),
          invoiceCode: invoice.invoiceId,
          status: "Sent",
        },
      });
    }
  } catch (notifErr) {
    console.warn("Failed to notify vendor of invoice send:", notifErr.message);
  }

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Records payment for an invoice.
 * Restricted to SUPER_ADMIN and ADMIN.
 */
export const recordPayment = async (id, paymentData = {}, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  // Idempotency: Reject if already paid
  if (invoice.status === "Paid") {
    const err = new Error("Invoice is already paid");
    err.statusCode = 400;
    throw err;
  }

  // Must be in Sent status (or legacy Pending) before payment can be recorded
  if (invoice.status !== "Sent" && invoice.status !== "Pending") {
    const err = new Error(
      `Cannot record payment for an invoice with status "${invoice.status}". Invoice must be in "Sent" status before recording payment.`
    );
    err.statusCode = 400;
    throw err;
  }

  let parsedPaymentDate = new Date();
  if (paymentData.paymentDate) {
    const pDate = new Date(paymentData.paymentDate);
    if (isNaN(pDate.getTime())) {
      const err = new Error("Invalid payment date format");
      err.statusCode = 400;
      throw err;
    }
    parsedPaymentDate = pDate;
  }

  const project = await Project.findById(invoice.projectId);
  if (!project) {
    const err = new Error("Associated project not found for invoice");
    err.statusCode = 404;
    throw err;
  }

  invoice.status = "Paid";
  invoice.paymentDate = parsedPaymentDate;
  invoice.paymentMethod = paymentData.paymentMethod || "Bank Transfer";
  invoice.paymentNotes = paymentData.paymentNotes || "";
  invoice.paidBy = user.id || null;

  invoice.reviewHistory.push({
    action: "PAID",
    actorId: user.id || null,
    actorRole: user.role || "ADMIN",
    actorEmail: user.email || null,
    reason: `Payment recorded via ${invoice.paymentMethod}`,
    timestamp: new Date(),
  });

  project.status = "Completed";

  // Atomically persist both records within a MongoDB transaction session
  let session = null;
  let transactionActive = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    transactionActive = true;
  } catch (sessErr) {
    session = null;
    transactionActive = false;
  }

  try {
    const saveOpts = session && transactionActive ? { session } : {};
    await invoice.save(saveOpts);
    await project.save(saveOpts);

    if (session && transactionActive) {
      await session.commitTransaction();
    }
  } catch (saveErr) {
    if (session && transactionActive) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.warn("Failed to abort transaction:", abortErr.message);
      }
    }
    throw saveErr;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // Log project completion audit event (only after verified DB commit)
  try {
    await logAuditEvent({
      actor: user,
      action: "PROJECT_STATUS_CHANGED",
      entityType: "Project",
      entityId: project.projectId || project._id.toString(),
      description: `Project "${project.projectName}" marked as Completed upon payment of Invoice ${invoice.invoiceId}`,
      metadata: {
        projectId: project.projectId,
        previousStatus: "Approved",
        newStatus: "Completed",
        invoiceId: invoice.invoiceId,
      },
    });
  } catch (auditErr) {
    console.warn("Failed to log project completion audit event:", auditErr.message);
  }

  // Notify assigned vendor of project completion (only after verified DB commit)
  try {
    const vendorUserId = await getVendorUserId(invoice.vendorId);
    if (vendorUserId) {
      await createNotification({
        userId: vendorUserId,
        title: "Project Completed",
        body: `Project "${project.projectName}" (${project.projectId}) is now marked as Completed following payment receipt.`,
        type: "PROJECT_UPDATED",
        data: {
          projectId: project._id.toString(),
          projectCode: project.projectId,
          status: "Completed",
        },
      });
    }
  } catch (notifErr) {
    console.warn("Failed to notify vendor of project completion:", notifErr.message);
  }

  // Notify vendor of recorded payment
  try {
    const vendorUserId = await getVendorUserId(invoice.vendorId);
    if (vendorUserId) {
      await createNotification({
        userId: vendorUserId,
        title: "Invoice Paid",
        body: `Payment of $${invoice.totalAmount} for Invoice ${invoice.invoiceId} has been recorded.`,
        type: "INVOICE_UPDATED",
        data: {
          invoiceId: invoice._id.toString(),
          invoiceCode: invoice.invoiceId,
          status: "Paid",
          paymentDate: invoice.paymentDate,
        },
      });
    }
  } catch (notifErr) {
    console.warn("Failed to notify vendor of recorded payment:", notifErr.message);
  }

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status deadline location")
    .populate("vendorId", "companyName contactName location status")
    .populate("paidBy", "name email");
};

/**
 * Legacy status update handler for backward compatibility.
 */
export const updateInvoiceStatus = async (id, status, user = {}) => {
  if (status === "Approved") {
    return await reviewInvoice(id, { action: "APPROVE" }, user);
  }
  if (status === "Rejected") {
    return await reviewInvoice(
      id,
      { action: "REJECT", rejectionReason: "Rejected by Administrator" },
      user
    );
  }
  if (status === "Paid") {
    return await recordPayment(id, {}, user);
  }
  if (status === "Sent") {
    return await sendInvoice(id, {}, user);
  }

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.statusCode = 404;
    throw err;
  }

  invoice.status = status;
  invoice.reviewHistory.push({
    action: "STATUS_CHANGED",
    actorId: user.id || null,
    actorRole: user.role || "ADMIN",
    actorEmail: user.email || null,
    reason: `Status set to ${status}`,
    timestamp: new Date(),
  });

  await invoice.save();
  return invoice;
};

/**
 * Computes shared earnings and invoice statistics with rigorous category isolation.
 */
export const getInvoiceStats = async (user = {}, query = {}) => {
  const filter = {};

  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) {
      return {
        totalInvoiced: 0,
        awaitingReview: { count: 0, amount: 0 },
        approvedAwaitingPayment: { count: 0, amount: 0 },
        actualPaidEarnings: { count: 0, amount: 0 },
        overdueUnpaid: { count: 0, amount: 0 },
        paidThisMonth: { count: 0, amount: 0 },
        drafts: { count: 0, amount: 0 },
        totalOutstanding: 0,
        pendingReview: 0,
        approved: 0,
      };
    }
    filter.vendorId = vendor._id;
  } else if (query.vendorId && mongoose.Types.ObjectId.isValid(query.vendorId)) {
    filter.vendorId = new mongoose.Types.ObjectId(query.vendorId);
  }

  // Company boundaries for Admin/Staff
  if (["ADMIN", "STAFF"].includes(user.role) && user.companyId) {
    filter.companyId = user.companyId;
  }

  const allInvoices = await Invoice.find(filter).lean();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  let totalInvoiced = 0;
  let awaitingReviewAmount = 0;
  let awaitingReviewCount = 0;
  let approvedAwaitingPaymentAmount = 0;
  let approvedAwaitingPaymentCount = 0;
  let actualPaidEarningsAmount = 0;
  let actualPaidEarningsCount = 0;
  let overdueUnpaidAmount = 0;
  let overdueUnpaidCount = 0;
  let paidThisMonthAmount = 0;
  let paidThisMonthCount = 0;
  let draftCount = 0;
  let draftAmount = 0;

  allInvoices.forEach((inv) => {
    const total = Number(inv.totalAmount || inv.amount || 0);

    // 1. Drafts
    if (inv.status === "Draft") {
      draftCount++;
      draftAmount += total;
      return;
    }

    // 2. Total Invoiced (all submitted/approved/sent/paid)
    if (["Submitted", "Pending", "Approved", "Sent", "Paid"].includes(inv.status)) {
      totalInvoiced += total;
    }

    // 3. Awaiting Review
    if (["Submitted", "Pending"].includes(inv.status)) {
      awaitingReviewCount++;
      awaitingReviewAmount += total;
    }

    // 4. Approved & Sent (Awaiting Payment)
    if (["Approved", "Sent"].includes(inv.status)) {
      approvedAwaitingPaymentCount++;
      approvedAwaitingPaymentAmount += total;
    }

    // 5. Actual Paid
    if (inv.status === "Paid") {
      actualPaidEarningsCount++;
      actualPaidEarningsAmount += total;

      if (inv.paymentDate) {
        const pDate = new Date(inv.paymentDate);
        if (pDate >= startOfMonth && pDate <= endOfMonth) {
          paidThisMonthCount++;
          paidThisMonthAmount += total;
        }
      }
    }

    // 6. Overdue Unpaid (DueDate passed and not Paid)
    if (["Submitted", "Pending", "Approved", "Sent"].includes(inv.status)) {
      if (inv.dueDate) {
        const dDate = new Date(inv.dueDate);
        if (dDate < now) {
          overdueUnpaidCount++;
          overdueUnpaidAmount += total;
        }
      }
    }
  });

  return {
    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
    awaitingReview: {
      count: awaitingReviewCount,
      amount: Math.round(awaitingReviewAmount * 100) / 100,
    },
    approvedAwaitingPayment: {
      count: approvedAwaitingPaymentCount,
      amount: Math.round(approvedAwaitingPaymentAmount * 100) / 100,
    },
    actualPaidEarnings: {
      count: actualPaidEarningsCount,
      amount: Math.round(actualPaidEarningsAmount * 100) / 100,
    },
    overdueUnpaid: {
      count: overdueUnpaidCount,
      amount: Math.round(overdueUnpaidAmount * 100) / 100,
    },
    paidThisMonth: Math.round(paidThisMonthAmount * 100) / 100,
    drafts: {
      count: draftCount,
      amount: Math.round(draftAmount * 100) / 100,
    },
    // Backward compatibility for existing Admin and Vendor dashboards
    totalOutstanding: Math.round(
      (awaitingReviewAmount + approvedAwaitingPaymentAmount) * 100
    ) / 100,
    pendingReview: awaitingReviewCount,
    approved: approvedAwaitingPaymentCount,
  };
};

/**
 * Aggregates monthly payment overview.
 */
export const getInvoiceOverview = async (user = {}, query = {}) => {
  const matchFilter = {
    status: "Paid",
    paymentDate: { $ne: null },
  };

  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) return [];
    matchFilter.vendorId = vendor._id;
  } else if (query.vendorId && mongoose.Types.ObjectId.isValid(query.vendorId)) {
    matchFilter.vendorId = new mongoose.Types.ObjectId(query.vendorId);
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const overview = await Invoice.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" },
        },
        amount: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return overview.map((item) => {
    const monthIndex = item._id.month - 1;
    const monthLabel = `${monthNames[monthIndex]} ${item._id.year}`;
    return {
      month: monthLabel,
      amount: Math.round(item.amount * 100) / 100,
      count: item.count,
      year: item._id.year,
      monthNum: item._id.month,
    };
  });
};

/**
 * Downloads invoice PDF document buffer.
 */
export const downloadInvoicePdf = async (id, user = {}) => {
  const invoice = await getInvoiceById(id, user);
  const project = await Project.findById(invoice.projectId);
  const vendor = await Vendor.findById(invoice.vendorId);

  const pdfBuffer = await generateInvoicePdf(invoice, project || {}, vendor || {});
  return {
    pdfBuffer,
    invoice,
    filename: `${invoice.invoiceId || "invoice"}.pdf`,
  };
};
