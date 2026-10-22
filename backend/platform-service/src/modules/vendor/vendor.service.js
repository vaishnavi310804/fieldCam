import Vendor from "./vendor.model.js";
import User from "../users/user.model.js";
import Project from "../project/project.model.js";
import DeviceToken from "../notification/deviceToken.model.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { createNotification } from "../notification/notification.service.js";
import { calculateProjectWorkflowProgress } from "../project/project.service.js";
import SubscriptionPlan from "../subscription/subscriptionPlan.model.js";
import CompanySubscription from "../subscription/companySubscription.model.js";
import { assignSubscriptionToCompany } from "../subscription/subscription.service.js";

export const createVendor = async (vendorData, adminUser = null) => {
  let createdUserId = null;
  let createdVendorId = null;
  let createdSubscriptionId = null;

  try {
    // 1. Subscription Configuration Validation
    const planId = vendorData.planId || vendorData.subscription?.planId;
    const rawStartDate = vendorData.startDate || vendorData.subscription?.startDate || new Date();
    const rawDuration =
      vendorData.durationMonths !== undefined
        ? vendorData.durationMonths
        : vendorData.duration !== undefined
        ? vendorData.duration
        : vendorData.subscription?.durationMonths !== undefined
        ? vendorData.subscription?.durationMonths
        : 1;

    if (!planId) {
      const err = new Error("Subscription plan is required");
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      const err = new Error("Valid subscription plan ID is required");
      err.statusCode = 400;
      throw err;
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      const err = new Error("Selected subscription plan does not exist");
      err.statusCode = 400;
      throw err;
    }

    if (plan.status !== "PUBLISHED") {
      const err = new Error("Selected subscription plan is not eligible for assignment (must be PUBLISHED)");
      err.statusCode = 400;
      throw err;
    }

    const parsedDuration = parseInt(rawDuration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      const err = new Error("Duration must be a positive number of months (minimum 1)");
      err.statusCode = 400;
      throw err;
    }

    const parsedStartDate = new Date(rawStartDate);
    if (isNaN(parsedStartDate.getTime())) {
      const err = new Error("Invalid start date format");
      err.statusCode = 400;
      throw err;
    }

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

    // Clean payload of subscription-specific fields before creating Vendor document
    const {
      planId: _pId,
      startDate: _sDate,
      durationMonths: _dMonths,
      subscription: _subData,
      ...cleanVendorData
    } = vendorData;

    const vendor = await Vendor.create(cleanVendorData);
    createdVendorId = vendor._id;

    // Link user's companyId to the created vendor
    if (createdUserId) {
      await User.findByIdAndUpdate(createdUserId, { companyId: vendor._id });
    }

    // Associate subscription to the newly created vendor/company
    const subscription = await assignSubscriptionToCompany(
      {
        vendorId: vendor._id,
        planId: plan._id,
        startDate: parsedStartDate,
        durationMonths: parsedDuration,
        status: "Active",
      },
      adminUser
    );
    createdSubscriptionId = subscription._id;

    const populatedVendor = await Vendor.findById(vendor._id).populate(
      "userId",
      "name email phone role status"
    );

    const result = populatedVendor.toObject();
    result.subscription = subscription;
    return result;
  } catch (err) {
    // Perform compensation cleanup if Subscription, Vendor, or User were created during this flow
    if (createdSubscriptionId) {
      await CompanySubscription.findByIdAndDelete(createdSubscriptionId);
    }
    if (createdVendorId) {
      await Vendor.findByIdAndDelete(createdVendorId);
    }
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
    throw err;
  }
};

