import mongoose from "mongoose";
import Role, { PERMISSION_MODULES, MODULE_ACTIONS } from "./role.model.js";
import User from "../users/user.model.js";
import { clearRolePermissionCache } from "../../middleware/auth.middleware.js";

const RESERVED_ROLE_NAMES = Object.freeze([
  "FULL_ADMIN",
  "FULL ADMIN",
  "SUPER_ADMIN",
  "SUPER ADMIN",
  "ADMIN",
  "VENDOR",
  "STAFF",
]);

const escapeRegex = (string) => string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");

/**
 * Validates and normalizes permission definitions for a role.
 * Ensures permissions map strictly to authorized business modules and defined actions.
 * Explicitly rejects administrative modules (ROLES, ADMIN_USERS) and vendor staff management.
 *
 * @param {Array} permissions - Array of { module, actions }
 * @returns {Array} Normalized and validated permissions array
 */
export const validateRolePermissions = (permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    const err = new Error("Permissions must be a non-empty array.");
    err.statusCode = 400;
    throw err;
  }

  const seenModules = new Set();
  const normalized = [];

  for (const item of permissions) {
    if (!item || typeof item !== "object") {
      const err = new Error("Each permission entry must be an object with module and actions.");
      err.statusCode = 400;
      throw err;
    }

    const mod = (item.module || "").toString().trim().toUpperCase();

    if (!mod || !PERMISSION_MODULES[mod]) {
      const allowedModules = Object.values(PERMISSION_MODULES).join(", ");
      const err = new Error(
        `Invalid permission module: '${item.module}'. Only existing business modules (${allowedModules}) are permitted.`
      );
      err.statusCode = 400;
      throw err;
    }

    if (seenModules.has(mod)) {
      const err = new Error(
        `Duplicate permission declaration for module '${mod}'. Combine actions into a single entry.`
      );
      err.statusCode = 400;
      throw err;
    }
    seenModules.add(mod);

    if (!Array.isArray(item.actions) || item.actions.length === 0) {
      const err = new Error(`Actions array for module '${mod}' cannot be empty.`);
      err.statusCode = 400;
      throw err;
    }

    const validActionsForModule = MODULE_ACTIONS[mod] || [];
    const sanitizedActions = [];
    const seenActions = new Set();

    for (const act of item.actions) {
      const actionUpper = (act || "").toString().trim().toUpperCase();
      if (!validActionsForModule.includes(actionUpper)) {
        const err = new Error(
          `Invalid action '${act}' for module '${mod}'. Valid actions are: ${validActionsForModule.join(", ")}.`
        );
        err.statusCode = 400;
        throw err;
      }
      if (!seenActions.has(actionUpper)) {
        seenActions.add(actionUpper);
        sanitizedActions.push(actionUpper);
      }
    }

    normalized.push({
      module: mod,
      actions: sanitizedActions,
    });
  }

  return normalized;
};

/**
 * Checks if a given role name is reserved or duplicate.
 */
const validateRoleName = async (name, excludeRoleId = null) => {
  const trimmed = name.trim();
  const normalizedKey = trimmed.toUpperCase().replace(/\s+/g, "_");

  if (RESERVED_ROLE_NAMES.includes(trimmed.toUpperCase()) || RESERVED_ROLE_NAMES.includes(normalizedKey)) {
    const err = new Error(`The role name '${trimmed}' is reserved and cannot be used.`);
    err.statusCode = 400;
    throw err;
  }

  const query = {
    name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, "i") },
  };
  if (excludeRoleId) {
    query._id = { $ne: excludeRoleId };
  }

  const existing = await Role.findOne(query);
  if (existing) {
    const err = new Error(`A role with the name '${trimmed}' already exists.`);
    err.statusCode = 409;
    throw err;
  }

  return trimmed;
};

/**
 * List all system and custom roles with user assignment counts.
 */
export const listRoles = async (query = {}) => {
  const filter = {};

  if (query.type === "SYSTEM") {
    filter.isSystem = true;
  } else if (query.type === "CUSTOM") {
    filter.isSystem = { $ne: true };
  }

  if (query.search && query.search.trim()) {
    const searchRegex = { $regex: query.search.trim(), $options: "i" };
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  const roles = await Role.find(filter).sort({ isSystem: -1, name: 1 });

  // Compute user assignment count for each role
  const userCounts = await User.aggregate([
    { $match: { roleId: { $ne: null } } },
    { $group: { _id: "$roleId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(userCounts.map((u) => [u._id.toString(), u.count]));

  const rolesWithCounts = roles.map((role) => {
    const roleObj = role.toObject();
    roleObj.userCount = countMap.get(role._id.toString()) || 0;
    return roleObj;
  });

  return { roles: rolesWithCounts, totalRecords: rolesWithCounts.length };
};

/**
 * Get a single role by ID with its user assignment count.
 */
export const getRoleById = async (roleId) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    const err = new Error("Invalid role ID format.");
    err.statusCode = 400;
    throw err;
  }

  const role = await Role.findById(roleId);
  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  const userCount = await User.countDocuments({ roleId: role._id });
  const roleObj = role.toObject();
  roleObj.userCount = userCount;

  return roleObj;
};

/**
 * Create a new custom role.
 */
export const createCustomRole = async (data, creatorId = null) => {
  const validatedName = await validateRoleName(data.name);
  const validatedPermissions = validateRolePermissions(data.permissions);

  const role = await Role.create({
    name: validatedName,
    description: (data.description || "").trim(),
    isSystem: false, // Protected: custom roles can NEVER be system roles
    permissions: validatedPermissions,
    createdBy: creatorId || null,
  });

  return role;
};

/**
 * Update an existing custom role. System roles (FULL_ADMIN) are strictly protected.
 */
export const updateCustomRole = async (roleId, data, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    const err = new Error("Invalid role ID format.");
    err.statusCode = 400;
    throw err;
  }

  const role = await Role.findById(roleId);
  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  if (role.isSystem === true) {
    const err = new Error("System roles (including FULL_ADMIN) cannot be modified.");
    err.statusCode = 403;
    throw err;
  }

  if (data.name !== undefined) {
    const validatedName = await validateRoleName(data.name, role._id);
    role.name = validatedName;
  }

  if (data.description !== undefined) {
    role.description = (data.description || "").trim();
  }

  if (data.permissions !== undefined) {
    const validatedPermissions = validateRolePermissions(data.permissions);
    role.permissions = validatedPermissions;
  }

  // Ensure isSystem is never altered
  role.isSystem = false;

  await role.save();

  // Invalidate in-memory permission cache for this role
  clearRolePermissionCache(role._id);

  return role;
};

/**
 * Delete a custom role. Fails if the role is a system role or is assigned to users.
 */
export const deleteCustomRole = async (roleId) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    const err = new Error("Invalid role ID format.");
    err.statusCode = 400;
    throw err;
  }

  const role = await Role.findById(roleId);
  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  if (role.isSystem === true) {
    const err = new Error("System roles (including FULL_ADMIN) cannot be deleted.");
    err.statusCode = 403;
    throw err;
  }

  const assignedUsersCount = await User.countDocuments({ roleId: role._id });
  if (assignedUsersCount > 0) {
    const err = new Error(
      `Cannot delete role '${role.name}'. It is currently assigned to ${assignedUsersCount} user(s). Reassign them first.`
    );
    err.statusCode = 409;
    throw err;
  }

  await Role.findByIdAndDelete(role._id);

  // Invalidate in-memory permission cache
  clearRolePermissionCache(role._id);

  return {
    success: true,
    message: `Role '${role.name}' was successfully deleted.`,
  };
};
