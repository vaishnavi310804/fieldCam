import mongoose from "mongoose";
import SubscriptionPlan from "./subscriptionPlan.model.js";
import CompanySubscription from "./companySubscription.model.js";
import Vendor from "../vendor/vendor.model.js";
import User from "../users/user.model.js";
import Invoice from "../invoice/invoice.model.js";
import AuditLog from "../audit/audit.model.js";

// Helper to seed initial subscription plans if collection is empty
const ensureDefaultPlansSeeded = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count === 0) {
    const defaultPlans = [
      {
        name: "Basic",
        code: "BASIC",
        subtitle: "Perfect for small startup teams.",
        monthlyPrice: 49,
        billingInterval: "MONTHLY",
        userLimit: 5,
        storageLimitGb: 10,
        features: [
          "Up to 5 Users",
          "10GB SSD Storage",
          "Community Support",
        ],
        isPopular: false,
        status: "PUBLISHED",
      },
      {
        name: "Professional",
        code: "PROFESSIONAL",
        subtitle: "Advanced tools for growing companies.",
        monthlyPrice: 149,
        billingInterval: "MONTHLY",
        userLimit: 50,
        storageLimitGb: 100,
        features: [
          "Up to 50 Users",
          "100GB NVMe Storage",
          "Priority Email Support",
          "Advanced Analytics",
        ],
        isPopular: true,
        status: "PUBLISHED",
      },
      {
        name: "Enterprise",
        code: "ENTERPRISE",
        subtitle: "Full control for large scale operations.",
        monthlyPrice: 499,
        billingInterval: "MONTHLY",
        userLimit: -1,
        storageLimitGb: 1000,
        features: [
          "Unlimited Users",
          "1TB Storage",
          "24/7 Priority Concierge",
          "Custom SSO & SAML",
        ],
        isPopular: false,
        status: "PUBLISHED",
      },
    ];
    await SubscriptionPlan.insertMany(defaultPlans);
  }
};

export const calculateSubscriptionExpiryDate = (startDate, durationMonths = 1) => {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    const err = new Error("Invalid start date format");
    err.statusCode = 400;
    throw err;
  }
  const months = parseInt(durationMonths, 10);
  if (isNaN(months) || months <= 0) {
    const err = new Error("Duration must be a positive number of months (minimum 1)");
    err.statusCode = 400;
    throw err;
  }

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();

  const targetTotalMonths = startMonth + months;
  const targetYear = startYear + Math.floor(targetTotalMonths / 12);
  const normalizedMonth = ((targetTotalMonths % 12) + 12) % 12;

  // Last day of target month: (year, month + 1, 0)
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const targetDay = Math.min(startDay, daysInTargetMonth);

  const expiry = new Date(start);
  expiry.setDate(1);
  expiry.setFullYear(targetYear);
  expiry.setMonth(normalizedMonth);
  expiry.setDate(targetDay);

  return expiry;
};

export const assignSubscriptionToCompany = async (
  { vendorId, planId, startDate, durationMonths = 1, status = "Active" },
  adminUser
) => {
  if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
    const err = new Error("Valid vendor ID is required");
    err.statusCode = 400;
    throw err;
  }

  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
    const err = new Error("Valid subscription plan ID is required");
    err.statusCode = 400;
    throw err;
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    const err = new Error("Referenced vendor/company does not exist");
    err.statusCode = 404;
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

  // Prevent duplicate subscription assignment
  const existingSub = await CompanySubscription.findOne({ vendorId: vendor._id });
  if (existingSub) {
    const err = new Error("Company already has an active subscription");
    err.statusCode = 400;
    throw err;
  }

  const validStart = startDate ? new Date(startDate) : new Date();
  if (isNaN(validStart.getTime())) {
    const err = new Error("Invalid subscription start date format");
    err.statusCode = 400;
    throw err;
  }

  const validDuration = parseInt(durationMonths, 10);
  if (isNaN(validDuration) || validDuration <= 0) {
    const err = new Error("Duration must be a positive number of months (minimum 1)");
    err.statusCode = 400;
    throw err;
  }

  const expiryDate = calculateSubscriptionExpiryDate(validStart, validDuration);

  const subscription = await CompanySubscription.create({
    vendorId: vendor._id,
    planId: plan._id,
    status: status || "Active",
    startDate: validStart,
    renewalDate: expiryDate,
    durationMonths: validDuration,
    expiryDate,
  });

  if (adminUser) {
    await AuditLog.create({
      actorId: adminUser._id || adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "SUBSCRIPTION_ASSIGNED",
      entityType: "CompanySubscription",
      entityId: subscription._id.toString(),
      description: `Assigned plan ${plan.name} (${plan.code}) to company ${vendor.companyName} for ${validDuration} month(s)`,
      metadata: {
        vendorId: vendor._id.toString(),
        companyName: vendor.companyName,
        planId: plan._id.toString(),
        planName: plan.name,
        planCode: plan.code,
        monthlyPrice: plan.monthlyPrice,
        userLimit: plan.userLimit,
        storageLimitGb: plan.storageLimitGb,
        startDate: validStart,
        renewalDate: expiryDate,
        durationMonths: validDuration,
      },
    });
  }

  return await CompanySubscription.findById(subscription._id)
    .populate("planId", "name code monthlyPrice userLimit storageLimitGb features")
    .populate("vendorId", "companyName contactName email status");
};

