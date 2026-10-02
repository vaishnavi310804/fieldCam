import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  acceptProject,
  getProjectNotes,
  addProjectNote,
} from "./project.service.js";
import Vendor from "../vendor/vendor.model.js";
import { logAuditEvent } from "../audit/audit.service.js";

/**
 * Controller to handle Project creation.
 */
export const createProjectController = async (req, res) => {
  try {
    const result = await createProject(req.body, req.files);

    await logAuditEvent({
      actor: req.user,
      action: "PROJECT_CREATED",
      entityType: "Project",
      entityId: result.projectId || result._id?.toString() || "",
      description: `Created project ${result.projectName || ""} (${result.projectId || ""})`.trim(),
      metadata: { projectId: result.projectId, projectName: result.projectName, client: result.client },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create project",
    });
  }
};

/**
 * Controller to handle fetching all projects with filters & search.
 */
export const getProjectsController = async (req, res) => {
  try {
    const query = { ...req.query };

    // Strict Vendor Scoping for VENDOR role
    if (req.user && req.user.role === "VENDOR") {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (!vendor) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      query.vendorId = vendor._id.toString();
    }

    const result = await getProjects(query);
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch projects",
    });
  }
};

/**
 * Controller to handle fetching a single project by ID.
 */
export const getProjectByIdController = async (req, res) => {
  try {
    const result = await getProjectById(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message === "Project not found" || error.message.includes("Invalid project ID")
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Project not found",
    });
  }
};

/**
 * Controller to handle updating an existing project.
 */
export const updateProjectController = async (req, res) => {
  try {
    const result = await updateProject(req.params.id, req.body);

    await logAuditEvent({
      actor: req.user,
      action: "PROJECT_UPDATED",
      entityType: "Project",
      entityId: result.projectId || result._id?.toString() || req.params.id,
      description: `Updated project ${result.projectName || ""} (${result.projectId || ""})`.trim(),
      metadata: { projectId: result.projectId, projectName: result.projectName },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message === "Project not found" || error.message.includes("Invalid project ID")
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update project",
    });
  }
};

/**
 * Controller to handle updating project status.
 */
export const updateProjectStatusController = async (req, res) => {
  try {
    const result = await updateProjectStatus(
      req.params.id,
      req.body.status,
      req.body.rejectionReason,
      req.body.reviewComments
    );

    await logAuditEvent({
      actor: req.user,
      action: "PROJECT_STATUS_CHANGED",
      entityType: "Project",
      entityId: result.projectId || result._id?.toString() || req.params.id,
      description: `Changed status of project ${result.projectName || ""} (${result.projectId || ""}) to ${result.status}`.trim(),
      metadata: {
        projectId: result.projectId,
        projectName: result.projectName,
        newStatus: result.status,
        rejectionReason: result.rejectionReason || null,
        reviewComments: result.reviewComments || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project status updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message === "Project not found" || error.message.includes("Invalid project ID")
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update project status",
    });
  }
};

/**
 * Controller to handle Vendor Project Acceptance (ASSIGNED -> In Progress).
 * PATCH /api/projects/:id/accept
 */
export const acceptProjectController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const projectId = req.params.id;

    const result = await acceptProject(projectId, userId);

    await logAuditEvent({
      actor: req.user,
      action: "PROJECT_ACCEPTED",
      entityType: "Project",
      entityId: result.projectId || result._id?.toString() || "",
      description: `Vendor accepted project ${result.projectName || ""} (${result.projectId || ""})`.trim(),
      metadata: { projectId: result.projectId, newStatus: result.status },
    });

    return res.status(200).json({
      success: true,
      message: "Project accepted successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to accept project",
    });
  }
};

/**
 * Controller to fetch project notes.
 * GET /api/projects/:id/notes
 */
export const getProjectNotesController = async (req, res) => {
  try {
    const notes = await getProjectNotes(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch project notes",
    });
  }
};

/**
 * Controller to add a note to a project.
 * POST /api/projects/:id/notes
 */
export const addProjectNoteController = async (req, res) => {
  try {
    const note = await addProjectNote(req.params.id, req.body.text, req.user);

    await logAuditEvent({
      actor: req.user,
      action: "PROJECT_NOTE_ADDED",
      entityType: "Project",
      entityId: req.params.id,
      description: `Added note to project: ${note.text.slice(0, 40)}...`,
      metadata: { noteId: note._id, textLength: note.text.length },
    });

    return res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: note,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to add project note",
    });
  }
};
