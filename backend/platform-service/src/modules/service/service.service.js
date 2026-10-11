import Service from "./service.model.js";
import mongoose from "mongoose";

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
