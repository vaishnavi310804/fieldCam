import { Router } from "express";
import { protect, authorize, requirePermission } from "../../middleware/auth.middleware.js";
import { PERMISSION_MODULES } from "../roles/role.model.js";
import validate from "../../middleware/validate.js";
import {
  createProjectValidation,
  updateProjectValidation,
  updateProjectStatusValidation,
  uploadVendorPhotoValidation,
  deleteVendorPhotoValidation,
  submitVendorProjectValidation,
  assignStaffValidation,
  assignVendorValidation,
} from "./project.validation.js";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  updateProjectStatusController,
  acceptProjectController,
  rejectProjectController,
  getProjectNotesController,
  addProjectNoteController,
  uploadVendorPhotoController,
  deleteVendorPhotoController,
  submitVendorProjectController,
  assignStaffController,
  getStaffProjectsController,
  downloadProjectReportPdfController,
  revalidateVendorPhotoController,
  assignVendorController,
} from "./project.controller.js";
import { handleUpload, handleVendorPhotoUpload } from "../../middleware/upload.middleware.js";

const router = Router();

// GET /api/projects - List projects (Admin: PROJECTS:VIEW, Vendor: own projects)
router.get(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "VIEW", { allowRoles: ["VENDOR"] }),
  getProjectsController
);

// GET /api/projects/staff/me - Get projects assigned to authenticated staff member (STAFF)
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

// PATCH or POST /api/projects/:id/reject - Vendor rejects an assigned project (VENDOR)
router.patch(
  "/:id/reject",
  protect,
  authorize("VENDOR"),
  rejectProjectController
);
router.post(
  "/:id/reject",
  protect,
  authorize("VENDOR"),
  rejectProjectController
);

// GET /api/projects/:id/report/pdf - Download project report PDF (Admin: PROJECTS:EXPORT, Vendor/Staff: scoped)
router.get(
  "/:id/report/pdf",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "EXPORT", { allowRoles: ["VENDOR", "STAFF"] }),
  downloadProjectReportPdfController
);

// GET /api/projects/:id - Read single project details (Admin: PROJECTS:VIEW, Vendor/Staff: scoped)
router.get(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "VIEW", { allowRoles: ["VENDOR", "STAFF"] }),
  getProjectByIdController
);

// POST /api/projects - Create a new project (Admin: PROJECTS:CREATE)
router.post(
  "/",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "CREATE"),
  handleUpload,
  createProjectValidation,
  validate,
  createProjectController
);

// PUT /api/projects/:id - Update existing project (Admin: PROJECTS:EDIT)
router.put(
  "/:id",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "EDIT"),
  updateProjectValidation,
  validate,
  updateProjectController
);

// PATCH /api/projects/:id/status - Review project / status transition (Admin: PROJECTS:REVIEW)
router.patch(
  "/:id/status",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "REVIEW"),
  updateProjectStatusValidation,
  validate,
  updateProjectStatusController
);

// GET /api/projects/:id/notes - Read project notes (Admin: PROJECTS:VIEW, Vendor: scoped)
router.get(
  "/:id/notes",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "VIEW", { allowRoles: ["VENDOR"] }),
  getProjectNotesController
);

// POST /api/projects/:id/notes - Add project note (Admin: PROJECTS:EDIT, Vendor: scoped)
router.post(
  "/:id/notes",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "EDIT", { allowRoles: ["VENDOR"] }),
  addProjectNoteController
);

// POST /api/projects/:id/photos - Vendor or assigned Staff uploads photo (VENDOR, STAFF)
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

// POST /api/projects/:id/photos/:photoId/revalidate - Vendor or assigned Staff revalidates photo (VENDOR, STAFF)
router.post(
  "/:id/photos/:photoId/revalidate",
  protect,
  authorize("VENDOR", "STAFF"),
  revalidateVendorPhotoController
);

// POST or PATCH /api/projects/:id/assign - Assign project to a vendor (Admin: PROJECTS:ASSIGN)
router.post(
  "/:id/assign",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "ASSIGN"),
  assignVendorValidation,
  validate,
  assignVendorController
);
router.patch(
  "/:id/assign",
  protect,
  requirePermission(PERMISSION_MODULES.PROJECTS, "ASSIGN"),
  assignVendorValidation,
  validate,
  assignVendorController
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
