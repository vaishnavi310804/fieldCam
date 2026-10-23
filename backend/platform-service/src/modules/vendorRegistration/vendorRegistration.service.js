import mongoose from "mongoose";
import VendorRegistration from "./vendorRegistration.model.js";
import User from "../users/user.model.js";
import Vendor from "../vendor/vendor.model.js";
import SubscriptionPlan from "../subscription/subscriptionPlan.model.js";
import { createVendor } from "../vendor/vendor.service.js";
import { logAuditEvent } from "../audit/audit.service.js";
import {
  sendRegistrationRejectionEmail,
  sendRegistrationAcknowledgementEmail,
} from "./vendorRegistration.email.js";

/**
 * Submits a new vendor registration request from the public login screen.
 * Does NOT create user or vendor accounts, passwords, or login sessions.
 */
export const createRegistrationRequest = async (data) => {
  const normalizedEmail = (data.email || "").toLowerCase().trim();
  const normalizedPhone = (data.phone || "").trim();
  const normalizedCompanyName = (data.companyName || "").trim();
  const normalizedContactName = (data.contactName || "").trim();
  const normalizedLocation = (data.location || "").trim();
  const normalizedDescription = (data.description || "").trim();

  // Normalize services
  let servicesArray = [];
  if (Array.isArray(data.services)) {
    servicesArray = data.services
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  } else if (typeof data.services === "string") {
    servicesArray = data.services
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (servicesArray.length === 0) {
    const err = new Error("At least one service offered must be specified");
    err.statusCode = 400;
    throw err;
  }

  // 1. Check for active PENDING registration for this email (prevents duplicate submissions)
  const existingPending = await VendorRegistration.findOne({
    email: normalizedEmail,
    status: "PENDING",
  });

  if (existingPending) {
    const err = new Error(
      "A registration request for this email address is already pending review"
    );
    err.statusCode = 409;
    throw err;
  }

  // 2. Check if email is already registered to an existing User
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const err = new Error("This email address is already registered in FieldCam");
    err.statusCode = 400;
    throw err;
  }

  // 3. Check if phone is already registered to an existing User
  if (normalizedPhone) {
    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      const err = new Error("This phone number is already registered in FieldCam");
      err.statusCode = 400;
      throw err;
    }
  }

  // 4. Create and persist VendorRegistration document in PENDING state
  const registration = await VendorRegistration.create({
    contactName: normalizedContactName,
    companyName: normalizedCompanyName,
    email: normalizedEmail,
    phone: normalizedPhone,
    location: normalizedLocation,
    services: servicesArray,
    description: normalizedDescription,
    status: "PENDING",
  });

  // 5. Audit logging
  try {
    await logAuditEvent({
      actor: null,
      action: "VENDOR_REGISTRATION_SUBMITTED",
      entityType: "VendorRegistration",
      entityId: registration._id.toString(),
      description: `Prospective vendor registration requested by ${normalizedCompanyName} (${normalizedContactName})`,
      metadata: {
        companyName: normalizedCompanyName,
        contactName: normalizedContactName,
        email: normalizedEmail,
      },
    });
  } catch (auditErr) {
    console.warn("Audit logging for vendor registration failed:", auditErr?.message);
  }

  // 6. Asynchronously send acknowledgement email (non-blocking)
  sendRegistrationAcknowledgementEmail({ request: registration }).catch((err) => {
    console.warn("Acknowledgement email failed to send:", err?.message);
  });

  return registration;
};

/**
 * Lists vendor registration requests with status filtering, search, and pagination.
 * Admin-only operation.
 */
export const getRegistrationRequests = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "All" && query.status !== "ALL") {
    filter.status = query.status.toUpperCase();
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { companyName: searchRegex },
      { contactName: searchRegex },
      { email: searchRegex },
      { location: searchRegex },
    ];
  }

  const totalRecords = await VendorRegistration.countDocuments(filter);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 0; // 0 = return all

  let queryBuilder = VendorRegistration.find(filter)
    .populate("reviewedBy", "name email role")
    .populate("vendorId", "companyName status initials avatarBg")
    .sort({ createdAt: -1 });

  if (limit > 0) {
    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).limit(limit);
  }

  const requests = await queryBuilder;

  return {
    requests,
    totalRecords,
    totalPages: limit > 0 ? Math.ceil(totalRecords / limit) : 1,
    currentPage: page,
    pageSize: limit > 0 ? limit : totalRecords,
  };
};

/**
 * Gets a single registration request by ID.
 * Admin-only operation.
 */
export const getRegistrationRequestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid registration request ID");
    err.statusCode = 400;
    throw err;
  }

  const request = await VendorRegistration.findById(id)
    .populate("reviewedBy", "name email role")
    .populate("vendorId", "companyName status initials avatarBg");

  if (!request) {
    const err = new Error("Registration request not found");
    err.statusCode = 404;
    throw err;
  }

  return request;
};

export const _deps = {
  createVendor,
};

/**
 * Approves a pending vendor registration request.
 * Reuses existing Admin vendor provisioning service (createVendor) and its invitation workflow.
 * Idempotent and concurrency-safe.
 */
