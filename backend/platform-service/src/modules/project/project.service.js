import Project from "./project.model.js";
import Service from "../service/service.model.js";
import Vendor from "../vendor/vendor.model.js";
import mongoose from "mongoose";
import { uploadToS3, deleteFromS3, getPresignedMediaUrl } from "../../services/s3Service.js";
import { createNotification } from "../notification/notification.service.js";

/**
 * Helper to get a vendor's user ID for notification delivery.
 * @param {string|mongoose.Types.ObjectId} vendorId
 * @returns {Promise<mongoose.Types.ObjectId|null>}
 */
const getVendorUserId = async (vendorId) => {
  if (!vendorId) return null;
  const vendor = await Vendor.findById(vendorId);
  return vendor ? vendor.userId : null;
};

/**
 * Helper to generate temporary presigned GET URLs for a project's photos & attachments.
 * Converts Mongoose document to plain JS object without modifying DB.
 * @param {Object} projectDoc - Mongoose Project document
 * @returns {Promise<Object>} Plain project object with presigned media URLs
 */
const transformProjectMedia = async (projectDoc) => {
  if (!projectDoc) return projectDoc;

  const projectObj = typeof projectDoc.toObject === "function"
    ? projectDoc.toObject()
    : { ...projectDoc };

  // Parallel presigned URL generation for photos
  if (Array.isArray(projectObj.photos) && projectObj.photos.length > 0) {
    projectObj.photos = await Promise.all(
      projectObj.photos.map(async (photo) => {
        if (!photo || !photo.url) return photo;
        const presignedUrl = await getPresignedMediaUrl(photo.url);
        return {
          ...photo,
          url: presignedUrl || photo.url,
        };
      })
    );
  }

  // Parallel presigned URL generation for attachments
  if (Array.isArray(projectObj.attachments) && projectObj.attachments.length > 0) {
    projectObj.attachments = await Promise.all(
      projectObj.attachments.map(async (attachment) => {
        if (!attachment || !attachment.url) return attachment;
        const presignedUrl = await getPresignedMediaUrl(attachment.url);
        return {
          ...attachment,
          url: presignedUrl || attachment.url,
        };
      })
    );
  }

  return projectObj;
};

/**
 * Creates a new Project document.
 * @param {Object} projectData 
 * @param {Object} [files] - Multer req.files object { photos, attachments }
 * @returns {Promise<Object>}
 */
export const createProject = async (projectData, files = {}) => {
  // Parse checklistItems if sent as JSON string in FormData
  if (typeof projectData.checklistItems === "string") {
    try {
      projectData.checklistItems = JSON.parse(projectData.checklistItems);
    } catch (e) {
      // Keep original value if parsing fails
    }
  }

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

  const uploadedKeys = [];

  try {
    // Process Photo files if present
    if (files && files.photos && files.photos.length > 0) {
      const photosList = [];
      for (const photoFile of files.photos) {
        const uploadResult = await uploadToS3(photoFile, "images");
        uploadedKeys.push(uploadResult.key);
        photosList.push({
          url: uploadResult.key,
          caption: photoFile.originalname,
          category: "General",
          uploadedAt: new Date(),
        });
      }
      projectData.photos = photosList;
    }

    // Process Attachment files if present
    if (files && files.attachments && files.attachments.length > 0) {
      const attachmentsList = [];
      for (const attachmentFile of files.attachments) {
        const uploadResult = await uploadToS3(attachmentFile, "attachments");
        uploadedKeys.push(uploadResult.key);
        attachmentsList.push({
          url: uploadResult.key,
          filename: attachmentFile.originalname,
          size: attachmentFile.size || attachmentFile.buffer?.length,
          uploadedAt: new Date(),
        });
      }
      projectData.attachments = attachmentsList;
    }

    // 7. Create Project document
    const project = await Project.create(projectData);

    // Side effect: Notify assigned vendor if applicable
    if (project.vendorId) {
      try {
        const vendorUserId = await getVendorUserId(project.vendorId);
        if (vendorUserId) {
          await createNotification({
            userId: vendorUserId,
            title: "New Project Assigned",
            body: `Project "${project.projectName}" (${project.projectId}) has been assigned to you.`,
            type: "PROJECT_UPDATED",
            data: { projectId: project._id.toString(), projectCode: project.projectId },
          });
        }
      } catch (notifErr) {
        console.error("Failed to generate project assignment notification:", notifErr.message);
      }
    }

    return await transformProjectMedia(project);
  } catch (error) {
    // Rollback: delete uploaded S3 objects if project creation fails
    if (uploadedKeys.length > 0) {
      await Promise.allSettled(uploadedKeys.map((key) => deleteFromS3(key)));
    }
    throw error;
  }
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

  return await Promise.all(projects.map((proj) => transformProjectMedia(proj)));
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

  return await transformProjectMedia(project);
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

  // Side effect: Notify assigned vendor if applicable
  if (updatedProject && updatedProject.vendorId) {
    try {
      const vendorObj = updatedProject.vendorId;
      const vendorIdVal = vendorObj._id || vendorObj;
      const vendorUserId = await getVendorUserId(vendorIdVal);
      if (vendorUserId) {
        await createNotification({
          userId: vendorUserId,
          title: "Project Updated",
          body: `Project "${updatedProject.projectName}" (${updatedProject.projectId}) details have been updated.`,
          type: "PROJECT_UPDATED",
          data: { projectId: updatedProject._id.toString(), projectCode: updatedProject.projectId },
        });
      }
    } catch (notifErr) {
      console.error("Failed to generate project update notification:", notifErr.message);
    }
  }

  return await transformProjectMedia(updatedProject);
};

/**
 * Updates status of a project.
 * @param {string} id 
 * @param {string} status 
 * @param {string} [rejectionReason] 
 * @param {string} [reviewComments]
 * @returns {Promise<Object>}
 */
export const updateProjectStatus = async (id, status, rejectionReason, reviewComments) => {
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

  if (reviewComments !== undefined) {
    updateFields.reviewComments = reviewComments ? reviewComments.trim() : null;
  }

  if (status === "Rejected") {
    const finalReason = (rejectionReason || reviewComments || "").trim();
    if (!finalReason) {
      throw new Error("Rejection reason is required when rejecting a project");
    }
    updateFields.rejectionReason = finalReason;
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

  // Side effect: Notify assigned vendor if applicable
  if (updatedProject.vendorId) {
    try {
      const vendorObj = updatedProject.vendorId;
      const vendorIdVal = vendorObj._id || vendorObj;
      const vendorUserId = await getVendorUserId(vendorIdVal);
      if (vendorUserId) {
        let title = `Project Status: ${updatedProject.status}`;
        let body = `Project "${updatedProject.projectName}" (${updatedProject.projectId}) status changed to ${updatedProject.status}.`;
        if (updatedProject.status === "Approved") {
          title = "Project Approved";
          body = `Project "${updatedProject.projectName}" (${updatedProject.projectId}) has been approved.`;
        } else if (updatedProject.status === "Rejected") {
          title = "Project Rejected";
          body = `Project "${updatedProject.projectName}" (${updatedProject.projectId}) was rejected: ${updatedProject.rejectionReason || "No reason specified"}.`;
        }
        await createNotification({
          userId: vendorUserId,
          title,
          body,
          type: "PROJECT_UPDATED",
          data: {
            projectId: updatedProject._id.toString(),
            projectCode: updatedProject.projectId,
            status: updatedProject.status,
          },
        });
      }
    } catch (notifErr) {
      console.error("Failed to generate project status notification:", notifErr.message);
    }
  }

  return await transformProjectMedia(updatedProject);
};
