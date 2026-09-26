import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
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
