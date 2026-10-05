import Vendor from "./vendor.model.js";
import User from "../users/user.model.js";
import Project from "../project/project.model.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { createNotification } from "../notification/notification.service.js";

/**
 * Creates a new Vendor profile linked to an authenticating VENDOR user account.
 * @param {Object} vendorData 
 * @returns {Promise<Object>}
 */
export const createVendor = async (vendorData) => {
  let createdUserId = null;
  let createdVendorId = null;

  try {
    // If no userId provided, check email & provision a VENDOR user account
    if (!vendorData.userId) {
      if (!vendorData.email || !vendorData.email.trim()) {
        throw new Error("Email address is required to create a vendor account");
      }

      const normalizedEmail = vendorData.email.toLowerCase().trim();

      // 1. Prevent duplicate email in User identity database
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        throw new Error("Email is already registered");
      }

      // 2. Prevent duplicate phone number if provided
      if (vendorData.phone && vendorData.phone.trim()) {
        const existingPhone = await User.findOne({ phone: vendorData.phone.trim() });
        if (existingPhone) {
          throw new Error("Phone number already registered");
        }
      }

      // 3. Generate registration OTP (6-digit random string) and 10-min expiry
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const registrationOtpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
      const registrationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // 4. Create platform User authentication record in INACTIVE state without password
      const newUser = await User.create({
        name: vendorData.contactName || vendorData.companyName,
        email: normalizedEmail,
        phone: vendorData.phone ? vendorData.phone.trim() : undefined,
        role: "VENDOR",
        status: "INACTIVE",
        isVerified: false,
        registrationOtpHash,
        registrationOtpExpires,
      });

      createdUserId = newUser._id;
      vendorData.userId = newUser._id;

      // 5. Send Registration OTP email via auth-service internal endpoint
      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5000/api";
      const emailResponse = await fetch(`${authServiceUrl}/auth/send-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          otp,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send registration OTP email to vendor");
      }
    } else {
      if (!mongoose.Types.ObjectId.isValid(vendorData.userId)) {
        throw new Error("Invalid User ID format");
      }

      const user = await User.findById(vendorData.userId);
      if (!user) {
        throw new Error("Referenced user does not exist");
      }

      if (user.role !== "VENDOR") {
        throw new Error("Referenced user must have VENDOR role");
      }

      const existingVendor = await Vendor.findOne({ userId: vendorData.userId });
      if (existingVendor) {
        throw new Error("Vendor profile already exists for this user");
      }
    }

    // Auto-generate initials if not supplied
    if (!vendorData.initials && vendorData.companyName) {
      const words = vendorData.companyName.trim().split(" ");
      if (words.length >= 2) {
        vendorData.initials = (words[0][0] + words[1][0]).toUpperCase();
      } else {
        vendorData.initials = vendorData.companyName.slice(0, 2).toUpperCase();
      }
    }

    const vendor = await Vendor.create(vendorData);
    createdVendorId = vendor._id;

    return await Vendor.findById(vendor._id).populate(
      "userId",
      "name email phone role status"
    );
  } catch (err) {
    // Perform compensation cleanup if Vendor or User were created during this flow
    if (createdVendorId) {
      await Vendor.findByIdAndDelete(createdVendorId);
    }
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
    throw err;
  }
};

/**
 * Retrieves vendors with optional filters and search functionality.
 * @param {Object} query - { status, search }
 * @returns {Promise<Array>}
 */
export const getVendors = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { companyName: searchRegex },
      { contactName: searchRegex },
      { location: searchRegex },
    ];
  }

  const vendors = await Vendor.find(filter)
    .populate("userId", "name email phone role status")
    .sort({ createdAt: -1 });

  // Aggregate live project stats for all assigned vendors
  const statsAggregate = await Project.aggregate([
    {
      $match: { vendorId: { $ne: null } },
    },
    {
      $group: {
        _id: "$vendorId",
        assigned: { $sum: 1 },
        active: {
          $sum: {
            $cond: [
              { $in: ["$status", ["New", "In Progress", "Submitted", "Under Review"]] },
              1,
              0,
            ],
          },
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "Approved"] }, 1, 0],
          },
        },
        waitingForApproval: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Submitted", "Under Review"]] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const statsMap = new Map();
  statsAggregate.forEach((stat) => {
    if (stat._id) {
      statsMap.set(stat._id.toString(), {
        assigned: stat.assigned || 0,
        active: stat.active || 0,
        completed: stat.completed || 0,
        waitingForApproval: stat.waitingForApproval || 0,
      });
    }
  });

  return vendors.map((vendor) => {
    const vendorObj = vendor.toObject();
    const stats = statsMap.get(vendorObj._id.toString()) || {
      assigned: 0,
      active: 0,
      completed: 0,
      waitingForApproval: 0,
    };

    vendorObj.projectStats = stats;
    vendorObj.activeProjects = stats.active;
    vendorObj.completed = stats.completed;
    vendorObj.approval = stats.waitingForApproval;

    return vendorObj;
  });
};

/**
 * Retrieves the vendor profile for the currently authenticated User ID.
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getMyVendorProfile = async (userId) => {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new Error("Vendor profile not found for authenticated user");
  }
  return await getVendorById(vendor._id.toString());
};

/**
 * Retrieves a single vendor profile by ID enriched with live project statistics.
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getVendorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  const vendor = await Vendor.findById(id).populate(
    "userId",
    "name email phone role status"
  );

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const vendorObj = vendor.toObject();
  const vendorObjectId = new mongoose.Types.ObjectId(id);

  // Calculate live project metrics for this vendor from Project collection
  const [assignedCount, activeCount, completedCount, waitingForApprovalCount, assignedProjectsList] =
    await Promise.all([
      Project.countDocuments({
        vendorId: vendorObjectId,
        status: { $in: ["ASSIGNED", "New"] },
      }),
      Project.countDocuments({
        vendorId: vendorObjectId,
        status: "In Progress",
      }),
      Project.countDocuments({ vendorId: vendorObjectId, status: "Approved" }),
      Project.countDocuments({
        vendorId: vendorObjectId,
        status: { $in: ["Submitted", "Under Review"] },
      }),
      Project.find({ vendorId: vendorObjectId })
        .select("projectId projectName serviceTypeName location status createdAt")
        .sort({ createdAt: -1 }),
    ]);

  vendorObj.projectStats = {
    assigned: assignedCount,
    active: activeCount,
    completed: completedCount,
    waitingForApproval: waitingForApprovalCount,
  };
  vendorObj.activeProjects = activeCount;
  vendorObj.completed = completedCount;
  vendorObj.approval = waitingForApprovalCount;
  vendorObj.projects = assignedProjectsList;

  return vendorObj;
};

/**
 * Updates vendor information.
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateVendor = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  // Do not allow modifying userId directly in vendor profile
  if (updateData.userId) {
    delete updateData.userId;
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email phone role status");

  if (!updatedVendor) {
    throw new Error("Vendor not found");
  }

  return updatedVendor;
};

/**
 * Updates vendor status (Active / Suspended / Inactive).
 * @param {string} id 
 * @param {string} status 
 * @returns {Promise<Object>}
 */
export const updateVendorStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  if (!["Active", "Suspended", "Inactive"].includes(status)) {
    throw new Error("Status must be Active, Suspended, or Inactive");
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("userId", "name email phone role status");

  if (!updatedVendor) {
    throw new Error("Vendor not found");
  }

  // Side effect: Notify vendor user
  const vendorUserId = updatedVendor.userId?._id || updatedVendor.userId;
  if (vendorUserId) {
    try {
      await createNotification({
        userId: vendorUserId,
        title: `Account Status: ${status}`,
        body: `Your vendor account status has been updated to ${status}.`,
        type: "SYSTEM",
        data: { vendorId: updatedVendor._id.toString(), status },
      });
    } catch (notifErr) {
      console.error("Failed to generate vendor status notification:", notifErr.message);
    }
  }

  return updatedVendor;
};

/**
 * Calculates Vendor summary stats for the Admin Vendors page.
 * @returns {Promise<Object>}
 */
export const getVendorStats = async () => {
  const [totalVendors, activeVendors, suspendedVendors, inactiveVendors] =
    await Promise.all([
      Vendor.countDocuments({}),
      Vendor.countDocuments({ status: "Active" }),
      Vendor.countDocuments({ status: "Suspended" }),
      Vendor.countDocuments({ status: "Inactive" }),
    ]);

  return {
    totalVendors,
    activeVendors,
    suspendedVendors,
    inactiveVendors,
  };
};

/**
 * Retrieves STAFF-role users belonging strictly to the authenticated VENDOR.
 * @param {Object} currentUser - req.user from protect middleware { id, email, role }
 * @returns {Promise<Array>}
 */
export const getVendorStaff = async (currentUser) => {
  const vendorUserId = currentUser.id;

  const vendorUser = await User.findById(vendorUserId);
  if (!vendorUser) {
    throw new Error("Vendor user account not found");
  }

  const vendorProfile = await Vendor.findOne({ userId: vendorUserId });

  const companyIds = [new mongoose.Types.ObjectId(vendorUserId)];
  if (vendorUser.companyId) {
    companyIds.push(new mongoose.Types.ObjectId(vendorUser.companyId.toString()));
  }
  if (vendorProfile) {
    companyIds.push(new mongoose.Types.ObjectId(vendorProfile._id.toString()));
  }

  const staffMembers = await User.find({
    role: "STAFF",
    companyId: { $in: companyIds },
  })
    .select("-password -registrationOtpHash -registrationOtpExpires -resetOtpHash -resetOtpExpires")
    .sort({ createdAt: -1 });

  return staffMembers.map((member) => member.toObject());
};
