import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
} from "./project.service.js";

/**
 * Controller to handle Project creation.
 */
export const createProjectController = async (req, res) => {
  try {
    const result = await createProject(req.body);
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
    const result = await getProjects(req.query);
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
      req.body.rejectionReason
    );
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
