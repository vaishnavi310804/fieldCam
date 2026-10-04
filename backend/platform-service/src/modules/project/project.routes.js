import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createProjectValidation,
  updateProjectValidation,
  updateProjectStatusValidation,
  uploadVendorPhotoValidation,
  deleteVendorPhotoValidation,
  submitVendorProjectValidation,
} from "./project.validation.js";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  updateProjectStatusController,
  acceptProjectController,
  getProjectNotesController,
  addProjectNoteController,
  uploadVendorPhotoController,
  deleteVendorPhotoController,
  submitVendorProjectController,
} from "./project.controller.js";
import { handleUpload, handleVendorPhotoUpload } from "../../middleware/upload.middleware.js";

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
router.get(
  "/:id/notes",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getProjectNotesController
);

// POST /api/projects/:id/photos - Vendor uploads photo for a checklist item (VENDOR)
router.post(
  "/:id/photos",
  protect,
  authorize("VENDOR"),
  handleVendorPhotoUpload,
  uploadVendorPhotoValidation,
  validate,
  uploadVendorPhotoController
);

// POST /api/projects/:id/submit - Vendor submits project for review (VENDOR)
router.post(
  "/:id/submit",
  protect,
  authorize("VENDOR"),
  submitVendorProjectValidation,
  validate,
  submitVendorProjectController
);

// DELETE /api/projects/:id/photos/:photoId - Vendor deletes photo (VENDOR)
router.delete(
  "/:id/photos/:photoId",
  protect,
  authorize("VENDOR"),
  deleteVendorPhotoValidation,
  validate,
  deleteVendorPhotoController
);

export default router;
