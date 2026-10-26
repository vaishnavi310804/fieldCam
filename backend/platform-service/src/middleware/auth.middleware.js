import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import Role, { FULL_ADMIN_PERMISSIONS } from "../modules/roles/role.model.js";
import { checkUserAndCompanyStatus } from "../modules/vendor/companyStatus.js";

// In-memory role permission cache (keyed by roleId string or "FULL_ADMIN")
// Prevents querying MongoDB on every HTTP request while allowing updates
// to propagate within 60s without requiring timers or background polling.
const rolePermissionCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const clearRolePermissionCache = (roleId = null) => {
  if (roleId) {
    rolePermissionCache.delete(roleId.toString());
  } else {
    rolePermissionCache.clear();
  }
};

/**
 * Resolves the permission array for an authenticated user.
 * - If roleId is missing or null, falls back to the FULL_ADMIN system role
 *   (resolves from DB or fallback constant if DB has not been seeded).
 * - If roleId is present, queries Role.findById(roleId). An invalid or
 *   missing role ID returns null and does NOT escalate to FULL_ADMIN.
 *
 * @param {Object} user - Authenticated user identity (req.user)
 * @returns {Promise<Array|null>} Array of permission objects or null if invalid
 */
const resolveRolePermissions = async (user) => {
  // 1. Compatibility fallback for unmigrated or unassigned Admins
  if (!user.roleId) {
    const cached = rolePermissionCache.get("FULL_ADMIN");
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.permissions;
    }

    let fullAdminRole = null;
    try {
      fullAdminRole = await Role.findOne({ name: "FULL_ADMIN", isSystem: true });
    } catch {
      // Non-blocking fallback
    }

    const permissions = fullAdminRole?.permissions || FULL_ADMIN_PERMISSIONS;
    rolePermissionCache.set("FULL_ADMIN", { permissions, timestamp: Date.now() });
    return permissions;
  }

  // 2. Specific assigned roleId resolution
  const cacheKey = user.roleId.toString();
  const cached = rolePermissionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.permissions;
  }

  let roleDoc = null;
  try {
    roleDoc = await Role.findById(user.roleId);
  } catch {
    // Malformed ObjectId or DB error: returns null (deny)
    return null;
  }

  if (!roleDoc) {
    // Non-null roleId referencing a non-existent role must fail securely (do NOT escalate)
    return null;
  }

  const permissions = roleDoc.permissions || [];
  rolePermissionCache.set(cacheKey, { permissions, timestamp: Date.now() });
  return permissions;
};

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Bearer token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Invalid token format.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Validate payload identity requirements
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload identity.",
      });
    }

    const user = await User.findById(decoded.id).select(
      "name email role roleId status companyId"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Centrally enforce account and company status
    let companyVerification;
    try {
      companyVerification = await checkUserAndCompanyStatus(user);
    } catch (statusError) {
      const statusCode = statusError.statusCode || 403;
      return res.status(statusCode).json({
        success: false,
        code: statusError.code,
        message: statusError.message,
      });
    }

    const resolvedCompanyId = companyVerification.company?._id
      ? companyVerification.company._id.toString()
      : user.companyId
      ? user.companyId.toString()
      : decoded.companyId || null;

    // Attach user identity to req.user (including resolved roleId)
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: user.roleId ? user.roleId.toString() : null,
      status: user.status,
      companyId: resolvedCompanyId,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal authentication error.",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

/**
 * Reusable RBAC Permission Middleware.
 * Enforces action-level permissions per module.
 *
 * Rules:
 * 1. Rejects unauthenticated requests with 401.
 * 2. SUPER_ADMIN bypasses all roleId and permission lookups immediately.
 * 3. Allows specified non-admin roles (e.g. VENDOR on mixed routes) to pass through to tenant scoping.
 * 4. Non-admin roles not in allowRoles are denied with 403.
 * 5. ADMIN users resolve permissions from their assigned roleId.
 *    If roleId is null/missing, resolves FULL_ADMIN compatibility fallback.
 *    If roleId is non-null but invalid, denies access without escalation.
 * 6. Checks if { module, actions: [action] } is present.
 * 7. Returns 403 Forbidden if not permitted.
 *
 * @param {string} module - Target business module (e.g. "PROJECTS", "INVOICES")
 * @param {string} action - Target business action (e.g. "VIEW", "CREATE", "REVIEW")
 * @param {Object|Array} [options={}] - Options object { allowRoles: [...] } or array of non-admin roles to allow
 * @returns {Function} Express middleware handler
 */
export const requirePermission = (module, action, options = {}) => {
  const normalizedModule = String(module).toUpperCase();
  const normalizedAction = String(action).toUpperCase();
  const allowedNonAdminRoles = Array.isArray(options)
    ? options
    : options?.allowRoles || [];

  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // 1. SUPER_ADMIN has unrestricted bypass across all business operations
      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      // 2. Allow specified non-admin roles on mixed endpoints (e.g. VENDOR on project list)
      if (allowedNonAdminRoles.includes(req.user.role)) {
        return next();
      }

      // 3. Only ADMIN accounts proceed to RBAC permission evaluation
      if (req.user.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      // 4. Resolve permissions for ADMIN
      const rolePermissions = await resolveRolePermissions(req.user);
      if (!rolePermissions) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      // 5. Check if requested module and action are explicitly granted
      const hasPerm = rolePermissions.some((p) => {
        if (!p.module || p.module.toUpperCase() !== normalizedModule) {
          return false;
        }
        const actions = Array.isArray(p.actions) ? p.actions : [];
        return actions.some((act) => act.toUpperCase() === normalizedAction);
      });

      if (!hasPerm) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      console.error("RequirePermission Middleware Error:", error.message || error);
      return res.status(500).json({
        success: false,
        message: "Internal authorization error.",
      });
    }
  };
};
