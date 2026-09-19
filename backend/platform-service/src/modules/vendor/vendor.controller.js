import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  getVendorStats,
} from "./vendor.service.js";

/**
 * Controller to handle Vendor profile creation.
 */
export const createVendorController = async (req, res) => {
  try {
    const result = await createVendor(req.body);
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

/**
 * Controller to handle fetching all vendors with search/filter.
 */
export const getVendorsController = async (req, res) => {
  try {
    const result = await getVendors(req.query);
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

/**
 * Controller to handle fetching a single vendor profile by ID.
 */
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

/**
 * Controller to handle updating a vendor profile.
 */
export const updateVendorController = async (req, res) => {
  try {
    const result = await updateVendor(req.params.id, req.body);
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

/**
 * Controller to handle updating vendor status.
 */
export const updateVendorStatusController = async (req, res) => {
  try {
    const result = await updateVendorStatus(req.params.id, req.body.status);
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

/**
 * Controller to handle fetching vendor statistics summary.
 */
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
