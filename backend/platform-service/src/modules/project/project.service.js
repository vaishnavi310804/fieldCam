import Project from "./project.model.js";
import Service from "../service/service.model.js";
import Vendor from "../vendor/vendor.model.js";
import mongoose from "mongoose";

/**
 * Creates a new Project document.
 * @param {Object} projectData 
 * @returns {Promise<Object>}
 */
export const createProject = async (projectData) => {
  // 1. Verify serviceId exists in Service collection
  if (!mongoose.Types.ObjectId.isValid(projectData.serviceId)) {
    throw new Error("Invalid service ID format");
  }

  const service = await Service.findById(projectData.serviceId);
  if (!service) {
    throw new Error("Referenced service does not exist");
  }

  // 2. Verify service is ACTIVE
  if (service.status !== "ACTIVE") {
    throw new Error("Referenced service is not active");
  }

  // 3. Verify vendorId when provided
  if (projectData.vendorId) {
    if (!mongoose.Types.ObjectId.isValid(projectData.vendorId)) {
      throw new Error("Invalid vendor ID format");
    }

    const vendor = await Vendor.findById(projectData.vendorId);
    if (!vendor) {
      throw new Error("Referenced vendor does not exist");
    }

    // 4. Verify vendor status is Active
    if (vendor.status !== "Active") {
      throw new Error("Referenced vendor is not active");
    }

    // 5. Derive vendorName if omitted
    if (!projectData.vendorName) {
      projectData.vendorName = vendor.companyName;
    }
  }

  // 6. Prevent duplicate projectId
  const existingProject = await Project.findOne({
    projectId: projectData.projectId.trim(),
  });
  if (existingProject) {
    throw new Error("Project ID already exists");
  }

  // Ensure serviceTypeName matches
  if (!projectData.serviceTypeName) {
    projectData.serviceTypeName = service.serviceTypeName;
  }

  // 7. Create Project document
  const project = await Project.create(projectData);
  return project;
};

/**
 * Retrieves projects with search and filtering.
 * @param {Object} query - { status, vendorId, serviceId, search }
 * @returns {Promise<Array>}
 */
export const getProjects = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.vendorId && mongoose.Types.ObjectId.isValid(query.vendorId)) {
    filter.vendorId = query.vendorId;
  }

  if (query.serviceId && mongoose.Types.ObjectId.isValid(query.serviceId)) {
    filter.serviceId = query.serviceId;
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { projectId: searchRegex },
      { projectName: searchRegex },
      { client: searchRegex },
      { location: searchRegex },
      { vendorName: searchRegex },
      { serviceTypeName: searchRegex },
    ];
  }

  const projects = await Project.find(filter)
    .populate("serviceId", "serviceCategory serviceTypeName defaultPrice status")
    .populate("vendorId", "companyName contactName location rating status")
    .sort({ createdAt: -1 });

  return projects;
};

/**
 * Retrieves a single project document by ID.
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getProjectById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid project ID format");
  }

  const project = await Project.findById(id)
    .populate("serviceId", "serviceCategory serviceTypeName defaultPrice status")
    .populate("vendorId", "companyName contactName location rating status");

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

/**
 * Updates an existing project.
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateProject = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid project ID format");
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new Error("Project not found");
  }

  // Changing serviceId check
  if (updateData.serviceId && updateData.serviceId.toString() !== project.serviceId.toString()) {
    if (!mongoose.Types.ObjectId.isValid(updateData.serviceId)) {
      throw new Error("Invalid service ID format");
    }

    const service = await Service.findById(updateData.serviceId);
    if (!service) {
      throw new Error("Referenced service does not exist");
    }

    if (service.status !== "ACTIVE") {
      throw new Error("Referenced service is not active");
    }

    if (!updateData.serviceTypeName) {
      updateData.serviceTypeName = service.serviceTypeName;
    }
  }

  // Changing vendorId check
  if (updateData.vendorId && (!project.vendorId || updateData.vendorId.toString() !== project.vendorId.toString())) {
    if (!mongoose.Types.ObjectId.isValid(updateData.vendorId)) {
      throw new Error("Invalid vendor ID format");
    }

    const vendor = await Vendor.findById(updateData.vendorId);
    if (!vendor) {
      throw new Error("Referenced vendor does not exist");
    }

    if (vendor.status !== "Active") {
      throw new Error("Referenced vendor is not active");
    }

    if (!updateData.vendorName) {
      updateData.vendorName = vendor.companyName;
    }
  }

  const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("serviceId", "serviceCategory serviceTypeName defaultPrice status")
    .populate("vendorId", "companyName contactName location rating status");

  return updatedProject;
};

/**
 * Updates status of a project.
 * @param {string} id 
 * @param {string} status 
 * @param {string} [rejectionReason] 
 * @returns {Promise<Object>}
 */
export const updateProjectStatus = async (id, status, rejectionReason) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid project ID format");
  }

  const ALLOWED_STATUSES = [
    "New",
    "In Progress",
    "Submitted",
    "Under Review",
    "Approved",
    "Rejected",
  ];

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid project status");
  }

  const updateFields = { status };

  if (status === "Rejected") {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error("Rejection reason is required when rejecting a project");
    }
    updateFields.rejectionReason = rejectionReason.trim();
  } else if (status === "Approved") {
    updateFields.rejectionReason = null;
  }

  const updatedProject = await Project.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate("serviceId", "serviceCategory serviceTypeName defaultPrice status")
    .populate("vendorId", "companyName contactName location rating status");

  if (!updatedProject) {
    throw new Error("Project not found");
  }

  return updatedProject;
};
