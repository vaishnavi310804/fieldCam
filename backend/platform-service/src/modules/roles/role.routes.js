import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createRoleValidation,
  updateRoleValidation,
  roleIdParamValidation,
} from "./role.validation.js";
import {
  listRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
  getMyPermissionsController,
} from "./role.controller.js";

const router = Router();

// GET /api/roles/me/permissions - Authenticated user's effective permissions
// Derived strictly from the verified bearer token in protect
router.get("/me/permissions", protect, getMyPermissionsController);

// Strict Super Admin Access: Every role-management endpoint requires authentication
// and strictly restricts access to SUPER_ADMIN.
// FULL_ADMIN, custom Admins, Vendors, and Staff are denied with 403 Forbidden.
router.use(protect);
router.use(authorize("SUPER_ADMIN"));

// GET /api/roles - List all system and custom roles with user assignment counts
router.get("/", listRolesController);

// GET /api/roles/:id - Get a single role by ID
router.get("/:id", roleIdParamValidation, validate, getRoleByIdController);

// POST /api/roles - Create a new custom role
router.post("/", createRoleValidation, validate, createRoleController);

// PUT /api/roles/:id - Update custom role details and permissions
router.put(
  "/:id",
  roleIdParamValidation,
  updateRoleValidation,
  validate,
  updateRoleController
);

// DELETE /api/roles/:id - Delete a custom role (fails if role is assigned or system role)
router.delete("/:id", roleIdParamValidation, validate, deleteRoleController);

export default router;
