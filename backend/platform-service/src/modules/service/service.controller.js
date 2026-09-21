import {
  createService,
  getServices,
  getServiceById,
  updateService,
  updateServiceStatus,
} from "./service.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

/**
 * Controller to handle Service creation.
 */
export const createServiceController = async (req, res) => {
  try {
    const result = await createService(req.body);

    await logAuditEvent({
      actor: req.user,
      action: "SERVICE_CREATED",
      entityType: "Service",
      entityId: result._id?.toString() || "",
      description: `Created service ${result.serviceTypeName || ""}`.trim(),
      metadata: { serviceTypeName: result.serviceTypeName, serviceCategory: result.serviceCategory },
    });

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

    await logAuditEvent({
      actor: req.user,
      action: "SERVICE_UPDATED",
      entityType: "Service",
      entityId: result._id?.toString() || req.params.id,
      description: `Updated service ${result.serviceTypeName || ""}`.trim(),
      metadata: { serviceTypeName: result.serviceTypeName },
    });

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

    await logAuditEvent({
      actor: req.user,
      action: "SERVICE_STATUS_CHANGED",
      entityType: "Service",
      entityId: result._id?.toString() || req.params.id,
      description: `Changed status of service ${result.serviceTypeName || ""} to ${result.status}`.trim(),
      metadata: { serviceTypeName: result.serviceTypeName, newStatus: result.status },
    });

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
