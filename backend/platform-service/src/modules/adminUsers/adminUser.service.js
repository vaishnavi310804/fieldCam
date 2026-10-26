import crypto from "crypto";
import mongoose from "mongoose";
import User from "../users/user.model.js";
import Role from "../roles/role.model.js";
import { clearRolePermissionCache } from "../../middleware/auth.middleware.js";

/**
 * List Admin and Super Admin users with populated role assignments and account status.
 */
export const listAdminUsers = async (query = {}) => {
  const filter = {
    role: { $in: ["ADMIN", "SUPER_ADMIN"] },
  };

  if (query.status && query.status !== "ALL") {
    filter.status = query.status.toUpperCase();
  }

  if (query.roleId) {
    if (mongoose.Types.ObjectId.isValid(query.roleId)) {
      filter.roleId = query.roleId;
    }
  }

  if (query.search && query.search.trim()) {
    const searchRegex = { $regex: query.search.trim(), $options: "i" };
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [users, totalRecords] = await Promise.all([
    User.find(filter)
      .populate("roleId", "name isSystem description")
      .select("name email phone role roleId status isVerified createdAt updatedAt lastLogin")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      pageSize: limit,
    },
  };
};

/**
 * Invite / Create a new Admin user with roleId assignment and OTP onboarding.
 */
export const createAdminUser = async (data, currentUser) => {
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    const err = new Error("Only Super Admins can invite or create Admin users.");
    err.statusCode = 403;
    throw err;
  }

  const normalizedEmail = (data.email || "").toLowerCase().trim();
  if (!normalizedEmail) {
    const err = new Error("Email is required.");
    err.statusCode = 400;
    throw err;
  }

  // Check email uniqueness
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    const err = new Error(`Email '${normalizedEmail}' is already registered in FieldCam.`);
    err.statusCode = 409;
    throw err;
  }

  // Check phone uniqueness with candidates if provided
  let cleanedPhone = undefined;
  if (data.phone && data.phone.trim()) {
    const trimmedPhone = data.phone.trim();
    cleanedPhone = trimmedPhone.replace(/[\s-]/g, "");
    const last10 = cleanedPhone.replace(/\D/g, "").slice(-10);
    const phoneCandidates = [trimmedPhone, cleanedPhone];
    if (last10 && last10.length === 10) {
      phoneCandidates.push(last10, `+91${last10}`, `91${last10}`);
    }

    const existingPhone = await User.findOne({
      phone: { $in: Array.from(new Set(phoneCandidates.filter(Boolean))) },
    });
    if (existingPhone) {
      const err = new Error("Phone number is already registered to another account.");
      err.statusCode = 409;
      throw err;
    }
  }

  // Validate roleId: must exist in Role collection
  if (!data.roleId || !mongoose.Types.ObjectId.isValid(data.roleId)) {
    const err = new Error("A valid roleId is required to create an Admin user.");
    err.statusCode = 400;
    throw err;
  }

  const roleDoc = await Role.findById(data.roleId);
  if (!roleDoc) {
    const err = new Error("The specified role does not exist.");
    err.statusCode = 400;
    throw err;
  }

  // Generate 6-digit registration OTP (10-minute expiry)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const registrationOtpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  const registrationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

  // New Admin is created in INACTIVE state without password
  // Role is strictly ADMIN
  const newAdmin = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    phone: cleanedPhone,
    role: "ADMIN",
    roleId: roleDoc._id,
    companyId: null,
    status: "INACTIVE",
    isVerified: false,
    registrationOtpHash,
    registrationOtpExpires,
  });

  // Re-use existing auth-service registration OTP email workflow
  let emailDispatched = false;
  const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5000/api";
  try {
    const emailRes = await fetch(`${authServiceUrl}/auth/send-registration-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        otp,
      }),
    });

    if (emailRes.ok) {
      emailDispatched = true;
    } else {
      console.warn(
        `[Admin User Creation] Auth service OTP email notice: HTTP ${emailRes.status}`
      );
    }
  } catch (emailErr) {
    console.warn(
      `[Admin User Creation] Could not reach auth-service for registration OTP email: ${emailErr.message}`
    );
  }

  const populatedAdmin = await User.findById(newAdmin._id)
    .populate("roleId", "name isSystem description")
    .select("name email phone role roleId status isVerified createdAt updatedAt");

  return {
    user: populatedAdmin,
    emailDispatched,
  };
};

/**
 * Reassign an Admin user to another eligible role without altering unrelated fields.
 */
export const reassignAdminRole = async (userId, newRoleId, currentUser) => {
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    const err = new Error("Only Super Admins can reassign Admin roles.");
    err.statusCode = 403;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid user ID format.");
    err.statusCode = 400;
    throw err;
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  if (targetUser.role === "SUPER_ADMIN") {
    const err = new Error("Super Admin role assignments cannot be altered via Admin Users APIs.");
    err.statusCode = 403;
    throw err;
  }

  if (targetUser.role !== "ADMIN") {
    const err = new Error("Role reassignment is only applicable to Admin accounts.");
    err.statusCode = 400;
    throw err;
  }

  if (!newRoleId || !mongoose.Types.ObjectId.isValid(newRoleId)) {
    const err = new Error("A valid roleId is required.");
    err.statusCode = 400;
    throw err;
  }

  const roleDoc = await Role.findById(newRoleId);
  if (!roleDoc) {
    const err = new Error("The specified role does not exist.");
    err.statusCode = 400;
    throw err;
  }

  const oldRoleId = targetUser.roleId;

  // Non-destructive update: modifies only roleId
  const updatedUser = await User.findByIdAndUpdate(
    targetUser._id,
    { $set: { roleId: roleDoc._id } },
    { new: true, runValidators: true }
  )
    .populate("roleId", "name isSystem description")
    .select("name email phone role roleId status isVerified createdAt updatedAt");

  // Invalidate in-memory permission cache for both old and new roles
  if (oldRoleId) {
    clearRolePermissionCache(oldRoleId);
  }
  clearRolePermissionCache(roleDoc._id);

  return updatedUser;
};

/**
 * Activate or deactivate an Admin user account with self-protection safeguards.
 */
export const updateAdminStatus = async (userId, status, currentUser) => {
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    const err = new Error("Only Super Admins can modify Admin account status.");
    err.statusCode = 403;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid user ID format.");
    err.statusCode = 400;
    throw err;
  }

  const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  const normalizedStatus = (status || "").toString().trim().toUpperCase();

  if (!validStatuses.includes(normalizedStatus)) {
    const err = new Error(`Status must be one of: ${validStatuses.join(", ")}.`);
    err.statusCode = 400;
    throw err;
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  // Self-Protection Safeguard: Prevent Super Admin from accidental self-deactivation
  const currentUserId = (currentUser.id || currentUser._id || "").toString();
  if (targetUser._id.toString() === currentUserId && normalizedStatus !== "ACTIVE") {
    const err = new Error("You cannot deactivate or suspend your own Super Admin account.");
    err.statusCode = 403;
    throw err;
  }

  // Super Admin Safeguard: Prevent deactivation of any Super Admin account through this endpoint
  if (targetUser.role === "SUPER_ADMIN" && normalizedStatus !== "ACTIVE") {
    const err = new Error("Super Admin accounts cannot be deactivated through Admin Users APIs.");
    err.statusCode = 403;
    throw err;
  }

  const updatedUser = await User.findByIdAndUpdate(
    targetUser._id,
    { $set: { status: normalizedStatus } },
    { new: true, runValidators: true }
  )
    .populate("roleId", "name isSystem description")
    .select("name email phone role roleId status isVerified createdAt updatedAt");

  return updatedUser;
};
