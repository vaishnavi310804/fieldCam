import Invoice from "./invoice.model.js";
import Project from "../project/project.model.js";
import Vendor from "../vendor/vendor.model.js";
import mongoose from "mongoose";

/**
 * Creates a new Invoice document.
 * @param {Object} invoiceData 
 * @returns {Promise<Object>}
 */
export const createInvoice = async (invoiceData) => {
  const { projectId, vendorId, amount, tax = 0, invoiceId } = invoiceData;

  // 1. Verify Project exists
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID format");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // 2. Verify Vendor exists
  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    throw new Error("Invalid vendor ID format");
  }
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // 3. Verify Project/Vendor assignment match if Project already has a vendorId
  if (project.vendorId && project.vendorId.toString() !== vendorId.toString()) {
    throw new Error("Vendor ID does not match project assigned vendor");
  }

  // 4. Derive projectTitle from Project.projectName when omitted
  if (!invoiceData.projectTitle || !invoiceData.projectTitle.trim()) {
    invoiceData.projectTitle = project.projectName;
  }

  // 5. Derive vendorName from Vendor.companyName when omitted
  if (!invoiceData.vendorName || !invoiceData.vendorName.trim()) {
    invoiceData.vendorName = vendor.companyName;
  }

  // 6. Prevent duplicate invoiceId
  const existingInvoice = await Invoice.findOne({ invoiceId: invoiceId.trim() });
  if (existingInvoice) {
    throw new Error("Invoice ID already exists");
  }

  // 7. Calculate totalAmount = amount + tax (do not trust client totalAmount)
  const numAmount = Number(amount);
  const numTax = Number(tax || 0);
  invoiceData.amount = numAmount;
  invoiceData.tax = numTax;
  invoiceData.totalAmount = numAmount + numTax;

  // 8. If status is Paid and paymentDate not supplied, set paymentDate
  if (invoiceData.status === "Paid" && !invoiceData.paymentDate) {
    invoiceData.paymentDate = new Date();
  }

  const invoice = await Invoice.create(invoiceData);
  return invoice;
};

/**
 * Retrieves invoices with filtering, search, pagination/sort, and vendor scoping.
 * @param {Object} query 
 * @param {Object} user 
 * @returns {Promise<Array>}
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

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
    filter.projectId = query.projectId;
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
    .populate("projectId", "projectId projectName client status")
    .populate("vendorId", "companyName contactName location status")
    .sort({ createdAt: -1 });

  return invoices;
};

/**
 * Retrieves a single invoice by MongoDB _id or invoiceId.
 * @param {String} id 
 * @param {Object} user 
 * @returns {Promise<Object>}
 */
export const getInvoiceById = async (id, user = {}) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query)
    .populate("projectId", "projectId projectName client status")
    .populate("vendorId", "companyName contactName location status");

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // VENDOR SCOPING
  if (user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id });
    const invoiceVendorId = invoice.vendorId._id
      ? invoice.vendorId._id.toString()
      : invoice.vendorId.toString();

    if (!vendor || invoiceVendorId !== vendor._id.toString()) {
      const error = new Error("Forbidden: You do not have permission to view this invoice");
      error.statusCode = 403;
      throw error;
    }
  }

  return invoice;
};

/**
 * Updates an invoice (Admin/Super Admin only).
 * @param {String} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateInvoice = async (id, updateData) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // If invoiceId is being updated, check uniqueness
  if (updateData.invoiceId && updateData.invoiceId.trim() !== invoice.invoiceId) {
    const existing = await Invoice.findOne({ invoiceId: updateData.invoiceId.trim() });
    if (existing) {
      throw new Error("Invoice ID already exists");
    }
  }

  let targetProjectId = invoice.projectId;
  let targetVendorId = invoice.vendorId;

  if (updateData.projectId) {
    if (!mongoose.Types.ObjectId.isValid(updateData.projectId)) {
      throw new Error("Invalid project ID format");
    }
    const project = await Project.findById(updateData.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    targetProjectId = project._id;
    if (!updateData.projectTitle) {
      updateData.projectTitle = project.projectName;
    }
  }

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
  }

  // Check relationship match
  const projectToCheck = await Project.findById(targetProjectId);
  if (projectToCheck && projectToCheck.vendorId) {
    if (projectToCheck.vendorId.toString() !== targetVendorId.toString()) {
      throw new Error("Vendor ID does not match project assigned vendor");
    }
  }

  // Recalculate totalAmount if amount or tax changes
  const numAmount = updateData.amount !== undefined ? Number(updateData.amount) : invoice.amount;
  const numTax = updateData.tax !== undefined ? Number(updateData.tax) : invoice.tax;
  updateData.amount = numAmount;
  updateData.tax = numTax;
  updateData.totalAmount = numAmount + numTax;

  // Handle status & paymentDate
  if (updateData.status === "Paid" && !invoice.paymentDate && !updateData.paymentDate) {
    updateData.paymentDate = new Date();
  }

  Object.assign(invoice, updateData);
  await invoice.save();

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Updates an invoice status (Admin/Super Admin only).
 * @param {String} id 
 * @param {String} status 
 * @returns {Promise<Object>}
 */
export const updateInvoiceStatus = async (id, status) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceId: id }] }
    : { invoiceId: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  invoice.status = status;

  if (status === "Paid" && !invoice.paymentDate) {
    invoice.paymentDate = new Date();
  }

  await invoice.save();

  return await Invoice.findById(invoice._id)
    .populate("projectId", "projectId projectName client status")
    .populate("vendorId", "companyName contactName location status");
};

/**
 * Calculates aggregate invoice statistics from database.
 * @returns {Promise<Object>}
 */
export const getInvoiceStats = async () => {
  // 1. Total Outstanding (Sum of totalAmount for Pending + Approved)
  const outstandingAgg = await Invoice.aggregate([
    { $match: { status: { $in: ["Pending", "Approved"] } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalOutstanding = outstandingAgg.length > 0 ? outstandingAgg[0].total : 0;

  // 2. Pending Review (Count of Pending)
  const pendingReview = await Invoice.countDocuments({ status: "Pending" });

  // 3. Approved (Count of Approved)
  const approved = await Invoice.countDocuments({ status: "Approved" });

  // 4. Paid This Month (Sum of totalAmount for Paid with paymentDate in current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const paidMonthAgg = await Invoice.aggregate([
    {
      $match: {
        status: "Paid",
        paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const paidThisMonth = paidMonthAgg.length > 0 ? paidMonthAgg[0].total : 0;

  return {
    totalOutstanding,
    pendingReview,
    approved,
    paidThisMonth,
  };
};

/**
 * Aggregates monthly payment overview from actual database data.
 * @returns {Promise<Array>}
 */
export const getInvoiceOverview = async () => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const overview = await Invoice.aggregate([
    {
      $match: {
        status: "Paid",
        paymentDate: { $ne: null },
      },
    },
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
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  return overview.map((item) => {
    const monthIndex = item._id.month - 1;
    const monthLabel = `${monthNames[monthIndex]} ${item._id.year}`;
    return {
      month: monthLabel,
      amount: item.amount,
      count: item.count,
      year: item._id.year,
      monthNum: item._id.month,
    };
  });
};