export const getVendors = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "All" && query.status !== "All Statuses") {
    // Normalize status string (e.g. Active, Suspended, Inactive)
    const formattedStatus =
      query.status.charAt(0).toUpperCase() + query.status.slice(1).toLowerCase();
    filter.status = formattedStatus;
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { companyName: searchRegex },
      { contactName: searchRegex },
      { location: searchRegex },
    ];
  }

  const totalRecords = await Vendor.countDocuments(filter);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || (query.page ? 10 : 0);

  let queryBuilder = Vendor.find(filter)
    .populate("userId", "name email phone role status")
    .sort({ createdAt: -1 });

  if (limit > 0) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  const vendors = await queryBuilder;

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
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
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

  // Aggregate live user counts for each vendor (owner + associated staff)
  const userCountAggregate = await User.aggregate([
    {
      $group: {
        _id: "$companyId",
        count: { $sum: 1 },
      },
    },
  ]);

  const userCountMap = new Map();
  userCountAggregate.forEach((u) => {
    if (u._id) {
      userCountMap.set(u._id.toString(), u.count);
    }
  });

  const formattedVendors = vendors.map((vendor) => {
    const vendorObj = vendor.toObject();
    const stats = statsMap.get(vendorObj._id.toString()) || {
      assigned: 0,
      active: 0,
      completed: 0,
      waitingForApproval: 0,
    };

    // Calculate total users (1 for owner + staff count if mapped)
    const staffCount =
      userCountMap.get(vendorObj._id.toString()) ||
      (vendorObj.userId ? userCountMap.get(vendorObj.userId._id?.toString() || vendorObj.userId.toString()) || 0 : 0);
    const userCount = (vendorObj.userId ? 1 : 0) + staffCount;

    vendorObj.projectStats = stats;
    vendorObj.activeProjects = stats.active;
    vendorObj.completed = stats.completed;
    vendorObj.approval = stats.waitingForApproval;
    vendorObj.userCount = userCount;

    return vendorObj;
  });

  if (query.page) {
    return {
      vendors: formattedVendors,
      totalRecords,
      totalPages: limit > 0 ? Math.ceil(totalRecords / limit) : 1,
      currentPage: page,
      pageSize: limit,
    };
  }

  return formattedVendors;
};

export const getMyVendorProfile = async (userId) => {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new Error("Vendor profile not found for authenticated user");
  }
  return await getVendorById(vendor._id.toString());
};

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
  const [assignedCount, activeCount, completedCount, waitingForApprovalCount, rejectedCount, assignedProjectsList] =
    await Promise.all([
      Project.countDocuments({
        vendorId: vendorObjectId,
        status: { $in: ["ASSIGNED", "New"] },
      }),
      Project.countDocuments({
        vendorId: vendorObjectId,
        status: "In Progress",
      }),
      Project.countDocuments({ vendorId: vendorObjectId, status: "Completed" }),
      Project.countDocuments({
        vendorId: vendorObjectId,
        status: { $in: ["Submitted", "Under Review"] },
      }),
      Project.countDocuments({ vendorId: vendorObjectId, status: "Rejected" }),
      Project.find({ vendorId: vendorObjectId })
        .select("projectId projectName serviceTypeName location status deadline photos checklistItems createdAt")
        .sort({ createdAt: -1 }),
    ]);

  vendorObj.projectStats = {
    assigned: assignedCount,
    active: activeCount,
    completed: completedCount,
    waitingForApproval: waitingForApprovalCount,
    rejected: rejectedCount,
  };
  vendorObj.activeProjects = activeCount;
  vendorObj.completed = completedCount;
  vendorObj.approval = waitingForApprovalCount;
  vendorObj.projects = assignedProjectsList.map((p) => {
    const pObj = typeof p.toObject === "function" ? p.toObject() : { ...p };
    pObj.progress = calculateProjectWorkflowProgress(pObj.status, pObj.checklistItems);
    return pObj;
  });

  return vendorObj;
};

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

