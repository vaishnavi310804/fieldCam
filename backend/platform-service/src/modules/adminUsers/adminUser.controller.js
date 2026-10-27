import {
  listAdminUsers,
  createAdminUser,
  reassignAdminRole,
  updateAdminStatus,
} from "./adminUser.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

export const listAdminUsersController = async (req, res, next) => {
  try {
    const result = await listAdminUsers(req.query);
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUserController = async (req, res, next) => {
  try {
    const result = await createAdminUser(req.body, req.user);

    await logAuditEvent({
      actor: req.user,
      action: "ADMIN_USER_CREATED",
      entityType: "AdminUser",
      entityId: result.user?._id?.toString() || "",
      description: `Invited administrator ${result.user?.name || ""} (${result.user?.email || ""}) with role ${result.user?.roleId?.name || "Admin"}`.trim(),
      metadata: {
        adminName: result.user?.name,
        adminEmail: result.user?.email,
        roleId:
          result.user?.roleId?._id?.toString() ||
          result.user?.roleId?.toString(),
        roleName: result.user?.roleId?.name || "Admin",
      },
    });

    res.status(201).json({
      success: true,
      message: "Admin invitation created successfully.",
      data: result.user,
      emailDispatched: result.emailDispatched,
    });
  } catch (error) {
    next(error);
  }
};

export const reassignAdminRoleController = async (req, res, next) => {
  try {
    const updatedUser = await reassignAdminRole(
      req.params.id,
      req.body.roleId,
      req.user
    );

    await logAuditEvent({
      actor: req.user,
      action: "ADMIN_ROLE_REASSIGNED",
      entityType: "AdminUser",
      entityId: updatedUser?._id?.toString() || req.params.id,
      description: `Reassigned role of administrator ${updatedUser?.name || ""} (${updatedUser?.email || ""}) to ${updatedUser?.roleId?.name || "Admin"}`.trim(),
      metadata: {
        adminName: updatedUser?.name,
        adminEmail: updatedUser?.email,
        newRoleId:
          updatedUser?.roleId?._id?.toString() ||
          updatedUser?.roleId?.toString(),
        newRoleName: updatedUser?.roleId?.name || "Admin",
      },
    });

    res.status(200).json({
      success: true,
      message: "Admin role reassigned successfully.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminStatusController = async (req, res, next) => {
  try {
    const updatedUser = await updateAdminStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    await logAuditEvent({
      actor: req.user,
      action: "ADMIN_STATUS_CHANGED",
      entityType: "AdminUser",
      entityId: updatedUser?._id?.toString() || req.params.id,
      description: `Updated status of administrator ${updatedUser?.name || ""} (${updatedUser?.email || ""}) to ${req.body.status}`.trim(),
      metadata: {
        adminName: updatedUser?.name,
        adminEmail: updatedUser?.email,
        newStatus: req.body.status,
      },
    });

    res.status(200).json({
      success: true,
      message: `Admin account status updated to ${req.body.status}.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
