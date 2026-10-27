import AuditLog from "./audit.model.js";
import User from "../users/user.model.js";
import mongoose from "mongoose";

const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "hash",
  "otp",
  "registrationotp",
  "registrationotphash",
  "resetotp",
  "resetotphash",
  "token",
  "accesstoken",
  "refreshtoken",
  "jwt",
  "secret",
  "sessionsecret",
  "authorization",
  "apikey",
  "credential",
];

/**
 * Recursively redacts sensitive authentication keys from metadata.
 * @param {Object} data
 * @returns {Object} Sanitized object
 */
export const sanitizeMetadata = (data) => {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeMetadata(item));
  }
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((s) => lowerKey.includes(s));
    if (isSensitive) {
      clean[key] = "[REDACTED]";
    } else if (
      value &&
      typeof value === "object" &&
      !(value instanceof Date) &&
      !(value instanceof mongoose.Types.ObjectId)
    ) {
      clean[key] = sanitizeMetadata(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

/**
 * Creates an immutable audit log document for a successful mutation.
 * @param {Object} params
 * @param {Object} params.actor - { id, email, role, name, roleName, roleId } from req.user
 * @param {string} params.action - Action enum string
 * @param {string} params.entityType - Entity enum string
 * @param {string} params.entityId - Primary identifier of entity
 * @param {string} params.description - Human readable summary
 * @param {Object} [params.metadata] - Non-sensitive context metadata
 * @param {string} [params.status] - Outcome status ("SUCCESS" | "FAILURE")
 * @returns {Promise<Object|null>} Created AuditLog document or null on failure
 */
export const logAuditEvent = async ({
  actor,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
  status = "SUCCESS",
}) => {
  try {
    if (!actor || (!actor.id && !actor._id)) {
      console.warn("Audit log omitted: No authenticated actor provided");
      return null;
    }

    const actorId = actor.id || actor._id;
    const actorEmail = actor.email || "unknown@fieldcam.com";
    const actorName = actor.name || "";

    // Resolve actor role snapshot
    let actorRole = actor.role || "ADMIN";
    if (actor.role === "SUPER_ADMIN") {
      actorRole = "SUPER_ADMIN";
    } else if (actor.roleName) {
      actorRole = actor.roleName;
    } else if (actor.role === "ADMIN" && !actor.roleId) {
      actorRole = "FULL_ADMIN";
    }

    const sanitizedMeta = sanitizeMetadata(metadata);

    return await AuditLog.create({
      actorId,
      actorEmail,
      actorName,
      actorRole,
      action,
      entityType,
      entityId: String(entityId),
      description,
      status: status || "SUCCESS",
      metadata: sanitizedMeta,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error.message);
    return null;
  }
};

/**
 * Queries all audit logs with server-side pagination, search, role filters,
 * action/entity filters, date range filters, and stable newest-first sorting.
 * Strictly bounded and read-only.
 *
 * @param {Object} query - Express request query parameters
 * @returns {Promise<Object>} { logs, pagination, stats }
 */
export const getAllAuditLogs = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Search: actor name, email, action, entityId, entityType, description
  if (query.search && query.search.trim()) {
    const searchRegex = { $regex: query.search.trim(), $options: "i" };
    filter.$or = [
      { actorName: searchRegex },
      { actorEmail: searchRegex },
      { action: searchRegex },
      { entityType: searchRegex },
      { entityId: searchRegex },
      { description: searchRegex },
    ];
  }

  // 2. Actor Role Filter: "SUPER_ADMIN", "FULL_ADMIN", or "CUSTOM" / specific role name
  if (query.actorRole && query.actorRole !== "ALL") {
    if (query.actorRole === "SUPER_ADMIN") {
      filter.actorRole = "SUPER_ADMIN";
    } else if (query.actorRole === "FULL_ADMIN") {
      filter.actorRole = { $in: ["FULL_ADMIN", "ADMIN"] };
    } else if (query.actorRole === "CUSTOM") {
      filter.actorRole = { $nin: ["SUPER_ADMIN", "FULL_ADMIN", "ADMIN"] };
    } else {
      filter.actorRole = query.actorRole;
    }
  }

  // 3. Action Filter
  if (query.action && query.action !== "ALL") {
    filter.action = query.action;
  }

  // 4. Action Category / Entity Type Filter
  if (query.entityType && query.entityType !== "ALL") {
    filter.entityType = query.entityType;
  } else if (query.category && query.category !== "ALL") {
    filter.entityType = query.category;
  }

  // 5. Outcome/Status Filter
  if (query.status && query.status !== "ALL") {
    filter.status = query.status.toUpperCase();
  }

  // 6. Date Range Filter
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      const start = new Date(query.startDate);
      if (!isNaN(start.getTime())) {
        filter.createdAt.$gte = start;
      }
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      if (!isNaN(end.getTime())) {
        if (typeof query.endDate === "string" && !query.endDate.includes("T")) {
          end.setHours(23, 59, 59, 999);
        }
        filter.createdAt.$lte = end;
      }
    }
    if (Object.keys(filter.createdAt).length === 0) {
      delete filter.createdAt;
    }
  }

  // Stable sorting: newest events first
  const [logs, totalRecords] = await Promise.all([
    AuditLog.find(filter)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  const sanitizedLogs = logs.map((log) => ({
    ...log,
    actorName:
      log.actorName ||
      log.actorId?.name ||
      log.actorEmail?.split("@")[0] ||
      "Administrator",
    metadata: sanitizeMetadata(log.metadata),
  }));

  // Summary counts for dashboard telemetry
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [superAdminCount, adminCount, todayCount] = await Promise.all([
    AuditLog.countDocuments({ actorRole: "SUPER_ADMIN" }).catch(() => 0),
    AuditLog.countDocuments({ actorRole: { $ne: "SUPER_ADMIN" } }).catch(() => 0),
    AuditLog.countDocuments({ createdAt: { $gte: todayStart } }).catch(() => 0),
  ]);

  return {
    logs: sanitizedLogs,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 1,
      currentPage: page,
      pageSize: limit,
    },
    stats: {
      total: totalRecords,
      superAdminCount,
      adminCount,
      todayCount,
    },
  };
};

/**
 * Retrieves a single audit log document by ID with sanitized metadata.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const getAuditLogById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid audit log ID format");
    err.statusCode = 400;
    throw err;
  }

  const log = await AuditLog.findById(id)
    .populate("actorId", "name email role")
    .lean();

  if (!log) {
    const err = new Error("Audit log not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    ...log,
    actorName:
      log.actorName ||
      log.actorId?.name ||
      log.actorEmail?.split("@")[0] ||
      "Administrator",
    metadata: sanitizeMetadata(log.metadata),
  };
};

export const getMyAuditLogs = async (actorId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  if (!actorId || !mongoose.Types.ObjectId.isValid(actorId)) {
    return {
      logs: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 1,
      },
    };
  }

  const total = await AuditLog.countDocuments({ actorId });
  const logs = await AuditLog.find({ actorId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getEntityAuditLogs = async (entityType, entityId) => {
  const strId = String(entityId);
  return await AuditLog.find({
    entityType,
    $or: [
      { entityId: strId },
      { "metadata.projectId": strId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50);
};
