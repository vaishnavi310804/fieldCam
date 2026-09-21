import { getMyAuditLogs } from "./audit.service.js";

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
