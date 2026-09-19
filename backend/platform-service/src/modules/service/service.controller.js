import {
  createService,
  getServices,
  getServiceById,
  updateService,
  updateServiceStatus,
} from "./service.service.js";

/**
 * Controller to handle Service creation.
 */
export const createServiceController = async (req, res) => {
  try {
    const result = await createService(req.body);
    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create service",
    });
  }
};

/**
 * Controller to handle fetching all services.
 */
export const getServicesController = async (req, res) => {
  try {
    const result = await getServices(req.query);
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch services",
    });
  }
};

/**
 * Controller to handle fetching a single service by ID.
 */
export const getServiceByIdController = async (req, res) => {
  try {
    const result = await getServiceById(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Service not found" || error.message.includes("Invalid service ID") ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Service not found",
    });
  }
};

/**
 * Controller to handle updating a service configuration.
 */
export const updateServiceController = async (req, res) => {
  try {
    const result = await updateService(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: result,
    });
  } catch (error) {
    let statusCode = 400;
    if (error.message === "Service not found" || error.message.includes("Invalid service ID")) {
      statusCode = 404;
    }
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update service",
    });
  }
};

/**
 * Controller to handle updating service status.
 */
export const updateServiceStatusController = async (req, res) => {
  try {
    const result = await updateServiceStatus(req.params.id, req.body.status);
    return res.status(200).json({
      success: true,
      message: "Service status updated successfully",
      data: result,
    });
  } catch (error) {
    let statusCode = 400;
    if (error.message === "Service not found" || error.message.includes("Invalid service ID")) {
      statusCode = 404;
    }
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update service status",
    });
  }
};
