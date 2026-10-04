import Project from "./project.model.js";
import Service from "../service/service.model.js";
import Vendor from "../vendor/vendor.model.js";
import mongoose from "mongoose";
import { uploadToS3, deleteFromS3, getPresignedMediaUrl } from "../../services/s3Service.js";
import { validatePhotoWithAI } from "../../services/aiService.js";
import { validatePhotoLocation, validateCaptureTimestamp } from "../../utils/geo.utils.js";
import { createNotification } from "../notification/notification.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

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

  // Parse locationCoordinates if sent as JSON string in FormData
  if (typeof projectData.locationCoordinates === "string") {
    try {
      projectData.locationCoordinates = JSON.parse(projectData.locationCoordinates);
    } catch (e) {
      // Keep original value if parsing fails
    }
  }

  if (projectData.locationCoordinates) {
    const lat = Number(projectData.locationCoordinates.latitude);
    const lng = Number(projectData.locationCoordinates.longitude);
    if (projectData.locationCoordinates.latitude !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      throw new Error("Latitude must be a number between -90 and 90");
    }
    if (projectData.locationCoordinates.longitude !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      throw new Error("Longitude must be a number between -180 and 180");
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

    // Automatically transition status to ASSIGNED when vendor is assigned on creation
    if (!projectData.status || projectData.status === "New") {
      projectData.status = "ASSIGNED";
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

  // Parse and reset checklistItems on creation (ensure only selected items are stored, unchecked by default)
  if (typeof projectData.checklistItems === "string") {
    try {
      projectData.checklistItems = JSON.parse(projectData.checklistItems);
    } catch (e) {
      console.warn("Failed to parse checklistItems JSON:", e.message);
    }
  }
  if (Array.isArray(projectData.checklistItems)) {
    const selectedItems = projectData.checklistItems.filter(
      (item) => item.checked !== false || projectData.checklistItems.every((i) => i.checked === false)
    );
    projectData.checklistItems = selectedItems.map((item, idx) => ({
      id: String(item.id || idx + 1),
      label: item.label,
      checked: false,
    }));
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
            body: `You have been assigned a new project: "${project.projectName}".`,
            type: "PROJECT_UPDATED",
            data: {
              projectId: project.projectId,
              projectMongoId: project._id.toString(),
              status: project.status || "ASSIGNED",
            },
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
 * @param {Object} [user] - Authenticated user object
 * @returns {Promise<Object>}
 */
export const getProjectById = async (id, user) => {
  let project = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    project = await Project.findById(id)
      .populate("serviceId", "serviceCategory serviceTypeName defaultPrice status")
      .populate("vendorId", "companyName contactName location rating status");
  }

  if (!project) {
    project = await Project.findOne({ projectId: id })
      .populate("serviceId", "serviceCategory serviceTypeName defaultPrice status")
      .populate("vendorId", "companyName contactName location rating status");
  }

  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  // Authorization check for VENDOR role
  if (user && user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id || user._id });
    const projectVendorIdStr = project.vendorId?._id
      ? project.vendorId._id.toString()
      : project.vendorId
      ? project.vendorId.toString()
      : null;

    if (!vendor || !projectVendorIdStr || projectVendorIdStr !== vendor._id.toString()) {
      const err = new Error("You are not authorized to access this project");
      err.statusCode = 403;
      throw err;
    }
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

  if (typeof updateData.locationCoordinates === "string") {
    try {
      updateData.locationCoordinates = JSON.parse(updateData.locationCoordinates);
    } catch (e) {
      // Keep original value if parsing fails
    }
  }

  if (updateData.locationCoordinates) {
    const lat = Number(updateData.locationCoordinates.latitude);
    const lng = Number(updateData.locationCoordinates.longitude);
    if (updateData.locationCoordinates.latitude !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      throw new Error("Latitude must be a number between -90 and 90");
    }
    if (updateData.locationCoordinates.longitude !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      throw new Error("Longitude must be a number between -180 and 180");
    }
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
  let isVendorAssignmentChanged = false;
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

    isVendorAssignmentChanged = true;
    if (!updateData.status || updateData.status === "New") {
      updateData.status = "ASSIGNED";
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
        if (isVendorAssignmentChanged) {
          await createNotification({
            userId: vendorUserId,
            title: "New Project Assigned",
            body: `You have been assigned a new project: "${updatedProject.projectName}".`,
            type: "PROJECT_UPDATED",
            data: {
              projectId: updatedProject.projectId,
              projectMongoId: updatedProject._id.toString(),
              status: updatedProject.status || "ASSIGNED",
            },
          });
        } else {
          await createNotification({
            userId: vendorUserId,
            title: "Project Updated",
            body: `Project "${updatedProject.projectName}" (${updatedProject.projectId}) details have been updated.`,
            type: "PROJECT_UPDATED",
            data: { projectId: updatedProject._id.toString(), projectCode: updatedProject.projectId },
          });
        }
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
    "ASSIGNED",
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
        if (updatedProject.status === "ASSIGNED") {
          title = "New Project Assigned";
          body = `You have been assigned a new project: "${updatedProject.projectName}".`;
        } else if (updatedProject.status === "Approved") {
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

/**
 * Handles Vendor acceptance of an assigned project (ASSIGNED -> In Progress).
 * @param {string} projectIdOrId - MongoDB _id or string projectId
 * @param {string} userId - Authenticated Vendor user ID
 * @returns {Promise<Object>}
 */
export const acceptProject = async (projectIdOrId, userId) => {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    const err = new Error("Vendor profile not found for authenticated user");
    err.statusCode = 404;
    throw err;
  }

  let project = null;
  if (mongoose.Types.ObjectId.isValid(projectIdOrId)) {
    project = await Project.findById(projectIdOrId);
  }
  if (!project) {
    project = await Project.findOne({ projectId: projectIdOrId });
  }

  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  if (!project.vendorId || project.vendorId.toString() !== vendor._id.toString()) {
    const err = new Error("You are not authorized to accept this project");
    err.statusCode = 403;
    throw err;
  }

  if (project.status === "In Progress") {
    return await transformProjectMedia(project);
  }

  if (project.status !== "ASSIGNED" && project.status !== "New") {
    const err = new Error(`Cannot accept project with current status '${project.status}'`);
    err.statusCode = 400;
    throw err;
  }

  project.status = "In Progress";
  await project.save();

  try {
    await createNotification({
      userId,
      title: "Project Accepted",
      body: `You have accepted project "${project.projectName}" (${project.projectId}). It is now In Progress.`,
      type: "PROJECT_UPDATED",
      data: {
        projectId: project._id.toString(),
        projectCode: project.projectId,
        status: "In Progress",
      },
    });
  } catch (notifErr) {
    console.error("Failed to generate project acceptance notification:", notifErr.message);
  }

  return await transformProjectMedia(project);
};

/**
 * Helper to find project by ObjectId or string projectId
 */
const findProjectByIdOrCode = async (idOrCode) => {
  let project = null;
  if (mongoose.Types.ObjectId.isValid(idOrCode)) {
    project = await Project.findById(idOrCode);
  }
  if (!project) {
    project = await Project.findOne({ projectId: idOrCode });
  }
  return project;
};

/**
 * Retrieves notes for a project.
 * @param {string} projectIdOrId 
 * @param {Object} [user] - Authenticated user object
 * @returns {Promise<Array>} Array of note objects
 */
export const getProjectNotes = async (projectIdOrId, user) => {
  const project = await findProjectByIdOrCode(projectIdOrId);
  if (!project) {
    throw new Error("Project not found");
  }

  // If role is VENDOR, ensure vendor has access to this project
  if (user && user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id || user._id });
    if (!vendor || !project.vendorId || project.vendorId.toString() !== vendor._id.toString()) {
      const err = new Error("You are not authorized to access notes for this project");
      err.statusCode = 403;
      throw err;
    }
  }

  return project.notes || [];
};

/**
 * Adds a new note to a project.
 * @param {string} projectIdOrId 
 * @param {string} text 
 * @param {Object} user - Authenticated user object
 * @returns {Promise<Object>} Created note document
 */
export const addProjectNote = async (projectIdOrId, text, user) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Note text cannot be empty");
  }

  const project = await findProjectByIdOrCode(projectIdOrId);
  if (!project) {
    throw new Error("Project not found");
  }

  // Authorization check for VENDOR
  if (user && user.role === "VENDOR") {
    const vendor = await Vendor.findOne({ userId: user.id || user._id });
    if (!vendor || !project.vendorId || project.vendorId.toString() !== vendor._id.toString()) {
      const err = new Error("You are not authorized to add notes to this project");
      err.statusCode = 403;
      throw err;
    }
  }

  const newNote = {
    _id: new mongoose.Types.ObjectId(),
    text: text.trim(),
    authorId: user ? (user.id || user._id) : null,
    authorName: user ? (user.name || user.email || "Vendor") : "Vendor",
    createdAt: new Date(),
  };

  project.notes.push(newNote);
  await project.save();

  return newNote;
};

/**
 * Handles Vendor photo upload for a specific project checklist item.
 * @param {string} projectIdOrId - MongoDB _id or string projectId
 * @param {Object} file - Multer file object
 * @param {Object} body - Request body containing checklistItemId, capturedAt, location params
 * @param {Object} user - Authenticated user object (role: VENDOR)
 * @returns {Promise<Object>} { photo, project }
 */
export const uploadVendorPhoto = async (projectIdOrId, file, body = {}, user) => {
  if (!user || user.role !== "VENDOR") {
    const err = new Error("Only authenticated vendors can upload photos");
    err.statusCode = 403;
    throw err;
  }

  if (!file) {
    const err = new Error("Photo file is required");
    err.statusCode = 400;
    throw err;
  }

  if (!body.checklistItemId || !String(body.checklistItemId).trim()) {
    const err = new Error("Checklist item ID is required");
    err.statusCode = 400;
    throw err;
  }

  const vendor = await Vendor.findOne({ userId: user.id || user._id });
  if (!vendor) {
    const err = new Error("Vendor profile not found for authenticated user");
    err.statusCode = 404;
    throw err;
  }

  const project = await findProjectByIdOrCode(projectIdOrId);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  if (!project.vendorId || project.vendorId.toString() !== vendor._id.toString()) {
    const err = new Error("You are not authorized to upload photos to this project");
    err.statusCode = 403;
    throw err;
  }

  if (project.status !== "In Progress") {
    const err = new Error(`Photo capture is only allowed when project status is 'In Progress'. Current status is '${project.status}'`);
    err.statusCode = 400;
    throw err;
  }

  const targetChecklistItemId = String(body.checklistItemId).trim();
  const checklistItem = project.checklistItems?.find(
    (item) => String(item.id) === targetChecklistItemId
  );
  if (!checklistItem) {
    const err = new Error(`Referenced checklist item ID '${targetChecklistItemId}' does not exist in this project`);
    err.statusCode = 400;
    throw err;
  }

  // Location validation
  let locationData = undefined;
  if (body.latitude !== undefined && body.longitude !== undefined && body.latitude !== "" && body.longitude !== "") {
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      const err = new Error("Latitude must be a number between -90 and 90");
      err.statusCode = 400;
      throw err;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      const err = new Error("Longitude must be a number between -180 and 180");
      err.statusCode = 400;
      throw err;
    }
    let accuracyVal = undefined;
    if (body.accuracy !== undefined && body.accuracy !== "") {
      accuracyVal = Number(body.accuracy);
      if (isNaN(accuracyVal) || accuracyVal < 0) {
        const err = new Error("Accuracy must be a non-negative number");
        err.statusCode = 400;
        throw err;
      }
    }
    locationData = {
      latitude: lat,
      longitude: lng,
      accuracy: accuracyVal,
    };
  }

  // Captured date validation
  let capturedDate = new Date();
  if (body.capturedAt) {
    const parsedDate = new Date(body.capturedAt);
    if (isNaN(parsedDate.getTime())) {
      const err = new Error("capturedAt must be a valid ISO 8601 date string");
      err.statusCode = 400;
      throw err;
    }
    capturedDate = parsedDate;
  }

  const uploadResult = await uploadToS3(file, "images");

  const photoId = new mongoose.Types.ObjectId();
  const newPhoto = {
    _id: photoId,
    url: uploadResult.key,
    caption: body.caption?.trim() || file.originalname,
    category: checklistItem.label,
    checklistItemId: checklistItem.id,
    capturedAt: capturedDate,
    location: locationData,
    filename: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size || file.buffer?.length,
    uploadedAt: new Date(),
  };

  try {
    project.photos.push(newPhoto);
    checklistItem.checked = true;
    await project.save();
  } catch (saveError) {
    await deleteFromS3(uploadResult.key);
    throw saveError;
  }

  // Trigger AI validation via standalone ai-service
  let aiResult = { status: "PENDING", validatedAt: new Date() };
  try {
    const shortLivedPresignedUrl = await getPresignedMediaUrl(uploadResult.key, 900);
    if (shortLivedPresignedUrl) {
      aiResult = await validatePhotoWithAI(shortLivedPresignedUrl, checklistItem.label);
    }
  } catch (aiErr) {
    console.error("AI photo validation invocation error:", aiErr.message);
    aiResult = {
      status: "PENDING",
      reason: `AI validation failed: ${aiErr.message}`,
      validatedAt: new Date(),
    };
  }

  // Persist aiValidation result in photo document
  const savedPhotoIndex = project.photos.findIndex(
    (p) => p._id?.toString() === photoId.toString()
  );
  if (savedPhotoIndex !== -1) {
    project.photos[savedPhotoIndex].aiValidation = aiResult;
    await project.save();
  }

  try {
    await logAuditEvent({
      actor: user,
      action: "PHOTO_UPLOADED",
      entityType: "Project",
      entityId: project.projectId || project._id.toString(),
      description: `Uploaded photo for checklist item "${checklistItem.label}" in project ${project.projectId}`,
      metadata: {
        projectId: project.projectId,
        photoId: photoId.toString(),
        checklistItemId: checklistItem.id,
        category: checklistItem.label,
      },
    });

    if (aiResult.status === "PASSED" || aiResult.status === "FAILED") {
      await logAuditEvent({
        actor: user,
        action: "PHOTO_VALIDATED",
        entityType: "Project",
        entityId: project.projectId || project._id.toString(),
        description: `AI validated photo for checklist item "${checklistItem.label}" in project ${project.projectId}: ${aiResult.status}`,
        metadata: {
          projectId: project.projectId,
          photoId: photoId.toString(),
          checklistItemId: checklistItem.id,
          validationStatus: aiResult.status,
        },
      });
    }
  } catch (auditErr) {
    console.error("Failed to log audit event:", auditErr.message);
  }

  const updatedProject = await getProjectById(project._id.toString(), user);
  const createdPhoto = updatedProject.photos.find(
    (p) => p._id?.toString() === photoId.toString()
  ) || newPhoto;

  return {
    photo: createdPhoto,
    project: updatedProject,
  };
};

