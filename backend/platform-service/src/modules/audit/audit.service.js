import AuditLog from "./audit.model.js";

/**
 * Creates an immutable audit log document for a successful mutation.
 * @param {Object} params
 * @param {Object} params.actor - { id, email, role } from req.user
 * @param {string} params.action - Action enum string
 * @param {string} params.entityType - "Project" | "Vendor" | "Service" | "Invoice" | "Support"
 * @param {string} params.entityId - Primary identifier of entity
 * @param {string} params.description - Human readable summary
 * @param {Object} [params.metadata] - Non-sensitive context metadata
 * @returns {Promise<Object|null>} Created AuditLog document or null on failure
 */
export const logAuditEvent = async ({
  actor,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) => {
  try {
    if (!actor || (!actor.id && !actor._id)) {
      console.warn("Audit log omitted: No authenticated actor provided");
      return null;
    }

    const actorId = actor.id || actor._id;

    return await AuditLog.create({
      actorId,
      actorEmail: actor.email || "unknown@fieldcam.com",
      actorRole: actor.role || "ADMIN",
      action,
      entityType,
      entityId: String(entityId),
      description,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error.message);
    return null;
  }
};

/**
 * Retrieves audit logs for the authenticated user with pagination.
 * @param {string} actorId 
 * @param {Object} query - { page, limit }
 * @returns {Promise<Object>} { logs, pagination }
 */
export const getMyAuditLogs = async (actorId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

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
