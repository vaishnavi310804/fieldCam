import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createProjectValidation,
  updateProjectValidation,
  updateProjectStatusValidation,
} from "./project.validation.js";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  updateProjectStatusController,
  acceptProjectController,
} from "./project.controller.js";
import { handleUpload } from "../../middleware/upload.middleware.js";

const router = Router();

router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getProjectsController
);

// PATCH /api/projects/:id/accept - Vendor accepts an assigned project (VENDOR)
router.patch(
  "/:id/accept",
  protect,
  authorize("VENDOR"),
  acceptProjectController
);

// GET /api/projects/:id - Read single project details (SUPER_ADMIN, ADMIN, VENDOR)
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getProjectByIdController
);

// POST /api/projects - Create a new project (SUPER_ADMIN, ADMIN)
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  handleUpload,
  createProjectValidation,
  validate,
  createProjectController
);

// PUT /api/projects/:id - Update existing project (SUPER_ADMIN, ADMIN)
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateProjectValidation,
  validate,
  updateProjectController
);

// PATCH /api/projects/:id/status - Update project status (SUPER_ADMIN, ADMIN)
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateProjectStatusValidation,
  validate,
  updateProjectStatusController
);

export default router;