/**
 * Handles Vendor photo deletion for a specific project.
 * @param {string} projectIdOrId - MongoDB _id or string projectId
 * @param {string} photoId - MongoDB _id of photo or S3 key
 * @param {Object} user - Authenticated user object (role: VENDOR)
 * @returns {Promise<Object>} Updated project object
 */
export const deleteVendorPhoto = async (projectIdOrId, photoId, user) => {
  if (!user || user.role !== "VENDOR") {
    const err = new Error("Only authenticated vendors can delete photos");
    err.statusCode = 403;
    throw err;
  }

  const vendor = await Vendor.findOne({ userId: user.id || user._id });
  if (!vendor) {
    const err = new Error("Vendor profile not found for authenticated user");
    err.statusCode = 404;
    throw err;
  }

  const project = await findProjectByIdOrCode(projectIdOrId);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  if (!project.vendorId || project.vendorId.toString() !== vendor._id.toString()) {
    const err = new Error("You are not authorized to delete photos from this project");
    err.statusCode = 403;
    throw err;
  }

  if (project.status !== "In Progress") {
    const err = new Error(`Photo deletion is only allowed when project status is 'In Progress'. Current status is '${project.status}'`);
    err.statusCode = 400;
    throw err;
  }

  const photoIndex = project.photos.findIndex(
    (p) => p._id?.toString() === photoId || p.url === photoId
  );

  if (photoIndex === -1) {
    const err = new Error("Photo not found in this project");
    err.statusCode = 404;
    throw err;
  }

  const targetPhoto = project.photos[photoIndex];
  const s3Key = targetPhoto.url;

  try {
    await deleteFromS3(s3Key);
  } catch (s3Err) {
    console.error("S3 deletion failed:", s3Err);
    const err = new Error("Failed to delete photo from S3 storage");
    err.statusCode = 500;
    throw err;
  }

  const checklistItemId = targetPhoto.checklistItemId;

  project.photos.splice(photoIndex, 1);

  if (checklistItemId) {
    const remainingCategoryPhotos = project.photos.filter(
      (p) => String(p.checklistItemId) === String(checklistItemId)
    );
    if (remainingCategoryPhotos.length === 0) {
      const item = project.checklistItems?.find(
        (c) => String(c.id) === String(checklistItemId)
      );
      if (item) {
        item.checked = false;
      }
    }
  }

  await project.save();

  try {
    await logAuditEvent({
      actor: user,
      action: "PHOTO_DELETED",
      entityType: "Project",
      entityId: project.projectId || project._id.toString(),
      description: `Deleted photo ${photoId} from project ${project.projectId}`,
      metadata: {
        projectId: project.projectId,
        photoId,
        checklistItemId,
      },
    });
  } catch (auditErr) {
    console.error("Failed to log PHOTO_DELETED audit event:", auditErr.message);
  }

  return await getProjectById(project._id.toString(), user);
};

