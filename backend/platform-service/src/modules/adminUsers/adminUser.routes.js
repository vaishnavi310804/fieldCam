import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createAdminValidation,
  reassignRoleValidation,
  updateStatusValidation,
} from "./adminUser.validation.js";
import {
  listAdminUsersController,
  createAdminUserController,
  reassignAdminRoleController,
  updateAdminStatusController,
} from "./adminUser.controller.js";

const router = Router();

// Strict Super Admin Access: All Admin user management endpoints require authentication
// and strictly restrict access to SUPER_ADMIN.
// FULL_ADMIN, custom Admins, Vendors, and Staff are denied with 403 Forbidden.
router.use(protect);
router.use(authorize("SUPER_ADMIN"));

// GET /api/admin-users - List Admin accounts with assigned roles and account status
router.get("/", listAdminUsersController);

// POST /api/admin-users - Invite / create an Admin with roleId assignment and OTP setup
router.post("/", createAdminValidation, validate, createAdminUserController);

// PATCH /api/admin-users/:id/role - Reassign an Admin user to another eligible role
router.patch(
  "/:id/role",
  reassignRoleValidation,
  validate,
  reassignAdminRoleController
);

// PATCH /api/admin-users/:id/status - Activate or deactivate an Admin account
router.patch(
  "/:id/status",
  updateStatusValidation,
  validate,
  updateAdminStatusController
);

export default router;
