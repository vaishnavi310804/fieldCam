import Service from "./service.model.js";
import mongoose from "mongoose";

/**
 * Creates a new Service configuration.
 * @param {Object} serviceData 
 * @returns {Promise<Object>}
 */
export const createService = async (serviceData) => {
  const existingService = await Service.findOne({
    serviceTypeName: { $regex: new RegExp(`^${serviceData.serviceTypeName.trim()}$`, "i") },
  });

  if (existingService) {
    throw new Error("Service type name already exists");
  }

  const service = await Service.create(serviceData);
  return service;
};

/**
 * Retrieves all services with optional filters.
 * @param {Object} filters - { status, category, serviceCategory }
 * @returns {Promise<Array>}
 */
export const getServices = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  const categoryFilter = filters.category || filters.serviceCategory;
  if (categoryFilter) {
    query.serviceCategory = categoryFilter;
  }

  const services = await Service.find(query).sort({ createdAt: -1 });
  return services;
};

/**
 * Retrieves a single service by ID.
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getServiceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service ID format");
  }

  const service = await Service.findById(id);
  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

/**
 * Updates an existing service configuration.
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service ID format");
  }

  if (updateData.serviceTypeName) {
    const existingService = await Service.findOne({
      serviceTypeName: { $regex: new RegExp(`^${updateData.serviceTypeName.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingService) {
      throw new Error("Service type name already exists");
    }
  }

  const updatedService = await Service.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedService) {
    throw new Error("Service not found");
  }

  return updatedService;
};

/**
 * Updates the status of a service (ACTIVE / INACTIVE).
 * @param {string} id 
 * @param {string} status 
 * @returns {Promise<Object>}
 */
export const updateServiceStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service ID format");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    throw new Error("Status must be ACTIVE or INACTIVE");
  }

  const updatedService = await Service.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedService) {
    throw new Error("Service not found");
  }

  return updatedService;
};