export const getSubscriptionPlans = async (queryStatus) => {
  await ensureDefaultPlansSeeded();
  const filter = {};
  if (queryStatus) {
    filter.status = queryStatus;
  }
  const plans = await SubscriptionPlan.find(filter).sort({ monthlyPrice: 1 });
  return plans;
};

export const getSubscribedCompanies = async ({
  search = "",
  status = "",
  planId = "",
  page = 1,
  limit = 10,
}) => {
  await ensureDefaultPlansSeeded();

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // 1. Fetch all companies/vendors
  const vendors = await Vendor.find().sort({ createdAt: -1 });

  // 2. Fetch all persisted company subscriptions
  const subscriptions = await CompanySubscription.find()
    .populate("planId", "name code monthlyPrice userLimit storageLimitGb")
    .sort({ createdAt: -1 });

  const subByVendorId = new Map();
  for (const sub of subscriptions) {
    if (sub.vendorId) {
      subByVendorId.set(sub.vendorId.toString(), sub);
    }
  }

  // 3. Get user counts for all vendors
  const userCounts = await User.aggregate([
    { $match: { companyId: { $ne: null } } },
    { $group: { _id: "$companyId", count: { $sum: 1 } } },
  ]);
  const userCountMap = {};
  userCounts.forEach((u) => {
    if (u._id) userCountMap[u._id.toString()] = u.count;
  });

  // 4. Map records
  let result = vendors.map((vendor) => {
    const vendorIdStr = vendor._id.toString();
    const sub = subByVendorId.get(vendorIdStr);
    const userCount = userCountMap[vendorIdStr] || 0;

    if (sub) {
      const plan = sub.planId || {};
      return {
        _id: sub._id,
        subscriptionId: sub._id,
        vendorId: vendor._id,
        companyName: vendor.companyName || "Unknown Company",
        avatarBg: vendor.avatarBg || "#5141F5",
        initials: vendor.initials || vendor.companyName?.slice(0, 2)?.toUpperCase() || "CO",
        planId: plan._id || null,
        planName: plan.name || "N/A",
        planCode: plan.code || "BASIC",
        monthlyPrice: plan.monthlyPrice || 0,
        userLimit: plan.userLimit !== undefined ? plan.userLimit : -1,
        userCount,
        status: sub.status || "Active",
        renewalDate: sub.renewalDate || sub.expiryDate,
        startDate: sub.startDate,
        durationMonths: sub.durationMonths || 1,
        createdAt: sub.createdAt,
      };
    }

    return {
      _id: `unassigned-${vendor._id}`,
      subscriptionId: null,
      vendorId: vendor._id,
      companyName: vendor.companyName || "Unknown Company",
      avatarBg: vendor.avatarBg || "#5141F5",
      initials: vendor.initials || vendor.companyName?.slice(0, 2)?.toUpperCase() || "CO",
      planId: null,
      planName: "Unassigned",
      planCode: "UNASSIGNED",
      monthlyPrice: 0,
      userLimit: "N/A",
      userCount,
      status: "Unassigned",
      renewalDate: null,
      startDate: null,
      durationMonths: null,
      createdAt: vendor.createdAt,
    };
  });

  // 5. Apply filters
  if (status && status !== "ALL") {
    result = result.filter(
      (r) => r.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (planId && planId !== "ALL") {
    if (planId === "UNASSIGNED") {
      result = result.filter((r) => !r.planId);
    } else {
      result = result.filter(
        (r) => r.planId && r.planId.toString() === planId.toString()
      );
    }
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.companyName.toLowerCase().includes(q) ||
        r.planName.toLowerCase().includes(q) ||
        r.planCode.toLowerCase().includes(q)
    );
  }

  const totalRecords = result.length;
  const totalPages = Math.ceil(totalRecords / limitNum) || 1;
  const paginatedResult = result.slice(skip, skip + limitNum);

  return {
    subscriptions: paginatedResult,
    totalRecords,
    totalPages,
    currentPage: pageNum,
    pageSize: limitNum,
  };
};

export const getSubscriptionStats = async () => {
  await ensureDefaultPlansSeeded();

  const totalPlans = await SubscriptionPlan.countDocuments();
  const publishedPlans = await SubscriptionPlan.countDocuments({ status: "PUBLISHED" });
  const activeSubscriptions = await CompanySubscription.countDocuments({ status: "Active" });
  const pastDueSubscriptions = await CompanySubscription.countDocuments({ status: "Past Due" });

  // Calculate platform revenue from paid invoices or active subscriptions
  const revenueAggregation = await Invoice.aggregate([
    { $match: { status: "Paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

  return {
    totalPlans,
    publishedPlans,
    activeSubscriptions,
    pastDueSubscriptions,
    totalRevenue,
  };
};

export const createSubscriptionPlan = async (data, adminUser) => {
  const { name, subtitle, monthlyPrice, billingInterval, userLimit, storageLimitGb, features, isPopular, status } = data;

  const code = (data.code || name).replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();

  const existing = await SubscriptionPlan.findOne({ code });
  if (existing) {
    const err = new Error(`Plan code '${code}' already exists`);
    err.statusCode = 400;
    throw err;
  }

  const plan = await SubscriptionPlan.create({
    name,
    code,
    subtitle: subtitle || "",
    monthlyPrice: Number(monthlyPrice),
    billingInterval: billingInterval || "MONTHLY",
    userLimit: userLimit !== undefined ? Number(userLimit) : -1,
    storageLimitGb: storageLimitGb !== undefined ? Number(storageLimitGb) : -1,
    features: Array.isArray(features) ? features : [],
    isPopular: Boolean(isPopular),
    status: status || "DRAFT",
  });

  // Log audit event
  await AuditLog.create({
    actorId: adminUser._id || adminUser.id,
    actorEmail: adminUser.email,
    actorRole: adminUser.role,
    action: "SUBSCRIPTION_PLAN_CREATED",
    entityType: "SubscriptionPlan",
    entityId: plan._id.toString(),
    description: `Created subscription plan ${plan.name} (${plan.code})`,
    metadata: { name: plan.name, code: plan.code, monthlyPrice: plan.monthlyPrice, status: plan.status },
  });

  return plan;
};

export const updateSubscriptionPlan = async (id, data, adminUser) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) {
    const err = new Error("Subscription plan not found");
    err.statusCode = 404;
    throw err;
  }

  if (data.name) plan.name = data.name;
  if (data.subtitle !== undefined) plan.subtitle = data.subtitle;
  if (data.monthlyPrice !== undefined) plan.monthlyPrice = Number(data.monthlyPrice);
  if (data.userLimit !== undefined) plan.userLimit = Number(data.userLimit);
  if (data.storageLimitGb !== undefined) plan.storageLimitGb = Number(data.storageLimitGb);
  if (Array.isArray(data.features)) plan.features = data.features;
  if (data.isPopular !== undefined) plan.isPopular = Boolean(data.isPopular);
  if (data.status) plan.status = data.status;

  await plan.save();

  await AuditLog.create({
    actorId: adminUser._id || adminUser.id,
    actorEmail: adminUser.email,
    actorRole: adminUser.role,
    action: "SUBSCRIPTION_PLAN_UPDATED",
    entityType: "SubscriptionPlan",
    entityId: plan._id.toString(),
    description: `Updated subscription plan ${plan.name} (${plan.code})`,
    metadata: { name: plan.name, status: plan.status },
  });

  return plan;
};

export const publishSubscriptionPlan = async (id, adminUser) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) {
    const err = new Error("Subscription plan not found");
    err.statusCode = 404;
    throw err;
  }

  plan.status = "PUBLISHED";
  await plan.save();

  await AuditLog.create({
    actorId: adminUser._id || adminUser.id,
    actorEmail: adminUser.email,
    actorRole: adminUser.role,
    action: "SUBSCRIPTION_PLAN_PUBLISHED",
    entityType: "SubscriptionPlan",
    entityId: plan._id.toString(),
    description: `Published subscription plan ${plan.name} (${plan.code})`,
    metadata: { name: plan.name, code: plan.code },
  });

  return plan;
};

export const updateCompanySubscriptionStatus = async (id, status, adminUser) => {
  const sub = await CompanySubscription.findById(id);
  if (!sub) {
    const err = new Error("Company subscription record not found");
    err.statusCode = 404;
    throw err;
  }

  const oldStatus = sub.status;
  sub.status = status;
  await sub.save();

  await AuditLog.create({
    actorId: adminUser._id || adminUser.id,
    actorEmail: adminUser.email,
    actorRole: adminUser.role,
    action: "SUBSCRIPTION_STATUS_CHANGED",
    entityType: "CompanySubscription",
    entityId: sub._id.toString(),
    description: `Changed subscription status from ${oldStatus} to ${status}`,
    metadata: { oldStatus, newStatus: status, vendorId: sub.vendorId },
  });

  return sub;
};