export const updateVendorStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  const formattedStatus =
    typeof status === "string"
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : status;

  if (!["Active", "Suspended", "Inactive"].includes(formattedStatus)) {
    throw new Error("Status must be Active, Suspended, or Inactive");
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    { status: formattedStatus },
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

  const staffMemberIds = staffMembers.map((s) => s._id);

  // Derive real assigned project metrics for each staff member
  const projectAgg = await Project.aggregate([
    { $match: { assignedStaffId: { $in: staffMemberIds } } },
    {
      $group: {
        _id: "$assignedStaffId",
        active: {
          $sum: {
            $cond: [
              { $in: ["$status", ["New", "ASSIGNED", "In Progress", "Submitted", "Under Review"]] },
              1,
              0,
            ],
          },
        },
        completed: {
          $sum: {
            $cond: [{ $in: ["$status", ["Approved", "Completed"]] }, 1, 0],
          },
        },
      },
    },
  ]);

  const projectStatsMap = new Map();
  projectAgg.forEach((stat) => {
    if (stat._id) {
      projectStatsMap.set(stat._id.toString(), {
        active: stat.active || 0,
        completed: stat.completed || 0,
      });
    }
  });

  // Query device tokens for real lastSeenAt presence
  const deviceTokens = await DeviceToken.find({
    userId: { $in: staffMemberIds },
    isActive: true,
  }).sort({ lastSeenAt: -1 });

  const tokenMap = new Map();
  deviceTokens.forEach((tok) => {
    const key = tok.userId.toString();
    if (!tokenMap.has(key)) {
      tokenMap.set(key, tok.lastSeenAt);
    }
  });

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  return staffMembers.map((member) => {
    const obj = member.toObject();
    const stats = projectStatsMap.get(obj._id.toString()) || { active: 0, completed: 0 };
    const lastSeen = tokenMap.get(obj._id.toString()) || null;
    obj.activeProjects = stats.active;
    obj.completedProjects = stats.completed;
    obj.lastSeenAt = lastSeen;
    obj.isOnline = lastSeen ? new Date(lastSeen) >= fifteenMinutesAgo : false;
    return obj;
  });
};

export const updateVendorStaffStatus = async (staffId, status, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new Error("Invalid staff ID format");
  }

  const normalizedStatus = status?.toUpperCase() === "ACTIVE" ? "ACTIVE" : "INACTIVE";

  const vendorUser = await User.findById(currentUser.id);
  const vendorProfile = await Vendor.findOne({ userId: currentUser.id });
  const companyIds = [currentUser.id.toString()];
  if (vendorUser?.companyId) companyIds.push(vendorUser.companyId.toString());
  if (vendorProfile?._id) companyIds.push(vendorProfile._id.toString());

  const staffUser = await User.findById(staffId);
  if (!staffUser || staffUser.role !== "STAFF") {
    throw new Error("Staff member not found");
  }

  const staffCompanyId = staffUser.companyId ? staffUser.companyId.toString() : null;
  if (!staffCompanyId || !companyIds.includes(staffCompanyId)) {
    const error = new Error("Forbidden: Staff member does not belong to your organization");
    error.statusCode = 403;
    throw error;
  }

  staffUser.status = normalizedStatus;
  await staffUser.save();

  return staffUser.toObject();
};

export const updateVendorStaff = async (staffId, updateData, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new Error("Invalid staff ID format");
  }

  const vendorUser = await User.findById(currentUser.id);
  const vendorProfile = await Vendor.findOne({ userId: currentUser.id });
  const companyIds = [currentUser.id.toString()];
  if (vendorUser?.companyId) companyIds.push(vendorUser.companyId.toString());
  if (vendorProfile?._id) companyIds.push(vendorProfile._id.toString());

  const staffUser = await User.findById(staffId);
  if (!staffUser || staffUser.role !== "STAFF") {
    throw new Error("Staff member not found");
  }

  const staffCompanyId = staffUser.companyId ? staffUser.companyId.toString() : null;
  if (!staffCompanyId || !companyIds.includes(staffCompanyId)) {
    const error = new Error("Forbidden: Staff member does not belong to your organization");
    error.statusCode = 403;
    throw error;
  }

  const allowedFields = ["name", "phone", "title", "location", "department", "bio"];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      staffUser[field] = updateData[field];
    }
  });

  await staffUser.save();
  return staffUser.toObject();
};
