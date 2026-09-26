import { getMyAuditLogs, getEntityAuditLogs } from "./audit.service.js";

/**
 * Controller to handle fetching audit logs for the currently authenticated user.
 * GET /api/audit-logs/me
 */
export const getMyAuditLogsController = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await getMyAuditLogs(req.user.id, req.query);

    return res.status(200).json({
      success: true,
      count: result.logs.length,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch audit logs",
    });
  }
};

/**
 * Controller to handle fetching audit logs for a specific entity.
 * GET /api/audit-logs/entity/:entityType/:entityId
 */
export const getEntityAuditLogsController = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await getEntityAuditLogs(entityType, entityId);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch entity audit logs",
    });
  }
};
