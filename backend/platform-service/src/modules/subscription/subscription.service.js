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

// Helper to seed company subscriptions for existing vendors if collection is empty
const ensureCompanySubscriptionsSeeded = async () => {
  const count = await CompanySubscription.countDocuments();
  if (count === 0) {
    const vendors = await Vendor.find();
    const plans = await SubscriptionPlan.find({ status: "PUBLISHED" });
    if (vendors.length > 0 && plans.length > 0) {
      const basicPlan = plans.find((p) => p.code === "BASIC") || plans[0];
      const proPlan = plans.find((p) => p.code === "PROFESSIONAL") || plans[0];
      const entPlan = plans.find((p) => p.code === "ENTERPRISE") || plans[0];

      const sampleSubscriptions = vendors.map((vendor, idx) => {
        const selectedPlan = idx % 3 === 0 ? proPlan : idx % 3 === 1 ? entPlan : basicPlan;
        const status = idx === 2 ? "Past Due" : "Active";
        const renewalDate = new Date(Date.now() + (15 + idx * 5) * 24 * 60 * 60 * 1000);
        return {
          vendorId: vendor._id,
          planId: selectedPlan._id,
          status,
          startDate: vendor.joinedDate || new Date(),
          renewalDate,
        };
      });

      await CompanySubscription.insertMany(sampleSubscriptions);
    }
  }
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
  await ensureCompanySubscriptionsSeeded();

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Build match filters
  const matchStage = {};
  if (status && status !== "ALL") {
    matchStage.status = status;
  }
  if (planId && planId !== "ALL") {
    matchStage.planId = planId;
  }

  let subscriptions = await CompanySubscription.find(matchStage)
    .populate("vendorId", "companyName contactName avatarBg initials status")
    .populate("planId", "name code monthlyPrice userLimit storageLimitGb")
    .sort({ createdAt: -1 });

  // Get user counts for all vendors
  const userCounts = await User.aggregate([
    { $match: { companyId: { $ne: null } } },
    { $group: { _id: "$companyId", count: { $sum: 1 } } },
  ]);
  const userCountMap = {};
  userCounts.forEach((u) => {
    if (u._id) userCountMap[u._id.toString()] = u.count;
  });

  // Transform records
  let result = subscriptions.map((sub) => {
    const vendor = sub.vendorId || {};
    const plan = sub.planId || {};
    const vendorIdStr = vendor._id ? vendor._id.toString() : "";
    const userCount = userCountMap[vendorIdStr] || 0;

    return {
      _id: sub._id,
      vendorId: vendor._id,
      companyName: vendor.companyName || "Unknown Company",
      avatarBg: vendor.avatarBg || "#5141F5",
      initials: vendor.initials || vendor.companyName?.slice(0, 2)?.toUpperCase() || "CO",
      planId: plan._id,
      planName: plan.name || "N/A",
      planCode: plan.code || "BASIC",
      monthlyPrice: plan.monthlyPrice || 0,
      userLimit: plan.userLimit !== undefined ? plan.userLimit : -1,
      userCount,
      status: sub.status || "Active",
      renewalDate: sub.renewalDate,
      startDate: sub.startDate,
      createdAt: sub.createdAt,
    };
  });

  // Apply search filtering on companyName or planName if search param provided
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
  await ensureCompanySubscriptionsSeeded();

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
    userId: adminUser._id,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    action: "SUBSCRIPTION_PLAN_CREATED",
    entity: "SubscriptionPlan",
    entityId: plan._id.toString(),
    details: { name: plan.name, code: plan.code, monthlyPrice: plan.monthlyPrice, status: plan.status },
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
    userId: adminUser._id,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    action: "SUBSCRIPTION_PLAN_UPDATED",
    entity: "SubscriptionPlan",
    entityId: plan._id.toString(),
    details: { name: plan.name, status: plan.status },
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
    userId: adminUser._id,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    action: "SUBSCRIPTION_PLAN_PUBLISHED",
    entity: "SubscriptionPlan",
    entityId: plan._id.toString(),
    details: { name: plan.name, code: plan.code },
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
    userId: adminUser._id,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    action: "SUBSCRIPTION_STATUS_CHANGED",
    entity: "CompanySubscription",
    entityId: sub._id.toString(),
    details: { oldStatus, newStatus: status, vendorId: sub.vendorId },
  });

  return sub;
};