export const approveRegistrationRequest = async (id, approvalData = {}, adminUser = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid registration request ID");
    err.statusCode = 400;
    throw err;
  }

  const request = await VendorRegistration.findById(id);
  if (!request) {
    const err = new Error("Registration request not found");
    err.statusCode = 404;
    throw err;
  }

  // Idempotency: If already approved, return without creating duplicate vendor or emails
  if (request.status === "APPROVED") {
    let existingVendor = null;
    if (request.vendorId) {
      existingVendor = await Vendor.findById(request.vendorId);
      if (existingVendor && typeof existingVendor.populate === "function") {
        existingVendor = await existingVendor.populate(
          "userId",
          "name email phone role status"
        );
      }
    }
    return {
      request,
      vendor: existingVendor,
      alreadyApproved: true,
      message: "Registration request has already been approved",
    };
  }

  if (request.status === "REJECTED") {
    const err = new Error("Cannot approve a rejected registration request");
    err.statusCode = 400;
    throw err;
  }

  // 1. Resolve subscription plan required by createVendor
  let planId = approvalData.planId;
  if (!planId) {
    const publishedPlan = await SubscriptionPlan.findOne({ status: "PUBLISHED" });
    if (!publishedPlan) {
      const err = new Error(
        "No published subscription plan is available for assignment. Please publish a plan before approving."
      );
      err.statusCode = 400;
      throw err;
    }
    planId = publishedPlan._id.toString();
  }

  // 2. Provision vendor using existing createVendor service
  // If vendor was already created in a previous attempt (e.g., partial failure during email retry)
  let provisionedVendor = null;
  if (request.vendorId) {
    provisionedVendor = await Vendor.findById(request.vendorId).populate(
      "userId",
      "name email phone role status"
    );
  } else {
    // Call existing vendor provisioning service
    const vendorPayload = {
      companyName: request.companyName,
      contactName: request.contactName,
      email: request.email,
      phone: request.phone,
      location: request.location,
      services: request.services && request.services.length > 0 ? request.services : ["Site Inspection"],
      planId,
      startDate: approvalData.startDate || new Date(),
      durationMonths: approvalData.durationMonths ? parseInt(approvalData.durationMonths, 10) : 1,
      status: "Active",
      rating: 4,
    };

    provisionedVendor = await _deps.createVendor(vendorPayload, adminUser);
  }

  // 3. Atomically transition request status to APPROVED
  request.status = "APPROVED";
  request.reviewedAt = new Date();
  request.reviewedBy = adminUser?._id || adminUser?.id || null;
  request.reviewerEmail = adminUser?.email || null;
  request.vendorId = provisionedVendor._id;
  request.userId = provisionedVendor.userId?._id || provisionedVendor.userId;
  await request.save();

  // 4. Audit logging
  try {
    await logAuditEvent({
      actor: adminUser,
      action: "VENDOR_CREATED",
      entityType: "Vendor",
      entityId: provisionedVendor._id?.toString() || request._id.toString(),
      description: `Approved vendor registration request for ${request.companyName}`,
      metadata: {
        companyName: request.companyName,
        vendorId: provisionedVendor._id?.toString(),
        reviewerEmail: adminUser?.email,
      },
    });
  } catch (auditErr) {
    console.warn("Audit logging for registration approval failed:", auditErr?.message);
  }

  return {
    request,
    vendor: provisionedVendor,
    message: "Registration request approved and vendor account provisioned successfully",
  };
};

/**
 * Rejects a pending vendor registration request.
 * Does NOT create vendor or user accounts.
 * Sends rejection notification email with optional reason and resubmission guidance.
 * Idempotent and concurrency-safe.
 */
export const rejectRegistrationRequest = async (id, rejectionData = {}, adminUser = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid registration request ID");
    err.statusCode = 400;
    throw err;
  }

  const request = await VendorRegistration.findById(id);
  if (!request) {
    const err = new Error("Registration request not found");
    err.statusCode = 404;
    throw err;
  }

  // Idempotency: If already rejected, do not send duplicate emails
  if (request.status === "REJECTED") {
    return {
      request,
      alreadyRejected: true,
      message: "Registration request has already been rejected",
      emailOutcome: { sent: false, reason: "Duplicate rejection skipped" },
    };
  }

  if (request.status === "APPROVED") {
    const err = new Error("Cannot reject an already approved registration request");
    err.statusCode = 400;
    throw err;
  }

  const trimmedReason = (rejectionData.rejectionReason || "").trim() || null;

  // 1. Persist REJECTED status
  request.status = "REJECTED";
  request.reviewedAt = new Date();
  request.reviewedBy = adminUser?._id || adminUser?.id || null;
  request.reviewerEmail = adminUser?.email || null;
  request.rejectionReason = trimmedReason;
  await request.save();

  // 2. Audit logging
  try {
    await logAuditEvent({
      actor: adminUser,
      action: "VENDOR_STATUS_CHANGED",
      entityType: "Vendor",
      entityId: request._id.toString(),
      description: `Rejected vendor registration request for ${request.companyName}`,
      metadata: {
        companyName: request.companyName,
        rejectionReason: trimmedReason,
        reviewerEmail: adminUser?.email,
      },
    });
  } catch (auditErr) {
    console.warn("Audit logging for registration rejection failed:", auditErr?.message);
  }

  // 3. Send rejection email via Brevo
  const emailOutcome = await sendRegistrationRejectionEmail({
    request,
    rejectionReason: trimmedReason,
  });

  return {
    request,
    emailOutcome,
    message: "Registration request rejected successfully",
  };
};
