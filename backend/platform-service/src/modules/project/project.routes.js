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
  assignStaffValidation,
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
  assignStaffController,
  getStaffProjectsController,
  downloadProjectReportPdfController,
  revalidateVendorPhotoController,
} from "./project.controller.js";
import { handleUpload, handleVendorPhotoUpload } from "../../middleware/upload.middleware.js";

const router = Router();

router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  getProjectsController
);

// GET /api/projects/staff/me - Get projects assigned to the authenticated staff member (STAFF)
router.get(
  "/staff/me",
  protect,
  authorize("STAFF"),
  getStaffProjectsController
);

// PATCH or POST /api/projects/:id/accept - Vendor accepts an assigned project (VENDOR)
router.patch(
  "/:id/accept",
  protect,
  authorize("VENDOR"),
  acceptProjectController
);
router.post(
  "/:id/accept",
  protect,
  authorize("VENDOR"),
  acceptProjectController
);

// GET /api/projects/:id/report/pdf - Download project report PDF (SUPER_ADMIN, ADMIN, VENDOR, STAFF)
router.get(
  "/:id/report/pdf",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"),
  downloadProjectReportPdfController
);

// GET /api/projects/:id - Read single project details (SUPER_ADMIN, ADMIN, VENDOR, STAFF)
router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"),
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
router.post(
  "/:id/notes",
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "VENDOR"),
  addProjectNoteController
);

// POST /api/projects/:id/photos - Vendor or assigned Staff uploads photo for a checklist item (VENDOR, STAFF)
router.post(
  "/:id/photos",
  protect,
  authorize("VENDOR", "STAFF"),
  handleVendorPhotoUpload,
  uploadVendorPhotoValidation,
  validate,
  uploadVendorPhotoController
);

// POST /api/projects/:id/submit - Vendor or assigned Staff submits project for review (VENDOR, STAFF)
router.post(
  "/:id/submit",
  protect,
  authorize("VENDOR", "STAFF"),
  submitVendorProjectValidation,
  validate,
  submitVendorProjectController
);

// DELETE /api/projects/:id/photos/:photoId - Vendor or assigned Staff deletes photo (VENDOR, STAFF)
router.delete(
  "/:id/photos/:photoId",
  protect,
  authorize("VENDOR", "STAFF"),
  deleteVendorPhotoValidation,
  validate,
  deleteVendorPhotoController
);

// POST /api/projects/:id/photos/:photoId/revalidate - Vendor or assigned Staff revalidates photo with AI (VENDOR, STAFF)
router.post(
  "/:id/photos/:photoId/revalidate",
  protect,
  authorize("VENDOR", "STAFF"),
  revalidateVendorPhotoController
);

// POST /api/projects/:id/assign-staff - Vendor assigns project to a staff member (VENDOR)
router.post(
  "/:id/assign-staff",
  protect,
  authorize("VENDOR"),
  assignStaffValidation,
  validate,
  assignStaffController
);

export default router;
