import {
  listRoles,
  getRoleById,
  createCustomRole,
  updateCustomRole,
  deleteCustomRole,
} from "./role.service.js";
import { resolveEffectivePermissions } from "./rolePermissionResolver.js";
import { logAuditEvent } from "../audit/audit.service.js";

export const listRolesController = async (req, res, next) => {
  try {
    const result = await listRoles(req.query);
    res.status(200).json({
      success: true,
      data: result.roles,
      totalRecords: result.totalRecords,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleByIdController = async (req, res, next) => {
  try {
    const role = await getRoleById(req.params.id);
    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoleController = async (req, res, next) => {
  try {
    const role = await createCustomRole(req.body, req.user?.id);

    await logAuditEvent({
      actor: req.user,
      action: "ROLE_CREATED",
      entityType: "Role",
      entityId: role._id?.toString() || "",
      description: `Created role '${role.name}' with ${role.permissions?.length || 0} module permissions`,
      metadata: {
        roleName: role.name,
        permissionsCount: role.permissions?.length || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoleController = async (req, res, next) => {
  try {
    const role = await updateCustomRole(req.params.id, req.body, req.user?.id);

    await logAuditEvent({
      actor: req.user,
      action: "ROLE_UPDATED",
      entityType: "Role",
      entityId: role._id?.toString() || req.params.id,
      description: `Updated role '${role.name}' (${role.permissions?.length || 0} permissions)`,
      metadata: {
        roleName: role.name,
        permissionsCount: role.permissions?.length || 0,
      },
    });

    res.status(200).json({
      success: true,
      message: "Role updated successfully.",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoleController = async (req, res, next) => {
  try {
    const result = await deleteCustomRole(req.params.id);

    await logAuditEvent({
      actor: req.user,
      action: "ROLE_DELETED",
      entityType: "Role",
      entityId: req.params.id,
      description: result.message || `Deleted custom role`,
      metadata: {
        roleId: req.params.id,
      },
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyPermissionsController = async (req, res, next) => {
  try {
    const effective = await resolveEffectivePermissions(req.user);
    res.status(200).json({
      success: true,
      message: "Effective permissions retrieved successfully.",
      data: {
        userId: req.user?.id || req.user?._id?.toString(),
        role: req.user?.role,
        roleId: req.user?.roleId || null,
        roleDetails: effective.roleDetails,
        permissions: effective.permissions,
        isSuperAdmin: effective.isSuperAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};