/**
 * Handles Vendor project submission (In Progress -> Submitted).
 * Enforces precondition: all required checklist items must have uploaded photos.
 * @param {string} projectIdOrId - MongoDB _id or string projectId
 * @param {Object} user - Authenticated user object (role: VENDOR)
 * @returns {Promise<Object>} Updated project object
 */
export const submitVendorProject = async (projectIdOrId, user) => {
  if (!user || user.role !== "VENDOR") {
    const err = new Error("Only authenticated vendors can submit projects");
    err.statusCode = 403;
    throw err;
  }

  const vendor = await Vendor.findOne({ userId: user.id || user._id });
  if (!vendor) {
    const err = new Error("Vendor profile not found for authenticated user");
    err.statusCode = 404;
    throw err;
  }

  const project = await findProjectByIdOrCode(projectIdOrId);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  if (!project.vendorId || project.vendorId.toString() !== vendor._id.toString()) {
    const err = new Error("You are not authorized to submit this project");
    err.statusCode = 403;
    throw err;
  }

  if (project.status !== "In Progress") {
    const err = new Error(`Cannot submit project with current status '${project.status}'. Only 'In Progress' projects can be submitted.`);
    err.statusCode = 400;
    throw err;
  }

  // Comprehensive Submission Gating (Phase 2C):
  // Checks: Checklist presence, AI Validation (PASSED), GPS Validation, Timestamp Validation
  const checklist = project.checklistItems || [];
  const validationErrors = [];

  if (checklist.length > 0) {
    for (const item of checklist) {
      const associatedPhotos = (project.photos || []).filter(
        (p) => String(p.checklistItemId) === String(item.id)
      );

      if (associatedPhotos.length === 0) {
        validationErrors.push({
          checklistItemId: String(item.id),
          category: item.label,
          reason: `Missing required photo evidence for checklist item "${item.label}"`,
        });
        continue;
      }

      for (const photo of associatedPhotos) {
        const photoIdStr = photo._id ? photo._id.toString() : null;

        // 1. AI Validation Check
        const aiVal = photo.aiValidation;
        if (!aiVal || !aiVal.status) {
          validationErrors.push({
            checklistItemId: String(item.id),
            category: item.label,
            photoId: photoIdStr,
            reason: `AI validation missing for checklist item "${item.label}"`,
          });
        } else if (aiVal.status === "PENDING") {
          validationErrors.push({
            checklistItemId: String(item.id),
            category: item.label,
            photoId: photoIdStr,
            reason: `AI validation is pending for checklist item "${item.label}"`,
          });
        } else if (aiVal.status === "FAILED") {
          validationErrors.push({
            checklistItemId: String(item.id),
            category: item.label,
            photoId: photoIdStr,
            reason: `AI validation failed for checklist item "${item.label}": ${aiVal.reason || "Validation rejected by AI"}`,
          });
        }

        // 2. GPS Validation Check (if project.locationCoordinates exists)
        const gpsRes = validatePhotoLocation({
          photoLocation: photo.location,
          projectLocationCoordinates: project.locationCoordinates,
        });
        if (gpsRes.valid === false) {
          validationErrors.push({
            checklistItemId: String(item.id),
            category: item.label,
            photoId: photoIdStr,
            reason: `GPS validation failed for checklist item "${item.label}": ${gpsRes.reason}`,
          });
        }

        // 3. Timestamp Validation Check
        const tsRes = validateCaptureTimestamp({
          capturedAt: photo.capturedAt,
          uploadedAt: photo.uploadedAt,
        });
        if (tsRes.valid === false) {
          validationErrors.push({
            checklistItemId: String(item.id),
            category: item.label,
            photoId: photoIdStr,
            reason: `Timestamp validation failed for checklist item "${item.label}": ${tsRes.reason}`,
          });
        }
      }
    }
  }

  if (validationErrors.length > 0) {
    const errorMsg = `Cannot submit project: ${validationErrors.length} validation requirement(s) failed.`;
    const err = new Error(errorMsg);
    err.statusCode = 400;
    err.errors = validationErrors;
    throw err;
  }

  const previousStatus = project.status;
  project.status = "Submitted";
  await project.save();

  try {
    await logAuditEvent({
      actor: user,
      action: "PROJECT_SUBMITTED",
      entityType: "Project",
      entityId: project.projectId || project._id.toString(),
      description: `Vendor submitted project ${project.projectName || ""} (${project.projectId || ""}) for review`,
      metadata: {
        projectId: project.projectId,
        previousStatus,
        newStatus: "Submitted",
      },
    });
  } catch (auditErr) {
    console.error("Failed to log PROJECT_SUBMITTED audit event:", auditErr.message);
  }

  return await getProjectById(project._id.toString(), user);
};
