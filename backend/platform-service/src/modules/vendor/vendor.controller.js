import {
  createVendor,
  getVendors,
  getVendorById,
  getMyVendorProfile,
  updateVendor,
  updateVendorStatus,
  getVendorStats,
  getVendorStaff,
  updateVendorStaffStatus,
  updateVendorStaff,
} from "./vendor.service.js";
import { logAuditEvent } from "../audit/audit.service.js";

export const getMyVendorProfileController = async (req, res) => {
  try {
    const result = await getMyVendorProfile(req.user.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Vendor profile not found for authenticated user",
    });
  }
};

export const createVendorController = async (req, res) => {
  try {
    const result = await createVendor(req.body);

    await logAuditEvent({
      actor: req.user,
      action: "VENDOR_CREATED",
      entityType: "Vendor",
      entityId: result._id?.toString() || "",
      description: `Created vendor profile ${result.companyName || ""}`.trim(),
      metadata: { companyName: result.companyName, contactName: result.contactName },
    });

    return res.status(201).json({
      success: true,
      message: "Vendor profile created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create vendor profile",
    });
  }
};

export const getVendorsController = async (req, res) => {
  try {
    const result = await getVendors(req.query);
    if (result && typeof result === "object" && Array.isArray(result.vendors)) {
      return res.status(200).json({
        success: true,
        count: result.vendors.length,
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        data: result.vendors,
      });
    }
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch vendors",
    });
  }
};

export const getVendorByIdController = async (req, res) => {
  try {
    const result = await getVendorById(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message === "Vendor not found" || error.message.includes("Invalid vendor ID")
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Vendor not found",
    });
  }
};

export const updateVendorController = async (req, res) => {
  try {
    const result = await updateVendor(req.params.id, req.body);

    await logAuditEvent({
      actor: req.user,
      action: "VENDOR_UPDATED",
      entityType: "Vendor",
      entityId: result._id?.toString() || req.params.id,
      description: `Updated vendor profile ${result.companyName || ""}`.trim(),
      metadata: { companyName: result.companyName },
    });

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message === "Vendor not found" || error.message.includes("Invalid vendor ID")
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update vendor",
    });
  }
};

export const updateVendorStatusController = async (req, res) => {
  try {
    const result = await updateVendorStatus(req.params.id, req.body.status);

    await logAuditEvent({
      actor: req.user,
      action: "VENDOR_STATUS_CHANGED",
      entityType: "Vendor",
      entityId: result._id?.toString() || req.params.id,
      description: `Changed status of vendor ${result.companyName || ""} to ${result.status}`.trim(),
      metadata: { companyName: result.companyName, newStatus: result.status },
    });

    return res.status(200).json({
      success: true,
      message: "Vendor status updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message === "Vendor not found" || error.message.includes("Invalid vendor ID")
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update vendor status",
    });
  }
};

export const getVendorStatsController = async (req, res) => {
  try {
    const result = await getVendorStats();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch vendor statistics",
    });
  }
};

export const getVendorStaffController = async (req, res) => {
  try {
    const result = await getVendorStaff(req.user);
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch vendor staff members",
    });
  }
};

export const updateVendorStaffStatusController = async (req, res) => {
  try {
    const result = await updateVendorStaffStatus(req.params.id, req.body.status, req.user);
    return res.status(200).json({
      success: true,
      message: `Staff status updated to ${result.status}`,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update staff status",
    });
  }
};

export const updateVendorStaffController = async (req, res) => {
  try {
    const result = await updateVendorStaff(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: "Staff details updated successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update staff member",
    });
  }
};

