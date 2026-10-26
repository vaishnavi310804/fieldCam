import {
  listAdminUsers,
  createAdminUser,
  reassignAdminRole,
  updateAdminStatus,
} from "./adminUser.service.js";

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
    res.status(200).json({
      success: true,
      message: `Admin account status updated to ${req.body.status}.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
